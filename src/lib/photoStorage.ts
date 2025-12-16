import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

// Media storage using Capacitor Filesystem API for unlimited storage
// Photos and videos are stored as actual files on the device

interface PhotoMetadata {
  id: string;
  filename: string;
  timestamp: number;
  caption?: string;
  week?: number;
  tags?: string[];
  mediaType?: 'image' | 'video';
  duration?: number;
}

const PHOTO_DIRECTORY = 'photos';
const METADATA_KEY = 'photo-metadata';

// Track save operations to prevent race conditions
let saveQueue: Promise<void> = Promise.resolve();

// Initialize photo directory
async function ensurePhotoDirectory(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) {
    console.log('Running in web mode, using localStorage fallback');
    return true;
  }

  try {
    await Filesystem.mkdir({
      path: PHOTO_DIRECTORY,
      directory: Directory.Data,
      recursive: true
    });
    return true;
  } catch (error: any) {
    // Directory might already exist, that's fine
    if (error?.message?.includes('Directory exists') || error?.code === 'EEXIST') {
      return true;
    }
    console.log('Photo directory check:', error);
    return true;
  }
}

// Safely save metadata with retry logic
async function saveMetadataSafely(metadata: Record<string, PhotoMetadata & { data?: string }>): Promise<boolean> {
  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const jsonString = JSON.stringify(metadata);
      localStorage.setItem(METADATA_KEY, jsonString);
      
      // Verify the save was successful
      const verified = localStorage.getItem(METADATA_KEY);
      if (verified === jsonString) {
        return true;
      }
    } catch (error) {
      lastError = error as Error;
      console.error(`Metadata save attempt ${attempt + 1} failed:`, error);
      await new Promise(resolve => setTimeout(resolve, 100 * (attempt + 1)));
    }
  }

  console.error('All metadata save attempts failed:', lastError);
  return false;
}

// Save media (photo or video) to filesystem with improved reliability
export async function savePhoto(
  base64Data: string,
  metadata: Omit<PhotoMetadata, 'filename'>
): Promise<string> {
  // Queue saves to prevent race conditions
  return new Promise((resolve, reject) => {
    saveQueue = saveQueue.then(async () => {
      try {
        // Detect media type and extension from base64 data
        const isVideo = base64Data.startsWith('data:video/');
        const mediaType = metadata.mediaType || (isVideo ? 'video' : 'image');
        
        let extension = 'jpg';
        if (isVideo) {
          if (base64Data.includes('video/mp4')) extension = 'mp4';
          else if (base64Data.includes('video/webm')) extension = 'webm';
          else if (base64Data.includes('video/quicktime')) extension = 'mov';
        } else {
          if (base64Data.includes('image/png')) extension = 'png';
          else if (base64Data.includes('image/gif')) extension = 'gif';
          else if (base64Data.includes('image/webp')) extension = 'webp';
        }
        
        const filename = `${mediaType}_${metadata.id}_${Date.now()}.${extension}`;
        
        // For native platform, use Filesystem API
        if (Capacitor.isNativePlatform()) {
          const directoryReady = await ensurePhotoDirectory();
          if (!directoryReady) {
            throw new Error('Failed to ensure photo directory');
          }
          
          // Remove data URL prefix if present
          const base64Media = base64Data.replace(/^data:(image|video)\/[a-z]+;base64,/, '');
          
          // Save media file with retry
          let fileSaved = false;
          for (let attempt = 0; attempt < 3; attempt++) {
            try {
              await Filesystem.writeFile({
                path: `${PHOTO_DIRECTORY}/${filename}`,
                data: base64Media,
                directory: Directory.Data
              });
              
              // Verify file was saved
              try {
                await Filesystem.stat({
                  path: `${PHOTO_DIRECTORY}/${filename}`,
                  directory: Directory.Data
                });
                fileSaved = true;
                break;
              } catch {
                console.log(`File verification failed on attempt ${attempt + 1}`);
              }
            } catch (error) {
              console.error(`File save attempt ${attempt + 1} failed:`, error);
              await new Promise(r => setTimeout(r, 100 * (attempt + 1)));
            }
          }
          
          if (!fileSaved) {
            throw new Error('Failed to save photo file after multiple attempts');
          }
          
          // Save metadata
          const allMetadata = await loadAllPhotoMetadata();
          allMetadata[metadata.id] = { ...metadata, filename, mediaType };
          
          const metadataSaved = await saveMetadataSafely(allMetadata);
          if (!metadataSaved) {
            // Try to clean up the file if metadata save failed
            try {
              await Filesystem.deleteFile({
                path: `${PHOTO_DIRECTORY}/${filename}`,
                directory: Directory.Data
              });
            } catch {}
            throw new Error('Failed to save photo metadata');
          }
          
          console.log(`Media saved successfully: ${filename}`);
          resolve(filename);
        } else {
          // Fallback for web: use localStorage (with size limitations)
          console.log('Web fallback: storing in localStorage');
          const allMetadata = await loadAllPhotoMetadata();
          allMetadata[metadata.id] = { ...metadata, filename, mediaType, data: base64Data };
          
          const metadataSaved = await saveMetadataSafely(allMetadata);
          if (!metadataSaved) {
            throw new Error('Failed to save photo to localStorage');
          }
          
          console.log(`Media saved to localStorage: ${filename}`);
          resolve(filename);
        }
      } catch (error) {
        console.error('Error saving photo:', error);
        reject(error);
      }
    });
  });
}

