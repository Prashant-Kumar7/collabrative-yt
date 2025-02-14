'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

interface JoinRoomDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function JoinRoomDialog({ isOpen, onClose }: JoinRoomDialogProps) {
  const [roomId, setRoomId] = useState('')
  const navigate = useNavigate();
  const handleJoinRoom = () => {
    console.log('Joining room with ID:', roomId)
    const token = localStorage.getItem("token")
    axios.post("http://localhost:3000/api/v1/join-room", {roomId : roomId}, {
      headers : {
        Authorization : `baerer ${token}`
      }
    }).then((res)=>{
      localStorage.setItem("room-token", res.data.roomToken)
      navigate(`/test/${roomId}`)
    })
    // Implement room joining logic here
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Join Room</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="roomId" className="text-right">
              Room ID
            </Label>
            <Input
              id="roomId"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleJoinRoom} disabled={!roomId.trim()}>
            Join Room
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

