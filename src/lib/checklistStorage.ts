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
    items: [
      { id: "todo-1", text: "Schedule first prenatal appointment", completed: false, createdAt: new Date().toISOString() },
      { id: "todo-2", text: "Start taking prenatal vitamins", completed: false, createdAt: new Date().toISOString() },
      { id: "todo-3", text: "Research healthcare providers and hospitals", completed: false, createdAt: new Date().toISOString() },
      { id: "todo-4", text: "Update health insurance information", completed: false, createdAt: new Date().toISOString() },
      { id: "todo-5", text: "Plan pregnancy announcement", completed: false, createdAt: new Date().toISOString() },
      { id: "todo-6", text: "Start pregnancy journal or diary", completed: false, createdAt: new Date().toISOString() },
      { id: "todo-7", text: "Take bump photos weekly", completed: false, createdAt: new Date().toISOString() },
      { id: "todo-8", text: "Schedule prenatal screening tests", completed: false, createdAt: new Date().toISOString() },
      { id: "todo-9", text: "Research childbirth classes", completed: false, createdAt: new Date().toISOString() },
      { id: "todo-10", text: "Plan nursery layout and theme", completed: false, createdAt: new Date().toISOString() },
      { id: "todo-11", text: "Register for baby shower", completed: false, createdAt: new Date().toISOString() },
      { id: "todo-12", text: "Create baby registry", completed: false, createdAt: new Date().toISOString() },
      { id: "todo-13", text: "Interview pediatricians", completed: false, createdAt: new Date().toISOString() },
      { id: "todo-14", text: "Tour hospital or birthing center", completed: false, createdAt: new Date().toISOString() },
      { id: "todo-15", text: "Attend prenatal classes", completed: false, createdAt: new Date().toISOString() },
      { id: "todo-16", text: "Prepare birth plan", completed: false, createdAt: new Date().toISOString() },
      { id: "todo-17", text: "Pack hospital bag (36 weeks)", completed: false, createdAt: new Date().toISOString() },
      { id: "todo-18", text: "Install car seat", completed: false, createdAt: new Date().toISOString() },
      { id: "todo-19", text: "Prep and freeze meals", completed: false, createdAt: new Date().toISOString() },
      { id: "todo-20", text: "Wash baby clothes and bedding", completed: false, createdAt: new Date().toISOString() },
      { id: "todo-21", text: "Set up nursery furniture", completed: false, createdAt: new Date().toISOString() },
      { id: "todo-22", text: "Take maternity photos", completed: false, createdAt: new Date().toISOString() },
      { id: "todo-23", text: "Apply for maternity/paternity leave", completed: false, createdAt: new Date().toISOString() },
      { id: "todo-24", text: "Plan for pet care during labor", completed: false, createdAt: new Date().toISOString() },
      { id: "todo-25", text: "Stock up on postpartum essentials", completed: false, createdAt: new Date().toISOString() },
      { id: "todo-26", text: "Pre-register at hospital", completed: false, createdAt: new Date().toISOString() },
      { id: "todo-27", text: "Plan route to hospital and backup", completed: false, createdAt: new Date().toISOString() },
      { id: "todo-28", text: "Prepare sibling(s) for new baby", completed: false, createdAt: new Date().toISOString() },
      { id: "todo-29", text: "Review hospital policies and procedures", completed: false, createdAt: new Date().toISOString() },
      { id: "todo-30", text: "Confirm birth partner availability", completed: false, createdAt: new Date().toISOString() },
    ],
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
      { 
        id: "wardrobe", 
        title: "Wardrobe", 
        icon: "👶", 
        items: [
          { id: "ward-1", text: "Onesies (5-7 pieces)", completed: false, createdAt: new Date().toISOString() },
          { id: "ward-2", text: "Sleepers/Pajamas (3-5 pieces)", completed: false, createdAt: new Date().toISOString() },
          { id: "ward-3", text: "Bodysuits (5-7 pieces)", completed: false, createdAt: new Date().toISOString() },
          { id: "ward-4", text: "Pants (3-5 pairs)", completed: false, createdAt: new Date().toISOString() },
          { id: "ward-5", text: "Socks (5-7 pairs)", completed: false, createdAt: new Date().toISOString() },
          { id: "ward-6", text: "Mittens (2-3 pairs)", completed: false, createdAt: new Date().toISOString() },
          { id: "ward-7", text: "Hats/Caps (2-3 pieces)", completed: false, createdAt: new Date().toISOString() },
          { id: "ward-8", text: "Sweaters/Cardigans (2-3 pieces)", completed: false, createdAt: new Date().toISOString() },
          { id: "ward-9", text: "Going home outfit", completed: false, createdAt: new Date().toISOString() },
          { id: "ward-10", text: "Blanket sleepers", completed: false, createdAt: new Date().toISOString() },
        ]
      },
      { 
        id: "nursing", 
        title: "Nursing", 
        icon: "🍼", 
        items: [
          { id: "nurs-1", text: "Bottles (4-6 pieces)", completed: false, createdAt: new Date().toISOString() },
          { id: "nurs-2", text: "Bottle nipples (various flows)", completed: false, createdAt: new Date().toISOString() },
          { id: "nurs-3", text: "Bottle brush", completed: false, createdAt: new Date().toISOString() },
          { id: "nurs-4", text: "Bottle sterilizer", completed: false, createdAt: new Date().toISOString() },
          { id: "nurs-5", text: "Breast pump", completed: false, createdAt: new Date().toISOString() },
          { id: "nurs-6", text: "Nursing pads", completed: false, createdAt: new Date().toISOString() },
          { id: "nurs-7", text: "Nursing pillow", completed: false, createdAt: new Date().toISOString() },
          { id: "nurs-8", text: "Burp cloths (5-7 pieces)", completed: false, createdAt: new Date().toISOString() },
          { id: "nurs-9", text: "Bibs (5-7 pieces)", completed: false, createdAt: new Date().toISOString() },
          { id: "nurs-10", text: "Formula (if needed)", completed: false, createdAt: new Date().toISOString() },
        ]
      },
      { 
        id: "hygiene", 
        title: "Hygiene", 
        icon: "🧼", 
        items: [
          { id: "hyg-1", text: "Diapers (newborn and size 1)", completed: false, createdAt: new Date().toISOString() },
          { id: "hyg-2", text: "Baby wipes", completed: false, createdAt: new Date().toISOString() },
          { id: "hyg-3", text: "Diaper cream", completed: false, createdAt: new Date().toISOString() },
          { id: "hyg-4", text: "Baby wash/Shampoo", completed: false, createdAt: new Date().toISOString() },
          { id: "hyg-5", text: "Baby lotion", completed: false, createdAt: new Date().toISOString() },
          { id: "hyg-6", text: "Baby powder/cornstarch", completed: false, createdAt: new Date().toISOString() },
          { id: "hyg-7", text: "Cotton balls", completed: false, createdAt: new Date().toISOString() },
          { id: "hyg-8", text: "Nail clippers/scissors", completed: false, createdAt: new Date().toISOString() },
          { id: "hyg-9", text: "Soft hairbrush", completed: false, createdAt: new Date().toISOString() },
          { id: "hyg-10", text: "Baby bathtub", completed: false, createdAt: new Date().toISOString() },
          { id: "hyg-11", text: "Hooded towels (2-3 pieces)", completed: false, createdAt: new Date().toISOString() },
          { id: "hyg-12", text: "Washcloths (5-7 pieces)", completed: false, createdAt: new Date().toISOString() },
        ]
      },
      { 
        id: "household", 
        title: "Household", 
        icon: "🛏️", 
        items: [
          { id: "house-1", text: "Crib or bassinet", completed: false, createdAt: new Date().toISOString() },
          { id: "house-2", text: "Crib mattress", completed: false, createdAt: new Date().toISOString() },
          { id: "house-3", text: "Crib sheets (3-4 pieces)", completed: false, createdAt: new Date().toISOString() },
          { id: "house-4", text: "Changing table or pad", completed: false, createdAt: new Date().toISOString() },
          { id: "house-5", text: "Diaper pail", completed: false, createdAt: new Date().toISOString() },
          { id: "house-6", text: "Baby laundry detergent", completed: false, createdAt: new Date().toISOString() },
          { id: "house-7", text: "Night light", completed: false, createdAt: new Date().toISOString() },
          { id: "house-8", text: "Baby monitor", completed: false, createdAt: new Date().toISOString() },
          { id: "house-9", text: "Rocking chair/Glider", completed: false, createdAt: new Date().toISOString() },
          { id: "house-10", text: "Dresser/Storage organizer", completed: false, createdAt: new Date().toISOString() },
        ]
      },
      { 
        id: "toys", 
        title: "Toys", 
        icon: "🪀", 
        items: [
          { id: "toy-1", text: "Soft plush toys", completed: false, createdAt: new Date().toISOString() },
          { id: "toy-2", text: "Rattles", completed: false, createdAt: new Date().toISOString() },
          { id: "toy-3", text: "Teething toys", completed: false, createdAt: new Date().toISOString() },
          { id: "toy-4", text: "Activity gym/Play mat", completed: false, createdAt: new Date().toISOString() },
          { id: "toy-5", text: "Musical mobile", completed: false, createdAt: new Date().toISOString() },
          { id: "toy-6", text: "Board books", completed: false, createdAt: new Date().toISOString() },
          { id: "toy-7", text: "Black and white contrast cards", completed: false, createdAt: new Date().toISOString() },
        ]
      },
      { 
        id: "walks", 
        title: "Walks", 
        icon: "🚼", 
        items: [
          { id: "walk-1", text: "Stroller", completed: false, createdAt: new Date().toISOString() },
          { id: "walk-2", text: "Car seat", completed: false, createdAt: new Date().toISOString() },
          { id: "walk-3", text: "Baby carrier/wrap", completed: false, createdAt: new Date().toISOString() },
          { id: "walk-4", text: "Stroller rain cover", completed: false, createdAt: new Date().toISOString() },
          { id: "walk-5", text: "Sun shade for stroller", completed: false, createdAt: new Date().toISOString() },
          { id: "walk-6", text: "Diaper bag", completed: false, createdAt: new Date().toISOString() },
          { id: "walk-7", text: "Portable changing pad", completed: false, createdAt: new Date().toISOString() },
        ]
      },
      { 
        id: "sleep", 
        title: "Everything for sleep", 
        icon: "🛌", 
        items: [
          { id: "sleep-1", text: "Swaddle blankets (3-5 pieces)", completed: false, createdAt: new Date().toISOString() },
          { id: "sleep-2", text: "Sleep sacks", completed: false, createdAt: new Date().toISOString() },
          { id: "sleep-3", text: "White noise machine", completed: false, createdAt: new Date().toISOString() },
          { id: "sleep-4", text: "Blackout curtains", completed: false, createdAt: new Date().toISOString() },
          { id: "sleep-5", text: "Pacifiers (2-3 pieces)", completed: false, createdAt: new Date().toISOString() },
          { id: "sleep-6", text: "Receiving blankets", completed: false, createdAt: new Date().toISOString() },
        ]
      },
      { 
        id: "equipment", 
        title: "Equipment", 
        icon: "📱", 
        items: [
          { id: "equip-1", text: "Baby thermometer", completed: false, createdAt: new Date().toISOString() },
          { id: "equip-2", text: "Nasal aspirator", completed: false, createdAt: new Date().toISOString() },
          { id: "equip-3", text: "Humidifier", completed: false, createdAt: new Date().toISOString() },
          { id: "equip-4", text: "Baby swing/bouncer", completed: false, createdAt: new Date().toISOString() },
          { id: "equip-5", text: "High chair", completed: false, createdAt: new Date().toISOString() },
          { id: "equip-6", text: "Play yard/Pack 'n Play", completed: false, createdAt: new Date().toISOString() },
        ]
      },
      { 
        id: "swimming", 
        title: "Swimming", 
        icon: "🦆", 
        items: [
          { id: "swim-1", text: "Baby bath thermometer", completed: false, createdAt: new Date().toISOString() },
          { id: "swim-2", text: "Bath toys", completed: false, createdAt: new Date().toISOString() },
          { id: "swim-3", text: "Bath seat/support", completed: false, createdAt: new Date().toISOString() },
          { id: "swim-4", text: "Non-slip bath mat", completed: false, createdAt: new Date().toISOString() },
        ]
      },
      { 
        id: "first-aid", 
        title: "First Aid Kit", 
        icon: "🩹", 
        items: [
          { id: "aid-1", text: "Infant pain reliever", completed: false, createdAt: new Date().toISOString() },
          { id: "aid-2", text: "Saline drops", completed: false, createdAt: new Date().toISOString() },
          { id: "aid-3", text: "Gas relief drops", completed: false, createdAt: new Date().toISOString() },
          { id: "aid-4", text: "Petroleum jelly", completed: false, createdAt: new Date().toISOString() },
          { id: "aid-5", text: "Baby-safe sunscreen", completed: false, createdAt: new Date().toISOString() },
          { id: "aid-6", text: "Infant nail file", completed: false, createdAt: new Date().toISOString() },
        ]
      },
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
      { 
        id: "for-mother", 
        title: "For mother", 
        icon: "👩", 
        items: [
          { id: "mom-1", text: "Comfortable pajamas or nightgown", completed: false, createdAt: new Date().toISOString() },
          { id: "mom-2", text: "Nursing bra (2-3 pieces)", completed: false, createdAt: new Date().toISOString() },
          { id: "mom-3", text: "Maternity pads", completed: false, createdAt: new Date().toISOString() },
          { id: "mom-4", text: "Underwear (disposable or old)", completed: false, createdAt: new Date().toISOString() },
          { id: "mom-5", text: "Robe and slippers", completed: false, createdAt: new Date().toISOString() },
          { id: "mom-6", text: "Toiletries (toothbrush, shampoo, etc.)", completed: false, createdAt: new Date().toISOString() },
          { id: "mom-7", text: "Hair ties", completed: false, createdAt: new Date().toISOString() },
          { id: "mom-8", text: "Going home outfit", completed: false, createdAt: new Date().toISOString() },
          { id: "mom-9", text: "Nipple cream", completed: false, createdAt: new Date().toISOString() },
          { id: "mom-10", text: "Breast pads", completed: false, createdAt: new Date().toISOString() },
          { id: "mom-11", text: "Glasses/contacts (if needed)", completed: false, createdAt: new Date().toISOString() },
          { id: "mom-12", text: "Phone charger", completed: false, createdAt: new Date().toISOString() },
          { id: "mom-13", text: "Snacks and drinks", completed: false, createdAt: new Date().toISOString() },
          { id: "mom-14", text: "Insurance cards and ID", completed: false, createdAt: new Date().toISOString() },
          { id: "mom-15", text: "Birth plan (copies)", completed: false, createdAt: new Date().toISOString() },
          { id: "mom-16", text: "Pillow from home", completed: false, createdAt: new Date().toISOString() },
          { id: "mom-17", text: "Entertainment (books, tablet)", completed: false, createdAt: new Date().toISOString() },
          { id: "mom-18", text: "Camera", completed: false, createdAt: new Date().toISOString() },
          { id: "mom-19", text: "Lip balm", completed: false, createdAt: new Date().toISOString() },
          { id: "mom-20", text: "Facial wipes", completed: false, createdAt: new Date().toISOString() },
        ]
      },
      { 
        id: "for-partner", 
        title: "For partner", 
        icon: "👨", 
        items: [
          { id: "partner-1", text: "Comfortable clothes", completed: false, createdAt: new Date().toISOString() },
          { id: "partner-2", text: "Snacks and drinks", completed: false, createdAt: new Date().toISOString() },
          { id: "partner-3", text: "Phone charger", completed: false, createdAt: new Date().toISOString() },
          { id: "partner-4", text: "Toiletries", completed: false, createdAt: new Date().toISOString() },
          { id: "partner-5", text: "Change of clothes", completed: false, createdAt: new Date().toISOString() },
          { id: "partner-6", text: "Camera/video camera", completed: false, createdAt: new Date().toISOString() },
          { id: "partner-7", text: "Entertainment", completed: false, createdAt: new Date().toISOString() },
          { id: "partner-8", text: "Pillow and blanket", completed: false, createdAt: new Date().toISOString() },
          { id: "partner-9", text: "List of important contacts", completed: false, createdAt: new Date().toISOString() },
          { id: "partner-10", text: "Cash for parking/vending", completed: false, createdAt: new Date().toISOString() },
        ]
      },
      { 
        id: "for-child", 
        title: "For a child", 
        icon: "👶", 
        items: [
          { id: "baby-1", text: "Going home outfit (newborn & 0-3 months)", completed: false, createdAt: new Date().toISOString() },
          { id: "baby-2", text: "Onesies (3-5 pieces)", completed: false, createdAt: new Date().toISOString() },
          { id: "baby-3", text: "Sleepers (2-3 pieces)", completed: false, createdAt: new Date().toISOString() },
          { id: "baby-4", text: "Socks (3-5 pairs)", completed: false, createdAt: new Date().toISOString() },
          { id: "baby-5", text: "Mittens (2 pairs)", completed: false, createdAt: new Date().toISOString() },
          { id: "baby-6", text: "Hat", completed: false, createdAt: new Date().toISOString() },
          { id: "baby-7", text: "Swaddle blankets (2-3)", completed: false, createdAt: new Date().toISOString() },
          { id: "baby-8", text: "Receiving blankets", completed: false, createdAt: new Date().toISOString() },
          { id: "baby-9", text: "Diapers (newborn)", completed: false, createdAt: new Date().toISOString() },
          { id: "baby-10", text: "Baby wipes", completed: false, createdAt: new Date().toISOString() },
          { id: "baby-11", text: "Diaper cream", completed: false, createdAt: new Date().toISOString() },
          { id: "baby-12", text: "Pacifiers", completed: false, createdAt: new Date().toISOString() },
          { id: "baby-13", text: "Bottles (if not breastfeeding)", completed: false, createdAt: new Date().toISOString() },
          { id: "baby-14", text: "Formula (if needed)", completed: false, createdAt: new Date().toISOString() },
          { id: "baby-15", text: "Car seat (installed)", completed: false, createdAt: new Date().toISOString() },
        ]
      },
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
      { 
        id: "my-birth-plan", 
        title: "My birth plan", 
        icon: "📋", 
        items: [
          { id: "plan-1", text: "Natural birth preferred", completed: false, createdAt: new Date().toISOString() },
          { id: "plan-2", text: "Open to medical interventions if necessary", completed: false, createdAt: new Date().toISOString() },
          { id: "plan-3", text: "Prefer minimal interventions", completed: false, createdAt: new Date().toISOString() },
        ]
      },
      { 
        id: "atmosphere", 
        title: "Atmosphere", 
        icon: "🏥", 
        items: [
          { id: "atmos-1", text: "Dim lighting preferred", completed: false, createdAt: new Date().toISOString() },
          { id: "atmos-2", text: "Play my music/playlist", completed: false, createdAt: new Date().toISOString() },
          { id: "atmos-3", text: "Quiet environment", completed: false, createdAt: new Date().toISOString() },
          { id: "atmos-4", text: "Aromatherapy allowed", completed: false, createdAt: new Date().toISOString() },
          { id: "atmos-5", text: "Use of birthing ball", completed: false, createdAt: new Date().toISOString() },
        ]
      },
      { 
        id: "partners", 
        title: "Partners", 
        icon: "👫", 
        items: [
          { id: "part-1", text: "Partner present during labor", completed: false, createdAt: new Date().toISOString() },
          { id: "part-2", text: "Partner to cut umbilical cord", completed: false, createdAt: new Date().toISOString() },
          { id: "part-3", text: "Doula present", completed: false, createdAt: new Date().toISOString() },
          { id: "part-4", text: "Additional support person allowed", completed: false, createdAt: new Date().toISOString() },
        ]
      },
      { 
        id: "photo-video", 
        title: "Photo and video", 
        icon: "📷", 
        items: [
          { id: "photo-1", text: "Photos allowed during labor", completed: false, createdAt: new Date().toISOString() },
          { id: "photo-2", text: "Video recording allowed", completed: false, createdAt: new Date().toISOString() },
          { id: "photo-3", text: "Photos of baby immediately after birth", completed: false, createdAt: new Date().toISOString() },
          { id: "photo-4", text: "No photos/videos preferred", completed: false, createdAt: new Date().toISOString() },
        ]
      },
      { 
        id: "stimulation", 
        title: "Stimulation of labour", 
        icon: "💊", 
        items: [
          { id: "stim-1", text: "Natural onset preferred", completed: false, createdAt: new Date().toISOString() },
          { id: "stim-2", text: "Open to induction if medically necessary", completed: false, createdAt: new Date().toISOString() },
          { id: "stim-3", text: "Prefer to avoid artificial rupture of membranes", completed: false, createdAt: new Date().toISOString() },
          { id: "stim-4", text: "Discuss alternatives before Pitocin", completed: false, createdAt: new Date().toISOString() },
        ]
      },
      { 
        id: "anesthesia", 
        title: "Anesthesia", 
        icon: "💉", 
        items: [
          { id: "anes-1", text: "Natural pain management preferred", completed: false, createdAt: new Date().toISOString() },
          { id: "anes-2", text: "Epidural available if requested", completed: false, createdAt: new Date().toISOString() },
          { id: "anes-3", text: "Try alternatives first (breathing, water, massage)", completed: false, createdAt: new Date().toISOString() },
          { id: "anes-4", text: "Request epidural early", completed: false, createdAt: new Date().toISOString() },
          { id: "anes-5", text: "Discuss all pain relief options", completed: false, createdAt: new Date().toISOString() },
        ]
      },
      { 
        id: "tearing", 
        title: "Tearing", 
        icon: "🩹", 
        items: [
          { id: "tear-1", text: "Perineal massage during labor", completed: false, createdAt: new Date().toISOString() },
          { id: "tear-2", text: "Warm compresses", completed: false, createdAt: new Date().toISOString() },
          { id: "tear-3", text: "Avoid episiotomy unless absolutely necessary", completed: false, createdAt: new Date().toISOString() },
          { id: "tear-4", text: "Controlled pushing to minimize tearing", completed: false, createdAt: new Date().toISOString() },
        ]
      },
      { 
        id: "during-childbirth", 
        title: "During childbirth", 
        icon: "⏰", 
        items: [
          { id: "during-1", text: "Freedom to move and change positions", completed: false, createdAt: new Date().toISOString() },
          { id: "during-2", text: "Prefer upright positions for pushing", completed: false, createdAt: new Date().toISOString() },
          { id: "during-3", text: "Water birth if available", completed: false, createdAt: new Date().toISOString() },
          { id: "during-4", text: "Intermittent fetal monitoring", completed: false, createdAt: new Date().toISOString() },
          { id: "during-5", text: "Minimal cervical checks", completed: false, createdAt: new Date().toISOString() },
          { id: "during-6", text: "Eat and drink as desired during labor", completed: false, createdAt: new Date().toISOString() },
        ]
      },
      { 
        id: "cesarean", 
        title: "Cesarean section", 
        icon: "🏥", 
        items: [
          { id: "cesar-1", text: "Partner present during C-section if possible", completed: false, createdAt: new Date().toISOString() },
          { id: "cesar-2", text: "Clear drape to see baby being born", completed: false, createdAt: new Date().toISOString() },
          { id: "cesar-3", text: "Skin-to-skin immediately after if possible", completed: false, createdAt: new Date().toISOString() },
          { id: "cesar-4", text: "Gentle cesarean techniques preferred", completed: false, createdAt: new Date().toISOString() },
          { id: "cesar-5", text: "Discuss reasons if C-section becomes necessary", completed: false, createdAt: new Date().toISOString() },
        ]
      },
      { 
        id: "childbirth", 
        title: "Childbirth", 
        icon: "🎉", 
        items: [
          { id: "birth-1", text: "Immediate skin-to-skin contact", completed: false, createdAt: new Date().toISOString() },
          { id: "birth-2", text: "Delayed cord clamping (1-3 minutes)", completed: false, createdAt: new Date().toISOString() },
          { id: "birth-3", text: "Baby placed on chest immediately", completed: false, createdAt: new Date().toISOString() },
          { id: "birth-4", text: "Partner announces baby's gender", completed: false, createdAt: new Date().toISOString() },
          { id: "birth-5", text: "Collect cord blood", completed: false, createdAt: new Date().toISOString() },
        ]
      },
      { 
        id: "after-childbirth", 
        title: "After childbirth", 
        icon: "💕", 
        items: [
          { id: "after-1", text: "Golden hour with baby undisturbed", completed: false, createdAt: new Date().toISOString() },
          { id: "after-2", text: "Delay non-urgent procedures", completed: false, createdAt: new Date().toISOString() },
          { id: "after-3", text: "Vitamin K shot for baby", completed: false, createdAt: new Date().toISOString() },
          { id: "after-4", text: "Eye ointment for baby", completed: false, createdAt: new Date().toISOString() },
          { id: "after-5", text: "Hepatitis B vaccine", completed: false, createdAt: new Date().toISOString() },
          { id: "after-6", text: "Rooming-in with baby at all times", completed: false, createdAt: new Date().toISOString() },
        ]
      },
      { 
        id: "feeding", 
        title: "Feeding", 
        icon: "🍼", 
        items: [
          { id: "feed-1", text: "Breastfeeding immediately after birth", completed: false, createdAt: new Date().toISOString() },
          { id: "feed-2", text: "Lactation consultant support", completed: false, createdAt: new Date().toISOString() },
          { id: "feed-3", text: "No pacifiers or artificial nipples", completed: false, createdAt: new Date().toISOString() },
          { id: "feed-4", text: "No formula unless medically necessary", completed: false, createdAt: new Date().toISOString() },
          { id: "feed-5", text: "Formula feeding preferred", completed: false, createdAt: new Date().toISOString() },
          { id: "feed-6", text: "Combination feeding (breast and bottle)", completed: false, createdAt: new Date().toISOString() },
        ]
      },
      { 
        id: "other", 
        title: "Other", 
        icon: "📝", 
        items: [
          { id: "other-1", text: "Minimize visitors immediately after birth", completed: false, createdAt: new Date().toISOString() },
          { id: "other-2", text: "Private recovery room if available", completed: false, createdAt: new Date().toISOString() },
          { id: "other-3", text: "Discuss newborn procedures before performing", completed: false, createdAt: new Date().toISOString() },
          { id: "other-4", text: "Cultural/religious practices to be respected", completed: false, createdAt: new Date().toISOString() },
          { id: "other-5", text: "Keep medical team informed of preferences", completed: false, createdAt: new Date().toISOString() },
        ]
      },
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

