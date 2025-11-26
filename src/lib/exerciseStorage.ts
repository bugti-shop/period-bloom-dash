export interface ExerciseEntry {
  id: string;
  date: string;
  type: string;
  duration: number;
  intensity: "low" | "moderate" | "high";
  notes?: string;
}

const STORAGE_KEY = "exercise_activity_log";

export const loadExerciseEntries = (): ExerciseEntry[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveExerciseEntry = (entry: Omit<ExerciseEntry, "id">): void => {
  const entries = loadExerciseEntries();
  const newEntry: ExerciseEntry = {
    ...entry,
    id: crypto.randomUUID(),
  };
  entries.push(newEntry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
};

export const updateExerciseEntry = (id: string, updates: Partial<ExerciseEntry>): void => {
  const entries = loadExerciseEntries();
  const index = entries.findIndex((e) => e.id === id);
  if (index !== -1) {
    entries[index] = { ...entries[index], ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }
};

export const deleteExerciseEntry = (id: string): void => {
  const entries = loadExerciseEntries().filter((e) => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
};
