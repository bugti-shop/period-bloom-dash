import { saveToLocalStorage, loadFromLocalStorage } from "./storage";

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

export interface ChecklistCategory {
  id: string;
  title: string;
  icon?: string;
  items: ChecklistItem[];
}

export interface Checklist {
  id: string;
  title: string;
  image: string;
  bgColor: string;
  icon?: string;
  order: number;
  isCustom: boolean;
  items: ChecklistItem[];
  categories?: ChecklistCategory[];
}

const STORAGE_KEY = "checklists_data";

const defaultChecklists: Checklist[] = [
  {
    id: "todo",
    title: "To Do",
    image: "/src/assets/checklist-todo.png",
    bgColor: "#f5e6d3",
    order: 0,
    isCustom: false,
    items: [],
  },
  {
    id: "shopping",
    title: "Shopping list",
    image: "/src/assets/checklist-shopping.png",
    bgColor: "#fdd5d5",
    order: 1,
    isCustom: false,
    items: [],
    categories: [
      { id: "my-list", title: "My List", icon: "📝", items: [] },
      { id: "wardrobe", title: "Wardrobe", icon: "👶", items: [] },
      { id: "nursing", title: "Nursing", icon: "🍼", items: [] },
      { id: "hygiene", title: "Hygiene", icon: "🧼", items: [] },
      { id: "household", title: "Household", icon: "🛏️", items: [] },
      { id: "toys", title: "Toys", icon: "🪀", items: [] },
      { id: "walks", title: "Walks", icon: "🚼", items: [] },
      { id: "sleep", title: "Everything for sleep", icon: "🛌", items: [] },
      { id: "equipment", title: "Equipment", icon: "📱", items: [] },
      { id: "swimming", title: "Swimming", icon: "🦆", items: [] },
      { id: "first-aid", title: "First Aid Kit", icon: "🩹", items: [] },
    ],
  },
  {
    id: "hospital-bag",
    title: "Hospital Bag",
    image: "/src/assets/checklist-hospital-bag.png",
    bgColor: "#d4e8f7",
    order: 2,
    isCustom: false,
    items: [],
    categories: [
      { id: "for-mother", title: "For mother", icon: "👩", items: [] },
      { id: "for-partner", title: "For partner", icon: "👨", items: [] },
      { id: "for-child", title: "For a child", icon: "👶", items: [] },
    ],
  },
  {
    id: "birth-plan",
    title: "Birth plan",
    image: "/src/assets/checklist-birth-plan.png",
    bgColor: "#e8d5f0",
    order: 3,
    isCustom: false,
    items: [],
    categories: [
      { id: "my-birth-plan", title: "My birth plan", icon: "📋", items: [] },
      { id: "atmosphere", title: "Atmosphere", icon: "🏥", items: [] },
      { id: "partners", title: "Partners", icon: "👫", items: [] },
      { id: "photo-video", title: "Photo and video", icon: "📷", items: [] },
      { id: "stimulation", title: "Stimulation of labour", icon: "💊", items: [] },
      { id: "anesthesia", title: "Anesthesia", icon: "💉", items: [] },
      { id: "tearing", title: "Tearing", icon: "🩹", items: [] },
      { id: "during-childbirth", title: "During childbirth", icon: "⏰", items: [] },
      { id: "cesarean", title: "Cesarean section", icon: "🏥", items: [] },
      { id: "childbirth", title: "Childbirth", icon: "🎉", items: [] },
      { id: "after-childbirth", title: "After childbirth", icon: "💕", items: [] },
      { id: "feeding", title: "Feeding", icon: "🍼", items: [] },
      { id: "other", title: "Other", icon: "📝", items: [] },
    ],
  },
  {
    id: "notes",
    title: "Notes",
    image: "/src/assets/checklist-notes.png",
    bgColor: "#d5f0e3",
    order: 4,
    isCustom: false,
    items: [],
  },
  {
    id: "names",
    title: "Names",
    image: "/src/assets/checklist-names.png",
    bgColor: "#d4e8f7",
    order: 5,
    isCustom: false,
    items: [],
  },
];

export const loadChecklists = (): Checklist[] => {
  const stored = loadFromLocalStorage<Checklist[]>(STORAGE_KEY);
  if (!stored) {
    saveToLocalStorage(STORAGE_KEY, defaultChecklists);
    return defaultChecklists;
  }
  return stored.sort((a, b) => a.order - b.order);
};

export const saveChecklists = (checklists: Checklist[]): void => {
  saveToLocalStorage(STORAGE_KEY, checklists);
};

export const updateChecklistColor = (id: string, bgColor: string): void => {
  const checklists = loadChecklists();
  const updated = checklists.map((c) =>
    c.id === id ? { ...c, bgColor } : c
  );
  saveChecklists(updated);
};

export const reorderChecklists = (newOrder: Checklist[]): void => {
  const updated = newOrder.map((c, index) => ({ ...c, order: index }));
  saveChecklists(updated);
};

export const createCustomChecklist = (
  title: string,
  bgColor: string,
  icon?: string
): void => {
  const checklists = loadChecklists();
  const newChecklist: Checklist = {
    id: `custom-${Date.now()}`,
    title,
    image: "",
    bgColor,
    icon,
    order: checklists.length,
    isCustom: true,
    items: [],
  };
  saveChecklists([...checklists, newChecklist]);
};

export const deleteChecklist = (id: string): void => {
  const checklists = loadChecklists();
  const filtered = checklists.filter((c) => c.id !== id);
  saveChecklists(filtered);
};

export const addChecklistItem = (checklistId: string, text: string): void => {
  const checklists = loadChecklists();
  const updated = checklists.map((c) => {
    if (c.id === checklistId) {
      return {
        ...c,
        items: [
          ...c.items,
          {
            id: `item-${Date.now()}`,
            text,
            completed: false,
            createdAt: new Date().toISOString(),
          },
        ],
      };
    }
    return c;
  });
  saveChecklists(updated);
};

export const toggleChecklistItem = (
  checklistId: string,
  itemId: string
): void => {
  const checklists = loadChecklists();
  const updated = checklists.map((c) => {
    if (c.id === checklistId) {
      return {
        ...c,
        items: c.items.map((item) =>
          item.id === itemId ? { ...item, completed: !item.completed } : item
        ),
      };
    }
    return c;
  });
  saveChecklists(updated);
};

export const deleteChecklistItem = (
  checklistId: string,
  itemId: string
): void => {
  const checklists = loadChecklists();
  const updated = checklists.map((c) => {
    if (c.id === checklistId) {
      return {
        ...c,
        items: c.items.filter((item) => item.id !== itemId),
      };
    }
    return c;
  });
  saveChecklists(updated);
};

export const editChecklistItem = (
  checklistId: string,
  itemId: string,
  newText: string
): void => {
  const checklists = loadChecklists();
  const updated = checklists.map((c) => {
    if (c.id === checklistId) {
      return {
        ...c,
        items: c.items.map((item) =>
          item.id === itemId ? { ...item, text: newText } : item
        ),
      };
    }
    return c;
  });
  saveChecklists(updated);
};
