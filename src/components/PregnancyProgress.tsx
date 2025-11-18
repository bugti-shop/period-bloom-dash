import { Progress } from "@/components/ui/progress";
import { getBabyDataForWeek, getTrimesterInfo } from "@/lib/pregnancyData";
import { calculateTrimester, getProgressPercentage } from "@/lib/pregnancyMode";
import { Sparkles, Baby, Calendar } from "lucide-react";
import { WeeklyTips } from "@/components/WeeklyTips";
import { getFetalImageForWeek, getFetalImageScale } from "@/lib/fetalImages";
import { Button } from "@/components/ui/button";
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
  const fetalImage = getFetalImageForWeek(week);
  const imageScale = getFetalImageScale(week);
  
  const [isLmpDialogOpen, setIsLmpDialogOpen] = useState(false);
  const [isWeekDialogOpen, setIsWeekDialogOpen] = useState(false);
  const [newLmpDate, setNewLmpDate] = useState("");

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
  
  return (
    <div className="space-y-4">
      {/* Week Display */}
      <div className={`relative bg-gradient-to-br ${trimesterInfo.color} rounded-2xl p-6 text-white overflow-hidden`}>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm opacity-90 mb-1">You're in</p>
              <h2 className="text-4xl font-bold">Week {week}</h2>
              <p className="text-sm opacity-90 mt-1">{trimesterInfo.name}</p>
            </div>
            <div className="text-6xl animate-pulse">
              <Baby className="w-16 h-16" />
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="opacity-90">{progress}% Complete</span>
              <span className="opacity-90">{40 - week} weeks to go</span>
            </div>
            <Progress value={progress} className="h-3 bg-white/30" />
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />
      </div>

      {/* Baby Size Card */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-pink-500" />
          <h3 className="text-lg font-semibold text-foreground">Your Baby This Week</h3>
        </div>
        
        <div className="flex items-center gap-6 mb-4">
          <div className="text-7xl animate-bounce">
            {babyData.emoji}
          </div>
          <div className="flex-1">
            <p className="text-2xl font-bold text-foreground mb-2">
              Size of a {babyData.size}
            </p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-pink-50 rounded-lg p-2">
                <p className="text-muted-foreground text-xs">Height</p>
                <p className="font-semibold text-foreground">{babyData.heightCm} cm</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-2">
                <p className="text-muted-foreground text-xs">Weight</p>
                <p className="font-semibold text-foreground">
                  {babyData.weightGrams >= 1000 
                    ? `${(babyData.weightGrams / 1000).toFixed(2)} kg` 
                    : `${babyData.weightGrams} g`}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4">
          <p className="text-sm text-foreground leading-relaxed">{babyData.description}</p>
        </div>
      </div>

      {/* Due Date Card */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-pink-100 dark:bg-pink-900/30 rounded-xl">
            <Calendar className="w-6 h-6 text-pink-600 dark:text-pink-400" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Estimated Due Date</p>
            <p className="text-xl font-bold text-foreground">
              {dueDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {/* Fetal Development Visualization */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Baby className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Your Baby's Development</h3>
        </div>
        
        <div className="flex justify-center mb-4">
          <img 
            src={fetalImage} 
            alt={`Fetal development at week ${week}`}
            style={{ 
              width: `${80 * imageScale}px`,
              height: `${80 * imageScale}px`,
              maxWidth: '220px',
              maxHeight: '220px'
            }}
            className="object-contain transition-all duration-300"
          />
        </div>

        <div className="flex flex-row gap-2 justify-center">
          <Dialog open={isLmpDialogOpen} onOpenChange={setIsLmpDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-[49%] h-11 bg-pink-500 hover:bg-pink-600 text-white font-semibold text-base" style={{ borderRadius: '0.45rem' }}>
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
              <Button variant="outline" className="w-[49%] h-11 bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300 font-semibold text-base" style={{ borderRadius: '0.45rem' }}>
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

        <p className="text-xs text-muted-foreground text-center mt-4">
          Medically accurate visualization of fetal development
        </p>
      </div>
    </div>
  );
};

