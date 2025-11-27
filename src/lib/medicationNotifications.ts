import { LocalNotifications } from '@capacitor/local-notifications';
import { requestNotificationPermission } from './notifications';
import { loadMedications, Medication } from './medicationStorage';
import { setHours, setMinutes } from 'date-fns';

export const scheduleMedicationReminders = async (): Promise<void> => {
  try {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      console.log('Notification permission not granted');
      return;
    }

    const medications = loadMedications();
    
    // Cancel existing medication notifications (IDs 4000-4999)
    await LocalNotifications.cancel({ 
      notifications: Array.from({ length: 1000 }, (_, i) => ({ id: 4000 + i }))
    });

    const notifications = [];
    let notificationId = 4000;

    medications.forEach((medication) => {
      if (!medication.reminderEnabled || !medication.time) {
        return;
      }

      const [hours, minutes] = medication.time.split(':').map(Number);
      
      notifications.push({
        id: notificationId++,
        title: `💊 Time for ${medication.name}`,
        body: `Take ${medication.dosage} - ${medication.frequency}`,
        schedule: {
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
      console.log(`Scheduled ${notifications.length} medication reminders`);
    }
  } catch (error) {
    console.error('Error scheduling medication reminders:', error);
  }
};

export const updateMedicationReminders = async (): Promise<void> => {
  await scheduleMedicationReminders();
};
