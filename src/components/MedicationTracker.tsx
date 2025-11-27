import { useState } from "react";
import { Plus, Pill, Trash2, Check, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Medication,
  loadMedications,
  addMedication,
  deleteMedication,
  logMedicationTaken,
  getMedicationLog,
} from "@/lib/medicationStorage";
import { notifySuccess } from "@/lib/notificationWithHaptics";
import { format } from "date-fns";
import { MedicationInteractionAlert } from "./MedicationInteractionAlert";

export const MedicationTracker = () => {
  const [medications, setMedications] = useState<Medication[]>(loadMedications());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newMed, setNewMed] = useState({
    name: "",
    type: "pill" as Medication["type"],
    dosage: "",
    frequency: "daily" as Medication["frequency"],
    time: "08:00",
    reminderEnabled: true,
    notes: "",
  });

  const handleAddMedication = () => {
    if (!newMed.name || !newMed.dosage) {
      return;
    }

    const medication: Medication = {
      id: Date.now().toString(),
      ...newMed,
      startDate: new Date(),
    };

    addMedication(medication);
    setMedications(loadMedications());
    setIsDialogOpen(false);
    setNewMed({
      name: "",
      type: "pill",
      dosage: "",
      frequency: "daily",
      time: "08:00",
      reminderEnabled: true,
      notes: "",
    });
    notifySuccess("Medication added successfully");
  };

  const handleDelete = (id: string) => {
    deleteMedication(id);
    setMedications(loadMedications());
    notifySuccess("Medication removed");
  };

  const handleLogTaken = (medication: Medication) => {
    logMedicationTaken(medication.id, new Date());
    notifySuccess(`Logged ${medication.name}`);
  };

  const getMedicationTypeIcon = (type: Medication["type"]) => {
    return <Pill className="w-5 h-5" />;
  };

  const getTypeColor = (type: Medication["type"]) => {
    switch (type) {
      case "pill":
        return "bg-blue-100 text-blue-700";
      case "vitamin":
        return "bg-green-100 text-green-700";
      case "contraception":
        return "bg-pink-100 text-pink-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-4">
      {/* Medication Interaction Warnings */}
      <MedicationInteractionAlert />
      
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Medications & Supplements</h2>
          <p className="text-sm text-muted-foreground">Track your daily medications</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Medication</DialogTitle>
              <DialogDescription>
                Add a new medication, vitamin, or supplement to track
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newMed.name}
                  onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                  placeholder="e.g., Vitamin D, Birth Control"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select value={newMed.type} onValueChange={(value: any) => setNewMed({ ...newMed, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pill">Pill/Tablet</SelectItem>
                    <SelectItem value="vitamin">Vitamin/Supplement</SelectItem>
                    <SelectItem value="contraception">Birth Control</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dosage">Dosage</Label>
                <Input
                  id="dosage"
                  value={newMed.dosage}
                  onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
                  placeholder="e.g., 500mg, 1 tablet"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Select value={newMed.frequency} onValueChange={(value: any) => setNewMed({ ...newMed, frequency: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="twice-daily">Twice Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="as-needed">As Needed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(newMed.frequency === "daily" || newMed.frequency === "twice-daily") && (
                <div className="space-y-2">
                  <Label htmlFor="time">Reminder Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newMed.time}
                    onChange={(e) => setNewMed({ ...newMed, time: e.target.value })}
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <Label htmlFor="reminder">Enable Reminders</Label>
                <Switch
                  id="reminder"
                  checked={newMed.reminderEnabled}
                  onCheckedChange={(checked) => setNewMed({ ...newMed, reminderEnabled: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={newMed.notes}
                  onChange={(e) => setNewMed({ ...newMed, notes: e.target.value })}
                  placeholder="Any additional notes..."
                />
              </div>

              <Button onClick={handleAddMedication} className="w-full">
                Add Medication
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {medications.length === 0 ? (
        <div className="text-center py-12 glass-card rounded-2xl">
          <Pill className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">No medications tracked yet</p>
          <p className="text-sm text-muted-foreground">Add your first medication to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {medications.map((med) => (
            <div key={med.id} className="glass-card rounded-xl p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${getTypeColor(med.type)}`}>
                    {getMedicationTypeIcon(med.type)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{med.name}</h3>
                    <p className="text-sm text-muted-foreground">{med.dosage}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {med.frequency.replace("-", " ")}
                      {med.time && ` at ${med.time}`}
                    </p>
                    {med.notes && (
                      <p className="text-xs text-muted-foreground mt-1">{med.notes}</p>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(med.id)}
                  className="text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleLogTaken(med)}
                  className="flex-1"
                >
                  <Check className="w-4 h-4 mr-1" />
                  Mark as Taken
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
