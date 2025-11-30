import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { HealthTracker } from "@/components/HealthTracker";
import { useMobileBackButton } from "@/hooks/useMobileBackButton";

export const HealthPage = () => {
  const navigate = useNavigate();
  useMobileBackButton();
  const [selectedDate] = useState<Date>(new Date());

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <header className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-3xl font-bold text-foreground">Health Tracker</h2>
            <p className="text-muted-foreground">Monitor your health metrics</p>
          </div>
        </header>

        <HealthTracker selectedDate={selectedDate} />
      </div>
    </div>
  );
};
