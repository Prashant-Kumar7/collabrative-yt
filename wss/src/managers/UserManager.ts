import { WebSocket } from "ws";
import { RoomManager } from "./RoomManager";
import jwt from "jsonwebtoken";

const secretKey = "secret";

export class UserManager {
    private rooms: RoomManager[];

    constructor() {
        this.rooms = [];
    }

    addUser(socket: WebSocket) {
        this.addHandler(socket);
    }

    joinRoom(message: string) {
        const parsedMessage = JSON.parse(message);
        const token = parsedMessage.roomToken;

        if (!token) {
            console.error("No room token provided");
            return;
        }

        try {
            const username = jwt.verify(token, secretKey);
            const room = this.rooms.find((rm) => rm.roomId === parsedMessage.roomId);

            if (room) {
                room.joinHttp(username as string);
            } else {
                console.error("Room not found for roomId:", parsedMessage.roomId);
            }
        } catch (err) {
            console.error("JWT verification failed:", err);
        }
    }

    createRoom(message: string) {
        const parsedMessage = JSON.parse(message);
        const token = parsedMessage.roomToken;

        if (!token) {
            console.error("No room token provided");
            return;
        }

        try {
            const payload = jwt.verify(token, secretKey);
            const username = payload.slice(0, payload.indexOf("_"));
            const videoUrl = payload.slice(payload.indexOf("_") + 1);
            const room = new RoomManager(parsedMessage.roomId, username as string, videoUrl);
            this.rooms.push(room);
        } catch (err) {
            console.error("JWT verification failed:", err);
        }
    }

    private addHandler(socket: WebSocket) {
        socket.on("message", async(message) => {
            const parsedMessage = await JSON.parse(message.toString());
            console.log(parsedMessage)
            const token = parsedMessage.roomToken;

            if (!token) {
                console.error("No room token provided");
                socket.send(
                    JSON.stringify({
                        type: "ERROR",
                        message: "Room token is missing",
                    })
                );
                return;
            }

            try {
                const payload = jwt.verify(token as string, secretKey);
                const username = payload.slice(0, payload.indexOf("_"));
                const room = this.rooms.find((rm) => rm.roomId === parsedMessage.roomId);

                switch (parsedMessage.type) {
                    case "JOIN_ROOM":
                        if (username) {
                            room?.join(username as string, socket);
                            console.log(`User joined with username: ${username}`);
                        } else {
                            room?.join(payload as string, socket);
                            console.log(`User joined with payload: ${payload}`);
                        }
                        break;

                    case "SEEKED":
                        console.log("Seek event occurred");
                        room?.seek(socket, parsedMessage);
                        break;

                    case "PAUSE":
                        console.log("Pause event occurred");
                        room?.paused(socket, parsedMessage);
                        break;

                    case "PLAY":
                        console.log("Play event occurred");
                        room?.play(socket, parsedMessage);
                        break;

                    case "SEEK_UPDATED":
                        room?.seekUpdate(socket, parsedMessage);
                        break;

                    case "TIME_UPDATE":
                        room?.timeUpdate(socket, parsedMessage);
                        break;

                    case "GET_ROOM_STATE":
                        room?.getRoomState(socket);
                        break;

                    case "BUFFERING":
                        room?.buffering(socket, parsedMessage);
                        break;

                    case "MESSAGE" : 
                        room?.message(socket, parsedMessage.payload)
                    default:
                        console.warn("Unhandled message type:", parsedMessage.type);
                        break;
                }
            } catch (err) {
                console.error("JWT verification failed:", err);
                socket.send(
                    JSON.stringify({
                        type: "ERROR",
                        message: "Invalid or expired room token",
                    })
                );
            }
        });
    }
}
