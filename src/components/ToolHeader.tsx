import { ArrowLeft } from "lucide-react";
import { useBackNavigation } from "@/hooks/useBackNavigation";
import { useMobileBackButton } from "@/hooks/useMobileBackButton";
import type { LucideIcon } from "lucide-react";

interface ToolHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
}

export const ToolHeader = ({ title, subtitle, icon: Icon }: ToolHeaderProps) => {
  const goBack = useBackNavigation("tools");
  useMobileBackButton();

  return (
    <div className="bg-gradient-to-r from-primary to-pink-500 text-white p-4 sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <button
          onClick={goBack}
          className="p-2 hover:bg-white/20 rounded-full transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        {Icon && (
          <div className="p-2 bg-white/20 rounded-full">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <div>
          <h1 className="text-xl font-bold">{title}</h1>
          {subtitle && <p className="text-sm text-white/80">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
};
