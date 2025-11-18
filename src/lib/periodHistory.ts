import { saveToLocalStorage, loadFromLocalStorage } from "./storage";

export interface PeriodHistoryEntry {
  id: string;
  lastPeriodDate: Date;
  cycleLength: number;
  periodDuration: number;
  timestamp: Date;
}

const HISTORY_KEY = "period-history";

export const savePeriodHistory = (data: {
  lastPeriodDate: Date;
  cycleLength: number;
  periodDuration: number;
}): void => {
  const history = getPeriodHistory();
  
  const newEntry: PeriodHistoryEntry = {
    id: Date.now().toString(),
    lastPeriodDate: data.lastPeriodDate,
    cycleLength: data.cycleLength,
    periodDuration: data.periodDuration,
    timestamp: new Date(),
  };
  
  history.unshift(newEntry);
  saveToLocalStorage(HISTORY_KEY, history);
};

export const getPeriodHistory = (): PeriodHistoryEntry[] => {
  const history = loadFromLocalStorage<PeriodHistoryEntry[]>(HISTORY_KEY);
  if (!history) return [];
  
  // Convert string dates back to Date objects
  return history.map(entry => ({
    ...entry,
    lastPeriodDate: new Date(entry.lastPeriodDate),
    timestamp: new Date(entry.timestamp),
  }));
};

export const deletePeriodEntry = (id: string): void => {
  const history = getPeriodHistory();
  const filtered = history.filter(entry => entry.id !== id);
  saveToLocalStorage(HISTORY_KEY, filtered);
};

export const clearPeriodHistory = (): void => {
  saveToLocalStorage(HISTORY_KEY, []);
};