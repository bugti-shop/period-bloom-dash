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
import { StressSymptomCorrelation } from "@/components/StressSymptomCorrelation";
import { PMSSeverityPredictor } from "@/components/PMSSeverityPredictor";
import { SymptomsChecker } from "@/components/SymptomsChecker";
import { SymptomReminders } from "@/components/SymptomReminders";
import { FileDown } from "lucide-react";
import intimacyImg from "@/assets/tracker-intimacy.jpg";
import bbtImg from "@/assets/tracker-bbt.jpg";
import appetiteImg from "@/assets/tracker-appetite.jpg";
import healthImg from "@/assets/tracker-health.jpg";
import waterImg from "@/assets/tracker-water.jpg";
import sleepImg from "@/assets/tracker-sleep.jpg";
import exerciseImg from "@/assets/tracker-exercise.jpg";
import cervicalImg from "@/assets/tracker-cervical.jpg";
import stressImg from "@/assets/tracker-stress.jpg";
import digestiveImg from "@/assets/tracker-digestive.jpg";
import {
  saveSymptomLog,
  getSymptomsForDate,
  getSymptomDates,
} from "@/lib/symptomLog";
import { loadFromLocalStorage } from "@/lib/storage";
import { loadSectionVisibility } from "@/lib/sectionVisibility";
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
  const [visibility] = useState(() => loadSectionVisibility());
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

          {/* Stress & Symptom Correlation */}
          <StressSymptomCorrelation />

          {/* PMS Severity Predictor */}
          {periodData && (
            <PMSSeverityPredictor 
              lastPeriodDate={periodData.lastPeriodDate}
              cycleLength={periodData.cycleLength}
            />
          )}

          {/* Symptoms Checker */}
          {visibility.symptomsChecker && <SymptomsChecker />}

          {/* Symptom Reminders */}
          <SymptomReminders />

          {/* Tracker Cards with Images */}
          <div className="grid grid-cols-2 gap-4">
            {/* Intimacy Tracker Card */}
            {visibility.intimacy && (
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
            )}

            {/* BBT Tracker Card */}
            {visibility.bbt && (
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
            )}

            {/* Appetite Tracker Card */}
            {visibility.appetite && (
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
            )}

            {/* Health Tracker Card */}
            {visibility.health && (
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
            )}

            {/* Water Intake Tracker Card */}
            <div 
              className="relative rounded-2xl overflow-hidden shadow-md cursor-pointer h-48 group"
              onClick={() => navigate('/water')}
            >
              <img 
                src={waterImg} 
                alt="Water Intake Tracker" 
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-4 text-white">
                <h3 className="text-xl font-bold mb-1">Water Intake</h3>
                <p className="text-sm opacity-90">Track Hydration</p>
              </div>
            </div>

            {/* Sleep Quality Tracker Card */}
            <div 
              className="relative rounded-2xl overflow-hidden shadow-md cursor-pointer h-48 group"
              onClick={() => navigate('/sleep')}
            >
              <img 
                src={sleepImg} 
                alt="Sleep Quality Tracker" 
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-4 text-white">
                <h3 className="text-xl font-bold mb-1">Sleep Quality</h3>
                <p className="text-sm opacity-90">Track Sleep</p>
              </div>
            </div>

            {/* Exercise Tracker Card */}
            <div 
              className="relative rounded-2xl overflow-hidden shadow-md cursor-pointer h-48 group"
              onClick={() => navigate('/exercise')}
            >
              <img 
                src={exerciseImg} 
                alt="Exercise Tracker" 
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-4 text-white">
                <h3 className="text-xl font-bold mb-1">Exercise</h3>
                <p className="text-sm opacity-90">Log Activity</p>
              </div>
            </div>

            {/* Cervical Mucus Tracker Card */}
            <div 
              className="relative rounded-2xl overflow-hidden shadow-md cursor-pointer h-48 group"
              onClick={() => navigate('/cervical-mucus')}
            >
              <img 
                src={cervicalImg} 
                alt="Cervical Mucus Tracker" 
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-4 text-white">
                <h3 className="text-xl font-bold mb-1">Cervical Mucus</h3>
                <p className="text-sm opacity-90">Track Fertility</p>
              </div>
            </div>

            {/* Stress Level Tracker Card */}
            <div 
              className="relative rounded-2xl overflow-hidden shadow-md cursor-pointer h-48 group"
              onClick={() => navigate('/stress')}
            >
              <img 
                src={stressImg} 
                alt="Stress Level Tracker" 
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-4 text-white">
                <h3 className="text-xl font-bold mb-1">Stress Level</h3>
                <p className="text-sm opacity-90">Track Stress</p>
              </div>
            </div>

            {/* Digestive Health Tracker Card */}
            <div 
              className="relative rounded-2xl overflow-hidden shadow-md cursor-pointer h-48 group"
              onClick={() => navigate('/digestive')}
            >
              <img 
                src={digestiveImg} 
                alt="Digestive Health Tracker" 
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-4 text-white">
                <h3 className="text-xl font-bold mb-1">Digestive Health</h3>
                <p className="text-sm opacity-90">Track Digestion</p>
              </div>
            </div>

            {/* Period Product Tracker Card */}
            <div 
              className="relative rounded-2xl overflow-hidden shadow-md cursor-pointer h-48 group"
              onClick={() => navigate('/period-product')}
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center">
                <span className="text-6xl">🩸</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-4 text-white">
                <h3 className="text-xl font-bold mb-1">Period Products</h3>
                <p className="text-sm opacity-90">Usage & Cost</p>
              </div>
            </div>

            {/* Weight Tracker Card */}
            <div 
              className="relative rounded-2xl overflow-hidden shadow-md cursor-pointer h-48 group"
              onClick={() => navigate('/weight')}
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                <span className="text-6xl">⚖️</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-4 text-white">
                <h3 className="text-xl font-bold mb-1">Weight Tracker</h3>
                <p className="text-sm opacity-90">Monitor Trends</p>
              </div>
            </div>

            {/* Birth Control Pill Reminder Card */}
            <div 
              className="relative rounded-2xl overflow-hidden shadow-md cursor-pointer h-48 group"
              onClick={() => navigate('/birth-control')}
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <span className="text-6xl">💊</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-4 text-white">
                <h3 className="text-xl font-bold mb-1">Birth Control</h3>
                <p className="text-sm opacity-90">Daily Reminders</p>
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
