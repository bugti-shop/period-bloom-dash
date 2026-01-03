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
  color: string;
  bgColor: string;
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
    { id: 'all', label: 'All', icon: Calendar, color: 'text-white', bgColor: 'bg-primary' },
    { id: 'ovulation', label: 'Ovulation', icon: Heart, color: 'text-pink-600', bgColor: 'bg-pink-50 border border-pink-200' },
    { id: 'cycle-reports', label: 'Reports', icon: FileText, color: 'text-blue-600', bgColor: 'bg-blue-50 border border-blue-200', route: '/cycle-reports' },
    { id: 'ovulation-test', label: 'LH Test', icon: TestTube, color: 'text-purple-600', bgColor: 'bg-purple-50 border border-purple-200', route: '/ovulation-test' },
    { id: 'pcos', label: 'PCOS', icon: Brain, color: 'text-teal-600', bgColor: 'bg-teal-50 border border-teal-200', route: '/pcos' },
    { id: 'perimenopause', label: 'Peri', icon: Flower2, color: 'text-amber-600', bgColor: 'bg-amber-50 border border-amber-200', route: '/perimenopause' },
  ];

  const pregnancyActions: QuickAction[] = [
    { id: 'all', label: 'All', icon: Calendar, color: 'text-white', bgColor: 'bg-primary' },
    { id: 'appointments', label: 'Visits', icon: Stethoscope, color: 'text-blue-600', bgColor: 'bg-blue-50 border border-blue-200', route: '/appointments' },
    { id: 'weight', label: 'Weight', icon: Activity, color: 'text-green-600', bgColor: 'bg-green-50 border border-green-200', route: '/pregnancy-weight' },
    { id: 'bp', label: 'BP', icon: Heart, color: 'text-red-600', bgColor: 'bg-red-50 border border-red-200', route: '/blood-pressure' },
    { id: 'glucose', label: 'Glucose', icon: Pill, color: 'text-purple-600', bgColor: 'bg-purple-50 border border-purple-200', route: '/glucose' },
    { id: 'kicks', label: 'Kicks', icon: Waves, color: 'text-pink-600', bgColor: 'bg-pink-50 border border-pink-200' },
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
        <div className="flex gap-2 pb-2">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => handleClick(action)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-medium text-sm transition-all border-2 border-b-4 active:border-b-2 active:translate-y-0.5 ${action.bgColor} ${action.color}`}
              >
                <Icon className="w-4 h-4" />
                <span>{action.label}</span>
              </button>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" className="invisible" />
      </ScrollArea>
    </div>
  );
};
