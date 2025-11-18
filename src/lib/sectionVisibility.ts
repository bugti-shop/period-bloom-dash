import { saveToLocalStorage, loadFromLocalStorage } from "./storage";

export interface SectionVisibility {
  calendar: boolean;
  symptoms: boolean;
  mood: boolean;
  intimacy: boolean;
  bbt: boolean;
  appetite: boolean;
  conceiving: boolean;
  medications: boolean;
  flowIntensity: boolean;
  stickyNotes: boolean;
  insights: boolean;
}

const SECTION_VISIBILITY_KEY = "section-visibility";

const DEFAULT_VISIBILITY: SectionVisibility = {
  calendar: true,
  symptoms: true,
  mood: true,
  intimacy: true,
  bbt: true,
  appetite: true,
  conceiving: true,
  medications: true,
  flowIntensity: true,
  stickyNotes: true,
  insights: true,
};

export const saveSectionVisibility = (visibility: SectionVisibility) => {
  saveToLocalStorage(SECTION_VISIBILITY_KEY, visibility);
};

export const loadSectionVisibility = (): SectionVisibility => {
  return loadFromLocalStorage<SectionVisibility>(SECTION_VISIBILITY_KEY) || DEFAULT_VISIBILITY;
};
