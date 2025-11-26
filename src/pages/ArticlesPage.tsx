import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X, BookOpen, Baby, Calendar, Heart, Stethoscope, Search, Bookmark, CheckCircle, Clock, Download, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isBookmarked } from "@/lib/articleBookmarks";
import { getAllProgress, ArticleProgress } from "@/lib/articleProgress";
import { isArticleOffline } from "@/lib/offlineArticles";
import { ReadingHistoryDashboard } from "@/components/ReadingHistoryDashboard";
import { formatDistanceToNow } from "date-fns";

const articles = [
  {
    id: 1,
    category: "Pregnancy",
    title: "Understanding Your First Trimester",
    excerpt: "Learn about the changes happening in your body during the first three months of pregnancy.",
    image: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&auto=format&fit=crop",
    readTime: "5 min read"
  },
  {
    id: 2,
    category: "Period Health",
    title: "Managing Period Pain Naturally",
    excerpt: "Discover natural remedies and lifestyle changes that can help reduce menstrual discomfort.",
    image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&auto=format&fit=crop",
    readTime: "7 min read"
  },
  {
    id: 3,
    category: "Pregnancy",
    title: "Nutrition During Pregnancy",
    excerpt: "Essential nutrients and foods to support a healthy pregnancy journey.",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&auto=format&fit=crop",
    readTime: "6 min read"
  },
  {
    id: 4,
    category: "Wellness",
    title: "Exercise and Your Cycle",
    excerpt: "How to adapt your workout routine to your menstrual cycle for optimal results.",
    image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop",
    readTime: "4 min read"
  },
  {
    id: 5,
    category: "Pregnancy",
    title: "Preparing for Labor and Delivery",
    excerpt: "What to expect and how to prepare for your baby's arrival.",
    image: "https://images.unsplash.com/photo-1584515933487-779824d29309?w=800&auto=format&fit=crop",
    readTime: "8 min read"
  },
  {
    id: 6,
    category: "Period Health",
    title: "Understanding Your Cycle Phases",
    excerpt: "A complete guide to the four phases of your menstrual cycle and what they mean.",
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&auto=format&fit=crop",
    readTime: "6 min read"
  },
  {
    id: 7,
    category: "Postpartum",
    title: "Postpartum Recovery: What to Expect",
    excerpt: "Understanding physical and emotional changes during the fourth trimester and how to support your recovery.",
    image: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&auto=format&fit=crop",
    readTime: "9 min read"
  },
  {
    id: 8,
    category: "Breastfeeding",
    title: "Breastfeeding Basics: A Complete Guide",
    excerpt: "Everything new mothers need to know about breastfeeding, from latch techniques to common challenges.",
    image: "https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?w=800&auto=format&fit=crop",
    readTime: "10 min read"
  },
  {
    id: 9,
    category: "Newborn Care",
    title: "Newborn Care Essentials: First Month Guide",
    excerpt: "Practical guidance on feeding, sleep, diapering, and caring for your newborn during the first month.",
    image: "https://images.pexels.com/photos/3737582/pexels-photo-3737582.jpeg?w=800&auto=format&fit=crop",
    readTime: "8 min read"
  },
  {
    id: 10,
    category: "Newborn Care",
    title: "Recognizing Illness in Newborns",
    excerpt: "Learn to identify warning signs of illness in newborns and when to seek immediate medical care.",
    image: "https://images.pexels.com/photos/8491929/pexels-photo-8491929.jpeg?w=800&auto=format&fit=crop",
    readTime: "7 min read"
  },
  {
    id: 11,
    category: "Baby Development",
    title: "Baby Development: Months 2-4",
    excerpt: "Discover the exciting milestones and rapid changes your baby experiences from two to four months.",
    image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&auto=format&fit=crop",
    readTime: "8 min read"
  },
  {
    id: 12,
    category: "Baby Development",
    title: "Baby Development: Months 5-8",
    excerpt: "Learn about sitting, rolling, crawling, and starting solids during these transformative months.",
    image: "https://images.unsplash.com/photo-1607006095938-615c0ac25043?w=800&auto=format&fit=crop",
    readTime: "9 min read"
  },
  {
    id: 13,
    category: "Baby Development",
    title: "Baby Development: Months 9-12",
    excerpt: "Celebrate your baby's first year with milestones like first words, first steps, and growing independence.",
    image: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&auto=format&fit=crop",
    readTime: "10 min read"
  },
  {
    id: 14,
    category: "Mental Health",
    title: "Understanding Postpartum Depression",
    excerpt: "Recognize the signs, understand the causes, and learn about effective treatments for postpartum depression.",
    image: "https://images.unsplash.com/photo-1516302752625-fcc3c50ae61f?w=800&auto=format&fit=crop",
    readTime: "10 min read"
  },
  {
    id: 15,
    category: "Mental Health",
    title: "Managing Anxiety During Pregnancy",
    excerpt: "Practical strategies and professional insights for managing pregnancy-related anxiety and worry.",
    image: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=800&auto=format&fit=crop",
    readTime: "8 min read"
  },
  {
    id: 16,
    category: "Mental Health",
    title: "Coping Strategies for Perinatal Mental Health",
    excerpt: "Evidence-based techniques to support your emotional wellbeing during pregnancy and postpartum.",
    image: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&auto=format&fit=crop",
    readTime: "9 min read"
  },
  {
    id: 17,
    category: "Pregnancy Complications",
    title: "Understanding Gestational Diabetes",
    excerpt: "Comprehensive guide to managing blood sugar during pregnancy and ensuring healthy outcomes.",
    image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&auto=format&fit=crop",
    readTime: "9 min read"
  },
  {
    id: 18,
    category: "Pregnancy Complications",
    title: "Preeclampsia: Recognition and Management",
    excerpt: "Essential information about high blood pressure in pregnancy, warning signs, and treatment approaches.",
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop",
    readTime: "8 min read"
  }
];

