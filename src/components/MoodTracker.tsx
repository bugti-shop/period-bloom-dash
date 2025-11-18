import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { saveMoodLog, getMoodForDate } from "@/lib/moodLog";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface MoodTrackerProps {
  selectedDate: Date;
}

const moods = [
  { emoji: "😊", label: "Happy", value: "happy" },
  { emoji: "😔", label: "Sad", value: "sad" },
  { emoji: "😰", label: "Anxious", value: "anxious" },
  { emoji: "😡", label: "Angry", value: "angry" },
  { emoji: "😴", label: "Tired", value: "tired" },
  { emoji: "😌", label: "Calm", value: "calm" },
  { emoji: "😖", label: "Stressed", value: "stressed" },
  { emoji: "🥰", label: "Loved", value: "loved" },
  { emoji: "😐", label: "Neutral", value: "neutral" },
];

export const MoodTracker = ({ selectedDate }: MoodTrackerProps) => {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const moodLog = getMoodForDate(selectedDate);
    setSelectedMood(moodLog?.mood || null);
  }, [selectedDate]);

  const handleMoodSelect = (mood: string, emoji: string) => {
    setSelectedMood(mood);
    saveMoodLog(selectedDate, mood, emoji);
    toast({
      title: "Mood saved",
      description: `${emoji} ${mood} for ${format(selectedDate, "MMM dd, yyyy")}`,
    });
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <h3 className="font-semibold text-lg mb-3">How are you feeling?</h3>
      <div className="grid grid-cols-3 gap-2">
        {moods.map((mood) => (
          <Button
            key={mood.value}
            variant={selectedMood === mood.value ? "default" : "outline"}
            className="h-20 flex flex-col gap-1"
            onClick={() => handleMoodSelect(mood.value, mood.emoji)}
          >
            <span className="text-3xl">{mood.emoji}</span>
            <span className="text-xs">{mood.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};
