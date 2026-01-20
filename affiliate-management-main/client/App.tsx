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
// Admin pages with sidebar
import Partners from "./pages/admin/Partners";
import PendingApproval from "./pages/admin/PendingApproval";
import Links from "./pages/admin/Links";
import ClickDetails from "./pages/admin/ClickDetails";
import ConversionDetails from "./pages/admin/ConversionDetails";
// Affiliate pages
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
          {/* Admin Dashboard and Management */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin/partners" element={<Partners />} />
          <Route path="/admin/pending" element={<PendingApproval />} />
          <Route path="/admin/links" element={<Links />} />
          <Route path="/admin/clicks" element={<ClickDetails />} />
          <Route path="/admin/conversions" element={<ConversionDetails />} />
          {/* Partner Details */}
          <Route path="/partner/:partnerId" element={<PartnerDetail />} />
          <Route
            path="/tracking-instructions/:partnerId"
            element={<TrackingInstructions />}
          />
          {/* Affiliate Portal */}
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
