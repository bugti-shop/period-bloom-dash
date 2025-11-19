import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import { loadFromLocalStorage } from "@/lib/storage";

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
  const [week1, setWeek1] = useState<number | null>(null);
  const [week2, setWeek2] = useState<number | null>(null);
  const [availableWeeks, setAvailableWeeks] = useState<number[]>([]);

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
      
      const weeks = Object.keys(photosWithDates).map(w => parseInt(w)).sort((a, b) => a - b);
      setAvailableWeeks(weeks);
      
      if (weeks.length >= 2) {
        setWeek1(weeks[0]);
        setWeek2(weeks[weeks.length - 1]);
      } else if (weeks.length === 1) {
        setWeek1(weeks[0]);
      }
    }
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-2xl font-semibold text-foreground truncate">Compare Bump Photos</h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="flex-shrink-0">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {availableWeeks.length < 2 ? (
            <div className="text-center py-8 sm:py-12 text-muted-foreground">
              <p className="text-sm sm:text-base">You need at least 2 photos to compare.</p>
              <p className="text-xs sm:text-sm mt-2">Add more weekly photos to use this feature.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 sm:mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">First Week</label>
                  <Select value={week1?.toString()} onValueChange={(val) => setWeek1(parseInt(val))}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select week" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableWeeks.map(week => (
                        <SelectItem key={week} value={week.toString()}>
                          Week {week}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">Second Week</label>
                  <Select value={week2?.toString()} onValueChange={(val) => setWeek2(parseInt(val))}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select week" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableWeeks.map(week => (
                        <SelectItem key={week} value={week.toString()}>
                          Week {week}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {week1 !== null && weekPhotos[week1] && (
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-foreground truncate">Week {week1}</h3>
                    <img
                      src={weekPhotos[week1].imageData}
                      alt={`Week ${week1}`}
                      className="w-full aspect-[4/3] object-cover rounded-lg"
                    />
                    <p className="text-xs sm:text-sm text-muted-foreground mt-2 truncate">
                      {new Date(weekPhotos[week1].timestamp).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {week2 !== null && weekPhotos[week2] && (
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-foreground truncate">Week {week2}</h3>
                    <img
                      src={weekPhotos[week2].imageData}
                      alt={`Week {week2}`}
                      className="w-full aspect-[4/3] object-cover rounded-lg"
                    />
                    <p className="text-xs sm:text-sm text-muted-foreground mt-2 truncate">
                      {new Date(weekPhotos[week2].timestamp).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};
