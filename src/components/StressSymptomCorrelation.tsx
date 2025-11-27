import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { getAllStressLogs } from "@/lib/stressStorage";
import { getSymptomLogs } from "@/lib/symptomLog";
import { parseISO, isSameDay } from "date-fns";
import { TrendingUp, AlertCircle } from "lucide-react";

interface Correlation {
  symptom: string;
  avgStressWithSymptom: number;
  avgStressWithoutSymptom: number;
  occurrences: number;
  correlation: "strong" | "moderate" | "weak";
}

export const StressSymptomCorrelation = () => {
  const [correlations, setCorrelations] = useState<Correlation[]>([]);
  const [insight, setInsight] = useState<string>("");

  useEffect(() => {
    const stressLogs = getAllStressLogs();
    const symptomLogs = getSymptomLogs();

    if (stressLogs.length < 3 || symptomLogs.length < 3) {
      setInsight("Need at least 3 entries in both stress and symptom logs to analyze patterns.");
      return;
    }

    // Analyze correlations
    const symptomMap: { [symptom: string]: { withStress: number[], withoutStress: number[] } } = {};

    symptomLogs.forEach(symptomLog => {
      const symptomDate = parseISO(symptomLog.date);
      const stressLog = stressLogs.find(s => isSameDay(parseISO(s.date), symptomDate));

      symptomLog.symptoms.forEach(symptom => {
        if (!symptomMap[symptom]) {
          symptomMap[symptom] = { withStress: [], withoutStress: [] };
        }
        if (stressLog) {
          symptomMap[symptom].withStress.push(stressLog.level);
        }
      });
    });

    // Calculate days without each symptom
    stressLogs.forEach(stressLog => {
      const stressDate = parseISO(stressLog.date);
      const symptomLog = symptomLogs.find(s => isSameDay(parseISO(s.date), stressDate));
      
      Object.keys(symptomMap).forEach(symptom => {
        if (!symptomLog || !symptomLog.symptoms.includes(symptom)) {
          symptomMap[symptom].withoutStress.push(stressLog.level);
        }
      });
    });

    // Calculate averages and correlations
    const results: Correlation[] = [];
    Object.entries(symptomMap).forEach(([symptom, data]) => {
      if (data.withStress.length >= 2) {
        const avgWith = data.withStress.reduce((a, b) => a + b, 0) / data.withStress.length;
        const avgWithout = data.withoutStress.length > 0
          ? data.withoutStress.reduce((a, b) => a + b, 0) / data.withoutStress.length
          : 0;
        
        const difference = avgWith - avgWithout;
        let correlationType: "strong" | "moderate" | "weak" = "weak";
        
        if (Math.abs(difference) >= 3) correlationType = "strong";
        else if (Math.abs(difference) >= 1.5) correlationType = "moderate";

        results.push({
          symptom,
          avgStressWithSymptom: Math.round(avgWith * 10) / 10,
          avgStressWithoutSymptom: Math.round(avgWithout * 10) / 10,
          occurrences: data.withStress.length,
          correlation: correlationType,
        });
      }
    });

    // Sort by strongest correlation
    results.sort((a, b) => {
      const diffA = Math.abs(a.avgStressWithSymptom - a.avgStressWithoutSymptom);
      const diffB = Math.abs(b.avgStressWithSymptom - b.avgStressWithoutSymptom);
      return diffB - diffA;
    });

    setCorrelations(results.slice(0, 5));

    // Generate insight
    if (results.length > 0 && results[0].correlation === "strong") {
      const top = results[0];
      setInsight(
        `Strong pattern detected: Your stress averages ${top.avgStressWithSymptom}/10 when experiencing ${top.symptom.toLowerCase()}, compared to ${top.avgStressWithoutSymptom}/10 without it. Managing stress may help reduce this symptom.`
      );
    } else if (results.length > 0) {
      setInsight("Moderate correlations detected. Continue tracking to identify clearer patterns between stress and symptoms.");
    } else {
      setInsight("No strong correlations found yet. Keep tracking consistently for better insights.");
    }
  }, []);

  const getCorrelationColor = (correlation: string) => {
    if (correlation === "strong") return "text-red-500";
    if (correlation === "moderate") return "text-yellow-500";
    return "text-green-500";
  };

  const getCorrelationBadge = (correlation: string) => {
    if (correlation === "strong") return "bg-red-500/10 text-red-500";
    if (correlation === "moderate") return "bg-yellow-500/10 text-yellow-500";
    return "bg-green-500/10 text-green-500";
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-lg">Stress & Symptom Patterns</h3>
      </div>

      {insight && (
        <div className="mb-4 p-3 bg-primary/5 rounded-lg flex gap-2">
          <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <p className="text-sm">{insight}</p>
        </div>
      )}

      {correlations.length > 0 ? (
        <div className="space-y-3">
          {correlations.map((corr) => (
            <div key={corr.symptom} className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{corr.symptom}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${getCorrelationBadge(corr.correlation)}`}>
                  {corr.correlation}
                </span>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <div className="flex justify-between">
                  <span>With symptom:</span>
                  <span className={getCorrelationColor(corr.correlation)}>
                    {corr.avgStressWithSymptom}/10 stress
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Without symptom:</span>
                  <span>{corr.avgStressWithoutSymptom}/10 stress</span>
                </div>
                <div className="text-xs">Tracked {corr.occurrences} times</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4">
          Not enough data yet. Keep tracking stress and symptoms to see patterns.
        </p>
      )}
    </Card>
  );
};
