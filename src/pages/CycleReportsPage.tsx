import React, { useState, useEffect } from 'react';
import { FileText, Calendar, TrendingUp, RefreshCw, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { format, subMonths, parseISO } from 'date-fns';
import { ToolHeader } from '@/components/ToolHeader';
import { 
  generateCycleReport, 
  loadCycleReports, 
  getCycleReportForMonth,
  CycleReport 
} from '@/lib/cycleReportStorage';

const CycleReportsPage = () => {
  
  const [reports, setReports] = useState<CycleReport[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [currentReport, setCurrentReport] = useState<CycleReport | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  useEffect(() => {
    const report = getCycleReportForMonth(selectedMonth);
    setCurrentReport(report);
  }, [selectedMonth, reports]);

  const loadReports = () => {
    const loadedReports = loadCycleReports();
    setReports(loadedReports.sort((a, b) => b.month.localeCompare(a.month)));
  };

  const handleGenerateReport = () => {
    setIsGenerating(true);
    try {
      const report = generateCycleReport(selectedMonth);
      loadReports();
      setCurrentReport(report);
      toast.success('Report generated successfully');
    } catch (error) {
      toast.error('Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  const getMonthOptions = () => {
    const options = [];
    for (let i = 0; i < 12; i++) {
      const date = subMonths(new Date(), i);
      options.push({
        value: format(date, 'yyyy-MM'),
        label: format(date, 'MMMM yyyy')
      });
    }
    return options;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <ToolHeader 
        title="Cycle Reports" 
        subtitle="Monthly summaries & insights"
        icon={FileText}
      />

      <div className="p-4 space-y-4">
        {/* Month Selector */}
        <div className="flex gap-2">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {getMonthOptions().map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="bg-gradient-to-r from-blue-500 to-purple-500"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
            {currentReport ? 'Refresh' : 'Generate'}
          </Button>
        </div>

        {currentReport ? (
          <>
            {/* Overview Cards */}
            <div className="grid grid-cols-2 gap-3">
              <Card>
                <CardContent className="p-3 text-center">
                  <p className="text-2xl font-bold text-blue-500">
                    {currentReport.cycleLength || '--'}
                  </p>
                  <p className="text-xs text-muted-foreground">Cycle Length</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <p className="text-2xl font-bold text-pink-500">
                    {currentReport.periodLength || '--'}
                  </p>
                  <p className="text-xs text-muted-foreground">Period Length</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <p className="text-2xl font-bold text-purple-500">
                    {currentReport.ovulationDay ? `Day ${currentReport.ovulationDay}` : '--'}
                  </p>
                  <p className="text-xs text-muted-foreground">Est. Ovulation</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <p className="text-2xl font-bold text-green-500">
                    {currentReport.ovulationTestResults.positive + currentReport.ovulationTestResults.peak}
                  </p>
                  <p className="text-xs text-muted-foreground">+ OPK Tests</p>
                </CardContent>
              </Card>
            </div>

            {/* Insights */}
            {currentReport.insights.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {currentReport.insights.map((insight, index) => (
                    <p key={index} className="text-sm text-muted-foreground">
                      • {insight}
                    </p>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Top Symptoms */}
            {currentReport.symptomSummary.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Top Symptoms</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {currentReport.symptomSummary.slice(0, 5).map((symptom, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{symptom.symptom}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {symptom.frequency}x
                        </span>
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-pink-500 rounded-full"
                            style={{ width: `${(symptom.avgIntensity / 10) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Mood Summary */}
            {currentReport.moodSummary.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Mood Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {currentReport.moodSummary.slice(0, 6).map((mood, index) => (
                      <div 
                        key={index}
                        className="px-3 py-1 bg-muted rounded-full text-xs"
                      >
                        {mood.mood} ({mood.frequency})
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* OPK Summary */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Ovulation Tests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div>
                    <p className="text-lg font-bold">{currentReport.ovulationTestResults.total}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-green-500">{currentReport.ovulationTestResults.positive}</p>
                    <p className="text-xs text-muted-foreground">Positive</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-purple-500">{currentReport.ovulationTestResults.peak}</p>
                    <p className="text-xs text-muted-foreground">Peak</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-400">{currentReport.ovulationTestResults.negative}</p>
                    <p className="text-xs text-muted-foreground">Negative</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Report Date */}
            <p className="text-xs text-muted-foreground text-center">
              Report generated: {format(parseISO(currentReport.generatedAt), 'MMM d, yyyy h:mm a')}
            </p>
          </>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No Report Yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Generate a report to see your cycle summary and insights for {format(parseISO(`${selectedMonth}-01`), 'MMMM yyyy')}.
              </p>
              <Button 
                onClick={handleGenerateReport}
                className="bg-gradient-to-r from-blue-500 to-purple-500"
              >
                Generate Report
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Previous Reports */}
        {reports.length > 1 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Previous Reports</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {reports.filter(r => r.month !== selectedMonth).slice(0, 5).map((report) => (
                <Button
                  key={report.month}
                  variant="ghost"
                  className="w-full justify-start h-auto py-2"
                  onClick={() => setSelectedMonth(report.month)}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{format(parseISO(`${report.month}-01`), 'MMMM yyyy')}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {report.cycleLength ? `${report.cycleLength} days` : '--'}
                  </span>
                </Button>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CycleReportsPage;
