import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Camera, Download, Trash2, Mic, Square, Play, Pause } from "lucide-react";
import { saveToLocalStorage, loadFromLocalStorage } from "@/lib/storage";
import { toast } from "sonner";

interface WeekPhoto {
  imageData: string;
  timestamp: Date;
}

interface WeekNotes {
  [week: number]: string;
}

interface WeekPhotos {
  [week: number]: WeekPhoto;
}

interface WeekVoiceNote {
  data: string;
  timestamp: Date;
  duration: number;
}

interface WeekVoiceNotes {
  [week: number]: WeekVoiceNote;
}

interface PregnancyPhotoJournalProps {
  currentWeek: number;
}

const PREGNANCY_PHOTOS_KEY = "pregnancy-week-photos";
const PREGNANCY_NOTES_KEY = "pregnancy-week-notes";
const PREGNANCY_VOICE_NOTES_KEY = "pregnancy-week-voice-notes";

export const PregnancyPhotoJournal = ({ currentWeek }: PregnancyPhotoJournalProps) => {
  const [weekPhotos, setWeekPhotos] = useState<WeekPhotos>({});
  const [weekNotes, setWeekNotes] = useState<WeekNotes>({});
  const [weekVoiceNotes, setWeekVoiceNotes] = useState<WeekVoiceNotes>({});
  const [currentNotes, setCurrentNotes] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingStartTimeRef = useRef<number>(0);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setCurrentNotes(weekNotes[currentWeek] || "");
  }, [currentWeek, weekNotes]);

  const loadData = () => {
    const storedPhotos = loadFromLocalStorage<WeekPhotos>(PREGNANCY_PHOTOS_KEY);
    const storedNotes = loadFromLocalStorage<WeekNotes>(PREGNANCY_NOTES_KEY);
    const storedVoiceNotes = loadFromLocalStorage<WeekVoiceNotes>(PREGNANCY_VOICE_NOTES_KEY);
    
    if (storedPhotos) {
      const photosWithDates: WeekPhotos = {};
      Object.keys(storedPhotos).forEach(week => {
        photosWithDates[parseInt(week)] = {
          ...storedPhotos[parseInt(week)],
          timestamp: new Date(storedPhotos[parseInt(week)].timestamp)
        };
      });
      setWeekPhotos(photosWithDates);
    }
    
    if (storedNotes) {
      setWeekNotes(storedNotes);
    }

    if (storedVoiceNotes) {
      const voiceNotesWithDates: WeekVoiceNotes = {};
      Object.keys(storedVoiceNotes).forEach(week => {
        voiceNotesWithDates[parseInt(week)] = {
          ...storedVoiceNotes[parseInt(week)],
          timestamp: new Date(storedVoiceNotes[parseInt(week)].timestamp)
        };
      });
      setWeekVoiceNotes(voiceNotesWithDates);
    }
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const newPhoto: WeekPhoto = {
        imageData: reader.result as string,
        timestamp: new Date()
      };

      const updatedPhotos = {
        ...weekPhotos,
        [currentWeek]: newPhoto
      };
      
      setWeekPhotos(updatedPhotos);
      saveToLocalStorage(PREGNANCY_PHOTOS_KEY, updatedPhotos);
      
      setIsDialogOpen(false);
      toast.success("Bump photo added!");
    };
    reader.readAsDataURL(file);
  };

  const deletePhoto = () => {
    const updatedPhotos = { ...weekPhotos };
    delete updatedPhotos[currentWeek];
    setWeekPhotos(updatedPhotos);
    saveToLocalStorage(PREGNANCY_PHOTOS_KEY, updatedPhotos);
    setShowControls(false);
    toast.success("Photo deleted");
  };

  const downloadPhoto = () => {
    const photo = weekPhotos[currentWeek];
    if (!photo) return;
    
    const link = document.createElement('a');
    link.href = photo.imageData;
    link.download = `bump-week-${currentWeek}.jpg`;
    link.click();
    toast.success("Photo downloaded");
  };

  const handleNotesChange = (value: string) => {
    setCurrentNotes(value);
    const updatedNotes = {
      ...weekNotes,
      [currentWeek]: value
    };
    setWeekNotes(updatedNotes);
    saveToLocalStorage(PREGNANCY_NOTES_KEY, updatedNotes);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      recordingStartTimeRef.current = Date.now();

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          const duration = Math.floor((Date.now() - recordingStartTimeRef.current) / 1000);
          
          const newVoiceNote: WeekVoiceNote = {
            data: base64Audio,
            timestamp: new Date(),
            duration
          };

          const updatedVoiceNotes = {
            ...weekVoiceNotes,
            [currentWeek]: newVoiceNote
          };
          
          setWeekVoiceNotes(updatedVoiceNotes);
          saveToLocalStorage(PREGNANCY_VOICE_NOTES_KEY, updatedVoiceNotes);
          
          toast.success(`Voice note saved (${duration}s)`);
        };
        
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      toast.error("Please allow microphone access to record voice notes");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const playVoiceNote = () => {
    const voiceNote = weekVoiceNotes[currentWeek];
    if (!voiceNote) return;

    if (isPlaying && currentAudioRef.current) {
      if (isPaused) {
        currentAudioRef.current.play();
        setIsPaused(false);
      } else {
        currentAudioRef.current.pause();
        setIsPaused(true);
      }
      return;
    }

    const audio = new Audio(voiceNote.data);
    currentAudioRef.current = audio;

    audio.onended = () => {
      setIsPlaying(false);
      setIsPaused(false);
      currentAudioRef.current = null;
    };

    audio.play();
    setIsPlaying(true);
    setIsPaused(false);
  };

  const deleteVoiceNote = () => {
    const updatedVoiceNotes = { ...weekVoiceNotes };
    delete updatedVoiceNotes[currentWeek];
    setWeekVoiceNotes(updatedVoiceNotes);
    saveToLocalStorage(PREGNANCY_VOICE_NOTES_KEY, updatedVoiceNotes);
    
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    setIsPlaying(false);
    setIsPaused(false);
    
    toast.success("Voice note deleted");
  };

  const currentWeekPhoto = weekPhotos[currentWeek];
  const currentWeekVoiceNote = weekVoiceNotes[currentWeek];

  return (
    <Card className="p-6 bg-card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-foreground">Bump Photo Journal</h2>
        {!currentWeekPhoto && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Camera className="w-4 h-4" />
                Add Photo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Bump Photo - Week {currentWeek}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label htmlFor="photo-upload" className="cursor-pointer">
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
                      <Camera className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Click to select a photo
                      </p>
                    </div>
                    <input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoCapture}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {!currentWeekPhoto ? (
        <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-lg">
          <Camera className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p>No photo for week {currentWeek} yet</p>
        </div>
      ) : (
        <div className="relative mb-4">
          <div 
            className="relative w-full aspect-[4/3] rounded-lg overflow-hidden cursor-pointer"
            onClick={() => setShowControls(!showControls)}
          >
            <img
              src={currentWeekPhoto.imageData}
              alt={`Week ${currentWeek}`}
              className="w-full h-full object-cover"
            />
            {showControls && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-4">
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadPhoto();
                  }}
                  className="w-12 h-12"
                >
                  <Download className="w-6 h-6" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    deletePhoto();
                  }}
                  className="w-12 h-12"
                >
                  <Trash2 className="w-6 h-6" />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-foreground">
            Week {currentWeek} Voice Note
          </label>
          <div className="flex items-center gap-2">
            {!currentWeekVoiceNote ? (
              <Button
                onClick={isRecording ? stopRecording : startRecording}
                variant={isRecording ? "destructive" : "outline"}
                className="flex-1"
              >
                {isRecording ? (
                  <>
                    <Square className="w-4 h-4 mr-2" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 mr-2" />
                    Record Voice Note
                  </>
                )}
              </Button>
            ) : (
              <>
                <Button
                  onClick={playVoiceNote}
                  variant="outline"
                  className="flex-1"
                >
                  {isPlaying && !isPaused ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Pause ({currentWeekVoiceNote.duration}s)
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      {isPaused ? "Resume" : "Play"} ({currentWeekVoiceNote.duration}s)
                    </>
                  )}
                </Button>
                <Button
                  onClick={deleteVoiceNote}
                  variant="outline"
                  size="icon"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-foreground">
            Week {currentWeek} Notes
          </label>
          <Textarea
            value={currentNotes}
            onChange={(e) => handleNotesChange(e.target.value)}
            placeholder="Add your thoughts, feelings, or updates for this week..."
            className="min-h-[120px]"
          />
        </div>
      </div>
    </Card>
  );
};
