import { saveToLocalStorage, loadFromLocalStorage } from "./storage";

export interface BBTReading {
  id: string;
  date: string;
  temperature: number; // in Celsius
  notes?: string;
}

const BBT_KEY = "bbt-readings";

export const saveBBTReading = (reading: BBTReading) => {
  const readings = loadBBTReadings();
  const existingIndex = readings.findIndex(r => r.id === reading.id);
  
  if (existingIndex >= 0) {
    readings[existingIndex] = reading;
  } else {
    readings.push(reading);
  }
  
  // Sort by date
  readings.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  saveToLocalStorage(BBT_KEY, readings);
};

export const loadBBTReadings = (): BBTReading[] => {
  return loadFromLocalStorage<BBTReading[]>(BBT_KEY) || [];
};

export const deleteBBTReading = (id: string) => {
  const readings = loadBBTReadings().filter(r => r.id !== id);
  saveToLocalStorage(BBT_KEY, readings);
};
