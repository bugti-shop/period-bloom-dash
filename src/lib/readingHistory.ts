import { differenceInDays, startOfDay, format } from "date-fns";

const HISTORY_KEY = 'reading-history';
const STREAKS_KEY = 'reading-streaks';

export interface ReadingHistoryEntry {
  articleId: string;
  articleTitle: string;
  category: string;
  completedAt: number;
  readingTime: number; // in minutes
}

export interface ReadingStreak {
  currentStreak: number;
  longestStreak: number;
  lastReadDate: string; // YYYY-MM-DD format
}

export const addToHistory = (
  articleId: string,
  articleTitle: string,
  category: string,
  readingTime: number
) => {
  const stored = localStorage.getItem(HISTORY_KEY);
  let history: ReadingHistoryEntry[] = [];
  
  try {
    history = stored ? JSON.parse(stored) : [];
  } catch {
    history = [];
  }
  
  // Check if already in history
  const exists = history.find(entry => entry.articleId === articleId);
  if (exists) return; // Don't add duplicates
  
  history.push({
    articleId,
    articleTitle,
    category,
    completedAt: Date.now(),
    readingTime
  });
  
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  
  // Update streaks
  updateReadingStreak();
};

export const getReadingHistory = (): ReadingHistoryEntry[] => {
  const stored = localStorage.getItem(HISTORY_KEY);
  if (!stored) return [];
  
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

export const getTotalReadingTime = (): number => {
  const history = getReadingHistory();
  return history.reduce((total, entry) => total + entry.readingTime, 0);
};

export const getCategoryStats = (): Record<string, number> => {
  const history = getReadingHistory();
  const stats: Record<string, number> = {};
  
  history.forEach(entry => {
    stats[entry.category] = (stats[entry.category] || 0) + 1;
  });
  
  return stats;
};

const updateReadingStreak = () => {
  const stored = localStorage.getItem(STREAKS_KEY);
  let streak: ReadingStreak = {
    currentStreak: 0,
    longestStreak: 0,
    lastReadDate: ''
  };
  
  try {
    streak = stored ? JSON.parse(stored) : streak;
  } catch {
    // Use default
  }
  
  const today = format(startOfDay(new Date()), 'yyyy-MM-dd');
  
  if (streak.lastReadDate === today) {
    // Already read today, no change
    return;
  }
  
  if (streak.lastReadDate) {
    const lastDate = new Date(streak.lastReadDate);
    const daysDiff = differenceInDays(startOfDay(new Date()), startOfDay(lastDate));
    
    if (daysDiff === 1) {
      // Consecutive day
      streak.currentStreak += 1;
    } else if (daysDiff > 1) {
      // Streak broken, restart
      streak.currentStreak = 1;
    }
  } else {
    // First reading
    streak.currentStreak = 1;
  }
  
  streak.lastReadDate = today;
  streak.longestStreak = Math.max(streak.longestStreak, streak.currentStreak);
  
  localStorage.setItem(STREAKS_KEY, JSON.stringify(streak));
};

export const getReadingStreak = (): ReadingStreak => {
  const stored = localStorage.getItem(STREAKS_KEY);
  if (!stored) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastReadDate: ''
    };
  }
  
  try {
    return JSON.parse(stored);
  } catch {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastReadDate: ''
    };
  }
};

export const getReadingActivityByDate = (): Record<string, number> => {
  const history = getReadingHistory();
  const activity: Record<string, number> = {};
  
  history.forEach(entry => {
    const date = format(startOfDay(new Date(entry.completedAt)), 'yyyy-MM-dd');
    activity[date] = (activity[date] || 0) + 1;
  });
  
  return activity;
};
