import { format, addDays, isSameDay, addMonths } from "date-fns";
import { useState } from "react";

interface AstrologyCalendarProps {
  periodDates: Date[];
  cycleLength: number;
  lastPeriodDate: Date;
  periodDuration: number;
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
}

export const AstrologyCalendar = ({
  cycleLength,
  lastPeriodDate,
  periodDuration,
  selectedDate,
  onDateSelect,
}: AstrologyCalendarProps) => {
  const today = new Date();
  const [currentMonth] = useState(0);

  // Calculate all dates for current cycle
  const calculateAllDates = () => {
    const allPeriodDates: Date[] = [];
    const allOvulationDates: Date[] = [];
    const allFertileDates: Date[] = [];

    const startDate = lastPeriodDate;
    const endDate = addMonths(startDate, 3);
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

  // Calculate current day in cycle
  const daysSinceLastPeriod = Math.floor((today.getTime() - lastPeriodDate.getTime()) / (1000 * 60 * 60 * 24));
  const currentDayInCycle = (daysSinceLastPeriod % cycleLength) + 1;

  // Generate moon phases for the entire cycle
  const moonPhases = Array.from({ length: cycleLength }, (_, i) => {
    const dayNumber = i + 1;
    const date = addDays(lastPeriodDate, i);
    const isPeriod = allPeriodDates.some((pDate) => isSameDay(pDate, date));
    const isOvulation = allOvulationDates.some((oDate) => isSameDay(oDate, date));
    const isFertile = allFertileDates.some((fDate) => isSameDay(fDate, date)) && !isPeriod && !isOvulation;
    const isToday = dayNumber === currentDayInCycle;

    return { dayNumber, date, isPeriod, isOvulation, isFertile, isToday };
  });

  // Calculate positions for circular layout
  const radius = 140;
  const centerX = 180;
  const centerY = 180;

  const getMoonPhaseColor = (phase: typeof moonPhases[0]) => {
    if (phase.isPeriod) return "hsl(350, 80%, 50%)";
    if (phase.isOvulation) return "hsl(330, 70%, 50%)";
    if (phase.isFertile) return "hsl(180, 60%, 50%)";
    return "hsl(250, 40%, 40%)";
  };

  const getMoonPhaseSize = (phase: typeof moonPhases[0]) => {
    const baseSize = 18;
    if (phase.isPeriod) return baseSize + 4;
    if (phase.isOvulation) return baseSize + 6;
    if (phase.isFertile) return baseSize + 2;
    return baseSize;
  };

  const getMoonShape = (dayNumber: number, totalDays: number) => {
    // Calculate moon phase (0 = new moon, 0.5 = full moon, 1 = new moon again)
    const phase = dayNumber / totalDays;
    return phase;
  };

  // Moon phase SVG component
  const MoonPhase = ({ phase, size, color, x, y, isToday, onClick }: {
    phase: number;
    size: number;
    color: string;
    x: number;
    y: number;
    isToday: boolean;
    onClick?: () => void;
  }) => {
    // Calculate illumination percentage (0 = new moon, 0.5 = full moon)
    const illumination = phase < 0.5 ? phase * 2 : 2 - (phase * 2);
    
    // Waxing (0 to 0.5) or Waning (0.5 to 1)
    const isWaxing = phase < 0.5;
    
    return (
      <g onClick={onClick} style={{ cursor: onClick ? "pointer" : "default" }}>
        {/* Outer circle - moon body */}
        <circle
          cx={x}
          cy={y}
          r={size / 2}
          fill={`hsl(245, 30%, ${15 + illumination * 50}%)`}
          stroke={isToday ? "white" : color}
          strokeWidth={isToday ? 2.5 : 1}
          opacity={0.9}
        />
        
        {/* Illuminated portion */}
        {illumination > 0.05 && (
          <>
            <defs>
              <clipPath id={`moon-clip-${x}-${y}`}>
                {illumination < 0.5 ? (
                  // Crescent
                  <ellipse
                    cx={x + (isWaxing ? size / 4 : -size / 4) * (1 - illumination * 2)}
                    cy={y}
                    rx={size / 2 * illumination * 2}
                    ry={size / 2}
                  />
                ) : (
                  // Gibbous to Full
                  <ellipse
                    cx={x + (isWaxing ? -size / 4 : size / 4) * (2 - illumination * 2)}
                    cy={y}
                    rx={size / 2 * (2 - (1 - illumination) * 2)}
                    ry={size / 2}
                  />
                )}
              </clipPath>
            </defs>
            <circle
              cx={x}
              cy={y}
              r={size / 2}
              fill={color}
              clipPath={`url(#moon-clip-${x}-${y})`}
            />
          </>
        )}
      </g>
    );
  };

  // Calculate period status
  const daysUntilNextPeriod = cycleLength - currentDayInCycle;
  const periodStatus = currentDayInCycle <= periodDuration 
    ? `PERIOD IS ${currentDayInCycle} days in`
    : daysUntilNextPeriod > 0 
    ? `PERIOD IN ${daysUntilNextPeriod} days`
    : "PERIOD IS due";

  return (
    <div className="bg-card p-6 rounded-2xl border border-border">
      {/* Circular Moon Phase Calendar */}
      <div className="relative w-full aspect-square max-w-[360px] mx-auto">
        <svg viewBox="0 0 360 360" className="w-full h-full">
          {moonPhases.map((phase, index) => {
            const angle = (index / cycleLength) * 360 - 90;
            const x = centerX + radius * Math.cos((angle * Math.PI) / 180);
            const y = centerY + radius * Math.sin((angle * Math.PI) / 180);
            const size = getMoonPhaseSize(phase);
            const color = getMoonPhaseColor(phase);
            const moonPhase = getMoonShape(phase.dayNumber, cycleLength);

            return (
              <MoonPhase
                key={index}
                phase={moonPhase}
                size={size}
                color={color}
                x={x}
                y={y}
                isToday={phase.isToday}
                onClick={() => onDateSelect?.(phase.date)}
              />
            );
          })}
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-xs text-muted-foreground tracking-wider mb-2">{periodStatus}</p>
          <p className="text-3xl font-light text-foreground">
            {daysUntilNextPeriod > 0 ? `${daysUntilNextPeriod} days` : "Today"}
          </p>
          {currentDayInCycle <= periodDuration && (
            <p className="text-sm text-muted-foreground mt-1">Day {currentDayInCycle} of period</p>
          )}
        </div>
      </div>

      {/* Current date display */}
      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground mb-2">
          {format(today, "EEE, MMM d")}
        </p>
        <p className="text-xs text-muted-foreground">
          Day {currentDayInCycle} of {cycleLength}
        </p>
      </div>

      {/* Legend */}
      <div className="mt-6 flex gap-3 justify-center flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[hsl(350,80%,50%)]" />
          <span className="text-xs text-foreground">Period</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[hsl(330,70%,50%)]" />
          <span className="text-xs text-foreground">Ovulation</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[hsl(180,60%,50%)]" />
          <span className="text-xs text-foreground">Fertile</span>
        </div>
      </div>
    </div>
  );
};
