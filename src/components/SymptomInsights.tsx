import { AlertCircle } from "lucide-react";
import { analyzeSymptomPatterns } from "@/lib/symptomLog";

interface SymptomInsightsProps {
  lastPeriodDate: Date;
  cycleLength: number;
}

export const SymptomInsights = ({ lastPeriodDate, cycleLength }: SymptomInsightsProps) => {
  const insight = analyzeSymptomPatterns(lastPeriodDate, cycleLength);

  if (!insight) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
      <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
      <div>
        <h4 className="font-semibold text-blue-900 mb-1">Pattern Detected</h4>
        <p className="text-sm text-blue-800">{insight}</p>
      </div>
    </div>
  );
};