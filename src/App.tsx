import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CRMProvider } from "@/contexts/CRMContext";
import Index from "./pages/Index.tsx";
import KanbanPage from "./pages/Kanban.tsx";
import ProfessionalsPage from "./pages/Professionals.tsx";
import CapturePage from "./pages/Capture.tsx";
import AnalyticsPage from "./pages/Analytics.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CRMProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/kanban" element={<KanbanPage />} />
            <Route path="/professionals" element={<ProfessionalsPage />} />
            <Route path="/capture" element={<CapturePage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </CRMProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
