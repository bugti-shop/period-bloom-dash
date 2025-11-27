import { saveToLocalStorage, loadFromLocalStorage } from "./storage";
import { format } from "date-fns";

export interface DigestiveLog {
  date: string;
  symptoms: string[];
  severity: { [symptom: string]: number }; // 1-5 scale
  notes: string;
}

const STORAGE_KEY = "digestive-logs";

export const digestiveSymptoms = [
  "Bloating",
  "Nausea",
  "Cramps",
  "Constipation",
  "Diarrhea",
  "Gas",
  "Indigestion",
  "Loss of appetite",
];

export const saveDigestiveLog = (
  date: Date,
  symptoms: string[],
  severity: { [symptom: string]: number },
  notes: string
) => {
  const logs = loadFromLocalStorage<DigestiveLog[]>(STORAGE_KEY) || [];
  const dateStr = format(date, "yyyy-MM-dd");
  
  const existingIndex = logs.findIndex(log => log.date === dateStr);
  
  if (existingIndex !== -1) {
    logs[existingIndex] = { date: dateStr, symptoms, severity, notes };
  } else {
    logs.push({ date: dateStr, symptoms, severity, notes });
  }
  
  saveToLocalStorage(STORAGE_KEY, logs);
};

export const getDigestiveForDate = (date: Date): DigestiveLog | null => {
  const logs = loadFromLocalStorage<DigestiveLog[]>(STORAGE_KEY) || [];
  const dateStr = format(date, "yyyy-MM-dd");
  return logs.find(log => log.date === dateStr) || null;
};

export const getAllDigestiveLogs = (): DigestiveLog[] => {
  return loadFromLocalStorage<DigestiveLog[]>(STORAGE_KEY) || [];
};

export const getMostCommonSymptom = (): string | null => {
  const logs = getAllDigestiveLogs();
  if (logs.length === 0) return null;
  
  const symptomCounts: { [key: string]: number } = {};
  logs.forEach(log => {
    log.symptoms.forEach(symptom => {
      symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
    });
  });
  
  const sorted = Object.entries(symptomCounts).sort((a, b) => b[1] - a[1]);
  return sorted[0]?.[0] || null;
};
