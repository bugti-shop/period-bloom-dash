import { saveToLocalStorage, loadFromLocalStorage } from "./storage";

export interface GlucoseReading {
  id: string;
  date: Date;
  time: string;
  glucose: number;
  unit: "mg/dL" | "mmol/L";
  mealType: "fasting" | "before-meal" | "after-meal" | "bedtime";
  week: number;
  notes?: string;
}

const GLUCOSE_KEY = "pregnancy-glucose-readings";

export const saveGlucoseReading = (reading: Omit<GlucoseReading, "id">): void => {
  const readings = getGlucoseReadings();
  const newReading: GlucoseReading = {
    ...reading,
    id: Date.now().toString(),
  };
  readings.push(newReading);
  saveToLocalStorage(GLUCOSE_KEY, readings);
};

export const getGlucoseReadings = (): GlucoseReading[] => {
  const readings = loadFromLocalStorage<GlucoseReading[]>(GLUCOSE_KEY);
  if (!readings) return [];
  
  return readings.map(reading => ({
    ...reading,
    date: new Date(reading.date)
  })).sort((a, b) => b.date.getTime() - a.date.getTime());
};

export const deleteGlucoseReading = (id: string): void => {
  const readings = getGlucoseReadings().filter((r) => r.id !== id);
  saveToLocalStorage(GLUCOSE_KEY, readings);
};

export const analyzeGlucoseLevel = (glucose: number, mealType: string, unit: string): { level: string; alert: boolean; message: string } => {
  // Convert to mg/dL if needed
  const glucoseMgDl = unit === "mmol/L" ? glucose * 18 : glucose;
  
  const ranges = {
    fasting: { min: 60, max: 95 },
    "before-meal": { min: 60, max: 95 },
    "after-meal": { min: 70, max: 140 },
    bedtime: { min: 60, max: 120 }
  };
  
  const range = ranges[mealType as keyof typeof ranges] || ranges.fasting;
  
  if (glucoseMgDl > range.max) {
    return {
      level: "High",
      alert: true,
      message: `Your glucose level is elevated for ${mealType}. Contact your healthcare provider.`
    };
  } else if (glucoseMgDl < range.min) {
    return {
      level: "Low",
      alert: true,
      message: "Your glucose level is low. If you feel symptoms of hypoglycemia, treat immediately and contact your doctor."
    };
  } else {
    return {
      level: "Normal",
      alert: false,
      message: `Your glucose level is within the normal range for ${mealType}.`
    };
  }
};

export const getAverageGlucose = (readings: GlucoseReading[]): number => {
  if (readings.length === 0) return 0;
  
  const sum = readings.reduce((acc, reading) => {
    const glucoseMgDl = reading.unit === "mmol/L" ? reading.glucose * 18 : reading.glucose;
    return acc + glucoseMgDl;
  }, 0);
  
  return Math.round(sum / readings.length);
};
