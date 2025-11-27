import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { saveStressLog, getStressForDate } from "@/lib/stressStorage";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface StressTrackerProps {
  selectedDate: Date;
}

const stressTriggers = [
  "Work",
  "Relationships",
  "Health concerns",
  "Financial worries",
  "Family issues",
  "Sleep deprivation",
  "Hormones",
  "Social situations",
];

export const StressTracker = ({ selectedDate }: StressTrackerProps) => {
  const [stressLevel, setStressLevel] = useState<number>(5);
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const log = getStressForDate(selectedDate);
    if (log) {
      setStressLevel(log.level);
      setSelectedTriggers(log.triggers);
      setNotes(log.notes);
    } else {
      setStressLevel(5);
      setSelectedTriggers([]);
      setNotes("");
    }
  }, [selectedDate]);

  const handleTriggerToggle = (trigger: string) => {
    setSelectedTriggers(prev =>
      prev.includes(trigger)
        ? prev.filter(t => t !== trigger)
        : [...prev, trigger]
    );
  };

  const handleSave = () => {
    saveStressLog(selectedDate, stressLevel, selectedTriggers, notes);
    toast({
      title: "Stress level saved",
      description: `Logged for ${format(selectedDate, "MMM dd, yyyy")}`,
    });
  };

  const getStressColor = (level: number) => {
    if (level <= 3) return "bg-green-500";
    if (level <= 6) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getStressLabel = (level: number) => {
    if (level <= 3) return "Low";
    if (level <= 6) return "Moderate";
    return "High";
  };

  return (
    <Card className="p-6">
      <h3 className="font-semibold text-lg mb-4">Stress Level Tracker</h3>
      
      <div className="space-y-6">
        <div>
          <Label className="text-sm mb-2 block">
            Stress Level: {stressLevel}/10 - {getStressLabel(stressLevel)}
          </Label>
          <input
            type="range"
            min="1"
            max="10"
            value={stressLevel}
            onChange={(e) => setStressLevel(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Low (1)</span>
            <span>High (10)</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-muted">
            <div
              className={`h-2 rounded-full transition-all ${getStressColor(stressLevel)}`}
              style={{ width: `${(stressLevel / 10) * 100}%` }}
            />
          </div>
        </div>

        <div>
          <Label className="text-sm mb-3 block">Stress Triggers (select all that apply)</Label>
          <div className="grid grid-cols-2 gap-3">
            {stressTriggers.map((trigger) => (
              <div key={trigger} className="flex items-center space-x-2">
                <Checkbox
                  id={trigger}
                  checked={selectedTriggers.includes(trigger)}
                  onCheckedChange={() => handleTriggerToggle(trigger)}
                />
                <Label
                  htmlFor={trigger}
                  className="text-sm font-normal cursor-pointer"
                >
                  {trigger}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="stress-notes" className="text-sm mb-2 block">
            Notes (optional)
          </Label>
          <Textarea
            id="stress-notes"
            placeholder="What contributed to your stress level today?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>

        <Button onClick={handleSave} className="w-full">
          Save Stress Log
        </Button>
      </div>
    </Card>
  );
};
