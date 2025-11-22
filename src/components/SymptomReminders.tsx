import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { loadFromLocalStorage, saveToLocalStorage } from "@/lib/storage";

interface Reminder {
  id: string;
  time: string;
  enabled: boolean;
  days: string[];
}

const STORAGE_KEY = "symptom-reminders";

export const SymptomReminders = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [newTime, setNewTime] = useState("20:00");
  const { toast } = useToast();

  useEffect(() => {
    const saved = loadFromLocalStorage<Reminder[]>(STORAGE_KEY) || [];
    setReminders(saved);
    
    // Schedule notifications for enabled reminders
    saved.forEach(reminder => {
      if (reminder.enabled) {
        scheduleNotification(reminder);
      }
    });
  }, []);

  const scheduleNotification = (reminder: Reminder) => {
    // Check if browser supports notifications
    if (!("Notification" in window)) {
      return;
    }

    // Request permission
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }

    // Schedule daily notification
    const [hours, minutes] = reminder.time.split(":").map(Number);
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes, 0, 0);

    if (scheduledTime < now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const timeUntilNotification = scheduledTime.getTime() - now.getTime();

    setTimeout(() => {
      if (Notification.permission === "granted") {
        new Notification("Time to Log Symptoms", {
          body: "Don't forget to record your symptoms for today!",
          icon: "/logo.png",
          tag: reminder.id
        });
      }
      
      // Reschedule for next day
      scheduleNotification(reminder);
    }, timeUntilNotification);
  };

  const addReminder = () => {
    const newReminder: Reminder = {
      id: Date.now().toString(),
      time: newTime,
      enabled: true,
      days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    };

    const updated = [...reminders, newReminder];
    setReminders(updated);
    saveToLocalStorage(STORAGE_KEY, updated);
    scheduleNotification(newReminder);

    toast({
      title: "Reminder added",
      description: `Daily reminder set for ${newTime}`
    });
  };

  const toggleReminder = (id: string) => {
    const updated = reminders.map(r =>
      r.id === id ? { ...r, enabled: !r.enabled } : r
    );
    setReminders(updated);
    saveToLocalStorage(STORAGE_KEY, updated);

    const reminder = updated.find(r => r.id === id);
    if (reminder?.enabled) {
      scheduleNotification(reminder);
    }
  };

  const deleteReminder = (id: string) => {
    const updated = reminders.filter(r => r.id !== id);
    setReminders(updated);
    saveToLocalStorage(STORAGE_KEY, updated);

    toast({
      title: "Reminder deleted",
      description: "The reminder has been removed"
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Symptom Reminders
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <input
            type="time"
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
            className="flex-1 px-3 py-2 border border-border rounded-lg bg-background"
          />
          <Button onClick={addReminder} size="icon">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {reminders.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No reminders set. Add one to get daily notifications.
          </p>
        ) : (
          <div className="space-y-3">
            {reminders.map((reminder) => (
              <div
                key={reminder.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border"
              >
                <div className="flex items-center gap-3">
                  <Switch
                    checked={reminder.enabled}
                    onCheckedChange={() => toggleReminder(reminder.id)}
                  />
                  <div>
                    <p className="font-medium">{reminder.time}</p>
                    <p className="text-xs text-muted-foreground">Daily</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteReminder(reminder.id)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-muted-foreground mt-4">
          * Make sure to allow notifications in your browser settings.
        </p>
      </CardContent>
    </Card>
  );
};
