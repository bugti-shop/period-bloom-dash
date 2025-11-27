import { saveToLocalStorage, loadFromLocalStorage } from "./storage";

export type ThemeVariant = "light" | "dark-black" | "dark-blue" | "dark-green" | "dark-brown";

const THEME_KEY = "app-theme";

export const saveTheme = (theme: ThemeVariant): void => {
  saveToLocalStorage(THEME_KEY, theme);
  applyTheme(theme);
};

export const loadTheme = (): ThemeVariant => {
  const theme = loadFromLocalStorage<ThemeVariant>(THEME_KEY);
  return theme || "light";
};

export const applyTheme = (theme: ThemeVariant): void => {
  const root = document.documentElement;
  
  // Remove all theme classes
  root.classList.remove("dark-black", "dark-blue", "dark-green", "dark-brown");
  
  // Add the selected theme class
  if (theme !== "light") {
    root.classList.add(theme);
  }
};

// Initialize theme on load
if (typeof window !== "undefined") {
  applyTheme(loadTheme());
}
