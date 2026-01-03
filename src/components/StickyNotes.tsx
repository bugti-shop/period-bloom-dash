import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { saveToLocalStorage, loadFromLocalStorage } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";

const noteContentSchema = z.string()
  .max(1000, "Note must be 1000 characters or less");

interface Note {
  id: string;
  content: string;
  color: string;
  createdAt: number;
}

interface WeekNotes {
  [week: number]: Note[];
}

const NOTE_COLORS = [
  { bg: "#fef3c7", border: "#fbbf24", name: "Yellow" },
  { bg: "#fce7f3", border: "#ec4899", name: "Pink" },
  { bg: "#cffafe", border: "#06b6d4", name: "Cyan" },
  { bg: "#d1fae5", border: "#10b981", name: "Green" },
  { bg: "#e9d5ff", border: "#a855f7", name: "Purple" },
  { bg: "#fed7aa", border: "#f97316", name: "Orange" },
];

interface StickyNotesProps {
  currentWeek?: number;
}

export const StickyNotes = ({ currentWeek }: StickyNotesProps = {}) => {
  const [weekNotes, setWeekNotes] = useState<WeekNotes>({});
  const [notes, setNotes] = useState<Note[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [selectedColor, setSelectedColor] = useState(NOTE_COLORS[0].bg);
  const { toast } = useToast();

  const storageKey = currentWeek !== undefined ? "pregnancy-week-notes" : "sticky-notes";

  useEffect(() => {
    if (currentWeek !== undefined) {
      const savedWeekNotes = loadFromLocalStorage<WeekNotes>(storageKey);
      if (savedWeekNotes) {
        setWeekNotes(savedWeekNotes);
        setNotes(savedWeekNotes[currentWeek] || []);
      } else {
        setNotes([]);
      }
    } else {
      const savedNotes = loadFromLocalStorage<Note[]>(storageKey);
      if (savedNotes) {
        setNotes(savedNotes);
      }
    }
  }, [currentWeek, storageKey]);

  useEffect(() => {
    if (currentWeek !== undefined) {
      const updatedWeekNotes = {
        ...weekNotes,
        [currentWeek]: notes
      };
      setWeekNotes(updatedWeekNotes);
      saveToLocalStorage(storageKey, updatedWeekNotes);
    } else {
      saveToLocalStorage(storageKey, notes);
    }
  }, [notes]);

  const openAddDialog = () => {
    setNewNoteContent("");
    setSelectedColor(NOTE_COLORS[0].bg);
    setIsAddDialogOpen(true);
  };

  const addNote = () => {
    if (!newNoteContent.trim()) {
      toast({
        title: "Empty note",
        description: "Please write something in your note",
        variant: "destructive",
      });
      return;
    }

    const result = noteContentSchema.safeParse(newNoteContent);
    if (!result.success) {
      toast({
        title: "Note too long",
        description: result.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }
    
    const newNote: Note = {
      id: Date.now().toString(),
      content: newNoteContent,
      color: selectedColor,
      createdAt: Date.now(),
    };
    setNotes([...notes, newNote]);
    setIsAddDialogOpen(false);
    setNewNoteContent("");
    toast({
      title: "Note added",
      description: "Your note has been created",
    });
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter((note) => note.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setEditContent("");
    }
    toast({
      title: "Note deleted",
      description: "Your note has been removed",
    });
  };

  const startEditing = (note: Note) => {
    setEditingId(note.id);
    setEditContent(note.content);
  };

  const saveEdit = () => {
    if (editingId) {
      setNotes(
        notes.map((note) =>
          note.id === editingId ? { ...note, content: editContent } : note
        )
      );
      setEditingId(null);
      setEditContent("");
      toast({
        title: "Note saved",
        description: "Your changes have been saved",
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setEditingId(null);
      setEditContent("");
    }
  };

  const getColorBorder = (bgColor: string) => {
    const colorObj = NOTE_COLORS.find(c => c.bg === bgColor);
    return colorObj?.border || "#fbbf24";
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-bold text-foreground">My Notes</h3>
        <Button
          onClick={openAddDialog}
          size="sm"
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-8 px-3 text-xs font-semibold"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Add
        </Button>
      </div>

      {notes.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border/50 p-8 text-center">
          <p className="text-muted-foreground text-sm mb-4">No notes yet. Start adding your thoughts!</p>
          <Button onClick={openAddDialog} variant="outline" size="sm" className="rounded-xl">
            <Plus className="w-3.5 h-3.5 mr-1" />
            Create First Note
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {notes.map((note) => (
            <div
              key={note.id}
              style={{ 
                backgroundColor: note.color,
                borderLeft: `4px solid ${getColorBorder(note.color)}`,
              }}
              className="relative p-4 rounded-2xl transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] min-h-[140px] group"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNote(note.id);
                }}
                className="absolute top-2 right-2 p-1.5 bg-red-500 rounded-lg text-white hover:bg-red-600 transition-all z-10 opacity-0 group-hover:opacity-100 shadow-sm"
              >
                <Trash2 className="w-3 h-3" />
              </button>

              {editingId === note.id ? (
                <div className="h-full flex flex-col">
                  <textarea
                    value={editContent}
                    maxLength={1000}
                    onChange={(e) => setEditContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={saveEdit}
                    autoFocus
                    placeholder="Type your note here..."
                    className="w-full h-full bg-transparent border-none outline-none resize-none text-gray-800 text-sm font-medium placeholder:text-gray-500"
                    style={{ minHeight: "100px" }}
                  />
                </div>
              ) : (
                <div
                  onClick={() => startEditing(note)}
                  className="cursor-pointer h-full"
                >
                  {note.content ? (
                    <p className="text-gray-800 text-sm whitespace-pre-wrap break-words leading-relaxed">
                      {note.content}
                    </p>
                  ) : (
                    <p className="text-gray-500 text-sm italic flex items-center gap-2">
                      <Edit2 className="w-3 h-3" />
                      Click to add content
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Note Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[360px] max-h-[80vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Add Note</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <Textarea
              value={newNoteContent}
              maxLength={1000}
              onChange={(e) => setNewNoteContent(e.target.value)}
              placeholder="Write your note..."
              className="min-h-[120px] text-sm resize-none rounded-xl"
              style={{ 
                backgroundColor: selectedColor,
                border: `2px solid ${getColorBorder(selectedColor)}`,
              }}
            />
            
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-foreground">Choose Color</h4>
              <div className="flex gap-2 flex-wrap">
                {NOTE_COLORS.map((color) => (
                  <button
                    key={color.bg}
                    onClick={() => setSelectedColor(color.bg)}
                    className={`w-10 h-10 rounded-xl transition-all hover:scale-110 flex-shrink-0 border-2 ${
                      selectedColor === color.bg ? 'ring-2 ring-primary ring-offset-2' : ''
                    }`}
                    style={{ 
                      backgroundColor: color.bg,
                      borderColor: color.border,
                    }}
                    aria-label={color.name}
                  />
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="flex-row gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
              className="flex-1 py-5 text-sm font-semibold rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={addNote}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground py-5 text-sm font-semibold rounded-xl"
            >
              Add Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
