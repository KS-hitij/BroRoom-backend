import { WebSocketServer, WebSocket } from "ws";
import { Message, User } from "./types";
import { roomManager } from "./room";
import dotenv from 'dotenv';
import http from 'http';
import express from 'express';
const app = express();
dotenv.config();


const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

const wss = new WebSocketServer({ server:server });

wss.on("connection",(socket:WebSocket)=>{
    console.log("started");
    
    socket.on("message",(msg:string)=>{
        const message:Message = JSON.parse(msg);
        switch (message.type) {
            
            case"host":
                const hostUser:User = {
                    socket:socket,
                    avatar: message.payload.avatar,
                    name: message.payload.name,
                    roomId: message.payload.roomId
                }
                roomManager.hostRoom(hostUser)
            break;

            case "join":
                    const joinUser:User = {
                    socket:socket,
                    avatar: message.payload.avatar,
                    name: message.payload.name,
                    roomId: message.payload.roomId
                }
                const err = roomManager.joinRoom(joinUser);
                if(err!=null && err.status==false){
                    socket.send(JSON.stringify({
                        type:"error",
                        payload:{
                            message:"No such room exits. Check your room id."
                        }
                    }));
                    socket.close();
                }
                break;

            case "chat":
                roomManager.broadcast(message);
                break;

            case "leave":
                    const leaveUser:User = {
                    socket:socket,
                    avatar: message.payload.avatar,
                    name: message.payload.name,
                    roomId: message.payload.roomId
                }
                roomManager.leaveRoom(leaveUser);
                break;

            case "users":
                const users = roomManager.getUsers(message.payload.roomId)
                socket.send(JSON.stringify({type:"users",payload:users}));
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

server.listen(PORT,()=>{
})