import { loadFromLocalStorage, saveToLocalStorage } from "./storage";

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
      pregnancyPhotos: loadFromLocalStorage("pregnancy-photos")
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
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const imported = JSON.parse(content);
        
        if (!imported.version || !imported.data) {
          throw new Error("Invalid backup file format");
        }

        // Import all data
        Object.entries(imported.data).forEach(([key, value]) => {
          if (value !== null) {
            saveToLocalStorage(key, value);
          }
        });

        resolve(true);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
};
