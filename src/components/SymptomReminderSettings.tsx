import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bell, Plus, X, Clock } from "lucide-react";
import {
  loadSymptomReminders,
  saveSymptomReminders,
  addReminderTime,
  removeReminderTime,
  SymptomReminder,
} from "@/lib/symptomReminderStorage";
import { scheduleSymptomReminders } from "@/lib/symptomNotifications";
import { useToast } from "@/hooks/use-toast";
import { requestNotificationPermission } from "@/lib/notifications";

export const SymptomReminderSettings = () => {
  const [reminders, setReminders] = useState<SymptomReminder>(loadSymptomReminders());
  const [newTime, setNewTime] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const savedReminders = loadSymptomReminders();
    setReminders(savedReminders);
  }, []);

  const handleToggle = async () => {
    const hasPermission = await requestNotificationPermission();
    
    if (!hasPermission && !reminders.enabled) {
      toast({
        title: "Notifications Disabled",
        description: "Please enable notifications in your device settings to receive reminders.",
        variant: "destructive",
      });
      return;
    }

    const updatedReminders = {
      ...reminders,
      enabled: !reminders.enabled,
    };
    
    setReminders(updatedReminders);
    saveSymptomReminders(updatedReminders);
    
    // Schedule or cancel notifications
    await scheduleSymptomReminders();
    
    toast({
      title: reminders.enabled ? "Reminders Disabled" : "Reminders Enabled",
      description: `Symptom logging reminders ${reminders.enabled ? "disabled" : "enabled"}.`,
    });
  };

  const handleAddTime = async () => {
    if (!newTime) {
      toast({
        title: "Invalid Time",
        description: "Please select a time to add.",
        variant: "destructive",
      });
      return;
    }

    if (reminders.times.includes(newTime)) {
      toast({
        title: "Time Already Added",
        description: "This reminder time already exists.",
        variant: "destructive",
      });
      return;
    }

    addReminderTime(newTime);
    setReminders(loadSymptomReminders());
    setNewTime("");
    
    // Reschedule notifications with new time
    await scheduleSymptomReminders();
    
    toast({
      title: "Reminder Time Added",
      description: `Reminder added for ${newTime}.`,
    });
  };

  const handleRemoveTime = async (time: string) => {
    removeReminderTime(time);
    setReminders(loadSymptomReminders());
    
    // Reschedule notifications without removed time
    await scheduleSymptomReminders();
    
    toast({
      title: "Reminder Time Removed",
      description: `Reminder for ${time} removed.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Bell className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Symptom Logging Reminders</h3>
          <p className="text-sm text-muted-foreground">Get reminded to log your symptoms</p>
        </div>
      </div>

      {/* Enable/Disable Toggle */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg">
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <Label htmlFor="symptom-reminders" className="text-sm font-medium text-foreground cursor-pointer">
              Daily Symptom Reminders
            </Label>
            <p className="text-xs text-muted-foreground">Remind me to log symptoms</p>
          </div>
        </div>
        <Switch
          id="symptom-reminders"
          checked={reminders.enabled}
          onCheckedChange={handleToggle}
        />
      </div>

      {/* Reminder Times */}
      {reminders.enabled && (
        <div className="space-y-3">
          <Label className="text-sm font-medium text-foreground">Reminder Times</Label>
          
          {reminders.times.length > 0 && (
            <div className="space-y-2">
              {reminders.times.map((time) => (
                <div
                  key={time}
                  className="flex items-center justify-between p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg"
                >
                  <span className="text-sm font-medium text-foreground">{time}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveTime(time)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Add New Time */}
          <div className="flex gap-2">
            <Input
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="flex-1 bg-white"
            />
            <Button
              onClick={handleAddTime}
              size="sm"
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Add
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground">
            You will receive notifications at these times to log your symptoms
          </p>
        </div>
      )}
    </div>
  );
};
