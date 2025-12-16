import { useState } from "react";
import { useMobileBackButton } from "@/hooks/useMobileBackButton";
import { useBackNavigation } from "@/hooks/useBackNavigation";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { format } from "date-fns";
import { CalendarIcon, Droplet, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  loadCervicalMucusEntries,
  saveCervicalMucusEntry,
  deleteCervicalMucusEntry,
  getCervicalMucusEntryByDate,
  type CervicalMucusEntry,
} from "@/lib/cervicalMucusStorage";
import { toast } from "sonner";

export const CervicalMucusPage = () => {
  const goBack = useBackNavigation("tools");
  useMobileBackButton();
  const [date, setDate] = useState<Date>(new Date());
  const [type, setType] = useState<"dry" | "sticky" | "creamy" | "watery" | "egg-white">("creamy");
  const [amount, setAmount] = useState<"none" | "light" | "moderate" | "heavy">("moderate");
  const [notes, setNotes] = useState<string>("");
  const [entries, setEntries] = useState<CervicalMucusEntry[]>(loadCervicalMucusEntries());

  const selectedDateEntry = getCervicalMucusEntryByDate(format(date, "yyyy-MM-dd"));

  const handleSave = () => {
    const dateStr = format(date, "yyyy-MM-dd");
    saveCervicalMucusEntry({ date: dateStr, type, amount, notes });
    setEntries(loadCervicalMucusEntries());
    toast.success("Cervical mucus logged!");
    setType("creamy");
    setAmount("moderate");
    setNotes("");
  };

  const handleDelete = (id: string) => {
    deleteCervicalMucusEntry(id);
    setEntries(loadCervicalMucusEntries());
    toast.success("Entry deleted");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-primary text-primary-foreground p-4 sticky top-0 z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={goBack}
          className="text-primary-foreground hover:bg-primary-foreground/20"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold mt-2">Cervical Mucus Tracker</h1>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">

        <Card className="p-6 space-y-4">
          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Type</Label>
            <RadioGroup value={type} onValueChange={(v: any) => setType(v)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dry" id="dry" />
                <Label htmlFor="dry" className="cursor-pointer">Dry</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sticky" id="sticky" />
                <Label htmlFor="sticky" className="cursor-pointer">Sticky</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="creamy" id="creamy" />
                <Label htmlFor="creamy" className="cursor-pointer">Creamy</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="watery" id="watery" />
                <Label htmlFor="watery" className="cursor-pointer">Watery</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="egg-white" id="egg-white" />
                <Label htmlFor="egg-white" className="cursor-pointer">Egg White (most fertile)</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Amount</Label>
            <RadioGroup value={amount} onValueChange={(v: any) => setAmount(v)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="none" id="none" />
                <Label htmlFor="none" className="cursor-pointer">None</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="light" id="light" />
                <Label htmlFor="light" className="cursor-pointer">Light</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="moderate" id="moderate-amount" />
                <Label htmlFor="moderate-amount" className="cursor-pointer">Moderate</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="heavy" id="heavy" />
                <Label htmlFor="heavy" className="cursor-pointer">Heavy</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any observations..."
              rows={2}
            />
          </div>

          <Button onClick={handleSave} className="w-full">
            Log Cervical Mucus
          </Button>

          {selectedDateEntry && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Entry for {format(date, "PPP")}</p>
              <p className="text-lg font-semibold">
                {selectedDateEntry.type} - {selectedDateEntry.amount}
              </p>
              {selectedDateEntry.notes && (
                <p className="text-sm text-muted-foreground mt-2">{selectedDateEntry.notes}</p>
              )}
            </div>
          )}
        </Card>

        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">Recent Entries</h2>
          {entries.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No entries yet. Start logging!</p>
          ) : (
            entries
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 10)
              .map((entry) => (
                <Card key={entry.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-foreground">{format(new Date(entry.date), "PPP")}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Type: {entry.type} - Amount: {entry.amount}
                      </p>
                      {entry.notes && <p className="text-sm text-muted-foreground mt-1">{entry.notes}</p>}
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(entry.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </Card>
              ))
          )}
        </div>
      </div>
    </div>
  );
};
