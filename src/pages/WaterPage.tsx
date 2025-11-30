import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { useMobileBackButton } from "@/hooks/useMobileBackButton";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, differenceInDays, addDays } from "date-fns";
import { CalendarIcon, Droplets, Trash2, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  loadWaterEntries,
  saveWaterEntry,
  deleteWaterEntry,
  getWaterEntryByDate,
  type WaterEntry,
} from "@/lib/waterStorage";
import { loadFromLocalStorage } from "@/lib/storage";
import { getGoalForCyclePhase } from "@/lib/waterReminderStorage";
import { WaterReminderSettingsCard } from "@/components/WaterReminderSettings";
import { toast } from "sonner";

interface PeriodData {
  lastPeriodDate: Date;
  cycleLength: number;
  periodDuration: number;
}

export const WaterPage = () => {
  const navigate = useNavigate();
  useMobileBackButton();
  const [date, setDate] = useState<Date>(new Date());
  const [glasses, setGlasses] = useState<number>(0);
  const [goal, setGoal] = useState<number>(8);
  const [notes, setNotes] = useState<string>("");
  const [entries, setEntries] = useState<WaterEntry[]>(loadWaterEntries());
  const [showSettings, setShowSettings] = useState(false);
  const [periodData, setPeriodData] = useState<PeriodData | null>(null);
  const [currentPhase, setCurrentPhase] = useState<string>("follicular");

  const selectedDateEntry = getWaterEntryByDate(format(date, "yyyy-MM-dd"));

  useEffect(() => {
    const savedData = loadFromLocalStorage<PeriodData>("current-period-data");
    if (savedData) {
      setPeriodData({
        ...savedData,
        lastPeriodDate: new Date(savedData.lastPeriodDate),
      });
    }
  }, []);

  useEffect(() => {
    if (periodData) {
      const phase = calculateCyclePhase(new Date(), periodData);
      setCurrentPhase(phase);
      const adjustedGoal = getGoalForCyclePhase(phase);
      setGoal(adjustedGoal);
    }
  }, [periodData, date]);

  const calculateCyclePhase = (currentDate: Date, data: PeriodData): string => {
    const daysSinceLastPeriod = differenceInDays(currentDate, data.lastPeriodDate);
    const cycleDay = ((daysSinceLastPeriod % data.cycleLength) + data.cycleLength) % data.cycleLength;

    if (cycleDay < data.periodDuration) {
      return "menstruation";
    } else if (cycleDay < 14) {
      return "follicular";
    } else if (cycleDay >= 14 && cycleDay < 16) {
      return "ovulation";
    } else {
      return "luteal";
    }
  };

  const handleSave = () => {
    const dateStr = format(date, "yyyy-MM-dd");
    saveWaterEntry({ date: dateStr, glasses, goal, notes });
    setEntries(loadWaterEntries());
    toast.success("Water intake logged!");
    setGlasses(0);
    setNotes("");
  };

  const handleDelete = (id: string) => {
    deleteWaterEntry(id);
    setEntries(loadWaterEntries());
    toast.success("Entry deleted");
  };

  const handleQuickAdd = () => {
    setGlasses((prev) => prev + 1);
  };

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
        <h1 className="text-xl font-bold mt-2">Water Intake Tracker</h1>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-end">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>

        {showSettings && <WaterReminderSettingsCard />}

        {periodData && (
          <Card className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900">Current Phase: {currentPhase}</p>
                <p className="text-xs text-blue-700 mt-1">
                  Recommended: {goal} glasses/day
                </p>
              </div>
              <Droplets className="h-8 w-8 text-blue-500" />
            </div>
          </Card>
        )}

        <Card className="p-6 space-y-4">
          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Glasses Consumed</Label>
              <Input
                type="number"
                min="0"
                value={glasses}
                onChange={(e) => setGlasses(Number(e.target.value))}
                placeholder="0"
              />
              <Button variant="outline" size="sm" onClick={handleQuickAdd} className="w-full">
                + Quick Add Glass
              </Button>
            </div>
            <div className="space-y-2">
              <Label>Daily Goal (glasses)</Label>
              <Input
                type="number"
                min="1"
                value={goal}
                onChange={(e) => setGoal(Number(e.target.value))}
                placeholder="8"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any observations..."
              rows={2}
            />
          </div>

          <Button onClick={handleSave} className="w-full">
            Log Water Intake
          </Button>

          {selectedDateEntry && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Entry for {format(date, "PPP")}</p>
              <p className="text-lg font-semibold">
                {selectedDateEntry.glasses} / {selectedDateEntry.goal} glasses
              </p>
              {selectedDateEntry.notes && (
                <p className="text-sm text-muted-foreground mt-2">{selectedDateEntry.notes}</p>
              )}
            </div>
          )}
        </Card>

        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">Recent Entries</h2>
          {entries.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No entries yet. Start logging!</p>
          ) : (
            entries
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 10)
              .map((entry) => (
                <Card key={entry.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-foreground">{format(new Date(entry.date), "PPP")}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {entry.glasses} / {entry.goal} glasses
                      </p>
                      {entry.notes && <p className="text-sm text-muted-foreground mt-1">{entry.notes}</p>}
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(entry.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </Card>
              ))
          )}
        </div>
      </div>
    </div>
  );
};
