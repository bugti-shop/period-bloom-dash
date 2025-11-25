import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
      className="p-6 cursor-pointer hover:shadow-md transition-shadow border"
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xl font-semibold text-card-foreground">Baby Album</h3>
            <Badge variant="secondary" className="text-xs">
              {photos.length} {photos.length === 1 ? 'photo' : 'photos'}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            View and manage all your baby photos
          </p>
        </div>
        <div className="w-20 h-20 rounded-xl overflow-hidden bg-muted flex items-center justify-center flex-shrink-0">
          {latestPhoto ? (
            <img 
              src={latestPhoto.imageData} 
              alt="Latest baby photo" 
              className="w-full h-full object-cover"
            />
          ) : (
            <Camera className="w-8 h-8 text-muted-foreground" />
          )}
        </div>
      </div>
    </Card>
  );
};
