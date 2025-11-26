import { LocalNotifications } from "@capacitor/local-notifications";
import { loadWaterReminderSettings } from "./waterReminderStorage";
import { notifyInfo } from "./notificationWithHaptics";

export const scheduleWaterReminders = async () => {
  const settings = loadWaterReminderSettings();

  if (!settings.enabled) {
    await cancelWaterReminders();
    return;
  }

  try {
    // Request permissions
    const permission = await LocalNotifications.requestPermissions();
    if (permission.display !== "granted") {
      console.log("Notification permission not granted");
      return;
    }

    // Cancel existing reminders
    await cancelWaterReminders();

    // Schedule new reminders for each time
    const notifications = settings.times.map((time, index) => {
      const [hours, minutes] = time.split(":").map(Number);
      const now = new Date();
      const scheduleTime = new Date();
      scheduleTime.setHours(hours, minutes, 0, 0);

      // If time has passed today, schedule for tomorrow
      if (scheduleTime <= now) {
        scheduleTime.setDate(scheduleTime.getDate() + 1);
      }

      return {
        id: 5000 + index, // Water reminder IDs start at 5000
        title: "💧 Time to Hydrate!",
        body: `Drink a glass of water. Goal: ${settings.dailyGoal} glasses/day`,
        schedule: {
          at: scheduleTime,
          every: "day" as const,
        },
        sound: "default" as const,
        smallIcon: "ic_stat_icon_config_sample",
      };
    });

    await LocalNotifications.schedule({ notifications });
    console.log(`Scheduled ${notifications.length} water reminders`);
  } catch (error) {
    console.error("Error scheduling water reminders:", error);
  }
};

export const cancelWaterReminders = async () => {
  try {
    const settings = loadWaterReminderSettings();
    const ids = settings.times.map((_, index) => ({ id: 5000 + index }));
    if (ids.length > 0) {
      await LocalNotifications.cancel({ notifications: ids });
    }
  } catch (error) {
    console.error("Error canceling water reminders:", error);
  }
};

export const sendWaterReminderNow = async (message?: string) => {
  await notifyInfo(
    "💧 Hydration Reminder",
    message || "Don't forget to drink water!"
  );
};
