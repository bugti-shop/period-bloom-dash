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
import { SymptomsPage } from "@/pages/SymptomsPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { ToolsPage } from "@/pages/ToolsPage";
import { ChecklistsPage } from "@/pages/ChecklistsPage";
import { Calendar, Baby, Heart, Clock } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { 
  calculatePregnancyWeek, 
  calculateDueDate, 
  loadPregnancyMode, 
  savePregnancyMode 
} from "@/lib/pregnancyMode";
import { loadSectionVisibility } from "@/lib/sectionVisibility";

// Modern UI Components
import { ModernHeader } from "@/components/ModernHeader";
import { ModernBottomNav } from "@/components/ModernBottomNav";
import { QuickActionsBar } from "@/components/QuickActionsBar";

interface PregnancyTrackerProps {
  lastPeriodDate: Date;
}

// Pregnancy Status Card Component
const PregnancyStatusCard = ({ 
  currentWeek, 
  dueDate 
}: { 
  currentWeek: number; 
  dueDate: Date;
}) => {
  const today = new Date();
  const daysUntilDue = differenceInDays(dueDate, today);
  const trimester = currentWeek <= 13 ? 1 : currentWeek <= 27 ? 2 : 3;
  
  const trimesterColors = {
    1: 'from-emerald-400 to-teal-500',
    2: 'from-blue-400 to-indigo-500',
    3: 'from-purple-400 to-pink-500',
  };

  return (
    <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${trimesterColors[trimester as keyof typeof trimesterColors]} p-6 text-white shadow-lg`}>
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Heart className="w-4 h-4" />
              <span className="text-xs font-medium opacity-90">Trimester {trimester}</span>
            </div>
            <h2 className="text-4xl font-bold tracking-tight">
              Week {currentWeek}
            </h2>
            <p className="text-sm font-medium opacity-90 mt-1">
              of your pregnancy journey
            </p>
          </div>
          
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <Baby className="w-7 h-7" />
          </div>
        </div>
        
        <div className="flex items-center gap-4 pt-4 border-t border-white/20">
          <div className="flex-1">
            <p className="text-xs opacity-75 mb-0.5">Due Date</p>
            <p className="text-sm font-semibold">{format(dueDate, "MMM dd, yyyy")}</p>
          </div>
          <div className="w-px h-8 bg-white/30" />
          <div className="flex-1">
            <p className="text-xs opacity-75 mb-0.5">Days Left</p>
            <p className="text-sm font-semibold">
              {daysUntilDue > 0 ? `${daysUntilDue} days` : 'Due!'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Photo Albums Section
const PhotoAlbumsSection = ({ 
  onShowBump, 
  onShowBaby, 
  onShowFamily, 
  onShowUltrasound,
  visibility
}: {
  onShowBump: () => void;
  onShowBaby: () => void;
  onShowFamily: () => void;
  onShowUltrasound: () => void;
  visibility: ReturnType<typeof loadSectionVisibility>;
}) => {
  const albums = [
    { id: 'bump', visible: visibility.bumpGallery, onClick: onShowBump },
    { id: 'baby', visible: visibility.babyAlbum, onClick: onShowBaby },
    { id: 'family', visible: visibility.familyAlbum, onClick: onShowFamily },
    { id: 'ultrasound', visible: visibility.ultrasoundAlbum, onClick: onShowUltrasound },
  ];

  const visibleAlbums = albums.filter(a => a.visible);
  if (visibleAlbums.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-foreground px-1">Photo Albums</h3>
      <div className="grid grid-cols-2 gap-3">
        {visibility.bumpGallery && <BumpGalleryCard onClick={onShowBump} />}
        {visibility.babyAlbum && <BabyAlbumCard onClick={onShowBaby} />}
        {visibility.familyAlbum && <FamilyAlbumCard onClick={onShowFamily} />}
        {visibility.ultrasoundAlbum && <UltrasoundAlbumCard onClick={onShowUltrasound} />}
      </div>
    </div>
  );
};

// Health Tracking Section
const HealthTrackingSection = ({ visibility }: { visibility: ReturnType<typeof loadSectionVisibility> }) => {
  const hasVisibleCards = visibility.appointmentCard || visibility.pregnancyWeightCard || 
                          visibility.bloodPressureCard || visibility.glucoseCard;
  
  if (!hasVisibleCards) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-foreground px-1">Health Tracking</h3>
      <div className="space-y-3">
        {visibility.appointmentCard && <AppointmentCard />}
        {visibility.pregnancyWeightCard && <PregnancyWeightCard />}
        {visibility.bloodPressureCard && <BloodPressureCard />}
        {visibility.glucoseCard && <GlucoseCard />}
      </div>
    </div>
  );
};

export const PregnancyTracker = ({ lastPeriodDate: initialLastPeriodDate }: PregnancyTrackerProps) => {
  const [activeTab, setActiveTab] = useState<"home" | "symptoms" | "settings" | "tools" | "checklists">("home");
  const [lastPeriodDate, setLastPeriodDate] = useState(initialLastPeriodDate);
  const [manualWeek, setManualWeek] = useState<number | undefined>(undefined);
  const [showGallery, setShowGallery] = useState(false);
  const [showBabyAlbum, setShowBabyAlbum] = useState(false);
  const [showFamilyAlbum, setShowFamilyAlbum] = useState(false);
  const [showUltrasoundAlbum, setShowUltrasoundAlbum] = useState(false);
  const visibility = loadSectionVisibility();
  
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
    setManualWeek(undefined);
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

  // Full-screen album views
  if (showGallery) return <BumpGallery onClose={() => setShowGallery(false)} />;
  if (showBabyAlbum) return <BabyAlbum onClose={() => setShowBabyAlbum(false)} />;
  if (showFamilyAlbum) return <FamilyAlbum onClose={() => setShowFamilyAlbum(false)} />;
  if (showUltrasoundAlbum) return <UltrasoundAlbum onClose={() => setShowUltrasoundAlbum(false)} />;

  return (
    <div className="min-h-screen bg-background">
      <ModernHeader />
      
      {activeTab === "home" && (
        <div className="max-w-lg mx-auto py-4 px-4 pb-24">
          <div className="space-y-5">
            {/* Quick Actions */}
            <QuickActionsBar variant="pregnancy" />

            {/* Pregnancy Status Card */}
            <PregnancyStatusCard currentWeek={currentWeek} dueDate={dueDate} />

            {/* Pregnancy Calendar & Progress */}
            {visibility.pregnancyProgress && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-foreground px-1">Your Journey</h3>
                
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
              </div>
            )}

            {/* Photo Albums */}
            <PhotoAlbumsSection 
              onShowBump={() => setShowGallery(true)}
              onShowBaby={() => setShowBabyAlbum(true)}
              onShowFamily={() => setShowFamilyAlbum(true)}
              onShowUltrasound={() => setShowUltrasoundAlbum(true)}
              visibility={visibility}
            />

            {/* Health Tracking */}
            <HealthTrackingSection visibility={visibility} />

            {/* Sticky Notes */}
            {visibility.pregnancyStickyNotes && <StickyNotes />}
          </div>
        </div>
      )}

      {activeTab === "symptoms" && <SymptomsPage />}
      {activeTab === "settings" && <SettingsPage />}
      {activeTab === "tools" && <ToolsPage />}
      {activeTab === "checklists" && <ChecklistsPage />}
      
      <ModernBottomNav 
        activeTab={activeTab} 
        onTabChange={handleTabChange}
        hideTools={true}
        showChecklists={true}
      />
    </div>
  );
};
