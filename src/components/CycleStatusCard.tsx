import { format, addDays, differenceInDays } from "date-fns";
import { Droplet, Sparkles } from "lucide-react";
import { CycleEntry } from "@/lib/irregularCycle";

interface RegularPeriodData {
  cycleType: 'regular';
  lastPeriodDate: Date;
  cycleLength: number;
  periodDuration: number;
}

interface IrregularPeriodData {
  cycleType: 'irregular';
  cycles: CycleEntry[];
  mean: number;
  stdDev: number;
  confidence: number;
}

type PeriodData = RegularPeriodData | IrregularPeriodData;

interface CycleStatusCardProps {
  periodData: PeriodData;
}

export const CycleStatusCard = ({ periodData }: CycleStatusCardProps) => {
  const today = new Date();
  
  const nextPeriodDate = periodData.cycleType === 'regular' 
    ? addDays(periodData.lastPeriodDate, periodData.cycleLength)
    : addDays(periodData.cycles[periodData.cycles.length - 1].endDate, periodData.mean);
  
  const daysUntilPeriod = differenceInDays(nextPeriodDate, today);
  
  const cycleLength = periodData.cycleType === 'regular' 
    ? periodData.cycleLength 
    : periodData.mean;
  
  const ovulationDate = periodData.cycleType === 'regular'
    ? addDays(periodData.lastPeriodDate, periodData.cycleLength - 14)
    : addDays(periodData.cycles[periodData.cycles.length - 1].endDate, periodData.mean - 14);
  
  const daysUntilOvulation = differenceInDays(ovulationDate, today);

  // Determine current phase
  const getPhaseInfo = () => {
    if (daysUntilPeriod <= 0 && daysUntilPeriod >= -(periodData.cycleType === 'regular' ? periodData.periodDuration : 5)) {
      return { phase: 'Period', color: 'from-rose-400 to-pink-500', message: "You're on your period" };
    } else if (daysUntilOvulation >= -1 && daysUntilOvulation <= 1) {
      return { phase: 'Ovulation', color: 'from-purple-400 to-pink-500', message: "Peak fertility window" };
    } else if (daysUntilOvulation > 1 && daysUntilOvulation <= 5) {
      return { phase: 'Fertile', color: 'from-blue-400 to-cyan-500', message: "Fertile window" };
    } else if (daysUntilPeriod <= 7) {
      return { phase: 'Luteal', color: 'from-amber-400 to-orange-500', message: "Luteal phase" };
    } else {
      return { phase: 'Follicular', color: 'from-green-400 to-emerald-500', message: "Follicular phase" };
    }
  };

  const phaseInfo = getPhaseInfo();

  return (
    <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${phaseInfo.color} p-6 text-white shadow-lg`}>
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-medium opacity-90">{phaseInfo.message}</span>
            </div>
            <h2 className="text-4xl font-bold tracking-tight">
              {daysUntilPeriod > 0 ? daysUntilPeriod : 0}
            </h2>
            <p className="text-sm font-medium opacity-90 mt-1">
              days until next period
            </p>
          </div>
          
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <Droplet className="w-7 h-7" />
          </div>
        </div>
        
        <div className="flex items-center gap-4 pt-4 border-t border-white/20">
          <div className="flex-1">
            <p className="text-xs opacity-75 mb-0.5">Next Period</p>
            <p className="text-sm font-semibold">{format(nextPeriodDate, "MMM dd, yyyy")}</p>
          </div>
          <div className="w-px h-8 bg-white/30" />
          <div className="flex-1">
            <p className="text-xs opacity-75 mb-0.5">Ovulation</p>
            <p className="text-sm font-semibold">
              {daysUntilOvulation > 0 ? `in ${daysUntilOvulation} days` : 'Passed'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
