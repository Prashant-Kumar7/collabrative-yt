'use client'

import { useRef, useCallback, useState } from 'react'
import { Button } from './ui/button'
import { Upload } from 'lucide-react'
import axios from 'axios'

interface Video {
  id: string
  name: string
  url: string
  thumbnailUrl: string
}

interface VideoUploadProps {
  onVideoUpload: (video: Video) => void
}

export function VideoUpload({ onVideoUpload }: VideoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [url, setUrl] = useState("")

  const generateThumbnail = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video')
      video.preload = 'metadata'
      video.onloadedmetadata = () => {
        video.currentTime = video.duration / 2
      }
      video.onseeked = () => {
        const canvas = document.createElement('canvas')
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
          resolve(canvas.toDataURL('image/jpeg'))
        } else {
          reject(new Error('Failed to get canvas context'))
        }
      }
      video.onerror = () => {
        reject(new Error('Failed to load video'))
      }
      video.src = url
    })
  }

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      try {
        // const objectUrl = URL.createObjectURL(file)
        const formData = new FormData();
        formData.append("file", file);
        await axios.post("http://localhost:3000/api/video/upload", formData, {
          headers: {
              "Content-Type": "multipart/form-data",
              "Authorization" : `Bearer ${localStorage.getItem("token")}`
          },
        }).then((res)=>{
          setUrl(res.data.fileUrl)
        }).catch((err)=>{
          console.log(err)
        })

        const thumbnailUrl = await generateThumbnail()
        onVideoUpload({ 
          id: Date.now().toString(), // Generate a unique id
          name: file.name, 
          url: url, 
          thumbnailUrl 
        })
      } catch (error) {
        console.error('Failed to generate thumbnail:', error)
        onVideoUpload({ 
          id: Date.now().toString(), // Generate a unique id
          name: file.name, 
          url: URL.createObjectURL(file), 
          thumbnailUrl: '' 
        })
      }
    }
    setUrl("")
  }, [onVideoUpload])

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="video/*"
        className="hidden"
      />
      <Button onClick={handleClick}>
        <Upload className="mr-2 h-4 w-4" /> Upload Video
      </Button>
    </>
  )
}

