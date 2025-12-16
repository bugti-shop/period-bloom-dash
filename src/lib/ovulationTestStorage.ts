// Ovulation Test Integration - Log LH test results
import { saveToLocalStorage, loadFromLocalStorage } from './storage';

export interface OvulationTest {
  id: string;
  date: string;
  time: string;
  result: 'positive' | 'negative' | 'faint' | 'peak';
  brand?: string;
  notes?: string;
  photoId?: string;
}

const STORAGE_KEY = 'ovulation-tests';

export const saveOvulationTest = (test: OvulationTest): void => {
  const tests = loadOvulationTests();
  const existingIndex = tests.findIndex(t => t.id === test.id);
  
  if (existingIndex >= 0) {
    tests[existingIndex] = test;
  } else {
    tests.push(test);
  }
  
  saveToLocalStorage(STORAGE_KEY, tests);
};

export const loadOvulationTests = (): OvulationTest[] => {
  return loadFromLocalStorage<OvulationTest[]>(STORAGE_KEY) || [];
};

export const deleteOvulationTest = (id: string): void => {
  const tests = loadOvulationTests().filter(t => t.id !== id);
  saveToLocalStorage(STORAGE_KEY, tests);
};

export const getTestsForCycle = (cycleStartDate: string): OvulationTest[] => {
  const tests = loadOvulationTests();
  const startDate = new Date(cycleStartDate);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 35); // Typical cycle + buffer
  
  return tests.filter(test => {
    const testDate = new Date(test.date);
    return testDate >= startDate && testDate <= endDate;
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

export const getRecentPositiveTests = (days: number = 7): OvulationTest[] => {
  const tests = loadOvulationTests();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return tests.filter(test => {
    const testDate = new Date(test.date);
    return testDate >= cutoffDate && (test.result === 'positive' || test.result === 'peak');
  });
};

export const predictOvulationFromTests = (): Date | null => {
  const recentPositive = getRecentPositiveTests(3);
  if (recentPositive.length === 0) return null;
  
  // Ovulation typically occurs 24-36 hours after first positive LH test
  const firstPositive = recentPositive[0];
  const ovulationDate = new Date(firstPositive.date);
  ovulationDate.setDate(ovulationDate.getDate() + 1);
  
  return ovulationDate;
};
