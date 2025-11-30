import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

// Photo storage using Capacitor Filesystem API for unlimited storage
// Photos are stored as actual files on the device

interface PhotoMetadata {
  id: string;
  filename: string;
  timestamp: number;
  caption?: string;
  week?: number;
  tags?: string[];
}

const PHOTO_DIRECTORY = 'photos';
const METADATA_KEY = 'photo-metadata';

// Initialize photo directory
async function ensurePhotoDirectory() {
  if (!Capacitor.isNativePlatform()) {
    console.log('Running in web mode, using localStorage fallback');
    return;
  }

  try {
    await Filesystem.mkdir({
      path: PHOTO_DIRECTORY,
      directory: Directory.Data,
      recursive: true
    });
  } catch (error) {
    // Directory might already exist, that's fine
    console.log('Photo directory check:', error);
  }
}

// Save photo to filesystem
export async function savePhoto(
  base64Data: string,
  metadata: Omit<PhotoMetadata, 'filename'>
): Promise<string> {
  const filename = `photo_${metadata.id}_${Date.now()}.jpg`;
  
  // For native platform, use Filesystem API
  if (Capacitor.isNativePlatform()) {
    try {
      await ensurePhotoDirectory();
      
      // Remove data URL prefix if present
      const base64Image = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
      
      // Save photo file
      await Filesystem.writeFile({
        path: `${PHOTO_DIRECTORY}/${filename}`,
        data: base64Image,
        directory: Directory.Data
      });
      
      // Save metadata
      const allMetadata = await loadAllPhotoMetadata();
      allMetadata[metadata.id] = { ...metadata, filename };
      localStorage.setItem(METADATA_KEY, JSON.stringify(allMetadata));
      
      console.log(`Photo saved: ${filename}`);
      return filename;
    } catch (error) {
      console.error('Error saving photo to filesystem:', error);
      throw error;
    }
  } else {
    // Fallback for web: use localStorage (with size limitations)
    console.log('Web fallback: storing in localStorage');
    const allMetadata = await loadAllPhotoMetadata();
    allMetadata[metadata.id] = { ...metadata, filename, data: base64Data };
    localStorage.setItem(METADATA_KEY, JSON.stringify(allMetadata));
    return filename;
  }
}

// Load photo from filesystem
export async function loadPhoto(photoId: string): Promise<string | null> {
  try {
    const allMetadata = await loadAllPhotoMetadata();
    const metadata = allMetadata[photoId];
    
    if (!metadata) {
      console.log(`Photo metadata not found: ${photoId}`);
      return null;
    }
    
    // For native platform, read from filesystem
    if (Capacitor.isNativePlatform()) {
      const result = await Filesystem.readFile({
        path: `${PHOTO_DIRECTORY}/${metadata.filename}`,
        directory: Directory.Data
      });
      
      return `data:image/jpeg;base64,${result.data}`;
    } else {
      // Fallback for web: return from metadata (localStorage)
      return (metadata as any).data || null;
    }
  } catch (error) {
    console.error('Error loading photo:', error);
    return null;
  }
}

// Delete photo from filesystem
export async function deletePhoto(photoId: string): Promise<void> {
  try {
    const allMetadata = await loadAllPhotoMetadata();
    const metadata = allMetadata[photoId];
    
    if (!metadata) return;
    
    // For native platform, delete from filesystem
    if (Capacitor.isNativePlatform()) {
      await Filesystem.deleteFile({
        path: `${PHOTO_DIRECTORY}/${metadata.filename}`,
        directory: Directory.Data
      });
    }
    
    // Remove metadata
    delete allMetadata[photoId];
    localStorage.setItem(METADATA_KEY, JSON.stringify(allMetadata));
    
    console.log(`Photo deleted: ${photoId}`);
  } catch (error) {
    console.error('Error deleting photo:', error);
    throw error;
  }
}

