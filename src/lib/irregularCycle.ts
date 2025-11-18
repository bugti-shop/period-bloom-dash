import { differenceInDays } from "date-fns";
import { z } from "zod";

export interface CycleEntry {
  id: string;
  startDate: Date;
  endDate: Date;
  cycleLength: number;
  periodDuration: number;
}

export interface IrregularCycleData {
  cycles: CycleEntry[];
  mean: number;
  stdDev: number;
  confidence: number;
  predictedRange: {
    min: number;
    max: number;
  };
}

export const cycleEntrySchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
  cycleLength: z.number().min(21).max(45),
  periodDuration: z.number().min(1).max(10)
});

// Calculate weighted mean (recent cycles have higher weight)
export const calculateWeightedMean = (cycles: CycleEntry[]): number => {
  if (cycles.length === 0) return 28;
  
  const weights = cycles.map((_, index) => index + 1); // More recent = higher weight
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  
  const weightedSum = cycles.reduce((sum, cycle, index) => {
    return sum + (cycle.cycleLength * weights[index]);
  }, 0);
  
  return Math.round(weightedSum / totalWeight);
};

// Calculate standard deviation
export const calculateStdDev = (cycles: CycleEntry[], mean: number): number => {
  if (cycles.length < 2) return 0;
  
  const variance = cycles.reduce((sum, cycle) => {
    return sum + Math.pow(cycle.cycleLength - mean, 2);
  }, 0) / (cycles.length - 1);
  
  return Math.sqrt(variance);
};

// Determine if cycle is irregular (SD > 7 days is considered irregular)
export const isIrregular = (stdDev: number): boolean => {
  return stdDev > 7;
};

// Calculate confidence score (0-100)
export const calculateConfidence = (cycles: CycleEntry[], stdDev: number): number => {
  if (cycles.length < 3) return 30;
  if (cycles.length < 6) return 50;
  
  // Lower SD = higher confidence
  const consistencyScore = Math.max(0, 100 - (stdDev * 8));
  const dataScore = Math.min(100, (cycles.length / 6) * 100);
  
  return Math.round((consistencyScore * 0.7) + (dataScore * 0.3));
};

// Predict next period range
export const predictPeriodRange = (
  lastPeriodDate: Date,
  mean: number,
  stdDev: number
): { min: number; max: number; minDate: Date; maxDate: Date } => {
  const multiplier = 1.5;
  const min = Math.round(mean - (stdDev * multiplier));
  const max = Math.round(mean + (stdDev * multiplier));
  
  return {
    min: Math.max(21, min),
    max: Math.min(45, max),
    minDate: new Date(lastPeriodDate.getTime() + (Math.max(21, min) * 24 * 60 * 60 * 1000)),
    maxDate: new Date(lastPeriodDate.getTime() + (Math.min(45, max) * 24 * 60 * 60 * 1000))
  };
};

// Analyze cycles and return irregular cycle data
export const analyzeIrregularCycles = (cycles: CycleEntry[]): IrregularCycleData | null => {
  if (cycles.length < 3) return null;
  
  const mean = calculateWeightedMean(cycles);
  const stdDev = calculateStdDev(cycles, mean);
  const confidence = calculateConfidence(cycles, stdDev);
  const lastCycle = cycles[cycles.length - 1];
  const predictedRange = predictPeriodRange(lastCycle.endDate, mean, stdDev);
  
  return {
    cycles,
    mean,
    stdDev,
    confidence,
    predictedRange
  };
};
