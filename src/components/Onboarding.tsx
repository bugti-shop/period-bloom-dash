import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { setOnboardingCompleted } from "@/lib/onboardingStorage";
import { savePregnancyMode, calculateDueDate, calculatePregnancyWeek } from "@/lib/pregnancyMode";
import { savePeriodHistory } from "@/lib/periodHistory";
import { saveToLocalStorage } from "@/lib/storage";
import { Heart, Baby, Calendar as CalendarIcon, Sparkles, CheckCircle } from "lucide-react";
import { format } from "date-fns";

interface OnboardingProps {
  onComplete: () => void;
}

export const Onboarding = ({ onComplete }: OnboardingProps) => {
  const [step, setStep] = useState(1);
  const [selectedMode, setSelectedMode] = useState<"period" | "pregnancy" | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const handleModeSelect = (mode: "period" | "pregnancy") => {
    setSelectedMode(mode);
    setStep(3);
  };

  const handleDateSubmit = () => {
    if (!selectedDate || !selectedMode) return;

    if (selectedMode === "pregnancy") {
      const dueDate = calculateDueDate(selectedDate);
      const currentWeek = calculatePregnancyWeek(selectedDate);
      
      savePregnancyMode({
        isPregnancyMode: true,
        lastPeriodDate: selectedDate,
        dueDate,
        currentWeek,
      });
    } else {
      savePregnancyMode({
        isPregnancyMode: false,
      });
      
      const periodLength = 5;
      const cycleLength = 28;
      
      savePeriodHistory({
        lastPeriodDate: selectedDate,
        cycleLength,
        periodDuration: periodLength,
      });
      
      saveToLocalStorage("current-period-data", {
        cycleType: 'regular',
        lastPeriodDate: selectedDate,
        cycleLength,
        periodDuration: periodLength,
      });
    }

    setStep(4);
  };

  const handleComplete = () => {
    setOnboardingCompleted();
    onComplete();
  };

  const handleSkip = () => {
    setOnboardingCompleted();
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-8">
          {/* Step 1: Welcome */}
          {step === 1 && (
            <div className="text-center space-y-6 animate-fade-in">
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-primary" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-3">Welcome to Your Journey</h1>
                <p className="text-muted-foreground text-lg">
                  Your all-in-one companion for period and pregnancy tracking
                </p>
              </div>
              <div className="grid gap-4 text-left max-w-md mx-auto">
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Track Your Cycle</p>
                    <p className="text-sm text-muted-foreground">Monitor periods, symptoms, and fertility</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Pregnancy Companion</p>
                    <p className="text-sm text-muted-foreground">Week-by-week guidance and photo journals</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Complete Privacy</p>
                    <p className="text-sm text-muted-foreground">All data stored locally on your device</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => setStep(2)} size="lg" className="min-w-32">
                  Get Started
                </Button>
                <Button onClick={handleSkip} variant="ghost" size="lg">
                  Skip Setup
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Mode Selection */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Choose Your Mode</h2>
                <p className="text-muted-foreground">You can switch between modes anytime in settings</p>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <button
                  onClick={() => handleModeSelect("period")}
                  className="group p-6 border-2 rounded-lg hover:border-primary transition-all text-left hover:shadow-lg"
                >
                  <div className="w-12 h-12 rounded-full bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Heart className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Period Tracker</h3>
                  <p className="text-sm text-muted-foreground">
                    Track your menstrual cycle, symptoms, fertility windows, and health metrics
                  </p>
                </button>
                <button
                  onClick={() => handleModeSelect("pregnancy")}
                  className="group p-6 border-2 rounded-lg hover:border-primary transition-all text-left hover:shadow-lg"
                >
                  <div className="w-12 h-12 rounded-full bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Baby className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Pregnancy Tracker</h3>
                  <p className="text-sm text-muted-foreground">
                    Follow your pregnancy journey week-by-week with photos, notes, and checklists
                  </p>
                </button>
              </div>
              <div className="flex justify-center">
                <Button onClick={handleSkip} variant="ghost">
                  Skip for Now
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Date Selection */}
          {step === 3 && selectedMode && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <CalendarIcon className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold mb-2">
                  {selectedMode === "pregnancy" 
                    ? "When did your pregnancy start?" 
                    : "When was your last period?"}
                </h2>
                <p className="text-muted-foreground">
                  {selectedMode === "pregnancy"
                    ? "Select your conception date or first day of last period"
                    : "Select the first day of your last menstrual period"}
                </p>
              </div>
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                  disabled={(date) => date > new Date()}
                />
              </div>
              {selectedDate && (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    Selected: {format(selectedDate, "MMMM d, yyyy")}
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button onClick={() => setStep(2)} variant="outline">
                      Back
                    </Button>
                    <Button onClick={handleDateSubmit}>
                      Continue
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Completion */}
          {step === 4 && (
            <div className="text-center space-y-6 animate-fade-in">
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-3">You're All Set!</h2>
                <p className="text-muted-foreground text-lg">
                  Your journey begins now. Start tracking and exploring all features.
                </p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-sm font-medium mb-2">Quick Tips:</p>
                <ul className="text-sm text-muted-foreground space-y-1 text-left">
                  <li>• Use the bottom navigation to explore different sections</li>
                  <li>• Visit Settings to customize your experience</li>
                  <li>• All your data is private and stored locally</li>
                  <li>• Switch modes anytime from Settings</li>
                </ul>
              </div>
              <Button onClick={handleComplete} size="lg">
                Start Tracking
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
