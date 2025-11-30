import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMobileBackButton } from "@/hooks/useMobileBackButton";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { EnergyTracker } from "@/components/EnergyTracker";
import { Card } from "@/components/ui/card";
import { getAllEnergyLogs, getAverageEnergyByTime } from "@/lib/energyStorage";
import { format, parseISO } from "date-fns";

const EnergyPage = () => {
  const navigate = useNavigate();
  useMobileBackButton();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const allLogs = getAllEnergyLogs();
  const averages = getAverageEnergyByTime(7);

  const energyDates = allLogs.map(log => parseISO(log.date));

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-primary text-primary-foreground p-4 sticky top-0 z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="text-primary-foreground hover:bg-primary-foreground/20"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold mt-2">Energy Level Tracker</h1>
      </div>

      <div className="p-4 space-y-4">
        <Card className="p-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="rounded-md border-0"
            modifiers={{
              hasData: energyDates,
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
          <p className="text-sm text-muted-foreground text-center mb-3">7-Day Average Energy</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Morning</p>
              <p className="text-2xl font-bold text-primary">{averages.morning}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Afternoon</p>
              <p className="text-2xl font-bold text-primary">{averages.afternoon}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Evening</p>
              <p className="text-2xl font-bold text-primary">{averages.evening}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3 text-center">
            {allLogs.length} total entries
          </p>
        </Card>

        <div className="bg-card rounded-lg p-4 border">
          <p className="text-sm font-medium mb-2">
            Selected: {format(selectedDate, "MMMM dd, yyyy")}
          </p>
        </div>

        <EnergyTracker selectedDate={selectedDate} />
      </div>
    </div>
  );
};

export default EnergyPage;
