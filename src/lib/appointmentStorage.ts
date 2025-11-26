import { saveToLocalStorage, loadFromLocalStorage } from "./storage";

export interface Appointment {
  id: string;
  date: Date;
  time: string;
  type: string;
  location: string;
  doctor: string;
  notes?: string;
  preparationChecklist?: string[];
  completed?: boolean;
  reminderEnabled?: boolean;
}

const APPOINTMENTS_KEY = "pregnancy-appointments";

export const saveAppointment = (appointment: Appointment): void => {
  const appointments = getAppointments();
  const existingIndex = appointments.findIndex((a) => a.id === appointment.id);
  
  if (existingIndex >= 0) {
    appointments[existingIndex] = appointment;
  } else {
    appointments.push(appointment);
  }
  
  saveToLocalStorage(APPOINTMENTS_KEY, appointments);
};

export const getAppointments = (): Appointment[] => {
  const appointments = loadFromLocalStorage<Appointment[]>(APPOINTMENTS_KEY);
  if (!appointments) return [];
  
  return appointments.map(apt => ({
    ...apt,
    date: new Date(apt.date)
  })).sort((a, b) => a.date.getTime() - b.date.getTime());
};

export const deleteAppointment = (id: string): void => {
  const appointments = getAppointments().filter((a) => a.id !== id);
  saveToLocalStorage(APPOINTMENTS_KEY, appointments);
};

export const getUpcomingAppointments = (): Appointment[] => {
  const now = new Date();
  return getAppointments().filter(apt => apt.date >= now && !apt.completed);
};

export const toggleAppointmentComplete = (id: string): void => {
  const appointments = getAppointments();
  const appointment = appointments.find(a => a.id === id);
  if (appointment) {
    appointment.completed = !appointment.completed;
    saveToLocalStorage(APPOINTMENTS_KEY, appointments);
  }
};
