import { useState } from "react";
import { Plus, Trash2, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  loadChecklists,
  createCustomChecklist,
  deleteChecklist,
  updateChecklistColor,
  type Checklist,
} from "@/lib/checklistStorage";
import { toast } from "sonner";

interface ChecklistCustomizationProps {
  open: boolean;
  onClose: () => void;
}

const colorPresets = [
  "#f5e6d3",
  "#fdd5d5",
  "#d4e8f7",
  "#e8d5f0",
  "#d5f0e3",
  "#fff4cc",
  "#ffd6e8",
  "#d6f0ff",
];

export const ChecklistCustomization = ({
  open,
  onClose,
}: ChecklistCustomizationProps) => {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newColor, setNewColor] = useState(colorPresets[0]);
  const [newIcon, setNewIcon] = useState("");
  const [editingColorId, setEditingColorId] = useState<string | null>(null);

  useState(() => {
    if (open) {
      setChecklists(loadChecklists());
    }
  });

  const handleCreate = () => {
    if (!newTitle.trim()) {
      toast.error("Please enter a title");
      return;
    }

    createCustomChecklist(newTitle.trim(), newColor, newIcon || undefined);
    setNewTitle("");
    setNewColor(colorPresets[0]);
    setNewIcon("");
    setChecklists(loadChecklists());
    toast.success("Checklist created!");
  };

  const handleDelete = (id: string, isCustom: boolean) => {
    if (!isCustom) {
      toast.error("Cannot delete default checklists");
      return;
    }
    deleteChecklist(id);
    setChecklists(loadChecklists());
    toast.success("Checklist deleted!");
  };

  const handleColorUpdate = (id: string, color: string) => {
    updateChecklistColor(id, color);
    setChecklists(loadChecklists());
    setEditingColorId(null);
    toast.success("Color updated!");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customize Checklists</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="border-b pb-4">
            <h3 className="font-semibold mb-3">Create New Checklist</h3>
            <div className="space-y-3">
              <div>
                <Label>Title</Label>
                <Input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Baby Names, Nursery Items"
                />
              </div>
              <div>
                <Label>Icon (optional emoji)</Label>
                <Input
                  value={newIcon}
                  onChange={(e) => setNewIcon(e.target.value)}
                  placeholder="e.g., 🍼, 👶, 🎀"
                  maxLength={2}
                />
              </div>
              <div>
                <Label>Background Color</Label>
                <div className="flex gap-2 mt-2">
                  {colorPresets.map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewColor(color)}
                      style={{ backgroundColor: color }}
                      className={`w-10 h-10 rounded-full border-2 ${
                        newColor === color
                          ? "border-foreground scale-110"
                          : "border-border"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <Button onClick={handleCreate} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Create Checklist
              </Button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Existing Checklists</h3>
            <div className="space-y-2">
              {checklists.map((checklist) => (
                <div
                  key={checklist.id}
                  className="flex items-center gap-3 p-3 rounded-lg border"
                >
                  <div
                    style={{ backgroundColor: checklist.bgColor }}
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                  >
                    {checklist.icon || "📋"}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{checklist.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {checklist.items.length} items
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setEditingColorId(
                        editingColorId === checklist.id ? null : checklist.id
                      )
                    }
                  >
                    <Palette className="h-4 w-4" />
                  </Button>
                  {checklist.isCustom && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        handleDelete(checklist.id, checklist.isCustom)
                      }
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                  {editingColorId === checklist.id && (
                    <div className="absolute right-16 mt-2 p-2 bg-card border rounded-lg shadow-lg flex gap-1 z-50">
                      {colorPresets.map((color) => (
                        <button
                          key={color}
                          onClick={() => handleColorUpdate(checklist.id, color)}
                          style={{ backgroundColor: color }}
                          className="w-8 h-8 rounded-full border"
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
