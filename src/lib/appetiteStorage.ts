import { saveToLocalStorage, loadFromLocalStorage } from "./storage";

export interface AppetiteEntry {
  id: string;
  date: string;
  level: "low" | "normal" | "high";
  cravings?: string;
  aversions?: string;
  notes?: string;
}

const APPETITE_KEY = "appetite-log";

export const saveAppetiteEntry = (entry: AppetiteEntry) => {
  const entries = loadAppetiteLog();
  const existingIndex = entries.findIndex(e => e.id === entry.id);
  
  if (existingIndex >= 0) {
    entries[existingIndex] = entry;
  } else {
    entries.push(entry);
  }
  
  saveToLocalStorage(APPETITE_KEY, entries);
};

export const loadAppetiteLog = (): AppetiteEntry[] => {
  return loadFromLocalStorage<AppetiteEntry[]>(APPETITE_KEY) || [];
};

export const deleteAppetiteEntry = (id: string) => {
  const entries = loadAppetiteLog().filter(e => e.id !== id);
  saveToLocalStorage(APPETITE_KEY, entries);
};
