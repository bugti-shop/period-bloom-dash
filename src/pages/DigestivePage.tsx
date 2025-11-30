import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMobileBackButton } from "@/hooks/useMobileBackButton";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { DigestiveTracker } from "@/components/DigestiveTracker";
import { Card } from "@/components/ui/card";
import { getAllDigestiveLogs, getMostCommonSymptom } from "@/lib/digestiveStorage";
import { format, parseISO } from "date-fns";

const DigestivePage = () => {
  const navigate = useNavigate();
  useMobileBackButton();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const allLogs = getAllDigestiveLogs();
  const mostCommonSymptom = getMostCommonSymptom();

  const digestiveDates = allLogs.map(log => parseISO(log.date));

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
        <h1 className="text-xl font-bold mt-2">Digestive Health Tracker</h1>
      </div>

      <div className="p-4 space-y-4">
        <Card className="p-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="rounded-md border-0"
            modifiers={{
              hasData: digestiveDates,
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
            <p className="text-sm text-muted-foreground">Most Common Symptom</p>
            <p className="text-xl font-bold text-primary">
              {mostCommonSymptom || "No data yet"}
            </p>
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

        <DigestiveTracker selectedDate={selectedDate} />
      </div>
    </div>
  );
};

export default DigestivePage;
