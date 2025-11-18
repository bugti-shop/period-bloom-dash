import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, Upload, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { saveToLocalStorage, loadFromLocalStorage } from "@/lib/storage";

interface DisguiseSettings {
  appName: string;
  appIcon: string; // base64 encoded
}

export const DisguiseMode = () => {
  const [appName, setAppName] = useState("Lufi");
  const [appIcon, setAppIcon] = useState("");
  const [previewIcon, setPreviewIcon] = useState("");
  const [isEnabled, setIsEnabled] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const saved = loadFromLocalStorage<DisguiseSettings>("disguise-settings");
    if (saved) {
      setAppName(saved.appName);
      setAppIcon(saved.appIcon);
      setPreviewIcon(saved.appIcon);
      setIsEnabled(true);
      applyDisguise(saved.appName, saved.appIcon);
    }
  }, []);

  const applyDisguise = (name: string, icon: string) => {
    // Update document title
    document.title = name;

    // Update favicon
    if (icon) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = icon;
    }
  };

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please upload an image file",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 1MB",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setPreviewIcon(base64);
      setAppIcon(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!appName.trim()) {
      toast({
        title: "App Name Required",
        description: "Please enter an app name",
        variant: "destructive"
      });
      return;
    }

    const settings: DisguiseSettings = {
      appName: appName.trim(),
      appIcon
    };

    saveToLocalStorage("disguise-settings", settings);
    applyDisguise(settings.appName, settings.appIcon);
    setIsEnabled(true);

    toast({
      title: "Disguise Mode Enabled",
      description: "Your app has been disguised for privacy"
    });
  };

  const handleReset = () => {
    const defaultName = "Lufi";
    setAppName(defaultName);
    setAppIcon("");
    setPreviewIcon("");
    setIsEnabled(false);
    
    localStorage.removeItem("disguise-settings");
    document.title = defaultName;
    
    // Reset favicon to default
    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (link) {
      link.href = "/favicon.ico";
    }

    toast({
      title: "Disguise Removed",
      description: "App restored to default appearance"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-purple-100 rounded-xl">
          <Eye className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-foreground">Disguise Mode</h3>
          <p className="text-sm text-muted-foreground">
            Customize app name and icon for privacy (applies to browser tab)
          </p>
          <p className="text-xs text-purple-600 mt-1">
            For native mobile app: Available in Play Store version
          </p>
        </div>
      </div>

      <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl space-y-4">
        <div className="space-y-2">
          <Label htmlFor="appName" className="text-foreground font-medium">
            App Name
          </Label>
          <Input
            id="appName"
            type="text"
            value={appName}
            onChange={(e) => setAppName(e.target.value)}
            placeholder="e.g., Calculator, Notes, Calendar"
            maxLength={50}
            className="bg-white/80"
          />
          <p className="text-xs text-muted-foreground">
            This will appear in your browser tab
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="appIcon" className="text-foreground font-medium">
            App Icon
          </Label>
          <div className="flex items-center gap-4">
            {previewIcon && (
              <img
                src={previewIcon}
                alt="Preview"
                className="w-12 h-12 rounded-lg border-2 border-white shadow-sm"
              />
            )}
            <div className="flex-1">
              <label
                htmlFor="appIcon"
                className="flex items-center justify-center gap-2 p-3 bg-white/80 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary transition-colors"
              >
                <Upload className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {previewIcon ? "Change Icon" : "Upload Icon"}
                </span>
                <input
                  id="appIcon"
                  type="file"
                  accept="image/*"
                  onChange={handleIconUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Upload a small square image (max 1MB)
          </p>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleSave}
            variant="pill"
            size="pill"
            className="flex-1"
          >
            Apply Disguise
          </Button>
          {isEnabled && (
            <Button
              onClick={handleReset}
              variant="outline"
              className="flex-1"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset to Default
            </Button>
          )}
        </div>

        {isEnabled && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              ✓ Disguise Mode is active
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
