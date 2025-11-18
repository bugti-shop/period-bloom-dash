import { saveToLocalStorage, loadFromLocalStorage } from "./storage";

export interface Medication {
  id: string;
  name: string;
  type: "pill" | "vitamin" | "contraception" | "other";
  dosage: string;
  frequency: "daily" | "twice-daily" | "weekly" | "as-needed";
  time?: string; // HH:MM format for daily reminders
  reminderEnabled: boolean;
  startDate: Date;
  notes?: string;
}

const MEDICATION_KEY = "medications";

export const saveMedications = (medications: Medication[]): void => {
  saveToLocalStorage(MEDICATION_KEY, medications);
};

export const loadMedications = (): Medication[] => {
  const stored = loadFromLocalStorage<Medication[]>(MEDICATION_KEY);
  if (!stored) return [];
  // Convert date strings back to Date objects
  return stored.map(med => ({
    ...med,
    startDate: new Date(med.startDate),
  }));
};

export const addMedication = (medication: Medication): void => {
  const medications = loadMedications();
  medications.push(medication);
  saveMedications(medications);
};

export const updateMedication = (id: string, updates: Partial<Medication>): void => {
  const medications = loadMedications();
  const index = medications.findIndex(m => m.id === id);
  if (index !== -1) {
    medications[index] = { ...medications[index], ...updates };
    saveMedications(medications);
  }
};

export const deleteMedication = (id: string): void => {
  const medications = loadMedications();
  saveMedications(medications.filter(m => m.id !== id));
};

export const logMedicationTaken = (medicationId: string, date: Date): void => {
  const key = `medication-log-${medicationId}`;
  const log = loadFromLocalStorage<Date[]>(key) || [];
  log.push(date);
  saveToLocalStorage(key, log);
};

export const getMedicationLog = (medicationId: string): Date[] => {
  const key = `medication-log-${medicationId}`;
  const log = loadFromLocalStorage<Date[]>(key) || [];
  return log.map(d => new Date(d));
};
