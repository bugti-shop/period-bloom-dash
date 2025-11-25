import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getPeriodHistory } from "@/lib/periodHistory";
import { getSymptomLogs } from "@/lib/symptomLog";
import { format, startOfMonth, endOfMonth, subMonths, isWithinInterval, parseISO } from "date-fns";
import { TrendingUp, TrendingDown, Minus, Calendar, Activity } from "lucide-react";

interface MonthData {
  cycleLength: number;
  periodDuration: number;
  symptomCount: number;
}

export const MonthOverMonthComparison = () => {
  const history = getPeriodHistory();
  const symptomLogs = getSymptomLogs();
  
  const now = new Date();
  const currentMonthStart = startOfMonth(now);
  const currentMonthEnd = endOfMonth(now);
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfMonth(subMonths(now, 1));

  const getMonthData = (start: Date, end: Date): MonthData | null => {
    const monthHistory = history.filter(entry => 
      isWithinInterval(entry.lastPeriodDate, { start, end })
    );

    const monthSymptoms = symptomLogs.filter(log => 
      isWithinInterval(parseISO(log.date), { start, end })
    );

    if (monthHistory.length === 0) return null;

    const avgCycleLength = monthHistory.reduce((sum, e) => sum + e.cycleLength, 0) / monthHistory.length;
    const avgPeriodDuration = monthHistory.reduce((sum, e) => sum + e.periodDuration, 0) / monthHistory.length;
    const symptomCount = monthSymptoms.reduce((sum, log) => sum + log.symptoms.length, 0);

    return {
      cycleLength: Math.round(avgCycleLength),
      periodDuration: Math.round(avgPeriodDuration),
      symptomCount
    };
  };

  const currentMonth = getMonthData(currentMonthStart, currentMonthEnd);
  const lastMonth = getMonthData(lastMonthStart, lastMonthEnd);

  if (!currentMonth && !lastMonth) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Month-Over-Month Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            Not enough data yet. Keep tracking to see monthly comparisons.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getChangeIndicator = (current: number | undefined, previous: number | undefined) => {
    if (!current || !previous) return null;
    
    const change = current - previous;
    const percentChange = ((change / previous) * 100).toFixed(1);
    
    if (change > 0) {
      return (
        <div className="flex items-center gap-1 text-orange-600">
          <TrendingUp className="w-4 h-4" />
          <span className="text-sm font-medium">+{percentChange}%</span>
        </div>
      );
    } else if (change < 0) {
      return (
        <div className="flex items-center gap-1 text-green-600">
          <TrendingDown className="w-4 h-4" />
          <span className="text-sm font-medium">{percentChange}%</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-1 text-gray-600">
          <Minus className="w-4 h-4" />
          <span className="text-sm font-medium">No change</span>
        </div>
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Month-Over-Month Comparison
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Current Month Column */}
          <div className="space-y-3">
            <div className="text-center">
              <Badge variant="outline" className="bg-[#eb4899] text-white border-[#eb4899]">
                {format(now, "MMM yyyy")}
              </Badge>
            </div>
            
            {currentMonth && (
              <>
                <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Avg Cycle Length</p>
                  <p className="text-2xl font-bold text-foreground">{currentMonth.cycleLength} days</p>
                </div>
                
                <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Avg Period Duration</p>
                  <p className="text-2xl font-bold text-foreground">{currentMonth.periodDuration} days</p>
                </div>
                
                <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Total Symptoms</p>
                  <p className="text-2xl font-bold text-foreground">{currentMonth.symptomCount}</p>
                </div>
              </>
            )}
            
            {!currentMonth && (
              <p className="text-center text-sm text-muted-foreground py-4">No data this month</p>
            )}
          </div>

          {/* Last Month Column */}
          <div className="space-y-3">
            <div className="text-center">
              <Badge variant="outline" className="bg-gray-200 text-gray-700">
                {format(subMonths(now, 1), "MMM yyyy")}
              </Badge>
            </div>
            
            {lastMonth && (
              <>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Avg Cycle Length</p>
                  <p className="text-2xl font-bold text-foreground">{lastMonth.cycleLength} days</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Avg Period Duration</p>
                  <p className="text-2xl font-bold text-foreground">{lastMonth.periodDuration} days</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Total Symptoms</p>
                  <p className="text-2xl font-bold text-foreground">{lastMonth.symptomCount}</p>
                </div>
              </>
            )}
            
            {!lastMonth && (
              <p className="text-center text-sm text-muted-foreground py-4">No data last month</p>
            )}
          </div>
        </div>

        {/* Change Indicators */}
        {currentMonth && lastMonth && (
          <div className="border-t pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Cycle Length Change</span>
              {getChangeIndicator(currentMonth.cycleLength, lastMonth.cycleLength)}
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Period Duration Change</span>
              {getChangeIndicator(currentMonth.periodDuration, lastMonth.periodDuration)}
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Symptom Count Change</span>
              {getChangeIndicator(currentMonth.symptomCount, lastMonth.symptomCount)}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
