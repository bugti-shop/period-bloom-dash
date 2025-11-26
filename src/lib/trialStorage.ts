const TRIAL_KEY = "trial-started";

export const hasStartedTrial = (): boolean => {
  return localStorage.getItem(TRIAL_KEY) === "true";
};

export const startTrial = (): void => {
  localStorage.setItem(TRIAL_KEY, "true");
};

export const resetTrial = (): void => {
  localStorage.removeItem(TRIAL_KEY);
};
