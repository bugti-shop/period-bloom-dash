import { differenceInDays, addDays } from "date-fns";
import { Heart } from "lucide-react";

interface PregnancyChancesProps {
  lastPeriodDate: Date;
  cycleLength: number;
}

export const PregnancyChances = ({ lastPeriodDate, cycleLength }: PregnancyChancesProps) => {
  const today = new Date();
  const dayInCycle = differenceInDays(today, lastPeriodDate) + 1;
  
  // Calculate ovulation day (typically 14 days before next period)
  const ovulationDay = cycleLength - 14;
  const fertileWindowStart = ovulationDay - 5;
  const fertileWindowEnd = ovulationDay + 1;
  
  const getPregnancyChance = (): { percentage: number; label: string; color: string } => {
    if (dayInCycle >= fertileWindowStart && dayInCycle <= fertileWindowEnd) {
      if (dayInCycle === ovulationDay || dayInCycle === ovulationDay - 1) {
        return { percentage: 90, label: "Peak Fertility", color: "text-green-600" };
      }
      return { percentage: 70, label: "High Fertility", color: "text-emerald-600" };
    }
    
    if (dayInCycle > fertileWindowEnd && dayInCycle < cycleLength - 5) {
      return { percentage: 10, label: "Low Fertility", color: "text-blue-600" };
    }
    
    return { percentage: 5, label: "Very Low", color: "text-gray-600" };
  };

  const { percentage, label, color } = getPregnancyChance();
  
  const getBackgroundGradient = () => {
    if (percentage >= 70) return "from-green-100 to-emerald-100";
    if (percentage >= 30) return "from-yellow-100 to-orange-100";
    return "from-gray-100 to-slate-100";
  };

  return (
    <div className={`p-6 bg-gradient-to-br ${getBackgroundGradient()} rounded-2xl`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-3 bg-white rounded-xl ${color}`}>
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Pregnancy Chances</p>
            <p className={`text-3xl font-bold ${color}`}>{percentage}%</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground mb-1">Fertility Status</p>
          <p className={`text-sm font-semibold ${color}`}>{label}</p>
          <p className="text-xs text-muted-foreground mt-1">Day {dayInCycle} of cycle</p>
        </div>
      </div>
    </div>
  );
};
