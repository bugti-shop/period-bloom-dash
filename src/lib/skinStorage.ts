import { saveToLocalStorage, loadFromLocalStorage } from "./storage";
import { format } from "date-fns";

export interface SkinLog {
  date: string;
  conditions: string[];
  severity: { [condition: string]: number }; // 1-5 scale
  photos: string[]; // base64 encoded images
  notes: string;
}

const STORAGE_KEY = "skin-logs";

export const skinConditions = [
  "Acne/Breakouts",
  "Dryness",
  "Oiliness",
  "Redness",
  "Sensitivity",
  "Dark circles",
  "Puffiness",
  "Clear skin",
];

export const saveSkinLog = (
  date: Date,
  conditions: string[],
  severity: { [condition: string]: number },
  photos: string[],
  notes: string
) => {
  const logs = loadFromLocalStorage<SkinLog[]>(STORAGE_KEY) || [];
  const dateStr = format(date, "yyyy-MM-dd");
  
  const existingIndex = logs.findIndex(log => log.date === dateStr);
  
  if (existingIndex !== -1) {
    logs[existingIndex] = { date: dateStr, conditions, severity, photos, notes };
  } else {
    logs.push({ date: dateStr, conditions, severity, photos, notes });
  }
  
  saveToLocalStorage(STORAGE_KEY, logs);
};

export const getSkinForDate = (date: Date): SkinLog | null => {
  const logs = loadFromLocalStorage<SkinLog[]>(STORAGE_KEY) || [];
  const dateStr = format(date, "yyyy-MM-dd");
  return logs.find(log => log.date === dateStr) || null;
};

export const getAllSkinLogs = (): SkinLog[] => {
  return loadFromLocalStorage<SkinLog[]>(STORAGE_KEY) || [];
};

export const getMostCommonCondition = (): string | null => {
  const logs = getAllSkinLogs();
  if (logs.length === 0) return null;
  
  const conditionCounts: { [key: string]: number } = {};
  logs.forEach(log => {
    log.conditions.forEach(condition => {
      if (condition !== "Clear skin") {
        conditionCounts[condition] = (conditionCounts[condition] || 0) + 1;
      }
    });
  });
  
  const sorted = Object.entries(conditionCounts).sort((a, b) => b[1] - a[1]);
  return sorted[0]?.[0] || null;
};
