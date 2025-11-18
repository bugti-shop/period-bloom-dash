import { saveToLocalStorage, loadFromLocalStorage } from "./storage";

export type FlowIntensity = "light" | "medium" | "heavy" | "spotting";

export interface FlowEntry {
  date: string; // YYYY-MM-DD format
  intensity: FlowIntensity;
}

const FLOW_INTENSITY_KEY = "flow-intensity-log";

export const saveFlowIntensity = (date: Date, intensity: FlowIntensity): void => {
  const entries = loadFlowIntensities();
  const dateStr = date.toISOString().split('T')[0];
  
  // Remove existing entry for this date
  const filtered = entries.filter(e => e.date !== dateStr);
  
  // Add new entry
  filtered.push({ date: dateStr, intensity });
  
  saveToLocalStorage(FLOW_INTENSITY_KEY, filtered);
};

export const loadFlowIntensities = (): FlowEntry[] => {
  return loadFromLocalStorage<FlowEntry[]>(FLOW_INTENSITY_KEY) || [];
};

export const getFlowIntensityForDate = (date: Date): FlowIntensity | null => {
  const dateStr = date.toISOString().split('T')[0];
  const entries = loadFlowIntensities();
  const entry = entries.find(e => e.date === dateStr);
  return entry ? entry.intensity : null;
};

export const getFlowColor = (intensity: FlowIntensity | null): string => {
  if (!intensity) return "";
  switch (intensity) {
    case "spotting":
      return "bg-pink-200";
    case "light":
      return "bg-pink-400";
    case "medium":
      return "bg-pink-600";
    case "heavy":
      return "bg-pink-800";
    default:
      return "";
  }
};
