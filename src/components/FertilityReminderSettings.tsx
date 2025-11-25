import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Bell, Calendar, Heart, Droplet } from "lucide-react";
import {
  loadFertilityReminders,
  saveFertilityReminders,
  FertilityReminder,
} from "@/lib/fertilityReminderStorage";
import { useToast } from "@/hooks/use-toast";
import { requestNotificationPermission } from "@/lib/notifications";

export const FertilityReminderSettings = () => {
  const [reminders, setReminders] = useState<FertilityReminder>(loadFertilityReminders());
  const { toast } = useToast();

  useEffect(() => {
    const savedReminders = loadFertilityReminders();
    setReminders(savedReminders);
  }, []);

  const handleToggle = async (type: keyof Omit<FertilityReminder, "reminderTime">) => {
    const hasPermission = await requestNotificationPermission();
    
    if (!hasPermission && !reminders[type]) {
      toast({
        title: "Notifications Disabled",
        description: "Please enable notifications in your device settings to receive reminders.",
        variant: "destructive",
      });
      return;
    }

    const updatedReminders = {
      ...reminders,
      [type]: !reminders[type],
    };
    
    setReminders(updatedReminders);
    saveFertilityReminders(updatedReminders);
    
    toast({
      title: reminders[type] ? "Reminder Disabled" : "Reminder Enabled",
      description: `${type === "fertileWindow" ? "Fertile Window" : type === "ovulationDay" ? "Ovulation Day" : "Period Start"} reminder ${reminders[type] ? "disabled" : "enabled"}.`,
    });
  };

  const handleTimeChange = (time: string) => {
    const updatedReminders = {
      ...reminders,
      reminderTime: time,
    };
    
    setReminders(updatedReminders);
    saveFertilityReminders(updatedReminders);
    
    toast({
      title: "Reminder Time Updated",
      description: `Reminders will be sent at ${time}.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Bell className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Fertility Reminders</h3>
          <p className="text-sm text-muted-foreground">Manage your cycle notifications</p>
        </div>
      </div>

      {/* Period Start Reminder */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg">
            <Droplet className="w-5 h-5 text-pink-600" />
          </div>
          <div>
            <Label htmlFor="period-start" className="text-sm font-medium text-foreground cursor-pointer">
              Period Start
            </Label>
            <p className="text-xs text-muted-foreground">1 day before expected period</p>
          </div>
        </div>
        <Switch
          id="period-start"
          checked={reminders.periodStart}
          onCheckedChange={() => handleToggle("periodStart")}
        />
      </div>

      {/* Fertile Window Reminder */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg">
            <Heart className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <Label htmlFor="fertile-window" className="text-sm font-medium text-foreground cursor-pointer">
              Fertile Window
            </Label>
            <p className="text-xs text-muted-foreground">5 days before ovulation</p>
          </div>
        </div>
        <Switch
          id="fertile-window"
          checked={reminders.fertileWindow}
          onCheckedChange={() => handleToggle("fertileWindow")}
        />
      </div>

      {/* Ovulation Day Reminder */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg">
            <Calendar className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <Label htmlFor="ovulation" className="text-sm font-medium text-foreground cursor-pointer">
              Ovulation Day
            </Label>
            <p className="text-xs text-muted-foreground">Peak fertility day</p>
          </div>
        </div>
        <Switch
          id="ovulation"
          checked={reminders.ovulationDay}
          onCheckedChange={() => handleToggle("ovulationDay")}
        />
      </div>

      {/* Reminder Time */}
      <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
        <Label htmlFor="reminder-time" className="text-sm font-medium text-foreground mb-2 block">
          Reminder Time
        </Label>
        <Input
          id="reminder-time"
          type="time"
          value={reminders.reminderTime}
          onChange={(e) => handleTimeChange(e.target.value)}
          className="bg-white"
        />
        <p className="text-xs text-muted-foreground mt-2">
          All reminders will be sent at this time
        </p>
      </div>
    </div>
  );
};
