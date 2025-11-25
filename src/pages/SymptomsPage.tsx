import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PeriodCalendar } from "@/components/PeriodCalendar";
import { SymptomCategoryPicker } from "@/components/SymptomCategoryPicker";
import { DateStickyNotes } from "@/components/DateStickyNotes";
import { VoiceNotes } from "@/components/VoiceNotes";
import { PhotoLogger } from "@/components/PhotoLogger";
import { SymptomStatistics } from "@/components/SymptomStatistics";
import { SymptomHistoryPage } from "@/pages/SymptomHistoryPage";
import { generateSymptomPDF } from "@/lib/symptomPdfExport";
import { MoodTracker } from "@/components/MoodTracker";
import { MoodSymptomCorrelation } from "@/components/MoodSymptomCorrelation";
import { SymptomsChecker } from "@/components/SymptomsChecker";
import { SymptomPatternPredictor } from "@/components/SymptomPatternPredictor";
import { SymptomReminders } from "@/components/SymptomReminders";
import { FileDown } from "lucide-react";
import intimacyImg from "@/assets/tracker-intimacy.jpg";
import bbtImg from "@/assets/tracker-bbt.jpg";
import appetiteImg from "@/assets/tracker-appetite.jpg";
import healthImg from "@/assets/tracker-health.jpg";
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
  const navigate = useNavigate();
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
    <div className="max-w-7xl mx-auto px-4 py-6 pb-20">
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
              onClick={generateSymptomPDF}
              className="py-4 rounded-xl font-semibold text-xs bg-purple-500 text-white hover:bg-purple-600"
            >
              <FileDown className="w-4 h-4 mr-1" />
              PDF
            </Button>
          </div>

          {/* Mood Tracker */}
          <MoodTracker selectedDate={selectedDate} />

          {/* Mood & Symptom Correlation */}
          <MoodSymptomCorrelation />

          {/* Symptoms Checker */}
          <SymptomsChecker />

          {/* ML Pattern Predictor */}
          <SymptomPatternPredictor />

          {/* Symptom Reminders */}
          <SymptomReminders />

          {/* Tracker Cards with Images */}
          <div className="grid grid-cols-2 gap-4">
            {/* Intimacy Tracker Card */}
            <div 
              className="relative rounded-2xl overflow-hidden shadow-md cursor-pointer h-48 group"
              onClick={() => navigate('/intimacy')}
            >
              <img 
                src={intimacyImg} 
                alt="Intimacy Tracker" 
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-4 text-white">
                <h3 className="text-xl font-bold mb-1">Intimacy</h3>
                <p className="text-sm opacity-90">Track</p>
              </div>
            </div>

            {/* BBT Tracker Card */}
            <div 
              className="relative rounded-2xl overflow-hidden shadow-md cursor-pointer h-48 group"
              onClick={() => navigate('/bbt')}
            >
              <img 
                src={bbtImg} 
                alt="BBT Tracker" 
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-4 text-white">
                <h3 className="text-xl font-bold mb-1">BBT</h3>
                <p className="text-sm opacity-90">Monitor</p>
              </div>
            </div>

            {/* Appetite Tracker Card */}
            <div 
              className="relative rounded-2xl overflow-hidden shadow-md cursor-pointer h-48 group"
              onClick={() => navigate('/appetite')}
            >
              <img 
                src={appetiteImg} 
                alt="Appetite Tracker" 
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-4 text-white">
                <h3 className="text-xl font-bold mb-1">Appetite</h3>
                <p className="text-sm opacity-90">Log</p>
              </div>
            </div>

            {/* Health Tracker Card */}
            <div 
              className="relative rounded-2xl overflow-hidden shadow-md cursor-pointer h-48 group"
              onClick={() => navigate('/health')}
            >
              <img 
                src={healthImg} 
                alt="Health Tracker" 
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-4 text-white">
                <h3 className="text-xl font-bold mb-1">Health</h3>
                <p className="text-sm opacity-90">Monitor</p>
              </div>
            </div>
          </div>

          {/* Statistics Dashboard */}
          <SymptomStatistics />

          {/* Voice Notes, Photos and Sticky Notes */}
          <DateStickyNotes selectedDate={selectedDate} />
          <VoiceNotes selectedDate={selectedDate} />
          <PhotoLogger selectedDate={selectedDate} />
        </div>
    </div>
  );
};
