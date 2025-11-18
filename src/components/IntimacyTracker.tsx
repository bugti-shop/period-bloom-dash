import { useState } from "react";
import { Heart, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { saveIntimacyEntry, loadIntimacyLog, deleteIntimacyEntry, IntimacyEntry } from "@/lib/intimacyStorage";
import { notifySuccess, notifyError } from "@/lib/notificationWithHaptics";

export const IntimacyTracker = () => {
  const [entries, setEntries] = useState<IntimacyEntry[]>(loadIntimacyLog());
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [protection, setProtection] = useState(false);

  const handleAdd = () => {
    if (!date) {
      notifyError("Please select a date");
      return;
    }

    const entry: IntimacyEntry = {
      id: Date.now().toString(),
      date,
      notes: notes || undefined,
      protection,
    };

    saveIntimacyEntry(entry);
    setEntries(loadIntimacyLog());
    setDate("");
    setNotes("");
    setProtection(false);
    notifySuccess("Intimacy entry added");
  };

  const handleDelete = (id: string) => {
    deleteIntimacyEntry(id);
    setEntries(loadIntimacyLog());
    notifySuccess("Entry deleted");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-pink-100 dark:bg-pink-900/30 rounded-xl">
          <Heart className="w-6 h-6 text-pink-600 dark:text-pink-400" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-foreground">Intimacy Tracker</h3>
          <p className="text-sm text-muted-foreground">Track intimate moments</p>
        </div>
      </div>

      <div className="glass-card rounded-xl p-4 space-y-4">
        <div className="space-y-3">
          <div>
            <Label htmlFor="intimacy-date">Date</Label>
            <Input
              id="intimacy-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="protection">Used Protection</Label>
            <Switch
              id="protection"
              checked={protection}
              onCheckedChange={setProtection}
            />
          </div>

          <div>
            <Label htmlFor="intimacy-notes">Notes (Optional)</Label>
            <Textarea
              id="intimacy-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any notes..."
              rows={2}
            />
          </div>

          <Button onClick={handleAdd} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Entry
          </Button>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {entries.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No entries yet</p>
          ) : (
            entries.map((entry) => (
              <div key={entry.id} className="flex items-start justify-between p-3 bg-background/50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-foreground">{new Date(entry.date).toLocaleDateString()}</p>
                  <p className="text-sm text-muted-foreground">
                    {entry.protection ? "Protected" : "Unprotected"}
                  </p>
                  {entry.notes && (
                    <p className="text-xs text-muted-foreground mt-1">{entry.notes}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(entry.id)}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
