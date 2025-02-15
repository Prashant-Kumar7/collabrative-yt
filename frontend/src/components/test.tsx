import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
// import jwt from "jsonwebtoken";

// interface RoomState {
//   paused : boolean
//   currentTime : number
// }

// interface Videos {
//   name : string,
//   videoUrl : string,
//   id : string,
//   userId : string
// }

interface Participants {
  socket : WebSocket,
  username : string
}


export function TestApp() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  // const [isInteractionRequired, setIsInteractionRequired] = useState(true);
  const [roomId, setRoomId] = useState<string>("")
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<string[]>([])
  const [participants, setParticipants] = useState<Participants[]>([])
  const [host, setHost] = useState(false)
  const [videoUrl, setVideoUrl] = useState("")
  const [toggle, setToggle] = useState(false)
  const [permissions, setPermissions] = useState({
    allowChat: false,
    allowVideoControls: false,
  })
  // const [roomState, setRoomState] = useState<RoomState>({
  //   paused : false,
  //   currentTime : 0
  // })
  const {id } = useParams()

  useEffect(()=>{
    console.log(videoUrl)
  },[videoUrl])

  useEffect(() => {
    // Create WebSocket connection
    const newSocket = new WebSocket(`wss://coll-yt-ws.tumsab.xyz`);

    if(id){
      setRoomId(id)
    }
    const roomToken = localStorage.getItem("room-token")
    
    newSocket.onopen = () => {
        newSocket.send(
            JSON.stringify({
              type: "JOIN_ROOM",
              roomId: id,
              roomToken : roomToken
            })
          );
      console.log("WebSocket connection established.");
    };

    setSocket(newSocket);


  
    return () => {
      // Close the socket when the component is unmounted
      if (newSocket) {
        newSocket.close();
      }
    };
  }, []);

  useEffect(()=>{
    console.log("participants changed ",participants)
  },[participants])

  useEffect(() => {
    if (videoRef.current && socket) {
      const videoElement = videoRef.current;

      const handleTimeUpdate = () => {
        // Send time updates to WebSocket server
        socket.send(
          JSON.stringify({
            type: "TIME_UPDATE",
            payload: videoElement.currentTime, // Send current time of video
            roomId : roomId,
            roomToken : localStorage.getItem("room-token")
          })
        );
        console.log("Time updated:", videoElement.currentTime);
      };

      videoElement.addEventListener("timeupdate", handleTimeUpdate);
      return () => {
        videoElement.removeEventListener("timeupdate", handleTimeUpdate);
      };
    }
  }, [socket]);

  if(socket){
    socket.onmessage = async (message) => {
      const parsedMessage = JSON.parse(message.data);

      if (videoRef.current) {
        switch (parsedMessage.type) {
          case "ROOM_STATE" : 
            console.log(parsedMessage)
            const state = parsedMessage.payload
            if(state.paused){
              videoRef.current.pause()
            }else {
              await videoRef.current.play()
            }

            if(parsedMessage.userType === "HOST"){
              setHost(true)
            }

            setPermissions({
              allowChat : parsedMessage.allowChat,
              allowVideoControls : parsedMessage.allowVideoControls
            })

            // setMessages(state.messages)
            
            console.log(videoUrl)
            videoRef.current.currentTime = state.currentTime
            console.log("Room state achived")
            break
          case "SEEKED":
            videoRef.current.currentTime = parsedMessage.payload;
            console.log("Seeked to:", parsedMessage.payload);
            break;
          case "PAUSE":
            videoRef.current.pause();
            console.log("Video paused.");
            break;
          case "PLAY":
            try {
              await videoRef.current.play();
              console.log("Video played.");
            } catch (error) {
              console.error("Error playing video:", error);
            }
            break;
          case "SEEK_UPDATED" : 
            videoRef.current.currentTime = parsedMessage.payload;
            break
          case "BUFFERING" :
          //   if(buffering){
          //       videoRef.current.pause()
          //   }else{
          //     await videoRef.current.play();
          //   }
            break
          case "VIDEO_URL" : 
            videoRef.current.src = parsedMessage.payload + "/720p.mp4"
            setVideoUrl(parsedMessage.payload)
            break
          case "PARTICIPANTS" : 
            setParticipants(parsedMessage.payload)

            return
          case "MESSAGE" :
            setMessages((prev)=>{
              return [...prev, parsedMessage.payload]
            })
            break
          default:
            break;
        }
      }
    };
  }

  const handlePlay = () => {
    if (socket) {
      socket.send(
        JSON.stringify({ type: "PLAY", roomId: roomId, roomToken : localStorage.getItem("room-token")})
      );
    }
  };

  const handlePause = () => {
    if (socket) {
      socket.send(
        JSON.stringify({ type: "PAUSE", roomId: roomId,roomToken : localStorage.getItem("room-token") })
      );
    }
  };

  const handleSeek = () => {
    if (socket && videoRef.current && host) {
      socket.send(
        JSON.stringify({
          type: "SEEKED",
          roomId: roomId,
          payload: videoRef.current.currentTime,
          roomToken : localStorage.getItem("room-token")
        })
      );
      console.log("Seeked to:", videoRef.current.currentTime);
    }
  };

  const handleUserInteraction = () => {
    // setIsInteractionRequired(false);
  };

  const handlePlayerLoad = () =>{
    socket?.send(JSON.stringify({type : "GET_ROOM_STATE", roomId : roomId, roomToken : localStorage.getItem("room-token")}))
    console.log("play active")
  }

  const handleResolutionChange = (e : any)=>{
    console.log(e.target.value)
    if(videoRef.current){
      videoRef.current.src = videoUrl + e.target.value
    }
  }

  const handleSendMessage = ()=>{
    socket?.send(JSON.stringify({type : "MESSAGE", roomId : roomId, payload : message, roomToken : localStorage.getItem("room-token")}))
    setMessage("")
  }

  return (
    <div className="grid grid-cols-12 text-white w-screen bg-zinc-950 h-screen p-10">
        <div className="col-span-9">
        <div className="col-span-9 h-[40rem] border">
        {false ? (
            <div
            className="interaction-overlay h-full w-full flex justify-center items-center  bg-black bg-opacity-50 text-white text-xl"
            onClick={handleUserInteraction}
          >
            <span>Click anywhere to enable video playback synchronization.</span>
          </div>
        ) : (
            <video
        ref={videoRef}
        onPlay={handlePlay}
        onPause={handlePause}
        onSeeked={handleSeek}
        muted
        onLoadedData={handlePlayerLoad}
        // onLoad={()=>console.log("video player loaded")}
        className="video w-full h-full bg-zinc-950"
        controls={host || permissions.allowVideoControls}
        // controls
      />
        )}
        </div>
        <div className="w-full h-[5rem] flex justify-evenly items-center">
          <button onClick={handleResolutionChange} value={"/360p.mp4"} className="bg-zinc-900 hover:bg-zinc-950 px-8 rounded-md py-1 hover:cursor-pointer">360p</button>
          <button onClick={handleResolutionChange} value={"/480p.mp4"} className="bg-zinc-900 hover:bg-zinc-950 px-8 rounded-md py-1 hover:cursor-pointer">480p</button>
          <button onClick={handleResolutionChange} value={"/720p.mp4"} className="bg-zinc-900 hover:bg-zinc-950 px-8 rounded-md py-1 hover:cursor-pointer">720p</button>
        </div>
        </div>
        <div className="flex flex-col grid grid-rows-12 col-span-3 ml-4">
            <div className="grid row-span-1 grid-cols-2 w-full flex items-center h-full gap-4">
                <button onClick={()=>setToggle(false)} className="col-span-1 text-center bg-zinc-900 hover:bg-zinc-950 py-2 hover:cursor-pointer rounded-lg">Live Chat</button>
                {/* <button  className="col-span-1 text-center bg-zinc-900 hover:bg-zinc-950 py-2 hover:cursor-pointer rounded-lg">Chats</button> */}
                <button onClick={()=>setToggle(true)} className="col-span-1 text-center bg-zinc-900 hover:bg-zinc-950 py-2 hover:cursor-pointer rounded-lg">Participants</button>
            </div>
            <div className="row-span-11 grid grid-rows-12">
              <div className="h-full flex flex-col w-full row-span-11 border">
                {toggle? participants.map((user)=>{
                  return <span>{user.username}</span>
                }) : messages.map((message)=>{
                  return <span>{message}</span>
                })}
              </div>
              <div className="row-span-11 border flex">
                <input disabled={host? false : permissions.allowChat? false : true} value={message} onChange={(e)=>{
                  setMessage(e.target.value)
                }} className="w-full h-full pl-2 rounded-md" placeholder="enter text" type="text" />
                <button onClick={handleSendMessage} className="p-1">send</button>
              </div>
            </div>
        </div>
    </div>
  );
}
