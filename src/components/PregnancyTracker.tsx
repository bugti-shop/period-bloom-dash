import { useState, useEffect } from "react";
import { PregnancyProgress } from "@/components/PregnancyProgress";
import { StickyNotes } from "@/components/StickyNotes";
import { BumpGalleryCard } from "@/components/BumpGalleryCard";
import { BumpGallery } from "@/components/BumpGallery";
import { BabyAlbumCard } from "@/components/BabyAlbumCard";
import { BabyAlbum } from "@/components/BabyAlbum";
import { FamilyAlbumCard } from "@/components/FamilyAlbumCard";
import { FamilyAlbum } from "@/components/FamilyAlbum";
import { UltrasoundAlbumCard } from "@/components/UltrasoundAlbumCard";
import { UltrasoundAlbum } from "@/components/UltrasoundAlbum";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { SymptomsPage } from "@/pages/SymptomsPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { ToolsPage } from "@/pages/ToolsPage";
import { ChecklistsPage } from "@/pages/ChecklistsPage";
import { 
  calculatePregnancyWeek, 
  calculateDueDate, 
  loadPregnancyMode, 
  savePregnancyMode 
} from "@/lib/pregnancyMode";

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
            <PregnancyProgress 
              week={currentWeek} 
              dueDate={dueDate}
              onUpdateLastPeriod={handleUpdateLastPeriod}
              onSwitchWeek={handleSwitchWeek}
            />
            <BumpGalleryCard onClick={() => setShowGallery(true)} />
            <BabyAlbumCard onClick={() => setShowBabyAlbum(true)} />
            <FamilyAlbumCard onClick={() => setShowFamilyAlbum(true)} />
            <UltrasoundAlbumCard onClick={() => setShowUltrasoundAlbum(true)} />
            <StickyNotes />
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
