import { Card } from "@/components/ui/card";
import { Calendar, Scale, Activity, Droplet } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const AppointmentCard = () => {
  const navigate = useNavigate();
  
  return (
    <Card 
      className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => navigate("/appointments")}
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          <Calendar className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg">Appointments</h3>
          <p className="text-sm text-muted-foreground">Schedule prenatal visits</p>
        </div>
      </div>
    </Card>
  );
};

export const PregnancyWeightCard = () => {
  const navigate = useNavigate();
  
  return (
    <Card 
      className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => navigate("/pregnancy-weight")}
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          <Scale className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg">Weight Tracker</h3>
          <p className="text-sm text-muted-foreground">Monitor pregnancy weight gain</p>
        </div>
      </div>
    </Card>
  );
};

export const BloodPressureCard = () => {
  const navigate = useNavigate();
  
  return (
    <Card 
      className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => navigate("/blood-pressure")}
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          <Activity className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg">Blood Pressure</h3>
          <p className="text-sm text-muted-foreground">Track BP readings</p>
        </div>
      </div>
    </Card>
  );
};

export const GlucoseCard = () => {
  const navigate = useNavigate();
  
  return (
    <Card 
      className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => navigate("/glucose")}
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          <Droplet className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg">Glucose Tracker</h3>
          <p className="text-sm text-muted-foreground">Monitor blood sugar levels</p>
        </div>
      </div>
    </Card>
  );
};
