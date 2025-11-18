import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { toast } from 'sonner';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface NotificationOptions {
  title: string;
  description?: string;
  type?: NotificationType;
  haptics?: boolean;
  duration?: number;
}

/**
 * Show a notification with optional haptic feedback
 */
export const notifyWithHaptics = async ({
  title,
  description,
  type = 'info',
  haptics = true,
  duration = 3000
}: NotificationOptions) => {
  // Trigger haptic feedback if enabled
  if (haptics) {
    try {
      let impactStyle: ImpactStyle;
      
      switch (type) {
        case 'success':
          impactStyle = ImpactStyle.Light;
          break;
        case 'error':
          impactStyle = ImpactStyle.Heavy;
          break;
        case 'warning':
          impactStyle = ImpactStyle.Medium;
          break;
        default:
          impactStyle = ImpactStyle.Light;
      }
      
      await Haptics.impact({ style: impactStyle });
    } catch (error) {
      console.log('Haptics not available:', error);
    }
  }

  // Show toast notification
  const toastContent = description ? `${title}\n${description}` : title;
  
  switch (type) {
    case 'success':
      toast.success(title, { description, duration });
      break;
    case 'error':
      toast.error(title, { description, duration });
      break;
    case 'warning':
      toast.warning(title, { description, duration });
      break;
    default:
      toast(title, { description, duration });
  }
};

/**
 * Show a success notification with light haptic feedback
 */
export const notifySuccess = (title: string, description?: string) => {
  return notifyWithHaptics({ title, description, type: 'success' });
};

/**
 * Show an error notification with heavy haptic feedback
 */
export const notifyError = (title: string, description?: string) => {
  return notifyWithHaptics({ title, description, type: 'error' });
};

/**
 * Show an info notification with light haptic feedback
 */
export const notifyInfo = (title: string, description?: string) => {
  return notifyWithHaptics({ title, description, type: 'info' });
};

/**
 * Show a warning notification with medium haptic feedback
 */
export const notifyWarning = (title: string, description?: string) => {
  return notifyWithHaptics({ title, description, type: 'warning' });
};
