import { format } from "date-fns";
import { getPeriodHistory, clearPeriodHistory, deletePeriodEntry } from "@/lib/periodHistory";
import { Button } from "@/components/ui/button";
import { Calendar, Trash2, ArrowLeft } from "lucide-react";
import { useState } from "react";

interface HistoryPageProps {
  onBack?: () => void;
}

export const HistoryPage = ({ onBack }: HistoryPageProps) => {
  const [history, setHistory] = useState(getPeriodHistory());

  const handleClearHistory = () => {
    if (confirm("Are you sure you want to clear all history?")) {
      clearPeriodHistory();
      setHistory([]);
    }
  };

  const handleDeleteEntry = (id: string) => {
    if (confirm("Delete this period entry?")) {
      deletePeriodEntry(id);
      setHistory(getPeriodHistory());
    }
  };

  return (
    <div className="min-h-screen bg-pink-50 pb-6">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 hover:bg-white/50 rounded-full transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-gray-900" />
            </button>
          )}
          <h1 className="text-2xl font-bold text-gray-900 flex-1">Periods History</h1>
          {history.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearHistory}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" />
            <p className="text-gray-500">No history yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((entry, index) => (
              <div
                key={entry.id}
                className="bg-card rounded-2xl p-4 shadow-sm border border-border"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl font-bold text-pink-500">
                      {format(entry.lastPeriodDate, "MMM dd")}
                    </div>
                    <div className="px-3 py-1 bg-green-100 rounded-full">
                      <span className="text-xs font-semibold text-green-700">Saved</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteEntry(entry.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="text-sm text-gray-600 mb-2">
                  {format(entry.timestamp, "MMMM d, yyyy")}
                </div>

                <div className="grid grid-cols-3 gap-4 pt-3 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Cycle Length</p>
                    <p className="font-semibold text-gray-900">{entry.cycleLength} days</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Duration</p>
                    <p className="font-semibold text-gray-900">{entry.periodDuration} days</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Updated</p>
                    <p className="font-semibold text-gray-900">{format(entry.timestamp, "h:mm a")}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};