import { useState, useEffect } from "react";
import { PregnancyProgress } from "@/components/PregnancyProgress";
import { PregnancyCalendar } from "@/components/PregnancyCalendar";
import { StickyNotes } from "@/components/StickyNotes";
import { BumpGalleryCard } from "@/components/BumpGalleryCard";
import { BumpGallery } from "@/components/BumpGallery";
import { BabyAlbumCard } from "@/components/BabyAlbumCard";
import { BabyAlbum } from "@/components/BabyAlbum";
import { FamilyAlbumCard } from "@/components/FamilyAlbumCard";
import { FamilyAlbum } from "@/components/FamilyAlbum";
import { UltrasoundAlbumCard } from "@/components/UltrasoundAlbumCard";
import { UltrasoundAlbum } from "@/components/UltrasoundAlbum";
import { AppointmentCard, PregnancyWeightCard, BloodPressureCard, GlucoseCard } from "@/components/HealthTrackerCards";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { SymptomsPage } from "@/pages/SymptomsPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { ToolsPage } from "@/pages/ToolsPage";
import { ChecklistsPage } from "@/pages/ChecklistsPage";
import { Grid3x3, List, Calendar } from "lucide-react";
import { addDays, format } from "date-fns";
import { 
  calculatePregnancyWeek, 
  calculateDueDate, 
  loadPregnancyMode, 
  savePregnancyMode 
} from "@/lib/pregnancyMode";
import { loadSectionVisibility } from "@/lib/sectionVisibility";

interface PregnancyTrackerProps {
  lastPeriodDate: Date;
}

