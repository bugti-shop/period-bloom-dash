import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  saveSkinLog,
  getSkinForDate,
  skinConditions,
} from "@/lib/skinStorage";
import { saveSymptomPhoto, loadSymptomPhotosForDate, deleteSymptomPhoto } from "@/lib/symptomPhotoStorage";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Camera, X } from "lucide-react";

interface SkinTrackerProps {
  selectedDate: Date;
}

export const SkinTracker = ({ selectedDate }: SkinTrackerProps) => {
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [severity, setSeverity] = useState<{ [condition: string]: number }>({});
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoIds, setPhotoIds] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadDataForDate();
  }, [selectedDate]);

  const loadDataForDate = async () => {
    const log = getSkinForDate(selectedDate);
    if (log) {
      setSelectedConditions(log.conditions);
      setSeverity(log.severity);
      setNotes(log.notes);
      
      // Load photos from filesystem
      const symptomPhotos = await loadSymptomPhotosForDate('skin', selectedDate);
      setPhotos(symptomPhotos.map(p => p.imageData || ''));
      setPhotoIds(symptomPhotos.map(p => p.id));
    } else {
      setSelectedConditions([]);
      setSeverity({});
      setPhotos([]);
      setPhotoIds([]);
      setNotes("");
    }
  };

  const handleConditionToggle = (condition: string) => {
    if (selectedConditions.includes(condition)) {
      setSelectedConditions(prev => prev.filter(c => c !== condition));
      const newSeverity = { ...severity };
      delete newSeverity[condition];
      setSeverity(newSeverity);
    } else {
      setSelectedConditions(prev => [...prev, condition]);
      if (condition !== "Clear skin") {
        setSeverity(prev => ({ ...prev, [condition]: 3 }));
      }
    }
  };

  const handleSeverityChange = (condition: string, value: number[]) => {
    setSeverity(prev => ({ ...prev, [condition]: value[0] }));
  };

  const handlePhotoCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newPhotoIds: string[] = [];
    const newPhotos: string[] = [];

    for (const file of Array.from(files)) {
      const reader = new FileReader();
      await new Promise<void>((resolve) => {
        reader.onloadend = async () => {
          const base64Data = reader.result as string;
          
          // Save photo instantly to filesystem
          try {
            const photoId = await saveSymptomPhoto(base64Data, 'skin', {
              date: selectedDate,
              notes: notes,
              severity: Object.values(severity).reduce((a, b) => a + b, 0) / Object.keys(severity).length,
              conditions: selectedConditions
            });
            
            newPhotoIds.push(photoId);
            newPhotos.push(base64Data);
            toast({
              title: "Photo saved",
              description: "Photo saved instantly to device storage",
            });
          } catch (error) {
            console.error('Error saving photo:', error);
            toast({
              title: "Error",
              description: "Failed to save photo",
              variant: "destructive"
            });
          }
          
          resolve();
        };
        reader.readAsDataURL(file);
      });
    }

    setPhotos(prev => [...prev, ...newPhotos]);
    setPhotoIds(prev => [...prev, ...newPhotoIds]);
  };

  const removePhoto = async (index: number) => {
    const photoId = photoIds[index];
    if (photoId) {
      try {
        await deleteSymptomPhoto(photoId);
        toast({
          title: "Photo deleted",
          description: "Photo removed from device storage",
        });
      } catch (error) {
        console.error('Error deleting photo:', error);
      }
    }
    
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoIds(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    // Photos are already saved to filesystem instantly
    // Only save the metadata (conditions, severity, notes)
    saveSkinLog(selectedDate, selectedConditions, severity, [], notes);
    toast({
      title: "Skin condition saved",
      description: `Logged for ${format(selectedDate, "MMM dd, yyyy")}. Photos saved to device storage.`,
    });
  };

  const getSeverityColor = (level: number) => {
    if (level <= 2) return "bg-green-500";
    if (level <= 3) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getSeverityLabel = (level: number) => {
    if (level === 1) return "Very Mild";
    if (level === 2) return "Mild";
    if (level === 3) return "Moderate";
    if (level === 4) return "Severe";
    return "Very Severe";
  };

  return (
    <Card className="p-6">
      <h3 className="font-semibold text-lg mb-4">Skin Condition Tracker</h3>
      
      <div className="space-y-6">
        <div>
          <Label className="text-sm mb-3 block">Skin Conditions</Label>
          <div className="space-y-4">
            {skinConditions.map((condition) => (
              <div key={condition} className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={condition}
                    checked={selectedConditions.includes(condition)}
                    onCheckedChange={() => handleConditionToggle(condition)}
                  />
                  <Label
                    htmlFor={condition}
                    className="text-sm font-normal cursor-pointer flex-1"
                  >
                    {condition}
                  </Label>
                </div>
                
                {selectedConditions.includes(condition) && condition !== "Clear skin" && (
                  <div className="ml-6 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        Severity: {getSeverityLabel(severity[condition] || 3)}
                      </span>
                      <span className="font-medium">{severity[condition] || 3}/5</span>
                    </div>
                    <Slider
                      value={[severity[condition] || 3]}
                      onValueChange={(value) => handleSeverityChange(condition, value)}
                      min={1}
                      max={5}
                      step={1}
                      className="w-full"
                    />
                    <div className="h-1 rounded-full bg-muted">
                      <div
                        className={`h-1 rounded-full transition-all ${getSeverityColor(
                          severity[condition] || 3
                        )}`}
                        style={{ width: `${((severity[condition] || 3) / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-sm mb-3 block">Photos (optional)</Label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotoCapture}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="w-full"
          >
            <Camera className="h-4 w-4 mr-2" />
            Add Photos
          </Button>
          
          {photos.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-3">
              {photos.map((photo, index) => (
                <div key={index} className="relative">
                  <img
                    src={photo}
                    alt={`Skin photo ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removePhoto(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="skin-notes" className="text-sm mb-2 block">
            Notes (optional)
          </Label>
          <Textarea
            id="skin-notes"
            placeholder="Products used, triggers noticed, etc..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>

        <Button onClick={handleSave} className="w-full">
          Save Skin Log
        </Button>
      </div>
    </Card>
  );
};
