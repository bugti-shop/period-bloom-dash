import { Card } from "@/components/ui/card";
import { Camera } from "lucide-react";
import { useState, useEffect } from "react";
import { loadFromLocalStorage } from "@/lib/storage";

interface BabyAlbumCardProps {
  onClick: () => void;
}

export const BabyAlbumCard = ({ onClick }: BabyAlbumCardProps) => {
  const [photoCount, setPhotoCount] = useState(0);

  useEffect(() => {
    const photos = loadFromLocalStorage("baby-album-photos") || [];
    setPhotoCount(Array.isArray(photos) ? photos.length : 0);
  }, []);

  return (
    <Card 
      className="p-6 cursor-pointer hover:shadow-lg transition-all bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20 border-2 border-primary/20"
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Camera className="w-8 h-8 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-1">Baby Album</h3>
          <p className="text-sm text-muted-foreground">
            {photoCount === 0 
              ? "Start capturing precious moments"
              : `${photoCount} photo${photoCount > 1 ? 's' : ''} saved`}
          </p>
        </div>
      </div>
    </Card>
  );
};
