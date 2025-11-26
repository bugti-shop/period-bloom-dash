import { format, addDays, isSameDay, addMonths } from "date-fns";
import { useState, useRef, useEffect } from "react";

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
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const svgRef = useRef<SVGSVGElement>(null);
  const lastAngleRef = useRef(0);
  const velocityRef = useRef(0);
  const lastTimeRef = useRef(0);
  const momentumRef = useRef<number | null>(null);

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
  const baseDayInCycle = (daysSinceLastPeriod % cycleLength);

  // Update current day based on rotation
  useEffect(() => {
    const rotationDays = Math.round((rotation / 360) * cycleLength);
    const newDayIndex = (baseDayInCycle - rotationDays + cycleLength) % cycleLength;
    setCurrentDayIndex(newDayIndex);
  }, [rotation, baseDayInCycle, cycleLength]);

  const currentDayInCycle = currentDayIndex + 1;
  const currentDate = addDays(lastPeriodDate, currentDayIndex);

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

  // Handle mouse/touch events for spinning with momentum
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    velocityRef.current = 0;
    lastTimeRef.current = Date.now();
    
    // Cancel any ongoing momentum
    if (momentumRef.current) {
      cancelAnimationFrame(momentumRef.current);
      momentumRef.current = null;
    }
    
    const svg = svgRef.current;
    if (!svg) return;
    
    const rect = svg.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
    lastAngleRef.current = angle;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    
    const svg = svgRef.current;
    if (!svg) return;
    
    const rect = svg.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
    
    const delta = angle - lastAngleRef.current;
    const now = Date.now();
    const timeDelta = now - lastTimeRef.current;
    
    if (timeDelta > 0) {
      velocityRef.current = delta / timeDelta * 16; // Normalize to 60fps
    }
    
    lastAngleRef.current = angle;
    lastTimeRef.current = now;
    
    setRotation(prev => prev + delta);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    
    // Apply momentum
    if (Math.abs(velocityRef.current) > 0.5) {
      const applyMomentum = () => {
        velocityRef.current *= 0.95; // Friction
        
        if (Math.abs(velocityRef.current) > 0.1) {
          setRotation(prev => prev + velocityRef.current);
          momentumRef.current = requestAnimationFrame(applyMomentum);
        } else {
          momentumRef.current = null;
        }
      };
      
      momentumRef.current = requestAnimationFrame(applyMomentum);
    }
  };

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

  const getMoonPhaseSize = (phase: typeof moonPhases[0], isCenter: boolean) => {
    const baseSize = 18;
    let size = baseSize;
    
    if (phase.isPeriod) size = baseSize + 4;
    else if (phase.isOvulation) size = baseSize + 6;
    else if (phase.isFertile) size = baseSize + 2;
    
    // Make center moon bigger
    if (isCenter) size = size * 1.6;
    
    return size;
  };

  const getMoonShape = (dayNumber: number, totalDays: number) => {
    // Calculate moon phase (0 = new moon, 0.5 = full moon, 1 = new moon again)
    const phase = dayNumber / totalDays;
    return phase;
  };

  // Moon phase SVG component with glow
  const MoonPhase = ({ phase, size, color, x, y, isToday, isCenter, onClick }: {
    phase: number;
    size: number;
    color: string;
    x: number;
    y: number;
    isToday: boolean;
    isCenter: boolean;
    onClick?: (e: React.MouseEvent) => void;
  }) => {
    // Calculate illumination percentage (0 = new moon, 0.5 = full moon)
    const illumination = phase < 0.5 ? phase * 2 : 2 - (phase * 2);
    
    // Waxing (0 to 0.5) or Waning (0.5 to 1)
    const isWaxing = phase < 0.5;
    
    const glowId = `glow-${x}-${y}`;
    
    return (
      <g 
        onClick={onClick} 
        style={{ cursor: onClick ? "pointer" : "default" }}
        className={isCenter ? "transition-transform duration-300" : ""}
      >
        <defs>
          {/* Glow filter for illuminated moons */}
          <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation={isCenter ? "5" : "3"} result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${illumination * (isCenter ? 1.2 : 0.8)} 0"
              result="glow"
            />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        {/* Outer circle - moon body */}
        <circle
          cx={x}
          cy={y}
          r={size / 2}
          fill={`hsl(245, 30%, ${15 + illumination * 50}%)`}
          stroke={isCenter || isToday ? "white" : color}
          strokeWidth={isCenter ? 3 : isToday ? 2.5 : 1}
          opacity={isCenter ? 1 : 0.9}
        />
        
        {/* Illuminated portion with glow */}
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
              filter={illumination > 0.3 ? `url(#${glowId})` : undefined}
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

  // Generate dates for horizontal display (7 days before and after current)
  const visibleDates = Array.from({ length: 15 }, (_, i) => {
    const offset = i - 7;
    return addDays(currentDate, offset);
  });

  // Calculate parallax offset based on rotation
  const parallaxX = (rotation % 360) / 360 * 10;
  const parallaxY = Math.sin((rotation * Math.PI) / 180) * 5;

  return (
    <div className="bg-card p-6 rounded-2xl border border-border">
      {/* Circular Moon Phase Calendar */}
      <div 
        className="relative w-full aspect-square max-w-[360px] mx-auto touch-none select-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <svg 
          ref={svgRef}
          viewBox="0 0 360 360" 
          className="w-full h-full"
          style={{ 
            transform: `rotate(${rotation}deg)`,
            transition: isDragging ? "none" : "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
            cursor: isDragging ? "grabbing" : "grab"
          }}
        >
          {moonPhases.map((phase, index) => {
            const angle = (index / cycleLength) * 360 - 90;
            const x = centerX + radius * Math.cos((angle * Math.PI) / 180);
            const y = centerY + radius * Math.sin((angle * Math.PI) / 180);
            
            // Determine if this is the center/active moon
            const normalizedRotation = ((rotation % 360) + 360) % 360;
            const moonAngle = ((angle + 90 + 360) % 360);
            const angleDiff = Math.abs(normalizedRotation - moonAngle);
            const isCenter = angleDiff < (360 / cycleLength / 2) || angleDiff > (360 - 360 / cycleLength / 2);
            
            const size = getMoonPhaseSize(phase, isCenter);
            const color = getMoonPhaseColor(phase);
            const moonPhase = getMoonShape(phase.dayNumber, cycleLength);

            const handleMoonClick = (e: React.MouseEvent) => {
              e.stopPropagation();
              
              // Calculate rotation needed to center this moon
              const targetAngle = -angle - 90;
              const currentNormalizedRotation = ((rotation % 360) + 360) % 360;
              const targetNormalizedRotation = ((targetAngle % 360) + 360) % 360;
              
              // Find shortest rotation path
              let rotationDelta = targetNormalizedRotation - currentNormalizedRotation;
              if (rotationDelta > 180) rotationDelta -= 360;
              if (rotationDelta < -180) rotationDelta += 360;
              
              setRotation(rotation + rotationDelta);
              
              // Call the original onClick if provided
              onDateSelect?.(phase.date);
            };

            return (
              <MoonPhase
                key={index}
                phase={moonPhase}
                size={size}
                color={color}
                x={x}
                y={y}
                isToday={phase.isToday}
                isCenter={isCenter}
                onClick={handleMoonClick}
              />
            );
          })}
        </svg>

        {/* Center text with parallax effect */}
        <div 
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-transform duration-300"
          style={{
            transform: `translate(${parallaxX}px, ${parallaxY}px)`
          }}
        >
          <p className="text-xs text-muted-foreground tracking-wider mb-2">{periodStatus}</p>
          <p className="text-3xl font-light text-foreground">
            {daysUntilNextPeriod > 0 ? `${daysUntilNextPeriod} days` : "Today"}
          </p>
          {currentDayInCycle <= periodDuration && (
            <p className="text-sm text-muted-foreground mt-1">Day {currentDayInCycle} of period</p>
          )}
        </div>
      </div>

      {/* Horizontal Date Scroll - Bottom - All 12 Months */}
      <div className="mt-8 overflow-hidden">
        <div className="flex gap-3 overflow-x-auto pb-4 px-4 scrollbar-hide justify-start">
          {Array.from({ length: 365 }).map((_, i) => {
            const date = addDays(lastPeriodDate, i);
            const dayInCycle = i % cycleLength;
            const isCurrentDay = dayInCycle === currentDayIndex;
            
            return (
              <button
                key={i}
                onClick={() => {
                  const targetAngle = -(dayInCycle * (360 / cycleLength)) - 90;
                  const currentNormalizedRotation = ((rotation % 360) + 360) % 360;
                  let delta = targetAngle - currentNormalizedRotation;
                  
                  if (delta > 180) delta -= 360;
                  if (delta < -180) delta += 360;
                  
                  setRotation(rotation + delta);
                }}
                className={`flex-shrink-0 transition-all duration-300 ${
                  isCurrentDay 
                    ? 'scale-110 opacity-100' 
                    : 'scale-90 opacity-60 hover:opacity-80'
                }`}
              >
                <div className={`w-16 h-20 rounded-xl flex flex-col items-center justify-center transition-all ${
                  isCurrentDay
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'bg-muted/30 text-muted-foreground hover:bg-muted/50'
                }`}>
                  <span className="text-xs font-medium">{format(date, "EEE")}</span>
                  <span className="text-2xl font-bold">{format(date, "d")}</span>
                  <span className="text-xs">{format(date, "MMM")}</span>
                </div>
              </button>
            );
          })}
        </div>
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
