import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { getAllStressLogs } from "@/lib/stressStorage";
import { getAllMoodLogs } from "@/lib/moodLog";
import { getAllDigestiveLogs } from "@/lib/digestiveStorage";
import { getSymptomLogs } from "@/lib/symptomLog";
import { getAllEnergyLogs } from "@/lib/energyStorage";
import { getAllSkinLogs } from "@/lib/skinStorage";
import { format, parseISO, subDays } from "date-fns";

const HealthDashboard = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<"week" | "month">("week");
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const days = timeRange === "week" ? 7 : 30;
    const today = new Date();
    
    const stressLogs = getAllStressLogs();
    const energyLogs = getAllEnergyLogs();
    const moodLogs = getAllMoodLogs();
    const symptomLogs = getSymptomLogs();
    const digestiveLogs = getAllDigestiveLogs();
    const skinLogs = getAllSkinLogs();

    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(today, i);
      const dateStr = format(date, "yyyy-MM-dd");
      
      const stress = stressLogs.find(l => l.date === dateStr);
      const energy = energyLogs.find(l => l.date === dateStr);
      const symptom = symptomLogs.find(l => l.date === dateStr);
      const digestive = digestiveLogs.find(l => l.date === dateStr);
      const skin = skinLogs.find(l => l.date === dateStr);
      
      data.push({
        date: format(date, "MMM dd"),
        stress: stress?.level || 0,
        energy: energy ? (energy.morning + energy.afternoon + energy.evening) / 3 : 0,
        symptoms: symptom?.symptoms.length || 0,
        digestive: digestive?.symptoms.length || 0,
        skin: skin?.conditions.filter(c => c !== "Clear skin").length || 0,
      });
    }
    
    setChartData(data);
  }, [timeRange]);

  const allLogs = {
    stress: getAllStressLogs().length,
    energy: getAllEnergyLogs().length,
    mood: getAllMoodLogs().length,
    symptoms: getSymptomLogs().length,
    digestive: getAllDigestiveLogs().length,
    skin: getAllSkinLogs().length,
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-primary text-primary-foreground p-4 sticky top-0 z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="text-primary-foreground hover:bg-primary-foreground/20"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold mt-2">Health Dashboard</h1>
      </div>

      <div className="p-4 space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-3">
            <p className="text-xs text-muted-foreground">Stress Logs</p>
            <p className="text-2xl font-bold text-primary">{allLogs.stress}</p>
          </Card>
          <Card className="p-3">
            <p className="text-xs text-muted-foreground">Energy Logs</p>
            <p className="text-2xl font-bold text-primary">{allLogs.energy}</p>
          </Card>
          <Card className="p-3">
            <p className="text-xs text-muted-foreground">Mood Logs</p>
            <p className="text-2xl font-bold text-primary">{allLogs.mood}</p>
          </Card>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Card className="p-3">
            <p className="text-xs text-muted-foreground">Symptom Logs</p>
            <p className="text-2xl font-bold text-primary">{allLogs.symptoms}</p>
          </Card>
          <Card className="p-3">
            <p className="text-xs text-muted-foreground">Digestive Logs</p>
            <p className="text-2xl font-bold text-primary">{allLogs.digestive}</p>
          </Card>
          <Card className="p-3">
            <p className="text-xs text-muted-foreground">Skin Logs</p>
            <p className="text-2xl font-bold text-primary">{allLogs.skin}</p>
          </Card>
        </div>

        {/* Time Range Selector */}
        <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as "week" | "month")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="week">Last 7 Days</TabsTrigger>
            <TabsTrigger value="month">Last 30 Days</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Stress & Energy Trend */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Stress & Energy Levels</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="stress"
                stroke="#ef4444"
                name="Stress"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="energy"
                stroke="#22c55e"
                name="Energy"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Symptoms Overview */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Symptom Trends</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Legend />
              <Bar dataKey="symptoms" fill="#ec4899" name="Symptoms" />
              <Bar dataKey="digestive" fill="#f97316" name="Digestive" />
              <Bar dataKey="skin" fill="#8b5cf6" name="Skin Issues" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Quick Actions */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => navigate('/stress')}>
              Log Stress
            </Button>
            <Button variant="outline" onClick={() => navigate('/energy')}>
              Log Energy
            </Button>
            <Button variant="outline" onClick={() => navigate('/digestive')}>
              Log Digestive
            </Button>
            <Button variant="outline" onClick={() => navigate('/skin')}>
              Log Skin
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default HealthDashboard;
