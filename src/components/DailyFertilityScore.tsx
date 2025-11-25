import { differenceInDays } from "date-fns";
import { Heart, TrendingUp, Info } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface DailyFertilityScoreProps {
  lastPeriodDate: Date;
  cycleLength: number;
}

export const DailyFertilityScore = ({ lastPeriodDate, cycleLength }: DailyFertilityScoreProps) => {
  const today = new Date();
  const dayInCycle = differenceInDays(today, lastPeriodDate) + 1;
  
  // Calculate ovulation day (typically 14 days before next period)
  const ovulationDay = cycleLength - 14;
  
  const getFertilityData = (): { 
    score: number; 
    level: string; 
    color: string; 
    bgGradient: string;
    tip: string;
  } => {
    // Peak fertility: ovulation day and day before (90-100 score)
    if (dayInCycle === ovulationDay || dayInCycle === ovulationDay - 1) {
      return {
        score: 95,
        level: "Peak Fertility",
        color: "text-green-600",
        bgGradient: "from-green-100 to-emerald-100",
        tip: "Today is your most fertile day! This is the optimal time for conception. Consider having intercourse every day or every other day."
      };
    }
    
    // High fertility: 3-5 days before ovulation (70-85 score)
    if (dayInCycle >= ovulationDay - 5 && dayInCycle < ovulationDay - 1) {
      return {
        score: 75 + (5 - (ovulationDay - dayInCycle)) * 2,
        level: "High Fertility",
        color: "text-emerald-600",
        bgGradient: "from-emerald-100 to-green-100",
        tip: "Your fertile window is open! Sperm can survive up to 5 days, so this is a great time for conception attempts."
      };
    }
    
    // Moderate fertility: day after ovulation (40-60 score)
    if (dayInCycle === ovulationDay + 1) {
      return {
        score: 50,
        level: "Moderate",
        color: "text-yellow-600",
        bgGradient: "from-yellow-100 to-amber-100",
        tip: "Fertility is declining but still possible. The egg can survive for 12-24 hours after ovulation."
      };
    }
    
    // Low fertility: menstrual phase (1-7 score)
    if (dayInCycle <= 7) {
      return {
        score: 5,
        level: "Very Low",
        color: "text-red-600",
        bgGradient: "from-red-100 to-pink-100",
        tip: "During menstruation, conception is highly unlikely. Focus on self-care and tracking your cycle."
      };
    }
    
    // Low fertility: after ovulation window (10-30 score)
    if (dayInCycle > ovulationDay + 1) {
      return {
        score: Math.max(10, 30 - (dayInCycle - ovulationDay) * 2),
        level: "Low",
        color: "text-blue-600",
        bgGradient: "from-blue-100 to-indigo-100",
        tip: "You're in the luteal phase. Conception is unlikely now. Your body is preparing for the next cycle."
      };
    }
    
    // Pre-fertile phase (15-35 score)
    return {
      score: 15 + Math.min(20, (dayInCycle - 7) * 3),
      level: "Pre-fertile",
      color: "text-cyan-600",
      bgGradient: "from-cyan-100 to-blue-100",
      tip: "Fertility is building. Your body is preparing for ovulation. Start tracking cervical mucus changes."
    };
  };

  const fertilityData = getFertilityData();

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
            {fertilityData.score}
          </p>
          <p className="text-sm text-white/90 mt-1">{fertilityData.level}</p>
        </div>
      </div>
      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground mb-1">Fertility Score</p>
        <p className="text-base font-semibold text-foreground">
          Day {dayInCycle} of cycle
        </p>
      </div>
    </div>
  );
};
