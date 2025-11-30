import { format, addDays, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, differenceInDays } from "date-fns";
import { ChevronLeft, ChevronRight, Flower2 } from "lucide-react";
import { useState } from "react";
import floralDecoration from "@/assets/floral-decoration.png";

interface PregnancyCalendarProps {
  lastPeriodDate: Date;
  currentWeek: number;
}

export const PregnancyCalendar = ({ lastPeriodDate, currentWeek }: PregnancyCalendarProps) => {
  const today = new Date();
  const [currentMonthOffset, setCurrentMonthOffset] = useState(0);
  
  // Calculate the starting month from last period date
  const startingMonth = startOfMonth(lastPeriodDate);
  const displayMonth = addMonths(startingMonth, currentMonthOffset);
  const monthStart = startOfMonth(displayMonth);
  const monthEnd = endOfMonth(displayMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const startPadding = getDay(monthStart);
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Check if date should be highlighted (all days from start to today)
  const isHighlightedDate = (date: Date) => {
    return date >= lastPeriodDate && date <= today;
  };

  const handlePrevMonth = () => {
    setCurrentMonthOffset(Math.max(currentMonthOffset - 1, 0));
  };

  const handleNextMonth = () => {
    setCurrentMonthOffset(currentMonthOffset + 1);
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

      {/* Calendar */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={handlePrevMonth}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4 text-foreground" />
          </button>
          
          <h3 className="text-sm font-semibold text-foreground text-center">
            {format(displayMonth, "MMMM yyyy")}
          </h3>
          
          <button
            onClick={handleNextMonth}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4 text-foreground" />
          </button>
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
