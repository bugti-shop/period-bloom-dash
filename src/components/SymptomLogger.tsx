import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { saveSymptomLog, getSymptomsForDate } from "@/lib/symptomLog";
import { toast } from "sonner";
import crampImg from "@/assets/symptom-cramps.png";
import bloatingImg from "@/assets/symptom-bloating.png";
import tenderBreastsImg from "@/assets/symptom-tender-breasts.png";
import fatigueImg from "@/assets/symptom-fatigue.png";
import nauseaImg from "@/assets/symptom-nausea.png";
import moodSwingsImg from "@/assets/symptom-mood-swings.png";
import headacheImg from "@/assets/symptom-headache.png";
import spottingImg from "@/assets/symptom-spotting.png";
import foodCravingsImg from "@/assets/symptom-food-cravings.png";
import backacheImg from "@/assets/symptom-backache.png";

const symptomOptions = [
  { id: "cramps", label: "Cramps", image: crampImg },
  { id: "back-pain", label: "Back Pain", image: backacheImg },
  { id: "bloating", label: "Bloating", image: bloatingImg },
  { id: "tender-breasts", label: "Tender Breasts", image: tenderBreastsImg },
  { id: "fatigue", label: "Fatigue", image: fatigueImg },
  { id: "nausea", label: "Nausea", image: nauseaImg },
  { id: "mood-swings", label: "Mood Swings", image: moodSwingsImg },
  { id: "headache", label: "Headache", image: headacheImg },
  { id: "spotting", label: "Light Spotting", image: spottingImg },
  { id: "food-cravings", label: "Food Cravings", image: foodCravingsImg },
];

export const SymptomLogger = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(() => 
    getSymptomsForDate(new Date())
  );

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setSelectedSymptoms(getSymptomsForDate(date));
    }
  };

  const handleSymptomToggle = (symptomId: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptomId)
        ? prev.filter(id => id !== symptomId)
        : [...prev, symptomId]
    );
  };

  const handleSave = () => {
    saveSymptomLog(selectedDate, selectedSymptoms);
    toast.success(`Symptoms saved for ${format(selectedDate, "MMMM d, yyyy")}`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="text-lg font-semibold mb-3">Select Date</h3>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          className="rounded-lg border"
        />
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Select Symptoms</h3>
        <div className="grid grid-cols-3 gap-3">
          {symptomOptions.map(symptom => (
            <label
              key={symptom.id}
              className="flex flex-col items-center gap-2 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
            >
              <img
                src={symptom.image}
                alt={symptom.label}
                className="w-12 h-12 rounded-full object-cover"
              />
              <span className="text-xs font-medium text-center">
                {symptom.label}
              </span>
              <Checkbox
                checked={selectedSymptoms.includes(symptom.id)}
                onCheckedChange={() => handleSymptomToggle(symptom.id)}
              />
            </label>
          ))}
        </div>
      </div>

      <Button
        onClick={handleSave}
        className="w-full"
        style={{ backgroundColor: '#EC4899', borderRadius: '12px' }}
      >
        Save Symptoms
      </Button>
    </div>
  );
};