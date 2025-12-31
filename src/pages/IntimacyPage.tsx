import { ArrowLeft } from "lucide-react";
import { IntimacyTracker } from "@/components/IntimacyTracker";
import { useMobileBackButton } from "@/hooks/useMobileBackButton";
import { useBackNavigation } from "@/hooks/useBackNavigation";

export const IntimacyPage = () => {
  const goBack = useBackNavigation("tools");
  useMobileBackButton();

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <header className="flex items-center gap-3 mb-6">
          <button
            onClick={goBack}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-3xl font-bold text-foreground">Intimacy Tracker</h2>
            <p className="text-muted-foreground">Track your intimate moments</p>
          </div>
        </header>

        <IntimacyTracker />
      </div>
    </div>
  );
};
