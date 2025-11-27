import { saveToLocalStorage, loadFromLocalStorage } from "./storage";
import { format } from "date-fns";

export interface StressLog {
  date: string;
  level: number; // 1-10 scale
  triggers: string[];
  notes: string;
}

const STORAGE_KEY = "stress-logs";

export const saveStressLog = (date: Date, level: number, triggers: string[], notes: string) => {
  const logs = loadFromLocalStorage<StressLog[]>(STORAGE_KEY) || [];
  const dateStr = format(date, "yyyy-MM-dd");
  
  const existingIndex = logs.findIndex(log => log.date === dateStr);
  
  if (existingIndex !== -1) {
    logs[existingIndex] = { date: dateStr, level, triggers, notes };
  } else {
    logs.push({ date: dateStr, level, triggers, notes });
  }
  
  saveToLocalStorage(STORAGE_KEY, logs);
};

export const getStressForDate = (date: Date): StressLog | null => {
  const logs = loadFromLocalStorage<StressLog[]>(STORAGE_KEY) || [];
  const dateStr = format(date, "yyyy-MM-dd");
  return logs.find(log => log.date === dateStr) || null;
};

export const getAllStressLogs = (): StressLog[] => {
  return loadFromLocalStorage<StressLog[]>(STORAGE_KEY) || [];
};

export const getAverageStressLevel = (days: number = 7): number => {
  const logs = getAllStressLogs();
  if (logs.length === 0) return 0;
  
  const recentLogs = logs.slice(-days);
  const sum = recentLogs.reduce((acc, log) => acc + log.level, 0);
  return Math.round(sum / recentLogs.length);
};
