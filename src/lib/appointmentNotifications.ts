import { LocalNotifications } from '@capacitor/local-notifications';
import { requestNotificationPermission } from './notifications';
import { getAppointments, Appointment } from './appointmentStorage';
import { subHours, subDays } from 'date-fns';

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

    appointments.forEach((appointment, index) => {
      const appointmentDate = new Date(appointment.date);
      
      // Only schedule future appointments
      if (appointmentDate > now) {
        // 1 day before reminder
        const oneDayBefore = subDays(appointmentDate, 1);
        if (oneDayBefore > now) {
          notifications.push({
            id: 3000 + (index * 3),
            title: '📅 Appointment Tomorrow',
            body: `${appointment.type} appointment at ${appointment.time}. ${appointment.location || ''}`,
            schedule: { at: oneDayBefore },
            sound: undefined,
            attachments: undefined,
            actionTypeId: '',
            extra: null,
          });
        }

        // 2 hours before reminder
        const twoHoursBefore = subHours(appointmentDate, 2);
        if (twoHoursBefore > now) {
          notifications.push({
            id: 3000 + (index * 3) + 1,
            title: '⏰ Appointment in 2 Hours',
            body: `${appointment.type} at ${appointment.time}. Don't forget your documents!`,
            schedule: { at: twoHoursBefore },
            sound: undefined,
            attachments: undefined,
            actionTypeId: '',
            extra: null,
          });
        }

        // 30 minutes before reminder
        const thirtyMinsBefore = new Date(appointmentDate.getTime() - 30 * 60 * 1000);
        if (thirtyMinsBefore > now) {
          notifications.push({
            id: 3000 + (index * 3) + 2,
            title: '🚗 Time to Leave',
            body: `${appointment.type} in 30 minutes at ${appointment.location || 'your appointment location'}`,
            schedule: { at: thirtyMinsBefore },
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
      console.log(`Scheduled ${notifications.length} appointment reminders`);
    }
  } catch (error) {
    console.error('Error scheduling appointment reminders:', error);
  }
};
