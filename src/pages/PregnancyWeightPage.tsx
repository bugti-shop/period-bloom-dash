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
import { 
  savePregnancyWeightEntry, 
  getPregnancyWeightEntries, 
  deletePregnancyWeightEntry,
  savePregnancyWeightGoal,
  getPregnancyWeightGoal,
  getRecommendedWeightGain
} from "@/lib/pregnancyWeightStorage";
import { loadPregnancyMode } from "@/lib/pregnancyMode";
import { format } from "date-fns";

export default function PregnancyWeightPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const pregnancyMode = loadPregnancyMode();
  const currentWeek = pregnancyMode.manualWeekOverride || pregnancyMode.currentWeek || 1;
  
  const [unit, setUnit] = useState<"kg" | "lbs">("kg");
  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");
  const [entries, setEntries] = useState(getPregnancyWeightEntries());
  const [goal, setGoal] = useState(getPregnancyWeightGoal());
  const [showGoalForm, setShowGoalForm] = useState(!goal);
  const [preWeight, setPreWeight] = useState("");
  const [bmiCategory, setBmiCategory] = useState<"underweight" | "normal" | "overweight" | "obese">("normal");

  const handleAddEntry = () => {
    if (!weight || isNaN(Number(weight))) {
      toast({
        title: "Invalid weight",
        description: "Please enter a valid weight",
        variant: "destructive",
      });
      return;
    }

    savePregnancyWeightEntry({
      date: new Date(),
      weight: Number(weight),
      unit,
      week: currentWeek,
      notes: notes || undefined,
    });

    setEntries(getPregnancyWeightEntries());
    setWeight("");
    setNotes("");

    toast({
      title: "Weight logged",
      description: "Your weight has been recorded",
    });
  };

  const handleSaveGoal = () => {
    if (!preWeight || isNaN(Number(preWeight))) {
      toast({
        title: "Invalid weight",
        description: "Please enter your pre-pregnancy weight",
        variant: "destructive",
      });
      return;
    }

    const goalData = {
      prePregnancyWeight: Number(preWeight),
      unit,
      bmiCategory,
    };

    savePregnancyWeightGoal(goalData);
    setGoal(goalData);
    setShowGoalForm(false);

    toast({
      title: "Goal saved",
      description: "Your weight tracking goal has been set",
    });
  };

  const handleDelete = (id: string) => {
    deletePregnancyWeightEntry(id);
    setEntries(getPregnancyWeightEntries());
    toast({
      title: "Entry deleted",
      description: "Weight entry has been removed",
    });
  };

  const recommendedRange = goal ? getRecommendedWeightGain(currentWeek, goal.bmiCategory) : null;
  const currentWeight = entries[0]?.weight;
  const weightGain = currentWeight && goal ? currentWeight - goal.prePregnancyWeight : 0;

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

        <h1 className="text-2xl font-bold mb-6">Pregnancy Weight Tracker</h1>

        {showGoalForm && (
          <Card className="p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Set Your Goal</h2>
            
            <div className="space-y-4">
              <div>
                <Label>Pre-Pregnancy Weight</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={preWeight}
                  onChange={(e) => setPreWeight(e.target.value)}
                  placeholder="Enter your weight before pregnancy"
                />
              </div>

              <div>
                <Label>Unit</Label>
                <Select value={unit} onValueChange={(v) => setUnit(v as "kg" | "lbs")}>
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
                <Label>BMI Category</Label>
                <Select value={bmiCategory} onValueChange={(v) => setBmiCategory(v as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="underweight">Underweight</SelectItem>
                    <SelectItem value="normal">Normal weight</SelectItem>
                    <SelectItem value="overweight">Overweight</SelectItem>
                    <SelectItem value="obese">Obese</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleSaveGoal} className="w-full">
                Save Goal
              </Button>
            </div>
          </Card>
        )}

        {goal && recommendedRange && (
          <Card className="p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Week {currentWeek} Progress</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Pre-Pregnancy</p>
                <p className="text-xl font-bold">{goal.prePregnancyWeight} {goal.unit}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Weight</p>
                <p className="text-xl font-bold">{currentWeight ? `${currentWeight} ${unit}` : 'Not logged'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Weight Gain</p>
                <p className="text-xl font-bold">{weightGain > 0 ? `+${weightGain.toFixed(1)}` : weightGain.toFixed(1)} {unit}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Recommended Range</p>
                <p className="text-xl font-bold">{recommendedRange.min}-{recommendedRange.max} {unit}</p>
              </div>
            </div>
          </Card>
        )}

        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Log Weight</h2>
          
          <div className="space-y-4">
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
                      <p className="font-medium">{entry.weight} {entry.unit} • Week {entry.week}</p>
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
