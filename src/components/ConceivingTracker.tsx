import { useState, useEffect } from "react";
import { Baby, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { saveConceivingData, loadConceivingData, ConceivingData } from "@/lib/conceivingStorage";
import { notifySuccess } from "@/lib/notificationWithHaptics";
import { differenceInDays } from "date-fns";

export const ConceivingTracker = () => {
  const [data, setData] = useState<ConceivingData>(loadConceivingData());
  const [startDate, setStartDate] = useState(data.startDate || "");
  const [notes, setNotes] = useState(data.notes || "");

  const handleSave = () => {
    const newData: ConceivingData = {
      tryingToConceive: data.tryingToConceive,
      startDate: data.tryingToConceive ? startDate || undefined : undefined,
      notes: notes || undefined,
    };
    
    saveConceivingData(newData);
    setData(newData);
    notifySuccess("Conceiving data saved");
  };

  const handleToggle = (checked: boolean) => {
    setData({ ...data, tryingToConceive: checked });
    if (!checked) {
      setStartDate("");
      setNotes("");
    }
  };

  const daysTrying = data.tryingToConceive && data.startDate 
    ? differenceInDays(new Date(), new Date(data.startDate))
    : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
          <Baby className="w-6 h-6 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-foreground">Conceiving Tracker</h3>
          <p className="text-sm text-muted-foreground">Track your conception journey</p>
        </div>
      </div>

      <div className="glass-card rounded-xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="ttc-toggle">Trying to Conceive</Label>
          <Switch
            id="ttc-toggle"
            checked={data.tryingToConceive}
            onCheckedChange={handleToggle}
          />
        </div>

        {data.tryingToConceive && (
          <>
            <div>
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            {daysTrying > 0 && (
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Days Trying</p>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {daysTrying}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="conceiving-notes">Notes</Label>
              <Textarea
                id="conceiving-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Track your journey, tests taken, doctor visits, etc."
                rows={4}
              />
            </div>
          </>
        )}

        <Button onClick={handleSave} className="w-full">
          Save
        </Button>
      </div>
    </div>
  );
};
