import { differenceInDays, addDays, format } from "date-fns";
import { Calendar, Heart, TrendingUp } from "lucide-react";

interface UnifiedFertilityWidgetProps {
  lastPeriodDate: Date;
  cycleLength: number;
}

export const UnifiedFertilityWidget = ({ lastPeriodDate, cycleLength }: UnifiedFertilityWidgetProps) => {
  const today = new Date();
  const dayInCycle = differenceInDays(today, lastPeriodDate) + 1;
  const nextPeriodDate = addDays(lastPeriodDate, cycleLength);
  const daysUntilPeriod = differenceInDays(nextPeriodDate, today);
  
  // Calculate ovulation day and fertility
  const ovulationDay = cycleLength - 14;
  const fertileWindowStart = ovulationDay - 5;
  const fertileWindowEnd = ovulationDay + 1;
  
  const getFertilityScore = (): number => {
    if (dayInCycle === ovulationDay || dayInCycle === ovulationDay - 1) {
      return 95;
    }
    if (dayInCycle >= fertileWindowStart && dayInCycle < ovulationDay - 1) {
      return 75 + (5 - (ovulationDay - dayInCycle)) * 2;
    }
    if (dayInCycle === ovulationDay + 1) {
      return 50;
    }
    if (dayInCycle <= 7) {
      return 5;
    }
    if (dayInCycle > ovulationDay + 1) {
      return Math.max(10, 30 - (dayInCycle - ovulationDay) * 2);
    }
    return 15 + Math.min(20, (dayInCycle - 7) * 3);
  };

  const getPregnancyChance = (): number => {
    if (dayInCycle >= fertileWindowStart && dayInCycle <= fertileWindowEnd) {
      if (dayInCycle === ovulationDay || dayInCycle === ovulationDay - 1) {
        return 90;
      }
      return 70;
    }
    if (dayInCycle > fertileWindowEnd && dayInCycle < cycleLength - 5) {
      return 10;
    }
    return 5;
  };

  const fertilityScore = getFertilityScore();
  const pregnancyChance = getPregnancyChance();

  return (
    <div className="flex flex-col items-center">
      <div 
        className="relative w-64 h-64 rounded-full flex items-center justify-center"
        style={{ 
          backgroundColor: '#eb4899',
          boxShadow: '0 0 0 16px rgba(235, 72, 153, 0.1)'
        }}
      >
        <div className="text-center px-6">
          {/* Next Period Countdown */}
          <div className="mb-4 pb-4 border-b border-white/20">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-white" />
              <p className="text-xs text-white/80 font-medium">Next Period</p>
            </div>
            <p className="text-3xl font-bold text-white">
              {daysUntilPeriod > 0 ? daysUntilPeriod : 0} days
            </p>
            <p className="text-xs text-white/70 mt-1">
              {format(nextPeriodDate, "MMM d")}
            </p>
          </div>

          {/* Fertility Score & Pregnancy Chance */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingUp className="w-3 h-3 text-white" />
              </div>
              <p className="text-2xl font-bold text-white">{fertilityScore}</p>
              <p className="text-[10px] text-white/70">Fertility</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 mb-1">
                <Heart className="w-3 h-3 text-white" />
              </div>
              <p className="text-2xl font-bold text-white">{pregnancyChance}%</p>
              <p className="text-[10px] text-white/70">Pregnancy</p>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground">Day {dayInCycle} of cycle</p>
      </div>
    </div>
  );
};
