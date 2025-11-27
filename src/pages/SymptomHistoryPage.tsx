import { format, parseISO } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { getSymptomLogs } from "@/lib/symptomLog";

interface SymptomHistoryPageProps {
  onBack: () => void;
}

export const SymptomHistoryPage = ({ onBack }: SymptomHistoryPageProps) => {
  const symptomLogs = getSymptomLogs();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <header className="flex items-center gap-3 mb-6">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-3xl font-bold">Symptoms History</h2>
            <p className="text-gray-600">Review your recorded symptoms</p>
          </div>
        </header>

        <div className="space-y-3">
          {symptomLogs.length === 0 ? (
            <div className="bg-white rounded-xl p-6 text-center">
              <p className="text-gray-500">No symptoms recorded yet</p>
            </div>
          ) : (
            symptomLogs.map((log) => (
              <div
                key={log.date}
                className="bg-white rounded-xl p-4 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <span className="text-sm font-bold text-gray-900 min-w-[120px]">
                    {format(parseISO(log.date), "MMM dd, yyyy")}
                  </span>
                  <span className="text-sm text-gray-600">→</span>
                  <span className="text-sm text-gray-700 flex-1">
                    {log.symptoms.join(", ")}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
