import { differenceInDays, addDays, format } from "date-fns";
import { Calendar } from "lucide-react";

interface PeriodCountdownProps {
  lastPeriodDate: Date;
  cycleLength: number;
}

export const PeriodCountdown = ({ lastPeriodDate, cycleLength }: PeriodCountdownProps) => {
  const nextPeriodDate = addDays(lastPeriodDate, cycleLength);
  const today = new Date();
  const daysUntilPeriod = differenceInDays(nextPeriodDate, today);
  
  const getCountdownColor = () => {
    if (daysUntilPeriod <= 3) return "from-red-100 to-pink-100";
    if (daysUntilPeriod <= 7) return "from-orange-100 to-yellow-100";
    return "from-blue-100 to-purple-100";
  };

  const getTextColor = () => {
    if (daysUntilPeriod <= 3) return "text-red-600";
    if (daysUntilPeriod <= 7) return "text-orange-600";
    return "text-purple-600";
  };

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
          <Calendar className="w-8 h-8 text-white mx-auto mb-2" />
          <p className="text-4xl font-bold text-white">
            {daysUntilPeriod > 0 ? daysUntilPeriod : 0}
          </p>
          <p className="text-sm text-white/90 mt-1">days</p>
        </div>
      </div>
      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground mb-1">Next Period</p>
        <p className="text-base font-semibold text-foreground">
          {format(nextPeriodDate, "MMM d, yyyy")}
        </p>
      </div>
    </div>
  );
};
