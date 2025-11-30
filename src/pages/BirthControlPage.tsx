import { useState } from "react";
import { useMobileBackButton } from "@/hooks/useMobileBackButton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Check, X, Flame, Bell, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getPillReminder, savePillReminder, logPillTaken, logPillMissed, getPillLogs, checkMissedPills } from "@/lib/birthControlStorage";
import { format } from "date-fns";

export default function BirthControlPage() {
  const navigate = useNavigate();
  useMobileBackButton();
  const { toast } = useToast();
  const [reminder, setReminder] = useState(getPillReminder());
  const [logs] = useState(getPillLogs());
  const missedCount = checkMissedPills();

  const handleToggleReminder = (enabled: boolean) => {
    const updated = { ...reminder, enabled };
    setReminder(updated);
    savePillReminder(updated);
    
    toast({
      title: enabled ? "Reminder enabled" : "Reminder disabled",
      description: enabled ? `Daily reminder set for ${reminder.time}` : "You won't receive pill reminders",
    });
  };

  const handleTimeChange = (time: string) => {
    const updated = { ...reminder, time };
    setReminder(updated);
    savePillReminder(updated);
  };

  const handlePillNameChange = (pillName: string) => {
    const updated = { ...reminder, pillName };
    setReminder(updated);
    savePillReminder(updated);
  };

  const handleTakePill = () => {
    logPillTaken();
    const updated = getPillReminder();
    setReminder(updated);
    
    toast({
      title: "Pill taken! 💊",
      description: `Streak: ${updated.streak} days`,
    });
  };

  const handleMissPill = () => {
    logPillMissed();
    const updated = getPillReminder();
    setReminder(updated);
    
    toast({
      title: "Pill marked as missed",
      description: "Your streak has been reset",
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <h1 className="text-2xl font-bold mb-6">Birth Control Reminder</h1>

        <Card className="p-6 mb-6">
          <div className="flex items-center justify-center mb-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Flame className="w-8 h-8 text-orange-500" />
                <span className="text-5xl font-bold">{reminder.streak}</span>
              </div>
              <p className="text-sm text-muted-foreground">Day Streak</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button onClick={handleTakePill} className="h-16">
              <Check className="w-5 h-5 mr-2" />
              Taken Today
            </Button>
            <Button onClick={handleMissPill} variant="destructive" className="h-16">
              <X className="w-5 h-5 mr-2" />
              Missed
            </Button>
          </div>

          {missedCount > 0 && (
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive font-medium">
                ⚠️ {missedCount} missed pill{missedCount > 1 ? 's' : ''} in the last 7 days
              </p>
            </div>
          )}
        </Card>

        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Reminder Settings</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                <Label>Daily Reminder</Label>
              </div>
              <Switch
                checked={reminder.enabled}
                onCheckedChange={handleToggleReminder}
              />
            </div>

            {reminder.enabled && (
              <>
                <div>
                  <Label>Pill Name</Label>
                  <Input
                    value={reminder.pillName}
                    onChange={(e) => handlePillNameChange(e.target.value)}
                    placeholder="e.g., Birth Control Pill"
                  />
                </div>

                <div>
                  <Label>Reminder Time</Label>
                  <Input
                    type="time"
                    value={reminder.time}
                    onChange={(e) => handleTimeChange(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Recent History</h2>
          
          {logs.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No pill logs yet</p>
          ) : (
            <div className="space-y-3">
              {logs.slice(0, 14).map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">{format(log.date, "EEEE, MMM dd")}</p>
                      {log.takenAt && (
                        <p className="text-sm text-muted-foreground">
                          Taken at {format(log.takenAt, "h:mm a")}
                        </p>
                      )}
                    </div>
                  </div>
                  {log.taken ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <X className="w-5 h-5 text-destructive" />
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
