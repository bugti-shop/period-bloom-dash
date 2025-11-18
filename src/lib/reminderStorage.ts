import { saveToLocalStorage, loadFromLocalStorage } from "./storage";

export type ReminderType = 
  | "period-start"
  | "pms-alert"
  | "fertile-window"
  | "ovulation"
  | "birth-control"
  | "water-intake"
  | "medication"
  | "daily-note"
  | "cycle-irregularity"
  | "custom";

export interface ReminderSettings {
  type: ReminderType;
  enabled: boolean;
  title: string;
  description?: string;
  daysBeforeEvent?: number; // For period-start, pms-alert
  time?: string; // HH:MM format for daily reminders
  customMessage?: string;
}

const REMINDER_SETTINGS_KEY = "reminder-settings";

const defaultReminders: ReminderSettings[] = [
  {
    type: "period-start",
    enabled: true,
    title: "Period Starting Soon",
    description: "Your period is expected to start in 2 days",
    daysBeforeEvent: 2,
  },
  {
    type: "pms-alert",
    enabled: true,
    title: "PMS Alert",
    description: "PMS symptoms may start soon",
    daysBeforeEvent: 5,
  },
  {
    type: "fertile-window",
    enabled: true,
    title: "Fertile Window",
    description: "Your fertile window is starting",
  },
  {
    type: "ovulation",
    enabled: true,
    title: "Ovulation Day",
    description: "Today is your predicted ovulation day",
  },
  {
    type: "birth-control",
    enabled: false,
    title: "Birth Control Reminder",
    description: "Time to take your birth control pill",
    time: "20:00",
  },
  {
    type: "water-intake",
    enabled: false,
    title: "Drink Water",
    description: "Remember to stay hydrated",
    time: "10:00",
  },
  {
    type: "medication",
    enabled: false,
    title: "Medication Reminder",
    description: "Time to take your medication",
    time: "08:00",
  },
  {
    type: "daily-note",
    enabled: false,
    title: "Daily Log Reminder",
    description: "Don't forget to log your symptoms today",
    time: "21:00",
  },
  {
    type: "cycle-irregularity",
    enabled: true,
    title: "Cycle Irregularity Warning",
    description: "Your cycle is longer than usual",
  },
];

export const saveReminderSettings = (settings: ReminderSettings[]): void => {
  saveToLocalStorage(REMINDER_SETTINGS_KEY, settings);
};

export const loadReminderSettings = (): ReminderSettings[] => {
  const stored = loadFromLocalStorage<ReminderSettings[]>(REMINDER_SETTINGS_KEY);
  return stored || defaultReminders;
};

export const updateReminderSetting = (type: ReminderType, updates: Partial<ReminderSettings>): void => {
  const settings = loadReminderSettings();
  const index = settings.findIndex(s => s.type === type);
  if (index !== -1) {
    settings[index] = { ...settings[index], ...updates };
    saveReminderSettings(settings);
  }
};

export const toggleReminder = (type: ReminderType): void => {
  const settings = loadReminderSettings();
  const setting = settings.find(s => s.type === type);
  if (setting) {
    updateReminderSetting(type, { enabled: !setting.enabled });
  }
};
