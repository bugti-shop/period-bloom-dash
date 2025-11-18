import { useState } from "react";
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, addMonths } from "date-fns";
import floralDecoration from "@/assets/floral-decoration.png";
import { InfoCards } from "@/components/InfoCards";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
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

interface CalendarPageProps {
  periodData: PeriodData;
}

export const CalendarPage = ({ periodData }: CalendarPageProps) => {
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);
  
  const lastPeriodDate = periodData.cycleType === 'regular' ? periodData.lastPeriodDate : periodData.cycles[periodData.cycles.length - 1].endDate;
  const cycleLength = periodData.cycleType === 'regular' ? periodData.cycleLength : periodData.mean;
  const periodDuration = periodData.cycleType === 'regular' ? periodData.periodDuration : Math.round(periodData.cycles.reduce((sum, c) => sum + c.periodDuration, 0) / periodData.cycles.length);
  
  const calculateAllDates = () => {
    if (!periodData) return { periodDates: [], ovulationDates: [], fertileDates: [] };
    
    const allPeriodDates: Date[] = [];
    const allOvulationDates: Date[] = [];
    const allFertileDates: Date[] = [];
    
    // Calculate for multiple cycles (from last period to end of 2026)
    const startDate = lastPeriodDate;
    const endDate = new Date(2026, 11, 31); // End of 2026
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

  const { periodDates, ovulationDates, fertileDates } = calculateAllDates();
  
  // Get starting month (month of last period)
  const startingMonth = startOfMonth(lastPeriodDate);
  const displayMonth = addMonths(startingMonth, currentMonthIndex);
  
  const today = new Date();
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const isPeriodDate = (date: Date) => periodDates.some((pDate) => isSameDay(pDate, date));
  const isOvulationDate = (date: Date) => ovulationDates.some((oDate) => isSameDay(oDate, date));
  const isFertileDate = (date: Date) => fertileDates.some((fDate) => isSameDay(fDate, date));
  
  const handlePrevMonth = () => setCurrentMonthIndex(prev => Math.max(prev - 1, 0));
  const handleNextMonth = () => setCurrentMonthIndex(prev => prev + 1);

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Beautiful Floral Header */}
      <div className="relative bg-gradient-to-br from-pink-50 to-purple-50 pt-8 pb-6">
        <div className="absolute inset-0 opacity-60">
          <img 
            src={floralDecoration} 
            alt="" 
            className="w-full h-full object-contain"
          />
        </div>
        
        <div className="relative max-w-md mx-auto px-4">
          <div className="text-center mb-4">
            <p className="text-sm text-gray-500 uppercase tracking-wider mb-2">TODAY</p>
            <h1 className="text-4xl font-bold text-gray-900 mb-1">
              {format(new Date(), "MMMM d")}
            </h1>
            <p className="text-2xl text-gray-700">{format(new Date(), "yyyy")}</p>
          </div>
        </div>
      </div>

      {/* Calendar Section */}
      <div className="max-w-7xl mx-auto px-1.5 py-1.5">
        <div className="glass-card p-1.5 rounded-2xl">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-1.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevMonth}
              disabled={currentMonthIndex === 0}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <h3 className="text-sm font-semibold text-foreground text-center">
              {format(displayMonth, "MMMM yyyy")}
            </h3>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextMonth}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
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
            {Array.from({ length: getDay(startOfMonth(displayMonth)) }).map((_, index) => (
              <div key={`empty-${index}`} />
            ))}
            
            {eachDayOfInterval({ start: startOfMonth(displayMonth), end: endOfMonth(displayMonth) }).map((day) => {
              const isPeriod = isPeriodDate(day);
              const isOvulation = isOvulationDate(day);
              const isFertile = isFertileDate(day) && !isPeriod && !isOvulation;
              const isToday = isSameDay(day, today);
              
              let bgClass = "bg-white/40 text-foreground";
              
              if (isPeriod) {
                const periodIndex = periodDates.findIndex(pDate => isSameDay(pDate, day)) % periodDuration;
                if (periodIndex === 0) bgClass = "bg-[hsl(348,83%,35%)] text-white";
                else if (periodIndex === 1) bgClass = "bg-[hsl(348,83%,45%)] text-white";
                else if (periodIndex === 2) bgClass = "bg-[hsl(348,83%,55%)] text-white";
                else if (periodIndex === 3) bgClass = "bg-[hsl(348,83%,65%)] text-white";
                else bgClass = "bg-[hsl(348,83%,75%)] text-white";
              } else if (isOvulation) {
                bgClass = "bg-[hsl(330,70%,50%)] text-white"; // Dark pink for ovulation
              } else if (isFertile) {
                const fertileIndex = fertileDates.filter(fDate => 
                  isSameDay(fDate, day) || 
                  (fDate < day && fertileDates.some(fd => isSameDay(fd, day)))
                ).length % 7;
                if (fertileIndex === 0) bgClass = "bg-[hsl(200,80%,40%)] text-white";
                else if (fertileIndex === 1) bgClass = "bg-[hsl(200,80%,50%)] text-white";
                else if (fertileIndex === 2) bgClass = "bg-[hsl(200,80%,60%)] text-white";
                else if (fertileIndex === 3) bgClass = "bg-[hsl(200,80%,70%)] text-white";
                else bgClass = "bg-[hsl(200,80%,80%)] text-gray-700";
              }

              return (
                <div
                  key={day.toString()}
                  className={`
                    aspect-square flex items-center justify-center rounded-md text-[10px] font-medium transition-all
                    ${bgClass}
                    ${isToday && !isPeriod && !isOvulation && !isFertile ? "ring-2 ring-primary" : ""}
                    ${(isPeriod || isOvulation || isFertile) ? "shadow-sm" : ""}
                  `}
                >
                  {format(day, "d")}
                </div>
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
          </div>
        </div>
        
        {/* Info Cards Below Calendar */}
        <div className="mt-4">
          <InfoCards periodData={periodData} />
        </div>
      </div>
    </div>
  );
};
