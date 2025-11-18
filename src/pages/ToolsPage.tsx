import { BabyKickCounter } from "@/components/BabyKickCounter";
import { ContractionTimer } from "@/components/ContractionTimer";
import { loadPregnancyMode } from "@/lib/pregnancyMode";

export const ToolsPage = () => {
  const pregnancyMode = loadPregnancyMode();
  
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <header className="text-center mb-6">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            {pregnancyMode.isPregnancyMode ? "Pregnancy Tools" : "Period Tracker Tools"}
          </h2>
          <p className="text-muted-foreground">
            {pregnancyMode.isPregnancyMode 
              ? "Track your pregnancy journey" 
              : "Manage your health and cycle"}
          </p>
        </header>

        <div className="space-y-6">
          {pregnancyMode.isPregnancyMode && (
            <>
              <ContractionTimer />
              <BabyKickCounter />
            </>
          )}
        </div>
      </div>
    </div>
  );
};