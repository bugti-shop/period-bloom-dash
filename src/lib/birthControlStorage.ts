import { saveToLocalStorage, loadFromLocalStorage } from "./storage";

export interface PillReminder {
  enabled: boolean;
  time: string; // HH:MM format
  pillName: string;
  streak: number;
  lastTaken?: Date;
}

export interface PillLog {
  id: string;
  date: Date;
  taken: boolean;
  takenAt?: Date;
  missed: boolean;
}

const PILL_REMINDER_KEY = "birth-control-reminder";
const PILL_LOG_KEY = "birth-control-log";

export const getPillReminder = (): PillReminder => {
  return loadFromLocalStorage<PillReminder>(PILL_REMINDER_KEY) || {
    enabled: false,
    time: "21:00",
    pillName: "Birth Control Pill",
    streak: 0,
  };
};

export const savePillReminder = (reminder: PillReminder): void => {
  saveToLocalStorage(PILL_REMINDER_KEY, reminder);
};

export const logPillTaken = (date: Date = new Date()): void => {
  const logs = getPillLogs();
  const today = new Date(date).setHours(0, 0, 0, 0);
  
  // Check if already logged today
  const existingLog = logs.find(log => 
    new Date(log.date).setHours(0, 0, 0, 0) === today
  );

  if (existingLog) {
    existingLog.taken = true;
    existingLog.takenAt = date;
    existingLog.missed = false;
  } else {
    logs.unshift({
      id: Date.now().toString(),
      date: new Date(today),
      taken: true,
      takenAt: date,
      missed: false,
    });
  }

  saveToLocalStorage(PILL_LOG_KEY, logs);

  // Update streak
  const reminder = getPillReminder();
  reminder.streak = calculateStreak(logs);
  reminder.lastTaken = date;
  savePillReminder(reminder);
};

export const logPillMissed = (date: Date = new Date()): void => {
  const logs = getPillLogs();
  const today = new Date(date).setHours(0, 0, 0, 0);

  logs.unshift({
    id: Date.now().toString(),
    date: new Date(today),
    taken: false,
    missed: true,
  });

  saveToLocalStorage(PILL_LOG_KEY, logs);

  // Reset streak
  const reminder = getPillReminder();
  reminder.streak = 0;
  savePillReminder(reminder);
};

export const getPillLogs = (): PillLog[] => {
  const logs = loadFromLocalStorage<PillLog[]>(PILL_LOG_KEY) || [];
  return logs.map(log => ({
    ...log,
    date: new Date(log.date),
    takenAt: log.takenAt ? new Date(log.takenAt) : undefined,
  }));
};

const calculateStreak = (logs: PillLog[]): number => {
  let streak = 0;
  const sortedLogs = [...logs].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  for (const log of sortedLogs) {
    if (log.taken) {
      streak++;
    } else if (log.missed) {
      break;
    }
  }

  return streak;
};

export const checkMissedPills = (): number => {
  const logs = getPillLogs();
  const today = new Date().setHours(0, 0, 0, 0);
  
  // Check last 7 days for missed pills
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const recentLogs = logs.filter(log => 
    log.date >= sevenDaysAgo && log.missed
  );
  
  return recentLogs.length;
};
