import { useState, useEffect, useRef } from "react";
import { Camera, X, Download, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { saveToLocalStorage, loadFromLocalStorage } from "@/lib/storage";
import { takeCameraPhoto, selectFromGallery } from "@/lib/cameraUtils";
import { format } from "date-fns";
import { toast } from "sonner";

interface PhotoLog {
  id: string;
  imageData: string;
  timestamp: Date;
  date: string;
}

interface PhotoLoggerProps {
  selectedDate: Date;
}

export const PhotoLogger = ({ selectedDate }: PhotoLoggerProps) => {
  const [photos, setPhotos] = useState<PhotoLog[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadPhotosForDate(selectedDate);
  }, [selectedDate]);

  const loadPhotosForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const allPhotos = loadFromLocalStorage<PhotoLog[]>("symptom-photos") || [];
    const datePhotos = allPhotos.filter(p => p.date === dateStr);
    setPhotos(datePhotos);
  };

  const handleCameraCapture = async () => {
    const imageData = await takeCameraPhoto();
    if (imageData) {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const newPhoto: PhotoLog = {
        id: Date.now().toString(),
        imageData,
        timestamp: new Date(),
        date: dateStr
      };

      const allPhotos = loadFromLocalStorage<PhotoLog[]>("symptom-photos") || [];
      allPhotos.push(newPhoto);
      saveToLocalStorage("symptom-photos", allPhotos);
      
      setPhotos([...photos, newPhoto]);
      toast.success("Photo captured!");
    }
  };

  const handleGallerySelect = async () => {
    const imageData = await selectFromGallery();
    if (imageData) {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const newPhoto: PhotoLog = {
        id: Date.now().toString(),
        imageData,
        timestamp: new Date(),
        date: dateStr
      };

      const allPhotos = loadFromLocalStorage<PhotoLog[]>("symptom-photos") || [];
      allPhotos.push(newPhoto);
      saveToLocalStorage("symptom-photos", allPhotos);
      
      setPhotos([...photos, newPhoto]);
      toast.success("Photo added!");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const imageData = reader.result as string;
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      
      const newPhoto: PhotoLog = {
        id: Date.now().toString(),
        imageData,
        timestamp: new Date(),
        date: dateStr
      };

      const allPhotos = loadFromLocalStorage<PhotoLog[]>("symptom-photos") || [];
      allPhotos.push(newPhoto);
      saveToLocalStorage("symptom-photos", allPhotos);
      
      setPhotos([...photos, newPhoto]);
      toast.success("Photo added!");
    };

    reader.readAsDataURL(file);
  };

  const deletePhoto = (photoId: string) => {
    const allPhotos = loadFromLocalStorage<PhotoLog[]>("symptom-photos") || [];
    const filtered = allPhotos.filter(p => p.id !== photoId);
    saveToLocalStorage("symptom-photos", filtered);
    setPhotos(photos.filter(p => p.id !== photoId));
    toast.success("Photo deleted");
  };

  const downloadPhoto = (photo: PhotoLog) => {
    const link = document.createElement('a');
    link.href = photo.imageData;
    link.download = `symptom-photo-${format(photo.timestamp, "yyyy-MM-dd-HHmmss")}.jpg`;
    link.click();
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Photos</h3>
          <div className="flex gap-2">
            <Button
              onClick={handleCameraCapture}
              size="sm"
              className="flex-1 bg-pink-500 hover:bg-pink-600"
            >
              <Camera className="w-4 h-4 mr-2" />
              Take Photo
            </Button>
            <Button
              onClick={handleGallerySelect}
              size="sm"
              variant="outline"
              className="flex-1"
            >
              <Image className="w-4 h-4 mr-2" />
              Gallery
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {photos.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            No photos for {format(selectedDate, "MMM dd, yyyy")}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {photos.map((photo) => (
              <div key={photo.id} className="relative group">
                <img
                  src={photo.imageData}
                  alt="Symptom photo"
                  className="w-full h-32 object-cover rounded-lg"
                />
                <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-7 w-7 p-0"
                    onClick={() => downloadPhoto(photo)}
                  >
                    <Download className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="h-7 w-7 p-0"
                    onClick={() => deletePhoto(photo.id)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {format(photo.timestamp, "h:mm a")}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};