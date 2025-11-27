import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { generatePDFMedicalReport, generateChartData } from "@/lib/pdfMedicalReport";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const PDFReportGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCharts, setShowCharts] = useState(false);
  const chartsRef = useRef<HTMLDivElement>(null);

  const handleGenerateSimplePDF = async () => {
    setIsGenerating(true);
    try {
      await generatePDFMedicalReport();
      toast.success("PDF report generated successfully!");
    } catch (error) {
      toast.error("Failed to generate PDF report.");
    } finally {
      setIsGenerating(false);
    }
  };

  const chartData = generateChartData();

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-100 rounded-lg">
            <FileText className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">PDF Medical Reports</h3>
            <p className="text-sm text-muted-foreground">
              Generate comprehensive PDF reports with charts for healthcare providers
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleGenerateSimplePDF}
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <Download className="w-4 h-4 mr-2 animate-pulse" />
            ) : (
              <FileText className="w-4 h-4 mr-2" />
            )}
            Generate Standard PDF Report
          </Button>

          <Button
            onClick={() => setShowCharts(!showCharts)}
            variant="outline"
            className="w-full"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            {showCharts ? 'Hide' : 'Preview'} Data Visualizations
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-4">
          PDF reports include cycle history, symptoms, medications, and health metrics summaries.
        </p>
      </Card>

      {showCharts && (
        <div ref={chartsRef} className="space-y-6 p-6 bg-white rounded-lg border">
          <div>
            <h4 className="font-semibold mb-4">Cycle Length Trend</h4>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData.cycleLengths}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="length" stroke="#ee5ea6" strokeWidth={2} name="Cycle Length (days)" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Most Common Symptoms</h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData.symptoms}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="symptom" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#ee5ea6" name="Occurrences" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {chartData.weight.length > 0 && (
            <div>
              <h4 className="font-semibold mb-4">Weight Trend</h4>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData.weight}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} name="Weight (kg)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {chartData.bloodPressure.length > 0 && (
            <div>
              <h4 className="font-semibold mb-4">Blood Pressure Trend</h4>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData.bloodPressure}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="systolic" stroke="#ef4444" strokeWidth={2} name="Systolic" />
                  <Line type="monotone" dataKey="diastolic" stroke="#3b82f6" strokeWidth={2} name="Diastolic" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {chartData.glucose.length > 0 && (
            <div>
              <h4 className="font-semibold mb-4">Glucose Levels</h4>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData.glucose}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} name="Glucose (mg/dL)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
