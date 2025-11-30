import { useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Button } from './ui/button';

interface MediaViewerProps {
  src: string;
  mediaType?: 'image' | 'video';
  alt?: string;
  className?: string;
  duration?: number;
  controls?: boolean;
  autoPlay?: boolean;
}

export const MediaViewer = ({ 
  src, 
  mediaType = 'image', 
  alt = '',
  className = '',
  duration,
  controls = true,
  autoPlay = false
}: MediaViewerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(false);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (mediaType === 'video') {
    return (
      <div className="relative group">
        <video
          ref={videoRef}
          src={src}
          className={`w-full h-full object-cover ${className}`}
          autoPlay={autoPlay}
          loop
          playsInline
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
        {controls && (
          <>
            {/* Duration badge */}
            {duration && (
              <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                {formatDuration(duration)}
              </div>
            )}
            
            {/* Video controls overlay */}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                variant="secondary"
                size="icon"
                onClick={togglePlay}
                className="bg-background/90 hover:bg-background"
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>
              <Button
                variant="secondary"
                size="icon"
                onClick={toggleMute}
                className="bg-background/90 hover:bg-background"
              >
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </Button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt={alt} 
      className={`w-full h-full object-cover ${className}`}
    />
  );
};
