import { WebSocketServer, WebSocket } from "ws";
import { Message, User } from "./types";
import { roomManager } from "./room";

const wss = new WebSocketServer({ port: 3000 });

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
                roomManager.joinRoom(user);
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
