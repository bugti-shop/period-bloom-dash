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
import { CalendarIcon, Activity, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  loadExerciseEntries,
  saveExerciseEntry,
  deleteExerciseEntry,
  type ExerciseEntry,
} from "@/lib/exerciseStorage";
import { toast } from "sonner";

export const ExercisePage = () => {
  const goBack = useBackNavigation("tools");
  useMobileBackButton();
  const [date, setDate] = useState<Date>(new Date());
  const [type, setType] = useState<string>("");
  const [duration, setDuration] = useState<number>(30);
  const [intensity, setIntensity] = useState<"low" | "moderate" | "high">("moderate");
  const [notes, setNotes] = useState<string>("");
  const [entries, setEntries] = useState<ExerciseEntry[]>(loadExerciseEntries());

  const handleSave = () => {
    if (!type.trim()) {
      toast.error("Please enter exercise type");
      return;
    }
    const dateStr = format(date, "yyyy-MM-dd");
    saveExerciseEntry({ date: dateStr, type, duration, intensity, notes });
    setEntries(loadExerciseEntries());
    toast.success("Exercise logged!");
    setType("");
    setDuration(30);
    setIntensity("moderate");
    setNotes("");
  };

  const handleDelete = (id: string) => {
    deleteExerciseEntry(id);
    setEntries(loadExerciseEntries());
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
        <h1 className="text-xl font-bold mt-2">Exercise & Activity Logger</h1>
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
            <Label>Exercise Type</Label>
            <Input
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="e.g., Running, Yoga, Swimming"
            />
          </div>

          <div className="space-y-2">
            <Label>Duration (minutes)</Label>
            <Input
              type="number"
              min="1"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              placeholder="30"
            />
          </div>

          <div className="space-y-2">
            <Label>Intensity</Label>
            <RadioGroup value={intensity} onValueChange={(v: any) => setIntensity(v)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="low" id="low" />
                <Label htmlFor="low" className="cursor-pointer">Low</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="moderate" id="moderate" />
                <Label htmlFor="moderate" className="cursor-pointer">Moderate</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="high" id="high" />
                <Label htmlFor="high" className="cursor-pointer">High</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did you feel during/after exercise..."
              rows={2}
            />
          </div>

          <Button onClick={handleSave} className="w-full">
            Log Exercise
          </Button>
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
                        {entry.type} - {entry.duration} min ({entry.intensity} intensity)
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
