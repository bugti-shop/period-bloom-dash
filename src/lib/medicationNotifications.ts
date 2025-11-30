import { LocalNotifications } from '@capacitor/local-notifications';
import { requestNotificationPermission } from './notifications';
import { loadMedications } from './medicationStorage';
import { setHours, setMinutes, setSeconds, setMilliseconds } from 'date-fns';

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
    const now = new Date();

    medications.forEach((medication) => {
      if (!medication.reminderEnabled || !medication.time) {
        return;
      }

      const [hours, minutes] = medication.time.split(':').map(Number);
      
      // Create first notification date
      let firstNotification = setMilliseconds(
        setSeconds(
          setMinutes(
            setHours(new Date(), hours),
            minutes
          ),
          0
        ),
        0
      );

      // If time has passed today, schedule for tomorrow
      if (firstNotification <= now) {
        firstNotification.setDate(firstNotification.getDate() + 1);
      }

      // Get medication type icon
      const getIcon = (name: string) => {
        const lowerName = name.toLowerCase();
        if (lowerName.includes('vitamin') || lowerName.includes('supplement')) return '🌿';
        if (lowerName.includes('pill') || lowerName.includes('birth control')) return '💊';
        if (lowerName.includes('iron') || lowerName.includes('folic')) return '⚕️';
        return '💊';
      };

      notifications.push({
        id: notificationId++,
        title: `${getIcon(medication.name)} Time for ${medication.name}`,
        body: `Take ${medication.dosage} - ${medication.frequency}${medication.notes ? ` (${medication.notes})` : ''}`,
        schedule: {
          at: firstNotification,
          every: 'day' as const, // Repeat daily at the exact same time
        },
        sound: undefined,
        attachments: undefined,
        actionTypeId: '',
        extra: {
          medicationId: medication.id,
          medicationName: medication.name,
        },
      });
    });

    if (notifications.length > 0) {
      await LocalNotifications.schedule({ notifications });
      console.log(`✓ Scheduled ${notifications.length} daily medication reminders (completely offline)`);
    }
  } catch (error) {
    console.error('Error scheduling medication reminders:', error);
  }
};

// Update reminders when medications change
export const updateMedicationReminders = async (): Promise<void> => {
  await scheduleMedicationReminders();
};

// Schedule a single medication reminder
export const scheduleSingleMedicationReminder = async (medicationId: string): Promise<void> => {
  await scheduleMedicationReminders();
};
