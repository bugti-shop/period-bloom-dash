import { useState, useEffect } from "react";
import { PregnancyProgress } from "@/components/PregnancyProgress";
import { StickyNotes } from "@/components/StickyNotes";
import { BumpGalleryCard } from "@/components/BumpGalleryCard";
import { BumpGallery } from "@/components/BumpGallery";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { SymptomsPage } from "@/pages/SymptomsPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { ToolsPage } from "@/pages/ToolsPage";
import { ArticlesPage } from "@/pages/ArticlesPage";
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
  const [activeTab, setActiveTab] = useState<"home" | "symptoms" | "settings" | "tools">("home");
  const [lastPeriodDate, setLastPeriodDate] = useState(initialLastPeriodDate);
  const [manualWeek, setManualWeek] = useState<number | undefined>(undefined);
  const [isArticlesMode, setIsArticlesMode] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  
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

  const handleTabChange = (tab: "home" | "symptoms" | "settings" | "tools") => {
    setActiveTab(tab);
  };

  // Show Gallery
  if (showGallery) {
    return <BumpGallery onClose={() => setShowGallery(false)} />;
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
      
      {activeTab === "home" && (
        <div className="max-w-7xl mx-auto py-3 px-3 pb-20">
          <div className="space-y-4">
            <PregnancyProgress 
              week={currentWeek} 
              dueDate={dueDate}
              onUpdateLastPeriod={handleUpdateLastPeriod}
              onSwitchWeek={handleSwitchWeek}
            />
            <BumpGalleryCard onClick={() => setShowGallery(true)} />
            <StickyNotes />
          </div>
        </div>
      )}

      {activeTab === "symptoms" && <SymptomsPage />}
      {activeTab === "settings" && <SettingsPage />}
      {activeTab === "tools" && <ToolsPage />}
      
      <BottomNav 
        activeTab={activeTab} 
        onTabChange={handleTabChange} 
      />
    </div>
  );
};
