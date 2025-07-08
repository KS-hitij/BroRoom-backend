import WebSocket from "ws"
export interface User {
    socket: WebSocket,
    roomId: string,
    name: string,
    avatar: string
};

export interface Message{
    type: string,
    payload:any
}