import logo from "@/assets/logo.png";
import { Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";

interface ModernHeaderProps {
  title?: string;
}

export const ModernHeader = ({ title = "Lufi" }: ModernHeaderProps) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const theme = localStorage.getItem("theme-mode");
    setIsDark(theme?.startsWith("dark") || false);
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    if (isDark) {
      html.classList.remove("dark-black", "dark-blue", "dark-green", "dark-brown");
      localStorage.setItem("theme-mode", "light");
    } else {
      html.classList.add("dark-black");
      localStorage.setItem("theme-mode", "dark-black");
    }
    setIsDark(!isDark);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-xl border-b border-border/30">
      <div className="max-w-7xl mx-auto px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-primary/20 via-accent/15 to-primary/10 flex items-center justify-center overflow-hidden shadow-lg shadow-primary/10 border border-primary/10">
              <img src={logo} alt="Lufi" className="h-8 w-8 drop-shadow-md" />
              {/* Subtle shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />
            </div>
            <div>
              <span className="text-xl font-bold text-foreground tracking-tight">{title}</span>
              <p className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase">Period Tracker</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="group relative w-10 h-10 rounded-2xl bg-card border border-border/50 flex items-center justify-center transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 hover:scale-105 active:scale-95"
              aria-label="Toggle theme"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              {isDark ? (
                <Sun className="w-4.5 h-4.5 text-foreground relative z-10 transition-transform duration-300 group-hover:rotate-45" />
              ) : (
                <Moon className="w-4.5 h-4.5 text-foreground relative z-10 transition-transform duration-300 group-hover:-rotate-12" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
