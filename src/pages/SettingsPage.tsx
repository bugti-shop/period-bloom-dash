import { Layers, ChevronRight, Moon, Calendar, Bell, Folder, Download, Upload, Trash2, Baby, Palette, Heart, FileText } from "lucide-react";
import { format } from "date-fns";
import { getPeriodHistory, clearPeriodHistory } from "@/lib/periodHistory";
import { useState } from "react";
import { loadPregnancyMode, savePregnancyMode } from "@/lib/pregnancyMode";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeVariant, loadTheme, saveTheme } from "@/lib/themeStorage";
import { notifySuccess, notifyError } from "@/lib/notificationWithHaptics";
import { ReminderSettings } from "@/components/ReminderSettings";
import { FertilityReminderSettings } from "@/components/FertilityReminderSettings";
import { SymptomReminderSettings } from "@/components/SymptomReminderSettings";
import { NotificationTester } from "@/components/NotificationTester";
import { exportAllData, importData } from "@/lib/dataExport";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import { AppleHealthSync } from "@/components/AppleHealthSync";
import { PhotoStorageMigration } from "@/components/PhotoStorageMigration";

export const SettingsPage = () => {
  const [pregnancyMode, setPregnancyMode] = useState(loadPregnancyMode());
  const [showPregnancyDialog, setShowPregnancyDialog] = useState(false);
  const [lastPeriodInput, setLastPeriodInput] = useState("");
  const [currentTheme, setCurrentTheme] = useState<ThemeVariant>(loadTheme());
  const [showThemeDialog, setShowThemeDialog] = useState(false);
  const [showDatesDialog, setShowDatesDialog] = useState(false);
  const [showRemindersDialog, setShowRemindersDialog] = useState(false);
  const [showFertilityRemindersDialog, setShowFertilityRemindersDialog] = useState(false);
  const [showSymptomRemindersDialog, setShowSymptomRemindersDialog] = useState(false);
  const [showDataDialog, setShowDataDialog] = useState(false);
  const [showHealthExportDialog, setShowHealthExportDialog] = useState(false);
  const [history, setHistory] = useState(getPeriodHistory());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClearHistory = () => {
    if (confirm("Are you sure you want to clear all history?")) {
      clearPeriodHistory();
      setHistory([]);
      notifySuccess("History cleared");
    }
  };

  const handleDeleteAllData = () => {
    if (confirm("Are you sure you want to delete ALL app data? This cannot be undone.")) {
      localStorage.clear();
      notifySuccess("All data deleted");
      setTimeout(() => window.location.reload(), 500);
    }
  };

  const handlePregnancyToggle = () => {
    // Automatically switch modes without asking for dates
    if (pregnancyMode.isPregnancyMode) {
      // Switch from Pregnancy to Period mode
      const updated = { isPregnancyMode: false };
      savePregnancyMode(updated);
      setPregnancyMode(updated);
      notifySuccess("Switched to Period Tracking Mode");
      setTimeout(() => window.location.reload(), 500);
    } else {
      // Switch from Period to Pregnancy mode
      // Use today as default last period date
      const today = new Date();
      const updated = {
        isPregnancyMode: true,
        lastPeriodDate: today,
        dueDate: undefined,
        currentWeek: undefined
      };
      savePregnancyMode(updated);
      setPregnancyMode(updated);
      notifySuccess("Switched to Pregnancy Tracking Mode! 🎉");
      setTimeout(() => window.location.reload(), 500);
    }
  };

  const handlePregnancySetup = () => {
    if (!lastPeriodInput) {
      notifyError("Please enter your last period date");
      return;
    }
    
    const lastPeriodDate = new Date(lastPeriodInput);
    if (isNaN(lastPeriodDate.getTime())) {
      notifyError("Please enter a valid date");
      return;
    }

    const updated = {
      isPregnancyMode: true,
      lastPeriodDate,
      dueDate: undefined,
      currentWeek: undefined
    };
    
    savePregnancyMode(updated);
    setPregnancyMode(updated);
    setShowPregnancyDialog(false);
    notifySuccess("Pregnancy Mode activated! 🎉");
    setTimeout(() => window.location.reload(), 500);
  };

  const handleThemeChange = (theme: ThemeVariant) => {
    saveTheme(theme);
    setCurrentTheme(theme);
    setShowThemeDialog(false);
    notifySuccess(`Theme changed to ${theme === 'light' ? 'Light' : theme.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}`);
  };

  const themeOptions = [
    { value: "light" as ThemeVariant, label: "Light", color: "bg-gradient-to-br from-pink-100 to-purple-100" },
    { value: "dark-black" as ThemeVariant, label: "Dark Black", color: "bg-gradient-to-br from-gray-900 to-black" },
    { value: "dark-blue" as ThemeVariant, label: "Dark Blue", color: "bg-gradient-to-br from-blue-900 to-blue-950" },
    { value: "dark-green" as ThemeVariant, label: "Dark Green", color: "bg-gradient-to-br from-green-900 to-green-950" },
    { value: "dark-brown" as ThemeVariant, label: "Dark Brown", color: "bg-gradient-to-br from-amber-900 to-amber-950" },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="space-y-8">
          {/* My Mode Section */}
          <div className="space-y-0">
            <div className="flex items-center gap-3 mb-4 px-2">
              <Layers className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-primary">
                My Mode: {pregnancyMode.isPregnancyMode ? "Pregnancy Tracking" : "Period Tracking"}
              </h2>
            </div>
            
            <button
              onClick={handlePregnancyToggle}
              className="w-full flex items-center justify-between px-4 py-4 border-b border-border hover:bg-muted/30 transition-colors"
            >
              <span className="text-foreground text-base">
                {pregnancyMode.isPregnancyMode ? "Switch to Period Tracking" : "Switch to Pregnancy Tracking"}
              </span>
              <ChevronRight className="w-5 h-5 text-primary" />
            </button>
          </div>

          {/* My Pregnancy/Period Section */}
          <div className="space-y-0">
            <div className="flex items-center gap-3 mb-4 px-2">
              <Moon className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-primary">
                {pregnancyMode.isPregnancyMode ? "My Pregnancy" : "My Period"}
              </h2>
            </div>
            
            <button
              onClick={() => setShowDatesDialog(true)}
              className="w-full flex items-center justify-between px-4 py-4 border-b border-border hover:bg-muted/30 transition-colors"
            >
              <span className="text-foreground text-base">Dates</span>
              <ChevronRight className="w-5 h-5 text-primary" />
            </button>
          </div>

          {/* Reminders & Notifications Section */}
          <div className="space-y-0">
            <div className="flex items-center gap-3 mb-4 px-2">
              <Bell className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-primary">Reminders & Notifications</h2>
            </div>
            
            <button
              onClick={() => setShowFertilityRemindersDialog(true)}
              className="w-full flex items-center justify-between px-4 py-4 border-b border-border hover:bg-muted/30 transition-colors"
            >
              <span className="text-foreground text-base">Fertility & Period reminders</span>
              <ChevronRight className="w-5 h-5 text-primary" />
            </button>
            
            <button
              onClick={() => setShowSymptomRemindersDialog(true)}
              className="w-full flex items-center justify-between px-4 py-4 border-b border-border hover:bg-muted/30 transition-colors"
            >
              <span className="text-foreground text-base">Symptom logging reminders</span>
              <ChevronRight className="w-5 h-5 text-primary" />
            </button>
            
            <button
              onClick={() => setShowRemindersDialog(true)}
              className="w-full flex items-center justify-between px-4 py-4 border-b border-border hover:bg-muted/30 transition-colors"
            >
              <span className="text-foreground text-base">Medication reminder</span>
              <ChevronRight className="w-5 h-5 text-primary" />
            </button>
            
            <button
              onClick={() => setShowRemindersDialog(true)}
              className="w-full flex items-center justify-between px-4 py-4 border-b border-border hover:bg-muted/30 transition-colors"
            >
              <span className="text-foreground text-base">Contraception reminder</span>
              <ChevronRight className="w-5 h-5 text-primary" />
            </button>
            
            <button
              onClick={() => setShowRemindersDialog(true)}
              className="w-full flex items-center justify-between px-4 py-4 border-b border-border hover:bg-muted/30 transition-colors"
            >
              <span className="text-foreground text-base">Meditation reminder</span>
              <ChevronRight className="w-5 h-5 text-primary" />
            </button>
            
            <button
              onClick={() => setShowRemindersDialog(true)}
              className="w-full flex items-center justify-between px-4 py-4 border-b border-border hover:bg-muted/30 transition-colors"
            >
              <span className="text-foreground text-base">Daily logging reminder</span>
              <ChevronRight className="w-5 h-5 text-primary" />
            </button>
            
            <button
              onClick={() => setShowRemindersDialog(true)}
              className="w-full flex items-center justify-between px-4 py-4 border-b border-border hover:bg-muted/30 transition-colors"
            >
              <span className="text-foreground text-base">Tracking reminder</span>
              <ChevronRight className="w-5 h-5 text-primary" />
            </button>
          </div>

          {/* My Data Section */}
          <div className="space-y-0">
            <div className="flex items-center gap-3 mb-4 px-2">
              <Folder className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-primary">My Data</h2>
            </div>
            
            <button
              onClick={exportAllData}
              className="w-full flex items-center justify-between px-4 py-4 border-b border-border hover:bg-muted/30 transition-colors"
            >
              <span className="text-foreground text-base">Back up data</span>
              <ChevronRight className="w-5 h-5 text-primary" />
            </button>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-between px-4 py-4 border-b border-border hover:bg-muted/30 transition-colors"
            >
              <span className="text-foreground text-base">Restore data</span>
              <ChevronRight className="w-5 h-5 text-primary" />
            </button>
            
            <button
              onClick={exportAllData}
              className="w-full flex items-center justify-between px-4 py-4 border-b border-border hover:bg-muted/30 transition-colors"
            >
              <span className="text-foreground text-base">Download my data</span>
              <ChevronRight className="w-5 h-5 text-primary" />
            </button>
            
            <button
              onClick={handleDeleteAllData}
              className="w-full flex items-center justify-between px-4 py-4 border-b border-border hover:bg-muted/30 transition-colors"
            >
              <span className="text-foreground text-base">Delete app data</span>
              <ChevronRight className="w-5 h-5 text-primary" />
            </button>
            
            <button
              onClick={() => setShowHealthExportDialog(true)}
              className="w-full flex items-center justify-between px-4 py-4 border-b border-border hover:bg-muted/30 transition-colors"
            >
              <span className="text-foreground text-base">Health integration & medical export</span>
              <ChevronRight className="w-5 h-5 text-primary" />
            </button>
            
            {/* Photo Storage Status */}
            <div className="px-4 py-4">
              <PhotoStorageMigration />
            </div>
          </div>

          {/* Theme Section */}
          <div className="space-y-0">
            <div className="flex items-center gap-3 mb-4 px-2">
              <Palette className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-primary">Appearance</h2>
            </div>
            
            <button
              onClick={() => setShowThemeDialog(true)}
              className="w-full flex items-center justify-between px-4 py-4 border-b border-border hover:bg-muted/30 transition-colors"
            >
              <span className="text-foreground text-base">Theme</span>
              <ChevronRight className="w-5 h-5 text-primary" />
            </button>
          </div>
        </div>
      </div>

      {/* Pregnancy Mode Dialog */}
      <Dialog open={showPregnancyDialog} onOpenChange={setShowPregnancyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enable Pregnancy Mode</DialogTitle>
            <DialogDescription>
              Let's set up your pregnancy tracking! When was your last period?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="lastPeriod">Last Period Date</Label>
              <Input
                id="lastPeriod"
                type="date"
                value={lastPeriodInput}
                onChange={(e) => setLastPeriodInput(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            <Button onClick={handlePregnancySetup} className="w-full">
              Start Pregnancy Tracking
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dates Dialog */}
      <Dialog open={showDatesDialog} onOpenChange={setShowDatesDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Your Dates</DialogTitle>
            <DialogDescription>
              View and manage your period history
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {history.length === 0 ? (
              <div className="text-center py-8 bg-muted rounded-xl">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground text-sm">No history yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">Period History</h3>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleClearHistory}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Clear All
                  </Button>
                </div>
                {history.map((entry) => (
                  <div
                    key={entry.id}
                    className="bg-muted p-4 rounded-xl"
                  >
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <Calendar className="w-4 h-4" />
                      <span>Updated {format(entry.timestamp, "MMM d, yyyy 'at' h:mm a")}</span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Last Period</p>
                        <p className="font-semibold text-foreground text-sm">
                          {format(entry.lastPeriodDate, "MMM d, yyyy")}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Cycle Length</p>
                        <p className="font-semibold text-foreground text-sm">{entry.cycleLength} days</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Duration</p>
                        <p className="font-semibold text-foreground text-sm">{entry.periodDuration} days</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Reminders Dialog */}
      <Dialog open={showRemindersDialog} onOpenChange={setShowRemindersDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Reminders & Notifications</DialogTitle>
            <DialogDescription>
              Manage your reminder preferences
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <ReminderSettings />
          </div>
        </DialogContent>
      </Dialog>

      {/* Fertility Reminders Dialog */}
      <Dialog open={showFertilityRemindersDialog} onOpenChange={setShowFertilityRemindersDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Fertility & Period Reminders</DialogTitle>
            <DialogDescription>
              Get notified about your fertile window, ovulation, and period - completely offline
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-6">
            <FertilityReminderSettings />
            <div className="border-t border-border pt-6">
              <NotificationTester />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Symptom Logging Reminders Dialog */}
      <Dialog open={showSymptomRemindersDialog} onOpenChange={setShowSymptomRemindersDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Symptom Logging Reminders</DialogTitle>
            <DialogDescription>
              Set up daily reminders to log your symptoms
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <SymptomReminderSettings />
          </div>
        </DialogContent>
      </Dialog>

      {/* Hidden file input for restore */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (file) {
            try {
              const success = await importData(file);
              if (success) {
                notifySuccess("Data restored successfully");
                setTimeout(() => window.location.reload(), 500);
              }
            } catch (error) {
              notifyError(error instanceof Error ? error.message : "Failed to restore data");
            }
          }
        }}
      />

      {/* Theme Dialog */}
      <Dialog open={showThemeDialog} onOpenChange={setShowThemeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Choose Theme</DialogTitle>
            <DialogDescription>
              Select your preferred app theme
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            {themeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleThemeChange(option.value)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  currentTheme === option.value
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className={`h-20 rounded-lg mb-3 ${option.color}`} />
                <p className="font-semibold text-center">{option.label}</p>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Health Export Dialog */}
      <Dialog open={showHealthExportDialog} onOpenChange={setShowHealthExportDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Health Integration & Medical Export</DialogTitle>
            <DialogDescription>
              Sync with Apple Health and export medical reports
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <AppleHealthSync />
          </div>
        </DialogContent>
      </Dialog>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              try {
                const data = JSON.parse(event.target?.result as string);
                importData(data);
                notifySuccess("Data restored successfully");
                setTimeout(() => window.location.reload(), 500);
              } catch (error) {
                notifyError("Failed to restore data");
              }
            };
            reader.readAsText(file);
          }
        }}
        className="hidden"
      />
    </div>
  );
};
