import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { getSymptomLogs } from "@/lib/symptomLog";
import { format, subDays, subMonths, isAfter, isBefore, startOfWeek, endOfWeek, eachWeekOfInterval } from "date-fns";
import { FileDown } from "lucide-react";

const COLORS = ['#EC4899', '#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#6366F1', '#14B8A6', '#F97316', '#84CC16'];

export const SymptomStatistics = () => {
  const [timeRange, setTimeRange] = useState<"week" | "month" | "all">("month");
  const [symptomData, setSymptomData] = useState<any[]>([]);
  const [weeklyTrends, setWeeklyTrends] = useState<any[]>([]);
  const [topSymptoms, setTopSymptoms] = useState<any[]>([]);

  useEffect(() => {
    analyzeSymptoms();
  }, [timeRange]);

  const analyzeSymptoms = () => {
    const logs = getSymptomLogs();
    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case "week":
        startDate = subDays(now, 7);
        break;
      case "month":
        startDate = subMonths(now, 1);
        break;
      default:
        startDate = subMonths(now, 12);
    }

    // Filter logs by date range
    const filteredLogs = logs.filter(log => {
      const logDate = new Date(log.date);
      return isAfter(logDate, startDate) && isBefore(logDate, now);
    });

    // Count symptom frequencies
    const symptomCounts: { [key: string]: number } = {};
    filteredLogs.forEach(log => {
      log.symptoms.forEach(symptom => {
        symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
      });
    });

    // Prepare data for bar chart
    const barData = Object.entries(symptomCounts)
      .map(([name, value]) => ({ name: formatSymptomName(name), value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    setSymptomData(barData);

    // Prepare data for pie chart (top 5 symptoms)
    const pieData = barData.slice(0, 5);
    setTopSymptoms(pieData);

    // Weekly trends
    if (timeRange !== "week") {
      const weeks = eachWeekOfInterval({
        start: startDate,
        end: now
      });

      const weeklyData = weeks.map(weekStart => {
        const weekEnd = endOfWeek(weekStart);
        const weekLogs = filteredLogs.filter(log => {
          const logDate = new Date(log.date);
          return isAfter(logDate, weekStart) && isBefore(logDate, weekEnd);
        });

        const totalSymptoms = weekLogs.reduce((sum, log) => sum + log.symptoms.length, 0);
        
        return {
          week: format(weekStart, "MMM dd"),
          symptoms: totalSymptoms
        };
      });

      setWeeklyTrends(weeklyData);
    }
  };

  const formatSymptomName = (symptom: string) => {
    return symptom
      .split("-")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Symptom Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as any)} className="mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="week">Last Week</TabsTrigger>
            <TabsTrigger value="month">Last Month</TabsTrigger>
            <TabsTrigger value="all">Last Year</TabsTrigger>
          </TabsList>
        </Tabs>

        {symptomData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No symptom data available for this period</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Most Common Symptoms Bar Chart */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Most Common Symptoms</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={symptomData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#EC4899" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Top 5 Symptoms Pie Chart */}
            {topSymptoms.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Top 5 Symptoms Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={topSymptoms}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {topSymptoms.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Weekly Trends Line Chart */}
            {weeklyTrends.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Weekly Symptom Trends</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={weeklyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="symptoms" stroke="#8B5CF6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};