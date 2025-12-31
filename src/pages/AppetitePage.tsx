import { AppetiteTracker } from "@/components/AppetiteTracker";
import { ToolHeader } from "@/components/ToolHeader";
import { UtensilsCrossed } from "lucide-react";

export const AppetitePage = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      <ToolHeader 
        title="Appetite Tracker" 
        subtitle="Log your appetite and cravings"
        icon={UtensilsCrossed}
      />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <AppetiteTracker />
      </div>
    </div>
  );
};
