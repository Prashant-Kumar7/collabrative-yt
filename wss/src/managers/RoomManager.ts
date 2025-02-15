import { WebSocket } from "ws"

interface RoomState {
    paused : boolean
    currentTime : number
    videoUrl : string
    messages : string[]
}

interface Users {
    socket? : WebSocket
    username : string
}


interface Host {
    socket? : WebSocket
    username : string
}

interface Permissions {
    allowChat: boolean
    allowVideoControls: boolean
}

export class RoomManager {
    private participants : Users[]
    public roomId : string
    private roomState : RoomState
    private currentTime : number
    private host : Host
    private permissions : Permissions
    // private admin : WebSocket | null

    constructor(roomId : string, username : string,videoUrl : string, permissions : Permissions){
        this.participants = []
        this.roomId = roomId
        this.roomState = {
            paused : true,
            currentTime : 0,
            videoUrl : videoUrl,
            messages : []
        }
        this.currentTime = 0
        this.host = {
            username : username
        },
        this.permissions = permissions
    }

    joinHttp(username : string){
        this.participants.push({ username : username})
    }


    join( username : string, socket : WebSocket){
        if(this.host.username === username){
            this.host.socket = socket
            console.log("room state", this.roomState)
            this.participants.push({socket : this.host.socket, username : this.host.username})
            socket.send(JSON.stringify({type : "VIDEO_URL", payload : this.roomState.videoUrl, username : this.host.username}))
        } else if(socket) {
            
            const user = this.participants.find((x)=>{
                if( x.username === username){
                    x.socket = socket
                    return x
                }
            })

            socket.send(JSON.stringify({type : "VIDEO_URL", payload : this.roomState.videoUrl, username : username}))

            this.participants.push({socket : socket , username : username})
            console.log("participants ", this.participants)
            // if(user){
            // }
        }

        this.participants.map((user)=>{
            user.socket?.send(JSON.stringify({type : "PARTICIPANTS", payload : this.participants}))
        })
    }

    message(ws : WebSocket, message : string){

        const sender = this.participants.find((user)=>{
            return user.socket === ws
        })
        this.roomState.messages.push(`${sender?.username} : ${message}`)
        this.participants.map((user)=>{
            user.socket?.send(JSON.stringify({type : "MESSAGE", payload : `${sender?.username} : ${message}`}))
        })
    }

    seek(socket: WebSocket, message : any){
        console.log(message)
        this.roomState.currentTime = message.payload
        this.participants.forEach((user)=>{
            if(user.socket != socket){
                user.socket?.send(JSON.stringify(message))
            }
        })
    }

    getRoomState(socket: WebSocket){
        if(this.host.socket===socket){
            socket.send(JSON.stringify({type : "ROOM_STATE", payload : this.roomState, userType : "HOST", allowChat : this.permissions.allowChat, allowVideoControls: this.permissions.allowVideoControls}))
        }else {
            socket.send(JSON.stringify({type : "ROOM_STATE", payload : this.roomState, userType : "PARTICIPANTS", allowChat : this.permissions.allowChat, allowVideoControls: this.permissions.allowVideoControls}))

        }
    }

    paused(socket : WebSocket, message : any){
        console.log(message)
        this.roomState.paused = true
        this.participants.forEach((user)=>{
            if(socket != user.socket){
                user.socket?.send(JSON.stringify(message))
            }
        })
    }
    
    play(socket : WebSocket, message : any){
        console.log(message)
        this.roomState.paused = false
        this.participants.forEach((user)=>{
            if(socket != user.socket){
                user.socket?.send(JSON.stringify(message))
            }
        })
    }

    buffering(socket : WebSocket, message : any){
        console.log(message)
        this.participants.forEach((user)=>{
            if(socket != user.socket){
                user.socket?.send(JSON.stringify(message))
            }
        })
    }
    
    leave(socket : WebSocket , username : string){
        const index = this.participants.indexOf({socket : socket , username : username})
        this.participants.splice(index, 1);
        socket.close(1000 , "you left the room")
    }

    seekUpdate(socket : WebSocket , message : any){
        console.log(message)
        this.participants.forEach((user)=>{
            if(socket != user.socket){
                user.socket?.send(JSON.stringify(message))
            }
        })
    }

    timeUpdate(socket : WebSocket , message : any){
        if(socket === this.host.socket){
            this.currentTime = message.payload
            this.roomState.currentTime = message.payload
            console.log(this.currentTime)
            // this.participants.forEach((user)=>{
            //     if(this.host != user.socket){
            //         user.socket.send(JSON.stringify({type : "PLAY"}))
            //     }
            // })
        }
        
        this.participants.forEach((user) => {
            if (socket !== this.host.socket && message.payload > this.roomState.currentTime) {
                console.log(`Adjusting ${user.username} to current time: ${this.roomState.currentTime}`);
                user.socket?.send(
                    JSON.stringify({
                        type: "SEEK",
                        payload: this.roomState.currentTime,
                    })
                );

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
