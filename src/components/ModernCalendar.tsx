import { format, addDays, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, differenceInMonths } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useMemo } from "react";
import { getSymptomDates } from "@/lib/symptomLog";

interface ModernCalendarProps {
  periodDates: Date[];
  cycleLength: number;
  lastPeriodDate: Date;
  periodDuration: number;
  onMonthChange?: (month: Date) => void;
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  symptomDates?: Date[];
}

export const ModernCalendar = ({ 
  periodDates, 
  cycleLength, 
  lastPeriodDate, 
  periodDuration, 
  onMonthChange,
  selectedDate,
  onDateSelect,
  symptomDates: propSymptomDates,
}: ModernCalendarProps) => {
  const today = new Date();
  
  const initialOffset = useMemo(() => {
    const lastPeriodMonth = startOfMonth(lastPeriodDate);
    const currentMonth = startOfMonth(today);
    return Math.max(0, differenceInMonths(currentMonth, lastPeriodMonth));
  }, [lastPeriodDate]);
  
  const [currentMonthOffset, setCurrentMonthOffset] = useState(initialOffset);
  
  const calculateAllDates = () => {
    const allPeriodDates: Date[] = [];
    const allOvulationDates: Date[] = [];
    const allFertileDates: Date[] = [];
    
    const startDate = lastPeriodDate;
    const endDate = addMonths(startDate, 12);
    let currentCycleStart = startDate;
    
    while (currentCycleStart <= endDate) {
      for (let i = 0; i < periodDuration; i++) {
        allPeriodDates.push(addDays(currentCycleStart, i));
      }
      
      const ovulationDate = addDays(currentCycleStart, cycleLength - 14);
      allOvulationDates.push(ovulationDate);
      
      for (let i = -5; i <= 1; i++) {
        allFertileDates.push(addDays(ovulationDate, i));
      }
      
      currentCycleStart = addDays(currentCycleStart, cycleLength);
    }
    
    return { periodDates: allPeriodDates, ovulationDates: allOvulationDates, fertileDates: allFertileDates };
  };

  const { periodDates: allPeriodDates, ovulationDates: allOvulationDates, fertileDates: allFertileDates } = calculateAllDates();
  const symptomDates = propSymptomDates || getSymptomDates();
  
  const startingMonth = startOfMonth(lastPeriodDate);
  const displayMonth = addMonths(startingMonth, currentMonthOffset);
  const monthStart = startOfMonth(displayMonth);
  const monthEnd = endOfMonth(displayMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const startPadding = getDay(monthStart);
  const weekDays = ["S", "M", "T", "W", "T", "F", "S"];

  const isPeriodDate = (date: Date) => allPeriodDates.some((pDate) => isSameDay(pDate, date));
  const isOvulationDate = (date: Date) => allOvulationDates.some((oDate) => isSameDay(oDate, date));
  const isFertileDate = (date: Date) => allFertileDates.some((fDate) => isSameDay(fDate, date));
  const isSymptomDate = (date: Date) => symptomDates.some((sDate) => isSameDay(sDate, date));

  const handlePrevMonth = () => {
    const newOffset = Math.max(currentMonthOffset - 1, 0);
    setCurrentMonthOffset(newOffset);
    if (onMonthChange) {
      onMonthChange(addMonths(startingMonth, newOffset));
    }
  };

  const handleNextMonth = () => {
    const newOffset = currentMonthOffset + 1;
    setCurrentMonthOffset(newOffset);
    if (onMonthChange) {
      onMonthChange(addMonths(startingMonth, newOffset));
    }
  };

  return (
    <div className="bg-card rounded-lg p-3 sm:p-4 border border-border/50">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 sm:mb-4">
        <button
          onClick={handlePrevMonth}
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-muted/50 hover:bg-muted flex items-center justify-center transition-all"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-4 h-4 text-foreground" />
        </button>
        
        <h3 className="text-sm sm:text-base font-bold text-foreground">
          {format(displayMonth, "MMMM yyyy")}
        </h3>
        
        <button
          onClick={handleNextMonth}
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-muted/50 hover:bg-muted flex items-center justify-center transition-all"
          aria-label="Next month"
        >
          <ChevronRight className="w-4 h-4 text-foreground" />
        </button>
      </div>

      {/* Week days header */}
      <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-1 sm:mb-2">
        {weekDays.map((day, index) => (
          <div
            key={index}
            className="text-center text-[10px] sm:text-xs font-semibold text-muted-foreground py-1 sm:py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
        {Array.from({ length: startPadding }).map((_, index) => (
          <div key={`empty-${index}`} />
        ))}
        
        {daysInMonth.map((day) => {
          const isPeriod = isPeriodDate(day);
          const isOvulation = isOvulationDate(day);
          const isFertile = isFertileDate(day) && !isPeriod && !isOvulation;
          const isSymptom = isSymptomDate(day);
          const isToday = isSameDay(day, today);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          
          let bgClass = "bg-transparent text-foreground hover:bg-muted/50";
          let ringClass = "";
          
          if (isPeriod) {
            bgClass = "bg-rose-500 text-white";
          } else if (isOvulation) {
            bgClass = "bg-purple-500 text-white";
            ringClass = "ring-2 ring-purple-300";
          } else if (isFertile) {
            bgClass = "bg-cyan-400 text-white";
          } else if (isSymptom) {
            bgClass = "bg-gray-400 text-white";
          }

          return (
            <button
              key={day.toString()}
              onClick={() => onDateSelect?.(day)}
              className={`
                aspect-square flex items-center justify-center rounded-lg text-xs sm:text-sm font-medium transition-all
                ${bgClass}
                ${ringClass}
                ${isToday && !isPeriod && !isOvulation && !isFertile && !isSymptom ? "ring-2 ring-primary ring-offset-1" : ""}
                ${isSelected ? "ring-2 ring-primary ring-offset-2" : ""}
                ${onDateSelect ? "cursor-pointer" : ""}
              `}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-2 sm:mt-4 flex gap-2 sm:gap-3 justify-center flex-wrap">
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-md bg-rose-500" />
          <span className="text-[10px] sm:text-xs text-muted-foreground">Period</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-md bg-purple-500 ring-1 ring-purple-300" />
          <span className="text-[10px] sm:text-xs text-muted-foreground">Ovulation</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-md bg-cyan-400" />
          <span className="text-[10px] sm:text-xs text-muted-foreground">Fertile</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-md ring-2 ring-primary" />
          <span className="text-[10px] sm:text-xs text-muted-foreground">Today</span>
        </div>
      </div>
    </div>
  );
};
