import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Play, Pause, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { loadFromLocalStorage } from "@/lib/storage";

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
  const [filteredEntries, setFilteredEntries] = useState<TimelineEntry[]>([]);
  const [playingWeek, setPlayingWeek] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [filterType, setFilterType] = useState<"all" | "photos" | "notes" | "voice">("all");
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const weekRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  useEffect(() => {
    const photos = loadFromLocalStorage<WeekPhotos>("pregnancy-week-photos") || {};
    const notes = loadFromLocalStorage<WeekNotes>("pregnancy-week-notes") || {};
    const voiceNotes = loadFromLocalStorage<WeekVoiceNotes>("pregnancy-week-voice-notes") || {};

    // Create entries for all weeks 1-40
    const entries: TimelineEntry[] = Array.from({ length: 40 }, (_, i) => i + 1)
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
    setFilteredEntries(entries);
  }, []);

  useEffect(() => {
    let filtered = timelineEntries;
    
    if (filterType === "photos") {
      filtered = timelineEntries.filter(entry => entry.photo);
    } else if (filterType === "notes") {
      filtered = timelineEntries.filter(entry => entry.notes);
    } else if (filterType === "voice") {
      filtered = timelineEntries.filter(entry => entry.voiceNote);
    }
    
    setFilteredEntries(filtered);
    setCurrentWeekIndex(0);
  }, [filterType, timelineEntries]);

  const scrollToWeek = (index: number) => {
    const entry = filteredEntries[index];
    if (entry && weekRefs.current[entry.week]) {
      weekRefs.current[entry.week]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setCurrentWeekIndex(index);
    }
  };

  const navigateToPrevWeek = () => {
    if (currentWeekIndex > 0) {
      scrollToWeek(currentWeekIndex - 1);
    }
  };

  const navigateToNextWeek = () => {
    if (currentWeekIndex < filteredEntries.length - 1) {
      scrollToWeek(currentWeekIndex + 1);
    }
  };

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
          <div className="sticky top-0 bg-card z-10 pb-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-2xl font-semibold text-foreground truncate pr-2">Pregnancy Journey Timeline</h2>
              <Button variant="ghost" size="icon" onClick={onClose} className="flex-shrink-0">
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <div className="flex items-center gap-2 flex-1">
                <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Filter by..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Weeks ({timelineEntries.length})</SelectItem>
                    <SelectItem value="photos">With Photos ({timelineEntries.filter(e => e.photo).length})</SelectItem>
                    <SelectItem value="notes">With Notes ({timelineEntries.filter(e => e.notes).length})</SelectItem>
                    <SelectItem value="voice">With Voice ({timelineEntries.filter(e => e.voiceNote).length})</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {filteredEntries.length > 0 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={navigateToPrevWeek}
                    disabled={currentWeekIndex === 0}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline ml-1">Prev</span>
                  </Button>
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    Week {filteredEntries[currentWeekIndex]?.week}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={navigateToNextWeek}
                    disabled={currentWeekIndex === filteredEntries.length - 1}
                  >
                    <span className="hidden sm:inline mr-1">Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6 sm:space-y-8">
            {filteredEntries.map((entry) => {
              const hasData = entry.photo || entry.voiceNote || entry.notes;
              
              return (
                <div 
                  key={entry.week} 
                  ref={(el) => weekRefs.current[entry.week] = el}
                  className={`border-l-4 ${hasData ? 'border-primary' : 'border-muted'} pl-6 pb-8 relative`}
                >
                  <div className={`absolute -left-2 sm:-left-3 top-0 w-4 h-4 sm:w-6 sm:h-6 rounded-full ${hasData ? 'bg-primary' : 'bg-muted'} border-2 sm:border-4 border-background`}></div>
                  
                  <h3 className="text-base sm:text-xl font-semibold mb-3 sm:mb-4 text-foreground">Week {entry.week}</h3>
                  
                  {hasData ? (
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
                  ) : (
                    <p className="text-xs sm:text-sm text-muted-foreground italic">No data recorded for this week yet</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
};
