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
  images: Array<{
    url: string;
    alt: string;
    credit: string;
    creditLink: string;
    position: number; // After which paragraph to insert
  }>;
}> = {
  "1": {
    id: 1,
    category: "Pregnancy",
    title: "Understanding Your First Trimester",
    image: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&auto=format&fit=crop",
    readTime: "5 min read",
    date: "November 20, 2025",
    author: "Maternal Health Team",
    images: [
      {
        url: "https://www.cdc.gov/pregnancy/images/pregnant-woman-healthcare-provider.jpg",
        alt: "Healthcare provider examining pregnant woman during prenatal visit",
        credit: "Image from CDC - Centers for Disease Control and Prevention",
        creditLink: "https://www.cdc.gov/pregnancy/",
        position: 2
      },
      {
        url: "https://images.unsplash.com/photo-1492725764893-90b379c2b6e7?w=1200&auto=format&fit=crop",
        alt: "Healthy pregnancy nutrition with fruits and vegetables",
        credit: "Photo by Brooke Lark on Unsplash",
        creditLink: "https://unsplash.com/@brookelark",
        position: 5
      }
    ],
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
    images: [
      {
        url: "https://www.nichd.nih.gov/sites/default/files/inline-images/woman-menstrual-pain-relief.jpg",
        alt: "Woman using heat therapy for menstrual pain management",
        credit: "Image from NICHD - National Institute of Child Health and Human Development",
        creditLink: "https://www.nichd.nih.gov/health/topics/menstruation",
        position: 3
      },
      {
        url: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1200",
        alt: "Healthy anti-inflammatory foods to reduce period pain",
        credit: "Photo by Ella Olsson on Pexels",
        creditLink: "https://www.pexels.com/@ella-olsson-572949",
        position: 5
      },
      {
        url: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&auto=format&fit=crop",
        alt: "Woman doing yoga for menstrual health",
        credit: "Photo by Ginny Rose Stewart on Unsplash",
        creditLink: "https://unsplash.com/@ginnyrosestewart",
        position: 7
      }
    ],
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
    images: [
      {
        url: "https://www.nih.gov/sites/default/files/news-events/research-matters/2020/20200310-pregnancy-nutrition.jpg",
        alt: "Nutritionist counseling pregnant woman about healthy diet",
        credit: "Image from NIH - National Institutes of Health",
        creditLink: "https://www.nih.gov/",
        position: 2
      },
      {
        url: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=1200&auto=format&fit=crop",
        alt: "Salmon and omega-3 rich foods for pregnancy",
        credit: "Photo by Caroline Attwood on Unsplash",
        creditLink: "https://unsplash.com/@carolineattwood",
        position: 4
      },
      {
        url: "https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=1200",
        alt: "Fresh fruits and vegetables for pregnancy nutrition",
        credit: "Photo by Ella Olsson on Pexels",
        creditLink: "https://www.pexels.com/@ella-olsson-572949",
        position: 6
      }
    ],
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
    images: [
      {
        url: "https://www.cdc.gov/physicalactivity/basics/images/women-exercise-group.jpg",
        alt: "Women participating in group fitness class showing healthy exercise habits",
        credit: "Image from CDC - Centers for Disease Control and Prevention",
        creditLink: "https://www.cdc.gov/physicalactivity/",
        position: 2
      },
      {
        url: "https://images.pexels.com/photos/3984340/pexels-photo-3984340.jpeg?auto=compress&cs=tinysrgb&w=1200",
        alt: "Woman doing yoga stretches",
        credit: "Photo by Yan Krukau on Pexels",
        creditLink: "https://www.pexels.com/@yankrukov",
        position: 5
      }
    ],
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
    images: [
      {
        url: "https://www.who.int/images/default-source/mca-images/labor-delivery-care.jpg",
        alt: "Healthcare professionals providing labor and delivery care",
        credit: "Image from WHO - World Health Organization",
        creditLink: "https://www.who.int/health-topics/maternal-health",
        position: 2
      },
      {
        url: "https://images.pexels.com/photos/7282810/pexels-photo-7282810.jpeg?auto=compress&cs=tinysrgb&w=1200",
        alt: "Hospital room prepared for childbirth",
        credit: "Photo by Ketut Subiyanto on Pexels",
        creditLink: "https://www.pexels.com/@ketut-subiyanto",
        position: 6
      },
      {
        url: "https://www.nichd.nih.gov/sites/default/files/inline-images/newborn-baby-care.jpg",
        alt: "Medical staff providing newborn care immediately after birth",
        credit: "Image from NICHD - National Institute of Child Health and Human Development",
        creditLink: "https://www.nichd.nih.gov/",
        position: 9
      }
    ],
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
    images: [
      {
        url: "https://www.nichd.nih.gov/sites/default/files/inline-images/menstrual-cycle-diagram.jpg",
        alt: "Medical diagram showing menstrual cycle phases and hormones",
        credit: "Image from NICHD - National Institute of Child Health and Human Development",
        creditLink: "https://www.nichd.nih.gov/health/topics/menstruation",
        position: 3
      },
      {
        url: "https://images.pexels.com/photos/4498606/pexels-photo-4498606.jpeg?auto=compress&cs=tinysrgb&w=1200",
        alt: "Woman tracking menstrual health and wellness",
        credit: "Photo by Polina Tankilevitch on Pexels",
        creditLink: "https://www.pexels.com/@polina-tankilevitch",
        position: 6
      }
    ],
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
  },
  "7": {
    id: 7,
    category: "Postpartum",
    title: "Postpartum Recovery: What to Expect",
    image: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&auto=format&fit=crop",
    readTime: "9 min read",
    date: "November 25, 2025",
    author: "Postpartum Care Specialists",
    images: [
      {
        url: "https://www.nichd.nih.gov/sites/default/files/inline-images/postpartum-mother-baby-bonding.jpg",
        alt: "New mother bonding with baby during postpartum recovery",
        credit: "Image from NICHD - National Institute of Child Health and Human Development",
        creditLink: "https://www.nichd.nih.gov/health/topics/postpartum",
        position: 2
      },
      {
        url: "https://www.cdc.gov/maternal-infant-health/images/postpartum-care-visit.jpg",
        alt: "Healthcare provider conducting postpartum checkup",
        credit: "Image from CDC - Centers for Disease Control and Prevention",
        creditLink: "https://www.cdc.gov/maternal-infant-health/",
        position: 5
      },
      {
        url: "https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=1200",
        alt: "Mother resting during postpartum recovery period",
        credit: "Photo by Anna Shvets on Pexels",
        creditLink: "https://www.pexels.com/@shvetsa",
        position: 8
      }
    ],
    content: [
      "The postpartum period, also called the fourth trimester, spans the first six weeks after childbirth. Your body undergoes dramatic physical and emotional changes as it recovers from pregnancy and adapts to caring for a newborn.",
      
      "Physical Recovery Timeline\nThe first 24-48 hours after delivery bring significant changes. You'll experience postpartum bleeding (lochia) that starts heavy and red, gradually lightening over 4-6 weeks. Cramping occurs as your uterus contracts back to its pre-pregnancy size. Perineal soreness from tearing or episiotomy is common and typically improves within 1-2 weeks with proper care. If you had a C-section, incision care and managing surgical pain become priorities.",
      
      "Managing Postpartum Bleeding\nLochia is normal and expected. Use heavy-duty pads (not tampons) for the first few weeks. Bleeding should gradually decrease and change from bright red to pink to brown to yellow-white. Heavy bleeding that soaks through a pad in an hour, large clots bigger than a golf ball, or foul-smelling discharge require immediate medical attention as these may signal complications like retained placenta or infection.",
      
      "Perineal Care and Healing\nWhether you had a vaginal delivery or C-section, proper wound care accelerates healing. For vaginal tears, use a peri bottle with warm water after each bathroom visit. Apply cold packs in the first 24 hours, then switch to warm sitz baths. Change pads frequently to prevent infection. For C-section incisions, keep the area clean and dry, watch for signs of infection (redness, warmth, discharge), and avoid heavy lifting for 6-8 weeks.",
      
      "Hormonal Changes and Mood\nHormone levels drop dramatically after delivery, causing the 'baby blues' in 70-80% of new mothers. Symptoms include mood swings, crying spells, anxiety, and difficulty sleeping. These typically peak around day 3-5 and resolve within two weeks. However, 10-15% of mothers develop postpartum depression (PPD), which is more severe and persistent. PPD symptoms include persistent sadness, loss of interest in activities, difficulty bonding with baby, thoughts of harming yourself or baby, and overwhelming anxiety.",
      
      "Physical Recovery Milestones\nWeek 1: Focus on rest, healing, and establishing feeding. Accept help with household tasks. Week 2-3: Energy slowly returns but fatigue remains normal with newborn care demands. Week 4-6: Most physical symptoms improve. Your six-week postpartum checkup assesses healing and discusses contraception. Months 2-6: Gradually return to normal activities, including exercise once cleared by your doctor. Full recovery can take 6-12 months, especially for core strength and pelvic floor.",
      
      "Breastfeeding Physical Effects\nBreastfeeding affects postpartum recovery. It releases oxytocin, causing uterine contractions that help your uterus return to normal size but may increase cramping. Breast engorgement typically peaks 3-5 days postpartum when milk comes in. Nipple soreness is common initially but shouldn't be severe—proper latch prevents most pain. Stay hydrated and consume an extra 300-500 calories daily while breastfeeding.",
      
      "Sleep and Self-Care\nNewborn care means interrupted sleep, but extreme sleep deprivation impairs recovery and increases PPD risk. Sleep when baby sleeps, even brief naps help. Ask partners or family to handle night feedings occasionally. Maintain basic nutrition even when exhausted—prepare simple meals in advance or accept meal deliveries. Gentle movement like short walks aids physical and mental recovery once cleared by your provider.",
      
      "Sexual Health and Contraception\nMost providers recommend waiting 4-6 weeks before resuming intercourse to allow healing. When you're ready, use lubrication as hormonal changes reduce natural lubrication, especially while breastfeeding. Discuss contraception at your postpartum visit—pregnancy can occur before your first period returns, even while breastfeeding. IUDs, mini-pills, and barrier methods are safe for breastfeeding mothers.",
      
      "When to Seek Help\nContact your healthcare provider immediately for: heavy bleeding, severe abdominal or pelvic pain, fever over 100.4°F, severe headaches or vision changes, chest pain or difficulty breathing, painful urination or inability to urinate, hot, tender breasts with flu-like symptoms (mastitis), wound that won't heal or shows infection signs, or feelings of wanting to harm yourself or your baby. Postpartum complications are serious but treatable when caught early."
    ]
  },
  "8": {
    id: 8,
    category: "Breastfeeding",
    title: "Breastfeeding Basics: A Complete Guide",
    image: "https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?w=800&auto=format&fit=crop",
    readTime: "10 min read",
    date: "November 24, 2025",
    author: "Lactation Consultants",
    images: [
      {
        url: "https://www.cdc.gov/breastfeeding/images/mother-breastfeeding-newborn.jpg",
        alt: "Mother breastfeeding newborn baby with proper latch",
        credit: "Image from CDC - Centers for Disease Control and Prevention",
        creditLink: "https://www.cdc.gov/breastfeeding/",
        position: 2
      },
      {
        url: "https://www.nichd.nih.gov/sites/default/files/inline-images/lactation-consultant-helping-mother.jpg",
        alt: "Lactation consultant assisting new mother with breastfeeding",
        credit: "Image from NICHD - National Institute of Child Health and Human Development",
        creditLink: "https://www.nichd.nih.gov/",
        position: 5
      },
      {
        url: "https://images.pexels.com/photos/8491929/pexels-photo-8491929.jpeg?auto=compress&cs=tinysrgb&w=1200",
        alt: "Breastfeeding supplies and nursing equipment",
        credit: "Photo by Yan Krukau on Pexels",
        creditLink: "https://www.pexels.com/@yankrukov",
        position: 8
      }
    ],
    content: [
      "Breastfeeding provides optimal nutrition for your baby and offers health benefits for both mother and child. While natural, it's a learned skill that takes practice and patience for both you and your baby.",
      
      "Benefits of Breastfeeding\nBreast milk contains the perfect balance of nutrients, antibodies, and enzymes that protect babies from infections and diseases. Colostrum, the first milk produced in the first few days, is especially rich in antibodies and helps establish baby's immune system. Breastfeeding reduces risk of ear infections, respiratory illnesses, diarrhea, SIDS, obesity, and type 2 diabetes. For mothers, it lowers risk of breast and ovarian cancer, type 2 diabetes, and postpartum depression while promoting faster postpartum weight loss and uterine recovery.",
      
      "Getting Started: The First Hour\nSkin-to-skin contact immediately after birth helps initiate breastfeeding. Babies have a strong instinct to feed within the first hour. This early feeding stimulates milk production and helps baby learn to latch. Don't worry if it doesn't go perfectly—you're both learning. Hospital lactation consultants can help with positioning and latch during your stay.",
      
      "Proper Latch Technique\nA good latch is crucial for successful, comfortable breastfeeding. Baby's mouth should be wide open, taking in both nipple and a good portion of areola. Lips should flange outward, not tucked in. You should feel pulling and tugging but not pinching or pain. Baby's chin touches your breast, nose is clear for breathing. You'll hear rhythmic sucking and swallowing. If latch hurts, break suction with your finger and try again—persistent pain indicates improper latch.",
      
      "Breastfeeding Positions\nTry different positions to find what works best. Cradle hold is traditional, supporting baby's head in the crook of your arm. Cross-cradle hold gives more control, especially for newborns—hold baby with opposite arm from the breast you're using. Football hold tucks baby under your arm, useful after C-section or for large breasts. Side-lying position allows you to rest while feeding, good for night feedings once you and baby are comfortable with breastfeeding.",
      
      "Milk Supply and Feeding Frequency\nColostrum is produced in small amounts (2-10ml per feeding) the first 2-3 days—perfectly adequate for your newborn's tiny stomach. Mature milk 'comes in' around day 3-5, causing breast fullness or engorgement. Newborns feed 8-12 times in 24 hours, sometimes more. Feeding on demand establishes good milk supply. Don't watch the clock—let baby feed until satisfied, typically 10-45 minutes per feeding. Feed from both breasts each session, alternating which side you start with.",
      
      "Signs of Adequate Intake\nYou can't see how much baby consumes when breastfeeding, so watch for these signs: 6+ wet diapers and 3-4 dirty diapers per day by day 5, steady weight gain after initial newborn weight loss (babies lose 5-10% of birth weight initially, should regain it by 2 weeks), baby seems satisfied after feeding, breasts feel softer after feeding, you hear swallowing during feeds. Weight checks at pediatrician visits track growth.",
      
      "Common Breastfeeding Challenges\nEngorgement when milk comes in can make latching difficult—hand express or pump briefly before feeding to soften breasts. Sore nipples usually indicate poor latch—work with a lactation consultant. Clogged ducts feel like tender lumps; massage, warm compresses, and frequent feeding on that side usually clear them. Mastitis causes flu-like symptoms with a hot, red, tender area on breast—requires immediate medical attention and antibiotics. Low milk supply concerns are often perception—most mothers produce adequate milk when feeding on demand.",
      
      "Pumping and Storage\nIf returning to work or needing to be away from baby, pumping maintains supply. Hospital-grade or quality double-electric pumps are most efficient. Pump 8-10 times daily to establish supply, or pump after/between feedings to build a stash. Freshly expressed milk lasts 4 hours at room temperature, 4 days in the refrigerator, 6-12 months in the freezer. Thaw frozen milk in refrigerator or under warm water, never microwave. Gently swirl to mix separated fat—don't shake vigorously.",
      
      "Nutrition and Self-Care While Breastfeeding\nConsume an extra 300-500 calories daily. Stay hydrated—drink water each time you nurse. Most foods are fine, though some babies react to dairy, caffeine, or spicy foods in mother's diet. Limit caffeine to 300mg daily (2-3 cups coffee). Alcohol passes into breast milk—if drinking, time it so alcohol clears before next feeding or pump and dump. Continue prenatal vitamins. Rest when possible—exhaustion affects milk supply.",
      
      "When to Seek Help\nContact a lactation consultant or healthcare provider for: persistent pain beyond the first week, baby not gaining weight, fewer than 6 wet diapers daily after day 5, baby seems constantly hungry or frustrated at breast, suspected tongue or lip tie affecting latch, mastitis symptoms, or concerns about milk supply. Many issues are easily resolved with proper support—don't struggle alone."
    ]
  },
  "9": {
    id: 9,
    category: "Newborn Care",
    title: "Newborn Care Essentials: First Month Guide",
    image: "https://images.pexels.com/photos/3737582/pexels-photo-3737582.jpeg?w=800&auto=format&fit=crop",
    readTime: "8 min read",
    date: "November 23, 2025",
    author: "Pediatric Care Team",
    images: [
      {
        url: "https://www.nichd.nih.gov/sites/default/files/inline-images/newborn-safe-sleep.jpg",
        alt: "Newborn baby sleeping safely on back in crib",
        credit: "Image from NICHD - National Institute of Child Health and Human Development",
        creditLink: "https://www.nichd.nih.gov/health/topics/sids",
        position: 2
      },
      {
        url: "https://www.cdc.gov/healthywater/hygiene/images/handwashing-newborn-care.jpg",
        alt: "Healthcare provider demonstrating proper handwashing before handling newborn",
        credit: "Image from CDC - Centers for Disease Control and Prevention",
        creditLink: "https://www.cdc.gov/healthywater/hygiene/hand/",
        position: 5
      },
      {
        url: "https://images.pexels.com/photos/8490811/pexels-photo-8490811.jpeg?auto=compress&cs=tinysrgb&w=1200",
        alt: "Parent caring for newborn baby",
        credit: "Photo by Yan Krukau on Pexels",
        creditLink: "https://www.pexels.com/@yankrukov",
        position: 8
      }
    ],
    content: [
      "Caring for a newborn can feel overwhelming, but understanding basic needs helps you feel confident. During the first month, babies require feeding, sleep, diaper changes, and love—you've got this.",
      
      "Feeding Your Newborn\nNewborns need to eat 8-12 times in 24 hours whether breast or formula fed. That's every 2-3 hours, sometimes more. Never let a newborn go more than 4 hours without feeding during the first few weeks. Feeding on demand rather than by schedule is recommended. Breastfed babies feed more frequently as breast milk digests quickly. Formula-fed babies typically eat every 3-4 hours, consuming 2-3 ounces per feeding initially, increasing to 4 ounces by one month.",
      
      "Safe Sleep Practices\nSafe sleep reduces SIDS risk. Always place baby on back to sleep, on a firm, flat surface with a tight-fitting sheet. Never use pillows, blankets, bumpers, or stuffed animals in the crib. Room-sharing (not bed-sharing) is recommended for at least 6 months. Keep room temperature comfortable—overheating increases SIDS risk. Use a pacifier for naps and nighttime after breastfeeding is established (usually 3-4 weeks). Newborns sleep 14-17 hours daily in 2-4 hour stretches, waking frequently to eat.",
      
      "Diaper Changes and Skin Care\nNewborns need 8-12 diaper changes daily. Change wet or dirty diapers promptly to prevent diaper rash. For girls, wipe front to back. For boys, point penis downward in diaper. Clean with water and soft cloth or fragrance-free wipes. Air dry before applying fresh diaper. Use barrier cream with zinc oxide if redness develops. First few days, baby passes meconium (sticky, black-green stool), transitioning to yellow, seedy stools by day 4-5 if breastfed, or tan/yellow if formula-fed.",
      
      "Umbilical Cord Care\nThe umbilical cord stump dries and falls off within 1-3 weeks. Keep it clean and dry. Fold diaper below stump so it's exposed to air. No need for alcohol swabs—studies show dry care works better. Sponge bathe baby until stump falls off and area heals. Small amount of blood when stump falls off is normal. Contact pediatrician if you notice foul odor, yellow discharge, or redness spreading from the base.",
      
      "Bathing Your Newborn\nGive sponge baths until umbilical cord falls off and circumcision heals (if applicable). Newborns only need 2-3 baths per week—more can dry their skin. Gather supplies before starting: warm water, mild baby soap, soft washcloths, hooded towel. Keep room warm (75-80°F). Support baby's head at all times. Wash face with water only, hair with small amount of soap, then body. Work quickly as babies lose heat rapidly when wet. Pat dry thoroughly, especially in skin folds.",
      
      "Understanding Newborn Cues\nBabies communicate through crying and body language. Hunger cues include rooting (turning toward touch on cheek), hand-to-mouth movements, fussing. Sleepy cues include yawning, looking away, fussiness, rubbing eyes. Respond to early cues before baby becomes overtired or frantically hungry. Crying peaks around 6 weeks and is normal, but excessive crying may indicate discomfort—check for hunger, dirty diaper, temperature discomfort, or need for burping.",
      
      "Handling and Holding\nAlways support baby's head and neck—muscles aren't strong enough yet. Pick up baby by sliding one hand under head and neck, other under bottom. Hold close to your body. Try different holds: cradle hold against chest, shoulder hold with baby's head on your shoulder, belly hold face-down across your forearm (helps with gas). Wash hands before handling baby and ask others to do the same. Limit visitors, especially during cold/flu season.",
      
      "Normal Newborn Behaviors\nMany newborn traits worry parents unnecessarily. Sneezing, hiccups, and trembling are normal reflexes. Spitting up small amounts after feeding is common—reflux improves with time. Newborn acne appears around 2-4 weeks and clears without treatment. Cradle cap (yellowish, scaly patches on scalp) is harmless—gently wash with baby shampoo. Eyes may cross occasionally as vision develops. Breathing may be irregular, with brief pauses up to 10 seconds—normal unless accompanied by blue color.",
      
      "When to Call the Pediatrician\nContact doctor immediately for: rectal temperature over 100.4°F, unusual lethargy or difficulty waking, refusing to eat for several feedings, fewer than 6 wet diapers daily after first week, yellow skin or eyes (jaundice), persistent vomiting or diarrhea, bleeding or discharge from umbilical cord, redness or swelling of eyes, unusual rash or skin changes, difficulty breathing or blue color around lips. Trust your instincts—if something feels wrong, call. Pediatricians expect calls from concerned parents.",
      
      "Taking Care of Yourself\nNewborn care is exhausting. Accept help with household tasks. Sleep when baby sleeps, even short naps. Eat regularly—keep easy snacks accessible. Stay hydrated. Don't expect perfection—you're learning together. It's okay to put baby in a safe place (crib or bassinet) and take a break when overwhelmed. Join parent support groups for emotional connection. Remember: the first month is survival mode, and it gets easier as you and baby learn each other's rhythms."
    ]
  },
  "10": {
    id: 10,
    category: "Newborn Health",
    title: "Recognizing Illness in Newborns",
    image: "https://images.pexels.com/photos/8491929/pexels-photo-8491929.jpeg?w=800&auto=format&fit=crop",
    readTime: "7 min read",
    date: "November 22, 2025",
    author: "Pediatric Health Specialists",
    images: [
      {
        url: "https://www.cdc.gov/vaccines/images/infant-receiving-vaccination.jpg",
        alt: "Healthcare provider administering vaccine to infant",
        credit: "Image from CDC - Centers for Disease Control and Prevention",
        creditLink: "https://www.cdc.gov/vaccines/",
        position: 2
      },
      {
        url: "https://www.nichd.nih.gov/sites/default/files/inline-images/pediatrician-examining-newborn.jpg",
        alt: "Pediatrician performing newborn health examination",
        credit: "Image from NICHD - National Institute of Child Health and Human Development",
        creditLink: "https://www.nichd.nih.gov/",
        position: 5
      },
      {
        url: "https://images.pexels.com/photos/7282810/pexels-photo-7282810.jpeg?auto=compress&cs=tinysrgb&w=1200",
        alt: "Parent monitoring newborn's health at home",
        credit: "Photo by Ketut Subiyanto on Pexels",
        creditLink: "https://www.pexels.com/@ketut-subiyanto",
        position: 8
      }
    ],
    content: [
      "Newborns have immature immune systems, making them vulnerable to infections. Learning to recognize signs of illness helps you seek timely medical care when needed.",
      
      "Fever in Newborns: Always Serious\nAny fever in a baby under 3 months old requires immediate medical evaluation. Take rectal temperature—the most accurate method for newborns. A temperature of 100.4°F (38°C) or higher is a fever. Never give fever-reducing medication without doctor guidance in newborns. Fever in this age group can indicate serious infection requiring immediate treatment. Don't delay—go to emergency room or call pediatrician immediately even if it's the middle of the night.",
      
      "Respiratory Distress Signs\nNewborns breathe irregularly, sometimes pausing briefly, but watch for concerning signs: breathing faster than 60 breaths per minute, grunting sounds with each breath, flaring nostrils, chest retractions (skin pulling in between or below ribs), blue or gray color around lips or face, persistent coughing or wheezing. These signs require immediate medical attention. Respiratory infections can deteriorate quickly in newborns.",
      
      "Feeding and Hydration Changes\nRefusing to eat or eating significantly less than normal for multiple feedings is concerning. Watch for signs of dehydration: fewer than 6 wet diapers per day after first week, dark yellow or concentrated urine, dry mouth, no tears when crying, sunken soft spot on head, lethargy. Excessive vomiting (different from normal spit-up) or diarrhea can quickly dehydrate newborns. Projectile vomiting after every feeding may indicate pyloric stenosis, requiring surgical correction.",
      
      "Jaundice Monitoring\nMild jaundice (yellowing of skin and eyes) is common in newborns, peaking around days 3-5. However, severe or worsening jaundice needs evaluation. Check by pressing gently on baby's forehead or chest—skin should briefly turn white. If it looks yellow, contact pediatrician. Severe jaundice can cause brain damage if untreated. Treatment is simple—phototherapy (special lights) breaks down excess bilirubin. Ensure baby feeds well, as this helps eliminate bilirubin.",
      
      "Neurological Warning Signs\nExcessive sleepiness or difficulty waking baby for feedings is concerning. Babies should wake for feeds every 2-4 hours. Stiffness, limpness, or weak muscle tone differs from normal newborn muscle tone. Unusual movements including jerking, trembling that doesn't stop when you hold the limb, or twitching may indicate seizures. Bulging soft spot when baby is upright and calm suggests increased intracranial pressure. High-pitched crying that's different from normal crying patterns needs evaluation.",
      
      "Skin Changes and Rashes\nMost newborn rashes are harmless (baby acne, erythema toxicum, milia), but some require attention. Contact doctor for: rash with fever, blisters or pus-filled bumps, rash that looks like bruises or purple spots that don't fade when pressed, red streaks from umbilical cord or circumcision site, severe diaper rash that doesn't improve with treatment, hives or allergic reaction. Impetigo, a bacterial skin infection, shows honey-colored crusted sores and needs antibiotic treatment.",
      
      "Umbilical Cord and Circumcision Infections\nUmbilical cord area should stay clean and dry. Warning signs include: red, swollen skin around cord base, foul-smelling drainage, bleeding more than a few drops, yellow discharge. For circumcised boys, slight swelling and yellow crust formation are normal during healing (7-10 days). Concerning signs include: increasing redness, swelling, foul odor, pus, bleeding that doesn't stop with gentle pressure, inability to urinate. Both infections need antibiotic treatment.",
      
      "Abnormal Stool and Urine\nBlack, tarry stools after first few days, bright red blood in stool, white or clay-colored stools, or persistent green, watery diarrhea need evaluation. Normal newborn stool varies from yellow-seedy (breastfed) to tan-yellow (formula-fed). Hard, pellet-like stools indicate constipation—rare in breastfed babies, more common with formula. Urine should be pale yellow. Dark urine, blood in urine, or crying during urination (suggesting UTI) require medical attention.",
      
      "Lethargy and Behavioral Changes\nNewborns sleep a lot but should wake for feedings and have alert periods. Excessive sleepiness, weak cry, lack of interest in feeding, or seeming 'floppy' when held indicate illness. Alternatively, extreme irritability, inconsolable crying for hours, or high-pitched cry differs from normal fussiness. Behavioral changes often accompany infections before other obvious symptoms appear. Trust your parental instinct—you know your baby's normal patterns.",
      
      "Preventive Measures\nProtect your newborn from illness: limit visitors for first few weeks, require everyone to wash hands before holding baby, avoid crowded places during cold/flu season, keep baby away from anyone with cold, flu, or fever sores, ensure baby gets recommended vaccines on schedule, practice safe sleep to reduce SIDS risk, exclusively breastfeed if possible (breast milk provides antibodies). Don't be afraid to ask visitors with symptoms to postpone visits—baby's health comes first.",
      
      "When in Doubt, Call\nPediatricians expect calls from new parents. It's better to call about something minor than miss a serious problem. Most offices have 24-hour nurse lines. For non-emergency questions, call during office hours. For fever in newborn under 3 months, difficulty breathing, lethargy, or other emergency signs, call immediately or go to ER. Keep pediatrician's number and nearest children's hospital location easily accessible. As you gain experience, you'll become more confident distinguishing normal from concerning—but err on the side of caution with newborns."
    ]
  },
  "11": {
    id: 11,
    category: "Baby Development",
    title: "Baby Development: Months 2-4",
    image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&auto=format&fit=crop",
    readTime: "8 min read",
    date: "November 5, 2025",
    author: "Pediatric Development Team",
    images: [
      {
        url: "https://images.unsplash.com/photo-1566004100631-35d015d6a491?w=1200&auto=format&fit=crop",
        alt: "Baby showing social development milestones",
        credit: "Photo by Isaac Quesada on Unsplash",
        creditLink: "https://unsplash.com/@isaacquesada",
        position: 2
      }
    ],
    content: [
      "The first few months bring rapid developmental changes. Your baby transforms from a newborn into an interactive, social little person.",
      "Month 2: Emerging Social Skills\nBy two months, babies become more alert and responsive. They track objects with their eyes and follow movement. Social smiles emerge around 6-8 weeks. They start cooing and may respond to loud noises. Neck muscles strengthen during tummy time.",
      "Month 3: Growing Strength\nThree-month-olds show dramatic motor skill improvements. They hold their head steady when supported and push up during tummy time. Hand-eye coordination develops. Cooing becomes more frequent. They recognize familiar faces.",
      "Month 4: Interactive and Playful\nFour months marks increased engagement. Babies laugh out loud and enjoy playing. Reaching becomes more deliberate. Many babies can roll from tummy to back. Vision improves significantly. Sleep patterns often become more predictable."
    ]
  },
  "12": {
    id: 12,
    category: "Baby Development",
    title: "Baby Development: Months 5-8",
    image: "https://images.unsplash.com/photo-1607006095938-615c0ac25043?w=800&auto=format&fit=crop",
    readTime: "9 min read",
    date: "November 3, 2025",
    author: "Pediatric Development Team",
    images: [],
    content: [
      "Months 5-8 bring remarkable mobility and independence. Your baby transitions to sitting, reaching, grasping, and possibly crawling.",
      "Month 5-6: Rolling and Sitting\nMost babies can roll both ways and begin sitting with support. Around six months, solid foods can be introduced. Object permanence begins developing.",
      "Month 7-8: Mobility Increases\nSeven-month-olds become increasingly mobile through scooting or crawling. Some pull to standing. Pincer grasp develops. Babbling becomes complex with consonant-vowel combinations."
    ]
  },
  "13": {
    id: 13,
    category: "Baby Development",
    title: "Baby Development: Months 9-12",
    image: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&auto=format&fit=crop",
    readTime: "10 min read",
    date: "November 1, 2025",
    author: "Pediatric Development Team",
    images: [],
    content: [
      "The transition from baby to toddler happens during months 9-12, bringing first words and steps for some.",
      "Month 9-10: Problem Solving\nNine-month-olds understand cause and effect. They explore everything, pointing emerges, and imitation becomes sophisticated.",
      "Month 11-12: First Birthday\nBy their first birthday, many babies take first steps. Vocabulary may include 1-3 words. They follow simple directions and enjoy pretend play."
    ]
  },
  "14": {
    id: 14,
    category: "Mental Health",
    title: "Understanding Postpartum Depression",
    image: "https://images.unsplash.com/photo-1516302752625-fcc3c50ae61f?w=800&auto=format&fit=crop",
    readTime: "10 min read",
    date: "October 28, 2025",
    author: "Perinatal Mental Health Specialists",
    images: [],
    content: [
      "Postpartum depression affects 1 in 7 new mothers. Understanding PPD is the first step toward recognition, treatment, and recovery.",
      "What is PPD?\nPPD is a serious mental health condition occurring after childbirth. It differs from baby blues and interferes with daily functioning and bonding.",
      "Treatment is Highly Effective\nTherapy, medication, and support groups show excellent results. With proper treatment, most women fully recover."
    ]
  },
  "15": {
    id: 15,
    category: "Mental Health",
    title: "Managing Anxiety During Pregnancy",
    image: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=800&auto=format&fit=crop",
    readTime: "8 min read",
    date: "October 25, 2025",
    author: "Perinatal Mental Health Specialists",
    images: [],
    content: [
      "Pregnancy can trigger significant anxiety. Understanding and managing it ensures both your wellbeing and baby's healthy development.",
      "Cognitive Strategies\nCBT techniques identify and challenge anxious thoughts. Replace catastrophic thinking with realistic assessment.",
      "When to Seek Help\nIf anxiety interferes with daily functioning or you experience panic attacks, consult a mental health professional."
    ]
  },
  "16": {
    id: 16,
    category: "Mental Health",
    title: "Coping Strategies for Perinatal Mental Health",
    image: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&auto=format&fit=crop",
    readTime: "9 min read",
    date: "October 22, 2025",
    author: "Perinatal Mental Health Specialists",
    images: [],
    content: [
      "The perinatal period presents unique mental health challenges. These evidence-based coping strategies help navigate this transformative time.",
      "Build Support Networks\nSocial support is the most protective factor. Identify support people before crisis hits.",
      "Practice Self-Compassion\nTreat yourself with kindness. Replace self-criticism with understanding."
    ]
  },
  "17": {
    id: 17,
    category: "Pregnancy Complications",
    title: "Understanding Gestational Diabetes",
    image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&auto=format&fit=crop",
    readTime: "9 min read",
    date: "October 20, 2025",
    author: "Maternal-Fetal Medicine Team",
    images: [],
    content: [
      "Gestational diabetes affects 6-9% of pregnancies. Proper management ensures healthy outcomes for mother and baby.",
      "Managing Through Diet\nDiet is the cornerstone of management. Choose complex carbs and pair with protein and healthy fats.",
      "After Delivery\nBlood sugar typically returns to normal after delivery, but lifetime diabetes risk increases."
    ]
  },
  "18": {
    id: 18,
    category: "Pregnancy Complications",
    title: "Preeclampsia: Recognition and Management",
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop",
    readTime: "8 min read",
    date: "October 18, 2025",
    author: "Maternal-Fetal Medicine Team",
    images: [],
    content: [
      "Preeclampsia is a serious complication with high blood pressure after 20 weeks. Early recognition and management are critical.",
      "Warning Signs\nPersistent headaches, vision changes, upper abdominal pain, sudden swelling require immediate evaluation.",
      "Delivery is the Cure\nThe only cure is delivering the baby. Close monitoring allows safe pregnancy continuation when mild."
    ]
  },
  "19": {
    id: 19,
    category: "Partner Support",
    title: "Partner Support During Pregnancy",
    image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&auto=format&fit=crop",
    readTime: "10 min read",
    date: "November 10, 2025",
    author: "Family Support Specialists",
    images: [
      {
        url: "https://images.unsplash.com/photo-1578946956088-940880540823?w=1200&auto=format&fit=crop",
        alt: "Expecting couple attending prenatal appointment together",
        credit: "Photo by Dragana Gordic on Unsplash",
        creditLink: "https://unsplash.com/@dragangordic",
        position: 2
      },
      {
        url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=1200&auto=format&fit=crop",
        alt: "Partner supporting pregnant person during medical check",
        credit: "Photo by Hisu lee on Unsplash",
        creditLink: "https://unsplash.com/@lee_hisu",
        position: 5
      }
    ],
    content: [
      "Supporting your partner through pregnancy is one of the most meaningful ways to strengthen your relationship and prepare for parenthood together. Non-birthing partners play a crucial role in the pregnancy journey, even though they aren't experiencing the physical changes firsthand.",
      
      "Understanding the Physical Journey\nYour partner's body is undergoing remarkable changes every day. Morning sickness, fatigue, hormonal fluctuations, and physical discomfort are real and can be overwhelming. Educate yourself about each trimester's changes so you can anticipate needs and offer appropriate support. Read pregnancy books, attend prenatal appointments, and ask questions to understand what's happening.",
      
      "Emotional Support Matters Most\nPregnancy brings a rollercoaster of emotions - excitement, anxiety, fear, joy, and uncertainty often all in the same day. Listen without trying to fix everything. Sometimes your partner just needs you to acknowledge their feelings without judgment. Validate their experiences, even if you don't fully understand them. Simple phrases like 'That sounds really hard' or 'I'm here for you' can mean everything.",
      
      "Attend Prenatal Appointments\nBeing present at medical appointments shows commitment and allows you to ask questions, hear the baby's heartbeat, see ultrasound images, and stay informed about your partner's health. Take time off work if needed - these moments are irreplaceable. Take notes during appointments so your partner doesn't have to remember everything.",
      
      "Help with Daily Tasks\nFatigue during pregnancy can be debilitating, especially in the first and third trimesters. Take on more household responsibilities without being asked. Cook meals, do laundry, clean the house, run errands, and handle tasks that require bending or heavy lifting. Don't wait to be told what needs doing - observe and take initiative.",
      
      "Prepare Together\nAttend childbirth classes, tour the hospital or birth center, help set up the nursery, research baby gear, and create a birth plan together. Being involved in preparation helps you feel more connected to the process and better prepared for parenthood. Read books about newborn care and discuss parenting philosophies so you're aligned.",
      
      "Respect Food Aversions and Cravings\nPregnancy can completely change taste preferences. If your partner suddenly can't stand the smell of coffee or desperately needs pickles at midnight, respond with compassion not criticism. Keep snacks available and be flexible about meal planning. Don't take it personally if foods you cook suddenly become unappealing.",
      
      "Physical Comfort Support\nOffer foot massages, back rubs, help with putting on shoes as the belly grows, adjust pillows for better sleep, and run warm baths. Physical discomfort increases as pregnancy progresses, and small gestures of physical care can provide significant relief.",
      
      "Create Special Moments\nPregnancy goes by quickly despite feeling long at times. Plan date nights, take belly photos together, talk to the baby, create playlists for labor, and find ways to celebrate this unique time in your relationship. These memories will be treasured for years.",
      
      "Educate Yourself About Birth\nUnderstand the stages of labor, learn comfort measures and breathing techniques, know the signs of labor, understand pain management options, and be prepared to advocate for your partner's wishes during delivery. Being a knowledgeable birth partner reduces your anxiety and increases your usefulness during labor.",
      
      "Manage Your Own Anxiety\nIt's normal to feel nervous about becoming a parent. Talk to other parents, consider counseling if anxiety feels overwhelming, exercise and maintain your own health, and remember that feeling unprepared is universal - no one truly feels ready for parenthood.",
      
      "Remember: Your support during pregnancy sets the foundation for co-parenting. The care, attention, and partnership you provide now establish patterns that will serve your family well long after the baby arrives. Your involvement matters more than you know."
    ]
  },
  "20": {
    id: 20,
    category: "Partner Support",
    title: "Supporting Your Partner Postpartum",
    image: "https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=800&auto=format&fit=crop",
    readTime: "11 min read",
    date: "November 8, 2025",
    author: "Postpartum Care Specialists",
    images: [
      {
        url: "https://images.unsplash.com/photo-1492725764893-90b379c2b6e7?w=1200&auto=format&fit=crop",
        alt: "Partner caring for newborn while supporting postpartum parent",
        credit: "Photo by Garrett Jackson on Unsplash",
        creditLink: "https://unsplash.com/@garrettjackson",
        position: 3
      },
      {
        url: "https://images.unsplash.com/photo-1516302752625-fcc3c50ae61f?w=1200&auto=format&fit=crop",
        alt: "New parents working together during postpartum period",
        credit: "Photo by Derek Thomson on Unsplash",
        creditLink: "https://unsplash.com/@derekthomson",
        position: 7
      }
    ],
    content: [
      "The postpartum period - often called the 'fourth trimester' - is a critical time when your partner needs support more than ever. While everyone focuses on the new baby, the birthing parent is recovering from one of the most physically demanding experiences of their life while learning to care for a newborn. Your role as a supportive partner is absolutely essential.",
      
      "Understand Postpartum Recovery\nBirth is physically traumatic regardless of whether it was vaginal or cesarean. Your partner is healing from significant tissue damage, hormonal shifts, sleep deprivation, and emotional adjustment. Recovery takes weeks, not days. Vaginal birth may involve stitches, hemorrhoids, and pelvic floor weakness. C-section recovery involves major abdominal surgery with a 6-8 week healing timeline. Either way, your partner needs rest, nutrition, and support.",
      
      "Take Maximum Parental Leave\nUse every day of leave available. The first weeks are the hardest - exhaustion peaks, breastfeeding establishes, routines form, and your partner needs hands-on help. If leave is limited, consider staggering with your partner so support continues longer. This time is an investment in your family's wellbeing and your bond with your baby.",
      
      "Manage Visitors and Boundaries\nProtect your partner from being overwhelmed by well-meaning visitors. Ask guests to bring meals, keep visits short (30 minutes or less in early weeks), require advance notice before coming over, and don't hesitate to say no to visitors if your partner needs rest. You are the gatekeeper - use that power to protect your partner's recovery.",
      
      "Take On Household Management\nYour partner's only job should be recovering and feeding the baby. You handle everything else. This includes cooking all meals, cleaning, laundry, dishes, grocery shopping, paying bills, and responding to messages. Hire help if you can afford it - housekeeping services, meal delivery, or a postpartum doula can be invaluable.",
      
      "Support Feeding\nWhether your partner is breastfeeding, pumping, formula feeding, or combination feeding, your support matters. For breastfeeding: bring water and snacks during feeds, learn proper latch technique to help troubleshoot, attend lactation appointments, burp and change the baby afterward. For bottle feeding: prepare bottles, wash pump parts, share nighttime feedings, warm bottles properly.",
      
      "Take Night Duty Seriously\nEven if your partner is breastfeeding, you can help at night. Bring baby to your partner for feeds, change diapers before and after, put baby back to sleep, handle any settling needed, and let your partner sleep. If bottle feeding, split nights - you take first half, partner takes second, or alternate nights entirely.",
      
      "Watch for Postpartum Depression and Anxiety\nUp to 20% of new parents experience postpartum depression or anxiety. Warning signs include persistent sadness or crying, anxiety or panic attacks, difficulty bonding with baby, thoughts of harming self or baby, inability to sleep even when baby sleeps, feelings of failure or hopelessness. If you notice these signs, talk to your partner with compassion and help them get professional support immediately. Postpartum mood disorders are medical conditions, not character flaws.",
      
      "Encourage Rest and Recovery\nSleep deprivation is a serious health issue. Encourage naps when the baby sleeps, take the baby for walks so your partner can rest undisturbed, handle night duties when possible, and don't expect your partner to entertain you or maintain previous household standards. Rest is not laziness - it's essential for physical healing and mental health.",
      
      "Validate All Feelings\nPostpartum emotions are intense and unpredictable due to hormones, exhaustion, and adjustment. Your partner might cry over small things, feel overwhelmed by love, experience regret or ambivalence, mourn their pre-baby life, or feel inadequate. Listen without judgment, validate their feelings ('That sounds really hard'), and remind them they're doing great even when it doesn't feel that way.",
      
      "Bond With Your Baby\nYour relationship with your baby is separate from your partner's. Do skin-to-skin contact, talk and sing to your baby, take baby wearing seriously, learn diaper changing and bathing, become an expert in your baby's cues and needs. Don't rely on your partner to interpret the baby for you - develop your own connection and confidence.",
      
      "Maintain Household Support\nAs the acute postpartum period ends, don't suddenly stop helping. Gradually return to shared responsibilities as your partner heals, but remember that childcare is work. When you're both home, childcare and household tasks should be split. If you're working outside the home and your partner is home with baby, remember that caring for an infant all day is exhausting work - come home ready to share responsibilities, not to relax while your partner continues working.",
      
      "Take Care of Yourself\nYou can't support your partner if you're burned out. Sleep when you can, eat nutritious food, maintain basic hygiene, ask for help from family or friends, consider your own therapy or support group for new parents, and communicate with your partner about how you're doing too. Postpartum adjustment is challenging for all parents, not just birthing parents.",
      
      "Remember: The postpartum period is temporary but foundational. The support, partnership, and care you provide now build the framework for your family's future. Your partner will remember how you showed up during this vulnerable time. Be the partner they need, and you'll strengthen your relationship while creating a healthy environment for your child."
    ]
  },
  "21": {
    id: 21,
    category: "Infant Nutrition",
    title: "Introducing Solids: A Complete Guide",
    image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&auto=format&fit=crop",
    readTime: "10 min read",
    date: "November 5, 2025",
    author: "Pediatric Nutrition Team",
    images: [
      {
        url: "https://images.unsplash.com/photo-1490725763681-25e578fca2c7?w=1200&auto=format&fit=crop",
        alt: "Baby eating first solid foods in high chair",
        credit: "Photo by Aditya Romansa on Unsplash",
        creditLink: "https://unsplash.com/@adityaromansa",
        position: 2
      },
      {
        url: "https://images.unsplash.com/photo-1519889959834-c7c64c21a0e4?w=1200&auto=format&fit=crop",
        alt: "Variety of healthy first foods for babies",
        credit: "Photo by Randy Fath on Unsplash",
        creditLink: "https://unsplash.com/@randyfath",
        position: 6
      }
    ],
    content: [
      "Starting solid foods is an exciting milestone in your baby's development. Most babies are ready to begin solids around 6 months of age, though readiness signs matter more than the exact date on the calendar. This guide will help you navigate this important transition with confidence.",
      
      "Signs of Readiness for Solids\nYour baby should show several signs before starting solids: can sit up with minimal support, has good head and neck control, shows interest in food (reaches for your food, watches you eat), has lost the tongue-thrust reflex that automatically pushes food out, can move food to the back of mouth and swallow. All these signs typically align around 6 months. Starting earlier can increase allergy and choking risks.",
      
      "First Foods to Offer\nTraditional first foods like iron-fortified infant cereal, pureed vegetables (sweet potato, butternut squash, peas), pureed fruits (banana, avocado, apple), and pureed meats (chicken, beef) are all excellent choices. You can also practice baby-led weaning by offering soft, graspable foods like banana spears, roasted sweet potato wedges, or soft-cooked broccoli florets. There's no required order - you can start with vegetables, fruits, grains, or proteins.",
      
      "Baby-Led Weaning vs. Purees\nBaby-led weaning (BLW) means offering whole foods baby can self-feed instead of spoon-feeding purees. Benefits include developing motor skills, encouraging independence, and reducing picky eating. Traditional puree feeding allows more control over intake and may feel safer for anxious parents. Many families do a combination approach - offering both purees and finger foods. Choose the method that feels right for your family.",
      
      "Texture Progression\nStart with smooth purees or very soft foods. Around 7-8 months, introduce slightly thicker textures and small, soft lumps. By 9-10 months, most babies can handle minced or finely chopped foods. By 12 months, babies can typically eat most family foods cut appropriately. Progress at your baby's pace - some babies advance quickly, others need more time with smoother textures.",
      
      "How Much to Feed\nAt first, solids are practice, not primary nutrition. Breast milk or formula remains the main source of nutrition through the first year. Start with 1-2 tablespoons once a day, gradually increasing to 3 meals a day with snacks by 8-9 months. Watch for fullness cues like turning head away, closing mouth, or pushing food away. Never force feeding - babies are excellent at self-regulating intake.",
      
      "Feeding Schedule Sample\n6-7 months: 1-2 small meals daily plus breast milk/formula on demand. 7-9 months: 2-3 small meals plus snacks, with breast milk/formula 4-6 times daily. 9-12 months: 3 meals plus 1-2 snacks, with breast milk/formula 3-4 times daily. 12+ months: 3 meals plus 2 snacks, continuing breast milk/formula as desired.",
      
      "Choking Prevention\nAlways supervise eating. Avoid choking hazards including whole grapes (cut into quarters), whole cherry tomatoes (cut into quarters), hot dogs (cut lengthwise and into small pieces), hard raw vegetables (cook until soft), nuts (can offer nut butters thinly spread), popcorn, hard candy, and large chunks of meat or cheese. Learn infant CPR before starting solids.",
      
      "Managing the Mess\nEating is a sensory experience - expect mess! Use a splat mat under the high chair, let baby touch and explore food, dress baby in just a diaper or old clothes for meals, have damp cloths ready for cleanup, and remember that playing with food is actually important learning. Stay calm about mess - your reaction influences baby's relationship with food.",
      
      "Common Concerns\nRefusing food is normal - it can take 10-15 exposures before baby accepts a new food. Keep offering without pressure. Gagging looks alarming but is a protective reflex - stay calm and let baby work through it. Constipation can happen with solids - ensure adequate water intake and offer high-fiber foods like prunes. Preferring certain foods is normal - continue offering variety without forcing.",
      
      "Foods to Avoid Before Age One\nDo not give honey (botulism risk), cow's milk as main drink (breast milk or formula until 12 months), excessive salt or sugar, processed meats, raw or undercooked eggs, fish high in mercury (shark, swordfish), or unpasteurized cheeses. However, well-cooked eggs, properly prepared fish, and yogurt/cheese are fine before one year.",
      
      "Allergenic Foods - Early Introduction Recommended\nCurrent research shows introducing common allergens early (around 6 months) may reduce allergy risk. Introduce peanut butter, eggs, dairy, wheat, soy, tree nuts, fish, and shellfish one at a time every few days. Watch for reactions (rash, vomiting, difficulty breathing). If family history of severe allergies, consult your pediatrician before introduction.",
      
      "Remember: Starting solids is about exploration and learning, not achieving a certain intake. Trust your baby's appetite, offer nutritious options without pressure, and enjoy this messy, fun milestone together!"
    ]
  },
  "22": {
    id: 22,
    category: "Infant Nutrition",
    title: "Safe Allergen Introduction: Evidence-Based Guide",
    image: "https://images.unsplash.com/photo-1587049016823-69c2f2bb86c8?w=800&auto=format&fit=crop",
    readTime: "9 min read",
    date: "November 3, 2025",
    author: "Pediatric Allergy Specialists",
    images: [
      {
        url: "https://images.unsplash.com/photo-1602172445704-f9f8ea0bc2f9?w=1200&auto=format&fit=crop",
        alt: "Common allergenic foods including peanuts, eggs, and dairy",
        credit: "Photo by Melissa Walker Horn on Unsplash",
        creditLink: "https://unsplash.com/@sugercoatit",
        position: 2
      }
    ],
    content: [
      "For years, parents were told to delay introducing allergenic foods until after age one or even three. Current research has completely reversed this guidance: early introduction of allergenic foods (starting around 6 months) may actually help prevent food allergies. This evidence-based guide will help you introduce allergens safely.",
      
      "The Science Behind Early Introduction\nGroundbreaking studies, including the LEAP study on peanut introduction, showed that early exposure to allergens significantly reduces allergy development. Babies' immune systems are learning which substances are safe. Early, repeated exposure teaches the immune system to tolerate common food proteins rather than treating them as threats. This window of opportunity is critical and shouldn't be missed.",
      
      "The Top 9 Allergenic Foods\nThese foods cause 90% of food allergies: peanuts, tree nuts (almonds, cashews, walnuts, etc.), milk/dairy, eggs, wheat, soy, fish, shellfish, and sesame. All should be introduced in age-appropriate forms starting around 6 months, once baby has tried a few basic first foods and shows readiness for solids.",
      
      "When to Start Allergen Introduction\nBegin around 6 months of age, once your baby shows readiness for solids (sitting with support, good head control, interest in food). Don't wait for baby to be eating solids perfectly - allergen introduction can begin alongside other first foods. If your baby has severe eczema or already has a diagnosed food allergy, consult an allergist before introducing allergens at home.",
      
      "How to Introduce Allergens Safely\nIntroduce one new allergen every 3-5 days. This spacing allows you to identify which food caused a reaction if one occurs. Offer the allergenic food at home, not at daycare or restaurants, so you can monitor for reactions. Introduce new allergens during daytime hours when medical offices are open. Give full servings (2 tablespoons for peanut products, 1 whole egg, etc.) - tiny tastes may not be enough to promote tolerance.",
      
      "Age-Appropriate Forms of Allergens\nPeanuts: smooth peanut butter thinned with water, breast milk, or formula; peanut puff snacks; peanut butter mixed into oatmeal. Tree nuts: smooth nut butters thinly spread, mixed into purees, or thinned for dipping. Eggs: well-cooked scrambled eggs, hard-boiled eggs mashed, egg mixed into other foods. Dairy: yogurt, cheese, milk mixed into foods. Wheat: bread, pasta, cereals. Soy: tofu, edamame mashed, soy yogurt. Fish/shellfish: fully cooked, flaked, boneless fish pieces; fully cooked, small pieces of shrimp.",
      
      "Recognizing Allergic Reactions\nMild reactions include new rash around mouth or body, few hives, mild itching, or mild belly discomfort. Moderate reactions include several hives, swelling, vomiting, or worsening eczema. Severe reactions (anaphylaxis) include difficulty breathing, swelling of lips/tongue/throat, pale skin, blue lips, significant drop in blood pressure, loss of consciousness. Severe reactions require immediate emergency care - call 911. For mild reactions, stop the food and contact your pediatrician.",
      
      "Common Myths About Allergen Introduction\nMyth: Waiting to introduce allergens prevents allergies. Fact: Delaying increases allergy risk. Myth: Don't give allergens if parent has allergies. Fact: Early introduction may be even more important for high-risk babies. Myth: A little bit of allergen is enough. Fact: Regular, sustained exposure in significant amounts is key. Myth: Once introduced, you don't need to offer it again. Fact: Continued regular exposure (2-3 times per week minimum) maintains tolerance.",
      
      "Creating an Allergen Introduction Schedule\nWeek 1: Introduce peanut butter. Week 2-3: Continue peanut 2-3x weekly, introduce egg. Week 3-4: Continue peanut and egg, introduce dairy (yogurt). Week 4-5: Continue previous, introduce wheat. Week 5-6: Continue previous, introduce soy. Continue adding allergens every few days until all are introduced. Once introduced, continue offering each allergen 2-3 times weekly to maintain tolerance.",
      
      "Special Considerations for High-Risk Babies\nBabies with severe eczema, existing food allergies, or strong family history of allergies are at higher risk. For these babies, early introduction is especially important but should be done under medical guidance. Your pediatrician or allergist may recommend introducing peanut products as early as 4-6 months after appropriate testing. Don't avoid allergens out of fear - avoidance increases risk.",
      
      "Maintaining Tolerance\nIntroduction isn't enough - regular exposure is essential. Once an allergen is introduced successfully, offer it 2-3 times per week minimum to maintain tolerance. This doesn't need to be complicated - peanut butter on toast, eggs for breakfast, cheese on pasta, etc. Irregular or infrequent exposure may not maintain tolerance.",
      
      "What If Reactions Occur\nIf mild reaction occurs: discontinue that food and contact your pediatrician. They may refer you to an allergist for testing. Don't automatically avoid related foods unless advised - for example, peanut allergy doesn't mean all nuts are unsafe. Follow up testing and oral food challenges under medical supervision can clarify true allergies versus tolerance issues.",
      
      "Remember: Early allergen introduction is one of the most evidence-based ways to prevent food allergies. Don't let fear keep you from protecting your child's future health. When in doubt, consult your pediatrician or a pediatric allergist for personalized guidance."
    ]
  },
  "23": {
    id: 23,
    category: "Infant Nutrition",
    title: "Picky Eating: Prevention and Management Strategies",
    image: "https://images.unsplash.com/photo-1609220136736-443140cffec6?w=800&auto=format&fit=crop",
    readTime: "9 min read",
    date: "November 1, 2025",
    author: "Pediatric Feeding Specialists",
    images: [
      {
        url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&auto=format&fit=crop",
        alt: "Toddler at mealtime exploring different foods",
        credit: "Photo by Anna Pelzer on Unsplash",
        creditLink: "https://unsplash.com/@annapelzer",
        position: 3
      }
    ],
    content: [
      "Picky eating is one of the most common concerns for parents of toddlers and young children. While some food selectivity is developmentally normal, extreme pickiness can impact nutrition and create family stress. Understanding why picky eating happens and how to respond can transform mealtimes from battlegrounds to positive experiences.",
      
      "Why Toddlers Become Picky Eaters\nPicky eating peaks between 18 months and 3 years for evolutionary reasons - newfound mobility meant toddlers needed caution about what they put in their mouths. Other factors include: natural neophobia (fear of new foods), asserting independence by refusing food, decreased growth rate and appetite, heightened sensory sensitivities, and control issues around eating. Understanding that pickiness is normal helps parents stay calm and respond appropriately.",
      
      "Prevention Strategies: Start Early\nOffer variety from the beginning - expose babies to many flavors and textures during first year. Practice baby-led weaning to allow self-feeding and exploration. Eat meals together as a family - children model what they see. Avoid pressure, bribing, or making separate 'kid meals' - these actually increase pickiness. Maintain neutral responses to all foods - don't label foods 'good' or 'bad.' Keep offering rejected foods without pressure - acceptance often takes 10-15+ exposures.",
      
      "The Division of Responsibility\nFeeding expert Ellyn Satter's Division of Responsibility framework reduces conflict: Parents decide WHAT foods are offered, WHEN meals and snacks happen, and WHERE eating occurs. Children decide WHETHER to eat and HOW MUCH to eat. Trusting children to regulate their own intake reduces power struggles and promotes healthy eating behaviors long-term.",
      
      "Creating a Positive Mealtime Environment\nServe family-style meals where everyone eats the same foods. Sit together for meals without screens or distractions. Keep meals relatively short (20-30 minutes) and end when child is done, not when plate is clean. Offer at least one familiar food alongside new foods so child isn't faced with entirely unfamiliar meal. Involve children in food prep - kids are more likely to try foods they helped prepare. Stay calm and neutral about what child eats or doesn't eat.",
      
      "Exposure Without Pressure\nKeep offering foods child has rejected - repeated exposure increases acceptance. Don't force, pressure, bribe, or punish. Encouraging even looking at, touching, or smelling new foods is progress. Let child see YOU eating and enjoying all foods. Describe foods neutrally ('this is crunchy' rather than 'you'll love this'). Allow child to spit out food they don't like without comment.",
      
      "Addressing Sensory Sensitivities\nSome pickiness stems from sensory processing differences. Children may be sensitive to: texture (aversion to mushy, slimy, or mixed textures), temperature (only eating foods at specific temperatures), color (refusing foods of certain colors), or smell (overwhelmed by strong food odors). Respect genuine sensory issues while gently encouraging exposure. Occupational therapy can help children with significant sensory feeding challenges.",
      
      "What NOT to Do\nAvoid these common mistakes that worsen pickiness: Don't short-order cook separate meals for picky eaters. Don't force, bribe, or reward eating ('three more bites for dessert'). Don't label child as 'picky eater' in front of them. Don't show frustration or make eating a battle. Don't restrict access to preferred foods to force eating disliked foods. Don't use dessert as reward - this makes sweets more desirable and vegetables less.",
      
      "Nutritional Adequacy Despite Pickiness\nMost picky eaters get adequate nutrition even with limited variety. Offer multivitamin if concerned, but most aren't necessary. Focus on what child DOES eat over days/weeks, not individual meals. Ensure regular meal and snack times so child comes to table hungry. Offer full-fat dairy, nut butters, and calorie-dense foods if weight gain is concern. Consult pediatrician if child is losing weight, eating fewer than 20 foods, has nutritional deficiencies, or shows extreme anxiety around food.",
      
      "Making Meals Less Stressful\nLower your expectations - not every meal needs to be perfect. Celebrate small wins like touching new food or taking a tiny taste. Remember that appetite varies day to day. Avoid commenting on how much child eats or doesn't eat. Stay calm even if child eats nothing - they won't starve from missing one meal. Focus on making mealtimes pleasant, not on intake.",
      
      "Expanding Food Variety Gradually\nOffer new foods alongside accepted foods. Present tiny portions of new foods to make them less intimidating. Try different preparations of rejected foods - raw, cooked, roasted, pureed, etc. Use familiar vehicles - if child loves pasta, add small amounts of vegetables to pasta dishes. Make food exploration playful - let child help shop, prep, cook, and serve food.",
      
      "When to Seek Professional Help\nConsult pediatrician, dietitian, or feeding therapist if: child eats fewer than 20 different foods, child eliminates entire food groups, mealtimes involve extreme anxiety or meltdowns, child is losing weight or not growing, eating is impacting social situations significantly, you suspect sensory processing disorder, or feeding issues are causing family stress and conflict.",
      
      "Remember: Picky eating is a phase for most children. Staying calm, avoiding pressure, and trusting your child's appetite is the best approach. Your job is to offer nutritious foods regularly; their job is to decide what and how much to eat. Most picky eaters grow into adults with varied, healthy diets."
    ]
  },
  "24": {
    id: 24,
    category: "Baby Sleep",
    title: "Baby Sleep Training Methods: Complete Guide",
    image: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&auto=format&fit=crop",
    readTime: "12 min read",
    date: "October 28, 2025",
    author: "Pediatric Sleep Consultants",
    images: [
      {
        url: "https://images.unsplash.com/photo-1520483601346-d666e35df36c?w=1200&auto=format&fit=crop",
        alt: "Peaceful baby sleeping in crib",
        credit: "Photo by Picsea on Unsplash",
        creditLink: "https://unsplash.com/@picsea",
        position: 2
      },
      {
        url: "https://images.unsplash.com/photo-1531353826977-0941b4779a1c?w=1200&auto=format&fit=crop",
        alt: "Parent establishing bedtime routine with baby",
        credit: "Photo by Jordan Whitt on Unsplash",
        creditLink: "https://unsplash.com/@jwwhitt",
        position: 7
      }
    ],
    content: [
      "Sleep training is one of the most debated topics in parenting. While some swear by it, others oppose any form of sleep training. This comprehensive guide covers various sleep training methods, allowing you to make an informed decision based on your family's needs, values, and circumstances.",
      
      "What is Sleep Training?\nSleep training teaches babies to fall asleep independently without extensive parental intervention. The goal is self-soothing - baby's ability to fall asleep without being rocked, fed, or held, and to return to sleep independently during normal night wakings. Sleep training is NOT ignoring baby's needs, forced independence, or harmful to attachment. It's teaching a valuable life skill within a secure, loving relationship.",
      
      "Is Your Baby Ready for Sleep Training?\nMost experts recommend waiting until at least 4-6 months when: baby weighs at least 14-15 pounds, can go longer stretches without feeding, has no medical issues affecting sleep, and shows developmental readiness for self-soothing. Earlier than 4 months, babies often genuinely need nighttime feeds and comfort. After 6 months, sleep training often becomes easier as babies are developmentally ready. Always consult your pediatrician before starting.",
      
      "Pre-Sleep Training Essentials\nBefore any sleep training method, establish these foundations: consistent bedtime routine (bath, book, song, etc.), appropriate wake windows for age, dark, cool sleep environment (68-72°F), white noise machine, safe sleep space (crib or bassinet), age-appropriate nap schedule, full tummy before bed (last feed before sleep).",
      
      "Method 1: Cry It Out (CIO) / Extinction\nHow it works: Put baby in crib awake, say goodnight, leave room, and don't return until morning or scheduled night feed. Pros: often works quickly (3-7 days), clear and consistent. Cons: emotionally difficult for parents, not suitable for all babies or families. Best for: parents who struggle with consistency in gentler methods, babies who escalate crying when parents check on them. Not recommended for: babies under 6 months, medically fragile babies, or parents uncomfortable with crying.",
      
      "Method 2: Ferber Method / Graduated Extinction\nHow it works: Put baby in crib awake and leave room. Return at increasing intervals (3 min, 5 min, 10 min, etc.) to briefly reassure without picking up. Repeat until baby sleeps. Pros: provides parental reassurance, often effective within 3-7 days, less extreme than full CIO. Cons: some babies escalate when parents check, can confuse some babies. Best for: parents who want to sleep train but find pure CIO too difficult, babies who respond well to parental reassurance.",
      
      "Method 3: Chair Method / Sleep Lady Shuffle\nHow it works: Sit in chair next to crib while baby falls asleep. Every few nights, move chair farther from crib until you're outside the room. Provide reassurance without picking up. Pros: gentle transition, parents remain present, works well for anxious babies or parents. Cons: takes longer (2-3 weeks), requires significant time commitment. Best for: parents prioritizing gentleness over speed, babies with separation anxiety.",
      
      "Method 4: Pick Up, Put Down (PUPD)\nHow it works: Pick up baby when crying, soothe until calm, put back down while awake. Repeat as needed until baby sleeps. Pros: very responsive, no sustained crying, builds trust. Cons: can take weeks or months, physically exhausting, may frustrate some babies. Best for: younger babies (4-6 months), parents uncomfortable with any crying, babies who respond well to physical comfort.",
      
      "Method 5: Fading Method\nHow it works: Gradually reduce sleep associations (rocking, feeding, holding) by doing them less intensely or for shorter periods over time. Pros: gentle and gradual, maintains closeness, flexible approach. Cons: takes longest (weeks to months), requires patience and consistency. Best for: parents wanting very gradual approach, families practicing attachment parenting principles.",
      
      "Method 6: No-Cry Solution\nHow it works: Focus on gentle techniques including dream feeds, swaddling transitions, gradual routine changes, and responding immediately to cries while gradually teaching self-soothing. Pros: no sustained crying, maintains responsive parenting, respectful of baby's emotional needs. Cons: can take months, may not work for all babies, requires significant parental presence. Best for: parents philosophically opposed to cry-based methods.",
      
      "Common Sleep Training Mistakes\nInconsistency - switching methods or giving up too soon undermines progress. Starting during developmental leaps, teething, or illness. Not addressing sleep environment issues. Unrealistic expectations about timeline or overnight success. Not having both parents on same page about approach. Sleep training naps and nights simultaneously (too overwhelming). Comparing your baby to others - all babies are different.",
      
      "Managing Sleep Regressions\nSleep regressions (4 months, 8 months, 12 months, 18 months, 2 years) are temporary disruptions caused by developmental leaps. During regressions: maintain consistency in routine and boundaries, offer extra daytime comfort, avoid creating new sleep associations, be patient - regressions typically last 2-4 weeks, consider adjusting schedule if wake windows have changed. Don't abandon sleep training during regressions - consistency helps baby return to good sleep faster.",
      
      "Handling Setbacks\nIllness, travel, time changes, and developmental changes can disrupt sleep. Respond to genuine needs during illness. Return to sleep training basics after travel. Gradually adjust for time changes. Remember that setbacks are normal and temporary. Stay calm and consistent - most babies return to good sleep quickly once disruption passes.",
      
      "When Sleep Training Doesn't Work\nIf sleep training fails after 2-3 weeks of consistency: consult pediatrician to rule out medical issues (reflux, allergies, sleep apnea), evaluate sleep schedule - over or undertiredness affects sleep, consider sleep environment factors, assess whether method fits your baby's temperament, seek professional help from pediatric sleep consultant.",
      
      "Remember: There is no 'right' method - the best approach is one that aligns with your family's values and your baby's temperament. Sleep training isn't required - some families prefer to wait for baby to naturally develop sleep skills. Whatever you choose, be consistent, stay informed, and trust your instincts as your baby's parent."
    ]
  },
  "25": {
    id: 25,
    category: "Baby Sleep",
    title: "Baby Sleep Schedules and Common Sleep Challenges by Age",
    image: "https://images.unsplash.com/photo-1519785448607-12c7d020f7bc?w=800&auto=format&fit=crop",
    readTime: "11 min read",
    date: "October 25, 2025",
    author: "Pediatric Sleep Specialists",
    images: [
      {
        url: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=1200&auto=format&fit=crop",
        alt: "Baby sleeping peacefully following age-appropriate schedule",
        credit: "Photo by Garrett Jackson on Unsplash",
        creditLink: "https://unsplash.com/@garrettjackson",
        position: 3
      }
    ],
    content: [
      "Understanding age-appropriate sleep needs and common challenges helps parents set realistic expectations and create schedules that work. While every baby is unique, these guidelines provide a framework for supporting healthy sleep development from newborn through toddlerhood.",
      
      "Newborn (0-3 Months): Survival Mode\nTotal sleep: 14-17 hours per 24 hours. Naps: 4-6 short naps, 30 minutes to 2 hours. Night sleep: 8-10 hours with 2-4+ wakings. Wake windows: 45-90 minutes. Key challenges: day/night confusion, frequent feeding needs, short sleep cycles (45 min), inability to self-soothe. Focus on: establishing basic routines, teaching day vs night, safe sleep practices, responding to all needs promptly. Don't expect: sleeping through night, predictable schedule, long stretches of sleep.",
      
      "3-4 Months: The Dreaded Regression\nTotal sleep: 12-16 hours. Naps: 3-4 naps, 1-2 hours each. Night sleep: 10-12 hours with 2-3 wakings. Wake windows: 1.5-2 hours. Key challenges: 4-month sleep regression (permanent change in sleep architecture), increased awareness of surroundings, rolling and mobility changes, emerging object permanence. Focus on: consistent bedtime routine, beginning sleep environment optimization, practicing crib naps, patience during transition. Sleep training: can begin after 4 months if desired.",
      
      "5-7 Months: Establishing Patterns\nTotal sleep: 12-15 hours. Naps: 3 naps (transition to 2 naps around 6-9 months), 1-2 hours each. Night sleep: 10-12 hours with 1-2 wakings. Wake windows: 2-3 hours. Key challenges: teething pain, rolling both ways, sitting up, increased separation awareness, dropping third nap causes temporary disruption. Focus on: consistent schedule, sleep training if desired, addressing sleep associations, longer wake windows before bed. This is prime sleep training age if you choose to sleep train.",
      
      "8-10 Months: Separation and Movement\nTotal sleep: 12-15 hours. Naps: 2 naps, 1.5-2 hours each. Night sleep: 10-12 hours, may still have 1 waking. Wake windows: 2.5-3.5 hours. Key challenges: 8-month sleep regression, separation anxiety peaks, pulling to stand (and getting stuck), increased mobility, learning to drop down from standing. Focus on: practicing standing in crib during day, extra comfort during separation anxiety, consistent boundaries, patience during regression. Sleep regressions pass - stay consistent.",
      
      "11-14 Months: One Nap Transition\nTotal sleep: 12-14 hours. Naps: 2 naps transitioning to 1 (most around 15-18 months), 1-3 hours total. Night sleep: 10-12 hours, ideally sleeping through. Wake windows: 3-4 hours. Key challenges: nap transition causes temporary disruption, increased independence and limit-testing, 12-month sleep regression, molars teething. Focus on: flexible transition period - some days 1 nap, some 2 naps, earlier bedtime during transition, consistent boundaries.",
      
      "15-18 Months: The One-Nap Life\nTotal sleep: 11-14 hours. Naps: 1 nap, 2-3 hours. Night sleep: 10-12 hours. Wake windows: 5-6 hours before nap, 4-5 hours after nap to bedtime. Key challenges: 18-month sleep regression, separation anxiety resurges, language explosion affects sleep, testing boundaries. Focus on: maintaining one good nap, consistent bedtime routine, clear boundaries, patience during regression phase.",
      
      "18 Months - 3 Years: Toddler Sleep Challenges\nTotal sleep: 11-14 hours. Naps: 1 nap, 1-3 hours (some drop nap around 3 years). Night sleep: 10-12 hours. Wake windows: 5-6 hours. Key challenges: bedtime battles and stalling, climbing out of crib, fears and nightmares, resistance to naps, potty training affects nighttime sleep. Focus on: transitioning to toddler bed when climbing out, maintaining boundaries with empathy, addressing fears, consistent consequences for stalling.",
      
      "Sample Schedules by Age\n4 months: 7am wake, 8:30 nap 1, 11:30 nap 2, 2:30 nap 3, 4:30 catnap, 7pm bedtime. 6 months: 7am wake, 9am nap 1, 1pm nap 2, 7pm bedtime. 9 months: 7am wake, 9:30 nap 1, 2pm nap 2, 7:30pm bedtime. 12 months: 7am wake, 12pm nap (2-3 hours), 7:30pm bedtime. 2 years: 7am wake, 1pm nap (1.5-2 hours), 8pm bedtime.",
      
      "Wake Windows Explained\nWake windows are the amount of time baby can stay awake before needing sleep. Following age-appropriate wake windows prevents overtiredness, which actually makes sleep harder. Under-tired babies also struggle to sleep. Watch for sleep cues: yawning, rubbing eyes, fussiness, looking away, decreased activity. Use wake windows as guide, sleep cues as confirmation.",
      
      "Addressing Common Sleep Problems\nEarly morning waking (before 6am): ensure age-appropriate bedtime (not too early), room is very dark, white noise helps, sleep training needed if calling for you. Short naps (under 45 min): common under 6 months, after 6 months may indicate overtiredness, undertiredness, or need for sleep training. Night wakings: ensure no hunger, check sleep environment, consider sleep training after 6 months, address sleep associations. Bedtime battles: consistent routine, appropriate bedtime, clear boundaries, avoid screens before bed.",
      
      "When to Adjust Schedule\nSigns baby needs schedule change: consistently fighting naps or bedtime, waking much earlier than usual, unusually long night wakings, increased night wakings, naps suddenly getting very short. Adjustment might mean: pushing bedtime earlier or later, extending wake windows, dropping a nap, adjusting nap timing.",
      
      "Sleep Props and Associations\nSleep associations are things baby needs to fall asleep - feeding, rocking, pacifier, holding, etc. Some associations are problematic if they require parental intervention every sleep cycle. Decide which associations you're comfortable maintaining. If associations are exhausting you, sleep training can help establish independent sleep. Some families happily maintain associations for years - there's no 'right' answer.",
      
      "Safe Sleep Throughout First Year\nAlways follow AAP safe sleep guidelines: back to sleep, firm mattress with fitted sheet only, no blankets, pillows, bumpers, or toys in crib, room sharing (not bed sharing) for first 6-12 months, no overheating, pacifier offered for naps and night sleep. Transitional objects (lovey) can be introduced after 12 months.",
      
      "Remember: These schedules are guidelines, not rigid rules. Some babies need more sleep, others less. Watch your individual baby's cues and adjust accordingly. Consistency in routine matters more than exact timing. When in doubt, follow your baby's lead while providing structure and boundaries."
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
      <header className="sticky top-0 z-50 w-full border-b border-border bg-card shadow-sm">
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

        {/* Article Body with Images */}
        <div className="prose prose-lg max-w-none">
          {article.content.map((paragraph, index) => {
            const hasNote = notes.find(n => n.position === index);
            const imageAtPosition = article.images.find(img => img.position === index);
            
            return (
              <div key={index}>
                <p
                  className={`text-foreground mb-6 leading-relaxed whitespace-pre-line cursor-text select-text ${
                    hasNote ? 'bg-yellow-100 p-2 rounded' : ''
                  }`}
                  onMouseUp={() => handleTextSelection(index)}
                >
                  {paragraph}
                </p>
                
                {imageAtPosition && (
                  <figure className="my-8">
                    <img
                      src={imageAtPosition.url}
                      alt={imageAtPosition.alt}
                      className="w-full rounded-lg shadow-md"
                      loading="lazy"
                    />
                    <figcaption className="text-sm text-muted-foreground mt-2 text-center italic">
                      {imageAtPosition.alt}.{' '}
                      <a
                        href={imageAtPosition.creditLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {imageAtPosition.credit}
                      </a>
                    </figcaption>
                  </figure>
                )}
              </div>
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
                  className="bg-card rounded-xl overflow-hidden shadow-sm border border-border hover:shadow-md transition-shadow cursor-pointer"
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
