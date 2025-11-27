import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  saveDigestiveLog,
  getDigestiveForDate,
  digestiveSymptoms,
} from "@/lib/digestiveStorage";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface DigestiveTrackerProps {
  selectedDate: Date;
}

export const DigestiveTracker = ({ selectedDate }: DigestiveTrackerProps) => {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [severity, setSeverity] = useState<{ [symptom: string]: number }>({});
  const [notes, setNotes] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const log = getDigestiveForDate(selectedDate);
    if (log) {
      setSelectedSymptoms(log.symptoms);
      setSeverity(log.severity);
      setNotes(log.notes);
    } else {
      setSelectedSymptoms([]);
      setSeverity({});
      setNotes("");
    }
  }, [selectedDate]);

  const handleSymptomToggle = (symptom: string) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(prev => prev.filter(s => s !== symptom));
      const newSeverity = { ...severity };
      delete newSeverity[symptom];
      setSeverity(newSeverity);
    } else {
      setSelectedSymptoms(prev => [...prev, symptom]);
      setSeverity(prev => ({ ...prev, [symptom]: 3 }));
    }
  };

  const handleSeverityChange = (symptom: string, value: number[]) => {
    setSeverity(prev => ({ ...prev, [symptom]: value[0] }));
  };

  const handleSave = () => {
    saveDigestiveLog(selectedDate, selectedSymptoms, severity, notes);
    toast({
      title: "Digestive health saved",
      description: `Logged for ${format(selectedDate, "MMM dd, yyyy")}`,
    });
  };

  const getSeverityColor = (level: number) => {
    if (level <= 2) return "bg-green-500";
    if (level <= 3) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getSeverityLabel = (level: number) => {
    if (level === 1) return "Very Mild";
    if (level === 2) return "Mild";
    if (level === 3) return "Moderate";
    if (level === 4) return "Severe";
    return "Very Severe";
  };

  return (
    <Card className="p-6">
      <h3 className="font-semibold text-lg mb-4">Digestive Health Tracker</h3>
      
      <div className="space-y-6">
        <div>
          <Label className="text-sm mb-3 block">Symptoms (select all that apply)</Label>
          <div className="space-y-4">
            {digestiveSymptoms.map((symptom) => (
              <div key={symptom} className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={symptom}
                    checked={selectedSymptoms.includes(symptom)}
                    onCheckedChange={() => handleSymptomToggle(symptom)}
                  />
                  <Label
                    htmlFor={symptom}
                    className="text-sm font-normal cursor-pointer flex-1"
                  >
                    {symptom}
                  </Label>
                </div>
                
                {selectedSymptoms.includes(symptom) && (
                  <div className="ml-6 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        Severity: {getSeverityLabel(severity[symptom] || 3)}
                      </span>
                      <span className="font-medium">{severity[symptom] || 3}/5</span>
                    </div>
                    <Slider
                      value={[severity[symptom] || 3]}
                      onValueChange={(value) => handleSeverityChange(symptom, value)}
                      min={1}
                      max={5}
                      step={1}
                      className="w-full"
                    />
                    <div className="h-1 rounded-full bg-muted">
                      <div
                        className={`h-1 rounded-full transition-all ${getSeverityColor(
                          severity[symptom] || 3
                        )}`}
                        style={{ width: `${((severity[symptom] || 3) / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="digestive-notes" className="text-sm mb-2 block">
            Notes (optional)
          </Label>
          <Textarea
            id="digestive-notes"
            placeholder="Any triggers, foods eaten, or additional details..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>

        <Button onClick={handleSave} className="w-full">
          Save Digestive Log
        </Button>
      </div>
    </Card>
  );
};
