import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Plus, Trash2, Baby, Filter, MessageSquare, Mic, FileDown, Share2 } from "lucide-react";
import { saveToLocalStorage, loadFromLocalStorage } from "@/lib/storage";
import { useAlbumPhotos } from "@/hooks/useAlbumPhotos";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BatchPhotoUpload } from "./BatchPhotoUpload";
import { MediaViewer } from "./MediaViewer";
import jsPDF from "jspdf";

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

interface BumpGalleryProps {
  onClose: () => void;
}

const PREGNANCY_NOTES_KEY = "pregnancy-week-notes";
const PREGNANCY_VOICE_NOTES_KEY = "pregnancy-week-voice-notes";

type FilterType = "all" | "photos" | "notes" | "voice";

export const BumpGallery = ({ onClose }: BumpGalleryProps) => {
  const bumpPhotos = useAlbumPhotos('bump');
  const babyPhotos = useAlbumPhotos('baby');
  
  const [selectedWeek, setSelectedWeek] = useState<number | "baby" | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadTarget, setUploadTarget] = useState<number | "baby" | null>(null);
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [weekNotes, setWeekNotes] = useState<WeekNotes>({});
  const [weekVoiceNotes, setWeekVoiceNotes] = useState<WeekVoiceNotes>({});
  const [editingCaption, setEditingCaption] = useState<{ week: number | "baby", photoId: string } | null>(null);
  const [captionText, setCaptionText] = useState("");

  useEffect(() => {
    loadNotesData();
  }, []);

  const loadNotesData = () => {
    const storedNotes = loadFromLocalStorage<WeekNotes>(PREGNANCY_NOTES_KEY) || {};
    const storedVoiceNotes = loadFromLocalStorage<WeekVoiceNotes>(PREGNANCY_VOICE_NOTES_KEY) || {};
    
    setWeekNotes(storedNotes);
    setWeekVoiceNotes(storedVoiceNotes);
  };

  const handleUploadClick = (week: number | "baby") => {
    setUploadTarget(week);
    setShowUploadDialog(true);
  };

  const handleBatchUpload = async (files: FileList) => {
    if (uploadTarget === null) return;
    
    if (uploadTarget === "baby") {
      await babyPhotos.addPhotoBatch(files);
    } else {
      await bumpPhotos.addPhotoBatch(files, { week: uploadTarget });
    }
    
    setShowUploadDialog(false);
    setUploadTarget(null);
  };

  const handleDeletePhoto = async (week: number | "baby", photoId: string) => {
    if (week === "baby") {
      await babyPhotos.removePhoto(photoId);
    } else {
      await bumpPhotos.removePhoto(photoId);
    }
  };

  const openCaptionEditor = (week: number | "baby", photoId: string, currentCaption?: string) => {
    setEditingCaption({ week, photoId });
    setCaptionText(currentCaption || "");
  };

  const saveCaption = async () => {
    if (!editingCaption) return;
    
    const { week, photoId } = editingCaption;
    
    if (week === "baby") {
      await babyPhotos.updatePhoto(photoId, { caption: captionText });
    } else {
      await bumpPhotos.updatePhoto(photoId, { caption: captionText });
    }
    
    setEditingCaption(null);
    setCaptionText("");
  };

  const getWeekBadges = (week: number) => {
    const badges = [];
    
    const weekPhoto = bumpPhotos.photos.find(p => p.week === week);
    if (weekPhoto) {
      badges.push(<Badge key="photo" variant="secondary" className="bg-primary/20">📸</Badge>);
    }
    
    if (weekNotes[week]) {
      badges.push(<Badge key="note" variant="secondary" className="bg-primary/20">📝</Badge>);
    }
    
    if (weekVoiceNotes[week]) {
      badges.push(<Badge key="voice" variant="secondary" className="bg-primary/20">🎙️</Badge>);
    }
    
    return badges;
  };

  const shouldShowWeek = (week: number) => {
    if (filterType === "all") return true;
    
    if (filterType === "photos") {
      return bumpPhotos.photos.some(p => p.week === week);
    }
    
    if (filterType === "notes") {
      return !!weekNotes[week];
    }
    
    if (filterType === "voice") {
      return !!weekVoiceNotes[week];
    }
    
    return false;
  };

  const exportToPDF = async () => {
    try {
      const pdf = new jsPDF();
      let yPosition = 20;
      
      pdf.setFontSize(20);
      pdf.text("Pregnancy Journey", 20, yPosition);
      yPosition += 15;
      
      for (let week = 1; week <= 40; week++) {
        const weekPhoto = bumpPhotos.photos.find(p => p.week === week);
        
        if (weekPhoto) {
          if (yPosition > 250) {
            pdf.addPage();
            yPosition = 20;
          }
          
          pdf.setFontSize(14);
          pdf.text(`Week ${week}`, 20, yPosition);
          yPosition += 10;
          
          if (weekPhoto.caption) {
            pdf.setFontSize(10);
            pdf.text(weekPhoto.caption, 20, yPosition);
            yPosition += 10;
          }
          
          if (weekPhoto.mediaType === 'image' && weekPhoto.imageData) {
            try {
              pdf.addImage(weekPhoto.imageData, 'JPEG', 20, yPosition, 80, 80);
              yPosition += 90;
            } catch (error) {
              console.error('Error adding image to PDF:', error);
            }
          }
        }
      }
      
      pdf.save("pregnancy-journey.pdf");
      toast.success("PDF exported successfully!");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.error("Failed to export PDF");
    }
  };

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-primary">Bump Photo Gallery</h2>
              <p className="text-sm text-muted-foreground">Your pregnancy journey week by week</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={exportToPDF}>
                <FileDown className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          {/* Filters */}
          <div className="flex gap-2 mt-4">
            <Button
              variant={filterType === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("all")}
            >
              All Weeks
            </Button>
            <Button
              variant={filterType === "photos" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("photos")}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              With Photos
            </Button>
            <Button
              variant={filterType === "notes" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("notes")}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              With Notes
            </Button>
            <Button
              variant={filterType === "voice" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("voice")}
            >
              <Mic className="w-4 h-4 mr-2" />
              With Voice
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container py-6">
        {/* Pregnancy Weeks */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
          {Array.from({ length: 40 }, (_, i) => i + 1)
            .filter(shouldShowWeek)
            .map((week) => {
              const weekPhoto = bumpPhotos.photos.find(p => p.week === week);
              
              return (
                <Card key={week} className="overflow-hidden">
                  <div className="aspect-square relative group">
                    {weekPhoto ? (
                      <>
                        <MediaViewer
                          src={weekPhoto.imageData}
                          mediaType={weekPhoto.mediaType}
                          duration={weekPhoto.duration}
                          alt={`Week ${week}`}
                          className="cursor-pointer"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button
                            size="icon"
                            variant="secondary"
                            onClick={() => openCaptionEditor(week, weekPhoto.id, weekPhoto.caption)}
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="destructive"
                            onClick={() => handleDeletePhoto(week, weekPhoto.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleUploadClick(week)}
                        >
                          <Plus className="h-6 w-6" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">Week {week}</span>
                      <div className="flex gap-1">
                        {getWeekBadges(week)}
                      </div>
                    </div>
                    {weekPhoto?.caption && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {weekPhoto.caption}
                      </p>
                    )}
                  </div>
                </Card>
              );
            })}
        </div>

        {/* Baby Born Section */}
        <div className="border-t border-border pt-8">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Baby className="h-5 w-5 text-primary" />
            Baby Born
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {babyPhotos.photos.length > 0 ? (
              babyPhotos.photos.map((photo) => (
                <Card key={photo.id} className="overflow-hidden">
                  <div className="aspect-square relative group">
                    <MediaViewer
                      src={photo.imageData}
                      mediaType={photo.mediaType}
                      duration={photo.duration}
                      alt="Baby"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        size="icon"
                        variant="secondary"
                        onClick={() => openCaptionEditor("baby", photo.id, photo.caption)}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => handleDeletePhoto("baby", photo.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {photo.caption && (
                    <div className="p-3">
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {photo.caption}
                      </p>
                    </div>
                  )}
                </Card>
              ))
            ) : (
              <Card className="overflow-hidden">
                <div className="aspect-square bg-muted flex items-center justify-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleUploadClick("baby")}
                  >
                    <Plus className="h-6 w-6" />
                  </Button>
                </div>
                <div className="p-3">
                  <span className="text-sm text-muted-foreground">Add baby photo</span>
                </div>
              </Card>
            )}
            
            {/* Add more button for baby album */}
            <Card className="overflow-hidden border-dashed">
              <div className="aspect-square bg-muted/50 flex items-center justify-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleUploadClick("baby")}
                >
                  <Plus className="h-6 w-6" />
                </Button>
              </div>
              <div className="p-3">
                <span className="text-sm text-muted-foreground">Add more</span>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Upload {uploadTarget === "baby" ? "Baby" : `Week ${uploadTarget}`} Photos/Videos
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Select multiple photos or videos to upload at once
            </p>
            <BatchPhotoUpload
              onUpload={handleBatchUpload}
              label="Select Files"
              multiple={true}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Caption Editor Dialog */}
      <Dialog open={editingCaption !== null} onOpenChange={() => setEditingCaption(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Caption</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Caption</Label>
              <Textarea
                value={captionText}
                onChange={(e) => setCaptionText(e.target.value)}
                placeholder="Add a caption..."
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingCaption(null)}>
                Cancel
              </Button>
              <Button onClick={saveCaption}>
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
