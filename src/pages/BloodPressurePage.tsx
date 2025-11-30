import { useState } from "react";
import { useMobileBackButton } from "@/hooks/useMobileBackButton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Trash2, Activity, AlertCircle, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { 
  saveBloodPressureReading, 
  getBloodPressureReadings, 
  deleteBloodPressureReading,
  analyzeBPPattern,
  getAverageReadings
} from "@/lib/bloodPressureStorage";
import { loadPregnancyMode } from "@/lib/pregnancyMode";
import { format } from "date-fns";

export default function BloodPressurePage() {
  const navigate = useNavigate();
  useMobileBackButton();
  const { toast } = useToast();
  const pregnancyMode = loadPregnancyMode();
  const currentWeek = pregnancyMode.manualWeekOverride || pregnancyMode.currentWeek || 1;
  
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [heartRate, setHeartRate] = useState("");
  const [notes, setNotes] = useState("");
  const [readings, setReadings] = useState(getBloodPressureReadings());

  const handleAddReading = () => {
    if (!systolic || !diastolic || isNaN(Number(systolic)) || isNaN(Number(diastolic))) {
      toast({
        title: "Invalid reading",
        description: "Please enter valid systolic and diastolic values",
        variant: "destructive",
      });
      return;
    }

    const systolicNum = Number(systolic);
    const diastolicNum = Number(diastolic);
    
    saveBloodPressureReading({
      date: new Date(),
      systolic: systolicNum,
      diastolic: diastolicNum,
      heartRate: heartRate ? Number(heartRate) : undefined,
      week: currentWeek,
      notes: notes || undefined,
    });

    const analysis = analyzeBPPattern(systolicNum, diastolicNum);
    
    if (analysis.alert) {
      toast({
        title: analysis.level + " Blood Pressure",
        description: analysis.message,
        variant: "destructive",
      });
    }

    setReadings(getBloodPressureReadings());
    setSystolic("");
    setDiastolic("");
    setHeartRate("");
    setNotes("");

    toast({
      title: "Reading logged",
      description: "Your blood pressure has been recorded",
    });
  };

  const handleDelete = (id: string) => {
    deleteBloodPressureReading(id);
    setReadings(getBloodPressureReadings());
    toast({
      title: "Reading deleted",
      description: "Blood pressure reading has been removed",
    });
  };

  const averages = getAverageReadings(readings.slice(0, 7));
  const latestReading = readings[0];
  const latestAnalysis = latestReading ? analyzeBPPattern(latestReading.systolic, latestReading.diastolic) : null;

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

        <h1 className="text-2xl font-bold mb-6">Blood Pressure Monitor</h1>

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
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Systolic</p>
                <p className="text-xl font-bold">{averages.systolic} mmHg</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Diastolic</p>
                <p className="text-xl font-bold">{averages.diastolic} mmHg</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Heart Rate</p>
                <p className="text-xl font-bold">{averages.heartRate || '--'} bpm</p>
              </div>
            </div>
          </Card>
        )}

        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Log Reading</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Systolic (upper)</Label>
                <Input
                  type="number"
                  value={systolic}
                  onChange={(e) => setSystolic(e.target.value)}
                  placeholder="120"
                />
              </div>
              <div>
                <Label>Diastolic (lower)</Label>
                <Input
                  type="number"
                  value={diastolic}
                  onChange={(e) => setDiastolic(e.target.value)}
                  placeholder="80"
                />
              </div>
            </div>

            <div>
              <Label>Heart Rate (Optional)</Label>
              <Input
                type="number"
                value={heartRate}
                onChange={(e) => setHeartRate(e.target.value)}
                placeholder="70 bpm"
              />
            </div>

            <div>
              <Label>Notes (Optional)</Label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any observations..."
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
                const analysis = analyzeBPPattern(reading.systolic, reading.diastolic);
                return (
                  <div key={reading.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <Activity className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">
                          {reading.systolic}/{reading.diastolic} mmHg
                          {reading.heartRate && ` • ${reading.heartRate} bpm`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(reading.date, "MMM dd, yyyy")} • Week {reading.week}
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
