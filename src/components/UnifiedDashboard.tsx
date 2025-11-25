import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Activity, Heart, Thermometer, Apple, Stethoscope, Smile, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getSymptomsForDate } from "@/lib/symptomLog";
import { loadFromLocalStorage } from "@/lib/storage";
import intimacyImg from "@/assets/tracker-intimacy.jpg";
import bbtImg from "@/assets/tracker-bbt.jpg";
import appetiteImg from "@/assets/tracker-appetite.jpg";
import healthImg from "@/assets/tracker-health.jpg";

interface TrackerSummary {
  name: string;
  icon: any;
  color: string;
  value: string;
  description: string;
  route: string;
  image?: string;
}

export const UnifiedDashboard = () => {
  const navigate = useNavigate();
  const [summaries, setSummaries] = useState<TrackerSummary[]>([]);

  useEffect(() => {
    const today = new Date();
    
    // Get symptoms count
    const symptoms = getSymptomsForDate(today);
    const symptomsCount = symptoms.length;

    // Get mood data
    const moodLog = loadFromLocalStorage<any[]>("mood-log") || [];
    const todayMood = moodLog.find(
      (entry) => format(new Date(entry.date), "yyyy-MM-dd") === format(today, "yyyy-MM-dd")
    );

    // Get intimacy data
    const intimacyLog = loadFromLocalStorage<any[]>("intimacy-log") || [];
    const recentIntimacy = intimacyLog.filter(
      (entry) => new Date(entry.date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );

    // Get BBT data
    const bbtLog = loadFromLocalStorage<any[]>("bbt-log") || [];
    const latestBBT = bbtLog[bbtLog.length - 1];

    // Get appetite data
    const appetiteLog = loadFromLocalStorage<any[]>("appetite-log") || [];
    const todayAppetite = appetiteLog.find(
      (entry) => format(new Date(entry.date), "yyyy-MM-dd") === format(today, "yyyy-MM-dd")
    );

    // Get health data
    const healthLog = loadFromLocalStorage<any[]>("health-log") || [];
    const latestHealth = healthLog[healthLog.length - 1];

    const trackerData: TrackerSummary[] = [
      {
        name: "Symptoms",
        icon: Activity,
        color: "from-pink-500 to-rose-500",
        value: symptomsCount > 0 ? `${symptomsCount} logged` : "No symptoms",
        description: "Today's tracked symptoms",
        route: "/",
        image: undefined
      },
      {
        name: "Mood",
        icon: Smile,
        color: "from-purple-500 to-pink-500",
        value: todayMood ? todayMood.mood : "Not tracked",
        description: "How you're feeling today",
        route: "/",
        image: undefined
      },
      {
        name: "Intimacy",
        icon: Heart,
        color: "from-red-500 to-pink-500",
        value: `${recentIntimacy.length} this week`,
        description: "Recent activity tracking",
        route: "/intimacy",
        image: intimacyImg
      },
      {
        name: "BBT",
        icon: Thermometer,
        color: "from-blue-500 to-cyan-500",
        value: latestBBT ? `${latestBBT.temperature}°F` : "Not recorded",
        description: "Basal body temperature",
        route: "/bbt",
        image: bbtImg
      },
      {
        name: "Appetite",
        icon: Apple,
        color: "from-green-500 to-emerald-500",
        value: todayAppetite ? todayAppetite.level : "Not tracked",
        description: "Today's appetite level",
        route: "/appetite",
        image: appetiteImg
      },
      {
        name: "Health",
        icon: Stethoscope,
        color: "from-indigo-500 to-purple-500",
        value: latestHealth ? "Recent data" : "No data",
        description: "Health metrics tracking",
        route: "/health",
        image: healthImg
      }
    ];

    setSummaries(trackerData);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
          <Calendar className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-foreground">Tracker Dashboard</h3>
          <p className="text-sm text-muted-foreground">All your health metrics at a glance</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {summaries.map((tracker) => (
          <Card
            key={tracker.name}
            className="relative overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:scale-105 group"
            onClick={() => navigate(tracker.route)}
          >
            {tracker.image ? (
              <div className="relative h-32">
                <img
                  src={tracker.image}
                  alt={tracker.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                <div className="absolute inset-0 p-4 flex flex-col justify-end text-white">
                  <h4 className="text-lg font-bold mb-1">{tracker.name}</h4>
                  <p className="text-sm opacity-90">{tracker.value}</p>
                  <p className="text-xs opacity-75 mt-1">{tracker.description}</p>
                </div>
              </div>
            ) : (
              <div className={`bg-gradient-to-br ${tracker.color} p-4`}>
                <div className="flex items-start justify-between mb-3">
                  <tracker.icon className="w-6 h-6 text-white" />
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <tracker.icon className="w-4 h-4 text-white" />
                  </div>
                </div>
                <h4 className="text-lg font-bold text-white mb-1">{tracker.name}</h4>
                <p className="text-sm text-white/90 font-medium">{tracker.value}</p>
                <p className="text-xs text-white/75 mt-1">{tracker.description}</p>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};
