// Cycle Report Summaries - Auto-generated monthly cycle summaries
import { saveToLocalStorage, loadFromLocalStorage } from './storage';
import { getPeriodHistory, PeriodHistoryEntry } from './periodHistory';
import { getSymptomLogs, SymptomLog } from './symptomLog';
import { getAllMoodLogs, MoodLog } from './moodLog';
import { loadOvulationTests, OvulationTest } from './ovulationTestStorage';
import { format, differenceInDays, startOfMonth, endOfMonth, parseISO } from 'date-fns';

export interface CycleReport {
  id: string;
  month: string; // YYYY-MM format
  generatedAt: string;
  cycleLength: number | null;
  periodLength: number | null;
  periodStartDate: string | null;
  ovulationDay: number | null;
  symptomSummary: {
    symptom: string;
    frequency: number;
    avgIntensity: number;
  }[];
  moodSummary: {
    mood: string;
    frequency: number;
  }[];
  ovulationTestResults: {
    total: number;
    positive: number;
    negative: number;
    peak: number;
  };
  insights: string[];
  cyclePhases: {
    menstrual: { start: string; end: string } | null;
    follicular: { start: string; end: string } | null;
    ovulation: { start: string; end: string } | null;
    luteal: { start: string; end: string } | null;
  };
}

const STORAGE_KEY = 'cycle-reports';

export const generateCycleReport = (month: string): CycleReport => {
  const monthStart = startOfMonth(parseISO(`${month}-01`));
  const monthEnd = endOfMonth(monthStart);
  
  // Get period data for this month
  const periodHistory = getPeriodHistory();
  const periodsInMonth = periodHistory.filter(p => {
    const periodDate = new Date(p.lastPeriodDate);
    return periodDate >= monthStart && periodDate <= monthEnd;
  });
  
  // Get symptoms for this month
  const symptoms = getSymptomLogs();
  const symptomsInMonth = symptoms.filter(s => {
    const symptomDate = parseISO(s.date);
    return symptomDate >= monthStart && symptomDate <= monthEnd;
  });
  
  // Get moods for this month
  const moods = getAllMoodLogs();
  const moodsInMonth = moods.filter(m => {
    const moodDate = parseISO(m.date);
    return moodDate >= monthStart && moodDate <= monthEnd;
  });
  
  // Get ovulation tests for this month
  const ovulationTests = loadOvulationTests();
  const testsInMonth = ovulationTests.filter(t => {
    const testDate = parseISO(t.date);
    return testDate >= monthStart && testDate <= monthEnd;
  });
  
  // Calculate symptom summary
  const symptomCounts: Record<string, { count: number; totalIntensity: number }> = {};
  symptomsInMonth.forEach(s => {
    s.symptoms.forEach(symptom => {
      if (!symptomCounts[symptom]) {
        symptomCounts[symptom] = { count: 0, totalIntensity: 0 };
      }
      symptomCounts[symptom].count++;
      symptomCounts[symptom].totalIntensity += 5; // Default intensity
    });
  });
  
  const symptomSummary = Object.entries(symptomCounts)
    .map(([symptom, data]) => ({
      symptom,
      frequency: data.count,
      avgIntensity: Math.round(data.totalIntensity / data.count)
    }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 10);
  
  // Calculate mood summary
  const moodCounts: Record<string, number> = {};
  moodsInMonth.forEach(m => {
    moodCounts[m.mood] = (moodCounts[m.mood] || 0) + 1;
  });
  
  const moodSummary = Object.entries(moodCounts)
    .map(([mood, frequency]) => ({ mood, frequency }))
    .sort((a, b) => b.frequency - a.frequency);
  
  // Calculate ovulation test summary
  const ovulationTestResults = {
    total: testsInMonth.length,
    positive: testsInMonth.filter(t => t.result === 'positive').length,
    negative: testsInMonth.filter(t => t.result === 'negative').length,
    peak: testsInMonth.filter(t => t.result === 'peak').length
  };
  
  // Calculate cycle metrics
  const latestPeriod = periodsInMonth[0];
  const previousPeriods = periodHistory.filter(p => new Date(p.lastPeriodDate) < monthStart);
  const previousPeriod = previousPeriods[0];
  
  let cycleLength: number | null = null;
  if (latestPeriod && previousPeriod) {
    cycleLength = differenceInDays(new Date(latestPeriod.lastPeriodDate), new Date(previousPeriod.lastPeriodDate));
  }
  
  const periodLength = latestPeriod?.periodDuration || null;
  
  // Generate insights
  const insights: string[] = [];
  
  if (cycleLength) {
    if (cycleLength >= 21 && cycleLength <= 35) {
      insights.push(`Your cycle length of ${cycleLength} days is within the normal range.`);
    } else if (cycleLength < 21) {
      insights.push(`Your cycle of ${cycleLength} days is shorter than typical. Consider tracking this pattern.`);
    } else {
      insights.push(`Your cycle of ${cycleLength} days is longer than typical. This may be normal for you.`);
    }
  }
  
  if (symptomSummary.length > 0) {
    const topSymptom = symptomSummary[0];
    insights.push(`Your most frequent symptom was ${topSymptom.symptom} (${topSymptom.frequency} times).`);
  }
  
  if (ovulationTestResults.positive > 0 || ovulationTestResults.peak > 0) {
    insights.push(`You had ${ovulationTestResults.positive + ovulationTestResults.peak} positive ovulation tests this month.`);
  }
  
  if (moodSummary.length > 0) {
    const topMood = moodSummary[0];
    insights.push(`Your most common mood was "${topMood.mood}" (${topMood.frequency} days).`);
  }
  
  const report: CycleReport = {
    id: `report-${month}`,
    month,
    generatedAt: new Date().toISOString(),
    cycleLength,
    periodLength,
    periodStartDate: latestPeriod ? format(new Date(latestPeriod.lastPeriodDate), 'yyyy-MM-dd') : null,
    ovulationDay: cycleLength ? Math.round(cycleLength / 2) : null,
    symptomSummary,
    moodSummary,
    ovulationTestResults,
    insights,
    cyclePhases: {
      menstrual: null,
      follicular: null,
      ovulation: null,
      luteal: null
    }
  };
  
  // Save report
  saveCycleReport(report);
  
  return report;
};

export const saveCycleReport = (report: CycleReport): void => {
  const reports = loadCycleReports();
  const existingIndex = reports.findIndex(r => r.month === report.month);
  
  if (existingIndex >= 0) {
    reports[existingIndex] = report;
  } else {
    reports.push(report);
  }
  
  saveToLocalStorage(STORAGE_KEY, reports);
};

export const loadCycleReports = (): CycleReport[] => {
  return loadFromLocalStorage<CycleReport[]>(STORAGE_KEY) || [];
};

export const getCycleReportForMonth = (month: string): CycleReport | null => {
  const reports = loadCycleReports();
  return reports.find(r => r.month === month) || null;
};

export const deleteCycleReport = (month: string): void => {
  const reports = loadCycleReports().filter(r => r.month !== month);
  saveToLocalStorage(STORAGE_KEY, reports);
};
