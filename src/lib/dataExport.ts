import { loadFromLocalStorage, saveToLocalStorage } from "./storage";
import { z } from "zod";

// Maximum file size: 50MB
const MAX_FILE_SIZE = 50 * 1024 * 1024;

// Schema definitions for imported data validation
const periodHistorySchema = z.array(z.object({
  startDate: z.string(),
  endDate: z.string().optional(),
  cycleLength: z.number().optional(),
  notes: z.string().optional()
})).optional().nullable();

const symptomLogsSchema = z.array(z.object({
  date: z.string(),
  symptoms: z.array(z.string()),
  notes: z.string().optional()
})).optional().nullable();

const voiceNotesSchema = z.array(z.object({
  date: z.string(),
  data: z.string(),
  timestamp: z.string(),
  duration: z.number().optional()
})).optional().nullable();

const photoSchema = z.array(z.object({
  id: z.string(),
  imageData: z.string(),
  timestamp: z.string(),
  date: z.string()
})).optional().nullable();

const moodLogsSchema = z.array(z.object({
  date: z.string(),
  mood: z.string(),
  emoji: z.string(),
  notes: z.string().optional()
})).optional().nullable();

const medicationsSchema = z.array(z.object({
  id: z.string(),
  name: z.string(),
  dosage: z.string().optional(),
  frequency: z.string().optional(),
  startDate: z.string().optional()
})).optional().nullable();

const bbtReadingsSchema = z.array(z.object({
  date: z.string(),
  temperature: z.number(),
  notes: z.string().optional()
})).optional().nullable();

const intimacyLogSchema = z.array(z.object({
  id: z.string(),
  date: z.string(),
  protection: z.boolean().optional(),
  notes: z.string().optional()
})).optional().nullable();

const contractionsSchema = z.array(z.object({
  id: z.string(),
  startTime: z.string(),
  duration: z.number(),
  intensity: z.string().optional()
})).optional().nullable();

const pregnancyWeekPhotosSchema = z.record(z.object({
  imageData: z.string(),
  timestamp: z.string()
})).optional().nullable();

const pregnancyWeekNotesSchema = z.record(z.string()).optional().nullable();

const pregnancyWeekVoiceNotesSchema = z.record(z.object({
  data: z.string(),
  timestamp: z.string(),
  duration: z.number()
})).optional().nullable();

// Main import schema
const importDataSchema = z.object({
  version: z.string(),
  exportDate: z.string().optional(),
  data: z.object({
    periodHistory: periodHistorySchema,
    currentPeriodData: z.any().optional().nullable(),
    symptomLogs: symptomLogsSchema,
    healthTracker: z.any().optional().nullable(),
    stickyNotes: z.array(z.any()).optional().nullable(),
    dateNotes: z.record(z.string()).optional().nullable(),
    voiceNotes: voiceNotesSchema,
    symptomPhotos: photoSchema,
    moodLogs: moodLogsSchema,
    disguiseSettings: z.any().optional().nullable(),
    kickCounterHistory: z.array(z.any()).optional().nullable(),
    medications: medicationsSchema,
    flowIntensity: z.record(z.string()).optional().nullable(),
    reminders: z.array(z.any()).optional().nullable(),
    intimacyLog: intimacyLogSchema,
    bbtReadings: bbtReadingsSchema,
    appetiteLog: z.array(z.any()).optional().nullable(),
    conceivingData: z.any().optional().nullable(),
    sectionVisibility: z.record(z.boolean()).optional().nullable(),
    contractions: contractionsSchema,
    pregnancyMode: z.object({
      isPregnant: z.boolean(),
      startDate: z.string().optional(),
      dueDate: z.string().optional()
    }).optional().nullable(),
    pregnancyWeekPhotos: pregnancyWeekPhotosSchema,
    pregnancyWeekNotes: pregnancyWeekNotesSchema,
    pregnancyWeekVoiceNotes: pregnancyWeekVoiceNotesSchema
  })
});

export const exportAllData = () => {
  const data = {
    version: "1.0",
    exportDate: new Date().toISOString(),
    data: {
      periodHistory: loadFromLocalStorage("period-history"),
      currentPeriodData: loadFromLocalStorage("current-period-data"),
      symptomLogs: loadFromLocalStorage("symptom-logs"),
      healthTracker: loadFromLocalStorage("health-tracker"),
      stickyNotes: loadFromLocalStorage("sticky-notes"),
      dateNotes: loadFromLocalStorage("date-notes"),
      voiceNotes: loadFromLocalStorage("voice-notes"),
      symptomPhotos: loadFromLocalStorage("symptom-photos"),
      moodLogs: loadFromLocalStorage("mood-logs"),
      disguiseSettings: loadFromLocalStorage("disguise-settings"),
      kickCounterHistory: loadFromLocalStorage("kick-counter-history"),
      medications: loadFromLocalStorage("medications"),
      flowIntensity: loadFromLocalStorage("flow-intensity"),
      reminders: loadFromLocalStorage("reminders"),
      intimacyLog: loadFromLocalStorage("intimacy-log"),
      bbtReadings: loadFromLocalStorage("bbt-readings"),
      appetiteLog: loadFromLocalStorage("appetite-log"),
      conceivingData: loadFromLocalStorage("conceiving-data"),
      sectionVisibility: loadFromLocalStorage("section-visibility"),
      contractions: loadFromLocalStorage("contractions"),
      pregnancyMode: loadFromLocalStorage("pregnancy-mode"),
      pregnancyWeekPhotos: loadFromLocalStorage("pregnancy-week-photos"),
      pregnancyWeekNotes: loadFromLocalStorage("pregnancy-week-notes"),
      pregnancyWeekVoiceNotes: loadFromLocalStorage("pregnancy-week-voice-notes")
    }
  };

  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = `flow-fairytale-backup-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  
  URL.revokeObjectURL(url);
};

export const importData = (file: File): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      reject(new Error(`File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`));
      return;
    }

    // Verify file extension
    if (!file.name.endsWith('.json')) {
      reject(new Error("Invalid file type. Only JSON files are allowed"));
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        
        // Parse JSON
        let imported;
        try {
          imported = JSON.parse(content);
        } catch (parseError) {
          throw new Error("Invalid JSON format");
        }

        // Validate against schema
        const validationResult = importDataSchema.safeParse(imported);
        
        if (!validationResult.success) {
          console.error("Validation errors:", validationResult.error.errors);
          throw new Error("Invalid backup file structure. Please use a valid backup file.");
        }

        const validatedData = validationResult.data;

        // Import all validated data
        Object.entries(validatedData.data).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            saveToLocalStorage(key, value);
          }
        });

        resolve(true);
      } catch (error) {
        if (error instanceof Error) {
          reject(error);
        } else {
          reject(new Error("Failed to import data"));
        }
      }
    };
    
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
};
