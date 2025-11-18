import { loadFromLocalStorage } from "./storage";

interface WeekPhoto {
  imageData: string;
  timestamp: Date;
}

interface WeekPhotos {
  [week: number]: WeekPhoto;
}

interface WeekNotes {
  [week: number]: string;
}

interface WeekVoiceNote {
  data: string;
  timestamp: Date;
  duration: number;
}

interface WeekVoiceNotes {
  [week: number]: WeekVoiceNote;
}

export const exportPregnancyJournal = (startWeek?: number, endWeek?: number) => {
  const photos = loadFromLocalStorage<WeekPhotos>("pregnancy-week-photos") || {};
  const notes = loadFromLocalStorage<WeekNotes>("pregnancy-week-notes") || {};
  const voiceNotes = loadFromLocalStorage<WeekVoiceNotes>("pregnancy-week-voice-notes") || {};

  let filteredPhotos = photos;
  let filteredNotes = notes;
  let filteredVoiceNotes = voiceNotes;

  if (startWeek !== undefined && endWeek !== undefined) {
    filteredPhotos = Object.keys(photos)
      .filter(w => {
        const week = parseInt(w);
        return week >= startWeek && week <= endWeek;
      })
      .reduce((acc, w) => ({ ...acc, [w]: photos[parseInt(w)] }), {});

    filteredNotes = Object.keys(notes)
      .filter(w => {
        const week = parseInt(w);
        return week >= startWeek && week <= endWeek;
      })
      .reduce((acc, w) => ({ ...acc, [w]: notes[parseInt(w)] }), {});

    filteredVoiceNotes = Object.keys(voiceNotes)
      .filter(w => {
        const week = parseInt(w);
        return week >= startWeek && week <= endWeek;
      })
      .reduce((acc, w) => ({ ...acc, [w]: voiceNotes[parseInt(w)] }), {});
  }

  const data = {
    version: "1.0",
    exportDate: new Date().toISOString(),
    exportType: startWeek && endWeek ? `weeks-${startWeek}-${endWeek}` : "all-weeks",
    data: {
      photos: filteredPhotos,
      notes: filteredNotes,
      voiceNotes: filteredVoiceNotes
    }
  };

  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  const dateStr = new Date().toISOString().split('T')[0];
  const rangeStr = startWeek && endWeek ? `-weeks-${startWeek}-${endWeek}` : "";
  link.download = `pregnancy-journal${rangeStr}-${dateStr}.json`;
  link.click();
  
  URL.revokeObjectURL(url);
};
