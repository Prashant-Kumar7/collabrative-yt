'use client'

import { useRef, useCallback, useState, useEffect } from 'react'
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
  const [url, setUrl] = useState<string>("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const generateThumbnail = (videoUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video')
      video.preload = 'metadata'
      video.src = videoUrl
      video.crossOrigin = "anonymous"

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
      video.onerror = () => reject(new Error('Failed to load video'))
    })
  }

  useEffect(() => {
    if (url && selectedFile) {
      generateThumbnail(url)
        .then(thumbnailUrl => {
          onVideoUpload({ 
            id: Date.now().toString(), // Generate a unique id
            name: selectedFile.name, 
            url: url, 
            thumbnailUrl 
          })
          setUrl("")
          setSelectedFile(null)
        })
        .catch(error => console.error('Thumbnail generation failed:', error))
    }
  }, [url, selectedFile, onVideoUpload])

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)

      try {
        const formData = new FormData();
        formData.append("file", file);
        const response = await axios.post("http://localhost:3000/api/video/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          },
        })
        setUrl(response.data.fileUrl)
      } catch (error) {
        console.error('Upload failed:', error)
        onVideoUpload({ 
          id: Date.now().toString(), 
          name: file.name, 
          url: URL.createObjectURL(file), 
          thumbnailUrl: '' 
        })
      }
    }
  }, [onVideoUpload])

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="video/*"
        className="hidden"
      />
      <Button onClick={handleClick} className="w-full sm:w-auto">
        <Upload className="mr-2 h-4 w-4" /> Upload Video
      </Button>
    </div>
  )
}
