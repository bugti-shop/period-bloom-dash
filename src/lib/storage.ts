// Local storage utility for frontend-only app
// NOTE: Data is stored unencrypted in browser localStorage
// For true security, use a backend with proper encryption

export const saveToLocalStorage = (key: string, data: any): void => {
  try {
    const jsonString = JSON.stringify(data);
    localStorage.setItem(key, jsonString);
  } catch (error) {
    console.error("Error saving to localStorage:", error);
  }
};

export const loadFromLocalStorage = <T>(key: string): T | null => {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return null;
    return JSON.parse(stored) as T;
  } catch (error) {
    console.error("Error loading from localStorage:", error);
    return null;
  }
};
