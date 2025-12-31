import { useState } from "react";
import { Brain } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { StressTracker } from "@/components/StressTracker";
import { Card } from "@/components/ui/card";
import { ToolHeader } from "@/components/ToolHeader";
import { getAllStressLogs, getAverageStressLevel } from "@/lib/stressStorage";
import { format, parseISO } from "date-fns";

const StressPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const allLogs = getAllStressLogs();
  const avgStress = getAverageStressLevel(7);

  const stressDates = allLogs.map(log => parseISO(log.date));

  return (
    <div className="min-h-screen bg-background pb-20">
      <ToolHeader 
        title="Stress Level Tracker" 
        subtitle="Monitor your stress patterns"
        icon={Brain}
      />

      <div className="p-4 space-y-4">
        <Card className="p-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="rounded-md border-0"
            modifiers={{
              hasData: stressDates,
            }}
            modifiersStyles={{
              hasData: {
                fontWeight: "bold",
                textDecoration: "underline",
              },
            }}
          />
        </Card>

        <Card className="p-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">7-Day Average Stress</p>
            <p className="text-3xl font-bold text-primary">{avgStress}/10</p>
            <p className="text-xs text-muted-foreground mt-1">
              {allLogs.length} total entries
            </p>
          </div>
        </Card>

        <div className="bg-card rounded-lg p-4 border">
          <p className="text-sm font-medium mb-2">
            Selected: {format(selectedDate, "MMMM dd, yyyy")}
          </p>
        </div>

        <StressTracker selectedDate={selectedDate} />
      </div>
    </div>
  );
};

export default StressPage;
