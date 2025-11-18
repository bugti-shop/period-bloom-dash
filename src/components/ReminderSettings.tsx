import { useState } from "react";
import { Bell, Clock } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ReminderSettings as ReminderSettingsType,
  loadReminderSettings,
  updateReminderSetting,
  saveReminderSettings,
} from "@/lib/reminderStorage";
import { notifySuccess } from "@/lib/notificationWithHaptics";
import { requestNotificationPermission } from "@/lib/notifications";

export const ReminderSettings = () => {
  const [settings, setSettings] = useState<ReminderSettingsType[]>(loadReminderSettings());

  const handleToggle = async (index: number) => {
    const newSettings = [...settings];
    const wasEnabled = newSettings[index].enabled;
    
    if (!wasEnabled) {
      // Request permission when enabling a reminder
      const hasPermission = await requestNotificationPermission();
      if (!hasPermission) {
        notifySuccess("Please enable notifications in your device settings");
        return;
      }
    }
    
    newSettings[index].enabled = !wasEnabled;
    setSettings(newSettings);
    saveReminderSettings(newSettings);
    notifySuccess(wasEnabled ? "Reminder disabled" : "Reminder enabled");
  };

  const handleTimeChange = (index: number, time: string) => {
    const newSettings = [...settings];
    newSettings[index].time = time;
    setSettings(newSettings);
    saveReminderSettings(newSettings);
  };

  const handleDaysBeforeChange = (index: number, days: number) => {
    const newSettings = [...settings];
    newSettings[index].daysBeforeEvent = days;
    setSettings(newSettings);
    saveReminderSettings(newSettings);
  };

  const getReminderIcon = (type: string) => {
    return <Bell className="w-5 h-5" />;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
          <Bell className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Reminders & Notifications</h2>
          <p className="text-sm text-muted-foreground">Customize your reminder preferences</p>
        </div>
      </div>

      <div className="space-y-3">
        {settings.map((setting, index) => (
          <div key={setting.type} className="glass-card rounded-xl p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-start gap-3 flex-1">
                <div className="p-2 bg-primary/10 rounded-lg mt-1">
                  {getReminderIcon(setting.type)}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{setting.title}</h3>
                  {setting.description && (
                    <p className="text-sm text-muted-foreground">{setting.description}</p>
                  )}
                  
                  {setting.enabled && setting.time !== undefined && (
                    <div className="mt-3 space-y-2">
                      <Label htmlFor={`time-${setting.type}`} className="text-xs">
                        Reminder Time
                      </Label>
                      <Input
                        id={`time-${setting.type}`}
                        type="time"
                        value={setting.time}
                        onChange={(e) => handleTimeChange(index, e.target.value)}
                        className="w-32"
                      />
                    </div>
                  )}
                  
                  {setting.enabled && setting.daysBeforeEvent !== undefined && (
                    <div className="mt-3 space-y-2">
                      <Label htmlFor={`days-${setting.type}`} className="text-xs">
                        Days Before
                      </Label>
                      <Input
                        id={`days-${setting.type}`}
                        type="number"
                        min="0"
                        max="7"
                        value={setting.daysBeforeEvent}
                        onChange={(e) => handleDaysBeforeChange(index, parseInt(e.target.value))}
                        className="w-20"
                      />
                    </div>
                  )}
                </div>
              </div>
              <Switch
                checked={setting.enabled}
                onCheckedChange={() => handleToggle(index)}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-xl p-4 mt-6">
        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">About Reminders</p>
            <p className="text-xs text-muted-foreground mt-1">
              Reminders will be sent as notifications on your device. Make sure notifications are enabled in your device settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
