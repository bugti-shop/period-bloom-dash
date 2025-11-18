import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Download, Upload, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { exportAllData, importData } from "@/lib/dataExport";

export const DataBackup = () => {
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleExport = () => {
    try {
      exportAllData();
      toast({
        title: "Data Exported",
        description: "Your backup file has been downloaded"
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data",
        variant: "destructive"
      });
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      toast({
        title: "Invalid File",
        description: "Please select a valid backup JSON file",
        variant: "destructive"
      });
      return;
    }

    setIsImporting(true);
    
    try {
      await importData(file);
      toast({
        title: "Data Imported",
        description: "Your data has been restored successfully. Please refresh the page."
      });
      
      // Refresh after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "Failed to import data. Please check the file format.",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-blue-100 rounded-xl">
          <Database className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-foreground">Data Backup</h3>
          <p className="text-sm text-muted-foreground">
            Export and import all your data
          </p>
        </div>
      </div>

      <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl space-y-4">
        <div className="space-y-2">
          <h4 className="font-medium text-foreground">Export Data</h4>
          <p className="text-sm text-muted-foreground">
            Download all your period data, symptoms, health tracking, voice notes, and settings as a backup file.
          </p>
          <Button
            onClick={handleExport}
            className="w-full bg-blue-500 hover:bg-blue-600"
          >
            <Download className="w-4 h-4 mr-2" />
            Export All Data
          </Button>
        </div>

        <div className="border-t border-gray-200 pt-4 space-y-2">
          <h4 className="font-medium text-foreground">Import Data</h4>
          <p className="text-sm text-muted-foreground">
            Restore your data from a previously exported backup file.
          </p>
          <Button
            onClick={handleImportClick}
            variant="outline"
            className="w-full"
            disabled={isImporting}
          >
            <Upload className="w-4 h-4 mr-2" />
            {isImporting ? "Importing..." : "Import Data"}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-800">
            ⚠️ Importing data will replace all current data. Make sure to export your current data first if needed.
          </p>
        </div>
      </div>
    </div>
  );
};
