export interface CervicalMucusEntry {
  id: string;
  date: string;
  type: "dry" | "sticky" | "creamy" | "watery" | "egg-white";
  amount: "none" | "light" | "moderate" | "heavy";
  notes?: string;
}

const STORAGE_KEY = "cervical_mucus_log";

export const loadCervicalMucusEntries = (): CervicalMucusEntry[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveCervicalMucusEntry = (entry: Omit<CervicalMucusEntry, "id">): void => {
  const entries = loadCervicalMucusEntries();
  const newEntry: CervicalMucusEntry = {
    ...entry,
    id: crypto.randomUUID(),
  };
  entries.push(newEntry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
};

export const updateCervicalMucusEntry = (id: string, updates: Partial<CervicalMucusEntry>): void => {
  const entries = loadCervicalMucusEntries();
  const index = entries.findIndex((e) => e.id === id);
  if (index !== -1) {
    entries[index] = { ...entries[index], ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }
};

export const deleteCervicalMucusEntry = (id: string): void => {
  const entries = loadCervicalMucusEntries().filter((e) => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
};

export const getCervicalMucusEntryByDate = (date: string): CervicalMucusEntry | undefined => {
  return loadCervicalMucusEntries().find((e) => e.date === date);
};
