import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Edit2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  loadChecklists,
  addChecklistItem,
  toggleChecklistItem,
  deleteChecklistItem,
  editChecklistItem,
  markAllCategoryItemsComplete,
  type Checklist,
} from "@/lib/checklistStorage";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const ChecklistDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [checklist, setChecklist] = useState<Checklist | null>(null);
  const [newItemText, setNewItemText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  useEffect(() => {
    const checklists = loadChecklists();
    const found = checklists.find((c) => c.id === id);
    if (found) {
      setChecklist(found);
    } else {
      navigate("/");
    }
  }, [id, navigate]);

  const handleAddItem = () => {
    if (newItemText.trim() && checklist) {
      addChecklistItem(checklist.id, newItemText.trim());
      setNewItemText("");
      const updated = loadChecklists().find((c) => c.id === checklist.id);
      if (updated) setChecklist(updated);
    }
  };

  const handleToggle = (itemId: string) => {
    if (checklist) {
      toggleChecklistItem(checklist.id, itemId);
      const updated = loadChecklists().find((c) => c.id === checklist.id);
      if (updated) setChecklist(updated);
    }
  };

  const handleDelete = (itemId: string) => {
    if (checklist) {
      deleteChecklistItem(checklist.id, itemId);
      const updated = loadChecklists().find((c) => c.id === checklist.id);
      if (updated) setChecklist(updated);
      setDeleteId(null);
    }
  };

  const handleEdit = (itemId: string, currentText: string) => {
    setEditingId(itemId);
    setEditText(currentText);
  };

  const handleSaveEdit = () => {
    if (editText.trim() && checklist && editingId) {
      editChecklistItem(checklist.id, editingId, editText.trim());
      const updated = loadChecklists().find((c) => c.id === checklist.id);
      if (updated) setChecklist(updated);
      setEditingId(null);
      setEditText("");
    }
  };

  const handleMarkAllComplete = (categoryId: string) => {
    if (checklist) {
      markAllCategoryItemsComplete(checklist.id, categoryId);
      const updated = loadChecklists().find((c) => c.id === checklist.id);
      if (updated) setChecklist(updated);
    }
  };

  if (!checklist) return null;

  const allItems = checklist.categories
    ? checklist.categories.flatMap((cat) => cat.items)
    : checklist.items;
  const completedCount = allItems.filter((item) => item.completed).length;
  const totalCount = allItems.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/checklists")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold text-foreground">{checklist.title}</h1>
        </div>

        {totalCount > 0 && (
          <div className="mb-6 p-4 rounded-lg bg-card">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Progress</span>
              <span className="text-sm font-semibold text-foreground">
                {completedCount} / {totalCount}
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
        )}

        <div className="mb-6 flex gap-2">
          <Input
            placeholder="Add new item..."
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
            className="flex-1"
          />
          <Button onClick={handleAddItem} size="icon">
            <Plus className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-6">
          {checklist.categories ? (
            checklist.categories.map((category) => (
              <Collapsible
                key={category.id}
                open={openCategories[category.id] || false}
                onOpenChange={(isOpen) =>
                  setOpenCategories((prev) => ({ ...prev, [category.id]: isOpen }))
                }
              >
                <div className="bg-card rounded-lg border border-border p-4">
                  <CollapsibleTrigger className="flex items-center gap-2 flex-1 text-left hover:opacity-80 mb-2">
                    <ChevronDown
                      className={`h-5 w-5 text-muted-foreground transition-transform ${
                        openCategories[category.id] ? "rotate-180" : ""
                      }`}
                    />
                    {category.icon && <span className="text-xl">{category.icon}</span>}
                    <h3 className="text-lg font-semibold text-foreground">{category.title}</h3>
                    <span className="text-sm text-muted-foreground">
                      {category.items.filter((i) => i.completed).length}/{category.items.length}
                    </span>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent className="space-y-2 mt-3">
                    {category.items.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 rounded-lg bg-background border border-border flex items-center gap-3 cursor-pointer"
                        onClick={() => setSelectedItemId(item.id)}
                      >
                        <Checkbox
                          id={`checkbox-${item.id}`}
                          checked={item.completed}
                          onCheckedChange={() => handleToggle(item.id)}
                          className="h-5 w-5 shrink-0 cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                        />
                        {editingId === item.id ? (
                          <Input
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveEdit();
                              if (e.key === "Escape") setEditingId(null);
                            }}
                            onBlur={handleSaveEdit}
                            autoFocus
                            className="flex-1"
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <Label
                            htmlFor={`checkbox-${item.id}`}
                            className={`flex-1 cursor-pointer ${
                              item.completed
                                ? "line-through text-muted-foreground"
                                : "text-foreground"
                            }`}
                          >
                            {item.text}
                          </Label>
                        )}
                        {selectedItemId === item.id && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(item.id, item.text);
                              }}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteId(item.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </>
                        )}
                      </div>
                    ))}
                  </CollapsibleContent>
                </div>
              </Collapsible>
            ))
          ) : (
            checklist.items.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-lg bg-card border border-border flex items-center gap-3 cursor-pointer"
                onClick={() => setSelectedItemId(item.id)}
              >
                <Checkbox
                  id={`checkbox-${item.id}`}
                  checked={item.completed}
                  onCheckedChange={() => handleToggle(item.id)}
                  className="h-5 w-5 shrink-0 cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                />
                {editingId === item.id ? (
                  <Input
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveEdit();
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    onBlur={handleSaveEdit}
                    autoFocus
                    className="flex-1"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <Label
                    htmlFor={`checkbox-${item.id}`}
                    className={`flex-1 cursor-pointer ${
                      item.completed
                        ? "line-through text-muted-foreground"
                        : "text-foreground"
                    }`}
                  >
                    {item.text}
                  </Label>
                )}
                {selectedItemId === item.id && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(item.id, item.text);
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteId(item.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </>
                )}
              </div>
            ))
          )}
        </div>

        {totalCount === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No items yet. Add your first item above!
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete item?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && handleDelete(deleteId)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
