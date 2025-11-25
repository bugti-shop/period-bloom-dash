import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { X, Plus, Trash2, Download, Filter, MessageSquare, Camera, Play, Pause, Edit, Tag, FileDown, Share2, Calendar, CheckSquare, Square, MoveRight, Users } from "lucide-react";
import { saveToLocalStorage, loadFromLocalStorage } from "@/lib/storage";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { format } from "date-fns";
import jsPDF from "jspdf";
import { FaceGroupsView } from "./FaceGroupsView";
import { detectFacesInImage, PhotoWithFaces } from "@/lib/faceDetection";

interface FamilyPhoto {
  id: string;
  imageData: string;
  timestamp: Date;
  caption?: string;
  tags?: string[];
  filters?: {
    brightness: number;
    contrast: number;
    saturation: number;
  };
}

interface FamilyAlbumProps {
  onClose: () => void;
}

const FAMILY_ALBUM_KEY = "family-album-photos";

type FilterType = "all" | "today" | "week" | "month";

export const FamilyAlbum = ({ onClose }: FamilyAlbumProps) => {
  const [photos, setPhotos] = useState<FamilyPhoto[]>([]);
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
  const [tagInput, setTagInput] = useState("");
  const [editingTags, setEditingTags] = useState<string | null>(null);
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [sharingPhoto, setSharingPhoto] = useState<string | "album" | null>(null);
  const [shareWithWatermark, setShareWithWatermark] = useState(true);
  const [shareMessage, setShareMessage] = useState("");
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [showFaceGroups, setShowFaceGroups] = useState(false);
  const [photosWithFaces, setPhotosWithFaces] = useState<PhotoWithFaces[]>([]);
  const [isAnalyzingFaces, setIsAnalyzingFaces] = useState(false);
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
    const storedPhotos = loadFromLocalStorage<FamilyPhoto[]>(FAMILY_ALBUM_KEY) || [];
    const photosWithDates = storedPhotos.map(photo => ({
      ...photo,
      timestamp: new Date(photo.timestamp)
    }));
    setPhotos(photosWithDates.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newPhotos: FamilyPhoto[] = [];

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newPhoto: FamilyPhoto = {
          id: `${Date.now()}-${Math.random()}`,
          imageData: reader.result as string,
          timestamp: new Date()
        };
        newPhotos.push(newPhoto);

        if (newPhotos.length === files.length) {
          const updatedPhotos = [...photos, ...newPhotos].sort((a, b) => 
            b.timestamp.getTime() - a.timestamp.getTime()
          );
          setPhotos(updatedPhotos);
          saveToLocalStorage(FAMILY_ALBUM_KEY, updatedPhotos);
          toast.success(`${files.length} photo${files.length > 1 ? 's' : ''} added!`);
          setShowUploadDialog(false);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const deletePhoto = (photoId: string) => {
    const updatedPhotos = photos.filter(p => p.id !== photoId);
    setPhotos(updatedPhotos);
    saveToLocalStorage(FAMILY_ALBUM_KEY, updatedPhotos);
    toast.success("Photo deleted");
    setSelectedPhoto(null);
  };

  const downloadPhoto = (photoId: string) => {
    const photo = photos.find(p => p.id === photoId);
    if (!photo) return;
    
    const link = document.createElement('a');
    link.href = photo.imageData;
    link.download = `family-${format(photo.timestamp, 'yyyy-MM-dd-HHmm')}.jpg`;
    link.click();
    toast.success("Photo downloaded");
  };

  const openCaptionEditor = (photoId: string) => {
    const photo = photos.find(p => p.id === photoId);
    setEditingCaption(photoId);
    setCaptionText(photo?.caption || "");
  };

  const saveCaption = () => {
    if (!editingCaption) return;

    const updatedPhotos = photos.map(photo =>
      photo.id === editingCaption
        ? { ...photo, caption: captionText }
        : photo
    );
    setPhotos(updatedPhotos);
    saveToLocalStorage(FAMILY_ALBUM_KEY, updatedPhotos);
    toast.success("Caption saved!");
    setEditingCaption(null);
    setCaptionText("");
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
    saveToLocalStorage(FAMILY_ALBUM_KEY, updatedPhotos);
    setEditingPhoto(null);
    toast.success("Photo edits saved!");
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
    saveToLocalStorage(FAMILY_ALBUM_KEY, updatedPhotos);
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
    saveToLocalStorage(FAMILY_ALBUM_KEY, updatedPhotos);
    toast.success("Tag removed!");
  };

  const getAllTags = (): string[] => {
    const tags = new Set<string>();
    photos.forEach(photo => {
      photo.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  };

  const filterPhotos = (): FamilyPhoto[] => {
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

  const getPhotoStyle = (photo: FamilyPhoto) => {
    if (!photo.filters) return {};
    return {
      filter: `brightness(${photo.filters.brightness}%) contrast(${photo.filters.contrast}%) saturate(${photo.filters.saturation}%)`
    };
  };

  const addWatermarkToImage = (imageData: string, text: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) {
          resolve(imageData);
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(imageData);
          return;
        }

        ctx.drawImage(img, 0, 0);

        const fontSize = Math.max(20, img.height / 30);
        ctx.font = `${fontSize}px Arial`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.lineWidth = 2;
        
        const padding = 20;
        const textWidth = ctx.measureText(text).width;
        const x = img.width - textWidth - padding;
        const y = img.height - padding;

        ctx.strokeText(text, x, y);
        ctx.fillText(text, x, y);

        resolve(canvas.toDataURL('image/jpeg', 0.9));
      };
      img.src = imageData;
    });
  };

  const prepareShareImage = async (photoId: string): Promise<Blob | null> => {
    const photo = photos.find(p => p.id === photoId);
    if (!photo) return null;

    let imageData = photo.imageData;

    if (shareWithWatermark) {
      const watermarkText = `${format(photo.timestamp, 'MMM d, yyyy')} 💗`;
      imageData = await addWatermarkToImage(photo.imageData, watermarkText);
    }

    const response = await fetch(imageData);
    return await response.blob();
  };

  const sharePhoto = async (photoId: string) => {
    try {
      const blob = await prepareShareImage(photoId);
      if (!blob) return;

      const photo = photos.find(p => p.id === photoId);
      const file = new File(
        [blob], 
        `family-${format(photo!.timestamp, 'yyyy-MM-dd')}.jpg`,
        { type: 'image/jpeg' }
      );

      const shareData = {
        files: [file],
        title: "Family Photo",
        text: shareMessage || `Family moment - ${format(photo!.timestamp, 'MMMM d, yyyy')} 💗`
      };

      if (navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        toast.success("Shared successfully!");
      } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `family-${format(photo!.timestamp, 'yyyy-MM-dd')}.jpg`;
        link.click();
        URL.revokeObjectURL(url);
        toast.success("Image downloaded for sharing!");
      }
    } catch (error) {
      console.error("Error sharing:", error);
      toast.error("Failed to share photo");
    }
    setSharingPhoto(null);
  };

  const createAlbumCollage = async (): Promise<Blob | null> => {
    if (photos.length === 0) return null;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const cols = Math.min(4, photos.length);
    const rows = Math.ceil(photos.length / cols);
    const cellSize = 400;
    const padding = 10;

    canvas.width = cols * (cellSize + padding) + padding;
    canvas.height = rows * (cellSize + padding) + padding + 80;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = 'bold 48px Arial';
    ctx.fillStyle = '#eb4899';
    ctx.textAlign = 'center';
    ctx.fillText('Family Album', canvas.width / 2, 60);

    const imagePromises = photos.slice(0, cols * rows).map((photo, index) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
          const col = index % cols;
          const row = Math.floor(index / cols);
          const x = col * (cellSize + padding) + padding;
          const y = row * (cellSize + padding) + padding + 80;

          ctx.drawImage(img, x, y, cellSize, cellSize);

          ctx.font = 'bold 18px Arial';
          ctx.fillStyle = '#ffffff';
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 3;
          ctx.textAlign = 'center';
          const labelText = format(photo.timestamp, 'MMM d, yyyy');
          ctx.strokeText(labelText, x + cellSize / 2, y + cellSize - 20);
          ctx.fillText(labelText, x + cellSize / 2, y + cellSize - 20);

          resolve();
        };
        img.src = photo.imageData;
      });
    });

    await Promise.all(imagePromises);

    if (shareWithWatermark) {
      ctx.font = '20px Arial';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.textAlign = 'center';
      ctx.fillText('Created with love 💗', canvas.width / 2, canvas.height - 20);
    }

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.9);
    });
  };

  const shareAlbum = async () => {
    try {
      toast("Creating album collage...");
      const blob = await createAlbumCollage();
      if (!blob) {
        toast.error("No photos to share");
        return;
      }

      const file = new File([blob], "family-album.jpg", { type: 'image/jpeg' });

      const shareData = {
        files: [file],
        title: "Family Album",
        text: shareMessage || "Our family's precious moments 💗"
      };

      if (navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        toast.success("Album shared successfully!");
      } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = "family-album.jpg";
        link.click();
        URL.revokeObjectURL(url);
        toast.success("Album collage downloaded for sharing!");
      }
    } catch (error) {
      console.error("Error sharing album:", error);
      toast.error("Failed to share album");
    }
    setSharingPhoto(null);
  };

  const exportToPDF = async () => {
    toast("Generating PDF album...");
    
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPosition = 20;

    pdf.setFontSize(24);
    pdf.text("Family Album", pageWidth / 2, yPosition, { align: "center" });
    yPosition += 20;
    pdf.setFontSize(12);
    pdf.text("Precious Memories", pageWidth / 2, yPosition, { align: "center" });
    
    pdf.addPage();
    yPosition = 20;

    for (const photo of photos) {
      if (yPosition > pageHeight - 100) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.setFontSize(14);
      pdf.text(format(photo.timestamp, 'MMMM d, yyyy - h:mm a'), 20, yPosition);
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

    pdf.save("family-album.pdf");
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

    const confirmed = window.confirm(`Delete ${selectedPhotos.size} photo(s)?`);
    if (!confirmed) return;

    const updatedPhotos = photos.filter(p => !selectedPhotos.has(p.id));
    setPhotos(updatedPhotos);
    saveToLocalStorage(FAMILY_ALBUM_KEY, updatedPhotos);

    toast.success(`${selectedPhotos.size} photo(s) deleted`);
    setSelectionMode(false);
    setSelectedPhotos(new Set());
  };

  const analyzeFaces = async () => {
    setIsAnalyzingFaces(true);
    toast("Analyzing faces in photos...");

    try {
      const results: PhotoWithFaces[] = [];

      for (const photo of photos) {
        const faces = await detectFacesInImage(photo.imageData);
        if (faces.length > 0) {
          results.push({
            id: photo.id,
            imageData: photo.imageData,
            faces,
          });
        }
      }

      setPhotosWithFaces(results);
      setShowFaceGroups(true);
      toast.success(`Detected faces in ${results.length} photos`);
    } catch (error) {
      console.error("Face analysis error:", error);
      toast.error("Failed to analyze faces");
    } finally {
      setIsAnalyzingFaces(false);
    }
  };

  const handleFaceGroupPhotoClick = (photoId: string) => {
    setSelectedPhoto(photoId);
    setShowFaceGroups(false);
  };

  const filteredPhotos = filterPhotos();
  const groupedByDate = filteredPhotos.reduce((acc, photo) => {
    const dateKey = format(photo.timestamp, 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(photo);
    return acc;
  }, {} as Record<string, FamilyPhoto[]>);

  if (showFaceGroups) {
    return (
      <FaceGroupsView
        photos={photosWithFaces}
        onClose={() => setShowFaceGroups(false)}
        onPhotoClick={handleFaceGroupPhotoClick}
        albumType="baby"
      />
    );
  }

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
              <h2 className="text-xl font-semibold">Family Album</h2>
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
                    onClick={analyzeFaces}
                    disabled={isAnalyzingFaces || photos.length === 0}
                    className="gap-2"
                  >
                    <Users className="w-4 h-4" />
                    {isAnalyzingFaces ? "Analyzing..." : "Faces"}
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
                    variant="outline"
                    size="sm"
                    onClick={() => openShareDialog("album")}
                    className="gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
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
              <h3 className="text-lg font-semibold mb-2">No Photos Yet</h3>
              <p className="text-muted-foreground mb-4">Start building your family album</p>
              <Button onClick={() => setShowUploadDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Photo
              </Button>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedByDate).map(([dateKey, dayPhotos]) => (
                <div key={dateKey}>
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    {format(new Date(dateKey), 'EEEE, MMMM d, yyyy')}
                    <span className="text-sm text-muted-foreground">({dayPhotos.length} photo{dayPhotos.length > 1 ? 's' : ''})</span>
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
                            alt={format(photo.timestamp, 'MMM d, yyyy')}
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
                                  title="Edit caption"
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
                                  title="Edit photo"
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
                                    openShareDialog(photo.id);
                                  }}
                                  title="Share photo"
                                >
                                  <Share2 className="w-4 h-4" />
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
            <DialogTitle>Add Photos</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Label htmlFor="photo-upload">Select photos to upload (multiple allowed)</Label>
            <Input
              id="photo-upload"
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Caption Editor */}
      <Dialog open={editingCaption !== null} onOpenChange={() => setEditingCaption(null)}>
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
            <Button onClick={saveCaption}>Save Caption</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Photo Editor */}
      <Dialog open={editingPhoto !== null} onOpenChange={() => setEditingPhoto(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Photo</DialogTitle>
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

      {/* Share Dialog */}
      <Dialog open={sharingPhoto !== null} onOpenChange={() => setSharingPhoto(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share {sharingPhoto === "album" ? "Album" : "Photo"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="watermark"
                checked={shareWithWatermark}
                onChange={(e) => setShareWithWatermark(e.target.checked)}
              />
              <Label htmlFor="watermark">Add watermark</Label>
            </div>
            <Textarea
              value={shareMessage}
              onChange={(e) => setShareMessage(e.target.value)}
              placeholder="Add a message (optional)"
              rows={3}
            />
            <Button
              onClick={() => sharingPhoto === "album" ? shareAlbum() : sharePhoto(sharingPhoto as string)}
            >
              Share
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};