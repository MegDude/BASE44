import { useEffect } from "react";
import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { queryClientInstance } from "@/lib/query-client";
import { AuthProvider } from "@/lib/AuthContext";
import Layout from "./components/Layout";
import SplashPage from "./pages/SplashPage";
import MapPage from "./pages/Map";
import PartnerWorkspace from "./pages/PartnerWorkspace";
import Dashboard from "./pages/Dashboard";
import PartnersDashboardPage from "./pages/partners/Dashboard";

function HashScroll() {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      return;
    }

    const id = decodeURIComponent(location.hash.slice(1));
    let frame = 0;
    let timeoutId;

    const scrollToAnchor = () => {
      const target = document.getElementById(id);
      if (target) {
        const top = target.getBoundingClientRect().top + window.scrollY - 76;
        window.scrollTo({ top: Math.max(0, top), left: 0, behavior: "smooth" });
        return;
      }

      if (frame < 8) {
        frame += 1;
        timeoutId = window.setTimeout(scrollToAnchor, 80);
      }
    };

    timeoutId = window.setTimeout(scrollToAnchor, 0);
    return () => window.clearTimeout(timeoutId);
  }, [location.pathname, location.search, location.hash]);

  return null;
}

function ProductRoutes() {
  return (
    <>
      <HashScroll />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<SplashPage />} />

          <Route path="/map" element={<MapPage />} />

          <Route path="/partners" element={<Navigate to="/map?mode=partner&tab=map&filter=All" replace />} />
          <Route path="/partners/dashboard" element={<PartnersDashboardPage />} />
          <Route path="/partners/campaigns" element={<PartnersDashboardPage />} />
          <Route path="/partners/reports" element={<Dashboard />} />
          <Route path="/partners/analytics" element={<Dashboard />} />
          <Route path="/partners/map" element={<MapPage />} />
          <Route path="/partners/workspace/*" element={<Navigate to="/partner-workspace/overview" replace />} />

          <Route path="/partner-workspace" element={<Navigate to="/partner-workspace/overview" replace />} />
          <Route path="/partner-workspace/overview" element={<PartnerWorkspace />} />
          <Route path="/partner-workspace/perks" element={<PartnerWorkspace />} />
          <Route path="/partner-workspace/events" element={<PartnerWorkspace />} />
          <Route path="/partner-workspace/profile" element={<PartnerWorkspace />} />
          <Route path="/partner-workspace/campaigns" element={<PartnerWorkspace />} />
          <Route path="/partner-workspace/residents" element={<PartnerWorkspace />} />
          <Route path="/partner-workspace/buildings" element={<PartnerWorkspace />} />
          <Route path="/partner-workspace/messages" element={<PartnerWorkspace />} />
          <Route path="/partner-workspace/surveys" element={<PartnerWorkspace />} />
          <Route path="/partner-workspace/dashboard" element={<Navigate to="/partners/dashboard" replace />} />
          <Route path="/partner-workspace/reports" element={<PartnerWorkspace />} />
          <Route path="/partner-workspace/analytics" element={<Dashboard />} />
          <Route path="/partner-workspace/*" element={<Navigate to="/partner-workspace/overview" replace />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ProductRoutes />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
