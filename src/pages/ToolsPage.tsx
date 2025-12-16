import { useNavigate } from "react-router-dom";
import { BabyKickCounter } from "@/components/BabyKickCounter";
import { ContractionTimer } from "@/components/ContractionTimer";
import { loadPregnancyMode } from "@/lib/pregnancyMode";
import { 
  Droplets, 
  Moon, 
  Activity, 
  Droplet, 
  Brain, 
  Zap, 
  Heart,
  Scale,
  Pill,
  Timer,
  TestTube,
  FileText,
  Sparkles,
  Utensils,
  HeartPulse,
  Thermometer,
  UtensilsCrossed
} from "lucide-react";

const periodTools = [
  { name: "Intimacy", icon: HeartPulse, route: "/intimacy", color: "bg-pink-500", description: "Track intimacy" },
  { name: "BBT", icon: Thermometer, route: "/bbt", color: "bg-blue-600", description: "Basal temperature" },
  { name: "Appetite", icon: UtensilsCrossed, route: "/appetite", color: "bg-green-500", description: "Log appetite" },
  { name: "Health", icon: Heart, route: "/health", color: "bg-emerald-500", description: "Health monitor" },
  { name: "Water Intake", icon: Droplets, route: "/water", color: "bg-blue-500", description: "Track hydration" },
  { name: "Sleep Quality", icon: Moon, route: "/sleep", color: "bg-indigo-500", description: "Monitor sleep" },
  { name: "Exercise", icon: Activity, route: "/exercise", color: "bg-lime-500", description: "Log workouts" },
  { name: "Cervical Mucus", icon: Droplet, route: "/cervical-mucus", color: "bg-pink-400", description: "Fertility tracking" },
  { name: "Stress Level", icon: Brain, route: "/stress", color: "bg-purple-500", description: "Track stress" },
  { name: "Energy Level", icon: Zap, route: "/energy", color: "bg-yellow-500", description: "Monitor energy" },
  { name: "Skin Condition", icon: Sparkles, route: "/skin", color: "bg-rose-400", description: "Track skin health" },
  { name: "Digestive Health", icon: Utensils, route: "/digestive", color: "bg-orange-500", description: "GI tracking" },
  { name: "Weight", icon: Scale, route: "/weight", color: "bg-teal-500", description: "Track weight" },
  { name: "Birth Control", icon: Pill, route: "/birth-control", color: "bg-violet-500", description: "Pill reminders" },
  { name: "Period Products", icon: Timer, route: "/period-products", color: "bg-red-400", description: "Usage tracker" },
  { name: "Ovulation Test", icon: TestTube, route: "/ovulation-test", color: "bg-fuchsia-500", description: "LH test results" },
  { name: "Cycle Reports", icon: FileText, route: "/cycle-reports", color: "bg-cyan-500", description: "View summaries" },
  { name: "PCOS Mode", icon: Brain, route: "/pcos", color: "bg-emerald-600", description: "PCOS tracking" },
  { name: "Perimenopause", icon: Sparkles, route: "/perimenopause", color: "bg-amber-500", description: "Track changes" },
];

export const ToolsPage = () => {
  const navigate = useNavigate();
  const pregnancyMode = loadPregnancyMode();
  
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <header className="text-center mb-6">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            {pregnancyMode.isPregnancyMode ? "Pregnancy Tools" : "Health Tools"}
          </h2>
          <p className="text-muted-foreground">
            {pregnancyMode.isPregnancyMode 
              ? "Track your pregnancy journey" 
              : "Track and manage your health"}
          </p>
        </header>

        <div className="space-y-6">
          {pregnancyMode.isPregnancyMode ? (
            <>
              <ContractionTimer />
              <BabyKickCounter />
            </>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {periodTools.map((tool) => (
                <button
                  key={tool.route}
                  onClick={() => navigate(tool.route)}
                  className="flex flex-col items-center p-3 bg-card rounded-xl border border-border hover:shadow-md transition-all"
                >
                  <div className={`w-12 h-12 ${tool.color} rounded-full flex items-center justify-center mb-2`}>
                    <tool.icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-xs font-medium text-foreground text-center leading-tight">{tool.name}</p>
                  <p className="text-[9px] text-muted-foreground text-center mt-0.5">{tool.description}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};