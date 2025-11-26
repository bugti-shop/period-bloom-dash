import { saveToLocalStorage, loadFromLocalStorage } from "./storage";

export interface BloodPressureReading {
  id: string;
  date: Date;
  systolic: number;
  diastolic: number;
  heartRate?: number;
  week: number;
  notes?: string;
}

const BLOOD_PRESSURE_KEY = "pregnancy-blood-pressure";

export const saveBloodPressureReading = (reading: Omit<BloodPressureReading, "id">): void => {
  const readings = getBloodPressureReadings();
  const newReading: BloodPressureReading = {
    ...reading,
    id: Date.now().toString(),
  };
  readings.push(newReading);
  saveToLocalStorage(BLOOD_PRESSURE_KEY, readings);
};

export const getBloodPressureReadings = (): BloodPressureReading[] => {
  const readings = loadFromLocalStorage<BloodPressureReading[]>(BLOOD_PRESSURE_KEY);
  if (!readings) return [];
  
  return readings.map(reading => ({
    ...reading,
    date: new Date(reading.date)
  })).sort((a, b) => b.date.getTime() - a.date.getTime());
};

export const deleteBloodPressureReading = (id: string): void => {
  const readings = getBloodPressureReadings().filter((r) => r.id !== id);
  saveToLocalStorage(BLOOD_PRESSURE_KEY, readings);
};

export const analyzeBPPattern = (systolic: number, diastolic: number): { level: string; alert: boolean; message: string } => {
  if (systolic >= 140 || diastolic >= 90) {
    return {
      level: "High",
      alert: true,
      message: "Your blood pressure is elevated. Contact your healthcare provider immediately."
    };
  } else if (systolic >= 120 && systolic < 140 || diastolic >= 80 && diastolic < 90) {
    return {
      level: "Elevated",
      alert: true,
      message: "Your blood pressure is slightly elevated. Monitor closely and discuss with your doctor."
    };
  } else if (systolic < 90 || diastolic < 60) {
    return {
      level: "Low",
      alert: true,
      message: "Your blood pressure is low. If you feel dizzy or faint, contact your healthcare provider."
    };
  } else {
    return {
      level: "Normal",
      alert: false,
      message: "Your blood pressure is within the normal range."
    };
  }
};

export const getAverageReadings = (readings: BloodPressureReading[]): { systolic: number; diastolic: number; heartRate: number } => {
  if (readings.length === 0) return { systolic: 0, diastolic: 0, heartRate: 0 };
  
  const sum = readings.reduce((acc, reading) => ({
    systolic: acc.systolic + reading.systolic,
    diastolic: acc.diastolic + reading.diastolic,
    heartRate: acc.heartRate + (reading.heartRate || 0)
  }), { systolic: 0, diastolic: 0, heartRate: 0 });
  
  return {
    systolic: Math.round(sum.systolic / readings.length),
    diastolic: Math.round(sum.diastolic / readings.length),
    heartRate: Math.round(sum.heartRate / readings.length)
  };
};
