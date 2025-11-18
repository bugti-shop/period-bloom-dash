import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Plus, Trash2, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { differenceInDays } from "date-fns";
import { CycleEntry, analyzeIrregularCycles } from "@/lib/irregularCycle";

interface IrregularCycleFormProps {
  onSubmit: (data: {
    cycleType: 'irregular';
    cycles: CycleEntry[];
    mean: number;
    stdDev: number;
    confidence: number;
  }) => void;
  onBack: () => void;
}

export const IrregularCycleForm = ({ onSubmit, onBack }: IrregularCycleFormProps) => {
  const [cycles, setCycles] = useState<Array<{ startDate: string; periodDuration: string }>>([
    { startDate: "", periodDuration: "5" },
    { startDate: "", periodDuration: "5" },
    { startDate: "", periodDuration: "5" }
  ]);
  const { toast } = useToast();

  const addCycle = () => {
    if (cycles.length < 6) {
      setCycles([...cycles, { startDate: "", periodDuration: "5" }]);
    }
  };

  const removeCycle = (index: number) => {
    if (cycles.length > 3) {
      setCycles(cycles.filter((_, i) => i !== index));
    }
  };

  const updateCycle = (index: number, field: 'startDate' | 'periodDuration', value: string) => {
    const newCycles = [...cycles];
    newCycles[index][field] = value;
    setCycles(newCycles);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all cycles have data
    const hasEmptyFields = cycles.some(c => !c.startDate || !c.periodDuration);
    if (hasEmptyFields) {
      toast({
        title: "Incomplete Data",
        description: "Please fill in all cycle dates and durations",
        variant: "destructive"
      });
      return;
    }

    // Convert to CycleEntry objects and calculate cycle lengths
    const cycleEntries: CycleEntry[] = cycles
      .map((cycle, index) => {
        const startDate = new Date(cycle.startDate);
        const nextStartDate = cycles[index + 1] ? new Date(cycles[index + 1].startDate) : null;
        
        return {
          id: Date.now().toString() + index,
          startDate,
          endDate: nextStartDate || new Date(), // Last cycle uses today
          cycleLength: nextStartDate ? differenceInDays(nextStartDate, startDate) : 28,
          periodDuration: parseInt(cycle.periodDuration)
        };
      })
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime()); // Sort by date ascending

    // Validate cycle lengths
    const invalidCycles = cycleEntries.filter(c => c.cycleLength < 21 || c.cycleLength > 45);
    if (invalidCycles.length > 0) {
      toast({
        title: "Invalid Cycle Length",
        description: "Cycle lengths must be between 21-45 days. Please check your dates.",
        variant: "destructive"
      });
      return;
    }

    const analysis = analyzeIrregularCycles(cycleEntries);
    
    if (!analysis) {
      toast({
        title: "Not Enough Data",
        description: "Please provide at least 3 cycles",
        variant: "destructive"
      });
      return;
    }

    onSubmit({
      cycleType: 'irregular',
      cycles: cycleEntries,
      mean: analysis.mean,
      stdDev: analysis.stdDev,
      confidence: analysis.confidence
    });
  };

  return (
    <div className="glass-card p-8 rounded-3xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-primary/20 rounded-2xl">
          <TrendingUp className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Irregular Cycle Tracking</h2>
          <p className="text-sm text-muted-foreground">Enter your last 3-6 cycles for analysis</p>
        </div>
      </div>

      <div className="mb-6 p-3 bg-muted/50 rounded-lg">
        <p className="text-xs text-muted-foreground">
          💡 Extended periods (up to 60 days) may occur with contraception changes or hormonal conditions like PCOS
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {cycles.map((cycle, index) => (
            <div key={index} className="p-4 bg-white/60 rounded-xl space-y-3 border border-glass-border">
              <div className="flex items-center justify-between">
                <Label className="text-foreground font-medium">Cycle {index + 1}</Label>
                {cycles.length > 3 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCycle(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`startDate-${index}`} className="text-sm">
                  Period Start Date
                </Label>
                <Input
                  id={`startDate-${index}`}
                  type="date"
                  value={cycle.startDate}
                  onChange={(e) => updateCycle(index, 'startDate', e.target.value)}
                  className="bg-white/60"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`duration-${index}`} className="text-sm">
                  Period Duration (days)
                </Label>
                <Input
                  id={`duration-${index}`}
                  type="number"
                  min="1"
                  max="60"
                  value={cycle.periodDuration}
                  onChange={(e) => updateCycle(index, 'periodDuration', e.target.value)}
                  className="bg-white/60"
                  required
                />
              </div>
            </div>
          ))}
        </div>

        {cycles.length < 6 && (
          <Button
            type="button"
            variant="outline"
            onClick={addCycle}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Another Cycle (Optional)
          </Button>
        )}

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="flex-1"
          >
            Back
          </Button>
          <Button
            type="submit"
            variant="pill"
            size="pill"
            className="flex-1"
          >
            Analyze Cycles
          </Button>
        </div>
      </form>
    </div>
  );
};
