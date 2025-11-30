// Media storage for symptom-related trackers (skin condition, etc.)
import { savePhoto, loadPhoto, deletePhoto, listPhotos } from './photoStorage';

export type SymptomPhotoType = 'skin' | 'general';

interface SymptomPhoto {
  id: string;
  type: SymptomPhotoType;
  date: Date;
  imageData?: string;
  notes?: string;
  severity?: number;
  conditions?: string[];
  mediaType?: 'image' | 'video';
  duration?: number;
}

// Save symptom media (photo or video) - instant save
export async function saveSymptomPhoto(
  base64Data: string,
  type: SymptomPhotoType,
  options: {
    date?: Date;
    notes?: string;
    severity?: number;
    conditions?: string[];
    mediaType?: 'image' | 'video';
    duration?: number;
  } = {}
): Promise<string> {
  const photoId = `symptom_${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const date = options.date || new Date();
  
  const tags = [`symptom:${type}`, ...(options.conditions || [])];
  
  try {
    await savePhoto(base64Data, {
      id: photoId,
      timestamp: date.getTime(),
      tags,
      mediaType: options.mediaType,
      duration: options.duration
    });
    
    // Store additional symptom data in localStorage (small metadata only)
    const symptomData = loadSymptomPhotoData();
    symptomData[photoId] = {
      type,
      date: date.toISOString(),
      notes: options.notes,
      severity: options.severity,
      conditions: options.conditions,
      mediaType: options.mediaType,
      duration: options.duration
    };
    saveSymptomPhotoData(symptomData);
    
    console.log(`Symptom photo saved: ${photoId}`);
    return photoId;
  } catch (error) {
    console.error('Error saving symptom photo:', error);
    throw error;
  }
}

// Load symptom photos for a specific date or type
export async function loadSymptomPhotos(
  type: SymptomPhotoType,
  dateFilter?: { start?: Date; end?: Date }
): Promise<SymptomPhoto[]> {
  try {
    const filter: any = { tags: [`symptom:${type}`] };
    
    if (dateFilter?.start) {
      filter.startDate = dateFilter.start.getTime();
    }
    if (dateFilter?.end) {
      filter.endDate = dateFilter.end.getTime();
    }
    
    const photoMetadataList = await listPhotos(filter);
    const symptomData = loadSymptomPhotoData();
    
    const photos: SymptomPhoto[] = [];
    
    for (const metadata of photoMetadataList) {
      const imageData = await loadPhoto(metadata.id);
      const extraData = symptomData[metadata.id];
      
      if (imageData && extraData) {
        photos.push({
          id: metadata.id,
          type: extraData.type,
          date: new Date(extraData.date),
          imageData,
          notes: extraData.notes,
          severity: extraData.severity,
          conditions: extraData.conditions,
          mediaType: extraData.mediaType || metadata.mediaType || 'image',
          duration: extraData.duration || metadata.duration
        });
      }
    }
    
    return photos.sort((a, b) => b.date.getTime() - a.date.getTime());
  } catch (error) {
    console.error('Error loading symptom photos:', error);
    return [];
  }
}

// Load symptom photos for a specific date
export async function loadSymptomPhotosForDate(
  type: SymptomPhotoType,
  date: Date
): Promise<SymptomPhoto[]> {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return loadSymptomPhotos(type, { start: startOfDay, end: endOfDay });
}

// Delete symptom photo
export async function deleteSymptomPhoto(photoId: string): Promise<void> {
  try {
    await deletePhoto(photoId);
    
    const symptomData = loadSymptomPhotoData();
    delete symptomData[photoId];
    saveSymptomPhotoData(symptomData);
    
    console.log(`Symptom photo deleted: ${photoId}`);
  } catch (error) {
    console.error('Error deleting symptom photo:', error);
    throw error;
  }
}

// Helper functions
function loadSymptomPhotoData(): Record<string, any> {
  try {
    const stored = localStorage.getItem('symptom-photo-data');
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error loading symptom photo data:', error);
    return {};
  }
}

function saveSymptomPhotoData(data: Record<string, any>): void {
  try {
    localStorage.setItem('symptom-photo-data', JSON.stringify(data));
  } catch (error) {
    console.error('Error saving symptom photo data:', error);
  }
}
