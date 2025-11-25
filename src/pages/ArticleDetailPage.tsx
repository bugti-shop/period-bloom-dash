import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Calendar, BookOpen, Bookmark, CheckCircle, Download, Trash2, WifiOff, StickyNote, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toggleBookmark, isBookmarked } from "@/lib/articleBookmarks";
import { 
  saveArticleProgress, 
  getArticleProgress, 
  calculateReadingTime 
} from "@/lib/articleProgress";
import {
  saveArticleOffline,
  isArticleOffline,
  removeOfflineArticle
} from "@/lib/offlineArticles";
import { 
  saveArticleNote, 
  getArticleNotes, 
  deleteArticleNote,
  ArticleNote 
} from "@/lib/articleNotes";
import { addToHistory } from "@/lib/readingHistory";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

const articleContent: Record<string, {
  id: number;
  category: string;
  title: string;
  image: string;
  readTime: string;
  date: string;
  author: string;
  content: string[];
}> = {
  "1": {
    id: 1,
    category: "Pregnancy",
    title: "Understanding Your First Trimester",
    image: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&auto=format&fit=crop",
    readTime: "5 min read",
    date: "November 20, 2025",
    author: "Maternal Health Team",
    content: [
      "The first trimester is an exciting and transformative period that spans from conception through week 12 of your pregnancy. During this time, your body undergoes remarkable changes to support your growing baby.",
      
      "Week 1-4: The Beginning\nDuring the first four weeks, fertilization occurs and the embryo implants in the uterine wall. Many women don't realize they're pregnant yet, but hormonal changes are already beginning. You might notice breast tenderness, mild cramping, or fatigue as your body adjusts.",
      
      "Week 5-8: Rapid Development\nBy week five, your baby's heart begins to beat, and major organs start forming. This is when morning sickness often begins for many women. The fatigue can be overwhelming as your body works hard to create the placenta and support early development. Eating small, frequent meals and staying hydrated can help manage nausea.",
      
      "Week 9-12: Taking Shape\nYour baby now officially transitions from embryo to fetus. All major organs are in place, though not fully developed. By the end of week 12, your baby is about 2-3 inches long. Many women find their energy returning slightly as the first trimester ends, and the risk of miscarriage decreases significantly.",
      
      "Common First Trimester Symptoms\nMorning sickness affects about 70-80% of pregnant women and can occur at any time of day. Fatigue is extremely common as your body produces more blood and your metabolism increases. Frequent urination happens as your uterus expands and presses on your bladder. Food aversions and cravings are normal as your hormones fluctuate.",
      
      "Important First Trimester Tips\nStart taking prenatal vitamins if you haven't already, especially folic acid which helps prevent neural tube defects. Schedule your first prenatal appointment, typically around week 8-10. Avoid alcohol, smoking, and raw foods that could carry bacteria. Stay hydrated and rest when your body tells you to.",
      
      "When to Call Your Doctor\nContact your healthcare provider if you experience heavy bleeding, severe abdominal pain, high fever, or severe vomiting that prevents you from keeping anything down. These could be signs of complications that need immediate attention.",
      
      "Remember, every pregnancy is different. What you experience may differ from others, and that's completely normal. Listen to your body, stay in communication with your healthcare team, and trust the process."
    ]
  },
  "2": {
    id: 2,
    category: "Period Health",
    title: "Managing Period Pain Naturally",
    image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&auto=format&fit=crop",
    readTime: "7 min read",
    date: "November 18, 2025",
    author: "Women's Health Specialists",
    content: [
      "Menstrual cramps, medically known as dysmenorrhea, affect up to 90% of women at some point in their lives. While over-the-counter medications can help, many women prefer natural remedies to manage period pain effectively.",
      
      "Understanding Period Pain\nPeriod cramps occur when your uterus contracts to shed its lining. These contractions are triggered by prostaglandins, hormone-like substances that cause inflammation and pain. Higher levels of prostaglandins are associated with more severe menstrual cramps.",
      
      "Heat Therapy: Your Best Friend\nApplying heat to your lower abdomen is one of the most effective natural pain relievers. Heat increases blood flow and relaxes the contracting muscles in your uterus. Use a heating pad, hot water bottle, or take a warm bath for 15-20 minutes. Studies show heat therapy can be as effective as over-the-counter pain medication.",
      
      "Exercise and Movement\nWhile it might be the last thing you want to do, gentle exercise can significantly reduce period pain. Physical activity releases endorphins, your body's natural painkillers. Try walking, yoga, or swimming. Even 20-30 minutes of light activity can make a difference. Avoid high-intensity workouts if they cause discomfort.",
      
      "Dietary Changes That Help\nCertain foods can reduce inflammation and ease cramps. Increase your intake of omega-3 fatty acids found in salmon, walnuts, and flaxseeds. Magnesium-rich foods like dark leafy greens, bananas, and dark chocolate can help relax muscles. Reduce caffeine, salt, and processed foods which can worsen bloating and cramping.",
      
      "Herbal Remedies\nGinger tea has anti-inflammatory properties that can reduce prostaglandin production. Chamomile tea helps relax muscles and has mild sedative effects. Cinnamon contains cinnamaldehyde, which can reduce menstrual bleeding and pain. Always consult with your doctor before trying new herbal supplements.",
      
      "Stress Management\nStress can worsen period pain by increasing muscle tension and inflammation. Practice deep breathing exercises, meditation, or progressive muscle relaxation. Even 10 minutes of daily mindfulness can help reduce pain perception and improve your overall menstrual experience.",
      
      "Massage and Acupressure\nGentle abdominal massage with essential oils like lavender or clary sage can reduce cramping. Acupressure points on your lower back, abdomen, and feet may provide relief. Apply gentle, circular pressure for 5-10 minutes.",
      
      "When to Seek Medical Help\nIf your period pain is severe enough to interfere with daily activities, lasts longer than 2-3 days, or suddenly worsens, consult your healthcare provider. These could be signs of conditions like endometriosis or fibroids that require medical treatment."
    ]
  },
  "3": {
    id: 3,
    category: "Pregnancy",
    title: "Nutrition During Pregnancy",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&auto=format&fit=crop",
    readTime: "6 min read",
    date: "November 15, 2025",
    author: "Prenatal Nutrition Experts",
    content: [
      "Proper nutrition during pregnancy is crucial for your baby's development and your own health. You're not just eating for two—you're building a human being from scratch, and every nutrient counts.",
      
      "Essential Nutrients for Pregnancy\nFolic acid is critical in the first trimester to prevent neural tube defects. Aim for 400-800 mcg daily through prenatal vitamins and folate-rich foods like leafy greens, citrus fruits, and fortified grains. Iron supports the increased blood volume you'll produce, preventing anemia. You need about 27mg daily from sources like lean red meat, beans, and iron-fortified cereals.",
      
      "Calcium and Vitamin D\nYour baby needs calcium to build strong bones and teeth, but if you don't consume enough, your body will take it from your bones. Aim for 1,000mg daily through dairy products, fortified plant milk, leafy greens, and almonds. Vitamin D helps your body absorb calcium and supports immune function. Get 600 IU daily through sunlight exposure, fatty fish, and fortified foods.",
      
      "Protein Requirements\nProtein is the building block for your baby's tissues and organs. You need about 70-100 grams daily, increasing throughout pregnancy. Include lean meats, poultry, fish, eggs, beans, lentils, tofu, and Greek yogurt in your diet. Plant-based proteins are excellent choices and provide additional fiber.",
      
      "Omega-3 Fatty Acids\nDHA, an omega-3 fatty acid, is crucial for brain and eye development. Aim for two servings of low-mercury fish per week, such as salmon, sardines, or trout. If you don't eat fish, consider algae-based DHA supplements. Walnuts and flaxseeds also provide omega-3s, though in a different form.",
      
      "Hydration Matters\nWater supports increased blood volume, amniotic fluid production, and nutrient transport. Aim for 8-12 cups daily, more if you're active or it's hot. Signs of adequate hydration include pale yellow urine and minimal thirst. Limit caffeine to 200mg daily (about one 12-oz coffee) as excessive amounts may affect fetal growth.",
      
      "Foods to Avoid\nRaw or undercooked meat, eggs, and seafood can harbor harmful bacteria. Unpasteurized dairy and juices may contain listeria. High-mercury fish like shark, swordfish, and king mackerel should be avoided. Limit processed foods high in added sugars and unhealthy fats.",
      
      "Managing Common Challenges\nFor morning sickness, eat small, frequent meals and keep crackers by your bed. Ginger tea and vitamin B6 may help. If you have heartburn, eat smaller portions, avoid spicy foods, and don't lie down immediately after eating. Constipation responds well to increased fiber, water, and gentle exercise.",
      
      "Healthy Weight Gain\nWeight gain recommendations vary based on your pre-pregnancy BMI. Most women need an extra 300-500 calories daily in the second and third trimesters. Focus on nutrient-dense foods rather than empty calories. Regular prenatal check-ups will ensure your weight gain is on track."
    ]
  },
  "4": {
    id: 4,
    category: "Wellness",
    title: "Exercise and Your Cycle",
    image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop",
    readTime: "4 min read",
    date: "November 12, 2025",
    author: "Fitness and Wellness Coaches",
    content: [
      "Your menstrual cycle affects your energy levels, strength, and recovery throughout the month. By understanding these changes, you can optimize your workouts and achieve better results while honoring your body's natural rhythms.",
      
      "The Menstrual Phase (Days 1-5)\nDuring your period, hormone levels are at their lowest, which can cause fatigue and decreased pain tolerance. This is an excellent time for lighter activities like walking, gentle yoga, or swimming. Listen to your body—if you feel energized, moderate exercise is fine, but don't push through severe discomfort. Exercise can actually help reduce cramps by releasing endorphins.",
      
      "The Follicular Phase (Days 6-14)\nAs estrogen rises after your period ends, your energy and mood improve. This is your power phase for challenging workouts. Try high-intensity interval training, heavy strength training, or learning new skills. Your body builds muscle more efficiently now, and your pain tolerance is higher. Take advantage of this phase to push your limits.",
      
      "Ovulation (Day 14)\nAround ovulation, estrogen peaks while testosterone also rises, giving you maximum strength and energy. This is the ideal time for personal records and intense training sessions. You might notice better coordination and faster reaction times. However, elevated estrogen can temporarily increase joint laxity, so maintain proper form to prevent injury.",
      
      "The Luteal Phase (Days 15-28)\nProgesterone rises in the luteal phase, increasing your body temperature and metabolic rate. You're burning more calories at rest but may feel more fatigued. Focus on moderate-intensity exercise like steady-state cardio, Pilates, or moderate strength training. In the week before your period, PMS symptoms may make you want to skip workouts, but light exercise often helps relieve symptoms.",
      
      "Adjusting Nutrition\nYour nutritional needs vary with your cycle. During your period, increase iron-rich foods to replace what's lost. In the follicular phase, slightly higher protein supports muscle growth. During the luteal phase, you may crave more food due to increased metabolic rate—this is normal. Choose complex carbs and healthy fats to stabilize blood sugar and mood.",
      
      "Rest and Recovery\nYour body needs more recovery time during menstruation and the late luteal phase. Quality sleep becomes even more important. Don't feel guilty about taking extra rest days—they're essential for long-term progress and hormone balance.",
      
      "Tracking Your Cycle\nUse a period tracking app to identify patterns in your energy and performance. After 2-3 months, you'll notice trends that help you plan workouts more effectively. Some women feel great during their period, while others need more rest—there's no right or wrong, only what works for your body."
    ]
  },
  "5": {
    id: 5,
    category: "Pregnancy",
    title: "Preparing for Labor and Delivery",
    image: "https://images.unsplash.com/photo-1584515933487-779824d29309?w=800&auto=format&fit=crop",
    readTime: "8 min read",
    date: "November 10, 2025",
    author: "Birth Preparation Team",
    content: [
      "Preparing for labor and delivery can feel overwhelming, but knowledge and planning will help you feel more confident and in control when the big day arrives.",
      
      "Understanding the Stages of Labor\nFirst stage labor involves early labor, active labor, and transition. Early labor can last hours or days with irregular contractions that gradually become more regular. Active labor is when contractions are 3-5 minutes apart, lasting 60 seconds. Transition is the most intense but shortest phase. Second stage is pushing and delivery, lasting from minutes to a few hours. Third stage is placental delivery, typically 5-30 minutes after birth.",
      
      "Creating Your Birth Plan\nA birth plan outlines your preferences for labor and delivery. Consider pain management options: natural techniques, epidural, or other medications. Think about who you want present, whether you want delayed cord clamping, and your preferences for skin-to-skin contact. Include preferences for unexpected situations like C-section. Remember, flexibility is key—birth rarely goes exactly as planned.",
      
      "Pain Management Techniques\nNatural pain relief includes breathing exercises, focusing on slow, deep breaths during contractions. Movement and position changes help many women—try walking, squatting, or using a birthing ball. Water therapy through showers or baths can be soothing. Massage and counter-pressure from a partner can relieve back labor. Visualization and meditation help some women stay calm and centered.",
      
      "Medical Pain Relief\nEpidural anesthesia is the most common pain relief, numbing from the waist down while allowing you to remain alert. It can be administered once active labor begins. Nitrous oxide (laughing gas) provides mild pain relief and doesn't restrict movement. Opioid medications are less common now but available for early labor pain. Discuss all options with your healthcare provider during prenatal visits.",
      
      "Preparing Your Body\nPrenatal yoga and stretching improve flexibility and teach breathing techniques. Perineal massage starting at 34 weeks may reduce tearing risk. Kegel exercises strengthen pelvic floor muscles for pushing and postpartum recovery. Regular walking throughout pregnancy builds endurance for labor. Stay active but listen to your body's limits.",
      
      "Packing Your Hospital Bag\nPack by 36 weeks in case of early labor. Essential items include your ID, insurance cards, and birth plan copies. Bring comfortable clothing, toiletries, phone charger, and snacks. For baby, pack a going-home outfit, car seat (required), and receiving blankets. Many hospitals provide basic supplies, so call ahead to avoid over-packing.",
      
      "Labor Signs and When to Go\nRegular contractions that don't stop with movement or position changes, occurring 5 minutes apart for an hour, mean it's time to contact your provider. Your water breaking requires medical evaluation even without contractions. Bright red bleeding (more than spotting), decreased fetal movement, or severe abdominal pain warrant immediate attention.",
      
      "Support During Labor\nChoose support people who make you feel calm and confident. A birth partner can advocate for you, provide comfort measures, and help you stay focused. Some couples hire a doula—a trained birth support professional who provides physical and emotional assistance. Studies show doula support can shorten labor and reduce intervention rates.",
      
      "After Delivery\nThe first hour after birth is precious bonding time. Skin-to-skin contact helps regulate baby's temperature and encourages breastfeeding. You'll deliver the placenta and may need stitches if you tore. Your healthcare team will monitor your vitals and bleeding. Don't hesitate to ask for help or pain relief—recovery is just as important as labor."
    ]
  },
  "6": {
    id: 6,
    category: "Period Health",
    title: "Understanding Your Cycle Phases",
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&auto=format&fit=crop",
    readTime: "6 min read",
    date: "November 8, 2025",
    author: "Reproductive Health Educators",
    content: [
      "Your menstrual cycle is more than just your period. It's a complex, beautifully orchestrated series of hormonal changes that affects your mood, energy, skin, and overall health throughout the month.",
      
      "The Four Phases Overview\nA typical cycle lasts 28 days, though anywhere from 21-35 days is normal. The cycle divides into four distinct phases: menstrual, follicular, ovulation, and luteal. Each phase is governed by different hormone levels that create predictable physical and emotional changes.",
      
      "Menstrual Phase (Days 1-5)\nDay 1 is the first day of full menstrual flow. During menstruation, the uterine lining sheds because no pregnancy occurred. Hormone levels are at their lowest, which can cause fatigue, cramping, and mood changes. Your body is actually working hard during this time, so rest and self-care are important. The typical period lasts 3-7 days with blood loss of about 30-40ml (2-3 tablespoons).",
      
      "Follicular Phase (Days 1-14)\nThis phase overlaps with your period, beginning on day 1 and lasting until ovulation. The pituitary gland releases follicle-stimulating hormone (FSH), which stimulates follicles in your ovaries to mature. Each follicle contains an egg. As follicles grow, they produce estrogen, which rebuilds the uterine lining and increases energy and mood. Many women feel their best during the late follicular phase.",
      
      "Ovulation (Day 14)\nOvulation occurs around day 14 in a 28-day cycle, triggered by a surge in luteinizing hormone (LH). The dominant follicle releases a mature egg, which travels down the fallopian tube where it can be fertilized for 12-24 hours. You might notice increased cervical mucus (clear and stretchy like egg whites), slight temperature increase, heightened senses, and increased libido. Some women feel mild pelvic pain called mittelschmerz.",
      
      "Luteal Phase (Days 15-28)\nAfter ovulation, the empty follicle becomes the corpus luteum, producing progesterone to prepare the uterine lining for potential pregnancy. Progesterone raises your body temperature slightly and can cause water retention, breast tenderness, and mood changes. If pregnancy doesn't occur, the corpus luteum breaks down, hormone levels drop, and your period begins. The last week of this phase is when PMS symptoms typically appear.",
      
      "Tracking Your Cycle\nUnderstanding your cycle helps you predict when you'll feel your best and when you might need extra self-care. Track your period start date, duration, and flow intensity. Note physical symptoms like cramps, breast tenderness, or headaches. Record emotional changes and energy levels. Cervical mucus changes can indicate fertility. Apps make tracking easy, but a simple calendar works too.",
      
      "What's Normal vs. Concerning\nVariation in cycle length is normal, especially in your teens and approaching menopause. Stress, diet changes, travel, and illness can all affect your cycle. However, sudden significant changes, periods lasting longer than 7 days, extremely heavy flow (soaking through a pad/tampon every hour), severe pain that interferes with daily life, or periods that stop for 3+ months without pregnancy warrant medical evaluation.",
      
      "Using Cycle Knowledge\nPlan important events around your cycle when possible. Schedule demanding work during your high-energy follicular phase. Plan self-care and downtime during your luteal phase and period. Use your most creative phase (follicular) for brainstorming and problem-solving. Your body's rhythms are a feature, not a flaw—working with them instead of against them improves your overall wellbeing."
    ]
  }
};

