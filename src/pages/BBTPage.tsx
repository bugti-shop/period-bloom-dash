import { BBTTracker } from "@/components/BBTTracker";
import { ToolHeader } from "@/components/ToolHeader";
import { Thermometer } from "lucide-react";

export const BBTPage = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      <ToolHeader 
        title="BBT Tracker" 
        subtitle="Monitor your basal body temperature"
        icon={Thermometer}
      />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <BBTTracker />
      </div>
    </div>
  );
};
