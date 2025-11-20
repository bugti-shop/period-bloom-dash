import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { loadFromLocalStorage } from "@/lib/storage";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface WeekPhoto {
  imageData: string;
  timestamp: Date;
}

interface WeekPhotos {
  [week: number]: WeekPhoto;
}

interface PhotoGalleryProps {
  onClose: () => void;
}

export const PhotoGallery = ({ onClose }: PhotoGalleryProps) => {
  const [weekPhotos, setWeekPhotos] = useState<WeekPhotos>({});
  const [selectedPhoto, setSelectedPhoto] = useState<{ week: number; photo: WeekPhoto } | null>(null);

  useEffect(() => {
    const storedPhotos = loadFromLocalStorage<WeekPhotos>("pregnancy-week-photos");
    if (storedPhotos) {
      const photosWithDates: WeekPhotos = {};
      Object.keys(storedPhotos).forEach(week => {
        photosWithDates[parseInt(week)] = {
          ...storedPhotos[parseInt(week)],
          timestamp: new Date(storedPhotos[parseInt(week)].timestamp)
        };
      });
      setWeekPhotos(photosWithDates);
    }
  }, []);

  const sortedWeeks = Object.keys(weekPhotos)
    .map(w => parseInt(w))
    .sort((a, b) => a - b);

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col bg-card">
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border">
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Bump Photo Gallery</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {sortedWeeks.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No bump photos yet. Start adding photos to see them here!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {sortedWeeks.map(week => {
                  const photo = weekPhotos[week];
                  return (
                    <div 
                      key={week}
                      className="relative group cursor-pointer"
                      onClick={() => setSelectedPhoto({ week, photo })}
                    >
                      <div className="aspect-square rounded-lg overflow-hidden border-2 border-border hover:border-primary transition-colors">
                        <img
                          src={photo.imageData}
                          alt={`Week ${week}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-end p-3">
                        <div className="text-white">
                          <p className="font-semibold">Week {week}</p>
                          <p className="text-xs">
                            {new Date(photo.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 text-center">
                        <p className="text-sm font-medium text-foreground">Week {week}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(photo.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>
      </div>

      {selectedPhoto && (
        <Dialog open={true} onOpenChange={() => setSelectedPhoto(null)}>
          <DialogContent className="max-w-4xl">
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-foreground">Week {selectedPhoto.week}</h3>
                <p className="text-sm text-muted-foreground">
                  {new Date(selectedPhoto.photo.timestamp).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden">
                <img
                  src={selectedPhoto.photo.imageData}
                  alt={`Week ${selectedPhoto.week}`}
                  className="w-full h-full object-contain bg-muted"
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
