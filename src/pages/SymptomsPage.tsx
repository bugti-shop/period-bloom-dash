import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { PeriodCalendar } from "@/components/PeriodCalendar";
import { SymptomCategoryPicker } from "@/components/SymptomCategoryPicker";
import { DateStickyNotes } from "@/components/DateStickyNotes";
import { HealthTracker } from "@/components/HealthTracker";
import { VoiceNotes } from "@/components/VoiceNotes";
import { PhotoLogger } from "@/components/PhotoLogger";
import { SymptomStatistics } from "@/components/SymptomStatistics";
import { SymptomHistoryPage } from "@/pages/SymptomHistoryPage";
import { generateSymptomReport } from "@/lib/symptomReport";
import { MoodTracker } from "@/components/MoodTracker";
import { MoodSymptomCorrelation } from "@/components/MoodSymptomCorrelation";
import { IntimacyTracker } from "@/components/IntimacyTracker";
import { BBTTracker } from "@/components/BBTTracker";
import { AppetiteTracker } from "@/components/AppetiteTracker";
import { FileDown } from "lucide-react";
import {
  saveSymptomLog,
  getSymptomsForDate,
  getSymptomDates,
} from "@/lib/symptomLog";
import { loadFromLocalStorage } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { addDays } from "date-fns";

interface PeriodData {
  lastPeriodDate: Date;
  cycleLength: number;
  periodDuration: number;
}

export const SymptomsPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [periodData, setPeriodData] = useState<PeriodData | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const savedData = loadFromLocalStorage<PeriodData>("current-period-data");
    if (savedData) {
      setPeriodData({
        ...savedData,
        lastPeriodDate: new Date(savedData.lastPeriodDate),
      });
    }
  }, []);

  useEffect(() => {
    // Load symptoms for selected date
    const symptoms = getSymptomsForDate(selectedDate);
    setSelectedSymptoms(symptoms);
  }, [selectedDate]);

  const handleSymptomToggle = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom)
        ? prev.filter((s) => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleSave = () => {
    saveSymptomLog(selectedDate, selectedSymptoms);
    toast({
      title: "Symptoms saved",
      description: `Saved ${selectedSymptoms.length} symptoms for ${format(
        selectedDate,
        "MMM dd, yyyy"
      )}`,
    });
  };

  const symptomDates = getSymptomDates();

  // Calculate period dates for calendar highlighting
  const calculatePeriodDates = () => {
    if (!periodData) return [];
    const nextPeriodStart = addDays(
      periodData.lastPeriodDate,
      periodData.cycleLength
    );
    const dates: Date[] = [];
    for (let i = 0; i < periodData.periodDuration; i++) {
      dates.push(addDays(nextPeriodStart, i));
    }
    return dates;
  };

  const periodDates = calculatePeriodDates();

  if (showHistory) {
    return <SymptomHistoryPage onBack={() => setShowHistory(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <header className="text-center mb-6">
          <h2 className="text-3xl font-bold mb-2">Symptoms Tracking</h2>
          <p className="text-gray-600">Track your symptoms by date</p>
        </header>

        <div className="space-y-4">
          {/* Period Calendar */}
          {periodData && (
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <PeriodCalendar
                periodDates={periodDates}
                cycleLength={periodData.cycleLength}
                lastPeriodDate={periodData.lastPeriodDate}
                periodDuration={periodData.periodDuration}
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                symptomDates={symptomDates}
              />
            </div>
          )}

          {/* Selected Date Display */}
          <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-xl p-4 text-center">
            <p className="text-sm text-gray-600 mb-1">Logging symptoms for</p>
            <h3 className="text-xl font-bold text-gray-900">
              {format(selectedDate, "EEEE, MMMM d, yyyy")}
            </h3>
            {selectedSymptoms.length > 0 && (
              <p className="text-sm text-pink-600 mt-1">
                {selectedSymptoms.length} symptom
                {selectedSymptoms.length !== 1 ? "s" : ""} selected
              </p>
            )}
          </div>

          {/* Symptom Categories */}
          <SymptomCategoryPicker
            selectedSymptoms={selectedSymptoms}
            onSymptomToggle={handleSymptomToggle}
          />

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-3">
            <Button
              onClick={handleSave}
              className="py-4 rounded-xl font-semibold text-white text-xs"
              style={{ backgroundColor: "#EC4899" }}
            >
              Save Symptoms
            </Button>
            <Button
              onClick={() => setShowHistory(true)}
              className="py-4 rounded-xl font-semibold text-xs bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
            >
              History
            </Button>
            <Button
              onClick={generateSymptomReport}
              className="py-4 rounded-xl font-semibold text-xs bg-purple-500 text-white hover:bg-purple-600"
            >
              <FileDown className="w-4 h-4 mr-1" />
              Report
            </Button>
          </div>

          {/* Mood Tracker */}
          <MoodTracker selectedDate={selectedDate} />

          {/* Mood & Symptom Correlation */}
          <MoodSymptomCorrelation />

          {/* Intimacy, BBT, and Appetite Trackers */}
          <IntimacyTracker />
          <BBTTracker />
          <AppetiteTracker />

          {/* Statistics Dashboard */}
          <SymptomStatistics />

          {/* Health Tracker, Voice Notes, Photos and Sticky Notes */}
          <div className="grid md:grid-cols-2 gap-4">
            <HealthTracker selectedDate={selectedDate} />
            <DateStickyNotes selectedDate={selectedDate} />
          </div>
          
          <VoiceNotes selectedDate={selectedDate} />
          <PhotoLogger selectedDate={selectedDate} />
        </div>
      </div>
    </div>
  );
};
