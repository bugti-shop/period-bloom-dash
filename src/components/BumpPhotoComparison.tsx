import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import { loadFromLocalStorage } from "@/lib/storage";
import { getFetalImageForWeek, getFetalImageScale } from "@/lib/fetalImages";
import { getBabyDataForWeek } from "@/lib/pregnancyData";

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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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
                    <div className="flex flex-col items-center justify-center p-4">
                      <img
                        src={getFetalImageForWeek(week1)}
                        alt={`Fetal development week ${week1}`}
                        className="object-contain transition-all duration-300"
                        style={{
                          width: `${getFetalImageScale(week1) * 100}px`,
                          height: `${getFetalImageScale(week1) * 100}px`,
                        }}
                      />
                      <p className="text-xs text-muted-foreground mt-2 text-center">
                        {getBabyDataForWeek(week1).size}
                      </p>
                      <p className="text-xs text-muted-foreground/70 mt-1">No photo yet</p>
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
                    <div className="flex flex-col items-center justify-center p-4">
                      <img
                        src={getFetalImageForWeek(week2)}
                        alt={`Fetal development week ${week2}`}
                        className="object-contain transition-all duration-300"
                        style={{
                          width: `${getFetalImageScale(week2) * 100}px`,
                          height: `${getFetalImageScale(week2) * 100}px`,
                        }}
                      />
                      <p className="text-xs text-muted-foreground mt-2 text-center">
                        {getBabyDataForWeek(week2).size}
                      </p>
                      <p className="text-xs text-muted-foreground/70 mt-1">No photo yet</p>
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
        </div>
      </Card>
    </div>
  );
};
