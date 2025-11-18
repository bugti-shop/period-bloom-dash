import { saveToLocalStorage, loadFromLocalStorage } from "./storage";
import { differenceInWeeks, addWeeks } from "date-fns";

export interface PregnancyData {
  isPregnancyMode: boolean;
  lastPeriodDate?: Date;
  dueDate?: Date;
  currentWeek?: number;
  manualWeekOverride?: number; // Manual week selection
}

const PREGNANCY_MODE_KEY = "pregnancy-mode";

export const savePregnancyMode = (data: PregnancyData): void => {
  saveToLocalStorage(PREGNANCY_MODE_KEY, data);
};

export const loadPregnancyMode = (): PregnancyData => {
  const data = loadFromLocalStorage<PregnancyData>(PREGNANCY_MODE_KEY);
  if (!data) {
    return { isPregnancyMode: false };
  }
  
  // Convert string dates back to Date objects
  return {
    ...data,
    lastPeriodDate: data.lastPeriodDate ? new Date(data.lastPeriodDate) : undefined,
    dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
  };
};

export const calculatePregnancyWeek = (lastPeriodDate: Date): number => {
  const weeks = differenceInWeeks(new Date(), lastPeriodDate);
  return Math.max(0, Math.min(40, weeks)); // Clamp between 0-40 weeks
};

export const calculateDueDate = (lastPeriodDate: Date): Date => {
  return addWeeks(lastPeriodDate, 40);
};

export const calculateTrimester = (week: number): 1 | 2 | 3 => {
  if (week <= 13) return 1;
  if (week <= 26) return 2;
  return 3;
};

export const getProgressPercentage = (week: number): number => {
  return Math.round((week / 40) * 100);
};
