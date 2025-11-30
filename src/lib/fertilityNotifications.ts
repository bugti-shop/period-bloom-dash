import { addDays, format, setHours, setMinutes, setSeconds, isAfter, isBefore, startOfDay } from "date-fns";
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

    // Cancel all existing fertility notifications (IDs 10-30)
    const notificationIdsToCancel = Array.from({ length: 21 }, (_, i) => ({ id: 10 + i }));
    await LocalNotifications.cancel({ 
      notifications: notificationIdsToCancel
    });

    // Parse reminder time
    const [hours, minutes] = reminders.reminderTime.split(':').map(Number);
    
    // Calculate key dates
    const ovulationDay = cycleLength - 14; // Typically 14 days before next period
    const fertileWindowStart = Math.max(1, ovulationDay - 5); // 5 days before ovulation
    const fertileWindowEnd = ovulationDay + 1; // 1 day after ovulation
    const nextPeriodDate = addDays(lastPeriodDate, cycleLength);
    const today = new Date();

    const notifications = [];
    let notificationId = 10;

    // Helper function to create notification date with exact time
    const createNotificationDate = (baseDate: Date): Date => {
      let notifDate = setSeconds(setMinutes(setHours(baseDate, hours), minutes), 0);
      
      // If the notification time is in the past, skip it
      if (isBefore(notifDate, today)) {
        return null;
      }
      
      return notifDate;
    };

    // Schedule Period Start Reminder (1 day before)
    if (reminders.periodStart) {
      const periodReminderDate = addDays(nextPeriodDate, -1);
      const periodNotificationDate = createNotificationDate(periodReminderDate);
      
      if (periodNotificationDate) {
        notifications.push({
          title: "Period Starting Soon 🌸",
          body: `Your period is expected to start tomorrow (${format(nextPeriodDate, "MMM d")}). Be prepared!`,
          id: notificationId++,
          schedule: { at: periodNotificationDate },
          sound: undefined,
          attachments: undefined,
          actionTypeId: '',
          extra: null,
        });
      }
    }

    // Schedule Fertile Window Reminders (daily during fertile window)
    if (reminders.fertileWindow) {
      // First notification - Fertile window starting (5 days before ovulation)
      const fertileStartDate = addDays(lastPeriodDate, fertileWindowStart);
      const fertileStartNotificationDate = createNotificationDate(fertileStartDate);
      
      if (fertileStartNotificationDate) {
        notifications.push({
          title: "Fertile Window Starting 💚",
          body: "Your fertile window is beginning today! This is a good time for conception.",
          id: notificationId++,
          schedule: { at: fertileStartNotificationDate },
          sound: undefined,
          attachments: undefined,
          actionTypeId: '',
          extra: null,
        });
      }

      // Daily reminders during fertile window (up to ovulation day)
      for (let dayOffset = fertileWindowStart + 1; dayOffset < ovulationDay; dayOffset++) {
        const fertileDay = addDays(lastPeriodDate, dayOffset);
        const fertileDayNotificationDate = createNotificationDate(fertileDay);
        
        if (fertileDayNotificationDate) {
          const daysToOvulation = ovulationDay - dayOffset;
          notifications.push({
            title: "High Fertility Period 🌟",
            body: `You're in your fertile window! Ovulation expected in ${daysToOvulation} day${daysToOvulation !== 1 ? 's' : ''}.`,
            id: notificationId++,
            schedule: { at: fertileDayNotificationDate },
            sound: undefined,
            attachments: undefined,
            actionTypeId: '',
            extra: null,
          });
        }
      }

      // Last fertile day (1 day after ovulation)
      const lastFertileDate = addDays(lastPeriodDate, fertileWindowEnd);
      const lastFertileNotificationDate = createNotificationDate(lastFertileDate);
      
      if (lastFertileNotificationDate) {
        notifications.push({
          title: "Fertile Window Ending 🌙",
          body: "This is the last day of your fertile window.",
          id: notificationId++,
          schedule: { at: lastFertileNotificationDate },
          sound: undefined,
          attachments: undefined,
          actionTypeId: '',
          extra: null,
        });
      }
    }

    // Schedule Ovulation Day Reminder (exact day)
    if (reminders.ovulationDay) {
      const ovulationDate = addDays(lastPeriodDate, ovulationDay);
      const ovulationNotificationDate = createNotificationDate(ovulationDate);
      
      if (ovulationNotificationDate) {
        notifications.push({
          title: "Peak Fertility Day 🎯",
          body: "Today is your ovulation day - your most fertile day of the cycle! Highest chance of conception.",
          id: notificationId++,
          schedule: { at: ovulationNotificationDate },
          sound: undefined,
          attachments: undefined,
          actionTypeId: '',
          extra: null,
        });
      }

      // Reminder the day before ovulation
      const preOvulationDate = addDays(lastPeriodDate, ovulationDay - 1);
      const preOvulationNotificationDate = createNotificationDate(preOvulationDate);
      
      if (preOvulationNotificationDate) {
        notifications.push({
          title: "Ovulation Tomorrow 🌟",
          body: "Your most fertile day is tomorrow! Prepare for peak fertility.",
          id: notificationId++,
          schedule: { at: preOvulationNotificationDate },
          sound: undefined,
          attachments: undefined,
          actionTypeId: '',
          extra: null,
        });
      }
    }

    if (notifications.length > 0) {
      await LocalNotifications.schedule({ notifications });
      console.log(`Successfully scheduled ${notifications.length} fertility notifications`);
    }
  } catch (error) {
    console.error('Error scheduling fertility reminders:', error);
  }
};

// Function to reschedule notifications when settings change
export const rescheduleFertilityNotifications = async (
  lastPeriodDate: Date,
  cycleLength: number
): Promise<void> => {
  await scheduleFertilityReminders(lastPeriodDate, cycleLength);
};
