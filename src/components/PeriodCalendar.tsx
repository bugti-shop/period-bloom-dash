import { format, addDays, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { getSymptomDates } from "@/lib/symptomLog";
import { loadTheme } from "@/lib/themeStorage";
import { AstrologyCalendar } from "./AstrologyCalendar";

interface PeriodCalendarProps {
  periodDates: Date[];
  cycleLength: number;
  lastPeriodDate: Date;
  periodDuration: number;
  onMonthChange?: (month: Date) => void;
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  symptomDates?: Date[];
}

export const PeriodCalendar = ({ 
  periodDates, 
  cycleLength, 
  lastPeriodDate, 
  periodDuration, 
  onMonthChange,
  selectedDate,
  onDateSelect,
  symptomDates: propSymptomDates,
}: PeriodCalendarProps) => {
  const today = new Date();
  const [currentMonthOffset, setCurrentMonthOffset] = useState(0);
  const [isAstrologyTheme, setIsAstrologyTheme] = useState(false);

  useEffect(() => {
    const theme = loadTheme();
    setIsAstrologyTheme(theme === "astrology");

    const checkTheme = () => {
      const currentTheme = loadTheme();
      setIsAstrologyTheme(currentTheme === "astrology");
    };

    const interval = setInterval(checkTheme, 500);
    return () => clearInterval(interval);
  }, []);
  
  // Calculate all dates for 12 months (same as CalendarPage)
  const calculateAllDates = () => {
    const allPeriodDates: Date[] = [];
    const allOvulationDates: Date[] = [];
    const allFertileDates: Date[] = [];
    
    // Calculate for 12 months ahead
    const startDate = lastPeriodDate;
    const endDate = addMonths(startDate, 12);
    let currentCycleStart = startDate;
    
    while (currentCycleStart <= endDate) {
      // Period dates
      for (let i = 0; i < periodDuration; i++) {
        allPeriodDates.push(addDays(currentCycleStart, i));
      }
      
      // Ovulation date (14 days before next period)
      const ovulationDate = addDays(currentCycleStart, cycleLength - 14);
      allOvulationDates.push(ovulationDate);
      
      // Fertile window (5 days before ovulation to 1 day after)
      for (let i = -5; i <= 1; i++) {
        allFertileDates.push(addDays(ovulationDate, i));
      }
      
      // Move to next cycle
      currentCycleStart = addDays(currentCycleStart, cycleLength);
    }
    
    return { periodDates: allPeriodDates, ovulationDates: allOvulationDates, fertileDates: allFertileDates };
  };

  const { periodDates: allPeriodDates, ovulationDates: allOvulationDates, fertileDates: allFertileDates } = calculateAllDates();
  const symptomDates = propSymptomDates || getSymptomDates();
  
  // Calculate display month based on offset (start from last period month)
  const startingMonth = startOfMonth(lastPeriodDate);
  const displayMonth = addMonths(startingMonth, currentMonthOffset);
  const monthStart = startOfMonth(displayMonth);
  const monthEnd = endOfMonth(displayMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const startPadding = getDay(monthStart);
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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

  // Render astrology calendar if theme is astrology
  if (isAstrologyTheme) {
    return (
      <AstrologyCalendar
        periodDates={periodDates}
        cycleLength={cycleLength}
        lastPeriodDate={lastPeriodDate}
        periodDuration={periodDuration}
        selectedDate={selectedDate}
        onDateSelect={onDateSelect}
      />
    );
  }

  return (
    <div className="glass-card p-1.5 rounded-2xl">
      <div className="flex items-center justify-between mb-1.5 px-1">
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
          const isPeriod = isPeriodDate(day);
          const isOvulation = isOvulationDate(day);
          const isFertile = isFertileDate(day) && !isPeriod && !isOvulation;
          const isSymptom = isSymptomDate(day);
          const isToday = isSameDay(day, today);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          
          let bgClass = "bg-white/40 text-foreground";
          
          if (isPeriod) {
            const periodIndex = allPeriodDates.findIndex(pDate => isSameDay(pDate, day)) % periodDuration;
            if (periodIndex === 0) bgClass = "bg-[hsl(348,83%,35%)] text-white";
            else if (periodIndex === 1) bgClass = "bg-[hsl(348,83%,45%)] text-white";
            else if (periodIndex === 2) bgClass = "bg-[hsl(348,83%,55%)] text-white";
            else if (periodIndex === 3) bgClass = "bg-[hsl(348,83%,65%)] text-white";
            else bgClass = "bg-[hsl(348,83%,75%)] text-white";
          } else if (isOvulation) {
            bgClass = "bg-[hsl(330,70%,50%)] text-white";
          } else if (isFertile) {
            const fertileIndex = allFertileDates.filter(fDate => 
              isSameDay(fDate, day) || 
              (fDate < day && allFertileDates.some(fd => isSameDay(fd, day)))
            ).length % 7;
            if (fertileIndex === 0) bgClass = "bg-[hsl(200,80%,40%)] text-white";
            else if (fertileIndex === 1) bgClass = "bg-[hsl(200,80%,50%)] text-white";
            else if (fertileIndex === 2) bgClass = "bg-[hsl(200,80%,60%)] text-white";
            else if (fertileIndex === 3) bgClass = "bg-[hsl(200,80%,70%)] text-white";
            else bgClass = "bg-[hsl(200,80%,80%)] text-gray-700";
          } else if (isSymptom) {
            bgClass = "bg-gray-400 text-white";
          }

          return (
            <button
              key={day.toString()}
              onClick={() => onDateSelect?.(day)}
              className={`
                aspect-square flex items-center justify-center rounded-md text-[10px] font-medium transition-all
                ${bgClass}
                ${isToday && !isPeriod && !isOvulation && !isFertile && !isSymptom ? "ring-2 ring-primary" : ""}
                ${isSelected ? "ring-2 ring-pink-500 ring-offset-1" : ""}
                ${(isPeriod || isOvulation || isFertile || isSymptom) ? "shadow-sm" : ""}
                ${onDateSelect ? "hover:scale-110 cursor-pointer" : ""}
              `}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>

      <div className="mt-1.5 flex gap-2 justify-center flex-wrap">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded bg-[hsl(348,83%,45%)]" />
          <span className="text-[8px] text-foreground">Period</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded bg-[hsl(330,70%,50%)]" />
          <span className="text-[8px] text-foreground">Ovulation</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded bg-[hsl(200,80%,60%)]" />
          <span className="text-[8px] text-foreground">Fertile</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded bg-gray-400" />
          <span className="text-[8px] text-foreground">Symptoms</span>
        </div>
      </div>
    </div>
  );
};
