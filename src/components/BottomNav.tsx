import { Home, Calendar, Activity, Settings, Calculator } from "lucide-react";
import { useState } from "react";

type NavItem = "home" | "symptoms" | "tools" | "settings";

interface BottomNavProps {
  activeTab?: NavItem;
  onTabChange?: (tab: NavItem) => void;
}

export const BottomNav = ({ activeTab = "home", onTabChange }: BottomNavProps) => {
  const [active, setActive] = useState<NavItem>(activeTab);

  const handleTabClick = (tab: NavItem) => {
    setActive(tab);
    onTabChange?.(tab);
  };

  const navItems = [
    { id: "home" as NavItem, label: "Home", icon: Home },
    { id: "symptoms" as NavItem, label: "Symptoms", icon: Activity },
    { id: "tools" as NavItem, label: "Tools", icon: Calculator },
    { id: "settings" as NavItem, label: "Settings", icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className="flex flex-col items-center justify-center flex-1 h-full transition-colors"
              >
                <Icon 
                  className={`w-5 h-5 mb-2 ${
                    isActive ? "text-primary" : "text-gray-600"
                  }`}
                />
                <span 
                  className={`text-xs font-semibold ${
                    isActive ? "text-primary" : "text-gray-600"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
