import { useState } from "react";
import { useMobileBackButton } from "@/hooks/useMobileBackButton";
import { useBackNavigation } from "@/hooks/useBackNavigation";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { format } from "date-fns";
import { CalendarIcon, Moon, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  loadSleepEntries,
  saveSleepEntry,
  deleteSleepEntry,
  getSleepEntryByDate,
  type SleepEntry,
} from "@/lib/sleepStorage";
import { toast } from "sonner";

export const SleepPage = () => {
  const goBack = useBackNavigation();
  useMobileBackButton();
  const [date, setDate] = useState<Date>(new Date());
  const [hours, setHours] = useState<number>(7);
  const [quality, setQuality] = useState<"poor" | "fair" | "good" | "excellent">("good");
  const [notes, setNotes] = useState<string>("");
  const [entries, setEntries] = useState<SleepEntry[]>(loadSleepEntries());

  const selectedDateEntry = getSleepEntryByDate(format(date, "yyyy-MM-dd"));

  const handleSave = () => {
    const dateStr = format(date, "yyyy-MM-dd");
    saveSleepEntry({ date: dateStr, hours, quality, notes });
    setEntries(loadSleepEntries());
    toast.success("Sleep logged!");
    setHours(7);
    setQuality("good");
    setNotes("");
  };

  const handleDelete = (id: string) => {
    deleteSleepEntry(id);
    setEntries(loadSleepEntries());
    toast.success("Entry deleted");
  };

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
        <h1 className="text-xl font-bold mt-2">Sleep Quality Tracker</h1>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">

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

          <div className="space-y-2">
            <Label>Hours of Sleep</Label>
            <Input
              type="number"
              min="0"
              max="24"
              step="0.5"
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
              placeholder="7"
            />
          </div>

          <div className="space-y-2">
            <Label>Sleep Quality</Label>
            <RadioGroup value={quality} onValueChange={(v: any) => setQuality(v)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="poor" id="poor" />
                <Label htmlFor="poor" className="cursor-pointer">Poor</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fair" id="fair" />
                <Label htmlFor="fair" className="cursor-pointer">Fair</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="good" id="good" />
                <Label htmlFor="good" className="cursor-pointer">Good</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="excellent" id="excellent" />
                <Label htmlFor="excellent" className="cursor-pointer">Excellent</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any observations about your sleep..."
              rows={2}
            />
          </div>

          <Button onClick={handleSave} className="w-full">
            Log Sleep
          </Button>

          {selectedDateEntry && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Entry for {format(date, "PPP")}</p>
              <p className="text-lg font-semibold">
                {selectedDateEntry.hours} hours - {selectedDateEntry.quality}
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
                        {entry.hours} hours - Quality: {entry.quality}
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
