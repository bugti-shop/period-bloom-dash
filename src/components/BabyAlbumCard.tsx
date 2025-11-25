import { Card } from "@/components/ui/card";
import { Camera } from "lucide-react";
import { useState, useEffect } from "react";
import { loadFromLocalStorage } from "@/lib/storage";

interface BabyPhoto {
  id: string;
  imageData: string;
  timestamp: Date;
}

interface BabyAlbumCardProps {
  onClick: () => void;
}

export const BabyAlbumCard = ({ onClick }: BabyAlbumCardProps) => {
  const [photos, setPhotos] = useState<BabyPhoto[]>([]);

  useEffect(() => {
    const storedPhotos = loadFromLocalStorage<BabyPhoto[]>("baby-album-photos") || [];
    setPhotos(storedPhotos);
  }, []);

  const latestPhoto = photos.length > 0 ? photos[0] : null;

  return (
    <Card 
      className="p-6 cursor-pointer hover:shadow-lg transition-all"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-foreground mb-2">Baby Album</h3>
          <p className="text-sm text-muted-foreground">
            View and manage all your baby photos
          </p>
        </div>
        {latestPhoto ? (
          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
            <img 
              src={latestPhoto.imageData} 
              alt="Latest baby photo" 
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
            <Camera className="w-8 h-8 text-muted-foreground" />
          </div>
        )}
      </div>
    </Card>
  );
};
