import { RefreshCw, History, TrendingUp } from "lucide-react";

interface ActionButtonsProps {
  onUpdatePeriod: () => void;
  onViewHistory: () => void;
  onViewInsights: () => void;
}

export const ActionButtons = ({ onUpdatePeriod, onViewHistory, onViewInsights }: ActionButtonsProps) => {
  return (
    <div className="space-y-3">
      {/* Primary actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onUpdatePeriod}
          className="flex items-center justify-center gap-2 py-3.5 px-4 bg-primary text-primary-foreground rounded-2xl font-semibold text-sm transition-all duration-200 hover:opacity-90 active:scale-[0.98] shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Update Period
        </button>
        
        <button
          onClick={onViewHistory}
          className="flex items-center justify-center gap-2 py-3.5 px-4 bg-muted text-foreground rounded-2xl font-semibold text-sm transition-all duration-200 hover:bg-muted/80 active:scale-[0.98]"
        >
          <History className="w-4 h-4" />
          View History
        </button>
      </div>

      {/* Secondary action */}
      <button
        onClick={onViewInsights}
        className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-primary to-accent text-white rounded-2xl font-semibold text-sm transition-all duration-200 hover:opacity-90 active:scale-[0.98] shadow-md"
      >
        <TrendingUp className="w-4 h-4" />
        View Cycle Insights & Trends
      </button>
    </div>
  );
};
