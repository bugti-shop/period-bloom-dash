import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Camera, Download, Trash2 } from "lucide-react";
import { saveToLocalStorage, loadFromLocalStorage } from "@/lib/storage";
import { toast } from "sonner";

interface WeekPhoto {
  imageData: string;
  timestamp: Date;
}

interface WeekNotes {
  [week: number]: string;
}

interface WeekPhotos {
  [week: number]: WeekPhoto;
}

interface PregnancyPhotoJournalProps {
  currentWeek: number;
}

const PREGNANCY_PHOTOS_KEY = "pregnancy-week-photos";
const PREGNANCY_NOTES_KEY = "pregnancy-week-notes";

export const PregnancyPhotoJournal = ({ currentWeek }: PregnancyPhotoJournalProps) => {
  const [photos, setPhotos] = useState<PregnancyPhoto[]>([]);
  const [notes, setNotes] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = () => {
    const stored = loadFromLocalStorage<PregnancyPhoto[]>(PREGNANCY_PHOTOS_KEY);
    if (stored) {
      const photosWithDates = stored.map(photo => ({
        ...photo,
        timestamp: new Date(photo.timestamp)
      }));
      setPhotos(photosWithDates.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
    }
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const newPhoto: PregnancyPhoto = {
        id: `photo-${Date.now()}`,
        imageData: reader.result as string,
        notes: notes,
        week: currentWeek,
        timestamp: new Date()
      };

      const updatedPhotos = [...photos, newPhoto];
      setPhotos(updatedPhotos.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
      saveToLocalStorage(PREGNANCY_PHOTOS_KEY, updatedPhotos);
      
      setNotes("");
      setIsDialogOpen(false);
      toast.success("Bump photo added to your journal!");
    };
    reader.readAsDataURL(file);
  };

  const deletePhoto = (photoId: string) => {
    const updatedPhotos = photos.filter(p => p.id !== photoId);
    setPhotos(updatedPhotos);
    saveToLocalStorage(PREGNANCY_PHOTOS_KEY, updatedPhotos);
    toast.success("Photo deleted");
  };

  const downloadPhoto = (photo: PregnancyPhoto) => {
    const link = document.createElement('a');
    link.href = photo.imageData;
    link.download = `bump-week-${photo.week}-${format(photo.timestamp, 'yyyy-MM-dd')}.jpg`;
    link.click();
    toast.success("Photo downloaded");
  };

  return (
    <Card className="p-6 bg-card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-foreground">Bump Photo Journal</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Camera className="w-4 h-4" />
              Add Photo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Bump Photo - Week {currentWeek}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">
                  Notes (optional)
                </label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="How are you feeling? Any updates about your pregnancy journey..."
                  className="min-h-[100px]"
                />
              </div>
              <div>
                <label htmlFor="photo-upload" className="cursor-pointer">
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
                    <Camera className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Click to select a photo
                    </p>
                  </div>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoCapture}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {photos.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Camera className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p>No photos yet. Start your bump photo journey!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {photos.map((photo) => (
            <Card key={photo.id} className="p-4 bg-background">
              <div className="flex gap-4">
                <img
                  src={photo.imageData}
                  alt={`Week ${photo.week}`}
                  className="w-32 h-32 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-foreground">Week {photo.week}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(photo.timestamp, 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => downloadPhoto(photo)}
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deletePhoto(photo.id)}
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  {photo.notes && (
                    <p className="text-sm text-foreground mt-2 p-3 bg-muted rounded-lg">
                      {photo.notes}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Card>
  );
};
