import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Plus, Trash2, Download, Baby, Filter, MessageSquare, Mic, Camera, ArrowLeftRight, Play, Pause, Edit, Tag, FileDown, Share2, CheckSquare, Square, MoveRight } from "lucide-react";
import { saveToLocalStorage, loadFromLocalStorage } from "@/lib/storage";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BumpPhotoComparison } from "./BumpPhotoComparison";
import { Slider } from "@/components/ui/slider";
import jsPDF from "jspdf";

interface WeekPhoto {
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
  const [isSlideshow, setIsSlideshow] = useState(false);
  const [currentSlideWeek, setCurrentSlideWeek] = useState<number>(1);
  const [editingPhoto, setEditingPhoto] = useState<number | "baby" | null>(null);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [tagInput, setTagInput] = useState("");
  const [editingTags, setEditingTags] = useState<number | "baby" | null>(null);
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [sharingPhoto, setSharingPhoto] = useState<number | "baby" | "gallery" | null>(null);
  const [shareWithWatermark, setShareWithWatermark] = useState(true);
  const [shareMessage, setShareMessage] = useState("");
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedWeeks, setSelectedWeeks] = useState<Set<number>>(new Set());
  const [selectedBabyPhoto, setSelectedBabyPhoto] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!isSlideshow) return;
    
    const weeksWithPhotos = Object.keys(weekPhotos).map(w => parseInt(w)).sort((a, b) => a - b);
    if (weeksWithPhotos.length === 0) {
      setIsSlideshow(false);
      return;
    }

    const currentIndex = weeksWithPhotos.indexOf(currentSlideWeek);
    const nextIndex = (currentIndex + 1) % weeksWithPhotos.length;
    
    const timer = setTimeout(() => {
      setCurrentSlideWeek(weeksWithPhotos[nextIndex]);
    }, 3000);

    return () => clearTimeout(timer);
  }, [isSlideshow, currentSlideWeek, weekPhotos]);

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
    let passesFilter = true;
    if (filterType === "photos") passesFilter = !!weekPhotos[week];
    else if (filterType === "notes") passesFilter = !!weekNotes[week];
    else if (filterType === "voice") passesFilter = !!weekVoiceNotes[week];
    
    if (!passesFilter) return false;
    
    if (tagFilter && weekPhotos[week]) {
      return weekPhotos[week].tags?.includes(tagFilter) || false;
    }
    
    return filterType === "all" || passesFilter;
  };

  const startSlideshow = () => {
    const weeksWithPhotos = Object.keys(weekPhotos).map(w => parseInt(w)).sort((a, b) => a - b);
    if (weeksWithPhotos.length > 0) {
      setCurrentSlideWeek(weeksWithPhotos[0]);
      setIsSlideshow(true);
    }
  };

  const openPhotoEditor = (target: number | "baby") => {
    const photo = target === "baby" ? babyPhoto : weekPhotos[target];
    if (!photo) return;
    
    setEditingPhoto(target);
    setBrightness(photo.filters?.brightness || 100);
    setContrast(photo.filters?.contrast || 100);
    setSaturation(photo.filters?.saturation || 100);
  };

  const applyPhotoEdits = () => {
    if (editingPhoto === null) return;

    const filters = { brightness, contrast, saturation };

    if (editingPhoto === "baby" && babyPhoto) {
      const updatedPhoto = { ...babyPhoto, filters };
      setBabyPhoto(updatedPhoto);
      saveToLocalStorage(BABY_BORN_PHOTO_KEY, updatedPhoto);
    } else if (typeof editingPhoto === "number") {
      const updatedPhotos = {
        ...weekPhotos,
        [editingPhoto]: { ...weekPhotos[editingPhoto], filters }
      };
      setWeekPhotos(updatedPhotos);
      saveToLocalStorage(PREGNANCY_PHOTOS_KEY, updatedPhotos);
    }
    
    setEditingPhoto(null);
    toast.success("Photo edits saved!");
  };

  const openTagEditor = (target: number | "baby") => {
    setEditingTags(target);
    setTagInput("");
  };

  const addTag = () => {
    if (!tagInput.trim() || editingTags === null) return;

    if (editingTags === "baby" && babyPhoto) {
      const updatedPhoto = { 
        ...babyPhoto, 
        tags: [...(babyPhoto.tags || []), tagInput.trim()] 
      };
      setBabyPhoto(updatedPhoto);
      saveToLocalStorage(BABY_BORN_PHOTO_KEY, updatedPhoto);
    } else if (typeof editingTags === "number") {
      const updatedPhotos = {
        ...weekPhotos,
        [editingTags]: { 
          ...weekPhotos[editingTags], 
          tags: [...(weekPhotos[editingTags].tags || []), tagInput.trim()] 
        }
      };
      setWeekPhotos(updatedPhotos);
      saveToLocalStorage(PREGNANCY_PHOTOS_KEY, updatedPhotos);
    }
    
    setTagInput("");
    toast.success("Tag added!");
  };

  const removeTag = (target: number | "baby", tag: string) => {
    if (target === "baby" && babyPhoto) {
      const updatedPhoto = { 
        ...babyPhoto, 
        tags: babyPhoto.tags?.filter(t => t !== tag) 
      };
      setBabyPhoto(updatedPhoto);
      saveToLocalStorage(BABY_BORN_PHOTO_KEY, updatedPhoto);
    } else if (typeof target === "number") {
      const updatedPhotos = {
        ...weekPhotos,
        [target]: { 
          ...weekPhotos[target], 
          tags: weekPhotos[target].tags?.filter(t => t !== tag) 
        }
      };
      setWeekPhotos(updatedPhotos);
      saveToLocalStorage(PREGNANCY_PHOTOS_KEY, updatedPhotos);
    }
    toast.success("Tag removed!");
  };

  const getAllTags = (): string[] => {
    const tags = new Set<string>();
    Object.values(weekPhotos).forEach(photo => {
      photo.tags?.forEach(tag => tags.add(tag));
    });
    if (babyPhoto?.tags) {
      babyPhoto.tags.forEach(tag => tags.add(tag));
    }
    return Array.from(tags);
  };

  const exportToPDF = async () => {
    toast("Generating PDF memory book...");
    
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPosition = 20;

    // Title page
    pdf.setFontSize(24);
    pdf.text("My Pregnancy Journey", pageWidth / 2, yPosition, { align: "center" });
    yPosition += 20;
    pdf.setFontSize(12);
    pdf.text("A Week-by-Week Memory Book", pageWidth / 2, yPosition, { align: "center" });
    
    pdf.addPage();
    yPosition = 20;

    // Add each week with photo
    for (let week = 1; week <= 40; week++) {
      const photo = weekPhotos[week];
      if (!photo) continue;

      // Add new page if needed
      if (yPosition > pageHeight - 80) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.setFontSize(16);
      pdf.text(`Week ${week}`, 20, yPosition);
      yPosition += 10;

      // Add photo
      try {
        const img = new Image();
        img.src = photo.imageData;
        await new Promise(resolve => { img.onload = resolve; });
        
        const imgWidth = 80;
        const imgHeight = 80;
        pdf.addImage(photo.imageData, "JPEG", 20, yPosition, imgWidth, imgHeight);
        yPosition += imgHeight + 10;
      } catch (error) {
        console.error("Error adding image:", error);
      }

      // Add caption
      if (photo.caption) {
        pdf.setFontSize(10);
        const lines = pdf.splitTextToSize(photo.caption, pageWidth - 40);
        pdf.text(lines, 20, yPosition);
        yPosition += lines.length * 5 + 5;
      }

      // Add tags
      if (photo.tags && photo.tags.length > 0) {
        pdf.setFontSize(9);
        pdf.text(`Tags: ${photo.tags.join(", ")}`, 20, yPosition);
        yPosition += 8;
      }

      // Add notes
      if (weekNotes[week]) {
        pdf.setFontSize(10);
        pdf.text("Notes:", 20, yPosition);
        yPosition += 5;
        const noteLines = pdf.splitTextToSize(weekNotes[week], pageWidth - 40);
        pdf.text(noteLines, 20, yPosition);
        yPosition += noteLines.length * 5 + 10;
      }

      yPosition += 10;
    }

    // Add baby photo if exists
    if (babyPhoto) {
      pdf.addPage();
      pdf.setFontSize(20);
      pdf.text("Baby Born!", pageWidth / 2, 20, { align: "center" });
      
      try {
        const img = new Image();
        img.src = babyPhoto.imageData;
        await new Promise(resolve => { img.onload = resolve; });
        
        pdf.addImage(babyPhoto.imageData, "JPEG", 20, 40, 170, 120);
        
        if (babyPhoto.caption) {
          pdf.setFontSize(12);
          const lines = pdf.splitTextToSize(babyPhoto.caption, pageWidth - 40);
          pdf.text(lines, 20, 170);
        }
      } catch (error) {
        console.error("Error adding baby image:", error);
      }
    }

    pdf.save("pregnancy-memory-book.pdf");
    toast.success("PDF exported successfully!");
  };

  const getPhotoStyle = (photo: WeekPhoto) => {
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

        // Draw original image
        ctx.drawImage(img, 0, 0);

        // Add watermark
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

  const prepareShareImage = async (target: number | "baby"): Promise<Blob | null> => {
    const photo = target === "baby" ? babyPhoto : weekPhotos[target];
    if (!photo) return null;

    let imageData = photo.imageData;

    // Apply watermark if enabled
    if (shareWithWatermark) {
      const watermarkText = target === "baby" 
        ? "My Baby Born 💗" 
        : `Week ${target} Bump 💗`;
      imageData = await addWatermarkToImage(photo.imageData, watermarkText);
    }

    // Convert to blob
    const response = await fetch(imageData);
    return await response.blob();
  };

  const sharePhoto = async (target: number | "baby") => {
    try {
      const blob = await prepareShareImage(target);
      if (!blob) return;

      const file = new File(
        [blob], 
        target === "baby" ? "baby-born.jpg" : `bump-week-${target}.jpg`,
        { type: 'image/jpeg' }
      );

      const shareData = {
        files: [file],
        title: target === "baby" ? "My Baby Born!" : `Week ${target} Bump Photo`,
        text: shareMessage || (target === "baby" ? "Meet my baby! 💗" : `My pregnancy journey - Week ${target} 💗`)
      };

      if (navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        toast.success("Shared successfully!");
      } else {
        // Fallback: download the image
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = target === "baby" ? "baby-born.jpg" : `bump-week-${target}.jpg`;
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

  const createGalleryCollage = async (): Promise<Blob | null> => {
    const photosWithData = Object.entries(weekPhotos)
      .filter(([_, photo]) => photo)
      .sort(([weekA], [weekB]) => parseInt(weekA) - parseInt(weekB));

    if (photosWithData.length === 0) return null;

    // Create canvas for collage
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Calculate grid layout
    const cols = Math.min(4, photosWithData.length);
    const rows = Math.ceil(photosWithData.length / cols);
    const cellSize = 400;
    const padding = 10;

    canvas.width = cols * (cellSize + padding) + padding;
    canvas.height = rows * (cellSize + padding) + padding + 80; // Extra space for title

    // Fill background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add title
    ctx.font = 'bold 48px Arial';
    ctx.fillStyle = '#eb4899';
    ctx.textAlign = 'center';
    ctx.fillText('My Pregnancy Journey', canvas.width / 2, 60);

    // Load and draw images
    const imagePromises = photosWithData.map(([week, photo], index) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
          const col = index % cols;
          const row = Math.floor(index / cols);
          const x = col * (cellSize + padding) + padding;
          const y = row * (cellSize + padding) + padding + 80;

          // Draw image
          ctx.drawImage(img, x, y, cellSize, cellSize);

          // Draw week label
          ctx.font = 'bold 24px Arial';
          ctx.fillStyle = '#ffffff';
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 3;
          ctx.textAlign = 'center';
          const labelText = `Week ${week}`;
          ctx.strokeText(labelText, x + cellSize / 2, y + cellSize - 20);
          ctx.fillText(labelText, x + cellSize / 2, y + cellSize - 20);

          resolve();
        };
        img.src = photo.imageData;
      });
    });

    await Promise.all(imagePromises);

    // Add watermark if enabled
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

  const shareGallery = async () => {
    try {
      toast("Creating gallery collage...");
      const blob = await createGalleryCollage();
      if (!blob) {
        toast.error("No photos to share");
        return;
      }

      const file = new File([blob], "pregnancy-journey.jpg", { type: 'image/jpeg' });

      const shareData = {
        files: [file],
        title: "My Pregnancy Journey",
        text: shareMessage || "My complete pregnancy journey - 40 weeks of memories 💗"
      };

      if (navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        toast.success("Gallery shared successfully!");
      } else {
        // Fallback: download the collage
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = "pregnancy-journey.jpg";
        link.click();
        URL.revokeObjectURL(url);
        toast.success("Gallery collage downloaded for sharing!");
      }
    } catch (error) {
      console.error("Error sharing gallery:", error);
      toast.error("Failed to share gallery");
    }
    setSharingPhoto(null);
  };

  const openShareDialog = (target: number | "baby" | "gallery") => {
    setSharingPhoto(target);
    setShareMessage("");
  };

  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    setSelectedWeeks(new Set());
    setSelectedBabyPhoto(false);
  };

  const toggleWeekSelection = (week: number) => {
    const newSelected = new Set(selectedWeeks);
    if (newSelected.has(week)) {
      newSelected.delete(week);
    } else {
      newSelected.add(week);
    }
    setSelectedWeeks(newSelected);
  };

  const selectAll = () => {
    const allWeeks = new Set<number>();
    for (let week = 1; week <= 40; week++) {
      if (weekPhotos[week]) {
        allWeeks.add(week);
      }
    }
    setSelectedWeeks(allWeeks);
    if (babyPhoto) {
      setSelectedBabyPhoto(true);
    }
  };

  const deselectAll = () => {
    setSelectedWeeks(new Set());
    setSelectedBabyPhoto(false);
  };

  const deleteSelected = () => {
    if (selectedWeeks.size === 0 && !selectedBabyPhoto) return;

    const confirmed = window.confirm(
      `Delete ${selectedWeeks.size + (selectedBabyPhoto ? 1 : 0)} photo(s)?`
    );
    
    if (!confirmed) return;

    // Delete selected week photos
    const updatedPhotos = { ...weekPhotos };
    selectedWeeks.forEach(week => {
      delete updatedPhotos[week];
    });
    setWeekPhotos(updatedPhotos);
    saveToLocalStorage(PREGNANCY_PHOTOS_KEY, updatedPhotos);

    // Delete baby photo if selected
    if (selectedBabyPhoto) {
      setBabyPhoto(null);
      localStorage.removeItem(BABY_BORN_PHOTO_KEY);
    }

    toast.success(`${selectedWeeks.size + (selectedBabyPhoto ? 1 : 0)} photo(s) deleted`);
    setSelectionMode(false);
    setSelectedWeeks(new Set());
    setSelectedBabyPhoto(false);
  };

  const moveToBabyAlbum = () => {
    if (selectedWeeks.size === 0 && !selectedBabyPhoto) return;

    const confirmed = window.confirm(
      `Move ${selectedWeeks.size + (selectedBabyPhoto ? 1 : 0)} photo(s) to Baby Album?`
    );
    
    if (!confirmed) return;

    // Load existing baby album photos
    const existingBabyPhotos = loadFromLocalStorage<Array<{
      id: string;
      imageData: string;
      timestamp: Date;
      caption?: string;
      tags?: string[];
      filters?: { brightness: number; contrast: number; saturation: number };
    }>>("baby-album-photos") || [];

    // Convert selected photos to baby album format
    const newBabyPhotos: any[] = [];

    selectedWeeks.forEach(week => {
      const photo = weekPhotos[week];
      if (photo) {
        newBabyPhotos.push({
          id: `${Date.now()}-${week}-${Math.random()}`,
          imageData: photo.imageData,
          timestamp: photo.timestamp,
          caption: photo.caption || `Week ${week}`,
          tags: photo.tags || [],
          filters: photo.filters
        });
      }
    });

    if (selectedBabyPhoto && babyPhoto) {
      newBabyPhotos.push({
        id: `${Date.now()}-baby-${Math.random()}`,
        imageData: babyPhoto.imageData,
        timestamp: babyPhoto.timestamp,
        caption: babyPhoto.caption || "Baby Born",
        tags: babyPhoto.tags || [],
        filters: babyPhoto.filters
      });
    }

    // Save to baby album
    const updatedBabyAlbum = [...existingBabyPhotos, ...newBabyPhotos].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    saveToLocalStorage("baby-album-photos", updatedBabyAlbum);

    // Delete from bump gallery
    const updatedPhotos = { ...weekPhotos };
    selectedWeeks.forEach(week => {
      delete updatedPhotos[week];
    });
    setWeekPhotos(updatedPhotos);
    saveToLocalStorage(PREGNANCY_PHOTOS_KEY, updatedPhotos);

    if (selectedBabyPhoto) {
      setBabyPhoto(null);
      localStorage.removeItem(BABY_BORN_PHOTO_KEY);
    }

    toast.success(`${newBabyPhotos.length} photo(s) moved to Baby Album`);
    setSelectionMode(false);
    setSelectedWeeks(new Set());
    setSelectedBabyPhoto(false);
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
        className={`relative aspect-square bg-background border-2 rounded-lg overflow-hidden cursor-pointer transition-colors ${
          selectionMode && selectedWeeks.has(week)
            ? 'border-primary ring-2 ring-primary'
            : 'border-border hover:border-primary'
        }`}
        onClick={() => {
          if (selectionMode) {
            toggleWeekSelection(week);
          } else {
            setSelectedWeek(isSelected ? null : week);
          }
        }}
      >
        {photo ? (
          <>
            <img 
              src={photo.imageData} 
              alt={`Week ${week}`}
              className="w-full h-full object-cover"
              style={getPhotoStyle(photo)}
            />
            {selectionMode && (
              <div className="absolute top-2 left-2 z-10">
                <div className={`w-6 h-6 rounded flex items-center justify-center ${
                  selectedWeeks.has(week) ? 'bg-primary text-white' : 'bg-white/90 text-gray-600'
                }`}>
                  {selectedWeeks.has(week) ? (
                    <CheckSquare className="w-4 h-4" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </div>
              </div>
            )}
            {badges.length > 0 && !isSelected && !selectionMode && (
              <div className="absolute top-2 right-2 flex gap-1">
                {badges.map((badge, idx) => (
                  <div key={idx} className="bg-white/90 rounded-full p-1">
                    <badge.icon className={`w-3 h-3 ${badge.color}`} />
                  </div>
                ))}
              </div>
            )}
            {photo.caption && !isSelected && !selectionMode && (
              <div className="absolute bottom-8 left-0 right-0 bg-black/70 text-white text-xs p-2 line-clamp-2">
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
                      openPhotoEditor(week);
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
                      openTagEditor(week);
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
                      openShareDialog(week);
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
            <div className="flex gap-2">
              {!selectionMode ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowComparison(true)}
                    className="gap-2"
                  >
                    <ArrowLeftRight className="w-4 h-4" />
                    Compare
                  </Button>
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
                    variant="outline"
                    size="sm"
                    onClick={() => openShareDialog("gallery")}
                    className="gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
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
                    variant="outline"
                    size="sm"
                    onClick={moveToBabyAlbum}
                    disabled={selectedWeeks.size === 0 && !selectedBabyPhoto}
                    className="gap-2"
                  >
                    <MoveRight className="w-4 h-4" />
                    Move ({selectedWeeks.size + (selectedBabyPhoto ? 1 : 0)})
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={deleteSelected}
                    disabled={selectedWeeks.size === 0 && !selectedBabyPhoto}
                    className="gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete ({selectedWeeks.size + (selectedBabyPhoto ? 1 : 0)})
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
          {/* Baby Born Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Baby className="w-5 h-5 text-pink-500" />
              Baby Born Photo
            </h3>
            <div 
              className={`relative aspect-video max-w-md bg-background border-2 rounded-lg overflow-hidden cursor-pointer transition-colors ${
                selectionMode && selectedBabyPhoto
                  ? 'border-primary ring-2 ring-primary'
                  : 'border-border hover:border-primary'
              }`}
              onClick={() => {
                if (selectionMode) {
                  setSelectedBabyPhoto(!selectedBabyPhoto);
                } else {
                  setSelectedWeek(selectedWeek === "baby" ? null : "baby");
                }
              }}
            >
              {babyPhoto ? (
                <>
                  <img 
                    src={babyPhoto.imageData} 
                    alt="Baby Born"
                    className="w-full h-full object-cover"
                    style={getPhotoStyle(babyPhoto)}
                  />
                  {selectionMode && (
                    <div className="absolute top-2 left-2 z-10">
                      <div className={`w-6 h-6 rounded flex items-center justify-center ${
                        selectedBabyPhoto ? 'bg-primary text-white' : 'bg-white/90 text-gray-600'
                      }`}>
                        {selectedBabyPhoto ? (
                          <CheckSquare className="w-4 h-4" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </div>
                    </div>
                  )}
                  {babyPhoto.caption && selectedWeek !== "baby" && !selectionMode && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-sm p-3 line-clamp-2">
                      {babyPhoto.caption}
                    </div>
                  )}
                  {selectedWeek === "baby" && !selectionMode && (
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
                          openPhotoEditor("baby");
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
                          openTagEditor("baby");
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
                          openShareDialog("baby");
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

      {/* Photo Editor Dialog */}
      <Dialog open={editingPhoto !== null} onOpenChange={() => setEditingPhoto(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Edit Photo {editingPhoto === "baby" ? "- Baby Born" : `- Week ${editingPhoto}`}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {editingPhoto !== null && (
              <div className="relative w-full h-64 bg-muted rounded-lg overflow-hidden">
                <img
                  src={editingPhoto === "baby" ? babyPhoto?.imageData : weekPhotos[editingPhoto as number]?.imageData}
                  alt="Preview"
                  className="w-full h-full object-contain"
                  style={{
                    filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`
                  }}
                />
              </div>
            )}
            <div className="space-y-4">
              <div>
                <Label>Brightness: {brightness}%</Label>
                <Slider
                  value={[brightness]}
                  onValueChange={(v) => setBrightness(v[0])}
                  min={0}
                  max={200}
                  step={1}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Contrast: {contrast}%</Label>
                <Slider
                  value={[contrast]}
                  onValueChange={(v) => setContrast(v[0])}
                  min={0}
                  max={200}
                  step={1}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Saturation: {saturation}%</Label>
                <Slider
                  value={[saturation]}
                  onValueChange={(v) => setSaturation(v[0])}
                  min={0}
                  max={200}
                  step={1}
                  className="mt-2"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={applyPhotoEdits} className="flex-1">
                Apply Edits
              </Button>
              <Button variant="outline" onClick={() => setEditingPhoto(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={sharingPhoto !== null} onOpenChange={() => setSharingPhoto(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Share {sharingPhoto === "gallery" ? "Gallery Collage" : sharingPhoto === "baby" ? "Baby Photo" : `Week ${sharingPhoto} Photo`}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="share-message">Message (optional)</Label>
              <Textarea
                id="share-message"
                placeholder="Add a message to share with your photo..."
                value={shareMessage}
                onChange={(e) => setShareMessage(e.target.value)}
                className="mt-2"
                rows={3}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="watermark"
                checked={shareWithWatermark}
                onChange={(e) => setShareWithWatermark(e.target.checked)}
                className="w-4 h-4"
              />
              <Label htmlFor="watermark" className="cursor-pointer">
                Add watermark (recommended for privacy)
              </Label>
            </div>
            <div className="bg-muted p-3 rounded-lg text-sm">
              <p className="font-semibold mb-1">Privacy Note:</p>
              <p className="text-muted-foreground">
                {shareWithWatermark 
                  ? "Watermark will be added to protect your photos when sharing online."
                  : "Photos will be shared without watermark. Consider adding one for privacy."}
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => sharingPhoto === "gallery" ? shareGallery() : sharePhoto(sharingPhoto as number | "baby")} 
                className="flex-1"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share Now
              </Button>
              <Button variant="outline" onClick={() => setSharingPhoto(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Tag Editor Dialog */}
      <Dialog open={editingTags !== null} onOpenChange={() => setEditingTags(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Manage Tags {editingTags === "baby" ? "- Baby Born" : `- Week ${editingTags}`}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Add tag (e.g., location, event)..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addTag()}
              />
              <Button onClick={addTag}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {editingTags !== null && (
                editingTags === "baby" 
                  ? babyPhoto?.tags?.map((tag) => (
                      <div key={tag} className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                        {tag}
                        <X 
                          className="w-3 h-3 cursor-pointer" 
                          onClick={() => removeTag("baby", tag)}
                        />
                      </div>
                    ))
                  : weekPhotos[editingTags as number]?.tags?.map((tag) => (
                      <div key={tag} className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                        {tag}
                        <X 
                          className="w-3 h-3 cursor-pointer" 
                          onClick={() => removeTag(editingTags as number, tag)}
                        />
                      </div>
                    ))
              )}
            </div>
            <Button variant="outline" onClick={() => setEditingTags(null)} className="w-full">
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Slideshow Modal */}
      {isSlideshow && (
        <div className="fixed inset-0 bg-black z-[60] flex items-center justify-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSlideshow(false)}
            className="absolute top-4 right-4 text-white hover:bg-white/20"
          >
            <X className="w-6 h-6" />
          </Button>
          <div className="relative w-full h-full flex items-center justify-center p-8">
            {weekPhotos[currentSlideWeek] && (
              <div className="relative max-w-4xl max-h-full">
                <img
                  src={weekPhotos[currentSlideWeek].imageData}
                  alt={`Week ${currentSlideWeek}`}
                  className="max-w-full max-h-[80vh] object-contain"
                  style={getPhotoStyle(weekPhotos[currentSlideWeek])}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-4">
                  <p className="text-xl font-semibold">Week {currentSlideWeek}</p>
                  {weekPhotos[currentSlideWeek].caption && (
                    <p className="text-sm mt-2">{weekPhotos[currentSlideWeek].caption}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Comparison Modal */}
      {showComparison && (
        <BumpPhotoComparison onClose={() => setShowComparison(false)} />
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
