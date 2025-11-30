import { useState } from "react";
import { useMobileBackButton } from "@/hooks/useMobileBackButton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Trash2, Droplet, AlertCircle, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { 
  saveGlucoseReading, 
  getGlucoseReadings, 
  deleteGlucoseReading,
  analyzeGlucoseLevel,
  getAverageGlucose
} from "@/lib/glucoseStorage";
import { loadPregnancyMode } from "@/lib/pregnancyMode";
import { format } from "date-fns";

export default function GlucosePage() {
  const navigate = useNavigate();
  useMobileBackButton();
  const { toast } = useToast();
  const pregnancyMode = loadPregnancyMode();
  const currentWeek = pregnancyMode.manualWeekOverride || pregnancyMode.currentWeek || 1;
  
  const [glucose, setGlucose] = useState("");
  const [unit, setUnit] = useState<"mg/dL" | "mmol/L">("mg/dL");
  const [mealType, setMealType] = useState<"fasting" | "before-meal" | "after-meal" | "bedtime">("fasting");
  const [notes, setNotes] = useState("");
  const [readings, setReadings] = useState(getGlucoseReadings());

  const handleAddReading = () => {
    if (!glucose || isNaN(Number(glucose))) {
      toast({
        title: "Invalid reading",
        description: "Please enter a valid glucose value",
        variant: "destructive",
      });
      return;
    }

    const glucoseNum = Number(glucose);
    const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    
    saveGlucoseReading({
      date: new Date(),
      time: currentTime,
      glucose: glucoseNum,
      unit,
      mealType,
      week: currentWeek,
      notes: notes || undefined,
    });

    const analysis = analyzeGlucoseLevel(glucoseNum, mealType, unit);
    
    if (analysis.alert) {
      toast({
        title: analysis.level + " Glucose Level",
        description: analysis.message,
        variant: "destructive",
      });
    }

    setReadings(getGlucoseReadings());
    setGlucose("");
    setNotes("");

    toast({
      title: "Reading logged",
      description: "Your glucose level has been recorded",
    });
  };

  const handleDelete = (id: string) => {
    deleteGlucoseReading(id);
    setReadings(getGlucoseReadings());
    toast({
      title: "Reading deleted",
      description: "Glucose reading has been removed",
    });
  };

  const averageGlucose = getAverageGlucose(readings.slice(0, 7));
  const latestReading = readings[0];
  const latestAnalysis = latestReading ? analyzeGlucoseLevel(latestReading.glucose, latestReading.mealType, latestReading.unit) : null;

  return (
    <div className="min-h-screen bg-background pb-20">
      
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <h1 className="text-2xl font-bold mb-6">Glucose Level Tracker</h1>

        {latestAnalysis && latestAnalysis.alert && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{latestAnalysis.message}</AlertDescription>
          </Alert>
        )}

        {readings.length > 0 && (
          <Card className="p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">7-Day Average</h2>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Average Glucose</p>
              <p className="text-3xl font-bold">{averageGlucose} mg/dL</p>
            </div>
          </Card>
        )}

        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Log Reading</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Glucose Level</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={glucose}
                  onChange={(e) => setGlucose(e.target.value)}
                  placeholder="95"
                />
              </div>
              <div>
                <Label>Unit</Label>
                <Select value={unit} onValueChange={(v) => setUnit(v as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mg/dL">mg/dL</SelectItem>
                    <SelectItem value="mmol/L">mmol/L</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Meal Type</Label>
              <Select value={mealType} onValueChange={(v) => setMealType(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fasting">Fasting</SelectItem>
                  <SelectItem value="before-meal">Before Meal</SelectItem>
                  <SelectItem value="after-meal">After Meal (1-2 hrs)</SelectItem>
                  <SelectItem value="bedtime">Bedtime</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Notes (Optional)</Label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What you ate, activity, etc."
              />
            </div>

            <Button onClick={handleAddReading} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Log Reading
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Reading History</h2>
          
          {readings.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No readings yet</p>
          ) : (
            <div className="space-y-3">
              {readings.slice(0, 30).map((reading) => {
                const analysis = analyzeGlucoseLevel(reading.glucose, reading.mealType, reading.unit);
                return (
                  <div key={reading.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <Droplet className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">
                          {reading.glucose} {reading.unit}
                          <span className="text-muted-foreground text-sm ml-2">
                            ({reading.mealType.replace('-', ' ')})
                          </span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(reading.date, "MMM dd, yyyy")} at {reading.time} • Week {reading.week}
                          <span className={`ml-2 ${analysis.alert ? 'text-destructive font-medium' : 'text-primary'}`}>
                            • {analysis.level}
                          </span>
                        </p>
                        {reading.notes && (
                          <p className="text-sm text-muted-foreground mt-1">{reading.notes}</p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(reading.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
