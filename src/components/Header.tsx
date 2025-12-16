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
            {showArticlesToggle && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/articles')}
                className="gap-2"
              >
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Learn</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
