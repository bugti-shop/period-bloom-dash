import { format, addDays, differenceInDays, isSameMonth } from "date-fns";
import { Droplet, Heart, Flower2, Shield, Calendar as CalendarIcon, TestTube2 } from "lucide-react";
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

interface ModernInfoCardsProps {
  periodData: PeriodData;
  displayMonth?: Date;
}

const cardStyles = [
  { gradient: 'from-rose-500 to-pink-500', iconGlow: 'shadow-rose-500/30', badgeBg: 'bg-rose-100 text-rose-700' },
  { gradient: 'from-pink-500 to-fuchsia-500', iconGlow: 'shadow-pink-500/30', badgeBg: 'bg-pink-100 text-pink-700' },
  { gradient: 'from-cyan-500 to-teal-500', iconGlow: 'shadow-cyan-500/30', badgeBg: 'bg-cyan-100 text-cyan-700' },
  { gradient: 'from-blue-500 to-indigo-500', iconGlow: 'shadow-blue-500/30', badgeBg: 'bg-blue-100 text-blue-700' },
  { gradient: 'from-amber-500 to-orange-500', iconGlow: 'shadow-amber-500/30', badgeBg: 'bg-amber-100 text-amber-700' },
  { gradient: 'from-violet-500 to-purple-500', iconGlow: 'shadow-violet-500/30', badgeBg: 'bg-violet-100 text-violet-700' },
];

export const ModernInfoCards = ({ periodData, displayMonth }: ModernInfoCardsProps) => {
  const today = new Date();
  
  const lastPeriodDate = periodData.cycleType === 'regular' 
    ? periodData.lastPeriodDate 
    : periodData.cycles[periodData.cycles.length - 1].endDate;
  
  const cycleLength = periodData.cycleType === 'regular' 
    ? periodData.cycleLength 
    : periodData.mean;
  
  const isIrregular = periodData.cycleType === 'irregular';
  const stdDev = isIrregular ? periodData.stdDev : 0;

  const targetMonth = displayMonth || addDays(lastPeriodDate, cycleLength);
  let periodDateInMonth = addDays(lastPeriodDate, cycleLength);
  
  while (!isSameMonth(periodDateInMonth, targetMonth)) {
    if (periodDateInMonth < targetMonth) {
      periodDateInMonth = addDays(periodDateInMonth, cycleLength);
    } else {
      periodDateInMonth = addDays(periodDateInMonth, -cycleLength);
    }
  }

  const nextPeriodDate = periodDateInMonth;
  const nextOvulationDate = addDays(nextPeriodDate, -14);
  const fertileWindowStart = addDays(nextOvulationDate, -5);
  const fertileWindowEnd = addDays(nextOvulationDate, 1);
  const safeDayStart = addDays(nextOvulationDate, 2);
  const safeDayEnd = addDays(nextPeriodDate, -1);
  
  const daysToNextPeriod = Math.max(0, differenceInDays(nextPeriodDate, today));
  const daysToOvulation = Math.max(0, differenceInDays(nextOvulationDate, today));
  const daysToFertileWindow = Math.max(0, differenceInDays(fertileWindowStart, today));
  const daysToSafeDays = Math.max(0, differenceInDays(safeDayStart, today));

  const cards = [
    {
      id: 1,
      title: "Next Period",
      date: isIrregular 
        ? `${format(addDays(nextPeriodDate, -Math.round(stdDev * 1.5)), "MMM dd")} - ${format(addDays(nextPeriodDate, Math.round(stdDev * 1.5)), "MMM dd")}`
        : format(nextPeriodDate, "MMM dd"),
      subtitle: `${daysToNextPeriod} days`,
      icon: Droplet,
      style: cardStyles[0],
    },
    {
      id: 2,
      title: "Ovulation",
      date: format(nextOvulationDate, "MMM dd"),
      subtitle: `${daysToOvulation} days`,
      icon: Heart,
      style: cardStyles[1],
    },
    {
      id: 3,
      title: "Fertile Days",
      date: `${format(fertileWindowStart, "MMM dd")} - ${format(fertileWindowEnd, "dd")}`,
      subtitle: `${daysToFertileWindow} days`,
      icon: Flower2,
      style: cardStyles[2],
    },
    {
      id: 4,
      title: "Safe Days",
      date: `${format(safeDayStart, "MMM dd")} - ${format(safeDayEnd, "dd")}`,
      subtitle: `${daysToSafeDays} days`,
      icon: Shield,
      style: cardStyles[3],
    },
    {
      id: 5,
      title: "Due Date",
      date: format(addDays(nextPeriodDate, 280), "MMM dd, yyyy"),
      subtitle: "If pregnant",
      icon: CalendarIcon,
      style: cardStyles[4],
    },
    {
      id: 6,
      title: "Pregnancy Test",
      date: format(addDays(nextPeriodDate, 14), "MMM dd"),
      subtitle: "Earliest",
      icon: TestTube2,
      style: cardStyles[5],
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((card, index) => {
        const Icon = card.icon;
        
        return (
          <div
            key={card.id}
            className="group relative bg-card rounded-3xl p-4 border border-border/40 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98] overflow-hidden"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Subtle gradient overlay on hover */}
            <div className={`absolute inset-0 bg-gradient-to-br ${card.style.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-11 h-11 bg-gradient-to-br ${card.style.gradient} rounded-2xl flex items-center justify-center shadow-lg ${card.style.iconGlow} transition-transform duration-300 group-hover:scale-110`}>
                  <Icon className="w-5 h-5 text-white drop-shadow-sm" />
                </div>
                <span className={`text-[10px] font-bold ${card.style.badgeBg} px-2.5 py-1 rounded-full tracking-wide uppercase`}>
                  {card.subtitle}
                </span>
              </div>
              
              <h3 className="text-xs font-medium text-muted-foreground mb-1 tracking-wide">
                {card.title}
              </h3>
              <p className="text-lg font-bold text-foreground tracking-tight">
                {card.date}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
