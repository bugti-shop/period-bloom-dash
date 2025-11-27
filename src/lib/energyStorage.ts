import { saveToLocalStorage, loadFromLocalStorage } from "./storage";
import { format } from "date-fns";

export interface EnergyLog {
  date: string;
  morning: number; // 1-10 scale
  afternoon: number;
  evening: number;
  notes: string;
}

const STORAGE_KEY = "energy-logs";

export const saveEnergyLog = (
  date: Date,
  morning: number,
  afternoon: number,
  evening: number,
  notes: string
) => {
  const logs = loadFromLocalStorage<EnergyLog[]>(STORAGE_KEY) || [];
  const dateStr = format(date, "yyyy-MM-dd");
  
  const existingIndex = logs.findIndex(log => log.date === dateStr);
  
  if (existingIndex !== -1) {
    logs[existingIndex] = { date: dateStr, morning, afternoon, evening, notes };
  } else {
    logs.push({ date: dateStr, morning, afternoon, evening, notes });
  }
  
  saveToLocalStorage(STORAGE_KEY, logs);
};

export const getEnergyForDate = (date: Date): EnergyLog | null => {
  const logs = loadFromLocalStorage<EnergyLog[]>(STORAGE_KEY) || [];
  const dateStr = format(date, "yyyy-MM-dd");
  return logs.find(log => log.date === dateStr) || null;
};

export const getAllEnergyLogs = (): EnergyLog[] => {
  return loadFromLocalStorage<EnergyLog[]>(STORAGE_KEY) || [];
};

export const getAverageEnergyByTime = (days: number = 7): {
  morning: number;
  afternoon: number;
  evening: number;
} => {
  const logs = getAllEnergyLogs().slice(-days);
  if (logs.length === 0) return { morning: 0, afternoon: 0, evening: 0 };
  
  const sum = logs.reduce(
    (acc, log) => ({
      morning: acc.morning + log.morning,
      afternoon: acc.afternoon + log.afternoon,
      evening: acc.evening + log.evening,
    }),
    { morning: 0, afternoon: 0, evening: 0 }
  );
  
  return {
    morning: Math.round((sum.morning / logs.length) * 10) / 10,
    afternoon: Math.round((sum.afternoon / logs.length) * 10) / 10,
    evening: Math.round((sum.evening / logs.length) * 10) / 10,
  };
};
