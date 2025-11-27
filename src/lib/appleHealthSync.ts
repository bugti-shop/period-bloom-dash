import { getPeriodHistory } from './periodHistory';
import { getSymptomLogs } from './symptomLog';
import { getWeightEntries } from './weightStorage';
import { loadExerciseEntries } from './exerciseStorage';
import { loadSleepEntries } from './sleepStorage';

export interface HealthSyncConfig {
  syncCycleData: boolean;
  syncWeight: boolean;
  syncExercise: boolean;
  syncSleep: boolean;
}

const DEFAULT_CONFIG: HealthSyncConfig = {
  syncCycleData: true,
  syncWeight: true,
  syncExercise: true,
  syncSleep: true,
};

export const getHealthSyncConfig = (): HealthSyncConfig => {
  const stored = localStorage.getItem('healthSyncConfig');
  return stored ? JSON.parse(stored) : DEFAULT_CONFIG;
};

export const setHealthSyncConfig = (config: HealthSyncConfig) => {
  localStorage.setItem('healthSyncConfig', JSON.stringify(config));
};

export const requestHealthPermissions = async () => {
  // Note: Apple Health integration requires native iOS app via Capacitor
  // This is a placeholder for when the app is built as a native iOS app
  console.log('Health permissions request - requires native iOS app');
  return Promise.resolve({ granted: false });
};

export const syncCycleDataToHealth = async () => {
  // Note: Requires native iOS app with HealthKit integration
  console.log('Syncing cycle data to Apple Health - requires native iOS app');
  return Promise.resolve();
};

export const syncWeightToHealth = async () => {
  console.log('Syncing weight data to Apple Health - requires native iOS app');
  return Promise.resolve();
};

export const syncExerciseToHealth = async () => {
  console.log('Syncing exercise data to Apple Health - requires native iOS app');
  return Promise.resolve();
};

export const syncSleepToHealth = async () => {
  console.log('Syncing sleep data to Apple Health - requires native iOS app');
  return Promise.resolve();
};

export const syncAllDataToHealth = async () => {
  const config = getHealthSyncConfig();
  const errors: string[] = [];

  try {
    if (config.syncCycleData) {
      await syncCycleDataToHealth();
    }
  } catch (error) {
    errors.push('cycle data');
  }

  try {
    if (config.syncWeight) {
      await syncWeightToHealth();
    }
  } catch (error) {
    errors.push('weight data');
  }

  try {
    if (config.syncExercise) {
      await syncExerciseToHealth();
    }
  } catch (error) {
    errors.push('exercise data');
  }

  try {
    if (config.syncSleep) {
      await syncSleepToHealth();
    }
  } catch (error) {
    errors.push('sleep data');
  }

  if (errors.length > 0) {
    throw new Error(`Failed to sync: ${errors.join(', ')}`);
  }
};

export const importDataFromHealth = async (startDate: Date, endDate: Date) => {
  console.log('Importing data from Apple Health - requires native iOS app');
  return Promise.resolve({
    cycles: [],
    weight: [],
    exercise: [],
    sleep: [],
  });
};
