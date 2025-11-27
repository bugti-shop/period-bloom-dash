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
import { WaterPage } from "./pages/WaterPage";
import { SleepPage } from "./pages/SleepPage";
import { ExercisePage } from "./pages/ExercisePage";
import { CervicalMucusPage } from "./pages/CervicalMucusPage";
import PeriodProductPage from "./pages/PeriodProductPage";
import WeightPage from "./pages/WeightPage";
import BirthControlPage from "./pages/BirthControlPage";
import { ArticlesPage } from "./pages/ArticlesPage";
import { ArticleDetailPage } from "./pages/ArticleDetailPage";
import { ChecklistDetailPage } from "./pages/ChecklistDetailPage";
import AppointmentPage from "./pages/AppointmentPage";
import PregnancyWeightPage from "./pages/PregnancyWeightPage";
import BloodPressurePage from "./pages/BloodPressurePage";
import GlucosePage from "./pages/GlucosePage";
import StressPage from "./pages/StressPage";
import DigestivePage from "./pages/DigestivePage";
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
          <Route path="/water" element={<WaterPage />} />
          <Route path="/sleep" element={<SleepPage />} />
          <Route path="/exercise" element={<ExercisePage />} />
          <Route path="/cervical-mucus" element={<CervicalMucusPage />} />
          <Route path="/period-product" element={<PeriodProductPage />} />
          <Route path="/weight" element={<WeightPage />} />
          <Route path="/birth-control" element={<BirthControlPage />} />
          <Route path="/articles" element={<ArticlesPage />} />
          <Route path="/article/:id" element={<ArticleDetailPage />} />
          <Route path="/checklists/:id" element={<ChecklistDetailPage />} />
          <Route path="/appointments" element={<AppointmentPage />} />
          <Route path="/pregnancy-weight" element={<PregnancyWeightPage />} />
          <Route path="/blood-pressure" element={<BloodPressurePage />} />
          <Route path="/glucose" element={<GlucosePage />} />
          <Route path="/stress" element={<StressPage />} />
          <Route path="/digestive" element={<DigestivePage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
