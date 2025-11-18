import { getWeeklyTips } from "@/lib/pregnancyData";
import { Lightbulb, Apple, Eye } from "lucide-react";

interface WeeklyTipsProps {
  week: number;
}

export const WeeklyTips = ({ week }: WeeklyTipsProps) => {
  const tips = getWeeklyTips(week);
  
  return (
    <div className="space-y-3">
      <h3 className="text-xl font-bold text-foreground mb-4">This Week's Tips</h3>
      
      {/* Pregnancy Tip */}
      <div className="bg-card rounded-xl p-4 border border-border">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
            <Lightbulb className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-foreground mb-1">Pregnancy Tip</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{tips.pregnancyTip}</p>
          </div>
        </div>
      </div>

      {/* Nutrition Tip */}
      <div className="bg-card rounded-xl p-4 border border-border">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <Apple className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-foreground mb-1">Nutrition Advice</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{tips.nutritionTip}</p>
          </div>
        </div>
      </div>

      {/* What to Expect */}
      <div className="bg-card rounded-xl p-4 border border-border">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <Eye className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-foreground mb-1">What to Expect</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{tips.whatToExpect}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
