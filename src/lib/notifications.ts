import { LocalNotifications } from '@capacitor/local-notifications';
import { differenceInDays, addDays } from 'date-fns';

export const requestNotificationPermission = async () => {
  try {
    const result = await LocalNotifications.requestPermissions();
    return result.display === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

export const schedulePeriodReminder = async (
  nextPeriodDate: Date,
  cycleLength: number
) => {
  try {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      console.log('Notification permission not granted');
      return;
    }

    // Cancel any existing period notifications
    await LocalNotifications.cancel({ notifications: [{ id: 1 }, { id: 2 }] });

    const today = new Date();
    const daysUntilPeriod = differenceInDays(nextPeriodDate, today);

    // Schedule notification 2 days before period at 9:00 AM
    if (daysUntilPeriod >= 2) {
      const twoDaysBefore = addDays(nextPeriodDate, -2);
      const notificationDate = new Date(twoDaysBefore);
      notificationDate.setHours(9, 0, 0, 0); // Set to 9:00 AM sharp
      
      await LocalNotifications.schedule({
        notifications: [
          {
            title: 'Period Coming Soon 🌸',
            body: 'Your period is expected in 2 days. Be prepared!',
            id: 1,
            schedule: { at: notificationDate },
            sound: undefined,
            attachments: undefined,
            actionTypeId: '',
            extra: null,
          },
        ],
      });
    }

    // Schedule notification on the day of period at 8:00 AM
    if (daysUntilPeriod >= 0) {
      const notificationDate = new Date(nextPeriodDate);
      notificationDate.setHours(8, 0, 0, 0); // Set to 8:00 AM sharp
      
      await LocalNotifications.schedule({
        notifications: [
          {
            title: 'Period Day 🌸',
            body: 'Your period is expected today. Take care of yourself!',
            id: 2,
            schedule: { at: notificationDate },
            sound: undefined,
            attachments: undefined,
            actionTypeId: '',
            extra: null,
          },
        ],
      });
    }
  } catch (error) {
    console.error('Error scheduling notifications:', error);
  }
};
