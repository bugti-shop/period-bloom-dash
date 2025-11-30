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
    <div className="space-y-2">
      {/* Week Card */}
      <div className="bg-primary rounded-xl p-4 text-primary-foreground">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xs opacity-90 mb-0.5">You're in</p>
            <h2 className="text-3xl font-bold mb-0.5">Week {week}</h2>
            <p className="text-xs opacity-90">{trimesterInfo.name}</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevious}
              disabled={week === 1}
              className="p-1.5 rounded-lg hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous week"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              disabled={week === 40}
              className="p-1.5 rounded-lg hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Next week"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs opacity-90">
            <span>{progress}% Complete</span>
            <span>{40 - week} weeks to go</span>
          </div>
          <div className="h-1.5 bg-white/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white/90 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mt-3 px-0.5">
          <Slider
            value={[week]}
            onValueChange={handleSliderChange}
            min={1}
            max={40}
            step={1}
            className="w-full [&_[role=slider]]:bg-white [&_[role=slider]]:border-white [&_[role=slider]]:h-3 [&_[role=slider]]:w-3"
          />
          <div className="flex justify-between text-[10px] opacity-75 mt-1.5">
            <span>Week 1</span>
            <span>Week 20</span>
            <span>Week 40</span>
          </div>
        </div>
      </div>

      {/* Baby Size Card */}
      <div className="bg-card rounded-xl p-4 border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-card-foreground">Your Baby This Week</h3>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevious}
              disabled={week === 1}
              className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous week"
            >
              <ChevronLeft className="w-4 h-4 text-primary" />
            </button>
            <button
              onClick={handleNext}
              disabled={week === 40}
              className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Next week"
            >
              <ChevronRight className="w-4 h-4 text-primary" />
            </button>
          </div>
        </div>
        
        <div className={`transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
          <div className="flex items-center gap-4 mb-3">
            <div className="text-5xl">
              {babyData.emoji}
            </div>
            <div className="flex-1">
              <p className="text-lg font-bold text-card-foreground mb-2">
                Size of a {babyData.size}
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-muted rounded-lg p-2">
                  <p className="text-muted-foreground text-[10px] mb-0.5">Height</p>
                  <p className="font-semibold text-card-foreground">{babyData.heightCm} cm</p>
                </div>
                <div className="bg-muted rounded-lg p-2">
                  <p className="text-muted-foreground text-[10px] mb-0.5">Weight</p>
                  <p className="font-semibold text-card-foreground">
                    {babyData.weightGrams >= 1000 
                      ? `${(babyData.weightGrams / 1000).toFixed(2)} kg` 
                      : `${babyData.weightGrams} g`}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-muted/50 rounded-lg p-3 mb-3">
            <p className="text-xs text-card-foreground leading-relaxed">{babyData.description}</p>
          </div>
        </div>

        <div className="px-0.5">
          <Slider
            value={[week]}
            onValueChange={handleSliderChange}
            min={1}
            max={40}
            step={1}
            className="w-full [&_[role=slider]]:h-3 [&_[role=slider]]:w-3"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1.5">
            <span>Week 1</span>
            <span className="font-semibold text-primary">Week {week}</span>
            <span>Week 40</span>
          </div>
        </div>
      </div>

      {/* Fetal Development Visualization */}
      <FetalDevelopmentVisualization week={week} onWeekChange={onSwitchWeek} />

      {/* Due Date Card */}
      <div className="bg-card rounded-xl p-3 border">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Estimated Due Date</p>
            <p className="text-base font-bold text-card-foreground">
              {dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {/* Baby Development Card */}
      <div className="bg-card rounded-xl p-4 border">
        <div className="flex items-center gap-1.5 mb-4">
          <Baby className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-card-foreground">Your Baby's Development</h3>
        </div>

        <div className="flex gap-2 mb-3">
          <Dialog open={isLmpDialogOpen} onOpenChange={setIsLmpDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex-1 h-9 text-sm font-semibold">
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
              <Button variant="outline" className="flex-1 h-9 text-sm font-semibold">
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

        <p className="text-[10px] text-muted-foreground text-center">
          Medically accurate visualization of fetal development
        </p>
      </div>
    </div>
  );
};

