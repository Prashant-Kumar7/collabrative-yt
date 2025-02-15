'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'
import { Button } from './ui/button'
import { Checkbox } from './ui/checkbox'
import { Label } from './ui/label'
import { Card, CardContent } from './ui/card'
import { ScrollArea } from './ui/scroll-area'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

interface Video {
  id: string
  name: string
  url: string
  thumbnailUrl: string
}

interface CreateRoomDialogProps {
  isOpen: boolean
  onClose: () => void
  videos: Video[]
}

export function CreateRoomDialog({ isOpen, onClose, videos }: CreateRoomDialogProps) {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)
  const navigate = useNavigate();
  const [permissions, setPermissions] = useState({
    allowChat: true,
    allowVideoControls: false,
  })

  const handleCreateRoom = async() => {
    console.log('Creating room with:', { selectedVideo, permissions })
    const token = localStorage.getItem("token")
    await axios.post("https://coll-yt-backend.tumsab.xyz/api/v1/create-room", {videoUrl : selectedVideo, permissions : permissions}, {
      headers : {
        Authorization : `baerer ${token}`
      }
    }).then((res)=>{
      localStorage.setItem("room-token", res.data.roomToken)
      navigate(`/test/${res.data.roomId}`)
    }).catch((err)=>{
      console.log(err)
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-hidden p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Create Room</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col sm:flex-row h-[calc(80vh-120px)]">
          <div className="flex-1 p-6 space-y-4">
            <h3 className="text-lg font-semibold">Choose a Video</h3>
            <ScrollArea className="h-[calc(100%-2rem)] pr-4">
              <div className="grid grid-cols-2 gap-2">
                {videos.map((video) => (
                  <Card 
                    key={video.id} 
                    className={`cursor-pointer transition-all ${selectedVideo === video.url ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setSelectedVideo(video.url)}
                  >
                    <CardContent className="p-2">
                      <div className="aspect-video bg-gray-200 rounded-md flex items-center justify-center overflow-hidden mb-1">
                        {video.thumbnailUrl ? (
                          <img 
                            src={video.thumbnailUrl} 
                            alt={`Thumbnail for ${video.name}`} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center">
                            <p className="text-xs text-gray-500">No thumbnail</p>
                          </div>
                        )}
                      </div>
                      <p className="text-xs font-medium truncate">{video.name}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
          <div className="w-full sm:w-48 p-6 space-y-4 border-t sm:border-t-0 sm:border-l border-gray-200">
            <h3 className="text-lg font-semibold">Set Permissions</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="allowChat"
                  checked={permissions.allowChat}
                  onCheckedChange={(checked) => 
                    setPermissions(prev => ({ ...prev, allowChat: checked as boolean }))
                  }
                />
                <Label htmlFor="allowChat">Allow Chat</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="allowVideoControls"
                  checked={permissions.allowVideoControls}
                  onCheckedChange={(checked) => 
                    setPermissions(prev => ({ ...prev, allowVideoControls: checked as boolean }))
                  }
                />
                <Label htmlFor="allowVideoControls">Allow Video Controls</Label>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="sm:justify-end p-6 pt-0">
          <Button onClick={handleCreateRoom} disabled={!selectedVideo}>
            Create Room
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

