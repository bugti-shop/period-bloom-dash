import { saveToLocalStorage, loadFromLocalStorage } from "./storage";
import { differenceInWeeks } from "date-fns";

export interface PregnancyWeightEntry {
  id: string;
  date: Date;
  weight: number;
  unit: "kg" | "lbs";
  week: number;
  notes?: string;
}

export interface PregnancyWeightGoal {
  prePregnancyWeight: number;
  unit: "kg" | "lbs";
  bmiCategory: "underweight" | "normal" | "overweight" | "obese";
}

const PREGNANCY_WEIGHT_KEY = "pregnancy-weight-entries";
const PREGNANCY_WEIGHT_GOAL_KEY = "pregnancy-weight-goal";

export const savePregnancyWeightEntry = (entry: Omit<PregnancyWeightEntry, "id">): void => {
  const entries = getPregnancyWeightEntries();
  const newEntry: PregnancyWeightEntry = {
    ...entry,
    id: Date.now().toString(),
  };
  entries.push(newEntry);
  saveToLocalStorage(PREGNANCY_WEIGHT_KEY, entries);
};

export const getPregnancyWeightEntries = (): PregnancyWeightEntry[] => {
  const entries = loadFromLocalStorage<PregnancyWeightEntry[]>(PREGNANCY_WEIGHT_KEY);
  if (!entries) return [];
  
  return entries.map(entry => ({
    ...entry,
    date: new Date(entry.date)
  })).sort((a, b) => b.date.getTime() - a.date.getTime());
};

export const deletePregnancyWeightEntry = (id: string): void => {
  const entries = getPregnancyWeightEntries().filter((e) => e.id !== id);
  saveToLocalStorage(PREGNANCY_WEIGHT_KEY, entries);
};

export const savePregnancyWeightGoal = (goal: PregnancyWeightGoal): void => {
  saveToLocalStorage(PREGNANCY_WEIGHT_GOAL_KEY, goal);
};

export const getPregnancyWeightGoal = (): PregnancyWeightGoal | null => {
  return loadFromLocalStorage<PregnancyWeightGoal>(PREGNANCY_WEIGHT_GOAL_KEY);
};

export const getRecommendedWeightGain = (week: number, bmiCategory: string): { min: number; max: number } => {
  const totalRanges = {
    underweight: { min: 12.5, max: 18 },
    normal: { min: 11.5, max: 16 },
    overweight: { min: 7, max: 11.5 },
    obese: { min: 5, max: 9 }
  };
  
  const range = totalRanges[bmiCategory as keyof typeof totalRanges] || totalRanges.normal;
  const weeklyGain = week / 40;
  
  return {
    min: parseFloat((range.min * weeklyGain).toFixed(1)),
    max: parseFloat((range.max * weeklyGain).toFixed(1))
  };
};
