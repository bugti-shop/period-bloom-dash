import { saveToLocalStorage, loadFromLocalStorage } from "./storage";

export interface Contraction {
  id: string;
  startTime: number;
  endTime?: number;
  duration?: number; // in seconds
}

export interface ContractionSession {
  id: string;
  date: string;
  contractions: Contraction[];
  createdAt: number;
}

const CONTRACTIONS_KEY = "contractions";

export const saveContractionSessions = (sessions: ContractionSession[]): void => {
  saveToLocalStorage(CONTRACTIONS_KEY, sessions);
};

export const loadContractionSessions = (): ContractionSession[] => {
  return loadFromLocalStorage<ContractionSession[]>(CONTRACTIONS_KEY) || [];
};

export const addContractionSession = (session: ContractionSession): void => {
  const sessions = loadContractionSessions();
  sessions.push(session);
  saveContractionSessions(sessions);
};

export const updateContractionSession = (sessionId: string, updatedSession: ContractionSession): void => {
  const sessions = loadContractionSessions();
  const index = sessions.findIndex(s => s.id === sessionId);
  if (index !== -1) {
    sessions[index] = updatedSession;
    saveContractionSessions(sessions);
  }
};

export const deleteContractionSession = (sessionId: string): void => {
  const sessions = loadContractionSessions();
  const filtered = sessions.filter(s => s.id !== sessionId);
  saveContractionSessions(filtered);
};

export const calculateFrequency = (contractions: Contraction[]): number => {
  if (contractions.length < 2) return 0;
  
  const completedContractions = contractions.filter(c => c.endTime);
  if (completedContractions.length < 2) return 0;
  
  const intervals: number[] = [];
  for (let i = 1; i < completedContractions.length; i++) {
    const interval = (completedContractions[i].startTime - completedContractions[i - 1].startTime) / 60000; // in minutes
    intervals.push(interval);
  }
  
  const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  return Math.round(avgInterval * 10) / 10;
};

export const detectPattern = (contractions: Contraction[]): string => {
  if (contractions.length < 3) return "Not enough data";
  
  const completedContractions = contractions.filter(c => c.endTime && c.duration);
  if (completedContractions.length < 3) return "Not enough data";
  
  const frequency = calculateFrequency(contractions);
  const avgDuration = completedContractions.reduce((sum, c) => sum + (c.duration || 0), 0) / completedContractions.length;
  
  // Early labor: contractions 5-30 minutes apart, 30-45 seconds long
  // Active labor: contractions 3-5 minutes apart, 45-60 seconds long
  // Transition: contractions 2-3 minutes apart, 60-90 seconds long
  
  if (frequency <= 3 && avgDuration >= 60) {
    return "🚨 Transition phase - Consider contacting your healthcare provider";
  } else if (frequency <= 5 && avgDuration >= 45) {
    return "⚠️ Active labor pattern detected";
  } else if (frequency <= 30 && avgDuration >= 30) {
    return "📊 Early labor pattern";
  } else {
    return "📈 Irregular pattern - Continue monitoring";
  }
};
