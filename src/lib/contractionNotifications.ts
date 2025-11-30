import { LocalNotifications } from "@capacitor/local-notifications";
import { requestNotificationPermission } from "./notifications";
import { ContractionSession, calculateFrequency } from "./contractionStorage";

const CONTRACTION_NOTIFICATION_ID = 100;

/**
 * Schedule notification when contractions become regular (active labor pattern)
 */
export const scheduleContractionAlert = async (session: ContractionSession): Promise<void> => {
  try {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      console.log('❌ Notification permission not granted for contractions');
      return;
    }

    if (session.contractions.length < 3) return;

    const completedContractions = session.contractions.filter(c => c.endTime && c.duration);
    if (completedContractions.length < 3) return;

    const frequency = calculateFrequency(session.contractions);
    const avgDuration = completedContractions.reduce((sum, c) => sum + (c.duration || 0), 0) / completedContractions.length;

    // Cancel previous contraction notifications
    await LocalNotifications.cancel({ notifications: [{ id: CONTRACTION_NOTIFICATION_ID }] });

    let shouldAlert = false;
    let title = "";
    let body = "";

    // Transition phase: contractions 2-3 minutes apart, 60-90 seconds long
    if (frequency <= 3 && avgDuration >= 60) {
      shouldAlert = true;
      title = "🚨 Transition Phase Detected";
      body = `Contractions are ${frequency} min apart and ${Math.round(avgDuration)}s long. Contact your healthcare provider immediately!`;
    }
    // Active labor: contractions 3-5 minutes apart, 45-60 seconds long
    else if (frequency <= 5 && avgDuration >= 45) {
      shouldAlert = true;
      title = "⚠️ Active Labor Pattern";
      body = `Contractions are ${frequency} min apart and ${Math.round(avgDuration)}s long. It may be time to go to the hospital. Check with your healthcare provider.`;
    }

    if (shouldAlert) {
      const notificationTime = new Date();
      notificationTime.setSeconds(notificationTime.getSeconds() + 2);

      await LocalNotifications.schedule({
        notifications: [
          {
            id: CONTRACTION_NOTIFICATION_ID,
            title,
            body,
            schedule: { at: notificationTime },
            sound: undefined,
            attachments: undefined,
            actionTypeId: "",
            extra: null,
          },
        ],
      });

      console.log(`✓ Contraction alert scheduled: ${title}`);
    }
  } catch (error) {
    console.error('❌ Error scheduling contraction notification:', error);
  }
};

/**
 * Cancel contraction notifications
 */
export const cancelContractionNotifications = async (): Promise<void> => {
  try {
    await LocalNotifications.cancel({ notifications: [{ id: CONTRACTION_NOTIFICATION_ID }] });
    console.log('✓ Contraction notifications cancelled');
  } catch (error) {
    console.error('❌ Error cancelling contraction notifications:', error);
  }
};