// Load all photo metadata
async function loadAllPhotoMetadata(): Promise<Record<string, PhotoMetadata & { data?: string }>> {
  try {
    const stored = localStorage.getItem(METADATA_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error loading photo metadata:', error);
    return {};
  }
}

// Get photo metadata
export async function getPhotoMetadata(photoId: string): Promise<PhotoMetadata | null> {
  const allMetadata = await loadAllPhotoMetadata();
  return allMetadata[photoId] || null;
}

// Update photo metadata
export async function updatePhotoMetadata(
  photoId: string,
  updates: Partial<Omit<PhotoMetadata, 'id' | 'filename'>>
): Promise<void> {
  const allMetadata = await loadAllPhotoMetadata();
  const existing = allMetadata[photoId];
  
  if (!existing) {
    throw new Error(`Photo not found: ${photoId}`);
  }
  
  allMetadata[photoId] = { ...existing, ...updates };
  localStorage.setItem(METADATA_KEY, JSON.stringify(allMetadata));
}

// List all photos with optional filtering
export async function listPhotos(filter?: {
  week?: number;
  tags?: string[];
  startDate?: number;
  endDate?: number;
}): Promise<PhotoMetadata[]> {
  const allMetadata = await loadAllPhotoMetadata();
  let photos = Object.values(allMetadata);
  
  if (filter) {
    if (filter.week !== undefined) {
      photos = photos.filter(p => p.week === filter.week);
    }
    if (filter.tags && filter.tags.length > 0) {
      photos = photos.filter(p => 
        p.tags && p.tags.some(tag => filter.tags!.includes(tag))
      );
    }
    if (filter.startDate !== undefined) {
      photos = photos.filter(p => p.timestamp >= filter.startDate!);
    }
    if (filter.endDate !== undefined) {
      photos = photos.filter(p => p.timestamp <= filter.endDate!);
    }
  }
  
  return photos.sort((a, b) => b.timestamp - a.timestamp);
}

// Batch save photos (for album uploads)
export async function savePhotos(
  photos: Array<{ base64Data: string; metadata: Omit<PhotoMetadata, 'filename'> }>
): Promise<string[]> {
  const savedFilenames: string[] = [];
  
  for (const photo of photos) {
    try {
      const filename = await savePhoto(photo.base64Data, photo.metadata);
      savedFilenames.push(filename);
    } catch (error) {
      console.error('Error saving photo in batch:', error);
    }
  }
  
  return savedFilenames;
}

// Get storage info
export async function getStorageInfo(): Promise<{
  totalPhotos: number;
  isNativePlatform: boolean;
}> {
  const allMetadata = await loadAllPhotoMetadata();
  
  return {
    totalPhotos: Object.keys(allMetadata).length,
    isNativePlatform: Capacitor.isNativePlatform()
  };
}

// Migrate existing localStorage photos to filesystem (one-time migration)
export async function migratePhotosToFilesystem(): Promise<{
  migrated: number;
  failed: number;
}> {
  if (!Capacitor.isNativePlatform()) {
    console.log('Migration only needed on native platform');
    return { migrated: 0, failed: 0 };
  }
  
  let migrated = 0;
  let failed = 0;
  
  // Migrate bump gallery photos
  const bumpPhotos = localStorage.getItem('pregnancy-week-photos');
  if (bumpPhotos) {
    try {
      const parsed = JSON.parse(bumpPhotos);
      for (const [week, photos] of Object.entries(parsed)) {
        if (Array.isArray(photos)) {
          for (const photo of photos as any[]) {
            try {
              await savePhoto(photo.imageData, {
                id: photo.id,
                timestamp: new Date(photo.timestamp).getTime(),
                caption: photo.caption,
                week: parseInt(week),
                tags: photo.tags
              });
              migrated++;
            } catch (error) {
              console.error('Failed to migrate photo:', error);
              failed++;
            }
          }
        }
      }
    } catch (error) {
      console.error('Error migrating bump photos:', error);
    }
  }
  
  // Similar migrations for other photo types can be added here
  
  console.log(`Migration complete: ${migrated} migrated, ${failed} failed`);
  return { migrated, failed };
}
