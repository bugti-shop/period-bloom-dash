import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Activity, RefreshCw, Download } from "lucide-react";
import { toast } from "sonner";
import {
  requestGoogleFitPermissions,
  syncAllDataToGoogleFit,
  getGoogleFitConfig,
  setGoogleFitConfig,
  importDataFromGoogleFit,
  type GoogleFitConfig,
} from "@/lib/googleFitSync";

export const GoogleFitSync = () => {
  const [config, setConfig] = useState<GoogleFitConfig>(getGoogleFitConfig());
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuthorization = async () => {
      try {
        const permissions = await requestGoogleFitPermissions();
        setIsAuthorized(!!permissions);
      } catch (error) {
        console.log('Google Fit permissions not available');
      }
    };
    checkAuthorization();
  }, []);

  const handleConfigChange = (key: keyof GoogleFitConfig, value: boolean) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    setGoogleFitConfig(newConfig);
  };

  const handleRequestPermissions = async () => {
    try {
      await requestGoogleFitPermissions();
      setIsAuthorized(true);
      toast.success("Google Fit permissions granted!");
    } catch (error) {
      toast.error("Failed to request Google Fit permissions. Make sure you're on Android.");
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncAllDataToGoogleFit();
      toast.success("Successfully synced data to Google Fit!");
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
      startDate.setFullYear(startDate.getFullYear() - 1);
      
      const data = await importDataFromGoogleFit(startDate, endDate);
      toast.success(`Imported data from Google Fit!`);
    } catch (error) {
      toast.error("Failed to import data from Google Fit.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-green-100 rounded-lg">
          <Activity className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Google Fit Integration</h3>
          <p className="text-sm text-muted-foreground">
            Sync your health data with Google Fit (Android)
          </p>
        </div>
      </div>

      {!isAuthorized ? (
        <Button onClick={handleRequestPermissions} className="w-full">
          <Activity className="w-4 h-4 mr-2" />
          Connect Google Fit
        </Button>
      ) : (
        <>
          <div className="space-y-4 mb-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="gfit-sync-cycle">Sync Cycle Data</Label>
              <Switch
                id="gfit-sync-cycle"
                checked={config.syncCycleData}
                onCheckedChange={(checked) => handleConfigChange('syncCycleData', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="gfit-sync-weight">Sync Weight</Label>
              <Switch
                id="gfit-sync-weight"
                checked={config.syncWeight}
                onCheckedChange={(checked) => handleConfigChange('syncWeight', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="gfit-sync-exercise">Sync Exercise</Label>
              <Switch
                id="gfit-sync-exercise"
                checked={config.syncExercise}
                onCheckedChange={(checked) => handleConfigChange('syncExercise', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="gfit-sync-sleep">Sync Sleep</Label>
              <Switch
                id="gfit-sync-sleep"
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
              Sync to Google Fit
            </Button>

            <Button
              onClick={handleImport}
              disabled={isSyncing}
              variant="outline"
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              Import from Google Fit
            </Button>
          </div>
        </>
      )}
    </Card>
  );
};
