import { format, differenceInDays, addWeeks } from "date-fns";
import { Baby, Heart, Calendar, Activity, Apple, Scale } from "lucide-react";
import { calculateTrimester } from "@/lib/pregnancyMode";
import { getBabyDataForWeek } from "@/lib/pregnancyData";
import { loadTheme } from "@/lib/themeStorage";

interface PregnancyInfoCardsProps {
  week: number;
  dueDate: Date;
  lastPeriodDate: Date;
}

export const PregnancyInfoCards = ({ week, dueDate, lastPeriodDate }: PregnancyInfoCardsProps) => {
  const today = new Date();
  const trimester = calculateTrimester(week);
  const babyData = getBabyDataForWeek(week);
  const daysUntilDue = Math.max(0, differenceInDays(dueDate, today));
  const weeksUntilDue = Math.floor(daysUntilDue / 7);
  const currentTheme = loadTheme();
  
  // Calculate next prenatal visit (typically every 4 weeks until week 28)
  const nextVisitWeek = week < 28 ? Math.ceil(week / 4) * 4 + 4 : week + 2;
  const nextVisitDate = addWeeks(lastPeriodDate, nextVisitWeek);
  const daysToNextVisit = Math.max(0, differenceInDays(nextVisitDate, today));

  const cards = [
    {
      id: 1,
      title: "Current Week",
      date: `Week ${week}`,
      subtitle: `Trimester ${trimester}`,
      icon: Baby,
      bgColor: currentTheme === 'astrology' ? "bg-card" : "bg-[#ffe8e8]",
      iconColor: "text-[#c71585]",
    },
    {
      id: 2,
      title: "Baby's Size",
      date: babyData.size,
      subtitle: `${babyData.heightCm} cm, ${babyData.weightGrams}g`,
      icon: Scale,
      bgColor: currentTheme === 'astrology' ? "bg-card" : "bg-[#ffd4f4]",
      iconColor: "text-primary",
    },
    {
      id: 3,
      title: "Due Date",
      date: format(dueDate, "MMM dd, yyyy"),
      subtitle: `${weeksUntilDue} weeks left`,
      icon: Calendar,
      bgColor: currentTheme === 'astrology' ? "bg-card" : "bg-[#fff4d4]",
      iconColor: "text-[#f59e0b]",
    },
    {
      id: 4,
      title: "Days Until Due",
      date: `${daysUntilDue} Days`,
      subtitle: `${40 - week} weeks to go`,
      icon: Heart,
      bgColor: currentTheme === 'astrology' ? "bg-card" : "bg-[#e8f4ff]",
      iconColor: "text-[#2196f3]",
    },
    {
      id: 5,
      title: "Next Checkup",
      date: format(nextVisitDate, "MMM dd"),
      subtitle: `In ${daysToNextVisit} days`,
      icon: Activity,
      bgColor: currentTheme === 'astrology' ? "bg-card" : "bg-[#e8ffe8]",
      iconColor: "text-[#4caf50]",
    },
    {
      id: 6,
      title: "Recommended Nutrition",
      date: "Balanced Diet",
      subtitle: "Folic acid, iron, calcium",
      icon: Apple,
      bgColor: currentTheme === 'astrology' ? "bg-card" : "bg-[#f4e8ff]",
      iconColor: "text-[#9c27b0]",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className={`${card.bgColor} rounded-2xl p-4 transition-transform hover:scale-105 ${
              currentTheme === 'astrology' ? 'border border-border' : ''
            }`}
          >
            <div className="flex flex-col h-full">
              <div className={`p-3 ${currentTheme === 'astrology' ? 'bg-muted' : 'bg-white'} rounded-xl w-fit mb-3`}>
                <Icon className={`w-6 h-6 ${card.iconColor}`} />
              </div>
              
              <div className="flex-1">
                <p className={`text-2xl font-bold mb-1 ${card.iconColor}`}>
                  {card.date}
                </p>
                <p className={`text-base font-semibold mb-1 ${
                  currentTheme === 'astrology' ? 'text-foreground' : 'text-gray-800'
                }`}>
                  {card.title}
                </p>
                <p className={`text-sm ${
                  currentTheme === 'astrology' ? 'text-muted-foreground' : 'text-gray-600'
                }`}>
                  {card.subtitle}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
