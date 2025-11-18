import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { saveSectionVisibility, loadSectionVisibility, SectionVisibility } from "@/lib/sectionVisibility";
import { notifySuccess } from "@/lib/notificationWithHaptics";

export const SectionVisibilitySettings = () => {
  const [visibility, setVisibility] = useState<SectionVisibility>(loadSectionVisibility());

  const handleToggle = (key: keyof SectionVisibility) => {
    const newVisibility = { ...visibility, [key]: !visibility[key] };
    setVisibility(newVisibility);
    saveSectionVisibility(newVisibility);
    notifySuccess("Section visibility updated");
  };

  const sections: { key: keyof SectionVisibility; label: string }[] = [
    { key: "calendar", label: "Calendar" },
    { key: "symptoms", label: "Symptoms Tracker" },
    { key: "mood", label: "Mood Tracker" },
    { key: "intimacy", label: "Intimacy Tracker" },
    { key: "bbt", label: "BBT Tracker" },
    { key: "appetite", label: "Appetite Tracker" },
    { key: "conceiving", label: "Conceiving Tracker" },
    { key: "medications", label: "Medications" },
    { key: "flowIntensity", label: "Flow Intensity" },
    { key: "stickyNotes", label: "Sticky Notes" },
    { key: "insights", label: "Insights" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
          <Eye className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-foreground">Section Visibility</h3>
          <p className="text-sm text-muted-foreground">Hide sections you don't use</p>
        </div>
      </div>

      <div className="glass-card rounded-xl p-4 space-y-3">
        {sections.map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between py-2">
            <Label htmlFor={`section-${key}`} className="flex items-center gap-2">
              {visibility[key] ? (
                <Eye className="w-4 h-4 text-green-600" />
              ) : (
                <EyeOff className="w-4 h-4 text-gray-400" />
              )}
              {label}
            </Label>
            <Switch
              id={`section-${key}`}
              checked={visibility[key]}
              onCheckedChange={() => handleToggle(key)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
