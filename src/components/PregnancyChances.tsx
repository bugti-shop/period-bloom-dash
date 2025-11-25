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

  const chanceData = getPregnancyChance();

  return (
    <div className="flex flex-col items-center">
      <div 
        className="relative w-40 h-40 rounded-full flex items-center justify-center"
        style={{ 
          backgroundColor: '#eb4899',
          boxShadow: '0 0 0 12px rgba(235, 72, 153, 0.1)'
        }}
      >
        <div className="text-center">
          <p className="text-4xl font-bold text-white">
            {chanceData.percentage}%
          </p>
          <p className="text-sm text-white/90 mt-1">{chanceData.label}</p>
        </div>
      </div>
      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground mb-1">Pregnancy Chances</p>
        <p className="text-base font-semibold text-foreground">
          Day {dayInCycle} of cycle
        </p>
      </div>
    </div>
  );
};
