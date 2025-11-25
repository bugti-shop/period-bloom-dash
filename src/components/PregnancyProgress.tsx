import { getBabyDataForWeek, getTrimesterInfo } from "@/lib/pregnancyData";
import { calculateTrimester, getProgressPercentage } from "@/lib/pregnancyMode";
import { Sparkles, Baby, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FetalDevelopmentVisualization } from "@/components/FetalDevelopmentVisualization";

interface PregnancyProgressProps {
  week: number;
  dueDate: Date;
  onUpdateLastPeriod: (date: Date) => void;
  onSwitchWeek: (week: number) => void;
}

export const PregnancyProgress = ({ week, dueDate, onUpdateLastPeriod, onSwitchWeek }: PregnancyProgressProps) => {
  const babyData = getBabyDataForWeek(week);
  const trimester = calculateTrimester(week);
  const trimesterInfo = getTrimesterInfo(trimester);
  const progress = getProgressPercentage(week);
  
  const [isLmpDialogOpen, setIsLmpDialogOpen] = useState(false);
  const [isWeekDialogOpen, setIsWeekDialogOpen] = useState(false);
  const [newLmpDate, setNewLmpDate] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);

  const handleUpdateLmp = () => {
    if (newLmpDate) {
      onUpdateLastPeriod(new Date(newLmpDate));
      setIsLmpDialogOpen(false);
      setNewLmpDate("");
    }
  };

  const handleWeekSelect = (selectedWeek: number) => {
    onSwitchWeek(selectedWeek);
    setIsWeekDialogOpen(false);
  };

  const handleWeekChange = (newWeek: number) => {
    setIsAnimating(true);
    setTimeout(() => {
      onSwitchWeek(newWeek);
      setIsAnimating(false);
    }, 150);
  };

  const handlePrevious = () => {
    if (week > 1) {
      handleWeekChange(week - 1);
    }
  };

  const handleNext = () => {
    if (week < 40) {
      handleWeekChange(week + 1);
    }
  };

  const handleSliderChange = (value: number[]) => {
    handleWeekChange(value[0]);
  };
  
  return (
    <div className="space-y-4">
      {/* Week Card */}
      <div className="bg-primary rounded-2xl p-6 text-primary-foreground">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm opacity-90 mb-1">You're in</p>
            <h2 className="text-4xl font-bold mb-1">Week {week}</h2>
            <p className="text-sm opacity-90">{trimesterInfo.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevious}
              disabled={week === 1}
              className="p-2 rounded-lg hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous week"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              disabled={week === 40}
              className="p-2 rounded-lg hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Next week"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm opacity-90">
            <span>{progress}% Complete</span>
            <span>{40 - week} weeks to go</span>
          </div>
          <div className="h-2 bg-white/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white/90 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mt-4 px-1">
          <Slider
            value={[week]}
            onValueChange={handleSliderChange}
            min={1}
            max={40}
            step={1}
            className="w-full [&_[role=slider]]:bg-white [&_[role=slider]]:border-white"
          />
          <div className="flex justify-between text-xs opacity-75 mt-2">
            <span>Week 1</span>
            <span>Week 20</span>
            <span>Week 40</span>
          </div>
        </div>
      </div>

      {/* Baby Size Card */}
      <div className="bg-card rounded-2xl p-6 border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-card-foreground">Your Baby This Week</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevious}
              disabled={week === 1}
              className="p-2 rounded-lg hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous week"
            >
              <ChevronLeft className="w-5 h-5 text-primary" />
            </button>
            <button
              onClick={handleNext}
              disabled={week === 40}
              className="p-2 rounded-lg hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Next week"
            >
              <ChevronRight className="w-5 h-5 text-primary" />
            </button>
          </div>
        </div>
        
        <div className={`transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
          <div className="flex items-center gap-6 mb-4">
            <div className="text-7xl">
              {babyData.emoji}
            </div>
            <div className="flex-1">
              <p className="text-2xl font-bold text-card-foreground mb-3">
                Size of a {babyData.size}
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-muted-foreground text-xs mb-1">Height</p>
                  <p className="font-semibold text-card-foreground">{babyData.heightCm} cm</p>
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-muted-foreground text-xs mb-1">Weight</p>
                  <p className="font-semibold text-card-foreground">
                    {babyData.weightGrams >= 1000 
                      ? `${(babyData.weightGrams / 1000).toFixed(2)} kg` 
                      : `${babyData.weightGrams} g`}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-muted/50 rounded-xl p-4 mb-4">
            <p className="text-sm text-card-foreground leading-relaxed">{babyData.description}</p>
          </div>
        </div>

        <div className="px-1">
          <Slider
            value={[week]}
            onValueChange={handleSliderChange}
            min={1}
            max={40}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>Week 1</span>
            <span className="font-semibold text-primary">Week {week}</span>
            <span>Week 40</span>
          </div>
        </div>
      </div>

      {/* Fetal Development Visualization */}
      <FetalDevelopmentVisualization week={week} onWeekChange={onSwitchWeek} />

      {/* Due Date Card */}
      <div className="bg-card rounded-2xl p-5 border">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Calendar className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Estimated Due Date</p>
            <p className="text-xl font-bold text-card-foreground">
              {dueDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {/* Baby Development Card */}
      <div className="bg-card rounded-2xl p-6 border">
        <div className="flex items-center gap-2 mb-6">
          <Baby className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-card-foreground">Your Baby's Development</h3>
        </div>

        <div className="flex gap-2 mb-4">
          <Dialog open={isLmpDialogOpen} onOpenChange={setIsLmpDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex-1 h-11 text-base font-semibold">
                Update
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Last Period Date</DialogTitle>
                <DialogDescription>
                  Enter your last menstrual period (LMP) start date to recalculate your pregnancy week.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="lmp-date">Last Period Start Date</Label>
                  <Input
                    id="lmp-date"
                    type="date"
                    value={newLmpDate}
                    onChange={(e) => setNewLmpDate(e.target.value)}
                  />
                </div>
                <Button onClick={handleUpdateLmp} className="w-full">
                  Update Date
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isWeekDialogOpen} onOpenChange={setIsWeekDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1 h-11 text-base font-semibold">
                Week
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[80vh]">
              <DialogHeader>
                <DialogTitle>Select Pregnancy Week</DialogTitle>
                <DialogDescription>
                  Choose a week to view. The app will still auto-update based on your LMP.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-4 gap-2 py-4 max-h-96 overflow-y-auto">
                {Array.from({ length: 40 }, (_, i) => i + 1).map((weekNum) => (
                  <Button
                    key={weekNum}
                    variant={weekNum === week ? "default" : "outline"}
                    onClick={() => handleWeekSelect(weekNum)}
                    className="h-12"
                  >
                    Week {weekNum}
                  </Button>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Medically accurate visualization of fetal development
        </p>
      </div>
    </div>
  );
};

