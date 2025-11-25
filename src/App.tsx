import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import { IntimacyPage } from "./pages/IntimacyPage";
import { BBTPage } from "./pages/BBTPage";
import { AppetitePage } from "./pages/AppetitePage";
import { HealthPage } from "./pages/HealthPage";
import { ArticleDetailPage } from "./pages/ArticleDetailPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/intimacy" element={<IntimacyPage />} />
          <Route path="/bbt" element={<BBTPage />} />
          <Route path="/appetite" element={<AppetitePage />} />
          <Route path="/health" element={<HealthPage />} />
          <Route path="/article/:id" element={<ArticleDetailPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
