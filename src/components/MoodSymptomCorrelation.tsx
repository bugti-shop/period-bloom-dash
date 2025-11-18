import { getAllMoodLogs } from "@/lib/moodLog";
import { getSymptomLogs } from "@/lib/symptomLog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const MoodSymptomCorrelation = () => {
  const moodLogs = getAllMoodLogs();
  const symptomLogs = getSymptomLogs();

  // Calculate correlation between moods and symptoms
  const correlations: Record<string, Record<string, number>> = {};

  moodLogs.forEach((moodLog) => {
    const symptomLog = symptomLogs.find(log => log.date === moodLog.date);
    
    if (symptomLog && symptomLog.symptoms.length > 0) {
      if (!correlations[moodLog.mood]) {
        correlations[moodLog.mood] = {};
      }
      
      symptomLog.symptoms.forEach(symptom => {
        correlations[moodLog.mood][symptom] = 
          (correlations[moodLog.mood][symptom] || 0) + 1;
      });
    }
  });

  // Get top correlations
  const topCorrelations: Array<{ mood: string, emoji: string, symptom: string, count: number }> = [];
  
  Object.entries(correlations).forEach(([mood, symptoms]) => {
    Object.entries(symptoms).forEach(([symptom, count]) => {
      const moodData = moodLogs.find(log => log.mood === mood);
      topCorrelations.push({
        mood,
        emoji: moodData?.emoji || "😐",
        symptom,
        count,
      });
    });
  });

  topCorrelations.sort((a, b) => b.count - a.count);

  if (topCorrelations.length === 0) {
    return (
      <Card className="p-4">
        <h3 className="font-semibold text-lg mb-2">Mood & Symptom Patterns</h3>
        <p className="text-sm text-muted-foreground">
          Track your mood alongside symptoms to see patterns and correlations.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <h3 className="font-semibold text-lg mb-3">Mood & Symptom Patterns</h3>
      <p className="text-sm text-muted-foreground mb-3">
        Common patterns between your mood and symptoms
      </p>
      <div className="space-y-2">
        {topCorrelations.slice(0, 5).map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">{item.emoji}</span>
              <span className="text-sm font-medium capitalize">{item.mood}</span>
              <span className="text-xs text-muted-foreground">+</span>
              <span className="text-sm">{item.symptom}</span>
            </div>
            <Badge variant="secondary">{item.count}x</Badge>
          </div>
        ))}
      </div>
    </Card>
  );
};
