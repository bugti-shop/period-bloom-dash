import { requestNotificationPermission } from "./notifications";
import { schedulePeriodReminder } from "./notifications";
import { scheduleFertilityReminders } from "./fertilityNotifications";
import { scheduleSymptomReminders } from "./symptomNotifications";
import { scheduleWaterReminders } from "./waterNotifications";
import { scheduleMedicationReminders } from "./medicationNotifications";
import { scheduleAppointmentReminders } from "./appointmentNotifications";
import { loadFromLocalStorage } from "./storage";
import { addDays } from "date-fns";

/**
 * Initialize ALL app notifications on app startup
 * This ensures all notifications are properly scheduled offline
 */
export const initializeAllNotifications = async (): Promise<void> => {
  try {
    console.log('🔔 Initializing all offline notifications...');
    
    // Request notification permission first
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      console.log('❌ Notification permission not granted');
      return;
    }

    // Load period data
    const periodData = loadFromLocalStorage<any>("current-period-data");
    
    // Schedule period and fertility notifications
    if (periodData?.cycleType === 'regular' && periodData.lastPeriodDate) {
      const lastPeriodDate = new Date(periodData.lastPeriodDate);
      const nextPeriodDate = addDays(lastPeriodDate, periodData.cycleLength);
      
      await Promise.all([
        schedulePeriodReminder(nextPeriodDate, periodData.cycleLength),
        scheduleFertilityReminders(lastPeriodDate, periodData.cycleLength),
      ]);
      
      console.log('✓ Period and fertility notifications scheduled');
    } else if (periodData?.cycleType === 'irregular' && periodData.cycles && periodData.cycles.length > 0) {
      const lastCycle = periodData.cycles[periodData.cycles.length - 1];
      const lastCycleEnd = new Date(lastCycle.endDate);
      const nextPeriodDate = addDays(lastCycleEnd, periodData.mean);
      
      await Promise.all([
        schedulePeriodReminder(nextPeriodDate, periodData.mean),
        scheduleFertilityReminders(lastCycleEnd, periodData.mean),
      ]);
      
      console.log('✓ Period and fertility notifications scheduled (irregular cycle)');
    }

    // Schedule all other notifications in parallel
    await Promise.all([
      scheduleSymptomReminders(),
      scheduleWaterReminders(),
      scheduleMedicationReminders(),
      scheduleAppointmentReminders(),
    ]);

    console.log('✓✓✓ All notifications initialized successfully (completely offline)');
  } catch (error) {
    console.error('❌ Error initializing notifications:', error);
  }
};

/**
 * Re-schedule all notifications when settings change
 */
export const refreshAllNotifications = async (): Promise<void> => {
  await initializeAllNotifications();
};
