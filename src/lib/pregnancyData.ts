export interface BabyWeekData {
  week: number;
  size: string;
  emoji: string;
  heightCm: number;
  weightGrams: number;
  description: string;
}

export interface WeeklyTips {
  week: number;
  pregnancyTip: string;
  nutritionTip: string;
  whatToExpect: string;
}

export const babyWeeklyData: BabyWeekData[] = [
  { week: 4, size: "poppy seed", emoji: "🌱", heightCm: 0.2, weightGrams: 0.01, description: "Your baby is just starting to develop! The embryo is smaller than a grain of rice." },
  { week: 5, size: "sesame seed", emoji: "🌾", heightCm: 0.3, weightGrams: 0.02, description: "The neural tube is forming, which will become your baby's brain and spinal cord." },
  { week: 6, size: "lentil", emoji: "🫘", heightCm: 0.5, weightGrams: 0.04, description: "Your baby's heart begins to beat! Tiny buds are forming that will become arms and legs." },
  { week: 7, size: "blueberry", emoji: "🫐", heightCm: 1.0, weightGrams: 0.2, description: "Your baby is developing facial features and has webbed fingers and toes." },
  { week: 8, size: "raspberry", emoji: "🍇", heightCm: 1.6, weightGrams: 1, description: "Your baby is now officially a fetus! All essential organs are present." },
  { week: 9, size: "cherry", emoji: "🍒", heightCm: 2.3, weightGrams: 2, description: "Your baby's basic physiology is in place. Tiny muscles are forming." },
  { week: 10, size: "strawberry", emoji: "🍓", heightCm: 3.1, weightGrams: 4, description: "Your baby's bones and cartilage are forming. Tiny nails are beginning to grow." },
  { week: 11, size: "fig", emoji: "🥝", heightCm: 4.1, weightGrams: 7, description: "Your baby can now open and close their fists and is starting to kick!" },
  { week: 12, size: "lime", emoji: "🍋", heightCm: 5.4, weightGrams: 14, description: "Your baby's reflexes are developing. They can suck their thumb!" },
  { week: 13, size: "pea pod", emoji: "🫛", heightCm: 7.4, weightGrams: 23, description: "Your baby's vocal cords are forming and their intestines are moving into position." },
  { week: 14, size: "lemon", emoji: "🍋", heightCm: 8.7, weightGrams: 43, description: "Your baby can squint, frown, and make facial expressions!" },
  { week: 15, size: "apple", emoji: "🍎", heightCm: 10.1, weightGrams: 70, description: "Your baby is moving around a lot, though you might not feel it yet." },
  { week: 16, size: "avocado", emoji: "🥑", heightCm: 11.6, weightGrams: 100, description: "Your baby's nervous system is functioning and their circulatory system is working!" },
  { week: 17, size: "pear", emoji: "🍐", heightCm: 13, weightGrams: 140, description: "Your baby can move their joints and their sweat glands are developing." },
  { week: 18, size: "bell pepper", emoji: "🫑", heightCm: 14.2, weightGrams: 190, description: "Your baby's ears are in position and they can hear sounds from outside the womb!" },
  { week: 19, size: "mango", emoji: "🥭", heightCm: 15.3, weightGrams: 240, description: "Your baby's sensory development is taking off! Brain areas for taste, smell, hearing, vision, and touch are developing." },
  { week: 20, size: "banana", emoji: "🍌", heightCm: 16.5, weightGrams: 300, description: "You're halfway there! Your baby can now hear sounds and is about the length of a banana." },
  { week: 21, size: "carrot", emoji: "🥕", heightCm: 26.7, weightGrams: 360, description: "Your baby's movements are getting stronger! They're developing a sleep-wake cycle." },
  { week: 22, size: "papaya", emoji: "🍈", heightCm: 27.8, weightGrams: 430, description: "Your baby's senses are developing rapidly. They can perceive light and dark." },
  { week: 23, size: "grapefruit", emoji: "🍊", heightCm: 28.9, weightGrams: 501, description: "Your baby's face is fully formed. They're practicing breathing movements!" },
  { week: 24, size: "corn", emoji: "🌽", heightCm: 30, weightGrams: 600, description: "Your baby's lungs are developing branches. They're gaining weight steadily now." },
  { week: 25, size: "cauliflower", emoji: "🥦", heightCm: 34.6, weightGrams: 660, description: "Your baby's nostrils are opening and they're getting ready to breathe air." },
  { week: 26, size: "lettuce", emoji: "🥬", heightCm: 35.6, weightGrams: 760, description: "Your baby's eyes are forming and they may be able to blink!" },
  { week: 27, size: "eggplant", emoji: "🍆", heightCm: 36.6, weightGrams: 875, description: "Your baby can recognize your voice! They're developing regular sleep patterns." },
  { week: 28, size: "coconut", emoji: "🥥", heightCm: 37.6, weightGrams: 1000, description: "Your baby's eyes can open and close. They may even be able to dream!" },
  { week: 29, size: "butternut squash", emoji: "🎃", heightCm: 38.6, weightGrams: 1150, description: "Your baby's muscles and lungs are maturing. They're getting bigger and stronger!" },
  { week: 30, size: "cabbage", emoji: "🥬", heightCm: 39.9, weightGrams: 1320, description: "Your baby's brain is developing rapidly. They can now control their own body temperature!" },
  { week: 31, size: "pineapple", emoji: "🍍", heightCm: 41.1, weightGrams: 1500, description: "Your baby is moving to a head-down position. All five senses are working!" },
  { week: 32, size: "jicama", emoji: "🥔", heightCm: 42.4, weightGrams: 1700, description: "Your baby's bones are fully formed but still soft. They're practicing breathing!" },
  { week: 33, size: "celery bunch", emoji: "🌿", heightCm: 43.7, weightGrams: 1920, description: "Your baby's immune system is developing. They're getting into position for birth!" },
  { week: 34, size: "cantaloupe", emoji: "🍈", heightCm: 45, weightGrams: 2150, description: "Your baby's fingernails have reached their fingertips. They're almost ready!" },
  { week: 35, size: "honeydew melon", emoji: "🍈", heightCm: 46.2, weightGrams: 2380, description: "Your baby's kidneys are fully developed. Their reflexes are coordinated!" },
  { week: 36, size: "romaine lettuce", emoji: "🥬", heightCm: 47.4, weightGrams: 2620, description: "Your baby is shedding their protective coating. They're gaining about an ounce a day!" },
  { week: 37, size: "swiss chard", emoji: "🥬", heightCm: 48.6, weightGrams: 2860, description: "Your baby is now considered full term! They're practicing breathing and sucking." },
  { week: 38, size: "leek", emoji: "🧅", heightCm: 49.8, weightGrams: 3080, description: "Your baby has a firm grasp and is getting ready to meet you!" },
  { week: 39, size: "watermelon", emoji: "🍉", heightCm: 50.7, weightGrams: 3290, description: "Your baby's brain and lungs are still maturing. They're almost here!" },
  { week: 40, size: "pumpkin", emoji: "🎃", heightCm: 51.2, weightGrams: 3460, description: "Congratulations! You've reached your due date. Your baby could arrive any day now!" },
];

