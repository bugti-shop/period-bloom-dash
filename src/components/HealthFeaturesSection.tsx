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
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-100',
      route: '/ovulation-test',
      visible: visibility.ovulationTest,
    },
    {
      id: 'cycle-reports',
      title: 'Cycle Reports',
      description: 'View cycle summaries',
      icon: FileText,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
      route: '/cycle-reports',
      visible: visibility.cycleReports,
    },
    {
      id: 'pcos',
      title: 'PCOS Mode',
      description: 'Manage PCOS symptoms',
      icon: Brain,
      color: 'bg-teal-500',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-100',
      route: '/pcos',
      visible: visibility.pcosMode,
    },
    {
      id: 'perimenopause',
      title: 'Perimenopause',
      description: 'Track transition changes',
      icon: Flower2,
      color: 'bg-amber-500',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-100',
      route: '/perimenopause',
      visible: visibility.perimenopauseMode,
    },
  ];

  const visibleFeatures = features.filter(f => f.visible);

  if (visibleFeatures.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-foreground px-1">Health Features</h3>
      
      <div className="space-y-2">
        {visibleFeatures.map((feature) => {
          const Icon = feature.icon;
          return (
            <button
              key={feature.id}
              onClick={() => navigate(feature.route)}
              className={`w-full flex items-center gap-3 p-4 ${feature.bgColor} ${feature.borderColor} border rounded-2xl transition-all duration-200 hover:shadow-md active:scale-[0.98]`}
            >
              <div className={`w-11 h-11 ${feature.color} rounded-xl flex items-center justify-center shadow-sm`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              
              <div className="flex-1 text-left">
                <h4 className="text-sm font-semibold text-gray-900">{feature.title}</h4>
                <p className="text-xs text-gray-500">{feature.description}</p>
              </div>
              
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          );
        })}
      </div>
    </div>
  );
};
