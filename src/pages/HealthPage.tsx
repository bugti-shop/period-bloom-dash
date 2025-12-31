import { useState } from "react";
import { HealthTracker } from "@/components/HealthTracker";
import { ToolHeader } from "@/components/ToolHeader";
import { Heart } from "lucide-react";

export const HealthPage = () => {
  const [selectedDate] = useState<Date>(new Date());

  return (
    <div className="min-h-screen bg-background pb-20">
      <ToolHeader 
        title="Health Tracker" 
        subtitle="Monitor your health metrics"
        icon={Heart}
      />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <HealthTracker selectedDate={selectedDate} />
      </div>
    </div>
  );
};
