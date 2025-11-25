import { saveToLocalStorage, loadFromLocalStorage } from "./storage";

export interface FertilityReminder {
  fertileWindow: boolean;
  ovulationDay: boolean;
  periodStart: boolean;
  reminderTime: string; // Format: "HH:mm"
}

const FERTILITY_REMINDER_KEY = "fertility-reminders";

const DEFAULT_REMINDERS: FertilityReminder = {
  fertileWindow: false,
  ovulationDay: false,
  periodStart: true,
  reminderTime: "09:00",
};

export const saveFertilityReminders = (reminders: FertilityReminder): void => {
  saveToLocalStorage(FERTILITY_REMINDER_KEY, reminders);
};

export const loadFertilityReminders = (): FertilityReminder => {
  const saved = loadFromLocalStorage<FertilityReminder>(FERTILITY_REMINDER_KEY);
  return saved || DEFAULT_REMINDERS;
};

export const toggleFertileWindowReminder = (): void => {
  const reminders = loadFertilityReminders();
  reminders.fertileWindow = !reminders.fertileWindow;
  saveFertilityReminders(reminders);
};

export const toggleOvulationReminder = (): void => {
  const reminders = loadFertilityReminders();
  reminders.ovulationDay = !reminders.ovulationDay;
  saveFertilityReminders(reminders);
};

export const togglePeriodStartReminder = (): void => {
  const reminders = loadFertilityReminders();
  reminders.periodStart = !reminders.periodStart;
  saveFertilityReminders(reminders);
};

export const updateReminderTime = (time: string): void => {
  const reminders = loadFertilityReminders();
  reminders.reminderTime = time;
  saveFertilityReminders(reminders);
};
