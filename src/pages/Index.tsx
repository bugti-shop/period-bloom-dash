import { useState, useEffect } from "react";
import { addDays } from "date-fns";
import { useNavigate, useLocation } from "react-router-dom";
import { PeriodForm } from "@/components/PeriodForm";
import { savePeriodHistory } from "@/lib/periodHistory";
import { saveToLocalStorage, loadFromLocalStorage } from "@/lib/storage";
import { StickyNotes } from "@/components/StickyNotes";
import { SymptomInsights } from "@/components/SymptomInsights";
import { initializeAllNotifications } from "@/lib/notificationInit";
import { CycleEntry } from "@/lib/irregularCycle";

import { SymptomsPage } from "@/pages/SymptomsPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { HistoryPage } from "@/pages/HistoryPage";
import { ToolsPage } from "@/pages/ToolsPage";
import { PregnancyTracker } from "@/components/PregnancyTracker";
import { loadPregnancyMode } from "@/lib/pregnancyMode";
import { CycleInsightsPage } from "@/pages/CycleInsightsPage";
import { loadSectionVisibility } from "@/lib/sectionVisibility";
import { Paywall } from "@/components/Paywall";
import { hasStartedTrial, startTrial } from "@/lib/trialStorage";

// Modern UI Components
import { ModernHeader } from "@/components/ModernHeader";
import { ModernBottomNav } from "@/components/ModernBottomNav";
import { QuickActionsBar } from "@/components/QuickActionsBar";
import { CycleStatusCard } from "@/components/CycleStatusCard";
import { ModernCalendar } from "@/components/ModernCalendar";
import { ModernInfoCards } from "@/components/ModernInfoCards";
import { HealthFeaturesSection } from "@/components/HealthFeaturesSection";
import { ActionButtons } from "@/components/ActionButtons";

interface RegularPeriodData {
  cycleType: 'regular';
  lastPeriodDate: Date;
  cycleLength: number;
  periodDuration: number;
}

interface IrregularPeriodData {
  cycleType: 'irregular';
  cycles: CycleEntry[];
  mean: number;
  stdDev: number;
  confidence: number;
}

