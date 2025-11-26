import { saveToLocalStorage, loadFromLocalStorage } from "./storage";

const ONBOARDING_KEY = "onboarding-completed";

export const isOnboardingCompleted = (): boolean => {
  return loadFromLocalStorage<boolean>(ONBOARDING_KEY) || false;
};

export const setOnboardingCompleted = (): void => {
  saveToLocalStorage(ONBOARDING_KEY, true);
};

export const resetOnboarding = (): void => {
  localStorage.removeItem(ONBOARDING_KEY);
};
