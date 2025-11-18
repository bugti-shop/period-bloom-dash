import { useState } from "react";
import { Thermometer, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { saveBBTReading, loadBBTReadings, deleteBBTReading, BBTReading } from "@/lib/bbtStorage";
import { notifySuccess, notifyError } from "@/lib/notificationWithHaptics";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export const BBTTracker = () => {
  const [readings, setReadings] = useState<BBTReading[]>(loadBBTReadings());
  const [date, setDate] = useState("");
  const [temperature, setTemperature] = useState("");
  const [notes, setNotes] = useState("");

  const handleAdd = () => {
    if (!date || !temperature) {
      notifyError("Please enter date and temperature");
      return;
    }

    const temp = parseFloat(temperature);
    if (isNaN(temp) || temp < 35 || temp > 40) {
      notifyError("Please enter a valid temperature (35-40°C)");
      return;
    }

    const reading: BBTReading = {
      id: Date.now().toString(),
      date,
      temperature: temp,
      notes: notes || undefined,
    };

    saveBBTReading(reading);
    setReadings(loadBBTReadings());
    setDate("");
    setTemperature("");
    setNotes("");
    notifySuccess("Temperature recorded");
  };

  const handleDelete = (id: string) => {
    deleteBBTReading(id);
    setReadings(loadBBTReadings());
    notifySuccess("Reading deleted");
  };

  const chartData = readings.slice(-30).map(r => ({
    date: new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    temp: r.temperature,
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
          <Thermometer className="w-6 h-6 text-orange-600 dark:text-orange-400" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-foreground">BBT Tracker</h3>
          <p className="text-sm text-muted-foreground">Track basal body temperature</p>
        </div>
      </div>

      <div className="glass-card rounded-xl p-4 space-y-4">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="bbt-date">Date</Label>
              <Input
                id="bbt-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="bbt-temp">Temperature (°C)</Label>
              <Input
                id="bbt-temp"
                type="number"
                step="0.1"
                min="35"
                max="40"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                placeholder="36.5"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="bbt-notes">Notes (Optional)</Label>
            <Textarea
              id="bbt-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any observations..."
              rows={2}
            />
          </div>

          <Button onClick={handleAdd} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Reading
          </Button>
        </div>

        {chartData.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-foreground">Temperature Chart (Last 30 Days)</h4>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" style={{ fontSize: 10 }} />
                <YAxis domain={[35, 40]} style={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="temp" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {readings.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No readings yet</p>
          ) : (
            readings.slice().reverse().map((reading) => (
              <div key={reading.id} className="flex items-start justify-between p-3 bg-background/50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">{new Date(reading.date).toLocaleDateString()}</p>
                    <span className="text-sm font-bold text-orange-600">{reading.temperature}°C</span>
                  </div>
                  {reading.notes && (
                    <p className="text-xs text-muted-foreground mt-1">{reading.notes}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(reading.id)}
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
