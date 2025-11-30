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
    } = {}
  ) => {
    try {
      await saveAlbumPhoto(base64Data, albumType, options);
      toast.success('Photo saved instantly!');
      await loadPhotos(); // Reload to show new photo
    } catch (error) {
      console.error('Error saving photo:', error);
      toast.error('Failed to save photo');
    }
  };

  const removePhoto = async (photoId: string) => {
    try {
      await deleteAlbumPhoto(photoId, albumType);
      toast.success('Photo deleted');
      await loadPhotos(); // Reload after deletion
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast.error('Failed to delete photo');
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
      toast.success('Photo updated');
      await loadPhotos(); // Reload to show updates
    } catch (error) {
      console.error('Error updating photo:', error);
      toast.error('Failed to update photo');
    }
  };

  return {
    photos,
    isLoading,
    addPhoto,
    removePhoto,
    updatePhoto,
    reload: loadPhotos
  };
}
