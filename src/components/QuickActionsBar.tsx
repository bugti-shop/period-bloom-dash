import { 
  Droplet, Heart, Calendar, FileText, TestTube, Brain, 
  Flower2, Activity, Pill, Stethoscope, Waves
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  isActive?: boolean;
  route?: string;
  onClick?: () => void;
}

interface QuickActionsBarProps {
  variant: 'period' | 'pregnancy';
  onActionClick?: (actionId: string) => void;
}

export const QuickActionsBar = ({ variant, onActionClick }: QuickActionsBarProps) => {
  const navigate = useNavigate();

  const periodActions: QuickAction[] = [
    { id: 'all', label: 'All', icon: Calendar, gradient: 'from-primary to-accent', isActive: true },
    { id: 'ovulation', label: 'Ovulation', icon: Heart, gradient: 'from-pink-500 to-rose-400' },
    { id: 'cycle-reports', label: 'Reports', icon: FileText, gradient: 'from-blue-500 to-cyan-400', route: '/cycle-reports' },
    { id: 'ovulation-test', label: 'LH Test', icon: TestTube, gradient: 'from-violet-500 to-purple-400', route: '/ovulation-test' },
    { id: 'pcos', label: 'PCOS', icon: Brain, gradient: 'from-teal-500 to-emerald-400', route: '/pcos' },
    { id: 'perimenopause', label: 'Peri', icon: Flower2, gradient: 'from-amber-500 to-orange-400', route: '/perimenopause' },
  ];

  const pregnancyActions: QuickAction[] = [
    { id: 'all', label: 'All', icon: Calendar, gradient: 'from-primary to-accent', isActive: true },
    { id: 'appointments', label: 'Visits', icon: Stethoscope, gradient: 'from-blue-500 to-cyan-400', route: '/appointments' },
    { id: 'weight', label: 'Weight', icon: Activity, gradient: 'from-green-500 to-emerald-400', route: '/pregnancy-weight' },
    { id: 'bp', label: 'BP', icon: Heart, gradient: 'from-red-500 to-rose-400', route: '/blood-pressure' },
    { id: 'glucose', label: 'Glucose', icon: Pill, gradient: 'from-violet-500 to-purple-400', route: '/glucose' },
    { id: 'kicks', label: 'Kicks', icon: Waves, gradient: 'from-pink-500 to-rose-400' },
  ];

  const actions = variant === 'period' ? periodActions : pregnancyActions;

  const handleClick = (action: QuickAction) => {
    if (action.route) {
      navigate(action.route);
    } else if (onActionClick) {
      onActionClick(action.id);
    }
  };

  return (
    <div className="w-full">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-2.5 pb-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => handleClick(action)}
                className={`
                  group relative flex items-center gap-2 px-4 py-2.5 rounded-2xl font-semibold text-sm
                  transition-all duration-300 ease-out
                  hover:scale-105 active:scale-95
                  ${action.isActive 
                    ? `bg-gradient-to-r ${action.gradient} text-white shadow-lg shadow-primary/25` 
                    : 'bg-card border border-border/60 text-foreground hover:border-primary/30 hover:shadow-md'
                  }
                `}
              >
                {/* Glow effect on hover for inactive buttons */}
                {!action.isActive && (
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${action.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                )}
                <Icon className={`w-4 h-4 transition-transform duration-300 group-hover:scale-110 ${action.isActive ? '' : 'text-muted-foreground group-hover:text-foreground'}`} />
                <span className="relative">{action.label}</span>
              </button>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" className="invisible" />
      </ScrollArea>
    </div>
  );
};