const categories = [
  { name: "All Articles", icon: BookOpen },
  { name: "Pregnancy", icon: Baby },
  { name: "Period Health", icon: Calendar },
  { name: "Wellness", icon: Heart },
  { name: "Postpartum", icon: Heart },
  { name: "Breastfeeding", icon: Baby },
  { name: "Newborn Care", icon: Stethoscope },
  { name: "Baby Development", icon: Baby },
  { name: "Mental Health", icon: Heart },
  { name: "Pregnancy Complications", icon: Stethoscope },
  { name: "Bookmarked", icon: Bookmark }
];

export const ArticlesPage = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("All Articles");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [bookmarkRefresh, setBookmarkRefresh] = useState(0);
  const [showHistoryDashboard, setShowHistoryDashboard] = useState(false);
  
  const articleProgress = getAllProgress();

  if (showHistoryDashboard) {
    return <ReadingHistoryDashboard onBack={() => setShowHistoryDashboard(false)} />;
  }

  // Get continue reading articles (5-95% progress, sorted by most recent)
  const continueReadingArticles = useMemo(() => {
    const progressEntries = Object.entries(articleProgress)
      .filter(([_, progress]: [string, ArticleProgress]) => 
        progress.scrollPercentage >= 5 && 
        progress.scrollPercentage < 95 &&
        !progress.completed
      )
      .sort((a, b) => b[1].lastRead - a[1].lastRead)
      .slice(0, 3);

    return progressEntries.map(([id]) => 
      articles.find(article => article.id.toString() === id)
    ).filter(Boolean);
  }, [articleProgress]);

  const filteredArticles = useMemo(() => {
    let filtered = articles;
    
    // Filter by category
    if (selectedCategory === "Bookmarked") {
      const bookmarks = articles.filter(article => isBookmarked(article.id.toString()));
      filtered = bookmarks;
    } else if (selectedCategory !== "All Articles") {
      filtered = articles.filter(article => article.category === selectedCategory);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(article => 
        article.title.toLowerCase().includes(query) ||
        article.excerpt.toLowerCase().includes(query) ||
        article.category.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [selectedCategory, searchQuery, bookmarkRefresh]);

  const DrawerContent = () => (
    <div className="py-4">
      <div className="px-4 mb-6">
        <h2 className="text-xl font-bold text-foreground mb-1">Categories</h2>
        <p className="text-sm text-muted-foreground">Browse articles by topic</p>
      </div>
      
      <nav className="space-y-1">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <button
              key={category.name}
              onClick={() => {
                setSelectedCategory(category.name);
                setIsDrawerOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                selectedCategory === category.name
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted text-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{category.name}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Hamburger Menu */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    {isDrawerOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                  <DrawerContent />
                </SheetContent>
              </Sheet>
              
              <div>
                <h1 className="text-xl font-bold text-foreground">Learn & Discover</h1>
                <p className="text-xs text-muted-foreground">Your health knowledge hub</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowHistoryDashboard(true)}
                title="View Reading History"
              >
                <BarChart2 className="h-5 w-5" />
              </Button>
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Continue Reading Section */}
        {continueReadingArticles.length > 0 && !searchQuery && selectedCategory === "All Articles" && (
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Continue Reading
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {continueReadingArticles.map((article) => {
                    if (!article) return null;
                    const progress = articleProgress[article.id.toString()];
                    const isOffline = isArticleOffline(article.id.toString());
                    
                    return (
                      <div
                        key={article.id}
                        onClick={() => navigate(`/article/${article.id}`)}
                        className="bg-muted/50 rounded-lg overflow-hidden cursor-pointer hover:bg-muted transition-colors p-4 relative"
                      >
                        {isOffline && (
                          <Badge variant="secondary" className="absolute top-2 right-2 gap-1">
                            <Download className="h-3 w-3" />
                            Offline
                          </Badge>
                        )}
                        <div className="flex items-start gap-3">
                          <div className="w-20 h-20 rounded-md overflow-hidden flex-shrink-0">
                            <img
                              src={article.image}
                              alt={article.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <Badge variant="outline" className="text-xs mb-1">
                              {article.category}
                            </Badge>
                            <h4 className="font-semibold text-sm line-clamp-2 mb-1">
                              {article.title}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                              <Clock className="h-3 w-3" />
                              <span>
                                {formatDistanceToNow(progress.lastRead, { addSuffix: true })}
                              </span>
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">
                                  {Math.round(progress.scrollPercentage)}% complete
                                </span>
                              </div>
                              <Progress value={progress.scrollPercentage} className="h-1" />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Category Pills - Mobile horizontal scroll */}
        <div className="mb-6 overflow-x-auto pb-2 -mx-4 px-4">
          <div className="flex gap-2 min-w-max">
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => setSelectedCategory(category.name)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  selectedCategory === category.name
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <article
              key={article.id}
              onClick={() => navigate(`/article/${article.id}`)}
              className="bg-white rounded-xl overflow-hidden shadow-sm border border-border hover:shadow-md transition-shadow cursor-pointer relative"
            >
              <div className="absolute top-2 right-2 z-10 flex gap-1">
                {isArticleOffline(article.id.toString()) && (
                  <Badge variant="secondary" className="gap-1">
                    <Download className="h-3 w-3" />
                  </Badge>
                )}
                {articleProgress[article.id]?.completed && (
                  <div className="bg-green-500 text-white rounded-full p-1">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                )}
              </div>
              <div className="aspect-video w-full overflow-hidden">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                    {article.category}
                  </span>
                  <span className="text-xs text-muted-foreground">{article.readTime}</span>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {article.excerpt}
                </p>
                {articleProgress[article.id] && articleProgress[article.id].scrollPercentage > 5 && !articleProgress[article.id].completed && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">
                        {Math.round(articleProgress[article.id].scrollPercentage)}% read
                      </span>
                    </div>
                    <Progress value={articleProgress[article.id].scrollPercentage} className="h-1" />
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>

        {/* Empty State */}
        {filteredArticles.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No articles found</h3>
            <p className="text-muted-foreground">Try selecting a different category</p>
          </div>
        )}
      </main>
    </div>
  );
};
