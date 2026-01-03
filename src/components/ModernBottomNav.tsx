import { Home, Activity, Calculator, Settings, ListChecks } from "lucide-react";

type NavItem = "home" | "symptoms" | "tools" | "settings" | "checklists";

interface ModernBottomNavProps {
  activeTab?: NavItem;
  onTabChange?: (tab: NavItem) => void;
  hideTools?: boolean;
  showChecklists?: boolean;
}

export const ModernBottomNav = ({ 
  activeTab = "home", 
  onTabChange, 
  hideTools = false, 
  showChecklists = false 
}: ModernBottomNavProps) => {

  const handleTabClick = (tab: NavItem) => {
    onTabChange?.(tab);
  };

  const navItems = [
    { id: "home" as NavItem, label: "Home", icon: Home },
    { id: "symptoms" as NavItem, label: "Symptoms", icon: Activity },
    ...(showChecklists ? [{ id: "checklists" as NavItem, label: "Lists", icon: ListChecks }] : []),
    ...(!hideTools ? [{ id: "tools" as NavItem, label: "Tools", icon: Calculator }] : []),
    { id: "settings" as NavItem, label: "Settings", icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border/50 z-50 pb-safe">
      <div className="max-w-lg mx-auto px-2">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 relative ${
                  isActive ? 'scale-105' : 'opacity-70 hover:opacity-100'
                }`}
              >
                <div className={`p-2 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-primary/15' 
                    : 'hover:bg-muted/50'
                }`}>
                  <Icon 
                    className={`w-5 h-5 transition-colors ${
                      isActive ? "text-primary" : "text-foreground"
                    }`}
                  />
                </div>
                <span 
                  className={`text-[10px] font-semibold mt-0.5 transition-colors ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </span>
                
                {isActive && (
                  <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
