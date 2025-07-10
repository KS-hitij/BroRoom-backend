import { WebSocketServer, WebSocket } from "ws";
import { Message, User } from "./types";
import { roomManager } from "./room";
import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT || 3000;

const wss = new WebSocketServer({ port: Number(PORT) });

wss.on("connection",(socket:WebSocket)=>{
    socket.on("message",(msg:string)=>{
        const message:Message = JSON.parse(msg);
        switch (message.type) {
            case "join":
                let user:User = {
                    socket:socket,
                    avatar: message.payload.avatar,
                    name: message.payload.name,
                    roomId: message.payload.roomId
                }
                const err = roomManager.joinRoom(user);
                if(err && err.status==false){
                    socket.send(JSON.stringify({
                        type:"error",
                        payload:{
                            message:"No such room exits. Check your room id."
                        }
                    }))
                }
                break;

            case "chat":
                roomManager.broadcast(message);
                break;

            case "leave":
                    user = {
                    socket:socket,
                    avatar: message.payload.avatar,
                    name: message.payload.name,
                    roomId: message.payload.roomId
                }
                roomManager.leaveRoom(user);
                break;

            case "users":
                socket.send(JSON.stringify(roomManager.getUsers(message.payload.roomId)));
                break;

            default:
                console.log("Wrong message type"+message.type);
                break;
        }
    })
    socket.on("close",()=>{
        roomManager.removeBySocket(socket);
    })
})
