import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Politicians from "./pages/Politicians";
import PoliticianProfile from "./pages/PoliticianProfile";
import Ranking from "./pages/Ranking";
import AILegislation from "./pages/AILegislation";
import Transparency from "./pages/Transparency";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="politicians" element={<Politicians />} />
            <Route path="politicians/:id" element={<PoliticianProfile />} />
            <Route path="ranking" element={<Ranking />} />
            <Route path="ai-legislation" element={<AILegislation />} />
            <Route path="transparency" element={<Transparency />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
