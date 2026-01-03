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
  { bgColor: 'bg-rose-100', iconBg: 'bg-rose-500', textColor: 'text-rose-700', borderColor: 'border-rose-200' },
  { bgColor: 'bg-pink-100', iconBg: 'bg-pink-500', textColor: 'text-pink-700', borderColor: 'border-pink-200' },
  { bgColor: 'bg-cyan-100', iconBg: 'bg-cyan-500', textColor: 'text-cyan-700', borderColor: 'border-cyan-200' },
  { bgColor: 'bg-blue-100', iconBg: 'bg-blue-500', textColor: 'text-blue-700', borderColor: 'border-blue-200' },
  { bgColor: 'bg-amber-100', iconBg: 'bg-amber-500', textColor: 'text-amber-700', borderColor: 'border-amber-200' },
  { bgColor: 'bg-purple-100', iconBg: 'bg-purple-500', textColor: 'text-purple-700', borderColor: 'border-purple-200' },
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
      subtitle: `${daysToNextPeriod} days left`,
      icon: Droplet,
      style: cardStyles[0],
    },
    {
      id: 2,
      title: "Ovulation",
      date: format(nextOvulationDate, "MMM dd"),
      subtitle: `${daysToOvulation} days left`,
      icon: Heart,
      style: cardStyles[1],
    },
    {
      id: 3,
      title: "Fertile Days",
      date: `${format(fertileWindowStart, "MMM dd")} - ${format(fertileWindowEnd, "dd")}`,
      subtitle: `${daysToFertileWindow} days left`,
      icon: Flower2,
      style: cardStyles[2],
    },
    {
      id: 4,
      title: "Safe Days",
      date: `${format(safeDayStart, "MMM dd")} - ${format(safeDayEnd, "dd")}`,
      subtitle: `${daysToSafeDays} days left`,
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
      subtitle: "Earliest date",
      icon: TestTube2,
      style: cardStyles[5],
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((card) => {
        const Icon = card.icon;
        
        return (
          <div
            key={card.id}
            className={`${card.style.bgColor} ${card.style.borderColor} border rounded-lg p-4`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 ${card.style.iconBg} rounded-lg flex items-center justify-center`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <span className={`text-xs font-medium ${card.style.textColor} bg-white/60 px-2 py-1 rounded-full`}>
                {card.subtitle}
              </span>
            </div>
            
            <h3 className="text-sm font-semibold text-gray-800 mb-1">
              {card.title}
            </h3>
            <p className={`text-lg font-bold ${card.style.textColor}`}>
              {card.date}
            </p>
          </div>
        );
      })}
    </div>
  );
};
