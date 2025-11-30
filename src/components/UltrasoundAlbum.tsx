import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Plus, Trash2, Download, Edit, Tag, CheckSquare, Square } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import jsPDF from "jspdf";
import { useAlbumPhotos } from "@/hooks/useAlbumPhotos";
import { BatchPhotoUpload } from "./BatchPhotoUpload";
import { MediaViewer } from "./MediaViewer";

interface UltrasoundAlbumProps {
  onClose: () => void;
}

export const UltrasoundAlbum = ({ onClose }: UltrasoundAlbumProps) => {
  const { photos, isLoading, addPhotoBatch, removePhoto, updatePhoto } = useAlbumPhotos('ultrasound');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [editingCaption, setEditingCaption] = useState<string | null>(null);
  const [captionText, setCaptionText] = useState("");
  const [weekInput, setWeekInput] = useState<number>(0);
  const [tagInput, setTagInput] = useState("");
  const [editingTags, setEditingTags] = useState<string | null>(null);
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [weekFilter, setWeekFilter] = useState<number | null>(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());

  const handleBatchUpload = async (files: FileList) => {
    const week = weekInput > 0 ? weekInput : undefined;
    await addPhotoBatch(files, { week, caption: '', tags: [] });
    setWeekInput(0);
  };

  const deleteSelectedPhoto = async (photoId: string) => {
    await removePhoto(photoId);
    setSelectedPhoto(null);
  };

  const downloadPhoto = (photoId: string) => {
    const photo = photos.find(p => p.id === photoId);
    if (!photo) return;
    
    const link = document.createElement('a');
    link.href = photo.imageData;
    const week = photo.week ? `-week${photo.week}` : '';
    link.download = `ultrasound${week}-${format(photo.timestamp, 'yyyy-MM-dd')}.jpg`;
    link.click();
    toast.success("Photo downloaded");
  };

  const openCaptionEditor = (photoId: string) => {
    const photo = photos.find(p => p.id === photoId);
    setEditingCaption(photoId);
    setCaptionText(photo?.caption || "");
  };

  const saveCaption = async () => {
    if (editingCaption === null) return;
    await updatePhoto(editingCaption, { caption: captionText });
    setEditingCaption(null);
    setCaptionText("");
  };

  const openTagEditor = (photoId: string) => {
    setEditingTags(photoId);
  };

  const addTag = async (photoId: string, tag: string) => {
    if (!tag.trim()) return;
    const photo = photos.find(p => p.id === photoId);
    if (!photo) return;
    
    const newTags = [...(photo.tags || []), tag.trim()];
    await updatePhoto(photoId, { tags: newTags });
    setTagInput("");
  };

  const removeTag = async (photoId: string, tagToRemove: string) => {
    const photo = photos.find(p => p.id === photoId);
    if (!photo) return;
    
    const newTags = (photo.tags || []).filter(t => t !== tagToRemove);
    await updatePhoto(photoId, { tags: newTags });
  };

  const getAllTags = () => {
    const tagsSet = new Set<string>();
    photos.forEach(photo => {
      photo.tags?.forEach(tag => tagsSet.add(tag));
    });
    return Array.from(tagsSet);
  };

  const getAllWeeks = () => {
    const weeksSet = new Set<number>();
    photos.forEach(photo => {
      if (photo.week) weeksSet.add(photo.week);
    });
    return Array.from(weeksSet).sort((a, b) => a - b);
  };

  const filteredPhotos = photos.filter(photo => {
    if (tagFilter && !photo.tags?.includes(tagFilter)) return false;
    if (weekFilter !== null && photo.week !== weekFilter) return false;
    return true;
  });

  const togglePhotoSelection = (photoId: string) => {
    setSelectedPhotos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(photoId)) {
        newSet.delete(photoId);
      } else {
        newSet.add(photoId);
      }
      return newSet;
    });
  };

  const deleteSelected = async () => {
    if (!confirm(`Delete ${selectedPhotos.size} selected photos?`)) return;
    
    for (const photoId of selectedPhotos) {
      await removePhoto(photoId);
    }
    
    setSelectedPhotos(new Set());
    setSelectionMode(false);
  };

  const exportToPDF = () => {
    const pdf = new jsPDF();
    let yPos = 20;

    pdf.setFontSize(20);
    pdf.text("Ultrasound Album Memory Book", 20, yPos);
    yPos += 15;

    pdf.setFontSize(10);
    pdf.text(`Generated: ${format(new Date(), 'MMMM dd, yyyy')}`, 20, yPos);
    yPos += 10;

    filteredPhotos.forEach((photo) => {
      if (yPos > 250) {
        pdf.addPage();
        yPos = 20;
      }

      try {
        const imgWidth = 170;
        const imgHeight = 120;
        pdf.addImage(photo.imageData, 'JPEG', 20, yPos, imgWidth, imgHeight);
        yPos += imgHeight + 5;

        pdf.setFontSize(10);
        const week = photo.week ? ` - Week ${photo.week}` : '';
        pdf.text(`Date: ${format(photo.timestamp, 'MMM dd, yyyy')}${week}`, 20, yPos);
        yPos += 5;

        if (photo.caption) {
          pdf.text(`Caption: ${photo.caption}`, 20, yPos);
          yPos += 5;
        }

        yPos += 10;
      } catch (error) {
        console.error('Error adding photo to PDF:', error);
      }
    });

    pdf.save(`ultrasound-album-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    toast.success("PDF exported successfully!");
  };

  const selectedPhotoData = photos.find(p => p.id === selectedPhoto);

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground">Ultrasound Album</h1>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Upload Section with Week Input */}
        <div className="flex flex-wrap gap-2 mb-6 items-end">
          <div className="flex-1 min-w-[200px]">
            <Label htmlFor="week">Week of Pregnancy (Optional)</Label>
            <Input
              id="week"
              type="number"
              min="1"
              max="40"
              value={weekInput || ''}
              onChange={(e) => setWeekInput(parseInt(e.target.value) || 0)}
              placeholder="Enter week..."
              className="mt-1"
            />
          </div>
          <BatchPhotoUpload onUpload={handleBatchUpload} label="Upload Photos" />
          
          <Button variant="outline" onClick={exportToPDF}>
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>

          <Button
            variant={selectionMode ? "destructive" : "outline"}
            onClick={() => {
              setSelectionMode(!selectionMode);
              setSelectedPhotos(new Set());
            }}
          >
            {selectionMode ? 'Cancel Selection' : 'Select Photos'}
          </Button>

          {selectionMode && selectedPhotos.size > 0 && (
            <Button variant="destructive" onClick={deleteSelected}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete {selectedPhotos.size}
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {getAllWeeks().length > 0 && (
            <>
              <Button
                variant={weekFilter === null ? "default" : "outline"}
                size="sm"
                onClick={() => setWeekFilter(null)}
              >
                All Weeks
              </Button>
              {getAllWeeks().map(week => (
                <Button
                  key={week}
                  variant={weekFilter === week ? "default" : "outline"}
                  size="sm"
                  onClick={() => setWeekFilter(weekFilter === week ? null : week)}
                >
                  Week {week}
                </Button>
              ))}
            </>
          )}

          {getAllTags().length > 0 && (
            <div className="flex gap-1 ml-4">
              {getAllTags().map(tag => (
                <Badge
                  key={tag}
                  variant={tagFilter === tag ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setTagFilter(tagFilter === tag ? null : tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Photo Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading photos...</p>
          </div>
        ) : filteredPhotos.length === 0 ? (
          <div className="text-center py-12 bg-muted/30 rounded-lg">
            <p className="text-muted-foreground mb-4">No ultrasound photos yet</p>
            <p className="text-sm text-muted-foreground mb-4">Optionally enter a week number, then upload photos</p>
            <BatchPhotoUpload onUpload={handleBatchUpload} label="Add First Photos" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredPhotos.map((photo) => (
              <div
                key={photo.id}
                className="relative group aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer"
                onClick={() => !selectionMode && setSelectedPhoto(photo.id)}
              >
                <MediaViewer
                  src={photo.imageData}
                  mediaType={photo.mediaType}
                  duration={photo.duration}
                  alt={photo.caption || "Ultrasound"}
                  className="w-full h-full object-cover"
                />

                {selectionMode && (
                  <div
                    className="absolute top-2 left-2 z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePhotoSelection(photo.id);
                    }}
                  >
                    {selectedPhotos.has(photo.id) ? (
                      <CheckSquare className="w-6 h-6 text-primary" />
                    ) : (
                      <Square className="w-6 h-6 text-white" />
                    )}
                  </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                  {photo.week && (
                    <p className="text-white text-xs font-semibold">Week {photo.week}</p>
                  )}
                  <p className="text-white text-xs">
                    {format(photo.timestamp, 'MMM dd, yyyy')}
                  </p>
                  {photo.caption && (
                    <p className="text-white text-xs truncate">{photo.caption}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Photo Detail Dialog */}
        {selectedPhotoData && (
          <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {selectedPhotoData.week && `Week ${selectedPhotoData.week} - `}
                  {format(selectedPhotoData.timestamp, 'MMMM dd, yyyy')}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <MediaViewer
                  src={selectedPhotoData.imageData}
                  mediaType={selectedPhotoData.mediaType}
                  duration={selectedPhotoData.duration}
                  alt="Ultrasound"
                  className="w-full rounded-lg"
                />

                {selectedPhotoData.caption && (
                  <p className="text-sm text-muted-foreground">{selectedPhotoData.caption}</p>
                )}

                {selectedPhotoData.tags && selectedPhotoData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {selectedPhotoData.tags.map(tag => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button onClick={() => openCaptionEditor(selectedPhotoData.id)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Caption
                  </Button>
                  <Button variant="outline" onClick={() => openTagEditor(selectedPhotoData.id)}>
                    <Tag className="w-4 h-4 mr-2" />
                    Edit Tags
                  </Button>
                  <Button variant="outline" onClick={() => downloadPhoto(selectedPhotoData.id)}>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => deleteSelectedPhoto(selectedPhotoData.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Caption Editor Dialog */}
        <Dialog open={!!editingCaption} onOpenChange={() => setEditingCaption(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Caption</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                value={captionText}
                onChange={(e) => setCaptionText(e.target.value)}
                placeholder="Add a caption..."
                rows={4}
              />
              <div className="flex gap-2">
                <Button onClick={saveCaption} className="flex-1">Save</Button>
                <Button variant="outline" onClick={() => setEditingCaption(null)}>Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Tag Editor Dialog */}
        <Dialog open={!!editingTags} onOpenChange={() => setEditingTags(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Tags</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {editingTags && (
                <>
                  <div className="flex flex-wrap gap-2">
                    {photos.find(p => p.id === editingTags)?.tags?.map(tag => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <X
                          className="w-3 h-3 cursor-pointer"
                          onClick={() => removeTag(editingTags, tag)}
                        />
                      </Badge>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Add a tag (e.g., First scan, Anatomy scan)..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          addTag(editingTags, tagInput);
                        }
                      }}
                    />
                    <Button onClick={() => addTag(editingTags, tagInput)}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
