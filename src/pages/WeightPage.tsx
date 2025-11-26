import { useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Trash2, TrendingUp, Scale } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { saveWeightEntry, getWeightEntries, deleteWeightEntry, getWeightUnitPreference, saveWeightUnitPreference, analyzeWeightTrends } from "@/lib/weightStorage";
import { loadFromLocalStorage } from "@/lib/storage";
import { format } from "date-fns";

export default function WeightPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [unit, setUnit] = useState<"kg" | "lbs">(getWeightUnitPreference());
  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");
  const [entries, setEntries] = useState(getWeightEntries());

  const periodData = loadFromLocalStorage<any>("period-data");
  const trends = periodData ? analyzeWeightTrends(new Date(periodData.lastPeriodDate), periodData.cycleLength) : null;

  const handleAddEntry = () => {
    if (!weight || isNaN(Number(weight))) {
      toast({
        title: "Invalid weight",
        description: "Please enter a valid weight",
        variant: "destructive",
      });
      return;
    }

    saveWeightEntry({
      date: new Date(),
      weight: Number(weight),
      unit,
      notes: notes || undefined,
    });

    setEntries(getWeightEntries());
    setWeight("");
    setNotes("");

    toast({
      title: "Weight logged",
      description: "Your weight has been recorded",
    });
  };

  const handleUnitChange = (newUnit: "kg" | "lbs") => {
    setUnit(newUnit);
    saveWeightUnitPreference(newUnit);
  };

  const handleDelete = (id: string) => {
    deleteWeightEntry(id);
    setEntries(getWeightEntries());
    toast({
      title: "Entry deleted",
      description: "Weight entry has been removed",
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <h1 className="text-2xl font-bold mb-6">Weight Tracker</h1>

        {trends && (
          <Card className="p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Cycle Trends</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Overall Average</p>
                <p className="text-xl font-bold">{trends.overallAvg.toFixed(1)} {unit}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Luteal Phase</p>
                <p className="text-xl font-bold">{trends.lutealAvg.toFixed(1)} {unit}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Menstrual Phase</p>
                <p className="text-xl font-bold">{trends.menstrualAvg.toFixed(1)} {unit}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Follicular Phase</p>
                <p className="text-xl font-bold">{trends.follicularAvg.toFixed(1)} {unit}</p>
              </div>
            </div>
          </Card>
        )}

        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Log Weight</h2>
          
          <div className="space-y-4">
            <div>
              <Label>Unit</Label>
              <Select value={unit} onValueChange={handleUnitChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">Kilograms (kg)</SelectItem>
                  <SelectItem value="lbs">Pounds (lbs)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Weight</Label>
              <Input
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder={`Enter weight in ${unit}`}
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

            <Button onClick={handleAddEntry} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Log Weight
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Weight History</h2>
          
          {entries.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No weight entries yet</p>
          ) : (
            <div className="space-y-3">
              {entries.slice(0, 30).map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <Scale className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">{entry.weight} {entry.unit}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(entry.date, "MMM dd, yyyy")}
                        {entry.notes && ` • ${entry.notes}`}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(entry.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
