// Perimenopause and PCOS Mode Storage
import { saveToLocalStorage, loadFromLocalStorage } from './storage';

export type SpecialMode = 'normal' | 'perimenopause' | 'pcos';

export interface PerimenopauseData {
  enabled: boolean;
  startDate?: string;
  hotFlashes: HotFlashEntry[];
  nightSweats: NightSweatEntry[];
  sleepIssues: SleepIssueEntry[];
  moodChanges: MoodChangeEntry[];
  irregularBleeding: IrregularBleedingEntry[];
  vaginalDryness: boolean;
  lowLibido: boolean;
  weightChanges: WeightChangeEntry[];
  memoryIssues: boolean;
  jointPain: boolean;
}

export interface PCOSData {
  enabled: boolean;
  diagnosisDate?: string;
  symptoms: PCOSSymptom[];
  medications: PCOSMedication[];
  insulinResistance: boolean;
  hairGrowthTracking: HairGrowthEntry[];
  acneTracking: AcneEntry[];
  weightTracking: WeightEntry[];
  cycleIrregularity: CycleIrregularityEntry[];
  ovulationTracking: OvulationEntry[];
}

export interface HotFlashEntry {
  id: string;
  date: string;
  time: string;
  severity: 1 | 2 | 3 | 4 | 5;
  duration: number; // minutes
  triggers?: string[];
}

export interface NightSweatEntry {
  id: string;
  date: string;
  severity: 1 | 2 | 3 | 4 | 5;
  wokenUp: boolean;
}

export interface SleepIssueEntry {
  id: string;
  date: string;
  type: 'insomnia' | 'waking' | 'restless' | 'other';
  hoursSlept: number;
}

export interface MoodChangeEntry {
  id: string;
  date: string;
  mood: string;
  anxiety: 1 | 2 | 3 | 4 | 5;
  irritability: 1 | 2 | 3 | 4 | 5;
}

export interface IrregularBleedingEntry {
  id: string;
  date: string;
  type: 'spotting' | 'heavy' | 'prolonged' | 'missed';
  notes?: string;
}

export interface WeightChangeEntry {
  id: string;
  date: string;
  weight: number;
  unit: 'kg' | 'lbs';
}

export interface PCOSSymptom {
  id: string;
  date: string;
  type: 'hirsutism' | 'acne' | 'hairLoss' | 'weightGain' | 'fatigue' | 'moodSwings' | 'other';
  severity: 1 | 2 | 3 | 4 | 5;
  notes?: string;
}

export interface PCOSMedication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  type: 'metformin' | 'birthControl' | 'spironolactone' | 'clomid' | 'letrozole' | 'other';
}

export interface HairGrowthEntry {
  id: string;
  date: string;
  areas: string[];
  severity: 1 | 2 | 3 | 4 | 5;
  treatment?: string;
}

export interface AcneEntry {
  id: string;
  date: string;
  severity: 1 | 2 | 3 | 4 | 5;
  areas: string[];
  type: 'hormonal' | 'cystic' | 'blackheads' | 'whiteheads' | 'mixed';
}

export interface WeightEntry {
  id: string;
  date: string;
  weight: number;
  unit: 'kg' | 'lbs';
  waistCircumference?: number;
}

export interface CycleIrregularityEntry {
  id: string;
  date: string;
  cycleLength: number;
  periodLength: number;
  flow: 'light' | 'medium' | 'heavy';
  notes?: string;
}

export interface OvulationEntry {
  id: string;
  date: string;
  detected: boolean;
  method: 'opk' | 'bbt' | 'cm' | 'ultrasound';
  notes?: string;
}

const MODE_STORAGE_KEY = 'special-tracking-mode';
const PERIMENOPAUSE_KEY = 'perimenopause-data';
const PCOS_KEY = 'pcos-data';

// Mode management
export const getCurrentMode = (): SpecialMode => {
  return loadFromLocalStorage<SpecialMode>(MODE_STORAGE_KEY) || 'normal';
};

export const setCurrentMode = (mode: SpecialMode): void => {
  saveToLocalStorage(MODE_STORAGE_KEY, mode);
};

// Perimenopause functions
export const loadPerimenopauseData = (): PerimenopauseData => {
  return loadFromLocalStorage<PerimenopauseData>(PERIMENOPAUSE_KEY) || {
    enabled: false,
    hotFlashes: [],
    nightSweats: [],
    sleepIssues: [],
    moodChanges: [],
    irregularBleeding: [],
    vaginalDryness: false,
    lowLibido: false,
    weightChanges: [],
    memoryIssues: false,
    jointPain: false
  };
};

export const savePerimenopauseData = (data: PerimenopauseData): void => {
  saveToLocalStorage(PERIMENOPAUSE_KEY, data);
};

