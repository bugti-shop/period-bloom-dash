import { RefreshCw, History, TrendingUp, Sparkles } from "lucide-react";

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
          className="group relative flex items-center justify-center gap-2 py-4 px-4 bg-gradient-to-br from-primary to-accent text-primary-foreground rounded-2xl font-semibold text-sm transition-all duration-300 hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5 active:scale-[0.98] overflow-hidden"
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          <RefreshCw className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover:rotate-180" />
          <span className="relative z-10">Update Period</span>
        </button>
        
        <button
          onClick={onViewHistory}
          className="group flex items-center justify-center gap-2 py-4 px-4 bg-card border border-border/50 text-foreground rounded-2xl font-semibold text-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]"
        >
          <History className="w-4 h-4 transition-transform duration-300 group-hover:-rotate-12" />
          <span>View History</span>
        </button>
      </div>

      {/* Premium CTA button */}
      <button
        onClick={onViewInsights}
        className="group relative w-full flex items-center justify-center gap-3 py-4.5 bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] text-white rounded-2xl font-semibold text-sm transition-all duration-500 hover:bg-right hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-0.5 active:scale-[0.98] overflow-hidden"
      >
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        
        {/* Floating particles effect */}
        <div className="absolute top-2 left-1/4 w-1 h-1 bg-white/40 rounded-full animate-pulse" />
        <div className="absolute bottom-3 right-1/3 w-1.5 h-1.5 bg-white/30 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
        
        <Sparkles className="w-4 h-4 relative z-10 animate-pulse" />
        <span className="relative z-10">View Cycle Insights & Trends</span>
        <TrendingUp className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
      </button>
    </div>
  );
};
