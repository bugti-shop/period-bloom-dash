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
    <div className={`p-6 bg-gradient-to-br ${getCountdownColor()} rounded-2xl`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-3 bg-white rounded-xl ${getTextColor()}`}>
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Next Period In</p>
            <p className={`text-3xl font-bold ${getTextColor()}`}>
              {daysUntilPeriod > 0 ? daysUntilPeriod : 0} days
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground mb-1">Expected Date</p>
          <p className="text-sm font-semibold text-foreground">
            {format(nextPeriodDate, "MMM d, yyyy")}
          </p>
        </div>
      </div>
    </div>
  );
};
