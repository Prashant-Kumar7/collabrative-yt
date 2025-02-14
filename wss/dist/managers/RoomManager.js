"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomManager = void 0;
class RoomManager {
    // private admin : WebSocket | null
    constructor(roomId, username, videoUrl) {
        this.participants = [];
        this.roomId = roomId;
        this.roomState = {
            paused: true,
            currentTime: 0,
            videoUrl: videoUrl,
            messages: []
        };
        this.currentTime = 0;
        this.host = {
            username: username
        };
    }
    joinHttp(username) {
        this.participants.push({ username: username });
    }
    join(username, socket) {
        if (this.host.username === username) {
            this.host.socket = socket;
            console.log("room state", this.roomState);
            this.participants.push({ socket: this.host.socket, username: this.host.username });
            socket.send(JSON.stringify({ type: "VIDEO_URL", payload: this.roomState.videoUrl }));
        }
        else if (socket) {
            const user = this.participants.find((x) => {
                if (x.username === username) {
                    x.socket = socket;
                    return x;
                }
            });
            socket.send(JSON.stringify({ type: "VIDEO_URL", payload: this.roomState.videoUrl }));
            this.participants.push({ socket: socket, username: username });
            console.log("participants ", this.participants);
            // if(user){
            // }
        }
        this.participants.map((user) => {
            var _a;
            (_a = user.socket) === null || _a === void 0 ? void 0 : _a.send(JSON.stringify({ type: "PARTICIPANTS", payload: this.participants }));
        });
    }
    message(ws, message) {
        const sender = this.participants.find((user) => {
            return user.socket === ws;
        });
        this.roomState.messages.push(`${sender === null || sender === void 0 ? void 0 : sender.username} : ${message}`);
        this.participants.map((user) => {
            var _a;
            (_a = user.socket) === null || _a === void 0 ? void 0 : _a.send(JSON.stringify({ type: "MESSAGE", payload: `${sender === null || sender === void 0 ? void 0 : sender.username} : ${message}` }));
        });
    }
    seek(socket, message) {
        console.log(message);
        this.roomState.currentTime = message.payload;
        this.participants.forEach((user) => {
            var _a;
            if (user.socket != socket) {
                (_a = user.socket) === null || _a === void 0 ? void 0 : _a.send(JSON.stringify(message));
            }
        });
    }
    getRoomState(socket) {
        if (this.host.socket === socket) {
            socket.send(JSON.stringify({ type: "ROOM_STATE", payload: this.roomState, userType: "HOST" }));
        }
        else {
            socket.send(JSON.stringify({ type: "ROOM_STATE", payload: this.roomState, userType: "PARTICIPANTS" }));
        }
    }
    paused(socket, message) {
        console.log(message);
        this.roomState.paused = true;
        this.participants.forEach((user) => {
            var _a;
            if (socket != user.socket) {
                (_a = user.socket) === null || _a === void 0 ? void 0 : _a.send(JSON.stringify(message));
            }
        });
    }
    play(socket, message) {
        console.log(message);
        this.roomState.paused = false;
        this.participants.forEach((user) => {
            var _a;
            if (socket != user.socket) {
                (_a = user.socket) === null || _a === void 0 ? void 0 : _a.send(JSON.stringify(message));
            }
        });
    }
    buffering(socket, message) {
        console.log(message);
        this.participants.forEach((user) => {
            var _a;
            if (socket != user.socket) {
                (_a = user.socket) === null || _a === void 0 ? void 0 : _a.send(JSON.stringify(message));
            }
        });
    }
    leave(socket, username) {
        const index = this.participants.indexOf({ socket: socket, username: username });
        this.participants.splice(index, 1);
        socket.close(1000, "you left the room");
    }
    seekUpdate(socket, message) {
        console.log(message);
        this.participants.forEach((user) => {
            var _a;
            if (socket != user.socket) {
                (_a = user.socket) === null || _a === void 0 ? void 0 : _a.send(JSON.stringify(message));
            }
        });
    }
    timeUpdate(socket, message) {
        if (socket === this.host.socket) {
            this.currentTime = message.payload;
            this.roomState.currentTime = message.payload;
            console.log(this.currentTime);
            // this.participants.forEach((user)=>{
            //     if(this.host != user.socket){
            //         user.socket.send(JSON.stringify({type : "PLAY"}))
            //     }
            // })
        }
        this.participants.forEach((user) => {
            var _a;
            if (socket !== this.host.socket && message.payload > this.roomState.currentTime) {
                console.log(`Adjusting ${user.username} to current time: ${this.roomState.currentTime}`);
                (_a = user.socket) === null || _a === void 0 ? void 0 : _a.send(JSON.stringify({
                    type: "SEEK",
                    payload: this.roomState.currentTime,
                }));
                // if (this.roomState.paused) {
                //     user.socket.send(
                //         JSON.stringify({
                //             type: "PAUSE",
                //         })
                //     );
                // }
            }
        });
    }
}
exports.RoomManager = RoomManager;
