import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Settings2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  loadChecklists,
  reorderChecklists,
  type Checklist,
} from "@/lib/checklistStorage";
import { ChecklistCustomization } from "@/components/ChecklistCustomization";
import todoImg from "@/assets/checklist-todo.png";
import shoppingImg from "@/assets/checklist-shopping.png";
import hospitalBagImg from "@/assets/checklist-hospital-bag.png";
import birthPlanImg from "@/assets/checklist-birth-plan.png";
import notesImg from "@/assets/checklist-notes.png";
import namesImg from "@/assets/checklist-names.png";

const imageMap: Record<string, string> = {
  "/src/assets/checklist-todo.png": todoImg,
  "/src/assets/checklist-shopping.png": shoppingImg,
  "/src/assets/checklist-hospital-bag.png": hospitalBagImg,
  "/src/assets/checklist-birth-plan.png": birthPlanImg,
  "/src/assets/checklist-notes.png": notesImg,
  "/src/assets/checklist-names.png": namesImg,
};

export const ChecklistsPage = () => {
  const navigate = useNavigate();
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [showCustomization, setShowCustomization] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  useEffect(() => {
    setChecklists(loadChecklists());
  }, []);

  const refreshChecklists = () => {
    setChecklists(loadChecklists());
  };

  const handleDragStart = (id: string) => {
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    const newOrder = [...checklists];
    const draggedIndex = newOrder.findIndex((c) => c.id === draggedId);
    const targetIndex = newOrder.findIndex((c) => c.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const [removed] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, removed);

    setChecklists(newOrder);
  };

  const handleDragEnd = () => {
    if (draggedId) {
      reorderChecklists(checklists);
      setDraggedId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <header className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-foreground">Lists</h2>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowCustomization(true)}
          >
            <Settings2 className="h-5 w-5" />
          </Button>
        </header>

        <div className="grid grid-cols-2 gap-4">
          {checklists.map((checklist) => {
            const allItems = checklist.categories
              ? checklist.categories.flatMap((cat) => cat.items)
              : checklist.items;
            const completedCount = allItems.filter(
              (item) => item.completed
            ).length;
            const totalCount = allItems.length;
            const progressPercent =
              totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

            return (
              <div
                key={checklist.id}
                draggable
                onDragStart={() => handleDragStart(checklist.id)}
                onDragOver={(e) => handleDragOver(e, checklist.id)}
                onDragEnd={handleDragEnd}
                onClick={() => navigate(`/checklists/${checklist.id}`)}
                style={{ backgroundColor: checklist.bgColor }}
                className={`rounded-3xl p-4 cursor-pointer hover:scale-105 transition-transform duration-200 shadow-lg flex flex-col min-h-[180px] relative ${
                  checklist.id === "hospital-bag" || checklist.id === "names"
                    ? "col-span-2"
                    : ""
                }`}
              >
                <div className="absolute top-2 right-2 opacity-50">
                  <GripVertical className="h-5 w-5 text-foreground" />
                </div>
                
                <div className="flex items-start gap-2 mb-2">
                  {checklist.icon && (
                    <span className="text-2xl">{checklist.icon}</span>
                  )}
                  <h3 className="text-lg font-bold text-foreground flex-1">
                    {checklist.title}
                  </h3>
                </div>

                {totalCount > 0 && (
                  <div className="mb-2">
                    <Progress value={progressPercent} className="h-1.5 mb-1" />
                    <p className="text-xs text-foreground/70">
                      {completedCount} / {totalCount} completed
                    </p>
                  </div>
                )}

                <div className="flex-1 flex items-center justify-center">
                  {checklist.image && imageMap[checklist.image] ? (
                    <img
                      src={imageMap[checklist.image]}
                      alt={checklist.title}
                      className="w-full h-auto max-h-[120px] object-contain"
                    />
                  ) : checklist.icon ? (
                    <span className="text-6xl">{checklist.icon}</span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <ChecklistCustomization
        open={showCustomization}
        onClose={() => {
          setShowCustomization(false);
          refreshChecklists();
        }}
      />
    </div>
  );
};