export const PregnancyTracker = ({ lastPeriodDate: initialLastPeriodDate }: PregnancyTrackerProps) => {
  const [activeTab, setActiveTab] = useState<"home" | "symptoms" | "settings" | "tools" | "checklists">("home");
  const [lastPeriodDate, setLastPeriodDate] = useState(initialLastPeriodDate);
  const [manualWeek, setManualWeek] = useState<number | undefined>(undefined);
  const [showGallery, setShowGallery] = useState(false);
  const [showBabyAlbum, setShowBabyAlbum] = useState(false);
  const [showFamilyAlbum, setShowFamilyAlbum] = useState(false);
  const [showUltrasoundAlbum, setShowUltrasoundAlbum] = useState(false);
  const [calendarView, setCalendarView] = useState<'month' | 'list'>('month');
  const visibility = loadSectionVisibility();
  
  // Load saved manual week override on mount
  useEffect(() => {
    const pregnancyData = loadPregnancyMode();
    if (pregnancyData.manualWeekOverride) {
      setManualWeek(pregnancyData.manualWeekOverride);
    }
  }, []);

  const calculatedWeek = calculatePregnancyWeek(lastPeriodDate);
  const currentWeek = manualWeek ?? calculatedWeek;
  const dueDate = calculateDueDate(lastPeriodDate);

  const handleUpdateLastPeriod = (newDate: Date) => {
    setLastPeriodDate(newDate);
    setManualWeek(undefined); // Reset manual override
    const pregnancyData = loadPregnancyMode();
    savePregnancyMode({
      ...pregnancyData,
      lastPeriodDate: newDate,
      dueDate: calculateDueDate(newDate),
      currentWeek: calculatePregnancyWeek(newDate),
      manualWeekOverride: undefined,
    });
  };

  const handleSwitchWeek = (week: number) => {
    setManualWeek(week);
    const pregnancyData = loadPregnancyMode();
    savePregnancyMode({
      ...pregnancyData,
      manualWeekOverride: week,
    });
  };

  const handleTabChange = (tab: "home" | "symptoms" | "settings" | "tools" | "checklists") => {
    setActiveTab(tab);
  };

  // Show Gallery
  if (showGallery) {
    return <BumpGallery onClose={() => setShowGallery(false)} />;
  }

  // Show Baby Album
  if (showBabyAlbum) {
    return <BabyAlbum onClose={() => setShowBabyAlbum(false)} />;
  }

  // Show Family Album
  if (showFamilyAlbum) {
    return <FamilyAlbum onClose={() => setShowFamilyAlbum(false)} />;
  }

  // Show Ultrasound Album
  if (showUltrasoundAlbum) {
    return <UltrasoundAlbum onClose={() => setShowUltrasoundAlbum(false)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header showArticlesToggle={true} />
      
      {activeTab === "home" && (
        <div className="max-w-2xl mx-auto py-4 px-4 pb-20">
          <div className="space-y-4">
            {visibility.pregnancyProgress && (
              <>
                {/* Calendar View Switchers */}
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-sm font-semibold text-foreground">Your Pregnancy Journey</h3>
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

                {calendarView === 'month' ? (
                  <>
                    <PregnancyCalendar 
                      lastPeriodDate={lastPeriodDate}
                      currentWeek={currentWeek}
                    />
                    <PregnancyProgress 
                      week={currentWeek}
                      dueDate={dueDate}
                      onUpdateLastPeriod={handleUpdateLastPeriod}
                      onSwitchWeek={handleSwitchWeek}
                    />
                  </>
                ) : (
                  <>
                    <PregnancyProgress 
                      week={currentWeek}
                      dueDate={dueDate}
                      onUpdateLastPeriod={handleUpdateLastPeriod}
                      onSwitchWeek={handleSwitchWeek}
                    />
                    <div className="glass-card p-4 rounded-2xl">
                      <h4 className="text-sm font-semibold text-foreground mb-3">Key Milestones</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 p-3 bg-[hsl(280,70%,95%)] rounded-lg">
                          <div className="w-10 h-10 rounded-full bg-[hsl(280,70%,50%)] flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900">Current Week</p>
                            <p className="text-xs text-gray-600">Week {currentWeek} of 40</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 p-3 bg-[hsl(348,83%,95%)] rounded-lg">
                          <div className="w-10 h-10 rounded-full bg-[hsl(348,83%,47%)] flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900">Due Date</p>
                            <p className="text-xs text-gray-600">{format(dueDate, 'MMMM dd, yyyy')}</p>
                          </div>
                        </div>
                        
                        {currentWeek <= 13 && (
                          <div className="flex items-center gap-3 p-3 bg-[hsl(200,80%,95%)] rounded-lg">
                            <div className="w-10 h-10 rounded-full bg-[hsl(200,80%,60%)] flex items-center justify-center flex-shrink-0">
                              <Calendar className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-gray-900">First Trimester</p>
                              <p className="text-xs text-gray-600">Weeks 1-13 • Critical development period</p>
                            </div>
                          </div>
                        )}
                        
                        {currentWeek > 13 && currentWeek <= 27 && (
                          <div className="flex items-center gap-3 p-3 bg-[hsl(200,80%,95%)] rounded-lg">
                            <div className="w-10 h-10 rounded-full bg-[hsl(200,80%,60%)] flex items-center justify-center flex-shrink-0">
                              <Calendar className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-gray-900">Second Trimester</p>
                              <p className="text-xs text-gray-600">Weeks 14-27 • Growth & movement</p>
                            </div>
                          </div>
                        )}
                        
                        {currentWeek > 27 && (
                          <div className="flex items-center gap-3 p-3 bg-[hsl(200,80%,95%)] rounded-lg">
                            <div className="w-10 h-10 rounded-full bg-[hsl(200,80%,60%)] flex items-center justify-center flex-shrink-0">
                              <Calendar className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-gray-900">Third Trimester</p>
                              <p className="text-xs text-gray-600">Weeks 28-40 • Final preparations</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
            {visibility.bumpGallery && <BumpGalleryCard onClick={() => setShowGallery(true)} />}
            {visibility.babyAlbum && <BabyAlbumCard onClick={() => setShowBabyAlbum(true)} />}
            {visibility.familyAlbum && <FamilyAlbumCard onClick={() => setShowFamilyAlbum(true)} />}
            {visibility.ultrasoundAlbum && <UltrasoundAlbumCard onClick={() => setShowUltrasoundAlbum(true)} />}
            {visibility.appointmentCard && <AppointmentCard />}
            {visibility.pregnancyWeightCard && <PregnancyWeightCard />}
            {visibility.bloodPressureCard && <BloodPressureCard />}
            {visibility.glucoseCard && <GlucoseCard />}
            {visibility.pregnancyStickyNotes && <StickyNotes />}
          </div>
        </div>
      )}

      {activeTab === "symptoms" && <SymptomsPage />}
      {activeTab === "settings" && <SettingsPage />}
      {activeTab === "tools" && <ToolsPage />}
      {activeTab === "checklists" && <ChecklistsPage />}
      
      <BottomNav 
        activeTab={activeTab} 
        onTabChange={handleTabChange}
        hideTools={true}
        showChecklists={true}
      />
    </div>
  );
};
