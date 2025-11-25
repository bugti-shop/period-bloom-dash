import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { X, Plus, Trash2, Download, Filter, MessageSquare, Camera, Play, Pause, Edit, Tag, FileDown, Share2, Calendar, CheckSquare, Square } from "lucide-react";
import { saveToLocalStorage, loadFromLocalStorage } from "@/lib/storage";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { format } from "date-fns";
import jsPDF from "jspdf";

interface UltrasoundPhoto {
  id: string;
  imageData: string;
  timestamp: Date;
  caption?: string;
  tags?: string[];
  weekOfPregnancy?: number;
  filters?: {
    brightness: number;
    contrast: number;
    saturation: number;
  };
}

interface UltrasoundAlbumProps {
  onClose: () => void;
}

const ULTRASOUND_ALBUM_KEY = "ultrasound-album-photos";

type FilterType = "all" | "today" | "week" | "month";

export const UltrasoundAlbum = ({ onClose }: UltrasoundAlbumProps) => {
  const [photos, setPhotos] = useState<UltrasoundPhoto[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [isSlideshow, setIsSlideshow] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [editingPhoto, setEditingPhoto] = useState<string | null>(null);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [editingCaption, setEditingCaption] = useState<string | null>(null);
  const [captionText, setCaptionText] = useState("");
  const [weekOfPregnancy, setWeekOfPregnancy] = useState<number>(0);
  const [tagInput, setTagInput] = useState("");
  const [editingTags, setEditingTags] = useState<string | null>(null);
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [sharingPhoto, setSharingPhoto] = useState<string | "album" | null>(null);
  const [shareWithWatermark, setShareWithWatermark] = useState(true);
  const [shareMessage, setShareMessage] = useState("");
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!isSlideshow || photos.length === 0) return;
    
    const timer = setTimeout(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % photos.length);
    }, 3000);

    return () => clearTimeout(timer);
  }, [isSlideshow, currentSlideIndex, photos]);

  const loadData = () => {
    const storedPhotos = loadFromLocalStorage<UltrasoundPhoto[]>(ULTRASOUND_ALBUM_KEY) || [];
    const photosWithDates = storedPhotos.map(photo => ({
      ...photo,
      timestamp: new Date(photo.timestamp)
    }));
    setPhotos(photosWithDates.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newPhotos: UltrasoundPhoto[] = [];

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newPhoto: UltrasoundPhoto = {
          id: `${Date.now()}-${Math.random()}`,
          imageData: reader.result as string,
          timestamp: new Date(),
          weekOfPregnancy: weekOfPregnancy > 0 ? weekOfPregnancy : undefined,
        };
        newPhotos.push(newPhoto);

        if (newPhotos.length === files.length) {
          const updatedPhotos = [...photos, ...newPhotos].sort((a, b) => 
            b.timestamp.getTime() - a.timestamp.getTime()
          );
          setPhotos(updatedPhotos);
          saveToLocalStorage(ULTRASOUND_ALBUM_KEY, updatedPhotos);
          toast.success(`${files.length} ultrasound${files.length > 1 ? 's' : ''} added!`);
          setShowUploadDialog(false);
          setWeekOfPregnancy(0);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const deletePhoto = (photoId: string) => {
    const updatedPhotos = photos.filter(p => p.id !== photoId);
    setPhotos(updatedPhotos);
    saveToLocalStorage(ULTRASOUND_ALBUM_KEY, updatedPhotos);
    toast.success("Ultrasound deleted");
    setSelectedPhoto(null);
  };

  const downloadPhoto = (photoId: string) => {
    const photo = photos.find(p => p.id === photoId);
    if (!photo) return;
    
    const link = document.createElement('a');
    link.href = photo.imageData;
    link.download = `ultrasound-${format(photo.timestamp, 'yyyy-MM-dd-HHmm')}.jpg`;
    link.click();
    toast.success("Ultrasound downloaded");
  };

  const openCaptionEditor = (photoId: string) => {
    const photo = photos.find(p => p.id === photoId);
    setEditingCaption(photoId);
    setCaptionText(photo?.caption || "");
    setWeekOfPregnancy(photo?.weekOfPregnancy || 0);
  };

  const saveCaption = () => {
    if (!editingCaption) return;

    const updatedPhotos = photos.map(photo =>
      photo.id === editingCaption
        ? { 
            ...photo, 
            caption: captionText,
            weekOfPregnancy: weekOfPregnancy > 0 ? weekOfPregnancy : undefined 
          }
        : photo
    );
    setPhotos(updatedPhotos);
    saveToLocalStorage(ULTRASOUND_ALBUM_KEY, updatedPhotos);
    toast.success("Details saved!");
    setEditingCaption(null);
    setCaptionText("");
    setWeekOfPregnancy(0);
  };

  const openPhotoEditor = (photoId: string) => {
    const photo = photos.find(p => p.id === photoId);
    if (!photo) return;
    
    setEditingPhoto(photoId);
    setBrightness(photo.filters?.brightness || 100);
    setContrast(photo.filters?.contrast || 100);
    setSaturation(photo.filters?.saturation || 100);
  };

  const applyPhotoEdits = () => {
    if (!editingPhoto) return;

    const filters = { brightness, contrast, saturation };
    const updatedPhotos = photos.map(photo =>
      photo.id === editingPhoto
        ? { ...photo, filters }
        : photo
    );
    setPhotos(updatedPhotos);
    saveToLocalStorage(ULTRASOUND_ALBUM_KEY, updatedPhotos);
    setEditingPhoto(null);
    toast.success("Edits saved!");
  };

  const openTagEditor = (photoId: string) => {
    setEditingTags(photoId);
    setTagInput("");
  };

  const addTag = () => {
    if (!tagInput.trim() || !editingTags) return;

    const updatedPhotos = photos.map(photo =>
      photo.id === editingTags
        ? { ...photo, tags: [...(photo.tags || []), tagInput.trim()] }
        : photo
    );
    setPhotos(updatedPhotos);
    saveToLocalStorage(ULTRASOUND_ALBUM_KEY, updatedPhotos);
    setTagInput("");
    toast.success("Tag added!");
  };

  const removeTag = (photoId: string, tag: string) => {
    const updatedPhotos = photos.map(photo =>
      photo.id === photoId
        ? { ...photo, tags: photo.tags?.filter(t => t !== tag) }
        : photo
    );
    setPhotos(updatedPhotos);
    saveToLocalStorage(ULTRASOUND_ALBUM_KEY, updatedPhotos);
    toast.success("Tag removed!");
  };

  const getAllTags = (): string[] => {
    const tags = new Set<string>();
    photos.forEach(photo => {
      photo.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  };

  const filterPhotos = (): UltrasoundPhoto[] => {
    let filtered = photos;

    if (filterType !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(photo => {
        const photoDate = new Date(photo.timestamp);
        
        if (filterType === "today") {
          return photoDate >= today;
        } else if (filterType === "week") {
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return photoDate >= weekAgo;
        } else if (filterType === "month") {
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return photoDate >= monthAgo;
        }
        return true;
      });
    }

    if (tagFilter) {
      filtered = filtered.filter(photo => photo.tags?.includes(tagFilter));
    }

    return filtered;
  };

  const getPhotoStyle = (photo: UltrasoundPhoto) => {
    if (!photo.filters) return {};
    return {
      filter: `brightness(${photo.filters.brightness}%) contrast(${photo.filters.contrast}%) saturate(${photo.filters.saturation}%)`
    };
  };

  const exportToPDF = async () => {
    toast("Generating PDF...");
    
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPosition = 20;

    pdf.setFontSize(24);
    pdf.text("Ultrasound Images", pageWidth / 2, yPosition, { align: "center" });
    yPosition += 20;
    pdf.setFontSize(12);
    pdf.text("Pregnancy Journey", pageWidth / 2, yPosition, { align: "center" });
    
    pdf.addPage();
    yPosition = 20;

    for (const photo of photos) {
      if (yPosition > pageHeight - 120) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.setFontSize(14);
      const dateText = format(photo.timestamp, 'MMMM d, yyyy');
      const weekText = photo.weekOfPregnancy ? ` - Week ${photo.weekOfPregnancy}` : '';
      pdf.text(`${dateText}${weekText}`, 20, yPosition);
      yPosition += 10;

      try {
        const img = new Image();
        img.src = photo.imageData;
        await new Promise(resolve => { img.onload = resolve; });
        
        const imgWidth = 170;
        const imgHeight = 120;
        pdf.addImage(photo.imageData, "JPEG", 20, yPosition, imgWidth, imgHeight);
        yPosition += imgHeight + 10;
      } catch (error) {
        console.error("Error adding image:", error);
      }

      if (photo.caption) {
        pdf.setFontSize(10);
        const lines = pdf.splitTextToSize(photo.caption, pageWidth - 40);
        pdf.text(lines, 20, yPosition);
        yPosition += lines.length * 5 + 5;
      }

      if (photo.tags && photo.tags.length > 0) {
        pdf.setFontSize(9);
        pdf.text(`Tags: ${photo.tags.join(", ")}`, 20, yPosition);
        yPosition += 10;
      }

      yPosition += 10;
    }

    pdf.save("ultrasound-images.pdf");
    toast.success("PDF exported successfully!");
  };

  const startSlideshow = () => {
    if (filterPhotos().length > 0) {
      setCurrentSlideIndex(0);
      setIsSlideshow(true);
    }
  };

  const openShareDialog = (target: string | "album") => {
    setSharingPhoto(target);
    setShareMessage("");
  };

  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    setSelectedPhotos(new Set());
  };

  const togglePhotoSelection = (photoId: string) => {
    const newSelected = new Set(selectedPhotos);
    if (newSelected.has(photoId)) {
      newSelected.delete(photoId);
    } else {
      newSelected.add(photoId);
    }
    setSelectedPhotos(newSelected);
  };

  const selectAll = () => {
    const allPhotoIds = new Set(photos.map(p => p.id));
    setSelectedPhotos(allPhotoIds);
  };

  const deselectAll = () => {
    setSelectedPhotos(new Set());
  };

  const deleteSelected = () => {
    if (selectedPhotos.size === 0) return;

    const confirmed = window.confirm(`Delete ${selectedPhotos.size} ultrasound(s)?`);
    if (!confirmed) return;

    const updatedPhotos = photos.filter(p => !selectedPhotos.has(p.id));
    setPhotos(updatedPhotos);
    saveToLocalStorage(ULTRASOUND_ALBUM_KEY, updatedPhotos);

    toast.success(`${selectedPhotos.size} ultrasound(s) deleted`);
    setSelectionMode(false);
    setSelectedPhotos(new Set());
  };

  const filteredPhotos = filterPhotos();
  const groupedByDate = filteredPhotos.reduce((acc, photo) => {
    const dateKey = format(photo.timestamp, 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(photo);
    return acc;
  }, {} as Record<string, UltrasoundPhoto[]>);

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
              <h2 className="text-xl font-semibold">Ultrasound Images</h2>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {!selectionMode ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={isSlideshow ? () => setIsSlideshow(false) : startSlideshow}
                    className="gap-2"
                  >
                    {isSlideshow ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {isSlideshow ? "Pause" : "Slideshow"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportToPDF}
                    className="gap-2"
                  >
                    <FileDown className="w-4 h-4" />
                    PDF
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setShowUploadDialog(true)}
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={toggleSelectionMode}
                    className="gap-2"
                  >
                    <CheckSquare className="w-4 h-4" />
                    Select
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={selectAll}
                    className="gap-2"
                  >
                    <CheckSquare className="w-4 h-4" />
                    All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={deselectAll}
                    className="gap-2"
                  >
                    <Square className="w-4 h-4" />
                    None
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={deleteSelected}
                    disabled={selectedPhotos.size === 0}
                    className="gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete ({selectedPhotos.size})
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleSelectionMode}
                  >
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </div>
          
          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Button
              variant={filterType === "all" && !tagFilter ? "default" : "outline"}
              size="sm"
              onClick={() => { setFilterType("all"); setTagFilter(null); }}
              className="gap-2"
            >
              <Filter className="w-4 h-4" />
              All
            </Button>
            <Button
              variant={filterType === "today" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("today")}
              className="gap-2"
            >
              <Calendar className="w-4 h-4" />
              Today
            </Button>
            <Button
              variant={filterType === "week" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("week")}
              className="gap-2"
            >
              <Calendar className="w-4 h-4" />
              This Week
            </Button>
            <Button
              variant={filterType === "month" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("month")}
              className="gap-2"
            >
              <Calendar className="w-4 h-4" />
              This Month
            </Button>
            {getAllTags().map(tag => (
              <Button
                key={tag}
                variant={tagFilter === tag ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setTagFilter(tagFilter === tag ? null : tag);
                  setFilterType("all");
                }}
                className="gap-2"
              >
                <Tag className="w-4 h-4" />
                {tag}
              </Button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          {photos.length === 0 ? (
            <div className="text-center py-20">
              <Camera className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Ultrasounds Yet</h3>
              <p className="text-muted-foreground mb-4">Start adding your ultrasound images</p>
              <Button onClick={() => setShowUploadDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Image
              </Button>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedByDate).map(([dateKey, dayPhotos]) => (
                <div key={dateKey}>
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    {format(new Date(dateKey), 'EEEE, MMMM d, yyyy')}
                    <span className="text-sm text-muted-foreground">({dayPhotos.length} image{dayPhotos.length > 1 ? 's' : ''})</span>
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {dayPhotos.map(photo => {
                      const isSelected = selectedPhoto === photo.id;
                      return (
                        <div 
                          key={photo.id}
                          className={`relative aspect-square bg-background border-2 rounded-lg overflow-hidden cursor-pointer transition-colors ${
                            selectionMode && selectedPhotos.has(photo.id)
                              ? 'border-primary ring-2 ring-primary'
                              : 'border-border hover:border-primary'
                          }`}
                          onClick={() => {
                            if (selectionMode) {
                              togglePhotoSelection(photo.id);
                            } else {
                              setSelectedPhoto(isSelected ? null : photo.id);
                            }
                          }}
                        >
                          <img 
                            src={photo.imageData} 
                            alt={`Ultrasound ${format(photo.timestamp, 'MMM d, yyyy')}`}
                            className="w-full h-full object-cover"
                            style={getPhotoStyle(photo)}
                          />
                          {selectionMode && (
                            <div className="absolute top-2 left-2 z-10">
                              <div className={`w-6 h-6 rounded flex items-center justify-center ${
                                selectedPhotos.has(photo.id) ? 'bg-primary text-white' : 'bg-white/90 text-gray-600'
                              }`}>
                                {selectedPhotos.has(photo.id) ? (
                                  <CheckSquare className="w-4 h-4" />
                                ) : (
                                  <Square className="w-4 h-4" />
                                )}
                              </div>
                            </div>
                          )}
                          {photo.weekOfPregnancy && !isSelected && !selectionMode && (
                            <div className="absolute top-2 right-2 bg-primary text-white text-xs font-semibold px-2 py-1 rounded">
                              Week {photo.weekOfPregnancy}
                            </div>
                          )}
                          {photo.caption && !isSelected && !selectionMode && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-2 line-clamp-2">
                              {photo.caption}
                            </div>
                          )}
                          {isSelected && !selectionMode && (
                            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2">
                              <div className="flex gap-2 flex-wrap justify-center">
                                <Button
                                  size="icon"
                                  variant="secondary"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openCaptionEditor(photo.id);
                                  }}
                                  title="Edit details"
                                >
                                  <MessageSquare className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="secondary"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openPhotoEditor(photo.id);
                                  }}
                                  title="Edit image"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="secondary"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openTagEditor(photo.id);
                                  }}
                                  title="Add tags"
                                >
                                  <Tag className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="secondary"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    downloadPhoto(photo.id);
                                  }}
                                >
                                  <Download className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="secondary"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deletePhoto(photo.id);
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Ultrasound Images</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="week-input">Week of Pregnancy (Optional)</Label>
              <Input
                id="week-input"
                type="number"
                min="0"
                max="42"
                value={weekOfPregnancy || ""}
                onChange={(e) => setWeekOfPregnancy(parseInt(e.target.value) || 0)}
                placeholder="e.g., 12"
              />
            </div>
            <div>
              <Label htmlFor="photo-upload">Select images (multiple allowed)</Label>
              <Input
                id="photo-upload"
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Caption Editor */}
      <Dialog open={editingCaption !== null} onOpenChange={() => setEditingCaption(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="week-edit">Week of Pregnancy (Optional)</Label>
              <Input
                id="week-edit"
                type="number"
                min="0"
                max="42"
                value={weekOfPregnancy || ""}
                onChange={(e) => setWeekOfPregnancy(parseInt(e.target.value) || 0)}
                placeholder="e.g., 12"
              />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                value={captionText}
                onChange={(e) => setCaptionText(e.target.value)}
                placeholder="Add notes about this ultrasound..."
                rows={4}
              />
            </div>
            <Button onClick={saveCaption}>Save Details</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Photo Editor */}
      <Dialog open={editingPhoto !== null} onOpenChange={() => setEditingPhoto(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Brightness: {brightness}%</Label>
              <Slider
                value={[brightness]}
                onValueChange={([value]) => setBrightness(value)}
                min={0}
                max={200}
                step={1}
              />
            </div>
            <div>
              <Label>Contrast: {contrast}%</Label>
              <Slider
                value={[contrast]}
                onValueChange={([value]) => setContrast(value)}
                min={0}
                max={200}
                step={1}
              />
            </div>
            <div>
              <Label>Saturation: {saturation}%</Label>
              <Slider
                value={[saturation]}
                onValueChange={([value]) => setSaturation(value)}
                min={0}
                max={200}
                step={1}
              />
            </div>
            <Button onClick={applyPhotoEdits}>Apply Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Tag Editor */}
      <Dialog open={editingTags !== null} onOpenChange={() => setEditingTags(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Tags</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add a tag..."
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
              />
              <Button onClick={addTag}>Add</Button>
            </div>
            {editingTags && (
              <div className="flex flex-wrap gap-2">
                {photos.find(p => p.id === editingTags)?.tags?.map(tag => (
                  <div key={tag} className="flex items-center gap-1 bg-muted px-2 py-1 rounded">
                    <span className="text-sm">{tag}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4"
                      onClick={() => removeTag(editingTags, tag)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};