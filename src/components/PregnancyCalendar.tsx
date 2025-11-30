import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, getDay, eachMonthOfInterval, differenceInDays } from "date-fns";
import { Flower2 } from "lucide-react";
import floralDecoration from "@/assets/floral-decoration.png";

interface PregnancyCalendarProps {
  lastPeriodDate: Date;
  currentWeek: number;
}

export const PregnancyCalendar = ({ lastPeriodDate, currentWeek }: PregnancyCalendarProps) => {
  const today = new Date();
  
  // Calculate all months from last period date to today
  const startingMonth = startOfMonth(lastPeriodDate);
  const endingMonth = startOfMonth(today);
  const allMonths = eachMonthOfInterval({ start: startingMonth, end: endingMonth });
  
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Check if date should be highlighted (all days from start to today)
  const isHighlightedDate = (date: Date) => {
    return date >= lastPeriodDate && date <= today;
  };

  // Calculate pregnancy week for a given date
  const getPregnancyWeek = (date: Date): number => {
    const daysSinceStart = differenceInDays(date, lastPeriodDate);
    return Math.floor(daysSinceStart / 7) + 1;
  };

  // Get color based on pregnancy week (trimester-based with progression)
  const getWeekColor = (week: number): string => {
    // First trimester (weeks 1-13): Pink shades
    if (week <= 13) {
      const intensity = 35 + (week * 3); // 35-74
      return `bg-[hsl(348,83%,${intensity}%)] text-white`;
    }
    // Second trimester (weeks 14-27): Purple shades
    else if (week <= 27) {
      const intensity = 40 + ((week - 14) * 2); // 40-68
      return `bg-[hsl(280,70%,${intensity}%)] text-white`;
    }
    // Third trimester (weeks 28-40): Deep purple shades
    else {
      const intensity = 30 + ((week - 28) * 2); // 30-56
      return `bg-[hsl(260,80%,${intensity}%)] text-white`;
    }
  };

  // Get trimester name
  const getTrimester = (week: number): string => {
    if (week <= 13) return "First Trimester";
    if (week <= 27) return "Second Trimester";
    return "Third Trimester";
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      {/* Floral Header with Week Label */}
      <div className="relative bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="absolute inset-0 opacity-70">
          <img 
            src={floralDecoration} 
            alt="" 
            className="w-full h-full object-cover scale-110"
          />
        </div>
        
        <div className="relative px-4 py-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Flower2 className="w-5 h-5 text-pink-600" />
            <p className="text-sm font-semibold text-gray-700">
              You're in Week {currentWeek}
            </p>
          </div>
          <p className="text-xs text-gray-500">
            {format(today, "MMMM d, yyyy")}
          </p>
        </div>
      </div>

      {/* All Calendars */}
      <div className="p-4 space-y-6">
        {allMonths.map((monthDate) => {
          const monthStart = startOfMonth(monthDate);
          const monthEnd = endOfMonth(monthDate);
          const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
          const startPadding = getDay(monthStart);

          // Get the pregnancy weeks in this month
          const firstDayOfMonth = daysInMonth.find(d => isHighlightedDate(d));
          const lastDayOfMonth = daysInMonth.filter(d => isHighlightedDate(d)).pop();
          
          const monthWeek = firstDayOfMonth ? getPregnancyWeek(firstDayOfMonth) : 0;
          const monthWeekEnd = lastDayOfMonth ? getPregnancyWeek(lastDayOfMonth) : monthWeek;
          const trimester = firstDayOfMonth ? getTrimester(getPregnancyWeek(firstDayOfMonth)) : "";

          return (
            <div key={monthDate.toString()}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    {format(monthDate, "MMMM yyyy")}
                  </h3>
                  {trimester && (
                    <p className="text-[10px] text-muted-foreground">{trimester}</p>
                  )}
                </div>
                {monthWeek > 0 && (
                  <span className="text-xs font-medium text-pink-600 bg-pink-50 px-2 py-1 rounded-full">
                    Week {monthWeek}{monthWeekEnd !== monthWeek ? `-${monthWeekEnd}` : ""}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-7 gap-0.5 mb-1">
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="text-center text-[9px] font-semibold text-muted-foreground py-0.5"
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-0.5">
                {Array.from({ length: startPadding }).map((_, index) => (
                  <div key={`empty-${index}`} />
                ))}
                
                {daysInMonth.map((day) => {
                  const isHighlighted = isHighlightedDate(day);
                  const isToday = isSameDay(day, today);
                  const pregnancyWeek = isHighlighted ? getPregnancyWeek(day) : 0;
                  
                  let bgClass = "bg-white/40 text-foreground";
                  
                  if (isHighlighted && pregnancyWeek > 0) {
                    bgClass = getWeekColor(pregnancyWeek);
                  }

                  return (
                    <div
                      key={day.toString()}
                      className={`
                        relative aspect-square flex items-center justify-center rounded-md text-[10px] font-medium transition-all
                        ${bgClass}
                        ${isToday ? "ring-2 ring-pink-600 ring-offset-1" : ""}
                        ${isHighlighted ? "shadow-sm" : ""}
                      `}
                    >
                      {format(day, "d")}
                      {isHighlighted && pregnancyWeek > 0 && (
                        <span className="absolute bottom-0 right-0 text-[6px] opacity-70 pr-0.5 pb-0.5">
                          W{pregnancyWeek}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        <div className="mt-3 flex gap-2 justify-center flex-wrap">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded bg-[hsl(348,83%,50%)]" />
            <span className="text-[8px] text-foreground">1st Trimester</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded bg-[hsl(280,70%,50%)]" />
            <span className="text-[8px] text-foreground">2nd Trimester</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded bg-[hsl(260,80%,40%)]" />
            <span className="text-[8px] text-foreground">3rd Trimester</span>
          </div>
        </div>
      </div>
    </div>
  );
};
