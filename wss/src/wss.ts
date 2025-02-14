import express from 'express'
import { WebSocketServer, WebSocket } from 'ws'
import { UserManager } from './managers/UserManager';
import { createClient } from 'redis';
import dotenv from "dotenv"


dotenv.config()


const app = express()
const httpServer = app.listen(8080)
const client = createClient({
  username: 'default',
  password: process.env.REDIS_PASSWORD,
  socket: {
      host: process.env.REDIS_HOST,
      port: 12203
  }
});

const wss = new WebSocketServer({ server: httpServer });

const users = new UserManager()


wss.on('connection', function connection(ws) {

  users.addUser(ws)
    

});

async function StartQueue(){
  try {
      await client.connect();
      console.log("ws connected to Redis.");

      // Main loop
      while (true) {
          try {
              const submission = await client.brPop("room", 0);
              if(submission){

                const parsedMessage = JSON.parse(submission.element.toString())
                if(parsedMessage.type === "JOIN"){
                  console.log(submission.element)
                  users.joinRoom(submission.element)
                }

                if(parsedMessage.type === "CREATE"){
                  console.log(submission.element)
                  users.createRoom(submission.element)
                }

              }

              // users.redisQueue(submission)
          } catch (error) {
              console.error("Error processing submission:", error);
          }
      }
  } catch (error) {
      console.error("Failed to connect to Redis", error);
  }
}

StartQueue()

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

