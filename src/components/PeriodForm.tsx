import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { CycleTypeSelector } from "./CycleTypeSelector";
import { IrregularCycleForm } from "./IrregularCycleForm";

const periodFormSchema = z.object({
  cycleLength: z.number().min(21, "Cycle length must be at least 21 days").max(45, "Cycle length must be at most 45 days"),
  periodDuration: z.number().min(1, "Period duration must be at least 1 day").max(60, "Period duration must be at most 60 days")
});

interface PeriodFormProps {
  onSubmit: (data: any) => void;
}

export const PeriodForm = ({ onSubmit }: PeriodFormProps) => {
  const [cycleType, setCycleType] = useState<'regular' | 'irregular' | null>(null);
  const [lastPeriodDate, setLastPeriodDate] = useState("");
  const [cycleLength, setCycleLength] = useState("28");
  const [periodDuration, setPeriodDuration] = useState("5");
  const { toast } = useToast();

  if (cycleType === null) {
    return <CycleTypeSelector onSelect={setCycleType} />;
  }

  if (cycleType === 'irregular') {
    return (
      <IrregularCycleForm
        onSubmit={onSubmit}
        onBack={() => setCycleType(null)}
      />
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lastPeriodDate) return;

    const result = periodFormSchema.safeParse({
      cycleLength: parseInt(cycleLength),
      periodDuration: parseInt(periodDuration)
    });

    if (!result.success) {
      toast({
        title: "Validation Error",
        description: result.error.errors[0].message,
        variant: "destructive"
      });
      return;
    }

    onSubmit({
      cycleType: 'regular',
      lastPeriodDate: new Date(lastPeriodDate),
      cycleLength: parseInt(cycleLength),
      periodDuration: parseInt(periodDuration),
    });
  };

  return (
    <div className="glass-card p-8 rounded-3xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-primary/20 rounded-2xl">
          <Calendar className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-2xl font-semibold text-foreground">Track Your Cycle</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="lastPeriod" className="text-foreground font-medium">
            Last Period Start Date
          </Label>
          <Input
            id="lastPeriod"
            type="date"
            value={lastPeriodDate}
            onChange={(e) => setLastPeriodDate(e.target.value)}
            className="bg-white/60 border-glass-border backdrop-blur-sm"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cycleLength" className="text-foreground font-medium">
            Cycle Length (days)
          </Label>
          <Input
            id="cycleLength"
            type="number"
            min="21"
            max="45"
            value={cycleLength}
            onChange={(e) => setCycleLength(e.target.value)}
            className="bg-white/60 border-glass-border backdrop-blur-sm"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="periodDuration" className="text-foreground font-medium">
            Period Duration (days)
          </Label>
          <Input
            id="periodDuration"
            type="number"
            min="1"
            max="60"
            value={periodDuration}
            onChange={(e) => setPeriodDuration(e.target.value)}
            className="bg-white/60 border-glass-border backdrop-blur-sm"
            required
          />
          <p className="text-xs text-muted-foreground">
            Extended periods (up to 60 days) may occur with contraception changes or hormonal conditions like PCOS
          </p>
        </div>

        <Button
          type="submit"
          variant="pill"
          size="pill"
          className="w-full"
        >
          Start Tracking
        </Button>
      </form>
    </div>
  );
};
