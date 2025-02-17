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

  useEffect(() => {
    const token = localStorage.getItem("token")
    axios.get("https://coll-yt-backend.tumsab.xyz/api/v1/get-videos", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then((res) => {
      setVideos(res.data.videos)
    }).catch((err) => {
      console.log(err)
    })
  }, [])

  const handleVideoUpload = (video: Video) => {
    setVideos(prevVideos => [...prevVideos, video])
  }

  const handleDeleteVideo = (id: string) => {
    setVideos(prevVideos => prevVideos.filter(video => video.id !== id))
  }

  return (
    <div className="w-screen min-h-screen px-4 py-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
        <h1 className="text-2xl font-bold text-center sm:text-left">Video Dashboard</h1>
        <div className="flex flex-wrap justify-center gap-2">
          <VideoUpload onVideoUpload={handleVideoUpload} />
          <Button onClick={() => setIsCreateRoomDialogOpen(true)}>Create Room</Button>
          <Button onClick={() => setIsJoinRoomDialogOpen(true)}>Join Room</Button>
        </div>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} onDelete={handleDeleteVideo} />
        ))}
        {videos.length === 0 && (
          <div className="col-span-full bg-gray-100 h-64 flex items-center justify-center rounded-lg">
            <p className="text-gray-500">No videos uploaded yet</p>
          </div>
        )}
      </div>

      {/* Modals */}
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
