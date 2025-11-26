import { saveToLocalStorage, loadFromLocalStorage } from "./storage";
import { getSymptomLogs } from "./symptomLog";
import { getAllMoodLogs } from "./moodLog";

export interface PMSPrediction {
  date: Date;
  severity: "mild" | "moderate" | "severe";
  confidence: number;
  symptoms: string[];
  tips: string[];
}

const PMS_HISTORY_KEY = "pms-history";

export const analyzePMSPatterns = (lastPeriodDate: Date, cycleLength: number): PMSPrediction | null => {
  const symptomLogs = getSymptomLogs();
  const moodLogs = getAllMoodLogs();
  
  if (symptomLogs.length < 3) return null;

  // Calculate PMS window (typically 5-7 days before period)
  const nextPeriodDate = new Date(lastPeriodDate);
  nextPeriodDate.setDate(nextPeriodDate.getDate() + cycleLength);
  
  const pmsStartDate = new Date(nextPeriodDate);
  pmsStartDate.setDate(pmsStartDate.getDate() - 7);

  // Analyze historical PMS symptoms
  const pmsSymptoms = symptomLogs.filter(log => {
    const logDate = new Date(log.date);
    const daysToPeriod = Math.floor((nextPeriodDate.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysToPeriod >= 0 && daysToPeriod <= 7;
  });

  const pmsMoods = moodLogs.filter(log => {
    const logDate = new Date(log.date);
    const daysToPeriod = Math.floor((nextPeriodDate.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysToPeriod >= 0 && daysToPeriod <= 7;
  });

  // Calculate severity based on symptom frequency and mood patterns
  const symptomCount = pmsSymptoms.reduce((acc, log) => acc + log.symptoms.length, 0);
  const negativeMoodCount = pmsMoods.filter(m => 
    ["sad", "anxious", "angry", "stressed"].includes(m.mood)
  ).length;

  let severity: "mild" | "moderate" | "severe" = "mild";
  let confidence = Math.min(symptomLogs.length * 10, 90);

  if (symptomCount > 15 || negativeMoodCount > 5) {
    severity = "severe";
  } else if (symptomCount > 8 || negativeMoodCount > 3) {
    severity = "moderate";
  }

  // Extract common symptoms
  const symptomFrequency: Record<string, number> = {};
  pmsSymptoms.forEach(log => {
    log.symptoms.forEach(symptom => {
      symptomFrequency[symptom] = (symptomFrequency[symptom] || 0) + 1;
    });
  });

  const commonSymptoms = Object.entries(symptomFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([symptom]) => symptom);

  // Generate tips based on severity
  const tips = generatePMSTips(severity, commonSymptoms);

  return {
    date: pmsStartDate,
    severity,
    confidence,
    symptoms: commonSymptoms,
    tips,
  };
};

const generatePMSTips = (severity: string, symptoms: string[]): string[] => {
  const tips: string[] = [];

  if (severity === "severe") {
    tips.push("Consider scheduling lighter activities during this time");
    tips.push("Stock up on comfort foods and pain relief");
    tips.push("Plan self-care activities in advance");
  } else if (severity === "moderate") {
    tips.push("Keep pain relief medication handy");
    tips.push("Stay hydrated and maintain regular meals");
  } else {
    tips.push("Maintain regular exercise routine");
    tips.push("Stay mindful of stress levels");
  }

  if (symptoms.includes("Mood Swings") || symptoms.includes("Anxiety")) {
    tips.push("Practice relaxation techniques like meditation");
  }

  if (symptoms.includes("Fatigue")) {
    tips.push("Prioritize rest and avoid overcommitting");
  }

  if (symptoms.includes("Cramps")) {
    tips.push("Use heating pads and gentle stretching");
  }

  return tips;
};

export const savePMSHistory = (prediction: PMSPrediction): void => {
  const history = loadFromLocalStorage<PMSPrediction[]>(PMS_HISTORY_KEY) || [];
  history.unshift(prediction);
  saveToLocalStorage(PMS_HISTORY_KEY, history.slice(0, 12)); // Keep last 12 predictions
};

export const getPMSHistory = (): PMSPrediction[] => {
  const history = loadFromLocalStorage<PMSPrediction[]>(PMS_HISTORY_KEY) || [];
  return history.map(p => ({ ...p, date: new Date(p.date) }));
};
