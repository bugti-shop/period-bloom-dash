const BOOKMARKS_KEY = 'article-bookmarks';

export interface Bookmark {
  articleId: string;
  timestamp: number;
}

export const getBookmarks = (): string[] => {
  const stored = localStorage.getItem(BOOKMARKS_KEY);
  if (!stored) return [];
  
  try {
    const bookmarks: Bookmark[] = JSON.parse(stored);
    return bookmarks.map(b => b.articleId);
  } catch {
    return [];
  }
};

export const isBookmarked = (articleId: string): boolean => {
  const bookmarks = getBookmarks();
  return bookmarks.includes(articleId);
};

export const toggleBookmark = (articleId: string): boolean => {
  const bookmarks = getBookmarks();
  const stored = localStorage.getItem(BOOKMARKS_KEY);
  let bookmarkData: Bookmark[] = [];
  
  try {
    bookmarkData = stored ? JSON.parse(stored) : [];
  } catch {
    bookmarkData = [];
  }
  
  const index = bookmarks.indexOf(articleId);
  
  if (index > -1) {
    // Remove bookmark
    bookmarkData = bookmarkData.filter(b => b.articleId !== articleId);
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarkData));
    return false;
  } else {
    // Add bookmark
    bookmarkData.push({
      articleId,
      timestamp: Date.now()
    });
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarkData));
    return true;
  }
};
