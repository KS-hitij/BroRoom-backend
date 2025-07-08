import { Message, User } from "./types";
import { WebSocket } from "ws";
class RoomManager {
    private rooms: Map<string, User[]> = new Map();

    joinRoom(user: User): void {
        if (!this.rooms.has(user.roomId)) {
            this.rooms.set(user.roomId, []);
        }
        this.rooms.get(user.roomId)?.push(user);
    }

    leaveRoom(user: User): void {
        const users = this.rooms.get(user.roomId);
        if (!users) return;
        const updatedUsers = users.filter(u => u.socket !== user.socket);
        if (updatedUsers.length === 0) {
            this.rooms.delete(user.roomId);
        } else {
            this.rooms.set(user.roomId, updatedUsers);
        }
    }

    getUsers(roomId: string): { type:string,payload:{name:string,avatar:string} }[] {
        return (this.rooms.get(roomId) || []).map(u => ({
            type:"users",
            payload:{
                name: u.name,
                avatar: u.avatar
            }
        }));
    }

    getRoom(socket: WebSocket): string | undefined {
        for (let [roomId, users] of this.rooms.entries()) {
            if (users.find(u => u.socket === socket)) return roomId;
        }
        return undefined;
    }

    broadcast(chat: Message): void {
        const users = this.rooms.get(chat.payload.roomId);
        users?.forEach((user) => {
            let socket = user.socket;
            socket.send(JSON.stringify(chat));
        })
    }

    removeBySocket(socket: WebSocket) {
        for (let [roomId, users] of this.rooms.entries()) {
            const updatedUsers = users.filter(u => u.socket != socket);
            if (updatedUsers.length == 0) {
                this.rooms.delete(roomId);
            } else {
                this.rooms.set(roomId, updatedUsers);
            }
        }
    }
}

export const roomManager = new RoomManager();