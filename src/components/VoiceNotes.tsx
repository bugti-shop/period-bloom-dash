import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Mic, Square, Play, Trash2, Download, Pause, Pencil, Check, X, Tag, Plus, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { saveToLocalStorage, loadFromLocalStorage } from "@/lib/storage";
import { format } from "date-fns";
import { Capacitor } from "@capacitor/core";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface VoiceNote {
  id: string;
  data: string;
  timestamp: Date;
  duration: number;
  date: string;
  transcription?: string;
  name?: string;
  tags?: string[];
}

interface VoiceNotesProps {
  selectedDate: Date;
}

const DEFAULT_TAGS = [
  "Personal",
  "Symptoms",
  "Doctor Notes",
  "Reminder",
  "Mood",
  "Important"
];

export const VoiceNotes = ({ selectedDate }: VoiceNotesProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [playbackProgress, setPlaybackProgress] = useState<Record<string, number>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState("");
  const [showNewTagInput, setShowNewTagInput] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingStartTimeRef = useRef<number>(0);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const dateKeyRef = useRef<string>(format(selectedDate, "yyyy-MM-dd"));
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const dateKey = format(selectedDate, "yyyy-MM-dd");
  
  // Get all available tags
  const allTags = [...DEFAULT_TAGS, ...customTags];
  
  useEffect(() => {
    dateKeyRef.current = dateKey;
  }, [dateKey]);

  useEffect(() => {
    loadVoiceNotes();
    loadCustomTags();
  }, [selectedDate]);

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  const loadCustomTags = () => {
    const saved = loadFromLocalStorage<string[]>("voice-note-custom-tags") || [];
    setCustomTags(saved);
  };

  const saveCustomTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !allTags.includes(trimmed)) {
      const updated = [...customTags, trimmed];
      setCustomTags(updated);
      saveToLocalStorage("voice-note-custom-tags", updated);
    }
  };

  const loadVoiceNotes = (forceDateKey?: string) => {
    const targetDateKey = forceDateKey || dateKeyRef.current;
    const notes = loadFromLocalStorage<VoiceNote[]>("voice-notes") || [];
    const notesForDate = notes
      .filter(note => note.date === targetDateKey)
      .map(note => ({
        ...note,
        timestamp: new Date(note.timestamp)
      }));
    console.log('Loading voice notes for date:', targetDateKey, 'Found:', notesForDate.length);
    setVoiceNotes(notesForDate);
  };

  const filteredNotes = filterTag 
    ? voiceNotes.filter(note => note.tags?.includes(filterTag))
    : voiceNotes;

  const startRecording = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        try {
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
        const savedDateKey = dateKeyRef.current;
        const savedTranscript = currentTranscript;
        
        console.log('Recording stopped, saving to date:', savedDateKey);
        
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          const duration = Math.floor((Date.now() - recordingStartTimeRef.current) / 1000);
          
          const newNote: VoiceNote = {
            id: Date.now().toString(),
            data: base64Audio,
            timestamp: new Date(),
            duration,
            date: savedDateKey,
            transcription: savedTranscript || undefined,
            name: undefined,
            tags: []
          };

          console.log('Created new note:', { id: newNote.id, date: newNote.date, duration: newNote.duration });

          const allNotes = loadFromLocalStorage<VoiceNote[]>("voice-notes") || [];
          allNotes.unshift(newNote);
          saveToLocalStorage("voice-notes", allNotes);
          
          console.log('Saved to localStorage, total notes:', allNotes.length);
          
          // Directly update state with the new note instead of reloading
          setVoiceNotes(prev => {
            const filtered = prev.filter(n => n.id !== newNote.id);
            return [newNote, ...filtered];
          });
          
          toast({
            title: "Voice note saved",
            description: savedTranscript ? "Recording and transcription saved" : `Recorded ${duration} seconds`
          });
        };
        
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach(track => track.stop());

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

  const startProgressTracking = (noteId: string) => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    
    progressIntervalRef.current = setInterval(() => {
      if (currentAudioRef.current) {
        const audio = currentAudioRef.current;
        const progress = (audio.currentTime / audio.duration) * 100;
        setPlaybackProgress(prev => ({ ...prev, [noteId]: progress }));
      }
    }, 100);
  };

  const stopProgressTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  const playNote = (note: VoiceNote) => {
    if (playingId === note.id) {
      if (currentAudioRef.current) {
        if (isPaused) {
          currentAudioRef.current.play();
          setIsPaused(false);
          startProgressTracking(note.id);
        } else {
          currentAudioRef.current.pause();
          setIsPaused(true);
          stopProgressTracking();
        }
      }
      return;
    }

    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      stopProgressTracking();
    }

    const audio = new Audio(note.data);
    currentAudioRef.current = audio;
    
    setPlaybackProgress(prev => ({ ...prev, [note.id]: 0 }));
    
    audio.play();
    setPlayingId(note.id);
    setIsPaused(false);
    startProgressTracking(note.id);
    
    audio.onended = () => {
      setPlayingId(null);
      setIsPaused(false);
      setPlaybackProgress(prev => ({ ...prev, [note.id]: 0 }));
      stopProgressTracking();
      currentAudioRef.current = null;
    };
  };

  const seekTo = (noteId: string, percentage: number) => {
    if (playingId === noteId && currentAudioRef.current) {
      const audio = currentAudioRef.current;
      audio.currentTime = (percentage / 100) * audio.duration;
      setPlaybackProgress(prev => ({ ...prev, [noteId]: percentage }));
    }
  };

  const toggleTag = (noteId: string, tag: string) => {
    const allNotes = loadFromLocalStorage<VoiceNote[]>("voice-notes") || [];
    const updatedNotes = allNotes.map(note => {
      if (note.id === noteId) {
        const currentTags = note.tags || [];
        const newTags = currentTags.includes(tag)
          ? currentTags.filter(t => t !== tag)
          : [...currentTags, tag];
        return { ...note, tags: newTags };
      }
      return note;
    });
    saveToLocalStorage("voice-notes", updatedNotes);
    loadVoiceNotes();
  };

  const deleteNote = (noteId: string) => {
    const allNotes = loadFromLocalStorage<VoiceNote[]>("voice-notes") || [];
    const filtered = allNotes.filter(note => note.id !== noteId);
    saveToLocalStorage("voice-notes", filtered);
    loadVoiceNotes();
    toast({ title: "Voice note deleted" });
  };

  const downloadNote = (note: VoiceNote) => {
    const link = document.createElement('a');
    link.href = note.data;
    const timestamp = isNaN(note.timestamp.getTime()) ? new Date() : note.timestamp;
    link.download = `voice-note-${format(timestamp, "yyyy-MM-dd-HHmmss")}.webm`;
    link.click();
  };

  const startEditing = (note: VoiceNote) => {
    setEditingId(note.id);
    setEditName(note.name || "");
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditName("");
  };

  const saveNoteName = (noteId: string) => {
    const allNotes = loadFromLocalStorage<VoiceNote[]>("voice-notes") || [];
    const updatedNotes = allNotes.map(note => 
      note.id === noteId ? { ...note, name: editName.trim() || undefined } : note
    );
    saveToLocalStorage("voice-notes", updatedNotes);
    loadVoiceNotes();
    setEditingId(null);
    setEditName("");
    toast({ title: "Voice note renamed" });
  };

  const handleAddCustomTag = () => {
    if (newTagInput.trim()) {
      saveCustomTag(newTagInput.trim());
      setNewTagInput("");
      setShowNewTagInput(false);
      toast({ title: "Tag added" });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTagColor = (tag: string) => {
    const colors: Record<string, string> = {
      "Personal": "bg-blue-100 text-blue-700",
      "Symptoms": "bg-pink-100 text-pink-700",
      "Doctor Notes": "bg-green-100 text-green-700",
      "Reminder": "bg-yellow-100 text-yellow-700",
      "Mood": "bg-purple-100 text-purple-700",
      "Important": "bg-red-100 text-red-700"
    };
    return colors[tag] || "bg-gray-100 text-gray-700";
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

      {/* Filter by Tag */}
      {voiceNotes.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <Filter className="w-3 h-3 mr-1" />
                {filterTag || "All"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white z-50">
              <DropdownMenuItem onClick={() => setFilterTag(null)}>
                All Notes
              </DropdownMenuItem>
              {allTags.map(tag => (
                <DropdownMenuItem key={tag} onClick={() => setFilterTag(tag)}>
                  {tag}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {filterTag && (
            <Badge 
              variant="secondary" 
              className="cursor-pointer"
              onClick={() => setFilterTag(null)}
            >
              {filterTag} <X className="w-3 h-3 ml-1" />
            </Badge>
          )}
        </div>
      )}

      {filteredNotes.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">
            Recordings {filterTag && `(${filterTag})`}
          </p>
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-2"
            >
              <div className="flex items-center gap-2">
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
                      <Pause className="w-4 h-4 text-red-500" />
                    )
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </Button>
                
                <div className="flex-1 min-w-0">
                  {editingId === note.id ? (
                    <div className="flex items-center gap-1">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Enter name..."
                        className="h-7 text-sm"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveNoteName(note.id);
                          if (e.key === 'Escape') cancelEditing();
                        }}
                      />
                      <Button
                        onClick={() => saveNoteName(note.id)}
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-green-600"
                      >
                        <Check className="w-3 h-3" />
                      </Button>
                      <Button
                        onClick={cancelEditing}
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-gray-500"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm font-medium truncate">
                        {note.name || (isNaN(note.timestamp.getTime()) ? "Voice Note" : format(note.timestamp, "h:mm a"))}
                      </p>
                      <p className="text-xs text-gray-500">{formatTime(note.duration)}</p>
                    </>
                  )}
                </div>

                {editingId !== note.id && (
                  <>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Tag className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-white z-50 w-48">
                        {allTags.map(tag => (
                          <DropdownMenuItem 
                            key={tag} 
                            onClick={() => toggleTag(note.id, tag)}
                            className="flex items-center justify-between"
                          >
                            <span>{tag}</span>
                            {note.tags?.includes(tag) && <Check className="w-4 h-4 text-green-600" />}
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuItem 
                          onClick={() => setShowNewTagInput(true)}
                          className="text-primary"
                        >
                          <Plus className="w-4 h-4 mr-1" /> Add Custom Tag
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <Button
                      onClick={() => startEditing(note)}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>

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
                  </>
                )}
              </div>

              {/* Tags Display */}
              {note.tags && note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {note.tags.map(tag => (
                    <Badge 
                      key={tag} 
                      variant="secondary" 
                      className={`text-[10px] px-1.5 py-0 ${getTagColor(tag)}`}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Progress Bar */}
              <div 
                className="cursor-pointer"
                onClick={(e) => {
                  if (playingId === note.id) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const percentage = ((e.clientX - rect.left) / rect.width) * 100;
                    seekTo(note.id, percentage);
                  }
                }}
              >
                <Progress 
                  value={playingId === note.id ? (playbackProgress[note.id] || 0) : 0} 
                  className="h-1.5"
                />
              </div>

              {note.transcription && (
                <p className="text-xs text-gray-700 line-clamp-2">{note.transcription}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Custom Tag Input Dialog */}
      {showNewTagInput && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-4 w-full max-w-sm space-y-3">
            <h4 className="font-semibold">Add Custom Tag</h4>
            <Input
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              placeholder="Enter tag name..."
              autoFocus
              maxLength={20}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddCustomTag();
                if (e.key === 'Escape') {
                  setShowNewTagInput(false);
                  setNewTagInput("");
                }
              }}
            />
            <div className="flex gap-2">
              <Button onClick={handleAddCustomTag} className="flex-1">
                Add Tag
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowNewTagInput(false);
                  setNewTagInput("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {voiceNotes.length === 0 && (
        <p className="text-center text-sm text-gray-500 py-4">
          No voice notes for this date
        </p>
      )}

      {voiceNotes.length > 0 && filteredNotes.length === 0 && filterTag && (
        <p className="text-center text-sm text-gray-500 py-4">
          No voice notes with tag "{filterTag}"
        </p>
      )}
    </div>
  );
};
