import { setHours, setMinutes } from "date-fns";
import { LocalNotifications } from '@capacitor/local-notifications';
import { loadSymptomReminders } from "./symptomReminderStorage";
import { requestNotificationPermission } from "./notifications";

export const scheduleSymptomReminders = async (): Promise<void> => {
  try {
    const reminders = loadSymptomReminders();
    
    if (!reminders.enabled || reminders.times.length === 0) {
      // Cancel all symptom notifications if disabled
      await LocalNotifications.cancel({ 
        notifications: Array.from({ length: 10 }, (_, i) => ({ id: 20 + i }))
      });
      return;
    }

    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      console.log('Notification permission not granted');
      return;
    }

    // Cancel existing symptom notifications (IDs 20-29)
    await LocalNotifications.cancel({ 
      notifications: Array.from({ length: 10 }, (_, i) => ({ id: 20 + i }))
    });

    const today = new Date();
    const notifications = [];

    // Schedule notifications for each time
    reminders.times.forEach((time, index) => {
      const [hours, minutes] = time.split(':').map(Number);
      const notificationDate = setMinutes(setHours(today, hours), minutes);

      notifications.push({
        title: "Log Your Symptoms",
        body: "Don't forget to log how you're feeling today. It helps track your cycle patterns!",
        id: 20 + index,
        schedule: {
          // Repeat daily at the specified time
          on: {
            hour: hours,
            minute: minutes,
          },
          repeats: true,
        },
        sound: undefined,
        attachments: undefined,
        actionTypeId: '',
        extra: null,
      });
    });

    if (notifications.length > 0) {
      await LocalNotifications.schedule({ notifications });
      console.log(`Scheduled ${notifications.length} symptom logging reminders`);
    }
  } catch (error) {
    console.error('Error scheduling symptom reminders:', error);
  }
};

// Call this function when symptom reminders are updated
export const updateSymptomReminders = async (): Promise<void> => {
  await scheduleSymptomReminders();
};
