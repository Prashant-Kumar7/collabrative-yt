import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

export function Player() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isInteractionRequired, setIsInteractionRequired] = useState(true);
  const [buffering, setBuffering] = useState<Boolean>(false)
  const {id } = useParams()

  useEffect(() => {
    // Set up WebSocket connection
    const newSocket = new WebSocket("ws://localhost:8080");

    newSocket.onopen = () => {
      newSocket.send(
        JSON.stringify({
          type: "JOIN_ROOM",
          roomId: "room1",
          userId: "user" + Math.random(),
        })
      );
      setSocket(newSocket);
    };

    if (videoRef.current) {
        const videoElement = videoRef.current;
  
        const handleTimeUpdate = () => {
          console.log("Time updated:", videoElement.currentTime);
          if (socket && videoRef.current && id==="host") {
            socket.send(
              JSON.stringify({
                type: "SEEK_UPDATED",
                roomId: "room1",
                payload: videoRef.current.currentTime,
              })
            );
            console.log("Seeked to:", videoRef.current.currentTime);
          }
        };
  
        videoElement.addEventListener("timeupdate", handleTimeUpdate);
      }

    newSocket.onmessage = async (message) => {
      const parsedMessage = JSON.parse(message.data);

      if (videoRef.current) {
        switch (parsedMessage.type) {
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
            if(buffering){
                videoRef.current.pause()
            }else{
              await videoRef.current.play();
            }
            break
          default:
            break;
        }
      }
    };

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    if (videoRef.current && socket) {
      const videoElement = videoRef.current;

      const handleTimeUpdate = () => {
        // Send time updates to WebSocket server
        socket.send(
          JSON.stringify({
            type: "TIME_UPDATE",
            payload: videoElement.currentTime, // Send current time of video
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

  // Handlers for user actions
  const handlePause = () => {
    if (socket) {
      socket.send(
        JSON.stringify({ type: "PAUSE", roomId: "room1" })
      );
    }
  };

  const handlePlay = () => {
    if (socket) {
      socket.send(
        JSON.stringify({ type: "PLAY", roomId: "room1" })
      );
    }
  };

  const handleSeek = () => {
    if (socket && videoRef.current && id==="host") {
      socket.send(
        JSON.stringify({
          type: "SEEKED",
          roomId: "room1",
          payload: videoRef.current.currentTime,
        })
      );
      console.log("Seeked to:", videoRef.current.currentTime);
    }
  };

  useEffect(()=>{
    if(id==="host"){
        console.log(buffering)
        socket?.send(JSON.stringify({type : "BUFFERING", roomId : "room1" , payload : buffering}))
    }
  },[buffering])

  const handleUserInteraction = () => {
    setIsInteractionRequired(false);
  };

//   useEffect(()=>{
//     console.log()
//   },[videoRef.current?.currentTime])

  const handleSeeking = ()=>{
    // if (socket && videoRef.current && id==="host") {
    //     socket.send(
    //       JSON.stringify({
    //         type: "SEEK_UPDATED",
    //         roomId: "room1",
    //         payload: videoRef.current.currentTime,
    //       })
    //     );
    //     console.log("Seeked to:", videoRef.current.currentTime);
    // }

    console.log("seeking")
  }

  return (
    <div>
      {isInteractionRequired ? (
        <div
          className="interaction-overlay flex items-center justify-center w-screen h-screen bg-black bg-opacity-50 text-white text-xl"
          onClick={handleUserInteraction}
        >
          Click anywhere to enable video playback synchronization.
        </div>
      ) : (
        <video
          ref={videoRef}
          onPause={handlePause}
          onPlay={handlePlay}
          onSeeked={handleSeek}
          onSeeking={handleSeeking}
          onPlaying={()=>setBuffering(false)}
          onWaiting={()=>setBuffering(true)}
          className="video w-screen h-screen"
          controls
        //   controls={id=== "host"? true : false}
          src="https://csv-upload-22990.s3.ap-south-1.amazonaws.com/videos/1cbae3b7-c5be-4cbb-b8db-af878a2f3555-ankurrrrr_Trim.mp4"
        />
      )}
    </div>
  );
}

