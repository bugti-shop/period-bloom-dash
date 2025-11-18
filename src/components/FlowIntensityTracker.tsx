import { useState } from "react";
import { Droplets } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { FlowIntensity, saveFlowIntensity, getFlowIntensityForDate } from "@/lib/flowIntensityStorage";
import { notifySuccess } from "@/lib/notificationWithHaptics";

export const FlowIntensityTracker = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedIntensity, setSelectedIntensity] = useState<FlowIntensity | null>(null);

  const intensityOptions: { value: FlowIntensity; label: string; color: string; icon: string }[] = [
    { value: "spotting", label: "Spotting", color: "bg-pink-200", icon: "💧" },
    { value: "light", label: "Light", color: "bg-pink-400", icon: "💧💧" },
    { value: "medium", label: "Medium", color: "bg-pink-600", icon: "💧💧💧" },
    { value: "heavy", label: "Heavy", color: "bg-pink-800", icon: "💧💧💧💧" },
  ];

  const handleSave = () => {
    if (selectedDate && selectedIntensity) {
      saveFlowIntensity(selectedDate, selectedIntensity);
      notifySuccess("Flow intensity logged");
      setIsDialogOpen(false);
      setSelectedIntensity(null);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-pink-100 rounded-xl">
            <Droplets className="w-6 h-6 text-pink-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Flow Intensity</h3>
            <p className="text-sm text-muted-foreground">Track your daily flow</p>
          </div>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Log Flow</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log Flow Intensity</DialogTitle>
              <DialogDescription>
                Select a date and flow intensity level
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Flow Intensity</p>
                <div className="grid grid-cols-2 gap-2">
                  {intensityOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSelectedIntensity(option.value)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        selectedIntensity === option.value
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="text-2xl mb-1">{option.icon}</div>
                      <p className="font-semibold text-foreground">{option.label}</p>
                      <div className={`w-full h-2 ${option.color} rounded-full mt-2`} />
                    </button>
                  ))}
                </div>
              </div>

              <Button onClick={handleSave} className="w-full" disabled={!selectedDate || !selectedIntensity}>
                Save Flow Log
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground mb-2">Flow Legend</p>
        <div className="grid grid-cols-2 gap-2">
          {intensityOptions.map((option) => (
            <div key={option.value} className="flex items-center gap-2">
              <div className={`w-4 h-4 ${option.color} rounded`} />
              <span className="text-sm text-foreground">{option.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
