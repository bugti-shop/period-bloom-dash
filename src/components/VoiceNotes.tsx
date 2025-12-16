import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Play, Trash2, Download, Pause } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { saveToLocalStorage, loadFromLocalStorage } from "@/lib/storage";
import { format } from "date-fns";
import { Capacitor } from "@capacitor/core";

interface VoiceNote {
  id: string;
  data: string; // base64 encoded audio
  timestamp: Date;
  duration: number;
  date: string; // YYYY-MM-DD format
  transcription?: string;
}

interface VoiceNotesProps {
  selectedDate: Date;
}

export const VoiceNotes = ({ selectedDate }: VoiceNotesProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingStartTimeRef = useRef<number>(0);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const dateKeyRef = useRef<string>(format(selectedDate, "yyyy-MM-dd"));
  const { toast } = useToast();

  const dateKey = format(selectedDate, "yyyy-MM-dd");
  
  // Keep dateKeyRef in sync
  useEffect(() => {
    dateKeyRef.current = dateKey;
  }, [dateKey]);

  useEffect(() => {
    loadVoiceNotes();
  }, [selectedDate]);

  const loadVoiceNotes = () => {
    const notes = loadFromLocalStorage<VoiceNote[]>("voice-notes") || [];
    const notesForDate = notes
      .filter(note => note.date === dateKey)
      .map(note => {
        const timestamp = new Date(note.timestamp);
        return {
          ...note,
          timestamp: isNaN(timestamp.getTime()) ? new Date() : timestamp
        };
      });
    setVoiceNotes(notesForDate);
  };

  const startRecording = async () => {
    try {
      // Request microphone permission on native platforms
      if (Capacitor.isNativePlatform()) {
        try {
          // Check and request permission
          const micPermission = await (navigator as any).permissions.query({ name: 'microphone' as PermissionName });
          
          if (micPermission.state === 'denied') {
            toast({
              title: "Microphone Permission Required",
              description: "Please enable microphone access in your device settings",
              variant: "destructive"
            });
            return;
          }
        } catch (permError) {
          console.log('Permission query not supported, proceeding with getUserMedia');
        }
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      recordingStartTimeRef.current = Date.now();
      setCurrentTranscript("");

      // Start speech recognition
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let transcript = '';
          for (let i = 0; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript + ' ';
          }
          setCurrentTranscript(transcript.trim());
        };

        recognition.start();
        recognitionRef.current = recognition;
      }

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        const savedDateKey = dateKeyRef.current; // Capture current dateKey
        const savedTranscript = currentTranscript;
        
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          const duration = Math.floor((Date.now() - recordingStartTimeRef.current) / 1000);
          
          const newNote: VoiceNote = {
            id: Date.now().toString(),
            data: base64Audio,
            timestamp: new Date(),
            duration,
            date: savedDateKey,
            transcription: savedTranscript || undefined
          };

          const allNotes = loadFromLocalStorage<VoiceNote[]>("voice-notes") || [];
          allNotes.unshift(newNote);
          saveToLocalStorage("voice-notes", allNotes);
          
          // Reload notes for the current view
          const notes = loadFromLocalStorage<VoiceNote[]>("voice-notes") || [];
          const notesForDate = notes
            .filter(note => note.date === dateKeyRef.current)
            .map(note => ({
              ...note,
              timestamp: new Date(note.timestamp)
            }));
          setVoiceNotes(notesForDate);
          
          toast({
            title: "Voice note saved",
            description: savedTranscript ? "Recording and transcription saved" : `Recorded ${duration} seconds`
          });
        };
        
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach(track => track.stop());

        // Stop speech recognition
        if (recognitionRef.current) {
          recognitionRef.current.stop();
          recognitionRef.current = null;
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      toast({
        title: "Microphone Access Denied",
        description: "Please allow microphone access to record voice notes",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const playNote = (note: VoiceNote) => {
    // If clicking the same note
    if (playingId === note.id) {
      if (currentAudioRef.current) {
        if (isPaused) {
          // Resume playback
          currentAudioRef.current.play();
          setIsPaused(false);
        } else {
          // Pause playback
          currentAudioRef.current.pause();
          setIsPaused(true);
        }
      }
      return;
    }

    // Stop any currently playing audio
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
    }

    // Play new audio
    const audio = new Audio(note.data);
    currentAudioRef.current = audio;
    audio.play();
    setPlayingId(note.id);
    setIsPaused(false);
    
    audio.onended = () => {
      setPlayingId(null);
      setIsPaused(false);
      currentAudioRef.current = null;
    };
  };

  const deleteNote = (noteId: string) => {
    const allNotes = loadFromLocalStorage<VoiceNote[]>("voice-notes") || [];
    const filtered = allNotes.filter(note => note.id !== noteId);
    saveToLocalStorage("voice-notes", filtered);
    loadVoiceNotes();
    toast({
      title: "Voice note deleted"
    });
  };

  const downloadNote = (note: VoiceNote) => {
    const link = document.createElement('a');
    link.href = note.data;
    const timestamp = isNaN(note.timestamp.getTime()) ? new Date() : note.timestamp;
    link.download = `voice-note-${format(timestamp, "yyyy-MM-dd-HHmmss")}.webm`;
    link.click();
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Voice Notes</h3>
        <p className="text-xs text-gray-500">{format(selectedDate, "MMM dd, yyyy")}</p>
      </div>

      <div className="space-y-3">
        <div className="flex justify-center">
          {!isRecording ? (
            <Button
              onClick={startRecording}
              className="w-full bg-red-500 hover:bg-red-600 text-white"
              size="lg"
            >
              <Mic className="w-5 h-5 mr-2" />
              Start Recording
            </Button>
          ) : (
            <Button
              onClick={stopRecording}
              className="w-full bg-gray-800 hover:bg-gray-900 text-white animate-pulse"
              size="lg"
            >
              <Square className="w-5 h-5 mr-2" />
              Stop Recording
            </Button>
          )}
        </div>

        {isRecording && currentTranscript && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs font-medium text-blue-700 mb-1">Live Transcription:</p>
            <p className="text-sm text-blue-900">{currentTranscript}</p>
          </div>
        )}
      </div>

      {voiceNotes.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Recordings</p>
          {voiceNotes.map((note) => (
            <div
              key={note.id}
              className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <Button
                onClick={() => playNote(note)}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 flex-shrink-0"
              >
                {playingId === note.id ? (
                  isPaused ? (
                    <Play className="w-4 h-4 text-red-500" />
                  ) : (
                    <Square className="w-4 h-4 text-red-500" />
                  )
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </Button>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">
                  {isNaN(note.timestamp.getTime()) ? "Invalid time" : format(note.timestamp, "h:mm a")}
                </p>
                <p className="text-xs text-gray-500 mb-1">{note.duration}s</p>
                {note.transcription && (
                  <p className="text-xs text-gray-700 line-clamp-2">{note.transcription}</p>
                )}
              </div>

              <Button
                onClick={() => downloadNote(note)}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <Download className="w-4 h-4" />
              </Button>

              <Button
                onClick={() => deleteNote(note.id)}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
