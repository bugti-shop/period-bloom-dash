// Migration utility for Bump Gallery to new filesystem storage
import { saveAlbumPhoto } from './albumStorage';
import { loadFromLocalStorage } from './storage';

interface WeekPhoto {
  imageData: string;
  timestamp: Date | string;
  caption?: string;
  tags?: string[];
}

interface WeekPhotos {
  [week: number]: WeekPhoto;
}

export async function migrateBumpGalleryToFilesystem(): Promise<{
  migrated: number;
  failed: number;
}> {
  let migrated = 0;
  let failed = 0;

  try {
    // Migrate bump photos
    const storedPhotos = loadFromLocalStorage<WeekPhotos>('pregnancy-week-photos');
    if (storedPhotos) {
      for (const [week, photo] of Object.entries(storedPhotos)) {
        try {
          await saveAlbumPhoto(photo.imageData, 'bump', {
            week: parseInt(week),
            caption: photo.caption,
            tags: photo.tags
          });
          migrated++;
        } catch (error) {
          console.error(`Failed to migrate week ${week}:`, error);
          failed++;
        }
      }
    }

    // Migrate baby photo
    const babyPhoto = loadFromLocalStorage<WeekPhoto>('baby-born-photo');
    if (babyPhoto) {
      try {
        await saveAlbumPhoto(babyPhoto.imageData, 'baby', {
          caption: babyPhoto.caption,
          tags: babyPhoto.tags
        });
        migrated++;
      } catch (error) {
        console.error('Failed to migrate baby photo:', error);
        failed++;
      }
    }

    console.log(`Bump Gallery migration: ${migrated} migrated, ${failed} failed`);
    return { migrated, failed };
  } catch (error) {
    console.error('Bump Gallery migration error:', error);
    return { migrated, failed };
  }
}
