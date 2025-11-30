import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Droplets, Plus, Trash2, Bell } from "lucide-react";
import {
  loadWaterReminderSettings,
  saveWaterReminderSettings,
  type WaterReminderSettings,
} from "@/lib/waterReminderStorage";
import { scheduleWaterReminders, updateWaterReminders } from "@/lib/waterNotifications";
import { toast } from "sonner";

export const WaterReminderSettingsCard = () => {
  const [settings, setSettings] = useState<WaterReminderSettings>(loadWaterReminderSettings());
  const [newTime, setNewTime] = useState("");

  useEffect(() => {
    if (settings.enabled) {
      scheduleWaterReminders();
    }
  }, [settings]);

  const handleToggle = (enabled: boolean) => {
    const updated = { ...settings, enabled };
    setSettings(updated);
    saveWaterReminderSettings(updated);
    
    if (enabled) {
      scheduleWaterReminders();
      toast.success("Water reminders enabled");
    } else {
      toast.info("Water reminders disabled");
    }
  };

  const handleAddTime = () => {
    if (!newTime) return;
    
    if (settings.times.includes(newTime)) {
      toast.error("This time is already added");
      return;
    }

    const updated = {
      ...settings,
      times: [...settings.times, newTime].sort(),
    };
    setSettings(updated);
    saveWaterReminderSettings(updated);
    setNewTime("");
    
    if (settings.enabled) {
      scheduleWaterReminders();
    }
    toast.success("Reminder time added");
  };

  const handleRemoveTime = (time: string) => {
    const updated = {
      ...settings,
      times: settings.times.filter((t) => t !== time),
    };
    setSettings(updated);
    saveWaterReminderSettings(updated);
    
    if (settings.enabled) {
      scheduleWaterReminders();
    }
    toast.success("Reminder time removed");
  };

  const handleDailyGoalChange = (goal: number) => {
    const updated = { ...settings, dailyGoal: goal };
    setSettings(updated);
    saveWaterReminderSettings(updated);
  };

  const handleCycleGoalChange = (phase: keyof WaterReminderSettings["cycleBasedGoals"], extra: number) => {
    const updated = {
      ...settings,
      cycleBasedGoals: {
        ...settings.cycleBasedGoals,
        [phase]: extra,
      },
    };
    setSettings(updated);
    saveWaterReminderSettings(updated);
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Droplets className="h-6 w-6 text-primary" />
          <div>
            <h3 className="text-lg font-semibold text-foreground">Water Intake Reminders</h3>
            <p className="text-sm text-muted-foreground">Stay hydrated throughout the day</p>
          </div>
        </div>
        <Switch checked={settings.enabled} onCheckedChange={handleToggle} />
      </div>

      {settings.enabled && (
        <>
          <div className="space-y-3">
            <Label className="text-foreground">Daily Goal (glasses)</Label>
            <Input
              type="number"
              min="1"
              max="20"
              value={settings.dailyGoal}
              onChange={(e) => handleDailyGoalChange(Number(e.target.value))}
              className="w-32"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-foreground">Cycle-Based Adjustments (extra glasses)</Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm text-muted-foreground">During Period</Label>
                <Input
                  type="number"
                  min="0"
                  max="5"
                  value={settings.cycleBasedGoals.menstruation}
                  onChange={(e) => handleCycleGoalChange("menstruation", Number(e.target.value))}
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Follicular Phase</Label>
                <Input
                  type="number"
                  min="0"
                  max="5"
                  value={settings.cycleBasedGoals.follicular}
                  onChange={(e) => handleCycleGoalChange("follicular", Number(e.target.value))}
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Ovulation</Label>
                <Input
                  type="number"
                  min="0"
                  max="5"
                  value={settings.cycleBasedGoals.ovulation}
                  onChange={(e) => handleCycleGoalChange("ovulation", Number(e.target.value))}
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Luteal Phase</Label>
                <Input
                  type="number"
                  min="0"
                  max="5"
                  value={settings.cycleBasedGoals.luteal}
                  onChange={(e) => handleCycleGoalChange("luteal", Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-foreground">Reminder Times</Label>
            <div className="flex gap-2">
              <Input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleAddTime} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              {settings.times.map((time) => (
                <div
                  key={time}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <span className="font-medium text-foreground">{time}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveTime(time)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              {settings.times.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No reminder times set. Add times above.
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </Card>
  );
};
