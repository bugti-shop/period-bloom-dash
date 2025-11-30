// Unified album storage using the new photo storage system
import { savePhoto, loadPhoto, deletePhoto, updatePhotoMetadata, listPhotos } from './photoStorage';

export type AlbumType = 'bump' | 'baby' | 'family' | 'ultrasound';

interface AlbumPhoto {
  id: string;
  albumType: AlbumType;
  week?: number; // For bump and ultrasound albums
  caption?: string;
  tags?: string[];
  timestamp: Date;
  faceData?: any; // For family album
  mediaType?: 'image' | 'video'; // Photo or video
  duration?: number; // Video duration in seconds
}

// Save media (photo or video) to album - instant save
export async function saveAlbumPhoto(
  base64Data: string,
  albumType: AlbumType,
  options: {
    week?: number;
    caption?: string;
    tags?: string[];
    faceData?: any;
    mediaType?: 'image' | 'video';
    duration?: number;
  } = {}
): Promise<string> {
  const photoId = `${albumType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const albumTag = `album:${albumType}`;
  const allTags = [albumTag, ...(options.tags || [])];
  
  try {
    await savePhoto(base64Data, {
      id: photoId,
      timestamp: Date.now(),
      caption: options.caption,
      week: options.week,
      tags: allTags,
      mediaType: options.mediaType,
      duration: options.duration
    });
    
    // Store additional album-specific data in localStorage (small metadata only)
    if (options.faceData) {
      const albumData = loadAlbumData(albumType);
      albumData[photoId] = { faceData: options.faceData };
      saveAlbumData(albumType, albumData);
    }
    
    console.log(`Photo saved to ${albumType} album: ${photoId}`);
    return photoId;
  } catch (error) {
    console.error(`Error saving photo to ${albumType} album:`, error);
    throw error;
  }
}

// Load all photos from an album
export async function loadAlbumPhotos(
  albumType: AlbumType,
  week?: number
): Promise<AlbumPhoto[]> {
  try {
    const albumTag = `album:${albumType}`;
    const filter: any = { tags: [albumTag] };
    
    if (week !== undefined) {
      filter.week = week;
    }
    
    const photoMetadataList = await listPhotos(filter);
    const albumData = loadAlbumData(albumType);
    
    const photos: AlbumPhoto[] = [];
    
    for (const metadata of photoMetadataList) {
      const imageData = await loadPhoto(metadata.id);
      if (imageData) {
        photos.push({
          id: metadata.id,
          albumType,
          week: metadata.week,
          caption: metadata.caption,
          tags: metadata.tags?.filter(t => !t.startsWith('album:')),
          timestamp: new Date(metadata.timestamp),
          faceData: albumData[metadata.id]?.faceData,
          mediaType: metadata.mediaType || 'image',
          duration: metadata.duration
        });
      }
    }
    
    return photos.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  } catch (error) {
    console.error(`Error loading ${albumType} album photos:`, error);
    return [];
  }
}

// Update photo caption or tags
export async function updateAlbumPhoto(
  photoId: string,
  updates: {
    caption?: string;
    tags?: string[];
  }
): Promise<void> {
  try {
    await updatePhotoMetadata(photoId, updates);
    console.log(`Photo updated: ${photoId}`);
  } catch (error) {
    console.error('Error updating photo:', error);
    throw error;
  }
}

// Delete photo from album
export async function deleteAlbumPhoto(photoId: string, albumType: AlbumType): Promise<void> {
  try {
    await deletePhoto(photoId);
    
    // Clean up album-specific data
    const albumData = loadAlbumData(albumType);
    delete albumData[photoId];
    saveAlbumData(albumType, albumData);
    
    console.log(`Photo deleted from ${albumType} album: ${photoId}`);
  } catch (error) {
    console.error('Error deleting album photo:', error);
    throw error;
  }
}

// Move photo between albums
export async function movePhotoToAlbum(
  photoId: string,
  fromAlbum: AlbumType,
  toAlbum: AlbumType
): Promise<void> {
  try {
    const metadata = await listPhotos();
    const photo = metadata.find(p => p.id === photoId);
    
    if (!photo) {
      throw new Error(`Photo not found: ${photoId}`);
    }
    
    // Update tags
    const oldTag = `album:${fromAlbum}`;
    const newTag = `album:${toAlbum}`;
    const updatedTags = photo.tags?.filter(t => t !== oldTag) || [];
    updatedTags.push(newTag);
    
    await updatePhotoMetadata(photoId, { tags: updatedTags });
    
    // Move album-specific data
    const fromData = loadAlbumData(fromAlbum);
    const toData = loadAlbumData(toAlbum);
    
    if (fromData[photoId]) {
      toData[photoId] = fromData[photoId];
      delete fromData[photoId];
      saveAlbumData(fromAlbum, fromData);
      saveAlbumData(toAlbum, toData);
    }
    
    console.log(`Photo moved from ${fromAlbum} to ${toAlbum}: ${photoId}`);
  } catch (error) {
    console.error('Error moving photo between albums:', error);
    throw error;
  }
}

// Helper functions for album-specific metadata (face data, etc.)
function loadAlbumData(albumType: AlbumType): Record<string, any> {
  try {
    const key = `album-data-${albumType}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error(`Error loading ${albumType} album data:`, error);
    return {};
  }
}

function saveAlbumData(albumType: AlbumType, data: Record<string, any>): void {
  try {
    const key = `album-data-${albumType}`;
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${albumType} album data:`, error);
  }
}

// Get photo with image data loaded
export async function getAlbumPhotoWithData(photoId: string, albumType: AlbumType): Promise<(AlbumPhoto & { imageData: string }) | null> {
  try {
    const imageData = await loadPhoto(photoId);
    if (!imageData) return null;
    
    const photoMetadata = await listPhotos();
    const metadata = photoMetadata.find(p => p.id === photoId);
    
    if (!metadata) return null;
    
    const albumData = loadAlbumData(albumType);
    
    return {
      id: metadata.id,
      albumType,
      week: metadata.week,
      caption: metadata.caption,
      tags: metadata.tags?.filter(t => !t.startsWith('album:')),
      timestamp: new Date(metadata.timestamp),
      faceData: albumData[photoId]?.faceData,
      mediaType: metadata.mediaType || 'image',
      duration: metadata.duration,
      imageData
    };
  } catch (error) {
    console.error('Error getting photo with data:', error);
    return null;
  }
}