export const getBabyDataForWeek = (week: number): BabyWeekData => {
  const data = babyWeeklyData.find(d => d.week === week);
  if (data) return data;
  
  // Return closest week if exact match not found
  const closest = babyWeeklyData.reduce((prev, curr) => {
    return Math.abs(curr.week - week) < Math.abs(prev.week - week) ? curr : prev;
  });
  return closest;
};

export const weeklyTips: WeeklyTips[] = [
  { week: 4, pregnancyTip: "Start taking prenatal vitamins with folic acid.", nutritionTip: "Focus on leafy greens, citrus fruits, and whole grains.", whatToExpect: "You might not feel different yet, but big changes are happening!" },
  { week: 5, pregnancyTip: "Schedule your first prenatal appointment.", nutritionTip: "Stay hydrated and eat small, frequent meals to combat nausea.", whatToExpect: "Morning sickness may begin. Fatigue is very common." },
  { week: 6, pregnancyTip: "Avoid caffeine or limit to 200mg per day.", nutritionTip: "Ginger tea can help with nausea. Include protein in every meal.", whatToExpect: "Your baby's heart is beating! You might feel more emotional." },
  { week: 7, pregnancyTip: "Rest when you need to - fatigue is normal.", nutritionTip: "Eat foods rich in vitamin B6 like bananas and avocados.", whatToExpect: "Breast tenderness and frequent urination are common." },
  { week: 8, pregnancyTip: "Avoid hot tubs, saunas, and vigorous exercise.", nutritionTip: "Keep crackers by your bed for morning nausea.", whatToExpect: "Your uterus is growing! You might notice your clothes fitting tighter." },
  { week: 9, pregnancyTip: "Start documenting your pregnancy with photos.", nutritionTip: "Iron-rich foods like lean meat and spinach support blood production.", whatToExpect: "Mood swings are normal due to hormonal changes." },
  { week: 10, pregnancyTip: "Consider prenatal yoga or gentle walking.", nutritionTip: "Calcium is crucial now - dairy, fortified plant milk, or supplements.", whatToExpect: "Your baby is fully formed! Just needs to grow bigger now." },
  { week: 11, pregnancyTip: "Stay active with pregnancy-safe exercises.", nutritionTip: "Omega-3 fatty acids support baby's brain - eat fatty fish or supplements.", whatToExpect: "Nausea might start improving soon!" },
  { week: 12, pregnancyTip: "You might start sharing your pregnancy news now.", nutritionTip: "Vitamin C helps iron absorption - pair iron foods with citrus.", whatToExpect: "Your baby can make facial expressions!" },
  { week: 13, pregnancyTip: "Welcome to the second trimester! Energy may return.", nutritionTip: "Eat plenty of fiber to prevent constipation.", whatToExpect: "You might notice a small baby bump appearing." },
  { week: 14, pregnancyTip: "Start thinking about maternity clothes.", nutritionTip: "Protein needs increase - aim for 75-100g daily.", whatToExpect: "Your skin may look more radiant (pregnancy glow!)." },
  { week: 15, pregnancyTip: "Consider amniocentesis if recommended by your doctor.", nutritionTip: "Stay hydrated - aim for 8-10 glasses of water daily.", whatToExpect: "You might start feeling light flutters (quickening)." },
  { week: 16, pregnancyTip: "Start sleeping on your side instead of your back.", nutritionTip: "Magnesium-rich foods like nuts help prevent leg cramps.", whatToExpect: "Your baby can hear sounds now!" },
  { week: 17, pregnancyTip: "Practice pelvic floor exercises (Kegels).", nutritionTip: "Healthy fats from avocados and nuts support baby's development.", whatToExpect: "Your center of gravity is shifting - be careful with balance." },
  { week: 18, pregnancyTip: "Schedule your anatomy ultrasound scan.", nutritionTip: "Eat small meals to avoid heartburn.", whatToExpect: "You might find out your baby's gender at the ultrasound!" },
  { week: 19, pregnancyTip: "Start talking to your baby - they can hear you!", nutritionTip: "Zinc-rich foods support immune system - eat beans, nuts, whole grains.", whatToExpect: "Your baby is developing unique fingerprints." },
  { week: 20, pregnancyTip: "Halfway there! Celebrate this milestone.", nutritionTip: "Choline supports brain development - eggs are a great source.", whatToExpect: "Baby movements are becoming more noticeable." },
  { week: 21, pregnancyTip: "Moisturize your belly to reduce stretch marks.", nutritionTip: "Don't skip meals - low blood sugar can cause dizziness.", whatToExpect: "You might experience Braxton Hicks contractions (practice contractions)." },
  { week: 22, pregnancyTip: "Start researching birthing classes.", nutritionTip: "Vitamin D from sunlight or supplements supports bone health.", whatToExpect: "Your baby's senses are rapidly developing." },
  { week: 23, pregnancyTip: "Take breaks to elevate your feet if they swell.", nutritionTip: "Complex carbs provide steady energy - choose whole grains.", whatToExpect: "You might feel your baby hiccup!" },
  { week: 24, pregnancyTip: "Get your glucose screening test for gestational diabetes.", nutritionTip: "Limit processed foods and excess sugar.", whatToExpect: "Your baby's lungs are developing rapidly." },
  { week: 25, pregnancyTip: "Start thinking about your birth plan.", nutritionTip: "Potassium prevents muscle cramps - eat bananas and sweet potatoes.", whatToExpect: "Baby may respond to sounds with movements." },
  { week: 26, pregnancyTip: "Consider hiring a doula if you want extra support.", nutritionTip: "Antioxidant-rich berries support overall health.", whatToExpect: "Your baby's eyes are developing and may open soon." },
  { week: 27, pregnancyTip: "Welcome to the third trimester!", nutritionTip: "Eat smaller, more frequent meals as your stomach gets compressed.", whatToExpect: "Baby's brain is developing rapidly now." },
  { week: 28, pregnancyTip: "Start counting baby kicks - aim for 10 movements in 2 hours.", nutritionTip: "DHA from fish oil supports baby's brain and eye development.", whatToExpect: "You might notice your baby has sleep-wake cycles." },
  { week: 29, pregnancyTip: "Prepare your nursery and start organizing baby items.", nutritionTip: "Iron needs peak now - consider supplements if levels are low.", whatToExpect: "Your baby is gaining weight quickly now." },
  { week: 30, pregnancyTip: "Start your hospital bag checklist.", nutritionTip: "Probiotic foods like yogurt support digestive health.", whatToExpect: "You might feel short of breath as baby grows." },
  { week: 31, pregnancyTip: "Schedule more frequent prenatal visits.", nutritionTip: "Stay hydrated to prevent Braxton Hicks contractions.", whatToExpect: "Your baby is moving into position for birth." },
  { week: 32, pregnancyTip: "Practice relaxation and breathing techniques.", nutritionTip: "Eat dates - studies show they may help with labor.", whatToExpect: "You might experience more back pain as baby grows." },
  { week: 33, pregnancyTip: "Install your car seat and have it inspected.", nutritionTip: "Keep healthy snacks nearby for when hunger strikes.", whatToExpect: "Baby's bones are hardening, but skull stays soft for birth." },
  { week: 34, pregnancyTip: "Pre-register at your hospital or birthing center.", nutritionTip: "Spicy and acidic foods may worsen heartburn - avoid if needed.", whatToExpect: "Your baby is likely in head-down position now." },
  { week: 35, pregnancyTip: "Finalize your birth plan and discuss with your doctor.", nutritionTip: "Pineapple and red raspberry leaf tea may help prepare for labor.", whatToExpect: "You might feel pressure in your pelvis as baby drops." },
  { week: 36, pregnancyTip: "Your baby is full term! They could arrive anytime.", nutritionTip: "Keep eating balanced meals to support late pregnancy.", whatToExpect: "Weekly appointments begin now to monitor your progress." },
  { week: 37, pregnancyTip: "Pack your hospital bag if you haven't already.", nutritionTip: "Stay nourished but don't overeat - labor may be soon.", whatToExpect: "Baby's head may be engaged in your pelvis." },
  { week: 38, pregnancyTip: "Watch for signs of labor - contractions, water breaking.", nutritionTip: "Easy-to-digest foods are best now.", whatToExpect: "You might lose your mucus plug - labor is approaching." },
  { week: 39, pregnancyTip: "Rest and conserve energy for labor.", nutritionTip: "Stay hydrated and eat nutritious meals.", whatToExpect: "You're so close! Baby could arrive any day." },
  { week: 40, pregnancyTip: "If baby hasn't arrived, your doctor may discuss induction.", nutritionTip: "Keep eating well and stay active if possible.", whatToExpect: "Congratulations - you've reached your due date!" },
];

export const getWeeklyTips = (week: number): WeeklyTips => {
  const tips = weeklyTips.find(t => t.week === week);
  if (tips) return tips;
  
  // Return closest week if exact match not found
  const closest = weeklyTips.reduce((prev, curr) => {
    return Math.abs(curr.week - week) < Math.abs(prev.week - week) ? curr : prev;
  });
  return closest;
};

export const getTrimesterInfo = (trimester: 1 | 2 | 3): { name: string; description: string; color: string } => {
  switch (trimester) {
    case 1:
      return {
        name: "First Trimester",
        description: "Your baby's organs are forming. Morning sickness is common.",
        color: "from-pink-400 to-rose-400"
      };
    case 2:
      return {
        name: "Second Trimester",
        description: "Energy returns! You'll start feeling your baby move.",
        color: "from-purple-400 to-pink-400"
      };
    case 3:
      return {
        name: "Third Trimester",
        description: "Your baby is growing and preparing for birth!",
        color: "from-indigo-400 to-purple-400"
      };
  }
};
