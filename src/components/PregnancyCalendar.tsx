import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, getDay, eachMonthOfInterval, differenceInMonths } from "date-fns";
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

          // Calculate pregnancy week at the start of this month
          const monthWeek = Math.ceil(differenceInMonths(monthDate, lastPeriodDate) * 4.33) + 1;
          const monthWeekEnd = Math.min(monthWeek + 3, 40); // Approximately 4 weeks per month

          return (
            <div key={monthDate.toString()}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-foreground">
                  {format(monthDate, "MMMM yyyy")}
                </h3>
                <span className="text-xs font-medium text-pink-600 bg-pink-50 px-2 py-1 rounded-full">
                  Week {monthWeek}-{monthWeekEnd}
                </span>
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
                  
                  let bgClass = "bg-white/40 text-foreground";
                  
                  if (isHighlighted) {
                    bgClass = "bg-[hsl(348,83%,47%)] text-white";
                  }

                  return (
                    <div
                      key={day.toString()}
                      className={`
                        aspect-square flex items-center justify-center rounded-md text-[10px] font-medium transition-all
                        ${bgClass}
                        ${isToday ? "ring-2 ring-pink-600" : ""}
                        ${isHighlighted ? "shadow-sm" : ""}
                      `}
                    >
                      {format(day, "d")}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        <div className="mt-3 flex gap-2 justify-center">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded bg-[hsl(348,83%,47%)]" />
            <span className="text-[8px] text-foreground">Pregnancy Days</span>
          </div>
        </div>
      </div>
    </div>
  );
};
