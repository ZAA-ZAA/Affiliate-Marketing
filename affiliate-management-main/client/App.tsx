import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Setup from "./pages/Setup";
import Dashboard from "./pages/Dashboard";
import PartnerDetail from "./pages/PartnerDetail";
import TrackingInstructions from "./pages/TrackingInstructions";
// Demo form is now a separate project: demo-form-app (runs on port 3001)
import AffiliateSignup from "./pages/AffiliateSignup";
import AffiliateLogin from "./pages/AffiliateLogin";
import AffiliateDashboard from "./pages/AffiliateDashboard";
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
          <Route path="/login" element={<Login />} />
          <Route path="/setup" element={<Setup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/partner/:partnerId" element={<PartnerDetail />} />
          <Route
            path="/tracking-instructions/:partnerId"
            element={<TrackingInstructions />}
          />
          {/* Demo form is at http://localhost:3001 (separate project: demo-form-app) */}
          <Route path="/affiliate/signup" element={<AffiliateSignup />} />
          <Route path="/affiliate/login" element={<AffiliateLogin />} />
          <Route
            path="/affiliate/dashboard"
            element={<AffiliateDashboard />}
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

// Create root only once and reuse it to avoid React 18 warnings
const container = document.getElementById("root")!;

// Check if root already exists on the container
if (!(container as any)._reactRoot) {
  (container as any)._reactRoot = createRoot(container);
}

const root = (container as any)._reactRoot;
root.render(<App />);
