import { useState, useEffect } from "react";
import { addDays, format, differenceInDays } from "date-fns";
import { PeriodForm } from "@/components/PeriodForm";
import { savePeriodHistory } from "@/lib/periodHistory";
import { saveToLocalStorage, loadFromLocalStorage } from "@/lib/storage";
import { InfoCards } from "@/components/InfoCards";
import { StickyNotes } from "@/components/StickyNotes";
import { BottomNav } from "@/components/BottomNav";
import { Header } from "@/components/Header";
import { PeriodCalendar } from "@/components/PeriodCalendar";
import { SymptomInsights } from "@/components/SymptomInsights";
import { Calendar, Heart } from "lucide-react";
import { schedulePeriodReminder } from "@/lib/notifications";
import { scheduleFertilityReminders } from "@/lib/fertilityNotifications";
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
import { loadTheme } from "@/lib/themeStorage";
import { getCachedHoroscope, cacheHoroscope } from "@/lib/horoscopeStorage";
import { supabase } from "@/integrations/supabase/client";

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
  const [showCycleInsights, setShowCycleInsights] = useState(false);
  const [trialStarted, setTrialStarted] = useState(hasStartedTrial());
  const pregnancyMode = loadPregnancyMode();
  const visibility = loadSectionVisibility();
  const currentTheme = loadTheme();
  const [dailyHoroscope, setDailyHoroscope] = useState<string>("");

  const handleStartTrial = () => {
    startTrial();
    setTrialStarted(true);
  };

  const fetchHoroscope = async (zodiacSign: string) => {
    // Check cache first
    const cached = getCachedHoroscope(zodiacSign);
    if (cached) {
      setDailyHoroscope(cached);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('daily-horoscope', {
        body: { zodiacSign, date: new Date().toDateString() }
      });

      if (error) throw error;

      if (data?.horoscope) {
        setDailyHoroscope(data.horoscope);
        cacheHoroscope(zodiacSign, data.horoscope);
      }
    } catch (error) {
      console.error('Error fetching horoscope:', error);
      setDailyHoroscope("Your stars are aligned for a wonderful day ahead!");
    }
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
        
        // Schedule notifications
        const nextPeriodDate = addDays(data.lastPeriodDate, data.cycleLength);
        schedulePeriodReminder(nextPeriodDate, data.cycleLength);
        scheduleFertilityReminders(data.lastPeriodDate, data.cycleLength);
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
    
    if (data.cycleType === 'regular') {
      savePeriodHistory({
        lastPeriodDate: data.lastPeriodDate,
        cycleLength: data.cycleLength,
        periodDuration: data.periodDuration
      });
    }
    
    saveToLocalStorage("current-period-data", data);
    
    // Schedule notifications
    if (data.cycleType === 'regular') {
      const nextPeriodDate = addDays(data.lastPeriodDate, data.cycleLength);
      schedulePeriodReminder(nextPeriodDate, data.cycleLength);
      scheduleFertilityReminders(data.lastPeriodDate, data.cycleLength);
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
      <div className="min-h-screen bg-background pb-20">
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
    <div className="min-h-screen bg-background">
      <Header showArticlesToggle={true} />
      
      {/* Render content based on active tab */}
      {activeTab === "home" && (
        <div className="max-w-7xl mx-auto py-3 px-3 pb-20">
          {/* Floral Calendar Header - Hidden in Astrology Theme */}
          {currentTheme !== "astrology" && (
            <div className="relative bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl overflow-hidden mb-4">
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
          )}

          {/* Two Column Layout for Astrology Theme */}
          <div className={currentTheme === "astrology" ? "grid grid-cols-1 lg:grid-cols-3 gap-4" : "space-y-4"}>
            {/* Left Column - Main Content */}
            <div className={currentTheme === "astrology" ? "lg:col-span-2 space-y-4" : "space-y-4"}>
              {/* Period Calendar */}
              {visibility.periodCalendar && (
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
              )}

              {/* Confidence Score for Irregular Cycles */}
              {periodData.cycleType === 'irregular' && (
                <div className={`p-4 rounded-2xl ${
                  currentTheme === 'astrology' 
                    ? 'bg-card border border-border' 
                    : 'bg-gradient-to-br from-blue-50 to-purple-50'
                }`}>
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
                  className={`py-3.5 font-semibold text-[13px] transition-colors rounded-xl ${
                    currentTheme === 'astrology'
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'bg-[#EC4899] text-white hover:bg-[#db2777]'
                  }`}
                >
                  Update Periods
                </button>
                <button
                  onClick={() => setShowHistory(true)}
                  className={`py-3.5 font-semibold text-[13px] transition-colors rounded-xl ${
                    currentTheme === 'astrology'
                      ? 'bg-muted text-foreground hover:bg-muted/80 border border-border'
                      : 'bg-[#E5E7EB] text-[#1F2937] hover:bg-[#D1D5DB]'
                  }`}
                >
                  Periods History
                </button>
              </div>

              {/* Cycle Insights Button */}
              <button
                onClick={() => setShowCycleInsights(true)}
                className={`w-full py-4 font-semibold text-sm transition-colors rounded-xl ${
                  currentTheme === 'astrology'
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'bg-[#eb4899] text-white hover:bg-[#db2777]'
                }`}
              >
                View Cycle Insights & Trends
              </button>

              {/* Sticky Notes Section */}
              {visibility.periodStickyNotes && <StickyNotes currentWeek={undefined} />}
            </div>

            {/* Right Column - Astrology Header (Only in Astrology Theme) */}
            {currentTheme === "astrology" && (
              <div className="lg:col-span-1">
                <div className="sticky top-20">
                  <div className="relative bg-gradient-to-b from-[#1a1d3a] to-[#0f1123] rounded-2xl overflow-hidden border border-border/50">
                    {/* Animated Stars Background with Constellations */}
                    <div className="absolute inset-0 overflow-hidden">
                      {/* Stars */}
                      {Array.from({ length: 30 }).map((_, i) => (
                        <div
                          key={i}
                          className="absolute rounded-full bg-white animate-pulse"
                          style={{
                            width: Math.random() * 3 + 1 + 'px',
                            height: Math.random() * 3 + 1 + 'px',
                            top: Math.random() * 100 + '%',
                            left: Math.random() * 100 + '%',
                            animationDelay: Math.random() * 3 + 's',
                            animationDuration: (Math.random() * 2 + 2) + 's',
                            opacity: Math.random() * 0.7 + 0.3
                          }}
                        />
                      ))}
                      
                      {/* Constellation Lines */}
                      <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
                        <defs>
                          <linearGradient id="constellation-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style={{ stopColor: '#a78bfa', stopOpacity: 0.4 }} />
                            <stop offset="100%" style={{ stopColor: '#ec4899', stopOpacity: 0.2 }} />
                          </linearGradient>
                        </defs>
                        {/* Big Dipper constellation pattern */}
                        <line x1="20%" y1="30%" x2="35%" y2="28%" stroke="url(#constellation-gradient)" strokeWidth="1" opacity="0.6" />
                        <line x1="35%" y1="28%" x2="45%" y2="25%" stroke="url(#constellation-gradient)" strokeWidth="1" opacity="0.6" />
                        <line x1="45%" y1="25%" x2="55%" y2="30%" stroke="url(#constellation-gradient)" strokeWidth="1" opacity="0.6" />
                        <line x1="45%" y1="25%" x2="50%" y2="15%" stroke="url(#constellation-gradient)" strokeWidth="1" opacity="0.6" />
                        <line x1="50%" y1="15%" x2="60%" y2="18%" stroke="url(#constellation-gradient)" strokeWidth="1" opacity="0.6" />
                        <line x1="60%" y1="18%" x2="70%" y2="20%" stroke="url(#constellation-gradient)" strokeWidth="1" opacity="0.6" />
                        
                        {/* Orion's Belt */}
                        <line x1="15%" y1="70%" x2="25%" y2="72%" stroke="url(#constellation-gradient)" strokeWidth="1" opacity="0.5" />
                        <line x1="25%" y1="72%" x2="35%" y2="70%" stroke="url(#constellation-gradient)" strokeWidth="1" opacity="0.5" />
                        
                        {/* Small triangle constellation */}
                        <line x1="75%" y1="45%" x2="85%" y2="50%" stroke="url(#constellation-gradient)" strokeWidth="1" opacity="0.5" />
                        <line x1="85%" y1="50%" x2="80%" y2="60%" stroke="url(#constellation-gradient)" strokeWidth="1" opacity="0.5" />
                        <line x1="80%" y1="60%" x2="75%" y2="45%" stroke="url(#constellation-gradient)" strokeWidth="1" opacity="0.5" />
                        
                        {/* Constellation stars (brighter) */}
                        <circle cx="20%" cy="30%" r="2" fill="#fff" opacity="0.9" />
                        <circle cx="35%" cy="28%" r="2" fill="#fff" opacity="0.9" />
                        <circle cx="45%" cy="25%" r="2" fill="#fff" opacity="0.9" />
                        <circle cx="55%" cy="30%" r="2" fill="#fff" opacity="0.9" />
                        <circle cx="50%" cy="15%" r="2" fill="#fff" opacity="0.9" />
                        <circle cx="60%" cy="18%" r="2" fill="#fff" opacity="0.9" />
                        <circle cx="70%" cy="20%" r="2" fill="#fff" opacity="0.9" />
                        <circle cx="15%" cy="70%" r="2" fill="#fff" opacity="0.8" />
                        <circle cx="25%" cy="72%" r="2" fill="#fff" opacity="0.8" />
                        <circle cx="35%" cy="70%" r="2" fill="#fff" opacity="0.8" />
                        <circle cx="75%" cy="45%" r="2" fill="#fff" opacity="0.8" />
                        <circle cx="85%" cy="50%" r="2" fill="#fff" opacity="0.8" />
                        <circle cx="80%" cy="60%" r="2" fill="#fff" opacity="0.8" />
                      </svg>
                    </div>

                    {/* Moon Phase Indicator */}
                    <div className="relative px-4 py-6">
                      <div className="text-center">
                        {(() => {
                          // Calculate current moon phase
                          const today = new Date();
                          const knownNewMoon = new Date(2000, 0, 6, 18, 14);
                          const lunarCycle = 29.53059;
                          const daysSinceNew = (today.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
                          const phase = (daysSinceNew % lunarCycle) / lunarCycle;
                          
                          let phaseName = "";
                          let phaseEmoji = "";
                          
                          if (phase < 0.03 || phase > 0.97) {
                            phaseName = "New Moon";
                            phaseEmoji = "🌑";
                          } else if (phase < 0.22) {
                            phaseName = "Waxing Crescent";
                            phaseEmoji = "🌒";
                          } else if (phase < 0.28) {
                            phaseName = "First Quarter";
                            phaseEmoji = "🌓";
                          } else if (phase < 0.47) {
                            phaseName = "Waxing Gibbous";
                            phaseEmoji = "🌔";
                          } else if (phase < 0.53) {
                            phaseName = "Full Moon";
                            phaseEmoji = "🌕";
                          } else if (phase < 0.72) {
                            phaseName = "Waning Gibbous";
                            phaseEmoji = "🌖";
                          } else if (phase < 0.78) {
                            phaseName = "Last Quarter";
                            phaseEmoji = "🌗";
                          } else {
                            phaseName = "Waning Crescent";
                            phaseEmoji = "🌘";
                          }
                          
                          // Calculate zodiac sign
                          const month = today.getMonth() + 1;
                          const day = today.getDate();
                          let zodiacSign = "";
                          let zodiacEmoji = "";
                          
                          if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) {
                            zodiacSign = "Aries";
                            zodiacEmoji = "♈";
                          } else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) {
                            zodiacSign = "Taurus";
                            zodiacEmoji = "♉";
                          } else if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) {
                            zodiacSign = "Gemini";
                            zodiacEmoji = "♊";
                          } else if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) {
                            zodiacSign = "Cancer";
                            zodiacEmoji = "♋";
                          } else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) {
                            zodiacSign = "Leo";
                            zodiacEmoji = "♌";
                          } else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) {
                            zodiacSign = "Virgo";
                            zodiacEmoji = "♍";
                          } else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) {
                            zodiacSign = "Libra";
                            zodiacEmoji = "♎";
                          } else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) {
                            zodiacSign = "Scorpio";
                            zodiacEmoji = "♏";
                          } else if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) {
                            zodiacSign = "Sagittarius";
                            zodiacEmoji = "♐";
                          } else if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) {
                            zodiacSign = "Capricorn";
                            zodiacEmoji = "♑";
                          } else if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) {
                            zodiacSign = "Aquarius";
                            zodiacEmoji = "♒";
                          } else {
                            zodiacSign = "Pisces";
                            zodiacEmoji = "♓";
                          }
                          
                          // Fetch horoscope on mount or when zodiac changes
                          if (!dailyHoroscope && zodiacSign) {
                            fetchHoroscope(zodiacSign);
                          }
                          
                          return (
                            <>
                              <div className="flex items-center justify-center gap-6 mb-4">
                                {/* Moon Phase */}
                                <div className="flex flex-col items-center">
                                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-400/20 to-pink-400/20 mb-2 relative">
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 blur-xl animate-pulse" />
                                    <div className="text-4xl relative z-10">{phaseEmoji}</div>
                                  </div>
                                  <p className="text-xs text-primary uppercase tracking-wider font-semibold">
                                    {phaseName}
                                  </p>
                                </div>
                                
                                {/* Zodiac Sign */}
                                <div className="flex flex-col items-center">
                                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-pink-400/20 to-purple-400/20 mb-2 relative">
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-500/30 to-purple-500/30 blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
                                    <div className="text-4xl relative z-10">{zodiacEmoji}</div>
                                  </div>
                                  <p className="text-xs text-primary uppercase tracking-wider font-semibold">
                                    {zodiacSign}
                                  </p>
                                </div>
                              </div>
                              
                              {/* Daily Horoscope */}
                              {dailyHoroscope && (
                                <div className="px-4 mb-3">
                                  <div className="bg-muted/30 rounded-xl p-3 border border-border/50 backdrop-blur-sm">
                                    <p className="text-xs text-foreground leading-relaxed italic">
                                      "{dailyHoroscope}"
                                    </p>
                                  </div>
                                </div>
                              )}
                              
                              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Today</p>
                            </>
                          );
                        })()}
                        <h1 className="text-3xl font-bold text-foreground mb-1 tracking-tight">
                          {format(new Date(), "MMMM d")}
                        </h1>
                        <p className="text-base text-muted-foreground">{format(new Date(), "yyyy")}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
