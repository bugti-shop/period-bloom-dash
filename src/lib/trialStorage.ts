import { hasProAccess } from "./revenueCat";
import { Capacitor } from "@capacitor/core";

const TRIAL_KEY = "trial-started";
const ADMIN_KEY = "lufi-admin-access";

export const hasStartedTrial = (): boolean => {
  // Check admin bypass first
  if (localStorage.getItem(ADMIN_KEY) === "true") {
    return true;
  }
  return localStorage.getItem(TRIAL_KEY) === "true";
};

export const startTrial = (): void => {
  localStorage.setItem(TRIAL_KEY, "true");
};

export const resetTrial = (): void => {
  localStorage.removeItem(TRIAL_KEY);
};

// Check if user has active subscription (async version)
export const hasActiveSubscription = async (): Promise<boolean> => {
  // Check admin bypass first
  if (localStorage.getItem(ADMIN_KEY) === "true") {
    return true;
  }

  // Check RevenueCat on native platforms
  if (Capacitor.isNativePlatform()) {
    return await hasProAccess();
  }

  // On web, just check trial status
  return hasStartedTrial();
};

// Clear admin access
export const clearAdminAccess = (): void => {
  localStorage.removeItem(ADMIN_KEY);
};
