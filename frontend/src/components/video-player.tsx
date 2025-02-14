import { Card, CardContent } from './ui/card'

interface VideoPlayerProps {
  src: string
}

export function VideoPlayer({ src }: VideoPlayerProps) {
  return (
    <Card>
      <CardContent className="p-0">
        <video controls className="w-full rounded-lg">
          <source src={src} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </CardContent>
    </Card>
  )
}

