import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Plus, Edit2, Trash2 } from "lucide-react";
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
  "#ffeb3b", // Yellow
  "#ee5ea6", // Pink
  "#a8e6ff", // Sky Blue
  "#a8ffb8", // Light Green
  "#d4b5ff", // Lavender
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
  const [selectedColor, setSelectedColor] = useState(NOTE_COLORS[0]);
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
    setSelectedColor(NOTE_COLORS[0]);
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

  return (
    <div className="glass-card p-4 rounded-2xl">
      <div className="flex items-start justify-between mb-4 gap-3">
        <h3 className="text-lg font-semibold text-foreground pt-1.5">My Notes</h3>
        <Button
          onClick={openAddDialog}
          size="sm"
          className="bg-primary text-white hover:bg-primary/90 flex-shrink-0"
        >
          <Plus className="w-3 h-3 mr-1" />
          Add Note
        </Button>
      </div>

      {notes.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground text-sm mb-3">No notes yet. Start adding your thoughts!</p>
          <Button onClick={openAddDialog} variant="outline" size="sm">
            <Plus className="w-3 h-3 mr-1" />
            Create First Note
          </Button>
        </div>
      ) : (
        <div 
          className="overflow-x-auto pb-3 snap-x snap-mandatory -mx-4 px-4"
          style={{ scrollBehavior: 'auto' }}
        >
          <div className="flex gap-3">
            {notes.map((note) => (
              <div
                key={note.id}
                style={{ 
                  backgroundColor: note.color,
                  boxShadow: 'inset 0 0 0 1.5px rgba(0, 0, 0, 0.05), inset 2px 2px 3px rgba(0, 0, 0, 0.03), 0 1px 3px rgba(0, 0, 0, 0.05)',
                  borderRadius: '1%'
                }}
                className="relative p-4 transition-all hover:scale-105 min-w-[260px] w-[260px] min-h-[200px] flex-shrink-0 snap-center group"
              >
                <button
                  onClick={() => deleteNote(note.id)}
                  className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 transition-all z-10 opacity-0 group-hover:opacity-100 group-active:opacity-100"
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
                      style={{ minHeight: "110px" }}
                    />
                  </div>
                ) : (
                  <div
                    onClick={() => startEditing(note)}
                    className="cursor-pointer h-full flex items-start pt-1"
                  >
                    {note.content ? (
                      <p className="text-gray-800 text-sm whitespace-pre-wrap break-words">
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
        </div>
      )}

      {/* Add Note Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[320px] max-h-[70vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Add Note</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-3 py-1">
            <Textarea
              value={newNoteContent}
              maxLength={1000}
              onChange={(e) => setNewNoteContent(e.target.value)}
              placeholder="Write your note..."
              className="min-h-[100px] text-sm resize-none"
              style={{ 
                backgroundColor: selectedColor,
                border: '2px solid #ee5ea6',
                borderRadius: '0.75rem'
              }}
            />
            
            <div className="space-y-1.5">
              <h4 className="text-sm font-semibold">Choose Color</h4>
              <div className="flex gap-2">
                {NOTE_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-10 h-10 rounded-lg transition-all hover:scale-110 flex-shrink-0 ${
                      selectedColor === color ? 'ring-2 ring-pink-500' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="flex-row gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
              className="flex-1 py-4 text-sm font-semibold rounded-lg"
            >
              Cancel
            </Button>
            <Button
              onClick={addNote}
              className="flex-1 bg-pink-500 hover:bg-pink-600 text-white py-4 text-sm font-semibold rounded-lg"
            >
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
