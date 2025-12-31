import logo from "@/assets/logo.png";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  showArticlesToggle?: boolean;
}

export const Header = ({ showArticlesToggle = false }: HeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-3 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Lufi" className="h-10 w-10" />
            <span className="text-xl font-bold text-foreground">Lufi</span>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Articles toggle removed */}
          </div>
        </div>
      </div>
    </header>
  );
};
