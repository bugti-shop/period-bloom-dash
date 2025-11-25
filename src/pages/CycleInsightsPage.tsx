import { useState, useEffect } from "react";
import { ArrowLeft, TrendingUp, Calendar, Activity, Heart } from "lucide-react";
import { getPeriodHistory, PeriodHistoryEntry } from "@/lib/periodHistory";
import { loadFromLocalStorage } from "@/lib/storage";
import { format, differenceInDays } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { MonthOverMonthComparison } from "@/components/MonthOverMonthComparison";

interface CycleInsightsPageProps {
  onBack: () => void;
}

export const CycleInsightsPage = ({ onBack }: CycleInsightsPageProps) => {
  const [history, setHistory] = useState<PeriodHistoryEntry[]>([]);
  const [symptomData, setSymptomData] = useState<any[]>([]);

  useEffect(() => {
    const periodHistory = getPeriodHistory();
    setHistory(periodHistory);

    // Load symptom data
    const symptoms = loadFromLocalStorage<any[]>("symptom-log") || [];
    setSymptomData(symptoms);
  }, []);

  // Prepare cycle length trend data
  const cycleLengthData = history.slice(0, 6).reverse().map((entry, index) => ({
    month: format(entry.lastPeriodDate, "MMM"),
    length: entry.cycleLength,
    duration: entry.periodDuration,
  }));

  // Calculate average cycle length
  const avgCycleLength = history.length > 0
    ? Math.round(history.reduce((sum, entry) => sum + entry.cycleLength, 0) / history.length)
    : 0;

  // Calculate cycle regularity
  const cycleVariation = history.length > 1
    ? Math.round(
        Math.sqrt(
          history.reduce((sum, entry) => sum + Math.pow(entry.cycleLength - avgCycleLength, 2), 0) /
            (history.length - 1)
        )
      )
    : 0;

  const regularityScore = cycleVariation <= 3 ? "Regular" : cycleVariation <= 7 ? "Fairly Regular" : "Irregular";

  // Symptom frequency analysis
  const symptomFrequency = symptomData.reduce((acc: any, log: any) => {
    const symptoms = Array.isArray(log.symptoms) ? log.symptoms : [];
    symptoms.forEach((symptom: string) => {
      acc[symptom] = (acc[symptom] || 0) + 1;
    });
    return acc;
  }, {});

  const topSymptoms = Object.entries(symptomFrequency)
    .sort(([, a]: any, [, b]: any) => b - a)
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-foreground mb-4 hover:opacity-70 transition-opacity"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back</span>
        </button>
        <h1 className="text-2xl font-bold text-foreground mb-2">Cycle Insights</h1>
        <p className="text-sm text-muted-foreground">
          Your menstrual cycle trends and patterns
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Month-Over-Month Comparison */}
        <MonthOverMonthComparison />

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-muted-foreground">Avg Cycle</p>
            </div>
            <p className="text-3xl font-bold text-blue-600">{avgCycleLength} days</p>
            <p className="text-xs text-muted-foreground mt-1">Based on {history.length} cycles</p>
          </div>

          <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-5 h-5 text-green-600" />
              <p className="text-sm text-muted-foreground">Regularity</p>
            </div>
            <p className="text-xl font-bold text-green-600">{regularityScore}</p>
            <p className="text-xs text-muted-foreground mt-1">±{cycleVariation} days variation</p>
          </div>
        </div>

        {/* Cycle Length Trend */}
        {cycleLengthData.length > 0 && (
          <div className="p-6 bg-white rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Cycle Length Trend</h2>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={cycleLengthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#888" fontSize={12} />
                <YAxis stroke="#888" fontSize={12} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="length"
                  stroke="#EC4899"
                  fill="#FDE2F0"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Period Duration Trend */}
        {cycleLengthData.length > 0 && (
          <div className="p-6 bg-white rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-5 h-5 text-red-500" />
              <h2 className="text-lg font-semibold text-foreground">Period Duration Trend</h2>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={cycleLengthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#888" fontSize={12} />
                <YAxis stroke="#888" fontSize={12} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="duration"
                  stroke="#EF4444"
                  strokeWidth={3}
                  dot={{ fill: "#EF4444", r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top Symptoms */}
        {topSymptoms.length > 0 && (
          <div className="p-6 bg-white rounded-2xl shadow-sm">
            <h2 className="text-lg font-semibold text-foreground mb-4">Most Common Symptoms</h2>
            <div className="space-y-3">
              {topSymptoms.map((symptom: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground capitalize">
                      {symptom.name}
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full"
                        style={{
                          width: `${(symptom.count / symptomData.length) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-muted-foreground ml-4">
                    {symptom.count}x
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fertility Predictions */}
        <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl">
          <h2 className="text-lg font-semibold text-foreground mb-3">Fertility Insights</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5" />
              <div>
                <p className="font-medium text-foreground">Ovulation typically occurs around day {avgCycleLength - 14}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  14 days before your next expected period
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5" />
              <div>
                <p className="font-medium text-foreground">Fertile window: Days {avgCycleLength - 19} to {avgCycleLength - 13}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Your highest chance of conception
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
              <div>
                <p className="font-medium text-foreground">Cycle regularity: {regularityScore}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {cycleVariation <= 3
                    ? "Your cycle is very predictable"
                    : cycleVariation <= 7
                    ? "Your cycle has some variation"
                    : "Consider tracking more data for better predictions"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {history.length < 3 && (
          <div className="p-6 bg-yellow-50 rounded-2xl border border-yellow-200">
            <p className="text-sm font-medium text-yellow-800 mb-2">
              Need more data for insights
            </p>
            <p className="text-xs text-yellow-700">
              Track at least 3 complete cycles to see detailed trends and more accurate predictions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
