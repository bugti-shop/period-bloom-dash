import { useState, useEffect } from "react";
import { addDays, format } from "date-fns";
import { PeriodForm } from "@/components/PeriodForm";
import { savePeriodHistory } from "@/lib/periodHistory";
import { saveToLocalStorage, loadFromLocalStorage } from "@/lib/storage";
import { InfoCards } from "@/components/InfoCards";
import { StickyNotes } from "@/components/StickyNotes";
import { BottomNav } from "@/components/BottomNav";
import { Header } from "@/components/Header";
import { PeriodCalendar } from "@/components/PeriodCalendar";
import { SymptomInsights } from "@/components/SymptomInsights";
import { UnifiedDashboard } from "@/components/UnifiedDashboard";
import { schedulePeriodReminder } from "@/lib/notifications";
import { CycleEntry } from "@/lib/irregularCycle";
import { PartnerClaimDialog } from "@/components/PartnerClaimDialog";
import { trackUserAction, UserActions } from "@/lib/referralTracking";
import { useRewardNotifications } from "@/hooks/useRewardNotifications";
import { CampaignBanner } from "@/components/CampaignBanner";

import { SymptomsPage } from "@/pages/SymptomsPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { HistoryPage } from "@/pages/HistoryPage";
import { ToolsPage } from "@/pages/ToolsPage";
import { PregnancyTracker } from "@/components/PregnancyTracker";
import { loadPregnancyMode } from "@/lib/pregnancyMode";
import { ArticlesPage } from "@/pages/ArticlesPage";
import floralDecoration from "@/assets/floral-decoration.png";

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
  const [periodData, setPeriodData] = useState<PeriodData | null>(null);
  const [activeTab, setActiveTab] = useState<"home" | "symptoms" | "settings" | "tools">("home");
  const [selectedMonth, setSelectedMonth] = useState<Date | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [isArticlesMode, setIsArticlesMode] = useState(false);
  const pregnancyMode = loadPregnancyMode();

  // Enable reward notifications
  useRewardNotifications();

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
        
        // Schedule notifications
        const nextPeriodDate = addDays(data.lastPeriodDate, data.cycleLength);
        schedulePeriodReminder(nextPeriodDate, data.cycleLength);
      } else if (savedData.cycleType === 'irregular' && savedData.cycles && Array.isArray(savedData.cycles) && savedData.cycles.length > 0) {
        // Irregular cycle with valid data
        const data = {
          ...savedData,
          cycles: savedData.cycles.map(c => ({
            ...c,
            startDate: new Date(c.startDate),
            endDate: new Date(c.endDate)
          }))
        };
        setPeriodData(data);
        
        // Schedule notification using mean cycle length
        const lastCycle = data.cycles[data.cycles.length - 1];
        const nextPeriodDate = addDays(lastCycle.endDate, data.mean);
        schedulePeriodReminder(nextPeriodDate, data.mean);
      }
      // If data is invalid or incomplete, don't set it (will show form)
    }
  }, []);

  const handleFormSubmit = (data: PeriodData) => {
    setPeriodData(data);
    
    const isFirstLog = !loadFromLocalStorage("current-period-data");
    
    if (data.cycleType === 'regular') {
      savePeriodHistory({
        lastPeriodDate: data.lastPeriodDate,
        cycleLength: data.cycleLength,
        periodDuration: data.periodDuration
      });
    }
    
    saveToLocalStorage("current-period-data", data);
    
    // Track first period log for referral rewards
    if (isFirstLog) {
      trackUserAction(UserActions.FIRST_PERIOD_LOG);
    }
    
    // Schedule notifications
    if (data.cycleType === 'regular') {
      const nextPeriodDate = addDays(data.lastPeriodDate, data.cycleLength);
      schedulePeriodReminder(nextPeriodDate, data.cycleLength);
    } else {
      const lastCycle = data.cycles[data.cycles.length - 1];
      const nextPeriodDate = addDays(lastCycle.endDate, data.mean);
      schedulePeriodReminder(nextPeriodDate, data.mean);
    }
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
      // For irregular cycles, calculate based on predicted range
      const lastCycle = periodData.cycles[periodData.cycles.length - 1];
      const avgDuration = Math.round(
        periodData.cycles.reduce((sum, c) => sum + c.periodDuration, 0) / periodData.cycles.length
      );
      
      // Use mean for single prediction
      const nextPeriodStart = addDays(lastCycle.endDate, periodData.mean);
      const dates: Date[] = [];
      
      for (let i = 0; i < avgDuration; i++) {
        dates.push(addDays(nextPeriodStart, i));
      }
      
      return dates;
    }
  };

  const periodDates = calculatePeriodDates();

  // Check if pregnancy mode is active
  if (pregnancyMode.isPregnancyMode && pregnancyMode.lastPeriodDate) {
    return <PregnancyTracker lastPeriodDate={pregnancyMode.lastPeriodDate} />;
  }

  // Render different pages based on active tab
  if (!periodData) {
    return (
      <div className="min-h-screen bg-white pb-20">
        <Header 
          showArticlesToggle={true} 
          onArticlesToggle={() => setIsArticlesMode(true)}
          isArticlesMode={false}
        />
        <CampaignBanner />
        <div className="max-w-7xl mx-auto py-6 px-4">
          <div className="max-w-md mx-auto">
            <header className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2 tracking-tight">
                Period Tracker
              </h2>
              <p className="text-base text-muted-foreground">
                Track your cycle, understand your body
              </p>
            </header>
            <PeriodForm onSubmit={handleFormSubmit} />
          </div>
        </div>
      </div>
    );
  }

  if (showHistory) {
    return <HistoryPage onBack={() => setShowHistory(false)} />;
  }

  // Show Articles Page
  if (isArticlesMode) {
    return (
      <div className="min-h-screen bg-white">
        <Header 
          showArticlesToggle={true} 
          onArticlesToggle={() => setIsArticlesMode(false)}
          isArticlesMode={true}
        />
        <ArticlesPage />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header 
        showArticlesToggle={true} 
        onArticlesToggle={() => setIsArticlesMode(true)}
        isArticlesMode={false}
      />
      
      {/* Render content based on active tab */}
      {activeTab === "home" && (
        <div className="max-w-7xl mx-auto py-3 px-3 pb-20">
          <CampaignBanner />
          <div className="space-y-4">
            {/* Floral Calendar Header */}
            <div className="relative bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl overflow-hidden">
              <div className="absolute inset-0 opacity-70">
                <img 
                  src={floralDecoration} 
                  alt="" 
                  className="w-full h-full object-cover scale-110"
                />
              </div>
              
              <div className="relative px-4 py-4">
                <div className="text-center mb-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">TODAY</p>
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">
                    {format(new Date(), "MMMM d")}
                  </h1>
                  <p className="text-lg text-gray-700">{format(new Date(), "yyyy")}</p>
                </div>
              </div>
            </div>

            {/* Period Calendar */}
            <PeriodCalendar 
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

            {/* Confidence Score for Irregular Cycles */}
            {periodData.cycleType === 'irregular' && (
              <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Prediction Confidence</p>
                    <p className="text-2xl font-bold text-primary">{periodData.confidence}%</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Based on {periodData.cycles.length} cycles • SD: {periodData.stdDev.toFixed(1)} days
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground mb-1">Avg Cycle Length</p>
                    <p className="text-xl font-semibold text-foreground">{periodData.mean} days</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Range: {periodData.mean - Math.round(periodData.stdDev * 1.5)}-{periodData.mean + Math.round(periodData.stdDev * 1.5)} days
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Info Cards - 2 Column Grid */}
            <InfoCards 
              periodData={periodData} 
              displayMonth={selectedMonth || undefined} 
            />

            {/* Symptom Insights */}
            {periodData.cycleType === 'regular' && (
              <SymptomInsights 
                lastPeriodDate={periodData.lastPeriodDate}
                cycleLength={periodData.cycleLength}
              />
            )}

            {/* Unified Dashboard */}
            <UnifiedDashboard />

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setPeriodData(null);
                  localStorage.removeItem("current-period-data");
                }}
                className="py-3.5 font-semibold text-white text-[13px] transition-colors"
                style={{ backgroundColor: '#EC4899', borderRadius: '11px' }}
              >
                Update Periods
              </button>
              <button
                onClick={() => setShowHistory(true)}
                className="py-3.5 font-semibold transition-colors text-[13px]"
                style={{ backgroundColor: '#E5E7EB', color: '#1F2937', borderRadius: '11px' }}
              >
                Periods History
              </button>
            </div>

            {/* Sticky Notes Section */}
            <StickyNotes currentWeek={undefined} />
          </div>
        </div>
      )}

      {activeTab === "symptoms" && (
        <SymptomsPage />
      )}

      {activeTab === "settings" && (
        <SettingsPage />
      )}

      {activeTab === "tools" && (
        <ToolsPage />
      )}
      
      {/* Partner Claim Dialog */}
      <PartnerClaimDialog />
      
      {/* Bottom Navigation */}
      <BottomNav 
        activeTab={activeTab as "home" | "symptoms" | "tools" | "settings"} 
        onTabChange={handleTabChange} 
      />
    </div>
  );
};

export default Index;
