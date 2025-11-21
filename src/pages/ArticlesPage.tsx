import { useState } from "react";
import { Menu, X, Home, Heart, Baby, Calendar, BookOpen, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

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
  }
];

const categories = [
  { name: "All Articles", icon: BookOpen },
  { name: "Pregnancy", icon: Baby },
  { name: "Period Health", icon: Calendar },
  { name: "Wellness", icon: Heart },
  { name: "Medical", icon: Stethoscope }
];

export const ArticlesPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("All Articles");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const filteredArticles = selectedCategory === "All Articles" 
    ? articles 
    : articles.filter(article => article.category === selectedCategory);

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
            
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
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
              className="bg-white rounded-xl overflow-hidden shadow-sm border border-border hover:shadow-md transition-shadow cursor-pointer"
            >
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
