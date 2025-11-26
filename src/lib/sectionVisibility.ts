import { saveToLocalStorage, loadFromLocalStorage } from "./storage";

export interface SectionVisibility {
  // Period Mode Home Sections
  periodCalendar: boolean;
  periodInfoCards: boolean;
  periodInsights: boolean;
  periodStickyNotes: boolean;
  
  // Pregnancy Mode Home Sections
  pregnancyProgress: boolean;
  bumpGallery: boolean;
  babyAlbum: boolean;
  familyAlbum: boolean;
  ultrasoundAlbum: boolean;
  appointmentCard: boolean;
  pregnancyWeightCard: boolean;
  bloodPressureCard: boolean;
  glucoseCard: boolean;
  pregnancyStickyNotes: boolean;
  
  // Symptoms Page Sections (shared between modes)
  symptoms: boolean;
  mood: boolean;
  intimacy: boolean;
  bbt: boolean;
  appetite: boolean;
  conceiving: boolean;
  medications: boolean;
  flowIntensity: boolean;
  health: boolean;
  symptomsChecker: boolean;
}

const SECTION_VISIBILITY_KEY = "section-visibility";

const DEFAULT_VISIBILITY: SectionVisibility = {
  // Period Mode Home Sections
  periodCalendar: true,
  periodInfoCards: true,
  periodInsights: true,
  periodStickyNotes: true,
  
  // Pregnancy Mode Home Sections
  pregnancyProgress: true,
  bumpGallery: true,
  babyAlbum: true,
  familyAlbum: true,
  ultrasoundAlbum: true,
  appointmentCard: true,
  pregnancyWeightCard: true,
  bloodPressureCard: true,
  glucoseCard: true,
  pregnancyStickyNotes: true,
  
  // Symptoms Page Sections
  symptoms: true,
  mood: true,
  intimacy: true,
  bbt: true,
  appetite: true,
  conceiving: true,
  medications: true,
  flowIntensity: true,
  health: true,
  symptomsChecker: false,
};

export const saveSectionVisibility = (visibility: SectionVisibility) => {
  saveToLocalStorage(SECTION_VISIBILITY_KEY, visibility);
};

export const loadSectionVisibility = (): SectionVisibility => {
  return loadFromLocalStorage<SectionVisibility>(SECTION_VISIBILITY_KEY) || DEFAULT_VISIBILITY;
};
