const NOTES_KEY = 'article-notes';

export interface ArticleNote {
  id: string;
  articleId: string;
  selectedText: string;
  note: string;
  position: number; // paragraph index
  timestamp: number;
  color: string;
}

export const saveArticleNote = (note: ArticleNote) => {
  const stored = localStorage.getItem(NOTES_KEY);
  let allNotes: ArticleNote[] = [];
  
  try {
    allNotes = stored ? JSON.parse(stored) : [];
  } catch {
    allNotes = [];
  }
  
  allNotes.push(note);
  localStorage.setItem(NOTES_KEY, JSON.stringify(allNotes));
};

export const getArticleNotes = (articleId: string): ArticleNote[] => {
  const stored = localStorage.getItem(NOTES_KEY);
  if (!stored) return [];
  
  try {
    const allNotes: ArticleNote[] = JSON.parse(stored);
    return allNotes.filter(note => note.articleId === articleId);
  } catch {
    return [];
  }
};

export const deleteArticleNote = (noteId: string) => {
  const stored = localStorage.getItem(NOTES_KEY);
  if (!stored) return;
  
  try {
    const allNotes: ArticleNote[] = JSON.parse(stored);
    const filtered = allNotes.filter(note => note.id !== noteId);
    localStorage.setItem(NOTES_KEY, JSON.stringify(filtered));
  } catch {
    // Handle error silently
  }
};

export const getAllNotes = (): ArticleNote[] => {
  const stored = localStorage.getItem(NOTES_KEY);
  if (!stored) return [];
  
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
};
