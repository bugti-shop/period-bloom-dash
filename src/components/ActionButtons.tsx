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
          className="flex items-center justify-center gap-2 py-3 px-4 bg-primary text-primary-foreground rounded-xl font-semibold text-sm border-2 border-b-4 border-primary/80 active:border-b-2 active:translate-y-0.5 transition-all shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Update Period
        </button>
        
        <button
          onClick={onViewHistory}
          className="flex items-center justify-center gap-2 py-3 px-4 bg-muted text-foreground rounded-xl font-semibold text-sm border-2 border-b-4 border-border active:border-b-2 active:translate-y-0.5 transition-all shadow-sm"
        >
          <History className="w-4 h-4" />
          View History
        </button>
      </div>

      {/* Secondary action */}
      <button
        onClick={onViewInsights}
        className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm border-2 border-b-4 border-primary/80 active:border-b-2 active:translate-y-0.5 transition-all shadow-sm"
      >
        <TrendingUp className="w-4 h-4" />
        View Cycle Insights & Trends
      </button>
    </div>
  );
};
