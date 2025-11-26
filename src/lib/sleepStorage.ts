export interface SleepEntry {
  id: string;
  date: string;
  hours: number;
  quality: "poor" | "fair" | "good" | "excellent";
  notes?: string;
}

const STORAGE_KEY = "sleep_quality_log";

export const loadSleepEntries = (): SleepEntry[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveSleepEntry = (entry: Omit<SleepEntry, "id">): void => {
  const entries = loadSleepEntries();
  const newEntry: SleepEntry = {
    ...entry,
    id: crypto.randomUUID(),
  };
  entries.push(newEntry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
};

export const updateSleepEntry = (id: string, updates: Partial<SleepEntry>): void => {
  const entries = loadSleepEntries();
  const index = entries.findIndex((e) => e.id === id);
  if (index !== -1) {
    entries[index] = { ...entries[index], ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }
};

export const deleteSleepEntry = (id: string): void => {
  const entries = loadSleepEntries().filter((e) => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
};

export const getSleepEntryByDate = (date: string): SleepEntry | undefined => {
  return loadSleepEntries().find((e) => e.date === date);
};
