import { format, addDays, differenceInDays, startOfMonth, isSameMonth } from "date-fns";
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

interface InfoCardsProps {
  periodData: PeriodData;
  displayMonth?: Date;
}

export const InfoCards = ({ periodData, displayMonth }: InfoCardsProps) => {
  const today = new Date();
  
  // Extract values based on cycle type
  const lastPeriodDate = periodData.cycleType === 'regular' 
    ? periodData.lastPeriodDate 
    : periodData.cycles[periodData.cycles.length - 1].endDate;
  
  const cycleLength = periodData.cycleType === 'regular' 
    ? periodData.cycleLength 
    : periodData.mean;
  
  const isIrregular = periodData.cycleType === 'irregular';
  const stdDev = isIrregular ? periodData.stdDev : 0;

  // Find the period date that falls in the display month
  const targetMonth = displayMonth || addDays(lastPeriodDate, cycleLength);
  let periodDateInMonth = addDays(lastPeriodDate, cycleLength);
  
  // Calculate how many cycles to add/subtract to get to the target month
  while (!isSameMonth(periodDateInMonth, targetMonth)) {
    if (periodDateInMonth < targetMonth) {
      periodDateInMonth = addDays(periodDateInMonth, cycleLength);
    } else {
      periodDateInMonth = addDays(periodDateInMonth, -cycleLength);
    }
  }

  // Calculate dates based on the period in the display month
  const nextPeriodDate = periodDateInMonth;
  const nextOvulationDate = addDays(nextPeriodDate, -(14));
  const fertileWindowStart = addDays(nextOvulationDate, -5);
  const fertileWindowEnd = addDays(nextOvulationDate, 1);
  const safeDayStart = addDays(nextOvulationDate, 2);
  const safeDayEnd = addDays(nextPeriodDate, -1);
  
  // Calculate days left
  const daysToNextPeriod = Math.max(0, differenceInDays(nextPeriodDate, today));
  const daysToOvulation = Math.max(0, differenceInDays(nextOvulationDate, today));
  const daysToFertileWindow = Math.max(0, differenceInDays(fertileWindowStart, today));
  const daysToSafeDays = Math.max(0, differenceInDays(safeDayStart, today));

  const cards = [
    {
      id: 1,
      title: isIrregular ? "Next Period (Range)" : "Next Periods",
      date: isIrregular 
        ? `${format(addDays(nextPeriodDate, -Math.round(stdDev * 1.5)), "MMM dd")} - ${format(addDays(nextPeriodDate, Math.round(stdDev * 1.5)), "MMM dd")}`
        : format(nextPeriodDate, "MMM dd"),
      subtitle: `(${daysToNextPeriod} Days left)`,
      icon: Droplet,
      bgColor: "bg-card",
      iconColor: "text-[#c71585]",
    },
    {
      id: 2,
      title: "Next Ovulation",
      date: format(nextOvulationDate, "MMM dd"),
      subtitle: `(${daysToOvulation} Days left)`,
      icon: Heart,
      bgColor: "bg-card",
      iconColor: "text-primary",
    },
    {
      id: 3,
      title: "Fertile Days",
      date: `${format(fertileWindowStart, "MMM dd")} - ${format(fertileWindowEnd, "MMM dd")}`,
      subtitle: `(${daysToFertileWindow} Days left)`,
      icon: Flower2,
      bgColor: "bg-card",
      iconColor: "text-[#00bcd4]",
    },
    {
      id: 4,
      title: "Safe Days",
      date: `${format(safeDayStart, "MMM dd")} - ${format(safeDayEnd, "MMM dd")}`,
      subtitle: `(${daysToSafeDays} Days left)`,
      icon: Shield,
      bgColor: "bg-card",
      iconColor: "text-[#2196f3]",
    },
    {
      id: 5,
      title: "Expected Due Date",
      date: format(addDays(nextPeriodDate, 280), "MMM dd yyyy"),
      subtitle: "",
      icon: CalendarIcon,
      bgColor: "bg-card",
      iconColor: "text-[#ff9800]",
    },
    {
      id: 6,
      title: "Pregnancy Test",
      date: format(addDays(nextPeriodDate, 14), "MMM dd yyyy"),
      subtitle: "",
      icon: TestTube2,
      bgColor: "bg-card",
      iconColor: "text-primary",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((card) => {
        const Icon = card.icon;
        
        return (
          <div
            key={card.id}
            className={`${card.bgColor} rounded-xl p-3 aspect-square flex flex-col`}
          >
            <div className="mb-2">
              <div className={`p-2 bg-muted rounded-lg ${card.iconColor} inline-block`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
            
            <div className="flex-1 flex flex-col justify-center">
              <p className={`text-base font-bold mb-1 ${card.iconColor}`}>
                {card.date}
              </p>
              <h3 className="text-sm font-bold text-foreground mb-0.5">
                {card.title}
              </h3>
              {card.subtitle && (
                <p className="text-xs text-muted-foreground mt-0.5">{card.subtitle}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
