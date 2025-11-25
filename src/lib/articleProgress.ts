const PROGRESS_KEY = 'article-reading-progress';

export interface ArticleProgress {
  articleId: string;
  scrollPosition: number;
  scrollPercentage: number;
  lastRead: number;
  completed: boolean;
}

export const saveArticleProgress = (
  articleId: string,
  scrollPosition: number,
  scrollPercentage: number,
  completed: boolean = false
) => {
  const stored = localStorage.getItem(PROGRESS_KEY);
  let allProgress: Record<string, ArticleProgress> = {};
  
  try {
    allProgress = stored ? JSON.parse(stored) : {};
  } catch {
    allProgress = {};
  }
  
  allProgress[articleId] = {
    articleId,
    scrollPosition,
    scrollPercentage,
    lastRead: Date.now(),
    completed
  };
  
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(allProgress));
};

export const getArticleProgress = (articleId: string): ArticleProgress | null => {
  const stored = localStorage.getItem(PROGRESS_KEY);
  if (!stored) return null;
  
  try {
    const allProgress: Record<string, ArticleProgress> = JSON.parse(stored);
    return allProgress[articleId] || null;
  } catch {
    return null;
  }
};

export const getAllProgress = (): Record<string, ArticleProgress> => {
  const stored = localStorage.getItem(PROGRESS_KEY);
  if (!stored) return {};
  
  try {
    return JSON.parse(stored);
  } catch {
    return {};
  }
};

export const calculateReadingTime = (text: string): number => {
  // Average reading speed is 200-250 words per minute
  // We'll use 225 as a middle ground
  const wordsPerMinute = 225;
  const wordCount = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return minutes;
};
