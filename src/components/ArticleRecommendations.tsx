import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { getReadingHistory } from "@/lib/readingHistory";
import { toast } from "sonner";

interface Article {
  id: number;
  title: string;
  category: string;
  excerpt: string;
  image: string;
  readTime: string;
}

interface Recommendation {
  articleId: string;
  reason: string;
}

interface ArticleRecommendationsProps {
  articles: Article[];
}

export const ArticleRecommendations = ({ articles }: ArticleRecommendationsProps) => {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const readingHistory = getReadingHistory();

  useEffect(() => {
    if (readingHistory.length >= 2) {
      fetchRecommendations();
    }
  }, []);

  const fetchRecommendations = async () => {
    setIsLoading(true);
    try {
      const historyData = readingHistory.slice(-5).map(h => ({
        title: h.articleTitle,
        category: h.category,
        readingTime: h.readingTime
      }));

      const availableArticles = articles
        .filter(a => !readingHistory.find(h => h.articleId === a.id.toString()))
        .map(a => ({
          id: a.id.toString(),
          title: a.title,
          category: a.category,
          excerpt: a.excerpt
        }));

      const { data, error } = await supabase.functions.invoke('article-recommendations', {
        body: {
          readingHistory: historyData,
          availableArticles: availableArticles
        }
      });

      if (error) {
        if (error.message.includes("Rate limit")) {
          toast.error("Rate limit reached. Please try again later.");
        } else if (error.message.includes("Payment required")) {
          toast.error("AI credits needed. Please add credits in Settings.");
        } else {
          console.error("Recommendations error:", error);
        }
        return;
      }

      if (data?.recommendations) {
        setRecommendations(data.recommendations.slice(0, 3));
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRecommendedArticles = () => {
    return recommendations
      .map(rec => articles.find(a => a.id.toString() === rec.articleId))
      .filter(Boolean)
      .map((article, index) => ({
        ...article!,
        reason: recommendations[index].reason
      }));
  };

  const recommendedArticles = getRecommendedArticles();

  if (readingHistory.length < 2) {
    return null; // Don't show recommendations until user has read at least 2 articles
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recommendedArticles.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Recommended for You
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendedArticles.map((article) => (
            <div
              key={article.id}
              onClick={() => navigate(`/article/${article.id}`)}
              className="bg-white rounded-lg overflow-hidden border border-border hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="aspect-video w-full overflow-hidden">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {article.category}
                  </Badge>
                  <Badge variant="outline" className="text-xs gap-1">
                    <Sparkles className="h-3 w-3" />
                    AI Pick
                  </Badge>
                </div>
                <h4 className="font-semibold text-sm mb-2 line-clamp-2">
                  {article.title}
                </h4>
                <p className="text-xs text-muted-foreground italic line-clamp-2">
                  "{article.reason}"
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
