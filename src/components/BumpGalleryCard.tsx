import { Card } from "@/components/ui/card";
import { Camera } from "lucide-react";
import { loadFromLocalStorage } from "@/lib/storage";
import { useEffect, useState } from "react";

interface WeekPhoto {
  imageData: string;
  timestamp: Date;
}

interface WeekPhotos {
  [week: number]: WeekPhoto;
}

interface BumpGalleryCardProps {
  onClick: () => void;
}

const PREGNANCY_PHOTOS_KEY = "pregnancy-week-photos";
const BABY_BORN_PHOTO_KEY = "baby-born-photo";

export const BumpGalleryCard = ({ onClick }: BumpGalleryCardProps) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    const storedPhotos = loadFromLocalStorage<WeekPhotos>(PREGNANCY_PHOTOS_KEY);
    const babyPhoto = loadFromLocalStorage<WeekPhoto>(BABY_BORN_PHOTO_KEY);
    
    // Use baby photo if available, otherwise use the latest week photo
    if (babyPhoto) {
      setPreviewImage(babyPhoto.imageData);
    } else if (storedPhotos) {
      const weeks = Object.keys(storedPhotos).map(Number).sort((a, b) => b - a);
      if (weeks.length > 0) {
        setPreviewImage(storedPhotos[weeks[0]].imageData);
      }
    }
  }, []);

  return (
    <Card 
      className="p-6 cursor-pointer hover:shadow-lg transition-shadow bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950 dark:to-rose-950"
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-foreground mb-2">Bump Photo Gallery</h3>
          <p className="text-sm text-muted-foreground">
            View and manage all your pregnancy photos
          </p>
        </div>
        <div className="w-24 h-24 rounded-lg overflow-hidden bg-background/50 flex items-center justify-center flex-shrink-0">
          {previewImage ? (
            <img 
              src={previewImage} 
              alt="Preview" 
              className="w-full h-full object-cover"
            />
          ) : (
            <Camera className="w-10 h-10 text-muted-foreground opacity-30" />
          )}
        </div>
      </div>
    </Card>
  );
};
