import { useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Trash2, Calendar, Clock, MapPin, User, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { saveAppointment, getAppointments, deleteAppointment, toggleAppointmentComplete } from "@/lib/appointmentStorage";
import { format } from "date-fns";

export default function AppointmentPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState(getAppointments());
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [type, setType] = useState("");
  const [location, setLocation] = useState("");
  const [doctor, setDoctor] = useState("");
  const [notes, setNotes] = useState("");

  const handleAddAppointment = () => {
    if (!date || !time || !type) {
      toast({
        title: "Missing information",
        description: "Please fill in date, time, and appointment type",
        variant: "destructive",
      });
      return;
    }

    saveAppointment({
      id: Date.now().toString(),
      date: new Date(date),
      time,
      type,
      location,
      doctor,
      notes,
      reminderEnabled: true,
      completed: false,
    });

    setAppointments(getAppointments());
    setShowForm(false);
    setDate("");
    setTime("");
    setType("");
    setLocation("");
    setDoctor("");
    setNotes("");

    toast({
      title: "Appointment added",
      description: "Your appointment has been scheduled",
    });
  };

  const handleDelete = (id: string) => {
    deleteAppointment(id);
    setAppointments(getAppointments());
    toast({
      title: "Appointment deleted",
      description: "The appointment has been removed",
    });
  };

  const handleToggleComplete = (id: string) => {
    toggleAppointmentComplete(id);
    setAppointments(getAppointments());
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <h1 className="text-2xl font-bold mb-6">Prenatal Appointments</h1>

        {!showForm ? (
          <Button onClick={() => setShowForm(true)} className="w-full mb-6">
            <Plus className="w-4 h-4 mr-2" />
            Add Appointment
          </Button>
        ) : (
          <Card className="p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">New Appointment</h2>
            
            <div className="space-y-4">
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <div>
                <Label>Time</Label>
                <Input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>

              <div>
                <Label>Appointment Type</Label>
                <Input
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  placeholder="e.g., Regular checkup, Ultrasound, Blood work"
                />
              </div>

              <div>
                <Label>Location</Label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Clinic or hospital name"
                />
              </div>

              <div>
                <Label>Doctor/Provider</Label>
                <Input
                  value={doctor}
                  onChange={(e) => setDoctor(e.target.value)}
                  placeholder="Doctor's name"
                />
              </div>

              <div>
                <Label>Notes</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Questions or things to discuss"
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleAddAppointment} className="flex-1">
                  Save Appointment
                </Button>
                <Button onClick={() => setShowForm(false)} variant="outline">
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Your Appointments</h2>
          
          {appointments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No appointments scheduled</p>
          ) : (
            <div className="space-y-3">
              {appointments.map((apt) => (
                <div
                  key={apt.id}
                  className={`p-4 rounded-lg border ${apt.completed ? 'bg-muted/50' : 'bg-card'}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className={`font-semibold ${apt.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {apt.type}
                        </h3>
                        {apt.completed && <CheckCircle className="w-4 h-4 text-primary" />}
                      </div>
                      
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{format(apt.date, "MMMM dd, yyyy")}</span>
                          <Clock className="w-4 h-4 ml-2" />
                          <span>{apt.time}</span>
                        </div>
                        
                        {apt.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{apt.location}</span>
                          </div>
                        )}
                        
                        {apt.doctor && (
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span>{apt.doctor}</span>
                          </div>
                        )}
                        
                        {apt.notes && (
                          <p className="mt-2 text-foreground">{apt.notes}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleComplete(apt.id)}
                      >
                        <CheckCircle className={`w-4 h-4 ${apt.completed ? 'text-primary' : ''}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(apt.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
