import { addDays, format, setHours, setMinutes } from "date-fns";
import { LocalNotifications } from '@capacitor/local-notifications';
import { loadFertilityReminders } from "./fertilityReminderStorage";
import { requestNotificationPermission } from "./notifications";

export const scheduleFertilityReminders = async (
  lastPeriodDate: Date,
  cycleLength: number
): Promise<void> => {
  try {
    const reminders = loadFertilityReminders();
    
    if (!reminders.periodStart && !reminders.fertileWindow && !reminders.ovulationDay) {
      return; // No reminders enabled
    }

    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      console.log('Notification permission not granted');
      return;
    }

    // Cancel existing fertility notifications (IDs 10-12)
    await LocalNotifications.cancel({ 
      notifications: [{ id: 10 }, { id: 11 }, { id: 12 }] 
    });

    // Parse reminder time
    const [hours, minutes] = reminders.reminderTime.split(':').map(Number);
    
    // Calculate key dates
    const ovulationDay = cycleLength - 14; // Typically 14 days before next period
    const fertileWindowStart = ovulationDay - 5;
    const nextPeriodDate = addDays(lastPeriodDate, cycleLength);
    const periodReminderDate = addDays(nextPeriodDate, -1); // 1 day before period

    const notifications = [];

    // Schedule Period Start Reminder
    if (reminders.periodStart) {
      const periodNotificationDate = setMinutes(setHours(periodReminderDate, hours), minutes);
      
      notifications.push({
        title: "Period Starting Soon",
        body: `Your period is expected to start tomorrow (${format(nextPeriodDate, "MMM d")})`,
        id: 10,
        schedule: { at: periodNotificationDate },
        sound: undefined,
        attachments: undefined,
        actionTypeId: '',
        extra: null,
      });
    }

    // Schedule Fertile Window Reminder
    if (reminders.fertileWindow) {
      const fertileWindowDate = addDays(lastPeriodDate, fertileWindowStart);
      const fertileNotificationDate = setMinutes(setHours(fertileWindowDate, hours), minutes);
      
      notifications.push({
        title: "Fertile Window Starting",
        body: "Your fertile window is beginning. This is a good time for conception.",
        id: 11,
        schedule: { at: fertileNotificationDate },
        sound: undefined,
        attachments: undefined,
        actionTypeId: '',
        extra: null,
      });
    }

    // Schedule Ovulation Day Reminder
    if (reminders.ovulationDay) {
      const ovulationDate = addDays(lastPeriodDate, ovulationDay);
      const ovulationNotificationDate = setMinutes(setHours(ovulationDate, hours), minutes);
      
      notifications.push({
        title: "Peak Fertility Day",
        body: "Today is your ovulation day - your most fertile day of the cycle!",
        id: 12,
        schedule: { at: ovulationNotificationDate },
        sound: undefined,
        attachments: undefined,
        actionTypeId: '',
        extra: null,
      });
    }

    if (notifications.length > 0) {
      await LocalNotifications.schedule({ notifications });
    }
  } catch (error) {
    console.error('Error scheduling fertility reminders:', error);
  }
};
