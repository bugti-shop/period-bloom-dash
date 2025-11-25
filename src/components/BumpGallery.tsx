import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Plus, Trash2, Download, Baby, Filter, MessageSquare, Mic, Camera, ArrowLeftRight } from "lucide-react";
import { saveToLocalStorage, loadFromLocalStorage } from "@/lib/storage";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BumpPhotoComparison } from "./BumpPhotoComparison";

interface WeekPhoto {
  imageData: string;
  timestamp: Date;
  caption?: string;
}

interface WeekNotes {
  [week: number]: string;
}

interface WeekVoiceNote {
  audioData: string;
  duration: number;
  timestamp: Date;
}

interface WeekVoiceNotes {
  [week: number]: WeekVoiceNote;
}

interface WeekPhotos {
  [week: number]: WeekPhoto;
}

interface BumpGalleryProps {
  onClose: () => void;
}

const PREGNANCY_PHOTOS_KEY = "pregnancy-week-photos";
const BABY_BORN_PHOTO_KEY = "baby-born-photo";
const PREGNANCY_NOTES_KEY = "pregnancy-week-notes";
const PREGNANCY_VOICE_NOTES_KEY = "pregnancy-week-voice-notes";

type FilterType = "all" | "photos" | "notes" | "voice";

export const BumpGallery = ({ onClose }: BumpGalleryProps) => {
  const [weekPhotos, setWeekPhotos] = useState<WeekPhotos>({});
  const [babyPhoto, setBabyPhoto] = useState<WeekPhoto | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<number | "baby" | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadTarget, setUploadTarget] = useState<number | "baby" | null>(null);
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [weekNotes, setWeekNotes] = useState<WeekNotes>({});
  const [weekVoiceNotes, setWeekVoiceNotes] = useState<WeekVoiceNotes>({});
  const [editingCaption, setEditingCaption] = useState<number | "baby" | null>(null);
  const [captionText, setCaptionText] = useState("");
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const storedPhotos = loadFromLocalStorage<WeekPhotos>(PREGNANCY_PHOTOS_KEY);
    const storedBabyPhoto = loadFromLocalStorage<WeekPhoto>(BABY_BORN_PHOTO_KEY);
    const storedNotes = loadFromLocalStorage<WeekNotes>(PREGNANCY_NOTES_KEY) || {};
    const storedVoiceNotes = loadFromLocalStorage<WeekVoiceNotes>(PREGNANCY_VOICE_NOTES_KEY) || {};
    
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
    
    if (storedBabyPhoto) {
      setBabyPhoto({
        ...storedBabyPhoto,
        timestamp: new Date(storedBabyPhoto.timestamp)
      });
    }

    setWeekNotes(storedNotes);
    setWeekVoiceNotes(storedVoiceNotes);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || uploadTarget === null) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const newPhoto: WeekPhoto = {
        imageData: reader.result as string,
        timestamp: new Date()
      };

      if (uploadTarget === "baby") {
        setBabyPhoto(newPhoto);
        saveToLocalStorage(BABY_BORN_PHOTO_KEY, newPhoto);
        toast.success("Baby photo added!");
      } else {
        const updatedPhotos = {
          ...weekPhotos,
          [uploadTarget]: newPhoto
        };
        setWeekPhotos(updatedPhotos);
        saveToLocalStorage(PREGNANCY_PHOTOS_KEY, updatedPhotos);
        toast.success(`Week ${uploadTarget} photo added!`);
      }
      
      setShowUploadDialog(false);
      setUploadTarget(null);
    };
    reader.readAsDataURL(file);
  };

  const openUploadDialog = (target: number | "baby") => {
    setUploadTarget(target);
    setShowUploadDialog(true);
  };

  const deletePhoto = (target: number | "baby") => {
    if (target === "baby") {
      setBabyPhoto(null);
      localStorage.removeItem(BABY_BORN_PHOTO_KEY);
      toast.success("Baby photo deleted");
    } else {
      const updatedPhotos = { ...weekPhotos };
      delete updatedPhotos[target];
      setWeekPhotos(updatedPhotos);
      saveToLocalStorage(PREGNANCY_PHOTOS_KEY, updatedPhotos);
      toast.success(`Week ${target} photo deleted`);
    }
    setSelectedWeek(null);
  };

  const downloadPhoto = (target: number | "baby") => {
    const photo = target === "baby" ? babyPhoto : weekPhotos[target];
    if (!photo) return;
    
    const link = document.createElement('a');
    link.href = photo.imageData;
    link.download = target === "baby" ? 'baby-born.jpg' : `bump-week-${target}.jpg`;
    link.click();
    toast.success("Photo downloaded");
  };

  const openCaptionEditor = (target: number | "baby") => {
    const photo = target === "baby" ? babyPhoto : weekPhotos[target];
    setEditingCaption(target);
    setCaptionText(photo?.caption || "");
  };

  const saveCaption = () => {
    if (editingCaption === null) return;

    if (editingCaption === "baby" && babyPhoto) {
      const updatedPhoto = { ...babyPhoto, caption: captionText };
      setBabyPhoto(updatedPhoto);
      saveToLocalStorage(BABY_BORN_PHOTO_KEY, updatedPhoto);
      toast.success("Caption saved!");
    } else if (typeof editingCaption === "number") {
      const updatedPhotos = {
        ...weekPhotos,
        [editingCaption]: { ...weekPhotos[editingCaption], caption: captionText }
      };
      setWeekPhotos(updatedPhotos);
      saveToLocalStorage(PREGNANCY_PHOTOS_KEY, updatedPhotos);
      toast.success("Caption saved!");
    }
    
    setEditingCaption(null);
    setCaptionText("");
  };

  const shouldShowWeek = (week: number): boolean => {
    if (filterType === "all") return true;
    if (filterType === "photos") return !!weekPhotos[week];
    if (filterType === "notes") return !!weekNotes[week];
    if (filterType === "voice") return !!weekVoiceNotes[week];
    return true;
  };

  const getWeekBadges = (week: number) => {
    const badges = [];
    if (weekPhotos[week]) badges.push({ icon: Camera, color: "text-primary" });
    if (weekNotes[week]) badges.push({ icon: MessageSquare, color: "text-blue-500" });
    if (weekVoiceNotes[week]) badges.push({ icon: Mic, color: "text-purple-500" });
    return badges;
  };

  const renderWeekCard = (week: number) => {
    const photo = weekPhotos[week];
    const isSelected = selectedWeek === week;
    const badges = getWeekBadges(week);

    if (!shouldShowWeek(week)) return null;

    return (
      <div 
        key={week}
        className="relative aspect-square bg-background border-2 border-border rounded-lg overflow-hidden cursor-pointer hover:border-primary transition-colors"
        onClick={() => setSelectedWeek(isSelected ? null : week)}
      >
        {photo ? (
          <>
            <img 
              src={photo.imageData} 
              alt={`Week ${week}`}
              className="w-full h-full object-cover"
            />
            {badges.length > 0 && !isSelected && (
              <div className="absolute top-2 right-2 flex gap-1">
                {badges.map((badge, idx) => (
                  <div key={idx} className="bg-white/90 rounded-full p-1">
                    <badge.icon className={`w-3 h-3 ${badge.color}`} />
                  </div>
                ))}
              </div>
            )}
            {photo.caption && !isSelected && (
              <div className="absolute bottom-8 left-0 right-0 bg-black/70 text-white text-xs p-2 line-clamp-2">
                {photo.caption}
              </div>
            )}
            {isSelected && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2">
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      openCaptionEditor(week);
                    }}
                    title="Edit caption"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadPhoto(week);
                    }}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePhoto(week);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div 
            className="w-full h-full flex flex-col items-center justify-center"
            onClick={(e) => {
              e.stopPropagation();
              openUploadDialog(week);
            }}
          >
            <div className="w-12 h-12 rounded-full border-2 border-primary/30 flex items-center justify-center mb-2">
              <Plus className="w-6 h-6 text-primary/50" />
            </div>
            <p className="text-sm font-semibold text-foreground">{week} WEEKS</p>
            {badges.length > 0 && (
              <div className="flex gap-1 mt-2">
                {badges.map((badge, idx) => (
                  <badge.icon key={idx} className={`w-3 h-3 ${badge.color}`} />
                ))}
              </div>
            )}
          </div>
        )}
        {photo && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs font-semibold py-1 px-2 text-center">
            {week} WEEKS
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
      <div className="min-h-screen pb-20">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b border-border z-10 px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
              >
                <X className="w-5 h-5" />
              </Button>
              <h2 className="text-xl font-semibold">Bump Gallery</h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowComparison(true)}
              className="gap-2"
            >
              <ArrowLeftRight className="w-4 h-4" />
              Compare
            </Button>
          </div>
          
          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto">
            <Button
              variant={filterType === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("all")}
              className="gap-2"
            >
              <Filter className="w-4 h-4" />
              All Weeks
            </Button>
            <Button
              variant={filterType === "photos" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("photos")}
              className="gap-2"
            >
              <Camera className="w-4 h-4" />
              Photos Only
            </Button>
            <Button
              variant={filterType === "notes" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("notes")}
              className="gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              Notes Only
            </Button>
            <Button
              variant={filterType === "voice" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("voice")}
              className="gap-2"
            >
              <Mic className="w-4 h-4" />
              Voice Only
            </Button>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Baby Born Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Baby className="w-5 h-5 text-pink-500" />
              Baby Born Photo
            </h3>
            <div 
              className="relative aspect-video max-w-md bg-background border-2 border-border rounded-lg overflow-hidden cursor-pointer hover:border-primary transition-colors"
              onClick={() => setSelectedWeek(selectedWeek === "baby" ? null : "baby")}
            >
              {babyPhoto ? (
                <>
                  <img 
                    src={babyPhoto.imageData} 
                    alt="Baby Born"
                    className="w-full h-full object-cover"
                  />
                  {babyPhoto.caption && selectedWeek !== "baby" && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-sm p-3 line-clamp-2">
                      {babyPhoto.caption}
                    </div>
                  )}
                  {selectedWeek === "baby" && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2">
                      <Button
                        size="icon"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          openCaptionEditor("baby");
                        }}
                        title="Edit caption"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadPhoto("baby");
                        }}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePhoto("baby");
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div 
                  className="w-full h-full flex flex-col items-center justify-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    openUploadDialog("baby");
                  }}
                >
                  <div className="w-16 h-16 rounded-full border-2 border-pink-500/30 flex items-center justify-center mb-3">
                    <Plus className="w-8 h-8 text-pink-500/50" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">Add Baby Photo</p>
                </div>
              )}
            </div>
          </div>

          {/* 40 Weeks Grid */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Pregnancy Journey (40 Weeks)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: 40 }, (_, i) => i + 1).map(week => renderWeekCard(week))}
            </div>
          </div>
        </div>
      </div>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Add Photo {uploadTarget === "baby" ? "- Baby Born" : `- Week ${uploadTarget}`}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <label htmlFor="photo-upload" className="cursor-pointer">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
                <Plus className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click to select a photo
                </p>
              </div>
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          </div>
        </DialogContent>
      </Dialog>

      {/* Caption Editor Dialog */}
      <Dialog open={editingCaption !== null} onOpenChange={() => setEditingCaption(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Edit Caption {editingCaption === "baby" ? "- Baby Born" : `- Week ${editingCaption}`}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="caption">Caption</Label>
              <Textarea
                id="caption"
                placeholder="Add a caption to your photo..."
                value={captionText}
                onChange={(e) => setCaptionText(e.target.value)}
                className="mt-2"
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={saveCaption} className="flex-1">
                Save Caption
              </Button>
              <Button variant="outline" onClick={() => setEditingCaption(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Comparison Modal */}
      {showComparison && (
        <BumpPhotoComparison onClose={() => setShowComparison(false)} />
      )}
    </div>
  );
};
