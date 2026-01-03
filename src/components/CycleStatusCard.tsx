import { format, addDays, differenceInDays } from "date-fns";
import { Droplet, Sparkles, TrendingUp } from "lucide-react";
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

  // Determine current phase with luxury colors
  const getPhaseInfo = () => {
    if (daysUntilPeriod <= 0 && daysUntilPeriod >= -(periodData.cycleType === 'regular' ? periodData.periodDuration : 5)) {
      return { 
        phase: 'Period', 
        gradient: 'from-rose-500 via-pink-500 to-rose-400',
        bgGlow: 'shadow-rose-500/30',
        message: "You're on your period",
        icon: Droplet
      };
    } else if (daysUntilOvulation >= -1 && daysUntilOvulation <= 1) {
      return { 
        phase: 'Ovulation', 
        gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
        bgGlow: 'shadow-purple-500/30',
        message: "Peak fertility window",
        icon: Sparkles
      };
    } else if (daysUntilOvulation > 1 && daysUntilOvulation <= 5) {
      return { 
        phase: 'Fertile', 
        gradient: 'from-sky-500 via-cyan-500 to-teal-400',
        bgGlow: 'shadow-cyan-500/30',
        message: "Fertile window",
        icon: TrendingUp
      };
    } else if (daysUntilPeriod <= 7) {
      return { 
        phase: 'Luteal', 
        gradient: 'from-amber-500 via-orange-500 to-yellow-400',
        bgGlow: 'shadow-amber-500/30',
        message: "Luteal phase",
        icon: Sparkles
      };
    } else {
      return { 
        phase: 'Follicular', 
        gradient: 'from-emerald-500 via-green-500 to-teal-400',
        bgGlow: 'shadow-emerald-500/30',
        message: "Follicular phase",
        icon: TrendingUp
      };
    }
  };

  const phaseInfo = getPhaseInfo();
  const PhaseIcon = phaseInfo.icon;

  // Calculate progress through cycle
  const cycleProgress = periodData.cycleType === 'regular'
    ? ((cycleLength - daysUntilPeriod) / cycleLength) * 100
    : ((periodData.mean - daysUntilPeriod) / periodData.mean) * 100;

  return (
    <div className={`relative overflow-hidden rounded-[2rem] bg-gradient-to-br ${phaseInfo.gradient} p-1 shadow-2xl ${phaseInfo.bgGlow}`}>
      {/* Inner card with glass effect */}
      <div className="relative bg-gradient-to-br from-white/20 to-transparent rounded-[1.75rem] p-6 backdrop-blur-sm">
        {/* Animated background orbs */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/15 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl" />
        <div className="absolute top-1/2 right-1/4 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-1.5 bg-white/25 backdrop-blur-md px-3 py-1 rounded-full">
                  <PhaseIcon className="w-3.5 h-3.5 text-white" />
                  <span className="text-xs font-semibold text-white tracking-wide">{phaseInfo.phase}</span>
                </div>
              </div>
              <h2 className="text-6xl font-bold text-white tracking-tighter drop-shadow-lg">
                {daysUntilPeriod > 0 ? daysUntilPeriod : 0}
              </h2>
              <p className="text-base font-medium text-white/90 mt-1 tracking-wide">
                days until next period
              </p>
            </div>
            
            <div className="w-16 h-16 bg-white/25 rounded-2xl flex items-center justify-center backdrop-blur-md shadow-lg border border-white/30">
              <Droplet className="w-8 h-8 text-white drop-shadow-md" />
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-white/80">Cycle Progress</span>
              <span className="text-xs font-bold text-white">{Math.min(Math.round(cycleProgress), 100)}%</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
              <div 
                className="h-full bg-white rounded-full transition-all duration-700 ease-out shadow-md"
                style={{ width: `${Math.min(cycleProgress, 100)}%` }}
              />
            </div>
          </div>
          
          {/* Footer stats */}
          <div className="flex items-center gap-3 pt-4 border-t border-white/25">
            <div className="flex-1 bg-white/15 backdrop-blur-sm rounded-2xl p-3">
              <p className="text-[10px] uppercase tracking-wider text-white/70 mb-0.5 font-medium">Next Period</p>
              <p className="text-sm font-bold text-white">{format(nextPeriodDate, "MMM dd")}</p>
            </div>
            <div className="flex-1 bg-white/15 backdrop-blur-sm rounded-2xl p-3">
              <p className="text-[10px] uppercase tracking-wider text-white/70 mb-0.5 font-medium">Ovulation</p>
              <p className="text-sm font-bold text-white">
                {daysUntilOvulation > 0 ? `in ${daysUntilOvulation}d` : 'Passed'}
              </p>
            </div>
            <div className="flex-1 bg-white/15 backdrop-blur-sm rounded-2xl p-3">
              <p className="text-[10px] uppercase tracking-wider text-white/70 mb-0.5 font-medium">Cycle</p>
              <p className="text-sm font-bold text-white">{cycleLength} days</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
