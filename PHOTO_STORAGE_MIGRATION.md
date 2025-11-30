# Photo Storage Migration Guide

## Overview

The app now uses **Capacitor Filesystem API** for unlimited photo storage instead of browser localStorage. This provides:

- ✅ **Unlimited photo storage** (only limited by device storage)
- ✅ **Instant saving** of all photos
- ✅ **Native file system** storage on iOS and Android
- ✅ **Better performance** with large photo libraries
- ✅ **Automatic fallback** to localStorage for web preview

## How It Works

### Native App (iOS/Android)
- Photos are saved as actual image files in the device's private data directory
- Only small metadata (caption, tags, week) is stored in localStorage
- Each photo is saved instantly when added

### Web Preview
- Automatically falls back to localStorage for browser testing
- Photos stored as base64 strings (with size limitations in web mode)

## Implementation Details

### New Storage Modules

1. **`photoStorage.ts`** - Core photo storage using Filesystem API
   - `savePhoto()` - Save photo instantly to device
   - `loadPhoto()` - Load photo from device
   - `deletePhoto()` - Remove photo from device
   - `listPhotos()` - List all photos with filtering

2. **`albumStorage.ts`** - Album-specific storage (bump, baby, family, ultrasound)
   - `saveAlbumPhoto()` - Save to specific album with instant save
   - `loadAlbumPhotos()` - Load all photos from an album
   - `movePhotoToAlbum()` - Move photos between albums

3. **`symptomPhotoStorage.ts`** - Symptom tracker photos (skin condition, etc.)
   - `saveSymptomPhoto()` - Save symptom photos instantly
   - `loadSymptomPhotos()` - Load symptom photos with filters

## For Developers

### Updating Components

All photo-handling components should migrate from:

```typescript
// OLD WAY (localStorage, limited size)
localStorage.setItem('photos', JSON.stringify({ imageData: base64 }));

// NEW WAY (Filesystem, unlimited)
import { saveAlbumPhoto } from '@/lib/albumStorage';
await saveAlbumPhoto(base64Data, 'bump', { week: 10, caption: 'Week 10' });
```

### Migration from Old Storage

The system includes automatic migration for existing photos stored in localStorage. On first run on a native device, existing photos will be migrated to the filesystem.

## Syncing Changes

After pulling these changes:

```bash
# 1. Install dependencies
npm install

# 2. Build the project
npm run build

# 3. Sync with native platforms
npx cap sync

# 4. Run on device
npx cap run android
# or
npx cap run ios
```

## Storage Locations

### iOS
Photos stored in: `Library/NoCloud/photos/`

### Android  
Photos stored in: `files/photos/`

### Web
Photos stored in: `localStorage` (with size limits)

## Testing

1. **On Native Device**: Photos will be saved to the filesystem
2. **In Web Preview**: Photos will use localStorage fallback
3. **Check Storage**: Use DevTools → Application → Local Storage to verify metadata

## Benefits

- Photos save instantly when added
- No storage size limitations on native devices
- Better app performance with large photo libraries
- Proper file management with native APIs
