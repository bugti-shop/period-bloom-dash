import { format, parseISO, differenceInMonths, isSameDay } from "date-fns";
import { saveToLocalStorage, loadFromLocalStorage } from "./storage";

export interface SymptomLog {
  date: string; // ISO format: "2025-11-06"
  symptoms: string[];
}

export interface SymptomPattern {
  symptom: string;
  frequency: number;
  cyclePhase: "period" | "follicular" | "ovulation" | "luteal";
}

const SYMPTOM_LOG_KEY = "symptom-logs";

export const saveSymptomLog = (date: Date, symptoms: string[]) => {
  const logs = loadFromLocalStorage<SymptomLog[]>(SYMPTOM_LOG_KEY) || [];
  const dateStr = format(date, "yyyy-MM-dd");
  
  // Remove existing log for this date
  const filteredLogs = logs.filter(log => log.date !== dateStr);
  
  // Add new log if symptoms exist
  if (symptoms.length > 0) {
    filteredLogs.push({ date: dateStr, symptoms });
  }
  
  // Sort by date descending
  filteredLogs.sort((a, b) => b.date.localeCompare(a.date));
  
  saveToLocalStorage(SYMPTOM_LOG_KEY, filteredLogs);
};

export const getSymptomLogs = (): SymptomLog[] => {
  return loadFromLocalStorage<SymptomLog[]>(SYMPTOM_LOG_KEY) || [];
};

export const getSymptomsForDate = (date: Date): string[] => {
  const logs = getSymptomLogs();
  const dateStr = format(date, "yyyy-MM-dd");
  const log = logs.find(l => l.date === dateStr);
  return log?.symptoms || [];
};

export const getSymptomDates = (): Date[] => {
  const logs = getSymptomLogs();
  return logs.map(log => parseISO(log.date));
};

export const analyzeSymptomPatterns = (lastPeriodDate: Date, cycleLength: number): string | null => {
  const logs = getSymptomLogs();
  if (logs.length < 3) return null;
  
  // Get symptoms from the first 3 days of recent periods
  const periodSymptoms: string[] = [];
  
  logs.forEach(log => {
    const logDate = parseISO(log.date);
    const daysSinceLastPeriod = Math.floor((logDate.getTime() - lastPeriodDate.getTime()) / (1000 * 60 * 60 * 24));
    const cycleDay = ((daysSinceLastPeriod % cycleLength) + cycleLength) % cycleLength;
    
    // First 3 days of cycle
    if (cycleDay <= 2) {
      periodSymptoms.push(...log.symptoms);
    }
  });
  
  // Find most common symptoms
  const symptomCounts: { [key: string]: number } = {};
  periodSymptoms.forEach(symptom => {
    symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
  });
  
  const sortedSymptoms = Object.entries(symptomCounts)
    .sort(([, a], [, b]) => b - a)
    .filter(([, count]) => count >= 2);
  
  if (sortedSymptoms.length === 0) return null;
  
  const topSymptoms = sortedSymptoms.slice(0, 2).map(([symptom]) => symptom.toLowerCase());
  
  if (topSymptoms.includes("cramps") && topSymptoms.includes("back pain")) {
    return "You usually experience cramps and back pain at the start of your cycle. Try staying hydrated or using a heating pad.";
  } else if (topSymptoms.includes("cramps")) {
    return "You often experience cramps at the start of your cycle. A heating pad and rest might help.";
  } else if (topSymptoms.includes("back pain")) {
    return "Back pain is common for you during menstruation. Consider gentle stretching or a warm bath.";
  } else if (topSymptoms.includes("mood swings")) {
    return "You tend to experience mood swings at the start of your cycle. Remember to be gentle with yourself.";
  } else if (topSymptoms.includes("fatigue")) {
    return "Fatigue is common for you during your period. Make sure to get enough rest and stay hydrated.";
  }
  
  return null;
};