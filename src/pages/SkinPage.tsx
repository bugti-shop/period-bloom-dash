import { useState } from "react";
import { Sparkles, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { SkinTracker } from "@/components/SkinTracker";
import { Card } from "@/components/ui/card";
import { ToolHeader } from "@/components/ToolHeader";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getAllSkinLogs, getMostCommonCondition } from "@/lib/skinStorage";
import { format, parseISO } from "date-fns";

const SkinPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);
  const [selectedPhoto1, setSelectedPhoto1] = useState<string | null>(null);
  const [selectedPhoto2, setSelectedPhoto2] = useState<string | null>(null);
  
  const allLogs = getAllSkinLogs();
  const mostCommonCondition = getMostCommonCondition();

  const skinDates = allLogs.map(log => parseISO(log.date));
  const logsWithPhotos = allLogs.filter(log => log.photos.length > 0);

  const handleCompare = () => {
    if (logsWithPhotos.length >= 2) {
      setSelectedPhoto1(logsWithPhotos[logsWithPhotos.length - 1].photos[0]);
      setSelectedPhoto2(logsWithPhotos[0].photos[0]);
      setCompareDialogOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <ToolHeader 
        title="Skin Condition Tracker" 
        subtitle="Track your skin health"
        icon={Sparkles}
      />

      <div className="p-4 space-y-4">
        <Card className="p-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="rounded-md border-0"
            modifiers={{
              hasData: skinDates,
            }}
            modifiersStyles={{
              hasData: {
                fontWeight: "bold",
                textDecoration: "underline",
              },
            }}
          />
        </Card>

        <Card className="p-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Most Common Condition</p>
            <p className="text-xl font-bold text-primary">
              {mostCommonCondition || "No data yet"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {allLogs.length} total entries
            </p>
          </div>
          
          {logsWithPhotos.length >= 2 && (
            <Button
              variant="outline"
              className="w-full mt-3"
              onClick={handleCompare}
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              Compare Photos
            </Button>
          )}
        </Card>

        <div className="bg-card rounded-lg p-4 border">
          <p className="text-sm font-medium mb-2">
            Selected: {format(selectedDate, "MMMM dd, yyyy")}
          </p>
        </div>

        <SkinTracker selectedDate={selectedDate} />
      </div>

      <Dialog open={compareDialogOpen} onOpenChange={setCompareDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Photo Comparison</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            {selectedPhoto1 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Latest</p>
                <img
                  src={selectedPhoto1}
                  alt="Recent skin photo"
                  className="w-full rounded-lg"
                />
              </div>
            )}
            {selectedPhoto2 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Earlier</p>
                <img
                  src={selectedPhoto2}
                  alt="Previous skin photo"
                  className="w-full rounded-lg"
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SkinPage;