type PeriodData = RegularPeriodData | IrregularPeriodData;

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [periodData, setPeriodData] = useState<PeriodData | null>(null);
  const [activeTab, setActiveTab] = useState<"home" | "symptoms" | "settings" | "tools">(
    (location.state as { activeTab?: "home" | "symptoms" | "settings" | "tools" })?.activeTab || "home"
  );
  const [selectedMonth, setSelectedMonth] = useState<Date | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showCycleInsights, setShowCycleInsights] = useState(false);
  const [trialStarted, setTrialStarted] = useState(hasStartedTrial());
  const pregnancyMode = loadPregnancyMode();
  const visibility = loadSectionVisibility();

  const handleStartTrial = () => {
    startTrial();
    setTrialStarted(true);
  };

  // Load saved period data on mount
  useEffect(() => {
    const savedData = loadFromLocalStorage<PeriodData>("current-period-data");
    if (savedData) {
      if (savedData.cycleType === 'regular') {
        const data = {
          ...savedData,
          lastPeriodDate: new Date(savedData.lastPeriodDate),
        };
        setPeriodData(data);
        initializeAllNotifications();
      } else if (savedData.cycleType === 'irregular' && savedData.cycles && Array.isArray(savedData.cycles) && savedData.cycles.length > 0) {
        const data = {
          ...savedData,
          cycles: savedData.cycles.map(c => ({
            ...c,
            startDate: new Date(c.startDate),
            endDate: new Date(c.endDate)
          }))
        };
        setPeriodData(data);
        initializeAllNotifications();
      }
    }
  }, []);

  const handleFormSubmit = (data: PeriodData) => {
    setPeriodData(data);
    
    if (data.cycleType === 'regular') {
      savePeriodHistory({
        lastPeriodDate: data.lastPeriodDate,
        cycleLength: data.cycleLength,
        periodDuration: data.periodDuration
      });
    }
    
    saveToLocalStorage("current-period-data", data);
    initializeAllNotifications();
  };

  const handleTabChange = (tab: "home" | "symptoms" | "settings" | "tools") => {
    setActiveTab(tab);
  };

  const handleMonthChange = (month: Date) => {
    setSelectedMonth(month);
  };

  const calculatePeriodDates = () => {
    if (!periodData) return [];
    
    if (periodData.cycleType === 'regular') {
      const nextPeriodStart = addDays(periodData.lastPeriodDate, periodData.cycleLength);
      const dates: Date[] = [];
      
      for (let i = 0; i < periodData.periodDuration; i++) {
        dates.push(addDays(nextPeriodStart, i));
      }
      
      return dates;
    } else {
      const lastCycle = periodData.cycles[periodData.cycles.length - 1];
      const avgDuration = Math.round(
        periodData.cycles.reduce((sum, c) => sum + c.periodDuration, 0) / periodData.cycles.length
      );
      
      const nextPeriodStart = addDays(lastCycle.endDate, periodData.mean);
      const dates: Date[] = [];
      
      for (let i = 0; i < avgDuration; i++) {
        dates.push(addDays(nextPeriodStart, i));
      }
      
      return dates;
    }
  };

  const periodDates = calculatePeriodDates();

  // Show paywall if trial hasn't started
  if (!trialStarted) {
    return <Paywall onStartTrial={handleStartTrial} />;
  }

  // Check if pregnancy mode is active
  if (pregnancyMode.isPregnancyMode && pregnancyMode.lastPeriodDate) {
    return <PregnancyTracker lastPeriodDate={pregnancyMode.lastPeriodDate} />;
  }

  // Show Period Form if no data
  if (!periodData) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <ModernHeader />
        <div className="max-w-lg mx-auto py-8 px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Welcome to Lufi
            </h2>
            <p className="text-muted-foreground">
              Track your cycle, understand your body
            </p>
          </div>
          <PeriodForm onSubmit={handleFormSubmit} />
        </div>
      </div>
    );
  }

  if (showHistory) {
    return <HistoryPage onBack={() => setShowHistory(false)} />;
  }

  if (showCycleInsights) {
    return <CycleInsightsPage onBack={() => setShowCycleInsights(false)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <ModernHeader />
      
      {/* Render content based on active tab */}
      {activeTab === "home" && (
        <div className="max-w-lg mx-auto py-5 px-5 pb-28">
          <div className="space-y-6">
            {/* Quick Actions */}
            <QuickActionsBar variant="period" />

            {/* Cycle Status Card */}
            <CycleStatusCard periodData={periodData} />

            {/* Confidence Score for Irregular Cycles */}
            {periodData.cycleType === 'irregular' && (
              <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-200/50 rounded-3xl p-5">
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl" />
                <div className="relative flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1.5 tracking-wide uppercase">Prediction Confidence</p>
                    <p className="text-4xl font-bold text-primary tracking-tight">{periodData.confidence}%</p>
                    <p className="text-xs text-muted-foreground mt-1.5">
                      Based on {periodData.cycles.length} cycles
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-muted-foreground mb-1.5 tracking-wide uppercase">Avg Cycle</p>
                    <p className="text-3xl font-bold text-foreground tracking-tight">{periodData.mean}d</p>
                    <p className="text-xs text-muted-foreground mt-1.5">
                      ± {periodData.stdDev.toFixed(1)} days
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Calendar */}
            {visibility.periodCalendar && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-foreground px-1 tracking-wide">Your Calendar</h3>
                <ModernCalendar 
                  periodDates={periodDates}
                  cycleLength={periodData.cycleType === 'regular' ? periodData.cycleLength : periodData.mean}
                  lastPeriodDate={
                    periodData.cycleType === 'regular' 
                      ? periodData.lastPeriodDate 
                      : periodData.cycles[periodData.cycles.length - 1].endDate
                  }
                  periodDuration={
                    periodData.cycleType === 'regular' 
                      ? periodData.periodDuration 
                      : Math.round(periodData.cycles.reduce((sum, c) => sum + c.periodDuration, 0) / periodData.cycles.length)
                  }
                  onMonthChange={handleMonthChange}
                />
              </div>
            )}

            {/* Info Cards */}
            {visibility.periodInfoCards && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-foreground px-1 tracking-wide">Cycle Overview</h3>
                <ModernInfoCards 
                  periodData={periodData} 
                  displayMonth={selectedMonth || undefined} 
                />
              </div>
            )}

            {/* Symptom Insights */}
            {visibility.periodInsights && periodData.cycleType === 'regular' && (
              <SymptomInsights 
                lastPeriodDate={periodData.lastPeriodDate}
                cycleLength={periodData.cycleLength}
              />
            )}

            {/* Action Buttons */}
            <ActionButtons 
              onUpdatePeriod={() => {
                setPeriodData(null);
                localStorage.removeItem("current-period-data");
              }}
              onViewHistory={() => setShowHistory(true)}
              onViewInsights={() => setShowCycleInsights(true)}
            />

            {/* Health Features */}
            <HealthFeaturesSection />

            {/* Sticky Notes */}
            {visibility.periodStickyNotes && <StickyNotes currentWeek={undefined} />}
          </div>
        </div>
      )}

      {activeTab === "symptoms" && <SymptomsPage />}
      {activeTab === "settings" && <SettingsPage />}
      {activeTab === "tools" && <ToolsPage />}
      
      {/* Bottom Navigation */}
      <ModernBottomNav 
        activeTab={activeTab} 
        onTabChange={handleTabChange} 
      />
    </div>
  );
};

export default Index;
