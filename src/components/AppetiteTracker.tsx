import { useState } from "react";
import { Apple, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { saveAppetiteEntry, loadAppetiteLog, deleteAppetiteEntry, AppetiteEntry } from "@/lib/appetiteStorage";
import { notifySuccess, notifyError } from "@/lib/notificationWithHaptics";

export const AppetiteTracker = () => {
  const [entries, setEntries] = useState<AppetiteEntry[]>(loadAppetiteLog());
  const [date, setDate] = useState("");
  const [level, setLevel] = useState<"low" | "normal" | "high">("normal");
  const [cravings, setCravings] = useState("");
  const [aversions, setAversions] = useState("");
  const [notes, setNotes] = useState("");

  const handleAdd = () => {
    if (!date) {
      notifyError("Please select a date");
      return;
    }

    const entry: AppetiteEntry = {
      id: Date.now().toString(),
      date,
      level,
      cravings: cravings || undefined,
      aversions: aversions || undefined,
      notes: notes || undefined,
    };

    saveAppetiteEntry(entry);
    setEntries(loadAppetiteLog());
    setDate("");
    setLevel("normal");
    setCravings("");
    setAversions("");
    setNotes("");
    notifySuccess("Appetite entry added");
  };

  const handleDelete = (id: string) => {
    deleteAppetiteEntry(id);
    setEntries(loadAppetiteLog());
    notifySuccess("Entry deleted");
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "low": return "text-blue-600";
      case "high": return "text-orange-600";
      default: return "text-green-600";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
          <Apple className="w-6 h-6 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-foreground">Appetite Tracker</h3>
          <p className="text-sm text-muted-foreground">Track hunger and food preferences</p>
        </div>
      </div>

      <div className="glass-card rounded-xl p-4 space-y-4">
        <div className="space-y-3">
          <div>
            <Label htmlFor="appetite-date">Date</Label>
            <Input
              id="appetite-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div>
            <Label>Appetite Level</Label>
            <RadioGroup value={level} onValueChange={(v) => setLevel(v as any)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="low" id="low" />
                <Label htmlFor="low">Low</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="normal" id="normal" />
                <Label htmlFor="normal">Normal</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="high" id="high" />
                <Label htmlFor="high">High</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="cravings">Cravings (Optional)</Label>
            <Input
              id="cravings"
              value={cravings}
              onChange={(e) => setCravings(e.target.value)}
              placeholder="e.g., chocolate, pickles"
            />
          </div>

          <div>
            <Label htmlFor="aversions">Aversions (Optional)</Label>
            <Input
              id="aversions"
              value={aversions}
              onChange={(e) => setAversions(e.target.value)}
              placeholder="e.g., coffee, meat"
            />
          </div>

          <div>
            <Label htmlFor="appetite-notes">Notes (Optional)</Label>
            <Textarea
              id="appetite-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes..."
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
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">{new Date(entry.date).toLocaleDateString()}</p>
                    <span className={`text-sm font-semibold capitalize ${getLevelColor(entry.level)}`}>
                      {entry.level}
                    </span>
                  </div>
                  {entry.cravings && (
                    <p className="text-xs text-muted-foreground">Cravings: {entry.cravings}</p>
                  )}
                  {entry.aversions && (
                    <p className="text-xs text-muted-foreground">Aversions: {entry.aversions}</p>
                  )}
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
