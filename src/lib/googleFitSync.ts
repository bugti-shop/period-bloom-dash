import { getPeriodHistory } from './periodHistory';
import { getSymptomLogs } from './symptomLog';
import { getWeightEntries } from './weightStorage';
import { loadExerciseEntries } from './exerciseStorage';
import { loadSleepEntries } from './sleepStorage';

export interface GoogleFitConfig {
  syncCycleData: boolean;
  syncWeight: boolean;
  syncExercise: boolean;
  syncSleep: boolean;
}

const DEFAULT_CONFIG: GoogleFitConfig = {
  syncCycleData: true,
  syncWeight: true,
  syncExercise: true,
  syncSleep: true,
};

export const getGoogleFitConfig = (): GoogleFitConfig => {
  const stored = localStorage.getItem('googleFitConfig');
  return stored ? JSON.parse(stored) : DEFAULT_CONFIG;
};

export const setGoogleFitConfig = (config: GoogleFitConfig) => {
  localStorage.setItem('googleFitConfig', JSON.stringify(config));
};

export const requestGoogleFitPermissions = async () => {
  // Note: Google Fit integration requires native Android app via Capacitor
  // This is a placeholder for when the app is built as a native Android app
  // You'll need to use @capacitor-community/google-fit or similar plugin
  console.log('Google Fit permissions request - requires native Android app');
  return Promise.resolve({ granted: false });
};

export const syncCycleDataToGoogleFit = async () => {
  // Note: Requires native Android app with Google Fit API integration
  console.log('Syncing cycle data to Google Fit - requires native Android app');
  return Promise.resolve();
};

export const syncWeightToGoogleFit = async () => {
  console.log('Syncing weight data to Google Fit - requires native Android app');
  return Promise.resolve();
};

export const syncExerciseToGoogleFit = async () => {
  console.log('Syncing exercise data to Google Fit - requires native Android app');
  return Promise.resolve();
};

export const syncSleepToGoogleFit = async () => {
  console.log('Syncing sleep data to Google Fit - requires native Android app');
  return Promise.resolve();
};

export const syncAllDataToGoogleFit = async () => {
  const config = getGoogleFitConfig();
  const errors: string[] = [];

  try {
    if (config.syncCycleData) {
      await syncCycleDataToGoogleFit();
    }
  } catch (error) {
    errors.push('cycle data');
  }

  try {
    if (config.syncWeight) {
      await syncWeightToGoogleFit();
    }
  } catch (error) {
    errors.push('weight data');
  }

  try {
    if (config.syncExercise) {
      await syncExerciseToGoogleFit();
    }
  } catch (error) {
    errors.push('exercise data');
  }

  try {
    if (config.syncSleep) {
      await syncSleepToGoogleFit();
    }
  } catch (error) {
    errors.push('sleep data');
  }

  if (errors.length > 0) {
    throw new Error(`Failed to sync: ${errors.join(', ')}`);
  }
};

export const importDataFromGoogleFit = async (startDate: Date, endDate: Date) => {
  console.log('Importing data from Google Fit - requires native Android app');
  return Promise.resolve({
    cycles: [],
    weight: [],
    exercise: [],
    sleep: [],
  });
};
