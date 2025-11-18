import { saveToLocalStorage, loadFromLocalStorage } from "./storage";

export interface IntimacyEntry {
  id: string;
  date: string;
  notes?: string;
  protection: boolean;
}

const INTIMACY_KEY = "intimacy-log";

export const saveIntimacyEntry = (entry: IntimacyEntry) => {
  const entries = loadIntimacyLog();
  const existingIndex = entries.findIndex(e => e.id === entry.id);
  
  if (existingIndex >= 0) {
    entries[existingIndex] = entry;
  } else {
    entries.push(entry);
  }
  
  saveToLocalStorage(INTIMACY_KEY, entries);
};

export const loadIntimacyLog = (): IntimacyEntry[] => {
  return loadFromLocalStorage<IntimacyEntry[]>(INTIMACY_KEY) || [];
};

export const deleteIntimacyEntry = (id: string) => {
  const entries = loadIntimacyLog().filter(e => e.id !== id);
  saveToLocalStorage(INTIMACY_KEY, entries);
};
