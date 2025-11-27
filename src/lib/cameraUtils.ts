import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

export const takeCameraPhoto = async (): Promise<string | null> => {
  try {
    const photo = await Camera.getPhoto({
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
      quality: 90,
      allowEditing: false,
    });
    
    return photo.dataUrl || null;
  } catch (error) {
    console.error('Error taking photo:', error);
    return null;
  }
};

export const selectFromGallery = async (): Promise<string | null> => {
  try {
    const photo = await Camera.getPhoto({
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Photos,
      quality: 90,
      allowEditing: false,
    });
    
    return photo.dataUrl || null;
  } catch (error) {
    console.error('Error selecting photo:', error);
    return null;
  }
};

export const requestCameraPermissions = async (): Promise<boolean> => {
  try {
    const permissions = await Camera.requestPermissions();
    return permissions.camera === 'granted' && permissions.photos === 'granted';
  } catch (error) {
    console.error('Error requesting camera permissions:', error);
    return false;
  }
};
