import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, Baby, Calendar as CalendarIcon, Edit2, Check } from "lucide-react";
import { saveToLocalStorage, loadFromLocalStorage } from "@/lib/storage";
import { z } from "zod";

const symptomLabelSchema = z.string()
  .trim()
  .min(1, "Label cannot be empty")
  .max(50, "Label must be 50 characters or less");
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

const defaultSymptoms = [
  { id: "cramps", label: "Cramps", pregnancyScore: 1, periodScore: 3, image: crampImg },
  { id: "bloating", label: "Bloating", pregnancyScore: 2, periodScore: 3, image: bloatingImg },
  { id: "tender-breasts", label: "Tender Breasts", pregnancyScore: 3, periodScore: 2, image: tenderBreastsImg },
  { id: "fatigue", label: "Fatigue", pregnancyScore: 3, periodScore: 2, image: fatigueImg },
  { id: "nausea", label: "Nausea", pregnancyScore: 4, periodScore: 1, image: nauseaImg },
  { id: "mood-swings", label: "Mood Swings", pregnancyScore: 2, periodScore: 3, image: moodSwingsImg },
  { id: "headache", label: "Headache", pregnancyScore: 2, periodScore: 2, image: headacheImg },
  { id: "spotting", label: "Light Spotting", pregnancyScore: 3, periodScore: 2, image: spottingImg },
  { id: "food-cravings", label: "Food Cravings", pregnancyScore: 2, periodScore: 2, image: foodCravingsImg },
  { id: "backache", label: "Back Pain", pregnancyScore: 2, periodScore: 3, image: backacheImg },
];

export const SymptomsChecker = () => {
  const [symptoms, setSymptoms] = useState(defaultSymptoms);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [result, setResult] = useState<{ type: "pregnancy" | "period" | null; message: string } | null>(null);
  const [editingSymptom, setEditingSymptom] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");

  useEffect(() => {
    const savedSymptoms = loadFromLocalStorage<typeof defaultSymptoms>("custom-symptoms");
    if (savedSymptoms) {
      setSymptoms(savedSymptoms);
    }
  }, []);

  useEffect(() => {
    saveToLocalStorage("custom-symptoms", symptoms);
  }, [symptoms]);

  const handleRenameSymptom = (symptomId: string, newLabel: string) => {
    const result = symptomLabelSchema.safeParse(newLabel);
    if (!result.success) {
      return;
    }
    
    setSymptoms(
      symptoms.map((s) =>
        s.id === symptomId ? { ...s, label: newLabel.trim() } : s
      )
    );
    setEditingSymptom(null);
    setEditLabel("");
  };

  const startEditing = (symptomId: string, currentLabel: string) => {
    setEditingSymptom(symptomId);
    setEditLabel(currentLabel);
  };

  const handleSymptomToggle = (symptomId: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptomId)
        ? prev.filter((id) => id !== symptomId)
        : [...prev, symptomId]
    );
    setResult(null);
  };

  const analyzeSymptoms = () => {
    if (selectedSymptoms.length === 0) {
      setResult({
        type: null,
        message: "Please select at least one symptom to analyze.",
      });
      return;
    }

    let pregnancyScore = 0;
    let periodScore = 0;

    selectedSymptoms.forEach((symptomId) => {
      const symptom = symptoms.find((s) => s.id === symptomId);
      if (symptom) {
        pregnancyScore += symptom.pregnancyScore;
        periodScore += symptom.periodScore;
      }
    });

    if (pregnancyScore > periodScore) {
      setResult({
        type: "pregnancy",
        message: "Your symptoms may indicate early pregnancy. Consider taking a pregnancy test for confirmation.",
      });
    } else {
      setResult({
        type: "period",
        message: "Your symptoms suggest your period might be starting soon. Stay prepared!",
      });
    }
  };

  return (
    <div className="glass-card p-8 rounded-3xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-primary/20 rounded-2xl">
          <AlertCircle className="w-6 h-6 text-primary" />
        </div>
        <h3 className="text-2xl font-semibold text-foreground whitespace-nowrap">Symptom Checker</h3>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {symptoms.map((symptom) => (
          <div
            key={symptom.id}
            className="relative flex flex-col items-center gap-2 bg-white/60 p-3 rounded-xl hover:bg-white/80 transition-colors"
          >
            <button
              onClick={() => startEditing(symptom.id, symptom.label)}
              className="absolute top-2 right-2 p-1 bg-white/80 rounded-full hover:bg-white transition-colors"
              title="Rename symptom"
            >
              <Edit2 className="w-3 h-3 text-primary" />
            </button>
            
            <label
              htmlFor={symptom.id}
              className="flex flex-col items-center gap-2 cursor-pointer w-full"
            >
              <img 
                src={symptom.image} 
                alt={symptom.label}
                className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                loading="eager"
              />
              
              {editingSymptom === symptom.id ? (
                <div className="flex items-center gap-1 w-full">
                  <input
                    type="text"
                    value={editLabel}
                    maxLength={50}
                    onChange={(e) => setEditLabel(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleRenameSymptom(symptom.id, editLabel);
                      } else if (e.key === "Escape") {
                        setEditingSymptom(null);
                        setEditLabel("");
                      }
                    }}
                    className="text-xs font-medium text-foreground text-center bg-white px-2 py-1 rounded border border-primary flex-1"
                    autoFocus
                  />
                  <button
                    onClick={() => handleRenameSymptom(symptom.id, editLabel)}
                    className="p-1 bg-primary text-white rounded hover:bg-primary/90"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <span className="text-xs font-medium text-foreground text-center">
                  {symptom.label}
                </span>
              )}
              
              <Checkbox
                id={symptom.id}
                checked={selectedSymptoms.includes(symptom.id)}
                onCheckedChange={() => handleSymptomToggle(symptom.id)}
                className="border-primary data-[state=checked]:bg-primary flex-shrink-0"
              />
            </label>
          </div>
        ))}
      </div>

      <Button
        onClick={analyzeSymptoms}
        disabled={selectedSymptoms.length === 0}
        variant="pill"
        size="pill"
        className="w-full"
      >
        Analyze Symptoms
      </Button>

      {result && (
        <div
          className={`mt-6 p-6 rounded-2xl ${
            result.type === "pregnancy"
              ? "bg-accent/20 border-2 border-accent"
              : result.type === "period"
              ? "bg-primary/20 border-2 border-primary"
              : "bg-muted/50"
          }`}
        >
          <div className="flex items-start gap-3">
            {result.type === "pregnancy" ? (
              <Baby className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
            ) : result.type === "period" ? (
              <CalendarIcon className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
            ) : (
              <AlertCircle className="w-6 h-6 text-muted-foreground flex-shrink-0 mt-1" />
            )}
            <div>
              <h4 className="font-semibold text-foreground mb-2">
                {result.type === "pregnancy"
                  ? "Possible Pregnancy"
                  : result.type === "period"
                  ? "Period Coming Soon"
                  : "Analysis Result"}
              </h4>
              <p className="text-sm text-foreground/80">{result.message}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Note: This is not medical advice. Consult a healthcare professional for accurate diagnosis.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
