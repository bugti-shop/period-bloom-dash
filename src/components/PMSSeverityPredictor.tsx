import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, TrendingUp, Calendar } from "lucide-react";
import { analyzePMSPatterns, PMSPrediction } from "@/lib/pmsStorage";
import { format } from "date-fns";

interface PMSSeverityPredictorProps {
  lastPeriodDate: Date;
  cycleLength: number;
}

export const PMSSeverityPredictor = ({ lastPeriodDate, cycleLength }: PMSSeverityPredictorProps) => {
  const prediction = analyzePMSPatterns(lastPeriodDate, cycleLength);

  if (!prediction) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">PMS Severity Predictor</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Log symptoms for at least 3 cycles to get PMS predictions
        </p>
      </Card>
    );
  }

  const severityColors = {
    mild: "bg-green-100 text-green-800 border-green-300",
    moderate: "bg-yellow-100 text-yellow-800 border-yellow-300",
    severe: "bg-red-100 text-red-800 border-red-300",
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">PMS Severity Predictor</h3>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">Expected PMS Start</span>
          </div>
          <span className="text-sm font-medium">{format(prediction.date, "MMM dd")}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm">Predicted Severity</span>
          <Badge className={severityColors[prediction.severity]}>
            {prediction.severity.toUpperCase()}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm">Confidence</span>
          <span className="text-sm font-medium">{prediction.confidence}%</span>
        </div>

        {prediction.symptoms.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Common Symptoms</p>
            <div className="flex flex-wrap gap-2">
              {prediction.symptoms.map((symptom, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {symptom}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="pt-4 border-t">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-primary mt-0.5" />
            <div>
              <p className="text-sm font-medium mb-2">Preparation Tips</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                {prediction.tips.map((tip, idx) => (
                  <li key={idx}>• {tip}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
