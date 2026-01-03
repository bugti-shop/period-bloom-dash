import { useNavigate } from "react-router-dom";
import { TestTube, FileText, Brain, Flower2, ChevronRight } from "lucide-react";
import { loadSectionVisibility } from "@/lib/sectionVisibility";

export const HealthFeaturesSection = () => {
  const navigate = useNavigate();
  const visibility = loadSectionVisibility();

  const features = [
    {
      id: 'ovulation-test',
      title: 'Ovulation Test',
      description: 'Track LH surge tests',
      icon: TestTube,
      gradient: 'from-violet-500 to-purple-500',
      glowColor: 'shadow-violet-500/20',
      route: '/ovulation-test',
      visible: visibility.ovulationTest,
    },
    {
      id: 'cycle-reports',
      title: 'Cycle Reports',
      description: 'View cycle summaries',
      icon: FileText,
      gradient: 'from-blue-500 to-cyan-500',
      glowColor: 'shadow-blue-500/20',
      route: '/cycle-reports',
      visible: visibility.cycleReports,
    },
    {
      id: 'pcos',
      title: 'PCOS Mode',
      description: 'Manage PCOS symptoms',
      icon: Brain,
      gradient: 'from-teal-500 to-emerald-500',
      glowColor: 'shadow-teal-500/20',
      route: '/pcos',
      visible: visibility.pcosMode,
    },
    {
      id: 'perimenopause',
      title: 'Perimenopause',
      description: 'Track transition changes',
      icon: Flower2,
      gradient: 'from-amber-500 to-orange-500',
      glowColor: 'shadow-amber-500/20',
      route: '/perimenopause',
      visible: visibility.perimenopauseMode,
    },
  ];

  const visibleFeatures = features.filter(f => f.visible);

  if (visibleFeatures.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-foreground px-1">Health Features</h3>
      
      <div className="space-y-2.5">
        {visibleFeatures.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <button
              key={feature.id}
              onClick={() => navigate(feature.route)}
              className="group w-full flex items-center gap-4 p-4 bg-card border border-border/40 rounded-3xl transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={`relative w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center shadow-lg ${feature.glowColor} transition-all duration-300 group-hover:scale-110`}>
                <Icon className="w-5 h-5 text-white drop-shadow-sm" />
                {/* Pulse ring on hover */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-40 group-hover:animate-ping`} />
              </div>
              
              <div className="flex-1 text-left">
                <h4 className="text-sm font-bold text-foreground mb-0.5">{feature.title}</h4>
                <p className="text-xs text-muted-foreground">{feature.description}</p>
              </div>
              
              <div className="w-8 h-8 rounded-xl bg-muted/50 flex items-center justify-center transition-all duration-300 group-hover:bg-primary/10">
                <ChevronRight className="w-4 h-4 text-muted-foreground transition-all duration-300 group-hover:text-primary group-hover:translate-x-0.5" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
