import { IntimacyTracker } from "@/components/IntimacyTracker";
import { ToolHeader } from "@/components/ToolHeader";
import { HeartPulse } from "lucide-react";

export const IntimacyPage = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      <ToolHeader 
        title="Intimacy Tracker" 
        subtitle="Track your intimate moments"
        icon={HeartPulse}
      />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <IntimacyTracker />
      </div>
    </div>
  );
};
