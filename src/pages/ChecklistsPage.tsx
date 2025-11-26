import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  loadChecklists,
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

  useEffect(() => {
    setChecklists(loadChecklists());
  }, []);

  const refreshChecklists = () => {
    setChecklists(loadChecklists());
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

        <div className="space-y-3">
          {checklists.map((checklist) => {
            const allItems = checklist.categories
              ? checklist.categories.flatMap((cat) => cat.items)
              : checklist.items;
            const completedCount = allItems.filter(
              (item) => item.completed
            ).length;
            const totalCount = allItems.length;

            return (
              <div
                key={checklist.id}
                onClick={() => navigate(`/checklists/${checklist.id}`)}
                className="bg-card rounded-2xl p-4 cursor-pointer hover:shadow-md transition-all duration-200 border border-border/50"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-card-foreground mb-1">
                      {checklist.title}
                    </h3>
                    {totalCount > 0 && (
                      <p className="text-sm text-muted-foreground">
                        {completedCount} / {totalCount} completed
                      </p>
                    )}
                  </div>
                  
                  <div className="flex-shrink-0">
                    {checklist.image && imageMap[checklist.image] ? (
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                        <img
                          src={imageMap[checklist.image]}
                          alt={checklist.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : checklist.icon ? (
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-3xl">{checklist.icon}</span>
                      </div>
                    ) : null}
                  </div>
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