export const ArticleDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bookmarked, setBookmarked] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [hasRestoredPosition, setHasRestoredPosition] = useState(false);
  const [offlineAvailable, setOfflineAvailable] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [notes, setNotes] = useState<ArticleNote[]>([]);
  const [selectedText, setSelectedText] = useState("");
  const [selectedParagraph, setSelectedParagraph] = useState<number | null>(null);
  const [noteText, setNoteText] = useState("");
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const articleRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  
  const article = id ? articleContent[id] : null;
  const readingTime = article ? calculateReadingTime(article.content.join(' ')) : 0;

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Back online!");
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.info("You're offline. Saved articles are still available.");
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (id) {
      setBookmarked(isBookmarked(id));
      setOfflineAvailable(isArticleOffline(id));
      setNotes(getArticleNotes(id));
      
      // Auto-save article for offline reading when first opened
      if (article && !isArticleOffline(id)) {
        saveArticleOffline(
          id,
          article.title,
          article.content,
          article.category,
          article.image,
          article.date,
          article.author
        );
        setOfflineAvailable(true);
      }
      
      // Restore scroll position
      const progress = getArticleProgress(id);
      if (progress && progress.scrollPosition > 0 && !progress.completed) {
        // Wait for content to render then scroll
        setTimeout(() => {
          window.scrollTo(0, progress.scrollPosition);
          setHasRestoredPosition(true);
          toast.success(`Resumed from ${Math.round(progress.scrollPercentage)}% through the article`);
        }, 100);
      } else {
        setHasRestoredPosition(true);
      }
    }
  }, [id, article]);

  useEffect(() => {
    if (!id || !hasRestoredPosition) return;

    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const scrollableHeight = documentHeight - windowHeight;
      const percentage = (scrollTop / scrollableHeight) * 100;
      
      setScrollProgress(Math.min(Math.round(percentage), 100));

      // Debounce saving progress
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        const completed = percentage >= 95;
        saveArticleProgress(id, scrollTop, percentage, completed);
        
        if (completed && percentage >= 95) {
          const progress = getArticleProgress(id);
          if (progress && !progress.completed) {
            // Add to reading history when article is completed
            if (article) {
              addToHistory(id, article.title, article.category, readingTime);
            }
            toast.success("Article completed! 🎉");
          }
        }
      }, 500);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial calculation

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [id, hasRestoredPosition]);

  const handleBookmarkToggle = () => {
    if (!id) return;
    const newBookmarked = toggleBookmark(id);
    setBookmarked(newBookmarked);
    toast.success(newBookmarked ? "Article bookmarked!" : "Bookmark removed");
  };

  const handleDownloadOffline = () => {
    if (!id || !article) return;
    
    if (offlineAvailable) {
      removeOfflineArticle(id);
      setOfflineAvailable(false);
      toast.success("Removed from offline storage");
    } else {
      saveArticleOffline(
        id,
        article.title,
        article.content,
        article.category,
        article.image,
        article.date,
        article.author
      );
      setOfflineAvailable(true);
      toast.success("Article saved for offline reading!");
    }
  };

  const handleTextSelection = (paragraphIndex: number) => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();
    
    if (text && text.length > 0) {
      setSelectedText(text);
      setSelectedParagraph(paragraphIndex);
      setIsNotesOpen(true);
    }
  };

  const handleSaveNote = () => {
    if (!id || !selectedText || selectedParagraph === null || !noteText.trim()) return;

    const note: ArticleNote = {
      id: `${id}-${Date.now()}`,
      articleId: id,
      selectedText,
      note: noteText,
      position: selectedParagraph,
      timestamp: Date.now(),
      color: '#fef3c7'
    };

    saveArticleNote(note);
    setNotes([...notes, note]);
    setNoteText("");
    setSelectedText("");
    setSelectedParagraph(null);
    toast.success("Note saved!");
  };

  const handleDeleteNote = (noteId: string) => {
    deleteArticleNote(noteId);
    setNotes(notes.filter(n => n.id !== noteId));
    toast.success("Note deleted");
  };

  const getRelatedArticles = () => {
    if (!article) return [];
    return Object.values(articleContent)
      .filter(a => a.category === article.category && a.id !== article.id)
      .slice(0, 3);
  };

  const relatedArticles = getRelatedArticles();
  const progress = id ? getArticleProgress(id) : null;

  if (!article) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Article Not Found</h1>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Progress Bar */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <Button
              variant="ghost"
              onClick={() => navigate("/articles")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Articles
            </Button>
            <div className="flex items-center gap-2">
              {!isOnline && (
                <Badge variant="outline" className="gap-1">
                  <WifiOff className="h-3 w-3" />
                  Offline
                </Badge>
              )}
              {progress?.completed && (
                <Badge variant="secondary" className="gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Completed
                </Badge>
              )}
              <Button
                variant={offlineAvailable ? "default" : "outline"}
                size="icon"
                onClick={handleDownloadOffline}
                title={offlineAvailable ? "Remove from offline storage" : "Save for offline reading"}
              >
                {offlineAvailable ? (
                  <Trash2 className="h-4 w-4" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant={bookmarked ? "default" : "outline"}
                size="icon"
                onClick={handleBookmarkToggle}
              >
                <Bookmark className={`h-4 w-4 ${bookmarked ? "fill-current" : ""}`} />
              </Button>
              <Sheet open={isNotesOpen} onOpenChange={setIsNotesOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="relative">
                    <StickyNote className="h-4 w-4" />
                    {notes.length > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                        {notes.length}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:w-[400px]">
                  <SheetHeader>
                    <SheetTitle>Article Notes</SheetTitle>
                  </SheetHeader>
                  <ScrollArea className="h-[calc(100vh-100px)] mt-4">
                    <div className="space-y-4 pr-4">
                      {selectedText && (
                        <div className="p-4 border border-border rounded-lg bg-muted/50">
                          <p className="text-sm font-medium mb-2">Selected Text:</p>
                          <p className="text-sm text-muted-foreground italic mb-3">"{selectedText}"</p>
                          <Textarea
                            placeholder="Add your note..."
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            className="mb-2"
                          />
                          <Button onClick={handleSaveNote} size="sm" className="w-full">
                            Save Note
                          </Button>
                        </div>
                      )}
                      
                      {notes.length === 0 && !selectedText && (
                        <div className="text-center py-8 text-muted-foreground">
                          <StickyNote className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No notes yet</p>
                          <p className="text-xs">Select text in the article to add notes</p>
                        </div>
                      )}
                      
                      {notes.map((note) => (
                        <div key={note.id} className="p-4 border border-border rounded-lg bg-yellow-50">
                          <div className="flex items-start justify-between mb-2">
                            <p className="text-xs text-muted-foreground">
                              {new Date(note.timestamp).toLocaleDateString()}
                            </p>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleDeleteNote(note.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-sm italic mb-2 text-muted-foreground">"{note.selectedText}"</p>
                          <p className="text-sm">{note.note}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </SheetContent>
              </Sheet>
            </div>
          </div>
          <Progress value={scrollProgress} className="h-1" />
        </div>
      </header>

      {/* Hero Image */}
      <div className="w-full h-64 md:h-96 overflow-hidden">
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Article Content */}
      <article ref={articleRef} className="max-w-4xl mx-auto px-4 py-8">
        {/* Category Badge */}
        <div className="mb-4">
          <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm font-semibold rounded-full">
            {article.category}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          {article.title}
        </h1>

        {/* Meta Information */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8 pb-8 border-b border-border">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{article.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{readingTime} min read</span>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span>{article.author}</span>
          </div>
          {progress && progress.scrollPercentage > 5 && !progress.completed && (
            <div className="flex items-center gap-2 text-primary">
              <span className="font-medium">{Math.round(progress.scrollPercentage)}% read</span>
            </div>
          )}
        </div>

        {/* Article Body */}
        <div className="prose prose-lg max-w-none">
          {article.content.map((paragraph, index) => {
            const hasNote = notes.find(n => n.position === index);
            return (
              <p
                key={index}
                className={`text-foreground mb-6 leading-relaxed whitespace-pre-line cursor-text select-text ${
                  hasNote ? 'bg-yellow-100 p-2 rounded' : ''
                }`}
                onMouseUp={() => handleTextSelection(index)}
              >
                {paragraph}
              </p>
            );
          })}
        </div>

        {/* Disclaimer */}
        <div className="mt-12 p-6 bg-muted/50 rounded-lg border border-border">
          <p className="text-sm text-muted-foreground italic">
            <strong>Disclaimer:</strong> This article is for educational purposes only and does not constitute medical advice. 
            Always consult with your healthcare provider regarding your specific health concerns and before making any decisions 
            about your medical care.
          </p>
        </div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div className="mt-12 pt-12 border-t border-border">
            <h2 className="text-2xl font-bold text-foreground mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((relatedArticle) => (
                <article
                  key={relatedArticle.id}
                  onClick={() => {
                    navigate(`/article/${relatedArticle.id}`);
                    window.scrollTo(0, 0);
                  }}
                  className="bg-white rounded-xl overflow-hidden shadow-sm border border-border hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="aspect-video w-full overflow-hidden">
                    <img
                      src={relatedArticle.image}
                      alt={relatedArticle.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {relatedArticle.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{relatedArticle.readTime}</span>
                    </div>
                    <h3 className="text-base font-bold text-foreground mb-2 line-clamp-2">
                      {relatedArticle.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {relatedArticle.content[0].substring(0, 100)}...
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
};
