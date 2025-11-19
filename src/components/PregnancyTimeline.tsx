import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Play, Pause } from "lucide-react";
import { loadFromLocalStorage } from "@/lib/storage";
import { useRef } from "react";

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

interface TimelineEntry {
  week: number;
  photo?: WeekPhoto;
  notes?: string;
  voiceNote?: WeekVoiceNote;
}

interface PregnancyTimelineProps {
  onClose: () => void;
}

export const PregnancyTimeline = ({ onClose }: PregnancyTimelineProps) => {
  const [timelineEntries, setTimelineEntries] = useState<TimelineEntry[]>([]);
  const [playingWeek, setPlayingWeek] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const photos = loadFromLocalStorage<WeekPhotos>("pregnancy-week-photos") || {};
    const notes = loadFromLocalStorage<WeekNotes>("pregnancy-week-notes") || {};
    const voiceNotes = loadFromLocalStorage<WeekVoiceNotes>("pregnancy-week-voice-notes") || {};

    const allWeeks = new Set([
      ...Object.keys(photos).map(w => parseInt(w)),
      ...Object.keys(notes).map(w => parseInt(w)),
      ...Object.keys(voiceNotes).map(w => parseInt(w))
    ]);

    const entries: TimelineEntry[] = Array.from(allWeeks)
      .sort((a, b) => a - b)
      .map(week => ({
        week,
        photo: photos[week] ? {
          ...photos[week],
          timestamp: new Date(photos[week].timestamp)
        } : undefined,
        notes: notes[week],
        voiceNote: voiceNotes[week] ? {
          ...voiceNotes[week],
          timestamp: new Date(voiceNotes[week].timestamp)
        } : undefined
      }));

    setTimelineEntries(entries);
  }, []);

  const playVoiceNote = (week: number, voiceNote: WeekVoiceNote) => {
    if (playingWeek === week && currentAudioRef.current) {
      if (isPaused) {
        currentAudioRef.current.play();
        setIsPaused(false);
      } else {
        currentAudioRef.current.pause();
        setIsPaused(true);
      }
      return;
    }

    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
    }

    const audio = new Audio(voiceNote.data);
    currentAudioRef.current = audio;

    audio.onended = () => {
      setPlayingWeek(null);
      setIsPaused(false);
      currentAudioRef.current = null;
    };

    audio.play();
    setPlayingWeek(week);
    setIsPaused(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto my-auto">
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6 sticky top-0 bg-card z-10 pb-2 sm:pb-4">
            <h2 className="text-lg sm:text-2xl font-semibold text-foreground truncate pr-2">Pregnancy Journey Timeline</h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="flex-shrink-0">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {timelineEntries.length === 0 ? (
            <div className="text-center py-8 sm:py-12 text-muted-foreground">
              <p className="text-sm sm:text-base">Your pregnancy timeline is empty.</p>
              <p className="text-xs sm:text-sm mt-2">Start adding photos, notes, and voice recordings!</p>
            </div>
          ) : (
            <div className="space-y-6 sm:space-y-8">
              {timelineEntries.map((entry) => (
                <div key={entry.week} className="border-l-4 border-primary pl-6 pb-8 relative">
                  <div className="absolute -left-2 sm:-left-3 top-0 w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-primary border-2 sm:border-4 border-background"></div>
                  
                  <h3 className="text-base sm:text-xl font-semibold mb-3 sm:mb-4 text-foreground">Week {entry.week}</h3>
                  
                  <div className="space-y-3 sm:space-y-4">
                    {entry.photo && (
                      <div>
                        <h4 className="text-xs sm:text-sm font-medium mb-2 text-muted-foreground">Bump Photo</h4>
                        <img
                          src={entry.photo.imageData}
                          alt={`Week ${entry.week}`}
                          className="w-full max-w-md aspect-[4/3] object-cover rounded-lg"
                        />
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {entry.photo.timestamp.toLocaleDateString()}
                        </p>
                      </div>
                    )}

                    {entry.voiceNote && (
                      <div>
                        <h4 className="text-xs sm:text-sm font-medium mb-2 text-muted-foreground">Voice Note</h4>
                        <Button
                          onClick={() => playVoiceNote(entry.week, entry.voiceNote!)}
                          variant="outline"
                          size="sm"
                          className="w-full sm:w-auto"
                        >
                          {playingWeek === entry.week && !isPaused ? (
                            <>
                              <Pause className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                              <span className="truncate">Pause ({entry.voiceNote.duration}s)</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                              <span className="truncate">{playingWeek === entry.week && isPaused ? "Resume" : "Play"} ({entry.voiceNote.duration}s)</span>
                            </>
                          )}
                        </Button>
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {entry.voiceNote.timestamp.toLocaleDateString()}
                        </p>
                      </div>
                    )}

                    {entry.notes && (
                      <div>
                        <h4 className="text-xs sm:text-sm font-medium mb-2 text-muted-foreground">Notes</h4>
                        <p className="text-xs sm:text-sm text-foreground whitespace-pre-wrap bg-muted/30 p-2 sm:p-3 rounded-lg break-words">
                          {entry.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
