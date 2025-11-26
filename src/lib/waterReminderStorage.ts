export interface WaterReminderSettings {
  enabled: boolean;
  times: string[]; // Array of times in "HH:mm" format
  dailyGoal: number; // glasses per day
  cycleBasedGoals: {
    menstruation: number; // extra glasses during period
    follicular: number; // extra glasses during follicular phase
    ovulation: number; // extra glasses during ovulation
    luteal: number; // extra glasses during luteal phase
  };
}

const STORAGE_KEY = "water_reminder_settings";

const DEFAULT_SETTINGS: WaterReminderSettings = {
  enabled: false,
  times: ["09:00", "12:00", "15:00", "18:00", "21:00"],
  dailyGoal: 8,
  cycleBasedGoals: {
    menstruation: 2, // +2 glasses during period
    follicular: 0,
    ovulation: 1, // +1 glass during ovulation
    luteal: 1, // +1 glass during luteal phase
  },
};

export const loadWaterReminderSettings = (): WaterReminderSettings => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : DEFAULT_SETTINGS;
};

export const saveWaterReminderSettings = (settings: WaterReminderSettings): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
};

export const getGoalForCyclePhase = (phase: string): number => {
  const settings = loadWaterReminderSettings();
  const baseGoal = settings.dailyGoal;
  
  switch (phase.toLowerCase()) {
    case "menstruation":
    case "period":
      return baseGoal + settings.cycleBasedGoals.menstruation;
    case "follicular":
      return baseGoal + settings.cycleBasedGoals.follicular;
    case "ovulation":
      return baseGoal + settings.cycleBasedGoals.ovulation;
    case "luteal":
      return baseGoal + settings.cycleBasedGoals.luteal;
    default:
      return baseGoal;
  }
};
