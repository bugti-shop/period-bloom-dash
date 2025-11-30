import { LocalNotifications } from '@capacitor/local-notifications';
import { requestNotificationPermission } from './notifications';
import { getAppointments } from './appointmentStorage';
import { subHours, subDays, setSeconds, setMilliseconds, isBefore } from 'date-fns';

export const scheduleAppointmentReminders = async (): Promise<void> => {
  try {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      console.log('Notification permission not granted');
      return;
    }

    const appointments = getAppointments();
    
    // Cancel existing appointment notifications (IDs 3000-3999)
    await LocalNotifications.cancel({ 
      notifications: Array.from({ length: 1000 }, (_, i) => ({ id: 3000 + i }))
    });

    const now = new Date();
    const notifications = [];
    let notificationId = 3000;

    appointments.forEach((appointment) => {
      // Parse appointment date and time
      const appointmentDate = new Date(appointment.date);
      const [hours, minutes] = appointment.time.split(':').map(Number);
      appointmentDate.setHours(hours, minutes, 0, 0);
      
      // Only schedule future appointments
      if (appointmentDate > now) {
        // 1 day before reminder at 9:00 AM
        const oneDayBefore = subDays(appointmentDate, 1);
        const oneDayBeforeAt9AM = setMilliseconds(setSeconds(oneDayBefore, 0), 0);
        oneDayBeforeAt9AM.setHours(9, 0, 0, 0);
        
        if (oneDayBeforeAt9AM > now) {
          notifications.push({
            id: notificationId++,
            title: '📅 Appointment Tomorrow',
            body: `${appointment.type} tomorrow at ${appointment.time}. Location: ${appointment.location || 'Not specified'}`,
            schedule: { at: oneDayBeforeAt9AM },
            sound: undefined,
            attachments: undefined,
            actionTypeId: '',
            extra: null,
          });
        }

        // 1 hour before reminder
        const oneHourBefore = setMilliseconds(setSeconds(subHours(appointmentDate, 1), 0), 0);
        
        if (oneHourBefore > now) {
          notifications.push({
            id: notificationId++,
            title: '⏰ Appointment in 1 Hour',
            body: `${appointment.type} at ${appointment.time}. Don't forget your documents and medical records!`,
            schedule: { at: oneHourBefore },
            sound: undefined,
            attachments: undefined,
            actionTypeId: '',
            extra: null,
          });
        }

        // Optional: 15 minutes before reminder for last-minute preparation
        const fifteenMinsBefore = setMilliseconds(setSeconds(new Date(appointmentDate.getTime() - 15 * 60 * 1000), 0), 0);
        
        if (fifteenMinsBefore > now) {
          notifications.push({
            id: notificationId++,
            title: '🚗 Time to Leave',
            body: `${appointment.type} in 15 minutes at ${appointment.location || 'your appointment location'}`,
            schedule: { at: fifteenMinsBefore },
            sound: undefined,
            attachments: undefined,
            actionTypeId: '',
            extra: null,
          });
        }
      }
    });

    if (notifications.length > 0) {
      await LocalNotifications.schedule({ notifications });
      console.log(`✓ Scheduled ${notifications.length} appointment reminders (completely offline)`);
    }
  } catch (error) {
    console.error('Error scheduling appointment reminders:', error);
  }
};

// Re-schedule all appointment reminders
export const rescheduleAppointmentReminders = async (): Promise<void> => {
  await scheduleAppointmentReminders();
};
