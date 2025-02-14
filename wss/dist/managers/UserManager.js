"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserManager = void 0;
const RoomManager_1 = require("./RoomManager");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const secretKey = "secret";
class UserManager {
    constructor() {
        this.rooms = [];
    }
    addUser(socket) {
        this.addHandler(socket);
    }
    joinRoom(message) {
        const parsedMessage = JSON.parse(message);
        const token = parsedMessage.roomToken;
        if (!token) {
            console.error("No room token provided");
            return;
        }
        try {
            const username = jsonwebtoken_1.default.verify(token, secretKey);
            const room = this.rooms.find((rm) => rm.roomId === parsedMessage.roomId);
            if (room) {
                room.joinHttp(username);
            }
            else {
                console.error("Room not found for roomId:", parsedMessage.roomId);
            }
        }
        catch (err) {
            console.error("JWT verification failed:", err);
        }
    }
    createRoom(message) {
        const parsedMessage = JSON.parse(message);
        const token = parsedMessage.roomToken;
        if (!token) {
            console.error("No room token provided");
            return;
        }
        try {
            const payload = jsonwebtoken_1.default.verify(token, secretKey);
            const username = payload.slice(0, payload.indexOf("_"));
            const videoUrl = payload.slice(payload.indexOf("_") + 1);
            const room = new RoomManager_1.RoomManager(parsedMessage.roomId, username, videoUrl);
            this.rooms.push(room);
        }
        catch (err) {
            console.error("JWT verification failed:", err);
        }
    }
    addHandler(socket) {
        socket.on("message", (message) => __awaiter(this, void 0, void 0, function* () {
            const parsedMessage = yield JSON.parse(message.toString());
            console.log(parsedMessage);
            const token = parsedMessage.roomToken;
            if (!token) {
                console.error("No room token provided");
                socket.send(JSON.stringify({
                    type: "ERROR",
                    message: "Room token is missing",
                }));
                return;
            }
            try {
                const payload = jsonwebtoken_1.default.verify(token, secretKey);
                const username = payload.slice(0, payload.indexOf("_"));
                const room = this.rooms.find((rm) => rm.roomId === parsedMessage.roomId);
                switch (parsedMessage.type) {
                    case "JOIN_ROOM":
                        if (username) {
                            room === null || room === void 0 ? void 0 : room.join(username, socket);
                            console.log(`User joined with username: ${username}`);
                        }
                        else {
                            room === null || room === void 0 ? void 0 : room.join(payload, socket);
                            console.log(`User joined with payload: ${payload}`);
                        }
                        break;
                    case "SEEKED":
                        console.log("Seek event occurred");
                        room === null || room === void 0 ? void 0 : room.seek(socket, parsedMessage);
                        break;
                    case "PAUSE":
                        console.log("Pause event occurred");
                        room === null || room === void 0 ? void 0 : room.paused(socket, parsedMessage);
                        break;
                    case "PLAY":
                        console.log("Play event occurred");
                        room === null || room === void 0 ? void 0 : room.play(socket, parsedMessage);
                        break;
                    case "SEEK_UPDATED":
                        room === null || room === void 0 ? void 0 : room.seekUpdate(socket, parsedMessage);
                        break;
                    case "TIME_UPDATE":
                        room === null || room === void 0 ? void 0 : room.timeUpdate(socket, parsedMessage);
                        break;
                    case "GET_ROOM_STATE":
                        room === null || room === void 0 ? void 0 : room.getRoomState(socket);
                        break;
                    case "BUFFERING":
                        room === null || room === void 0 ? void 0 : room.buffering(socket, parsedMessage);
                        break;
                    case "MESSAGE":
                        room === null || room === void 0 ? void 0 : room.message(socket, parsedMessage.payload);
                    default:
                        console.warn("Unhandled message type:", parsedMessage.type);
                        break;
                }
            }
            catch (err) {
                console.error("JWT verification failed:", err);
                socket.send(JSON.stringify({
                    type: "ERROR",
                    message: "Invalid or expired room token",
                }));
            }
        }));
    }
}
exports.UserManager = UserManager;
