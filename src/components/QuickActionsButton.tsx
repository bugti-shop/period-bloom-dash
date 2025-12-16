import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Plus, 
  X, 
  Droplets, 
  Moon, 
  Brain, 
  Activity,
  TestTube,
  FileText 
} from "lucide-react";
import { cn } from "@/lib/utils";

const quickActions = [
  { name: "Water", icon: Droplets, route: "/water", color: "bg-blue-500" },
  { name: "Sleep", icon: Moon, route: "/sleep", color: "bg-indigo-500" },
  { name: "Stress", icon: Brain, route: "/stress", color: "bg-purple-500" },
  { name: "Exercise", icon: Activity, route: "/exercise", color: "bg-green-500" },
  { name: "Ovulation", icon: TestTube, route: "/ovulation-test", color: "bg-fuchsia-500" },
  { name: "Reports", icon: FileText, route: "/cycle-reports", color: "bg-cyan-500" },
];

interface QuickActionsButtonProps {
  className?: string;
}

export const QuickActionsButton = ({ className }: QuickActionsButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleActionClick = (route: string) => {
    setIsOpen(false);
    navigate(route);
  };

  return (
    <div className={cn("fixed bottom-24 right-4 z-40", className)}>
      {/* Action buttons */}
      <div className={cn(
        "flex flex-col-reverse gap-2 mb-2 transition-all duration-300",
        isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      )}>
        {quickActions.map((action, index) => (
          <button
            key={action.route}
            onClick={() => handleActionClick(action.route)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-full shadow-lg transition-all duration-200",
              action.color,
              "text-white text-sm font-medium",
              "hover:scale-105 active:scale-95"
            )}
            style={{
              transitionDelay: isOpen ? `${index * 50}ms` : "0ms"
            }}
          >
            <action.icon className="w-4 h-4" />
            <span>{action.name}</span>
          </button>
        ))}
      </div>

      {/* Main FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300",
          "bg-primary text-primary-foreground",
          "hover:shadow-xl hover:scale-105 active:scale-95",
          isOpen && "rotate-45"
        )}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
      </button>
    </div>
  );
};