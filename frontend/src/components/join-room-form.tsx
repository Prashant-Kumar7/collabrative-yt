import { SetStateAction, useState } from 'react'
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

interface JoinRoomFormProps {
  onClose: () => void
}

export function JoinRoomForm({ onClose }: JoinRoomFormProps) {
  const [name, setName] = useState('')
  const [roomId, setRoomId] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle room joining logic here
    axios.post("http://localhost:3000/api/v1/join-room" , {name : name, roomId : roomId}).then((res)=>{
      navigate(`/test/${res.data.token}`)
    }).catch((err)=>{
      console.log(err)
    })
    // console.log('Joining room:', roomId, 'as:', name)
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="join-name">Your Name</Label>
        <Input
          id="join-name"
          value={name}
          onChange={(e: { target: { value: SetStateAction<string> } }) => setName(e.target.value)}
          placeholder="Enter your name"
          required
        />
      </div>
      <div>
        <Label htmlFor="room-id">Room ID</Label>
        <Input
          id="room-id"
          value={roomId}
          onChange={(e: { target: { value: SetStateAction<string> } }) => setRoomId(e.target.value)}
          placeholder="Enter room ID"
          required
        />
      </div>
      <Button type="submit">Join Room</Button>
    </form>
  )
}

