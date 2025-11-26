import { saveToLocalStorage, loadFromLocalStorage } from "./storage";

interface HoroscopeCache {
  zodiacSign: string;
  horoscope: string;
  date: string;
}

const HOROSCOPE_KEY = "daily-horoscope-cache";

export const getCachedHoroscope = (zodiacSign: string): string | null => {
  const cache = loadFromLocalStorage<HoroscopeCache>(HOROSCOPE_KEY);
  const today = new Date().toDateString();
  
  if (cache && cache.zodiacSign === zodiacSign && cache.date === today) {
    return cache.horoscope;
  }
  
  return null;
};

export const cacheHoroscope = (zodiacSign: string, horoscope: string): void => {
  const today = new Date().toDateString();
  saveToLocalStorage(HOROSCOPE_KEY, {
    zodiacSign,
    horoscope,
    date: today,
  });
};
