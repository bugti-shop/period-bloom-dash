import { saveToLocalStorage, loadFromLocalStorage } from "./storage";
import { format } from "date-fns";

export interface DateNote {
  id: string;
  content: string;
  color: string;
  createdAt: number;
}

export interface DateNotesData {
  [dateKey: string]: DateNote[];
}

const DATE_NOTES_KEY = "date-notes";

export const getNotesForDate = (date: Date): DateNote[] => {
  const dateKey = format(date, "yyyy-MM-dd");
  const allNotes = loadFromLocalStorage<DateNotesData>(DATE_NOTES_KEY) || {};
  return allNotes[dateKey] || [];
};

export const saveNotesForDate = (date: Date, notes: DateNote[]): void => {
  const dateKey = format(date, "yyyy-MM-dd");
  const allNotes = loadFromLocalStorage<DateNotesData>(DATE_NOTES_KEY) || {};
  allNotes[dateKey] = notes;
  saveToLocalStorage(DATE_NOTES_KEY, allNotes);
};
