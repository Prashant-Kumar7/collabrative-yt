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
const express_1 = __importDefault(require("express"));
const ws_1 = require("ws");
const UserManager_1 = require("./managers/UserManager");
const redis_1 = require("redis");
const app = (0, express_1.default)();
const httpServer = app.listen(8080);
const client = (0, redis_1.createClient)({
    username: 'default',
    password: '1jwV1VeITPu7msIkXk1y8H0NVz71rXUq',
    socket: {
        host: 'redis-12203.c83.us-east-1-2.ec2.redns.redis-cloud.com',
        port: 12203
    }
});
const wss = new ws_1.WebSocketServer({ server: httpServer });
const users = new UserManager_1.UserManager();
wss.on('connection', function connection(ws) {
    users.addUser(ws);
});
function StartQueue() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield client.connect();
            console.log("ws connected to Redis.");
            // Main loop
            while (true) {
                try {
                    const submission = yield client.brPop("room", 0);
                    if (submission) {
                        const parsedMessage = JSON.parse(submission.element.toString());
                        if (parsedMessage.type === "JOIN") {
                            console.log(submission.element);
                            users.joinRoom(submission.element);
                        }
                        if (parsedMessage.type === "CREATE") {
                            console.log(submission.element);
                            users.createRoom(submission.element);
                        }
                    }
                    // users.redisQueue(submission)
                }
                catch (error) {
                    console.error("Error processing submission:", error);
                }
            }
        }
        catch (error) {
            console.error("Failed to connect to Redis", error);
        }
    });
}
StartQueue();
// (async()=>{
//   await client.subscribe("create-room" , (message)=>{
//     console.log(message)
//     if(message){
//         users.createRoom(message)
//     }
//   })
//   await client.subscribe("join-room" , (message)=>{
//     console.log(message)
//     if(message){
//       users.joinRoom(message)
//         // users.redisQueue(message)
//     }
//   })
// })()
