'use client'

import { useEffect, useState } from 'react'
import { VideoUpload } from './video-upload'
import { VideoCard } from './video-card'
import { Button } from '@/components/ui/button'
import { CreateRoomDialog } from './create-room-dialog'
import { JoinRoomDialog } from './join-room-dialog'
import axios from 'axios'

interface Video {
  id: string
  name: string
  url: string
  thumbnailUrl: string
}

export default function Dashboard() {
  const [videos, setVideos] = useState<Video[]>([])
  const [isCreateRoomDialogOpen, setIsCreateRoomDialogOpen] = useState(false)
  const [isJoinRoomDialogOpen, setIsJoinRoomDialogOpen] = useState(false)

  useEffect(()=>{
    const token = localStorage.getItem("token")
    axios.get("https://coll-yt-backend.tumsab.xyz/api/v1/get-videos", {
      headers : {
        Authorization : `Bearer ${token}`
      }
    }).then((res)=>{
      setVideos(res.data.videos)
    }).catch((err)=>{
      console.log(err)
    })
  },[])

  const handleVideoUpload = (video: Video) => {
    setVideos(prevVideos => [...prevVideos, video])
  }

  const handleDeleteVideo = (id: string) => {
    setVideos(prevVideos => prevVideos.filter(video => video.id !== id))
  }

  return (
    <div className="w-screen h-screen mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Video Dashboard</h1>
        <div className="flex gap-2">
          <VideoUpload onVideoUpload={handleVideoUpload} />
          <Button onClick={() => setIsCreateRoomDialogOpen(true)}>Create Room</Button>
          <Button onClick={() => setIsJoinRoomDialogOpen(true)}>Join Room</Button>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} onDelete={handleDeleteVideo} />
        ))}
        {videos.length === 0 && (
          <div className="col-span-full bg-gray-100 h-64 flex items-center justify-center rounded-lg">
            <p className="text-gray-500">No videos uploaded yet</p>
          </div>
        )}
      </div>
      <CreateRoomDialog
        isOpen={isCreateRoomDialogOpen}
        onClose={() => setIsCreateRoomDialogOpen(false)}
        videos={videos}
      />
      <JoinRoomDialog
        isOpen={isJoinRoomDialogOpen}
        onClose={() => setIsJoinRoomDialogOpen(false)}
      />
    </div>
  )
}

