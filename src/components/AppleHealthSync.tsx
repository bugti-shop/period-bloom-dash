import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, RefreshCw, Download, FileText, Heart } from "lucide-react";
import { GoogleFitSync } from "./GoogleFitSync";
import { PDFReportGenerator } from "./PDFReportGenerator";
import { MedicationInteractionAlert } from "./MedicationInteractionAlert";
import { toast } from "sonner";
import {
  requestHealthPermissions,
  syncAllDataToHealth,
  getHealthSyncConfig,
  setHealthSyncConfig,
  importDataFromHealth,
  type HealthSyncConfig,
} from "@/lib/appleHealthSync";
import {
  exportAllMedicalData,
  downloadCSV,
  generatePeriodCSV,
  generateSymptomsCSV,
  generateComprehensiveMedicalReport,
} from "@/lib/medicalExport";

export const AppleHealthSync = () => {
  const [config, setConfig] = useState<HealthSyncConfig>(getHealthSyncConfig());
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuthorization = async () => {
      try {
        const permissions = await requestHealthPermissions();
        setIsAuthorized(!!permissions);
      } catch (error) {
        console.log('Health permissions not available');
      }
    };
    checkAuthorization();
  }, []);

  const handleConfigChange = (key: keyof HealthSyncConfig, value: boolean) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    setHealthSyncConfig(newConfig);
  };

  const handleRequestPermissions = async () => {
    try {
      await requestHealthPermissions();
      setIsAuthorized(true);
      toast.success("Health permissions granted!");
    } catch (error) {
      toast.error("Failed to request health permissions. Make sure you're on iOS.");
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncAllDataToHealth();
      toast.success("Successfully synced data to Apple Health!");
    } catch (error) {
      toast.error("Failed to sync data. Please check your permissions.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleImport = async () => {
    setIsSyncing(true);
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 1); // Import last year
      
      const data = await importDataFromHealth(startDate, endDate);
      toast.success(`Imported data from Apple Health!`);
    } catch (error) {
      toast.error("Failed to import data from Apple Health.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleExportMedicalReport = () => {
    try {
      exportAllMedicalData();
      toast.success("Medical reports exported successfully!");
    } catch (error) {
      toast.error("Failed to export medical reports.");
    }
  };

  const handleExportPeriodData = () => {
    try {
      downloadCSV(`period-data-${new Date().toISOString().split('T')[0]}.csv`, generatePeriodCSV());
      toast.success("Period data exported!");
    } catch (error) {
      toast.error("Failed to export period data.");
    }
  };

  const handleExportSymptoms = () => {
    try {
      downloadCSV(`symptoms-${new Date().toISOString().split('T')[0]}.csv`, generateSymptomsCSV());
      toast.success("Symptoms data exported!");
    } catch (error) {
      toast.error("Failed to export symptoms data.");
    }
  };

  const handleExportComprehensive = () => {
    try {
      downloadCSV(
        `comprehensive-report-${new Date().toISOString().split('T')[0]}.csv`,
        generateComprehensiveMedicalReport()
      );
      toast.success("Comprehensive report exported!");
    } catch (error) {
      toast.error("Failed to export comprehensive report.");
    }
  };

  return (
    <div className="space-y-4">
      {/* Medication Interaction Warnings */}
      <MedicationInteractionAlert />

      <Tabs defaultValue="health-sync" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="health-sync">Health Sync</TabsTrigger>
          <TabsTrigger value="pdf-reports">PDF Reports</TabsTrigger>
          <TabsTrigger value="csv-export">CSV Export</TabsTrigger>
        </TabsList>

        <TabsContent value="health-sync" className="space-y-4 mt-4">
          {/* Apple Health Sync Section */}
          <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-100 rounded-lg">
            <Heart className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Apple Health Integration</h3>
            <p className="text-sm text-muted-foreground">
              Sync your cycle data with Apple Health
            </p>
          </div>
        </div>

        {!isAuthorized ? (
          <Button onClick={handleRequestPermissions} className="w-full">
            <Heart className="w-4 h-4 mr-2" />
            Connect Apple Health
          </Button>
        ) : (
          <>
            <div className="space-y-4 mb-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="sync-cycle">Sync Cycle Data</Label>
                <Switch
                  id="sync-cycle"
                  checked={config.syncCycleData}
                  onCheckedChange={(checked) => handleConfigChange('syncCycleData', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="sync-weight">Sync Weight</Label>
                <Switch
                  id="sync-weight"
                  checked={config.syncWeight}
                  onCheckedChange={(checked) => handleConfigChange('syncWeight', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="sync-exercise">Sync Exercise</Label>
                <Switch
                  id="sync-exercise"
                  checked={config.syncExercise}
                  onCheckedChange={(checked) => handleConfigChange('syncExercise', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="sync-sleep">Sync Sleep</Label>
                <Switch
                  id="sync-sleep"
                  checked={config.syncSleep}
                  onCheckedChange={(checked) => handleConfigChange('syncSleep', checked)}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSync}
                disabled={isSyncing}
                className="flex-1"
              >
                {isSyncing ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Sync to Health
              </Button>

              <Button
                onClick={handleImport}
                disabled={isSyncing}
                variant="outline"
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-2" />
                Import from Health
              </Button>
            </div>
          </>
        )}
      </Card>

          {/* Google Fit Sync Section */}
          <GoogleFitSync />
        </TabsContent>

        <TabsContent value="pdf-reports" className="mt-4">
          <PDFReportGenerator />
        </TabsContent>

        <TabsContent value="csv-export" className="mt-4">
          {/* Medical Export Section */}
          <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Medical Reports Export</h3>
            <p className="text-sm text-muted-foreground">
              Generate CSV reports for healthcare providers
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Button
            onClick={handleExportComprehensive}
            variant="outline"
            className="w-full justify-start"
          >
            <Activity className="w-4 h-4 mr-2" />
            Export Comprehensive Report
          </Button>

          <Button
            onClick={handleExportPeriodData}
            variant="outline"
            className="w-full justify-start"
          >
            <FileText className="w-4 h-4 mr-2" />
            Export Period Data Only
          </Button>

          <Button
            onClick={handleExportSymptoms}
            variant="outline"
            className="w-full justify-start"
          >
            <FileText className="w-4 h-4 mr-2" />
            Export Symptoms Log
          </Button>

          <Button
            onClick={handleExportMedicalReport}
            variant="default"
            className="w-full justify-start"
          >
            <Download className="w-4 h-4 mr-2" />
            Export All Medical Data
          </Button>
        </div>

            <p className="text-xs text-muted-foreground mt-4">
              These reports are formatted for medical consultation and include all tracked health metrics.
            </p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