// Load media (photo or video) from filesystem
export async function loadPhoto(photoId: string): Promise<string | null> {
  try {
    const allMetadata = await loadAllPhotoMetadata();
    const metadata = allMetadata[photoId];
    
    if (!metadata) {
      console.log(`Media metadata not found: ${photoId}`);
      return null;
    }
    
    // For native platform, read from filesystem
    if (Capacitor.isNativePlatform()) {
      try {
        const result = await Filesystem.readFile({
          path: `${PHOTO_DIRECTORY}/${metadata.filename}`,
          directory: Directory.Data
        });
        
        // Determine MIME type from filename or metadata
        const isVideo = metadata.mediaType === 'video' || metadata.filename.includes('video_');
        let mimeType = 'image/jpeg';
        
        if (isVideo) {
          if (metadata.filename.endsWith('.mp4')) mimeType = 'video/mp4';
          else if (metadata.filename.endsWith('.webm')) mimeType = 'video/webm';
          else if (metadata.filename.endsWith('.mov')) mimeType = 'video/quicktime';
        } else {
          if (metadata.filename.endsWith('.png')) mimeType = 'image/png';
          else if (metadata.filename.endsWith('.gif')) mimeType = 'image/gif';
          else if (metadata.filename.endsWith('.webp')) mimeType = 'image/webp';
        }
        
        return `data:${mimeType};base64,${result.data}`;
      } catch (fileError) {
        console.error('Error reading file from filesystem:', fileError);
        // Check if we have fallback data in metadata
        if ((metadata as any).data) {
          return (metadata as any).data;
        }
        return null;
      }
    } else {
      // Fallback for web: return from metadata (localStorage)
      return (metadata as any).data || null;
    }
  } catch (error) {
    console.error('Error loading media:', error);
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
      try {
        await Filesystem.deleteFile({
          path: `${PHOTO_DIRECTORY}/${metadata.filename}`,
          directory: Directory.Data
        });
      } catch (error) {
        console.log('File might not exist, continuing with metadata cleanup');
      }
    }
    
    // Remove metadata
    delete allMetadata[photoId];
    await saveMetadataSafely(allMetadata);
    
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
    if (!stored) return {};
    
    const parsed = JSON.parse(stored);
    return parsed || {};
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
  await saveMetadataSafely(allMetadata);
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

// Verify and repair photo storage
export async function verifyPhotoStorage(): Promise<{
  verified: number;
  missing: number;
  repaired: number;
}> {
  const allMetadata = await loadAllPhotoMetadata();
  let verified = 0;
  let missing = 0;
  let repaired = 0;

  if (Capacitor.isNativePlatform()) {
    for (const [id, metadata] of Object.entries(allMetadata)) {
      try {
        await Filesystem.stat({
          path: `${PHOTO_DIRECTORY}/${metadata.filename}`,
          directory: Directory.Data
        });
        verified++;
      } catch {
        // File missing - check if we have fallback data
        if ((metadata as any).data) {
          try {
            await Filesystem.writeFile({
              path: `${PHOTO_DIRECTORY}/${metadata.filename}`,
              data: (metadata as any).data.replace(/^data:(image|video)\/[a-z]+;base64,/, ''),
              directory: Directory.Data
            });
            repaired++;
          } catch {
            missing++;
          }
        } else {
          missing++;
        }
      }
    }
  } else {
    // For web, just count entries with data
    for (const metadata of Object.values(allMetadata)) {
      if ((metadata as any).data) {
        verified++;
      } else {
        missing++;
      }
    }
  }

  return { verified, missing, repaired };
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
  
  console.log(`Migration complete: ${migrated} migrated, ${failed} failed`);
  return { migrated, failed };
}
