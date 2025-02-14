import { Card, CardContent, CardFooter } from './ui/card'
import { Button } from '@/components/ui/button'
import { Play, Trash2 } from 'lucide-react'

interface Video {
  id: string
  name: string
  url: string
  thumbnailUrl: string
}

interface VideoCardProps {
  video: Video
  onDelete: (id: string) => void
}

export function VideoCard({ video, onDelete }: VideoCardProps) {
  return (
    <Card className="w-full">
      <CardContent className="p-2">
        <div className="aspect-video bg-gray-200 rounded-md flex items-center justify-center overflow-hidden">
          {video.thumbnailUrl ? (
            <img 
              src={video.thumbnailUrl} 
              alt={`Thumbnail for ${video.name}`} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center">
              <Play className="h-8 w-8 text-gray-400" />
              <p className="text-xs text-gray-500 mt-1">No thumbnail</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-2 flex flex-col items-start gap-2">
        <p className="text-xs font-medium truncate w-full">{video.name}</p>
        <div className="flex w-full gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1" 
            onClick={() => window.open(video.url+"/720p.mp4", '_blank')}
          >
            <Play className="h-4 w-4 mr-1" /> Play
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1" 
            onClick={() => onDelete(video.id)}
          >
            <Trash2 className="h-4 w-4 mr-1" /> Delete
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