const shouldUpdateWithDefaults = (stored: Checklist[]): boolean => {
  // Check if any default checklist needs updating (has categories/items but stored version doesn't)
  return stored.some(storedList => {
    const defaultList = defaultChecklists.find(d => d.id === storedList.id);
    if (!defaultList) return false;
    
    // If default has categories but stored doesn't, or stored categories are empty
    if (defaultList.categories && defaultList.categories.length > 0) {
      if (!storedList.categories || storedList.categories.length === 0) return true;
      // Check if categories exist but have no items
      const hasEmptyCategories = storedList.categories.every(cat => cat.items.length === 0);
      if (hasEmptyCategories) return true;
    }
    
    // If default has items but stored doesn't
    if (defaultList.items && defaultList.items.length > 0 && storedList.items.length === 0) {
      return true;
    }
    
    return false;
  });
};

export const loadChecklists = (): Checklist[] => {
  const stored = loadFromLocalStorage<Checklist[]>(STORAGE_KEY);
  if (!stored) {
    saveToLocalStorage(STORAGE_KEY, defaultChecklists);
    return defaultChecklists;
  }
  
  // Check if we need to update with default content
  if (shouldUpdateWithDefaults(stored)) {
    const updated = stored.map(storedList => {
      const defaultList = defaultChecklists.find(d => d.id === storedList.id);
      if (!defaultList) return storedList;
      
      // Update with default categories and items if stored version is empty
      const needsCategoryUpdate = defaultList.categories && 
        (!storedList.categories || storedList.categories.every(cat => cat.items.length === 0));
      const needsItemsUpdate = defaultList.items && defaultList.items.length > 0 && storedList.items.length === 0;
      
      return {
        ...storedList,
        categories: needsCategoryUpdate ? defaultList.categories : storedList.categories,
        items: needsItemsUpdate ? defaultList.items : storedList.items,
      };
    });
    
    saveToLocalStorage(STORAGE_KEY, updated);
    return updated.sort((a, b) => a.order - b.order);
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
        // Toggle in top-level items (for simple checklists)
        items: c.items.map((item) =>
          item.id === itemId ? { ...item, completed: !item.completed } : item
        ),
        // Also toggle inside categories, if present
        categories: c.categories
          ? c.categories.map((cat) => ({
              ...cat,
              items: cat.items.map((item) =>
                item.id === itemId
                  ? { ...item, completed: !item.completed }
                  : item
              ),
            }))
          : c.categories,
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

export const markAllCategoryItemsComplete = (
  checklistId: string,
  categoryId: string
): void => {
  const checklists = loadChecklists();
  const updated = checklists.map((c) => {
    if (c.id === checklistId && c.categories) {
      return {
        ...c,
        categories: c.categories.map((cat) => {
          if (cat.id === categoryId) {
            return {
              ...cat,
              items: cat.items.map((item) => ({ ...item, completed: true })),
            };
          }
          return cat;
        }),
      };
    }
    return c;
  });
  saveChecklists(updated);
};
