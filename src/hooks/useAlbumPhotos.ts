// Custom hook for managing album photos with filesystem storage
import { useState, useEffect } from 'react';
import { 
  saveAlbumPhoto, 
  loadAlbumPhotos, 
  deleteAlbumPhoto, 
  updateAlbumPhoto,
  getAlbumPhotoWithData,
  AlbumType 
} from '@/lib/albumStorage';
import { toast } from 'sonner';

interface AlbumPhoto {
  id: string;
  imageData: string;
  week?: number;
  caption?: string;
  tags?: string[];
  timestamp: Date;
  mediaType?: 'image' | 'video';
  duration?: number;
}

export function useAlbumPhotos(albumType: AlbumType, week?: number) {
  const [photos, setPhotos] = useState<AlbumPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadPhotos = async () => {
    setIsLoading(true);
    try {
      const albumPhotos = await loadAlbumPhotos(albumType, week);
      
      // Load image data for each photo
      const photosWithData: AlbumPhoto[] = [];
      for (const photo of albumPhotos) {
        const photoData = await getAlbumPhotoWithData(photo.id, albumType);
        if (photoData) {
          photosWithData.push({
            id: photo.id,
            imageData: photoData.imageData,
            week: photo.week,
            caption: photo.caption,
            tags: photo.tags,
            timestamp: photo.timestamp
          });
        }
      }
      
      setPhotos(photosWithData);
    } catch (error) {
      console.error('Error loading album photos:', error);
      toast.error('Failed to load photos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPhotos();
  }, [albumType, week]);

  const addPhoto = async (
    base64Data: string,
    options: {
      week?: number;
      caption?: string;
      tags?: string[];
      mediaType?: 'image' | 'video';
      duration?: number;
    } = {}
  ) => {
    try {
      await saveAlbumPhoto(base64Data, albumType, options);
      const mediaLabel = options.mediaType === 'video' ? 'Video' : 'Photo';
      toast.success(`${mediaLabel} saved instantly!`);
      await loadPhotos(); // Reload to show new media
    } catch (error) {
      console.error('Error saving media:', error);
      toast.error('Failed to save media');
    }
  };

  const addPhotoBatch = async (
    files: FileList | File[],
    options: {
      week?: number;
      caption?: string;
      tags?: string[];
    } = {}
  ) => {
    const fileArray = Array.from(files);
    let successCount = 0;
    let failCount = 0;

    toast.info(`Uploading ${fileArray.length} file${fileArray.length > 1 ? 's' : ''}...`);

    for (const file of fileArray) {
      try {
        const isVideo = file.type.startsWith('video/');
        const mediaType = isVideo ? 'video' : 'image';
        
        // Get video duration if it's a video
        let duration: number | undefined;
        if (isVideo) {
          duration = await getVideoDuration(file);
        }

        const base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        await saveAlbumPhoto(base64Data, albumType, { ...options, mediaType, duration });
        successCount++;
      } catch (error) {
        console.error('Error saving file:', error);
        failCount++;
      }
    }

    if (successCount > 0) {
      toast.success(`${successCount} file${successCount > 1 ? 's' : ''} saved instantly!`);
    }
    if (failCount > 0) {
      toast.error(`Failed to save ${failCount} file${failCount > 1 ? 's' : ''}`);
    }

    await loadPhotos(); // Reload to show new files
  };

  // Helper function to get video duration
  const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        resolve(Math.round(video.duration));
      };
      video.onerror = () => resolve(0);
      video.src = URL.createObjectURL(file);
    });
  };

  const removePhoto = async (photoId: string) => {
    try {
      await deleteAlbumPhoto(photoId, albumType);
      toast.success('Media deleted');
      await loadPhotos(); // Reload after deletion
    } catch (error) {
      console.error('Error deleting media:', error);
      toast.error('Failed to delete media');
    }
  };

  const updatePhoto = async (
    photoId: string,
    updates: {
      caption?: string;
      tags?: string[];
    }
  ) => {
    try {
      await updateAlbumPhoto(photoId, updates);
      toast.success('Media updated');
      await loadPhotos(); // Reload to show updates
    } catch (error) {
      console.error('Error updating media:', error);
      toast.error('Failed to update media');
    }
  };

  return {
    photos,
    isLoading,
    addPhoto,
    addPhotoBatch,
    removePhoto,
    updatePhoto,
    reload: loadPhotos
  };
}
