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
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
      {/* Frosted glass background */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-xl border-t border-border/30" />
      
      <div className="relative max-w-lg mx-auto px-4">
        <div className="flex justify-around items-center h-[72px]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`
                  group relative flex flex-col items-center justify-center flex-1 h-full
                  transition-all duration-300 ease-out
                  ${isActive ? '' : 'opacity-60 hover:opacity-100'}
                `}
              >
                {/* Active indicator pill */}
                {isActive && (
                  <div className="absolute -top-0.5 w-12 h-1 bg-gradient-to-r from-primary to-accent rounded-full shadow-lg shadow-primary/40" />
                )}
                
                {/* Icon container */}
                <div className={`
                  relative p-2.5 rounded-2xl transition-all duration-300
                  ${isActive 
                    ? 'bg-gradient-to-br from-primary/15 to-accent/10' 
                    : 'group-hover:bg-muted/50'
                  }
                `}>
                  {/* Glow effect for active */}
                  {isActive && (
                    <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-lg -z-10" />
                  )}
                  <Icon 
                    className={`
                      w-5 h-5 transition-all duration-300
                      ${isActive 
                        ? "text-primary drop-shadow-md" 
                        : "text-foreground group-hover:text-primary/80"
                      }
                      ${isActive ? 'scale-110' : 'group-hover:scale-105'}
                    `}
                  />
                </div>
                
                <span 
                  className={`
                    text-[10px] font-semibold mt-1 transition-all duration-300
                    ${isActive 
                      ? "text-primary" 
                      : "text-muted-foreground group-hover:text-foreground"
                    }
                  `}
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
