import { useState, useEffect } from "react";
import { addDays, format, differenceInDays } from "date-fns";
import { useNavigate } from "react-router-dom";
import { PeriodForm } from "@/components/PeriodForm";
import { savePeriodHistory } from "@/lib/periodHistory";
import { saveToLocalStorage, loadFromLocalStorage } from "@/lib/storage";
import { InfoCards } from "@/components/InfoCards";
import { StickyNotes } from "@/components/StickyNotes";
import { BottomNav } from "@/components/BottomNav";
import { Header } from "@/components/Header";
import { PeriodCalendar } from "@/components/PeriodCalendar";
import { SymptomInsights } from "@/components/SymptomInsights";
import { Calendar, Heart, Grid3x3, List, TestTube, FileText, Brain, Sparkles } from "lucide-react";
import { schedulePeriodReminder } from "@/lib/notifications";
import { scheduleFertilityReminders } from "@/lib/fertilityNotifications";
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
import floralDecoration from "@/assets/floral-decoration.png";
import { Paywall } from "@/components/Paywall";
import { hasStartedTrial, startTrial } from "@/lib/trialStorage";

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
  const [periodData, setPeriodData] = useState<PeriodData | null>(null);
  const [activeTab, setActiveTab] = useState<"home" | "symptoms" | "settings" | "tools">("home");
  const [selectedMonth, setSelectedMonth] = useState<Date | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showCycleInsights, setShowCycleInsights] = useState(false);
  const [trialStarted, setTrialStarted] = useState(hasStartedTrial());
  const [calendarView, setCalendarView] = useState<'month' | 'list'>('month');
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
        
        // Initialize ALL notifications on app load
        initializeAllNotifications();
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
        
        // Initialize ALL notifications on app load
        initializeAllNotifications();
      }
      // If data is invalid or incomplete, don't set it (will show form)
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
    
    // Initialize ALL notifications after form submit
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

  // Show paywall if trial hasn't started
  if (!trialStarted) {
    return <Paywall onStartTrial={handleStartTrial} />;
  }

  // Check if pregnancy mode is active
  if (pregnancyMode.isPregnancyMode && pregnancyMode.lastPeriodDate) {
    return <PregnancyTracker lastPeriodDate={pregnancyMode.lastPeriodDate} />;
  }

  // Render different pages based on active tab
  if (!periodData) {
    return (
      <div className="min-h-screen bg-white pb-20">
        <Header showArticlesToggle={true} />
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

  if (showCycleInsights) {
    return <CycleInsightsPage onBack={() => setShowCycleInsights(false)} />;
  }

  return (
    <div className="min-h-screen bg-white">
      <Header showArticlesToggle={true} />
      
      {/* Render content based on active tab */}
      {activeTab === "home" && (
        <div className="max-w-7xl mx-auto py-3 px-3 pb-20">
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
                  {(() => {
                    const today = new Date();
                    const nextPeriodDate = periodData.cycleType === 'regular' 
                      ? addDays(periodData.lastPeriodDate, periodData.cycleLength)
                      : addDays(periodData.cycles[periodData.cycles.length - 1].endDate, periodData.mean);
                    const daysUntilPeriod = differenceInDays(nextPeriodDate, today);
                    
                    const ovulationDate = periodData.cycleType === 'regular'
                      ? addDays(periodData.lastPeriodDate, periodData.cycleLength - 14)
                      : addDays(periodData.cycles[periodData.cycles.length - 1].endDate, periodData.mean - 14);
                    const daysUntilOvulation = differenceInDays(ovulationDate, today);
                    
                    return (
                      <>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Next Period</p>
                        <h1 className="text-2xl font-bold text-gray-900 mb-1">
                          {daysUntilPeriod} days
                        </h1>
                        <p className="text-lg text-gray-700">
                          Next Ovulation ({daysUntilOvulation > 0 ? `${daysUntilOvulation} days left` : 'Today or passed'})
                        </p>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Period Calendar with View Switchers */}
            {visibility.periodCalendar && (
              <div className="space-y-3">
                {/* Calendar View Switchers */}
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-sm font-semibold text-foreground">Your Calendar</h3>
                  <div className="flex items-center gap-2 bg-white/80 rounded-lg p-1 shadow-sm border border-gray-200">
                    <button
                      onClick={() => setCalendarView('month')}
                      className={`p-2 rounded-md transition-all ${
                        calendarView === 'month'
                          ? 'bg-[hsl(348,83%,47%)] text-white shadow-sm'
                          : 'text-gray-500 hover:bg-gray-100'
                      }`}
                      aria-label="Month view"
                    >
                      <Grid3x3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCalendarView('list')}
                      className={`p-2 rounded-md transition-all ${
                        calendarView === 'list'
                          ? 'bg-[hsl(348,83%,47%)] text-white shadow-sm'
                          : 'text-gray-500 hover:bg-gray-100'
                      }`}
                      aria-label="List view"
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Calendar Component */}
                {calendarView === 'month' ? (
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
                ) : (
                  <div className="glass-card p-4 rounded-2xl">
                    <h4 className="text-sm font-semibold text-foreground mb-3">Upcoming Events</h4>
                    <div className="space-y-2">
                      {(() => {
                        const today = new Date();
                        const nextPeriodDate = periodData.cycleType === 'regular' 
                          ? addDays(periodData.lastPeriodDate, periodData.cycleLength)
                          : addDays(periodData.cycles[periodData.cycles.length - 1].endDate, periodData.mean);
                        const daysUntilPeriod = differenceInDays(nextPeriodDate, today);
                        
                        const ovulationDate = periodData.cycleType === 'regular'
                          ? addDays(periodData.lastPeriodDate, periodData.cycleLength - 14)
                          : addDays(periodData.cycles[periodData.cycles.length - 1].endDate, periodData.mean - 14);
                        const daysUntilOvulation = differenceInDays(ovulationDate, today);
                        
                        const fertileStart = addDays(ovulationDate, -5);
                        const daysUntilFertile = differenceInDays(fertileStart, today);
                        
                        return (
                          <>
                            {daysUntilFertile > 0 && (
                              <div className="flex items-center gap-3 p-3 bg-[hsl(200,80%,95%)] rounded-lg">
                                <div className="w-10 h-10 rounded-full bg-[hsl(200,80%,60%)] flex items-center justify-center flex-shrink-0">
                                  <Heart className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-semibold text-gray-900">Fertile Window Starts</p>
                                  <p className="text-xs text-gray-600">
                                    {format(fertileStart, 'MMM dd, yyyy')} • {daysUntilFertile} days
                                  </p>
                                </div>
                              </div>
                            )}
                            
                            {daysUntilOvulation > 0 && (
                              <div className="flex items-center gap-3 p-3 bg-[hsl(330,70%,95%)] rounded-lg">
                                <div className="w-10 h-10 rounded-full bg-[hsl(330,70%,50%)] flex items-center justify-center flex-shrink-0">
                                  <Calendar className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-semibold text-gray-900">Ovulation Day</p>
                                  <p className="text-xs text-gray-600">
                                    {format(ovulationDate, 'MMM dd, yyyy')} • {daysUntilOvulation} days
                                  </p>
                                </div>
                              </div>
                            )}
                            
                            {daysUntilPeriod > 0 && (
                              <div className="flex items-center gap-3 p-3 bg-[hsl(348,83%,95%)] rounded-lg">
                                <div className="w-10 h-10 rounded-full bg-[hsl(348,83%,47%)] flex items-center justify-center flex-shrink-0">
                                  <Calendar className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-semibold text-gray-900">Next Period</p>
                                  <p className="text-xs text-gray-600">
                                    {format(nextPeriodDate, 'MMM dd, yyyy')} • {daysUntilPeriod} days
                                  </p>
                                </div>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </div>
            )}


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
            {visibility.periodInfoCards && (
              <InfoCards 
                periodData={periodData} 
                displayMonth={selectedMonth || undefined} 
              />
            )}

            {/* Symptom Insights */}
            {visibility.periodInsights && periodData.cycleType === 'regular' && (
              <SymptomInsights 
                lastPeriodDate={periodData.lastPeriodDate}
                cycleLength={periodData.cycleLength}
              />
            )}

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

            {/* Cycle Insights Button */}
            <button
              onClick={() => setShowCycleInsights(true)}
              className="w-full py-4 font-semibold text-white text-sm transition-colors bg-[#eb4899] hover:bg-[#db2777] rounded-xl"
            >
              View Cycle Insights & Trends
            </button>

            {/* Health Features Section */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground px-1">Health Features</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => navigate('/ovulation-test')}
                  className="flex items-center gap-3 p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100 hover:shadow-md transition-all"
                >
                  <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
                    <TestTube className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-900">Ovulation Test</p>
                    <p className="text-[10px] text-gray-500">Track LH tests</p>
                  </div>
                </button>
                
                <button
                  onClick={() => navigate('/cycle-reports')}
                  className="flex items-center gap-3 p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-100 hover:shadow-md transition-all"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-900">Cycle Reports</p>
                    <p className="text-[10px] text-gray-500">View summaries</p>
                  </div>
                </button>
                
                <button
                  onClick={() => navigate('/pcos')}
                  className="flex items-center gap-3 p-3 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl border border-teal-100 hover:shadow-md transition-all"
                >
                  <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-900">PCOS Mode</p>
                    <p className="text-[10px] text-gray-500">Track symptoms</p>
                  </div>
                </button>
                
                <button
                  onClick={() => navigate('/perimenopause')}
                  className="flex items-center gap-3 p-3 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-100 hover:shadow-md transition-all"
                >
                  <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-900">Perimenopause</p>
                    <p className="text-[10px] text-gray-500">Track changes</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Sticky Notes Section */}
            {visibility.periodStickyNotes && <StickyNotes currentWeek={undefined} />}
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
      
      {/* Bottom Navigation */}
      <BottomNav 
        activeTab={activeTab} 
        onTabChange={handleTabChange} 
      />
    </div>
  );
};

export default Index;
