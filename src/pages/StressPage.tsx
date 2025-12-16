import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useMobileBackButton } from "@/hooks/useMobileBackButton";
import { useBackNavigation } from "@/hooks/useBackNavigation";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { StressTracker } from "@/components/StressTracker";
import { Card } from "@/components/ui/card";
import { getAllStressLogs, getAverageStressLevel } from "@/lib/stressStorage";
import { format, parseISO } from "date-fns";

const StressPage = () => {
  const goBack = useBackNavigation();
  useMobileBackButton();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const allLogs = getAllStressLogs();
  const avgStress = getAverageStressLevel(7);

  const stressDates = allLogs.map(log => parseISO(log.date));

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-primary text-primary-foreground p-4 sticky top-0 z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={goBack}
          className="text-primary-foreground hover:bg-primary-foreground/20"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold mt-2">Stress Level Tracker</h1>
      </div>

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
