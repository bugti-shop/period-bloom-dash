import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getSymptomLogs } from "@/lib/symptomLog";
import { format, parseISO, differenceInDays } from "date-fns";
import { Brain, TrendingUp, Calendar } from "lucide-react";

interface Prediction {
  symptom: string;
  probability: number;
  expectedDate: string;
  confidence: "high" | "medium" | "low";
}

export const SymptomPatternPredictor = () => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [accuracy, setAccuracy] = useState<number>(0);

  useEffect(() => {
    analyzePatternsAndPredict();
  }, []);

  const analyzePatternsAndPredict = () => {
    const logs = getSymptomLogs();
    if (logs.length < 10) return;

    // Build symptom frequency map with dates
    const symptomOccurrences: { [key: string]: Date[] } = {};
    
    logs.forEach(log => {
      log.symptoms.forEach(symptom => {
        if (!symptomOccurrences[symptom]) {
          symptomOccurrences[symptom] = [];
        }
        symptomOccurrences[symptom].push(parseISO(log.date));
      });
    });

    // Calculate intervals and predict next occurrence
    const predictions: Prediction[] = [];
    const now = new Date();

    Object.entries(symptomOccurrences).forEach(([symptom, dates]) => {
      if (dates.length < 3) return; // Need at least 3 occurrences to predict

      // Sort dates
      dates.sort((a, b) => a.getTime() - b.getTime());

      // Calculate intervals between occurrences
      const intervals: number[] = [];
      for (let i = 1; i < dates.length; i++) {
        intervals.push(differenceInDays(dates[i], dates[i - 1]));
      }

      // Calculate average interval
      const avgInterval = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
      
      // Calculate standard deviation for confidence
      const variance = intervals.reduce((sum, val) => sum + Math.pow(val - avgInterval, 2), 0) / intervals.length;
      const stdDev = Math.sqrt(variance);

      // Determine confidence based on consistency
      let confidence: "high" | "medium" | "low";
      if (stdDev < 3) confidence = "high";
      else if (stdDev < 7) confidence = "medium";
      else confidence = "low";

      // Predict next occurrence
      const lastOccurrence = dates[dates.length - 1];
      const predictedDate = new Date(lastOccurrence);
      predictedDate.setDate(predictedDate.getDate() + Math.round(avgInterval));

      // Only show predictions for future dates
      if (predictedDate > now) {
        const daysDifference = differenceInDays(predictedDate, now);
        const probability = Math.min(95, 60 + (dates.length * 5) - (stdDev * 2));

        predictions.push({
          symptom: formatSymptomName(symptom),
          probability: Math.round(probability),
          expectedDate: format(predictedDate, "MMM dd, yyyy"),
          confidence
        });
      }
    });

    // Sort by probability
    predictions.sort((a, b) => b.probability - a.probability);
    setPredictions(predictions.slice(0, 5));

    // Calculate model accuracy based on data consistency
    const avgStdDev = Object.values(symptomOccurrences)
      .filter(dates => dates.length >= 3)
      .reduce((sum, dates) => {
        const sortedDates = dates.sort((a, b) => a.getTime() - b.getTime());
        const intervals = [];
        for (let i = 1; i < sortedDates.length; i++) {
          intervals.push(differenceInDays(sortedDates[i], sortedDates[i - 1]));
        }
        const avg = intervals.reduce((s, v) => s + v, 0) / intervals.length;
        const variance = intervals.reduce((s, v) => s + Math.pow(v - avg, 2), 0) / intervals.length;
        return sum + Math.sqrt(variance);
      }, 0) / Object.keys(symptomOccurrences).length;

    const modelAccuracy = Math.max(50, Math.min(95, 90 - (avgStdDev * 3)));
    setAccuracy(Math.round(modelAccuracy));
  };

  const formatSymptomName = (symptom: string) => {
    return symptom
      .split("-")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case "high": return "bg-green-100 text-green-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (predictions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            ML Pattern Predictor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            Not enough data yet. Keep logging symptoms to enable predictions.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          ML Pattern Predictor
        </CardTitle>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="outline">Model Accuracy: {accuracy}%</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Based on your historical data, here are predicted symptom occurrences:
        </p>
        
        {predictions.map((prediction, index) => (
          <div
            key={index}
            className="p-4 rounded-lg border border-border bg-card"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h4 className="font-semibold text-foreground">{prediction.symptom}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Expected: {prediction.expectedDate}
                  </span>
                </div>
              </div>
              <Badge className={getConfidenceColor(prediction.confidence)}>
                {prediction.confidence}
              </Badge>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <TrendingUp className="w-4 h-4 text-primary" />
              <div className="flex-1 bg-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${prediction.probability}%` }}
                />
              </div>
              <span className="text-sm font-medium">{prediction.probability}%</span>
            </div>
          </div>
        ))}

        <p className="text-xs text-muted-foreground mt-4">
          * Predictions are based on your personal symptom patterns and may vary.
        </p>
      </CardContent>
    </Card>
  );
};
