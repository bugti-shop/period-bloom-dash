import { Card } from "@/components/ui/card";
import { Camera } from "lucide-react";
import { useState, useEffect } from "react";
import { loadFromLocalStorage } from "@/lib/storage";

interface FamilyPhoto {
  id: string;
  imageData: string;
  timestamp: Date;
}

interface FamilyAlbumCardProps {
  onClick: () => void;
}

export const FamilyAlbumCard = ({ onClick }: FamilyAlbumCardProps) => {
  const [photos, setPhotos] = useState<FamilyPhoto[]>([]);

  useEffect(() => {
    const storedPhotos = loadFromLocalStorage<FamilyPhoto[]>("family-album-photos") || [];
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
          <h3 className="text-xl font-semibold text-card-foreground mb-1">Family Album</h3>
          <p className="text-sm text-muted-foreground">
            View and manage all your family photos
          </p>
        </div>
        <div className="w-20 h-20 rounded-xl overflow-hidden bg-muted flex items-center justify-center flex-shrink-0">
          {latestPhoto ? (
            <img 
              src={latestPhoto.imageData} 
              alt="Latest family photo" 
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