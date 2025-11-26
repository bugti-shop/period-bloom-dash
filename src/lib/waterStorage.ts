export interface WaterEntry {
  id: string;
  date: string;
  glasses: number;
  goal: number;
  notes?: string;
}

const STORAGE_KEY = "water_intake_log";

export const loadWaterEntries = (): WaterEntry[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveWaterEntry = (entry: Omit<WaterEntry, "id">): void => {
  const entries = loadWaterEntries();
  const newEntry: WaterEntry = {
    ...entry,
    id: crypto.randomUUID(),
  };
  entries.push(newEntry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
};

export const updateWaterEntry = (id: string, updates: Partial<WaterEntry>): void => {
  const entries = loadWaterEntries();
  const index = entries.findIndex((e) => e.id === id);
  if (index !== -1) {
    entries[index] = { ...entries[index], ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }
};

export const deleteWaterEntry = (id: string): void => {
  const entries = loadWaterEntries().filter((e) => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
};

export const getWaterEntryByDate = (date: string): WaterEntry | undefined => {
  return loadWaterEntries().find((e) => e.date === date);
};
