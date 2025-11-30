import { LocalNotifications } from "@capacitor/local-notifications";
import { loadWaterReminderSettings } from "./waterReminderStorage";
import { requestNotificationPermission } from "./notifications";
import { setHours, setMinutes, setSeconds, setMilliseconds } from "date-fns";

export const scheduleWaterReminders = async () => {
  const settings = loadWaterReminderSettings();

  if (!settings.enabled) {
    await cancelWaterReminders();
    return;
  }

  try {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      console.log("Notification permission not granted");
      return;
    }

    // Cancel existing water reminders
    await cancelWaterReminders();

    const now = new Date();
    const notifications = settings.times.map((time, index) => {
      const [hours, minutes] = time.split(":").map(Number);
      
      // Create first notification with exact time
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

      return {
        id: 5000 + index,
        title: "💧 Time to Hydrate!",
        body: `Drink a glass of water. Daily goal: ${settings.dailyGoal} glasses`,
        schedule: {
          at: firstNotification,
          every: 'day' as const, // Repeat daily at exact time
        },
        sound: undefined,
        attachments: undefined,
        actionTypeId: '',
        extra: null,
      };
    });

    if (notifications.length > 0) {
      await LocalNotifications.schedule({ notifications });
      console.log(`✓ Scheduled ${notifications.length} water reminders (completely offline)`);
    }
  } catch (error) {
    console.error("Error scheduling water reminders:", error);
  }
};

export const cancelWaterReminders = async () => {
  try {
    // Cancel all water reminder IDs (5000-5099)
    await LocalNotifications.cancel({ 
      notifications: Array.from({ length: 100 }, (_, i) => ({ id: 5000 + i }))
    });
  } catch (error) {
    console.error("Error canceling water reminders:", error);
  }
};

export const updateWaterReminders = async () => {
  await scheduleWaterReminders();
};