export const addHotFlash = (entry: HotFlashEntry): void => {
  const data = loadPerimenopauseData();
  data.hotFlashes.push(entry);
  savePerimenopauseData(data);
};

export const addNightSweat = (entry: NightSweatEntry): void => {
  const data = loadPerimenopauseData();
  data.nightSweats.push(entry);
  savePerimenopauseData(data);
};

export const addSleepIssue = (entry: SleepIssueEntry): void => {
  const data = loadPerimenopauseData();
  data.sleepIssues.push(entry);
  savePerimenopauseData(data);
};

export const addMoodChange = (entry: MoodChangeEntry): void => {
  const data = loadPerimenopauseData();
  data.moodChanges.push(entry);
  savePerimenopauseData(data);
};

export const addIrregularBleeding = (entry: IrregularBleedingEntry): void => {
  const data = loadPerimenopauseData();
  data.irregularBleeding.push(entry);
  savePerimenopauseData(data);
};

// PCOS functions
export const loadPCOSData = (): PCOSData => {
  return loadFromLocalStorage<PCOSData>(PCOS_KEY) || {
    enabled: false,
    symptoms: [],
    medications: [],
    insulinResistance: false,
    hairGrowthTracking: [],
    acneTracking: [],
    weightTracking: [],
    cycleIrregularity: [],
    ovulationTracking: []
  };
};

export const savePCOSData = (data: PCOSData): void => {
  saveToLocalStorage(PCOS_KEY, data);
};

export const addPCOSSymptom = (symptom: PCOSSymptom): void => {
  const data = loadPCOSData();
  data.symptoms.push(symptom);
  savePCOSData(data);
};

export const addPCOSMedication = (medication: PCOSMedication): void => {
  const data = loadPCOSData();
  data.medications.push(medication);
  savePCOSData(data);
};

export const addHairGrowthEntry = (entry: HairGrowthEntry): void => {
  const data = loadPCOSData();
  data.hairGrowthTracking.push(entry);
  savePCOSData(data);
};

export const addAcneEntry = (entry: AcneEntry): void => {
  const data = loadPCOSData();
  data.acneTracking.push(entry);
  savePCOSData(data);
};

export const addPCOSWeightEntry = (entry: WeightEntry): void => {
  const data = loadPCOSData();
  data.weightTracking.push(entry);
  savePCOSData(data);
};

export const addCycleIrregularityEntry = (entry: CycleIrregularityEntry): void => {
  const data = loadPCOSData();
  data.cycleIrregularity.push(entry);
  savePCOSData(data);
};

export const addOvulationEntry = (entry: OvulationEntry): void => {
  const data = loadPCOSData();
  data.ovulationTracking.push(entry);
  savePCOSData(data);
};

// Get insights for special modes
export const getPerimenopauseInsights = (): string[] => {
  const data = loadPerimenopauseData();
  const insights: string[] = [];
  
  const recentHotFlashes = data.hotFlashes.filter(h => {
    const date = new Date(h.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return date >= weekAgo;
  });
  
  if (recentHotFlashes.length > 0) {
    const avgSeverity = recentHotFlashes.reduce((sum, h) => sum + h.severity, 0) / recentHotFlashes.length;
    insights.push(`You had ${recentHotFlashes.length} hot flashes this week with average severity ${avgSeverity.toFixed(1)}/5.`);
  }
  
  const recentNightSweats = data.nightSweats.filter(n => {
    const date = new Date(n.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return date >= weekAgo;
  });
  
  if (recentNightSweats.length > 0) {
    insights.push(`You experienced night sweats ${recentNightSweats.length} times this week.`);
  }
  
  return insights;
};

export const getPCOSInsights = (): string[] => {
  const data = loadPCOSData();
  const insights: string[] = [];
  
  const recentSymptoms = data.symptoms.filter(s => {
    const date = new Date(s.date);
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    return date >= monthAgo;
  });
  
  if (recentSymptoms.length > 0) {
    const symptomCounts: Record<string, number> = {};
    recentSymptoms.forEach(s => {
      symptomCounts[s.type] = (symptomCounts[s.type] || 0) + 1;
    });
    
    const topSymptom = Object.entries(symptomCounts).sort((a, b) => b[1] - a[1])[0];
    if (topSymptom) {
      insights.push(`Your most frequent PCOS symptom this month was ${topSymptom[0]} (${topSymptom[1]} times).`);
    }
  }
  
  if (data.cycleIrregularity.length >= 3) {
    const recentCycles = data.cycleIrregularity.slice(-3);
    const avgCycleLength = recentCycles.reduce((sum, c) => sum + c.cycleLength, 0) / recentCycles.length;
    insights.push(`Your average cycle length over the last 3 cycles is ${avgCycleLength.toFixed(0)} days.`);
  }
  
  return insights;
};
