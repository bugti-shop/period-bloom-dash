import { saveToLocalStorage, loadFromLocalStorage } from "./storage";
import { format } from "date-fns";

export interface MoodLog {
  date: string;
  mood: string;
  emoji: string;
}

const STORAGE_KEY = "mood-logs";

export const saveMoodLog = (date: Date, mood: string, emoji: string) => {
  const logs = loadFromLocalStorage<MoodLog[]>(STORAGE_KEY) || [];
  const dateStr = format(date, "yyyy-MM-dd");
  
  const existingIndex = logs.findIndex(log => log.date === dateStr);
  
  if (existingIndex !== -1) {
    logs[existingIndex] = { date: dateStr, mood, emoji };
  } else {
    logs.push({ date: dateStr, mood, emoji });
  }
  
  saveToLocalStorage(STORAGE_KEY, logs);
};

export const getMoodForDate = (date: Date): MoodLog | null => {
  const logs = loadFromLocalStorage<MoodLog[]>(STORAGE_KEY) || [];
  const dateStr = format(date, "yyyy-MM-dd");
  return logs.find(log => log.date === dateStr) || null;
};

export const getAllMoodLogs = (): MoodLog[] => {
  return loadFromLocalStorage<MoodLog[]>(STORAGE_KEY) || [];
};
