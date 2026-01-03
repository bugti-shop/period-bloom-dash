import logo from "@/assets/logo.png";
import { Moon, Sun, Bell } from "lucide-react";
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
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-md border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center overflow-hidden">
              <img src={logo} alt="Lufi" className="h-8 w-8" />
            </div>
            <span className="text-xl font-bold text-foreground tracking-tight">{title}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-lg bg-muted/50 hover:bg-muted flex items-center justify-center transition-colors border-2 border-b-4 border-border active:border-b-2 active:translate-y-0.5"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-foreground" />
              ) : (
                <Moon className="w-4 h-4 text-foreground" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
