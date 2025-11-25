import { getFetalImageForWeek } from "@/lib/fetalImageMapping";
import { ChevronRight } from "lucide-react";

interface FetalDevelopmentVisualizationProps {
  week: number;
}

export const FetalDevelopmentVisualization = ({ week }: FetalDevelopmentVisualizationProps) => {
  const fetalImage = getFetalImageForWeek(week);

  return (
    <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background rounded-2xl p-6 border">
      <div className="flex items-center justify-between mb-4">
        <p className="text-2xl font-bold text-card-foreground">Week {week}</p>
        <ChevronRight className="w-6 h-6 text-primary" />
      </div>

      <div className="flex items-center justify-center py-4">
        <img 
          src={fetalImage} 
          alt={`Fetal development at week ${week}`}
          className="w-full max-w-sm h-auto rounded-xl object-cover"
        />
      </div>

      <p className="text-xs text-center text-muted-foreground mt-2">
        Medically accurate visualization of fetal development
      </p>
    </div>
  );
};
