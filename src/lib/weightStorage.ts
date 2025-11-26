import { saveToLocalStorage, loadFromLocalStorage } from "./storage";

export interface WeightEntry {
  id: string;
  date: Date;
  weight: number;
  unit: "kg" | "lbs";
  notes?: string;
}

const WEIGHT_LOG_KEY = "weight-log";
const WEIGHT_UNIT_KEY = "weight-unit-preference";

export const saveWeightEntry = (entry: Omit<WeightEntry, "id">): void => {
  const entries = getWeightEntries();
  const newEntry: WeightEntry = {
    ...entry,
    id: Date.now().toString(),
  };
  entries.unshift(newEntry);
  saveToLocalStorage(WEIGHT_LOG_KEY, entries);
};

export const getWeightEntries = (): WeightEntry[] => {
  const entries = loadFromLocalStorage<WeightEntry[]>(WEIGHT_LOG_KEY) || [];
  return entries.map(entry => ({ ...entry, date: new Date(entry.date) }));
};

export const deleteWeightEntry = (id: string): void => {
  const entries = getWeightEntries();
  saveToLocalStorage(WEIGHT_LOG_KEY, entries.filter(entry => entry.id !== id));
};

export const getWeightUnitPreference = (): "kg" | "lbs" => {
  return loadFromLocalStorage<"kg" | "lbs">(WEIGHT_UNIT_KEY) || "kg";
};

export const saveWeightUnitPreference = (unit: "kg" | "lbs"): void => {
  saveToLocalStorage(WEIGHT_UNIT_KEY, unit);
};

export const analyzeWeightTrends = (lastPeriodDate: Date, cycleLength: number) => {
  const entries = getWeightEntries();
  if (entries.length < 5) return null;

  // Group entries by cycle phase
  const phases = {
    menstrual: [] as number[],
    follicular: [] as number[],
    ovulation: [] as number[],
    luteal: [] as number[],
  };

  entries.forEach(entry => {
    const daysSinceLastPeriod = Math.floor(
      (entry.date.getTime() - lastPeriodDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const cycleDay = ((daysSinceLastPeriod % cycleLength) + cycleLength) % cycleLength;

    if (cycleDay < 5) phases.menstrual.push(entry.weight);
    else if (cycleDay < 13) phases.follicular.push(entry.weight);
    else if (cycleDay < 17) phases.ovulation.push(entry.weight);
    else phases.luteal.push(entry.weight);
  });

  const average = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

  return {
    menstrualAvg: average(phases.menstrual),
    follicularAvg: average(phases.follicular),
    ovulationAvg: average(phases.ovulation),
    lutealAvg: average(phases.luteal),
    overallAvg: average(entries.map(e => e.weight)),
  };
};
