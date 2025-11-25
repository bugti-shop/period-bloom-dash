const OFFLINE_ARTICLES_KEY = 'offline-articles';

export interface OfflineArticle {
  id: string;
  title: string;
  content: string[];
  category: string;
  image: string;
  date: string;
  author: string;
  downloadedAt: number;
}

export const saveArticleOffline = (
  id: string,
  title: string,
  content: string[],
  category: string,
  image: string,
  date: string,
  author: string
) => {
  const stored = localStorage.getItem(OFFLINE_ARTICLES_KEY);
  let allArticles: Record<string, OfflineArticle> = {};
  
  try {
    allArticles = stored ? JSON.parse(stored) : {};
  } catch {
    allArticles = {};
  }
  
  allArticles[id] = {
    id,
    title,
    content,
    category,
    image,
    date,
    author,
    downloadedAt: Date.now()
  };
  
  localStorage.setItem(OFFLINE_ARTICLES_KEY, JSON.stringify(allArticles));
};

export const getOfflineArticle = (id: string): OfflineArticle | null => {
  const stored = localStorage.getItem(OFFLINE_ARTICLES_KEY);
  if (!stored) return null;
  
  try {
    const allArticles: Record<string, OfflineArticle> = JSON.parse(stored);
    return allArticles[id] || null;
  } catch {
    return null;
  }
};

export const isArticleOffline = (id: string): boolean => {
  return getOfflineArticle(id) !== null;
};

export const removeOfflineArticle = (id: string) => {
  const stored = localStorage.getItem(OFFLINE_ARTICLES_KEY);
  if (!stored) return;
  
  try {
    const allArticles: Record<string, OfflineArticle> = JSON.parse(stored);
    delete allArticles[id];
    localStorage.setItem(OFFLINE_ARTICLES_KEY, JSON.stringify(allArticles));
  } catch {
    // Handle error silently
  }
};

export const getAllOfflineArticles = (): Record<string, OfflineArticle> => {
  const stored = localStorage.getItem(OFFLINE_ARTICLES_KEY);
  if (!stored) return {};
  
  try {
    return JSON.parse(stored);
  } catch {
    return {};
  }
};

export const clearAllOfflineArticles = () => {
  localStorage.removeItem(OFFLINE_ARTICLES_KEY);
};
