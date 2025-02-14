import { useState } from 'react'
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

interface CreateRoomFormProps {
  onClose: () => void
}

export function CreateRoomForm({ onClose }: CreateRoomFormProps) {
  const [name, setName] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle room creation logic here
    axios.post("http://localhost:3000/api/v1/create-room" , {name : name}).then((res)=>{
      localStorage.setItem("room-token", res.data.roomToken)
      navigate(`/test/${res.data.roomId}`)
    }).catch((err)=>{
      console.log(err)
    })
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="create-name">Your Name</Label>
        <Input
          id="create-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          required
        />
      </div>
      <Button type="submit">Create Room</Button>
    </form>
  )
}

