import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Download, Share2 } from "lucide-react";
import { loadFromLocalStorage } from "@/lib/storage";
import { toast } from "sonner";

interface WeekPhoto {
  imageData: string;
  timestamp: Date;
}

interface WeekPhotos {
  [week: number]: WeekPhoto;
}

interface BumpPhotoComparisonProps {
  onClose: () => void;
}

export const BumpPhotoComparison = ({ onClose }: BumpPhotoComparisonProps) => {
  const [weekPhotos, setWeekPhotos] = useState<WeekPhotos>({});
  const [week1, setWeek1] = useState<number>(1);
  const [week2, setWeek2] = useState<number>(40);
  const comparisonRef = useRef<HTMLDivElement>(null);
  
  // Get only weeks that have photos
  const weeksWithPhotos = Object.keys(weekPhotos).map(w => parseInt(w)).sort((a, b) => a - b);
  const allWeeks = Array.from({ length: 40 }, (_, i) => i + 1);

  useEffect(() => {
    const storedPhotos = loadFromLocalStorage<WeekPhotos>("pregnancy-week-photos");
    if (storedPhotos) {
      const photosWithDates: WeekPhotos = {};
      Object.keys(storedPhotos).forEach(week => {
        photosWithDates[parseInt(week)] = {
          ...storedPhotos[parseInt(week)],
          timestamp: new Date(storedPhotos[parseInt(week)].timestamp)
        };
      });
      setWeekPhotos(photosWithDates);
      
      // Set initial weeks to first and last photo if available
      const weeks = Object.keys(photosWithDates).map(w => parseInt(w)).sort((a, b) => a - b);
      if (weeks.length > 0) {
        setWeek1(weeks[0]);
        setWeek2(weeks[weeks.length - 1]);
      }
    }
  }, []);

  const downloadComparison = async () => {
    if (!comparisonRef.current) return;

    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(comparisonRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
      });

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `bump-comparison-week${week1}-vs-week${week2}.png`;
        link.click();
        URL.revokeObjectURL(url);
        toast.success("Comparison image downloaded!");
      });
    } catch (error) {
      console.error("Error downloading comparison:", error);
      toast.error("Failed to download comparison");
    }
  };

  const shareComparison = async () => {
    if (!comparisonRef.current) return;

    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(comparisonRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
      });

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        
        const file = new File([blob], `bump-comparison-week${week1}-vs-week${week2}.png`, { type: 'image/png' });
        
        if (navigator.share && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'Bump Photo Comparison',
            text: `Pregnancy bump comparison: Week ${week1} vs Week ${week2}`,
          });
          toast.success("Shared successfully!");
        } else {
          // Fallback to download if sharing is not supported
          downloadComparison();
        }
      });
    } catch (error) {
      console.error("Error sharing comparison:", error);
      toast.error("Failed to share comparison");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-2xl font-semibold text-foreground truncate">Compare Bump Photos</h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={downloadComparison} disabled={!weekPhotos[week1] || !weekPhotos[week2]}>
                <Download className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Download</span>
              </Button>
              <Button variant="outline" size="sm" onClick={shareComparison} disabled={!weekPhotos[week1] || !weekPhotos[week2]}>
                <Share2 className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Share</span>
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose} className="flex-shrink-0">
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {weeksWithPhotos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No bump photos recorded yet.</p>
              <p className="text-sm mt-2">Add photos in the Pregnancy Photo Journal to compare them here.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 sm:mb-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">First Week</label>
                <Select value={week1.toString()} onValueChange={(val) => setWeek1(parseInt(val))}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select week" />
                  </SelectTrigger>
                  <SelectContent>
                    {allWeeks.map(week => (
                      <SelectItem key={week} value={week.toString()}>
                        Week {week}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Second Week</label>
                <Select value={week2.toString()} onValueChange={(val) => setWeek2(parseInt(val))}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select week" />
                  </SelectTrigger>
                  <SelectContent>
                    {allWeeks.map(week => (
                      <SelectItem key={week} value={week.toString()}>
                        Week {week}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div ref={comparisonRef} className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 bg-card p-4 rounded-lg">
              {/* Week 1 Photo */}
              <div>
                <div className="bg-muted/30 rounded-lg overflow-hidden flex items-center justify-center aspect-[4/3]">
                  {weekPhotos[week1] ? (
                    <img
                      src={weekPhotos[week1].imageData}
                      alt={`Week ${week1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                      No photo for this week
                    </div>
                  )}
                </div>
                <div className="mt-2 text-center">
                  <p className="text-sm font-medium text-foreground">Week {week1}</p>
                  {weekPhotos[week1] && (
                    <p className="text-xs text-muted-foreground truncate">
                      {weekPhotos[week1].timestamp.toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              {/* Week 2 Photo */}
              <div>
                <div className="bg-muted/30 rounded-lg overflow-hidden flex items-center justify-center aspect-[4/3]">
                  {weekPhotos[week2] ? (
                    <img
                      src={weekPhotos[week2].imageData}
                      alt={`Week ${week2}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                      No photo for this week
                    </div>
                  )}
                </div>
                <div className="mt-2 text-center">
                  <p className="text-sm font-medium text-foreground">Week {week2}</p>
                  {weekPhotos[week2] && (
                    <p className="text-xs text-muted-foreground truncate">
                      {weekPhotos[week2].timestamp.toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};
