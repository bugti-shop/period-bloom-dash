import { Moon, Calendar, Clock, Trash2, Baby, Heart, Palette } from "lucide-react";
import { format } from "date-fns";
import { getPeriodHistory, clearPeriodHistory } from "@/lib/periodHistory";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { DisguiseMode } from "@/components/DisguiseMode";
import { DataBackup } from "@/components/DataBackup";
import { loadPregnancyMode, savePregnancyMode } from "@/lib/pregnancyMode";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeVariant, loadTheme, saveTheme } from "@/lib/themeStorage";
import { notifySuccess, notifyError } from "@/lib/notificationWithHaptics";

export const SettingsPage = () => {
  const [history, setHistory] = useState(getPeriodHistory());
  const [pregnancyMode, setPregnancyMode] = useState(loadPregnancyMode());
  const [showPregnancyDialog, setShowPregnancyDialog] = useState(false);
  const [lastPeriodInput, setLastPeriodInput] = useState("");
  const [currentTheme, setCurrentTheme] = useState<ThemeVariant>(loadTheme());
  const [showThemeDialog, setShowThemeDialog] = useState(false);

  const handleClearHistory = () => {
    if (confirm("Are you sure you want to clear all history?")) {
      clearPeriodHistory();
      setHistory([]);
    }
  };

  const handlePregnancyToggle = (checked: boolean) => {
    if (checked) {
      setShowPregnancyDialog(true);
    } else {
      const updated = { ...pregnancyMode, isPregnancyMode: false };
      savePregnancyMode(updated);
      setPregnancyMode(updated);
      notifySuccess("Switched back to Period Tracking Mode");
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
    <div className="min-h-screen bg-white pb-20">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <header className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2 tracking-tight">
            Settings
          </h2>
          <p className="text-base text-muted-foreground">
            Manage your app preferences
          </p>
        </header>

        <div className="max-w-2xl mx-auto space-y-4">
          {/* Pregnancy Mode Toggle */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-pink-100 to-purple-100 rounded-xl">
                  <Baby className="w-6 h-6 text-pink-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    Pregnancy Mode
                    {pregnancyMode.isPregnancyMode && <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {pregnancyMode.isPregnancyMode 
                      ? "Track your pregnancy journey" 
                      : "Switch to pregnancy tracking"}
                  </p>
                </div>
              </div>
              <Switch
                checked={pregnancyMode.isPregnancyMode}
                onCheckedChange={handlePregnancyToggle}
              />
            </div>
          </div>

          {/* Period History Section */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-pink-100 rounded-xl">
                  <Calendar className="w-6 h-6 text-pink-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Period History</h3>
                  <p className="text-sm text-muted-foreground">View your period updates</p>
                </div>
              </div>
              {history.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearHistory}
                  className="text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-xl">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground text-sm">No history yet</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {history.map((entry) => (
                  <div
                    key={entry.id}
                    className="bg-gray-50 p-4 rounded-xl"
                  >
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <Clock className="w-4 h-4" />
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

          {/* Disguise Mode */}
          <div className="glass-card rounded-2xl p-5">
            <DisguiseMode />
          </div>

          {/* Data Backup */}
          <div className="glass-card rounded-2xl p-5">
            <DataBackup />
          </div>

          {/* Theme Selector */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <button 
              onClick={() => setShowThemeDialog(true)}
              className="w-full flex items-center gap-4 p-5 hover:bg-muted/50 transition-colors"
            >
              <div className="p-3 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-xl">
                <Palette className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-lg font-semibold text-foreground">Theme</h3>
                <p className="text-sm text-muted-foreground">
                  Current: {currentTheme === 'light' ? 'Light' : currentTheme.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Pregnancy Setup Dialog */}
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

      {/* Theme Selector Dialog */}
      <Dialog open={showThemeDialog} onOpenChange={setShowThemeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Choose Your Theme</DialogTitle>
            <DialogDescription>
              Select a theme that matches your style
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-3 py-4">
            {themeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  handleThemeChange(option.value);
                  setShowThemeDialog(false);
                }}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                  currentTheme === option.value 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className={`w-16 h-16 rounded-lg ${option.color}`} />
                <div className="flex-1 text-left">
                  <h4 className="font-semibold text-foreground">{option.label}</h4>
                  {currentTheme === option.value && (
                    <p className="text-xs text-primary">Currently active</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
