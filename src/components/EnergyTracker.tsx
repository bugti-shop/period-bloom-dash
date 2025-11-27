import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { saveEnergyLog, getEnergyForDate } from "@/lib/energyStorage";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Sun, Cloud, Moon } from "lucide-react";

interface EnergyTrackerProps {
  selectedDate: Date;
}

export const EnergyTracker = ({ selectedDate }: EnergyTrackerProps) => {
  const [morning, setMorning] = useState(5);
  const [afternoon, setAfternoon] = useState(5);
  const [evening, setEvening] = useState(5);
  const [notes, setNotes] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const log = getEnergyForDate(selectedDate);
    if (log) {
      setMorning(log.morning);
      setAfternoon(log.afternoon);
      setEvening(log.evening);
      setNotes(log.notes);
    } else {
      setMorning(5);
      setAfternoon(5);
      setEvening(5);
      setNotes("");
    }
  }, [selectedDate]);

  const handleSave = () => {
    saveEnergyLog(selectedDate, morning, afternoon, evening, notes);
    toast({
      title: "Energy levels saved",
      description: `Logged for ${format(selectedDate, "MMM dd, yyyy")}`,
    });
  };

  const getEnergyColor = (level: number) => {
    if (level <= 3) return "bg-red-500";
    if (level <= 6) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getEnergyLabel = (level: number) => {
    if (level <= 3) return "Low";
    if (level <= 6) return "Moderate";
    return "High";
  };

  return (
    <Card className="p-6">
      <h3 className="font-semibold text-lg mb-4">Energy Level Tracker</h3>
      
      <div className="space-y-6">
        {/* Morning */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sun className="h-5 w-5 text-yellow-500" />
            <Label className="text-sm font-medium">Morning Energy</Label>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{getEnergyLabel(morning)}</span>
            <span>{morning}/10</span>
          </div>
          <Slider
            value={[morning]}
            onValueChange={(value) => setMorning(value[0])}
            min={1}
            max={10}
            step={1}
          />
          <div className="h-2 rounded-full bg-muted">
            <div
              className={`h-2 rounded-full transition-all ${getEnergyColor(morning)}`}
              style={{ width: `${(morning / 10) * 100}%` }}
            />
          </div>
        </div>

        {/* Afternoon */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Cloud className="h-5 w-5 text-orange-500" />
            <Label className="text-sm font-medium">Afternoon Energy</Label>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{getEnergyLabel(afternoon)}</span>
            <span>{afternoon}/10</span>
          </div>
          <Slider
            value={[afternoon]}
            onValueChange={(value) => setAfternoon(value[0])}
            min={1}
            max={10}
            step={1}
          />
          <div className="h-2 rounded-full bg-muted">
            <div
              className={`h-2 rounded-full transition-all ${getEnergyColor(afternoon)}`}
              style={{ width: `${(afternoon / 10) * 100}%` }}
            />
          </div>
        </div>

        {/* Evening */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Moon className="h-5 w-5 text-blue-500" />
            <Label className="text-sm font-medium">Evening Energy</Label>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{getEnergyLabel(evening)}</span>
            <span>{evening}/10</span>
          </div>
          <Slider
            value={[evening]}
            onValueChange={(value) => setEvening(value[0])}
            min={1}
            max={10}
            step={1}
          />
          <div className="h-2 rounded-full bg-muted">
            <div
              className={`h-2 rounded-full transition-all ${getEnergyColor(evening)}`}
              style={{ width: `${(evening / 10) * 100}%` }}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="energy-notes" className="text-sm mb-2 block">
            Notes (optional)
          </Label>
          <Textarea
            id="energy-notes"
            placeholder="What affected your energy today?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>

        <Button onClick={handleSave} className="w-full">
          Save Energy Levels
        </Button>
      </div>
    </Card>
  );
};
