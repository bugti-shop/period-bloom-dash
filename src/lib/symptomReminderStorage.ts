import { saveToLocalStorage, loadFromLocalStorage } from "./storage";

export interface SymptomReminder {
  enabled: boolean;
  times: string[]; // Array of times in "HH:mm" format
}

const SYMPTOM_REMINDER_KEY = "symptom-logging-reminders";

const DEFAULT_REMINDERS: SymptomReminder = {
  enabled: false,
  times: ["09:00", "15:00", "21:00"], // Morning, afternoon, evening
};

export const saveSymptomReminders = (reminders: SymptomReminder): void => {
  saveToLocalStorage(SYMPTOM_REMINDER_KEY, reminders);
};

export const loadSymptomReminders = (): SymptomReminder => {
  const saved = loadFromLocalStorage<SymptomReminder>(SYMPTOM_REMINDER_KEY);
  return saved || DEFAULT_REMINDERS;
};

export const toggleSymptomReminders = (): void => {
  const reminders = loadSymptomReminders();
  reminders.enabled = !reminders.enabled;
  saveSymptomReminders(reminders);
};

export const addReminderTime = (time: string): void => {
  const reminders = loadSymptomReminders();
  if (!reminders.times.includes(time)) {
    reminders.times.push(time);
    reminders.times.sort();
    saveSymptomReminders(reminders);
  }
};

export const removeReminderTime = (time: string): void => {
  const reminders = loadSymptomReminders();
  reminders.times = reminders.times.filter(t => t !== time);
  saveSymptomReminders(reminders);
};
