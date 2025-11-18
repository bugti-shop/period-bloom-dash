import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Scale, Target, Ruler, Droplet, Moon, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { saveToLocalStorage, loadFromLocalStorage } from "@/lib/storage";
import { format } from "date-fns";
import { z } from "zod";

const healthDataSchema = z.object({
  weight: z.string().refine((val) => val === "" || (parseFloat(val) >= 20 && parseFloat(val) <= 300), {
    message: "Weight must be between 20 and 300 kg"
  }),
  height: z.string().refine((val) => val === "" || (parseFloat(val) >= 50 && parseFloat(val) <= 250), {
    message: "Height must be between 50 and 250 cm"
  }),
  weightGoal: z.string().refine((val) => val === "" || (parseFloat(val) >= 20 && parseFloat(val) <= 300), {
    message: "Weight goal must be between 20 and 300 kg"
  }),
  waterGlasses: z.number().min(0).max(20, "Maximum 20 glasses per day"),
  sleepHours: z.string().refine((val) => val === "" || (parseFloat(val) >= 0 && parseFloat(val) <= 24), {
    message: "Sleep hours must be between 0 and 24"
  }),
  sleepQuality: z.number().min(1).max(5, "Quality must be between 1 and 5")
});

interface HealthData {
  weight: string;
  height: string;
  weightGoal: string;
  waterGlasses: number;
  sleepHours: string;
  sleepQuality: number;
}

interface DateHealthData {
  [dateKey: string]: HealthData;
}

interface HealthTrackerProps {
  selectedDate: Date;
}

export const HealthTracker = ({ selectedDate }: HealthTrackerProps) => {
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [weightGoal, setWeightGoal] = useState("");
  const [waterGlasses, setWaterGlasses] = useState(0);
  const [sleepHours, setSleepHours] = useState("");
  const [sleepQuality, setSleepQuality] = useState(3);
  const { toast } = useToast();

  const dateKey = format(selectedDate, "yyyy-MM-dd");

  useEffect(() => {
    const allData = loadFromLocalStorage<DateHealthData>("health-tracker") || {};
    const data = allData[dateKey];
    
    if (data) {
      setWeight(data.weight || "");
      setHeight(data.height || "");
      setWeightGoal(data.weightGoal || "");
      setWaterGlasses(data.waterGlasses || 0);
      setSleepHours(data.sleepHours || "");
      setSleepQuality(data.sleepQuality || 3);
    } else {
      setWeight("");
      setHeight("");
      setWeightGoal("");
      setWaterGlasses(0);
      setSleepHours("");
      setSleepQuality(3);
    }
  }, [selectedDate, dateKey]);

  const saveHealthData = () => {
    const result = healthDataSchema.safeParse({
      weight,
      height,
      weightGoal,
      waterGlasses,
      sleepHours,
      sleepQuality
    });

    if (!result.success) {
      toast({
        title: "Validation Error",
        description: result.error.errors[0].message,
        variant: "destructive"
      });
      return;
    }

    const allData = loadFromLocalStorage<DateHealthData>("health-tracker") || {};
    allData[dateKey] = {
      weight,
      height,
      weightGoal,
      waterGlasses,
      sleepHours,
      sleepQuality
    };
    saveToLocalStorage("health-tracker", allData);
    toast({
      title: "Health data saved",
      description: `Saved for ${format(selectedDate, "MMM dd, yyyy")}`,
    });
  };

  const incrementWater = () => {
    setWaterGlasses(prev => Math.min(prev + 1, 20));
  };

  const decrementWater = () => {
    setWaterGlasses(prev => Math.max(0, prev - 1));
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Health Tracker</h3>
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="weight" className="text-xs flex items-center gap-1">
            <Scale className="w-3 h-3" />
            Weight (kg)
          </Label>
          <Input
            id="weight"
            type="number"
            min="20"
            max="300"
            step="0.1"
            placeholder="65.5"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="height" className="text-xs flex items-center gap-1">
            <Ruler className="w-3 h-3" />
            Height (cm)
          </Label>
          <Input
            id="height"
            type="number"
            min="50"
            max="250"
            placeholder="165"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="weight-goal" className="text-xs flex items-center gap-1">
          <Target className="w-3 h-3" />
          Weight Goal (kg)
        </Label>
        <Input
          id="weight-goal"
          type="number"
          min="20"
          max="300"
          step="0.1"
          placeholder="60.0"
          value={weightGoal}
          onChange={(e) => setWeightGoal(e.target.value)}
          className="mt-1"
        />
      </div>

      <div>
        <Label className="text-xs flex items-center gap-1 mb-2">
          <Droplet className="w-3 h-3" />
          Water Intake (glasses)
        </Label>
        <div className="flex items-center gap-3">
          <Button
            onClick={decrementWater}
            variant="outline"
            size="sm"
            className="h-9 w-9 p-0"
          >
            -
          </Button>
          <div className="flex-1 text-center">
            <div className="text-2xl font-bold text-blue-500">{waterGlasses}</div>
            <div className="text-xs text-gray-500">glasses</div>
          </div>
          <Button
            onClick={incrementWater}
            variant="outline"
            size="sm"
            className="h-9 w-9 p-0"
          >
            +
          </Button>
        </div>
      </div>

      <div>
        <Label htmlFor="sleep-hours" className="text-xs flex items-center gap-1">
          <Moon className="w-3 h-3" />
          Sleep Hours
        </Label>
        <Input
          id="sleep-hours"
          type="number"
          min="0"
          max="24"
          step="0.5"
          placeholder="8"
          value={sleepHours}
          onChange={(e) => setSleepHours(e.target.value)}
          className="mt-1"
        />
      </div>

      <div>
        <Label className="text-xs flex items-center gap-1 mb-2">
          <Star className="w-3 h-3" />
          Sleep Quality
        </Label>
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              onClick={() => setSleepQuality(rating)}
              className="focus:outline-none"
            >
              <Star
                className={`w-8 h-8 ${
                  rating <= sleepQuality
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            </button>
          ))}
        </div>
        <p className="text-xs text-center text-gray-500 mt-1">
          {sleepQuality === 1 && "Poor"}
          {sleepQuality === 2 && "Fair"}
          {sleepQuality === 3 && "Good"}
          {sleepQuality === 4 && "Very Good"}
          {sleepQuality === 5 && "Excellent"}
        </p>
      </div>

      <Button
        onClick={saveHealthData}
        className="w-full bg-pink-500 hover:bg-pink-600 text-white"
      >
        Save Health Data
      </Button>
    </div>
  );
};
