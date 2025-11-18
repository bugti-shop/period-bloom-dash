import { saveToLocalStorage, loadFromLocalStorage } from "./storage";

export interface ConceivingData {
  tryingToConceive: boolean;
  startDate?: string;
  notes?: string;
}

const CONCEIVING_KEY = "conceiving-data";

export const saveConceivingData = (data: ConceivingData) => {
  saveToLocalStorage(CONCEIVING_KEY, data);
};

export const loadConceivingData = (): ConceivingData => {
  return loadFromLocalStorage<ConceivingData>(CONCEIVING_KEY) || {
    tryingToConceive: false
  };
};
