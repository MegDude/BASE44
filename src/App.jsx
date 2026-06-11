import { useEffect } from "react";
import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { queryClientInstance } from "@/lib/query-client";
import { AuthProvider } from "@/lib/AuthContext";
import Layout from "./components/Layout";
import MapPage from "./pages/Map";
import PartnerWorkspace from "./pages/PartnerWorkspace";
import Dashboard from "./pages/Dashboard";
import PartnersDashboardPage from "./pages/partners/Dashboard";

// Marketing pages (lazy-loaded, not part of the app shell)
import { lazy, Suspense } from "react";
const SplashPage = lazy(() => import("./pages/SplashPage"));
const HomePage = lazy(() => import("./pages/Home"));
const PricingPage = lazy(() => import("./pages/Pricing"));
const ContactPage = lazy(() => import("./pages/Contact"));
const DowntownLanding = lazy(() => import("./pages/downtown-perks/Landing"));
const ForBuildings = lazy(() => import("./pages/downtown-perks/ForBuildings"));
const PartnersIndex = lazy(() => import("./pages/partners/Index"));
const PartnerVenues = lazy(() => import("./pages/partners/Venues"));
const PartnerHotels = lazy(() => import("./pages/partners/Hotels"));
const PartnerBrands = lazy(() => import("./pages/partners/Brands"));
const PartnerProperties = lazy(() => import("./pages/partners/Properties"));
const PartnerResidential = lazy(() => import("./pages/partners/Residential"));
const PartnerCivic = lazy(() => import("./pages/partners/Civic"));
const PartnerAccess = lazy(() => import("./pages/partners/Access"));

function MarketingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-5 h-5 border-2 border-[rgba(11,31,51,0.12)] border-t-[#0B1F33] rounded-full animate-spin" />
    </div>
  );
}

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

          {/* ── PLATFORM ROUTES ─────────────────────────────────────────── */}
          {/* Root always goes to resident map */}
          <Route path="/" element={<Navigate to="/map?mode=resident&tab=map&filter=All" replace />} />

          <Route path="/map" element={<MapPage />} />

          {/* Partner platform */}
          <Route path="/partners" element={<Navigate to="/map?mode=partner&tab=map&filter=All" replace />} />
          <Route path="/partners/dashboard" element={<PartnersDashboardPage />} />
          <Route path="/partners/campaigns" element={<PartnersDashboardPage />} />
          <Route path="/partners/reports" element={<Dashboard />} />
          <Route path="/partners/analytics" element={<Dashboard />} />
          <Route path="/partners/map" element={<MapPage />} />
          <Route path="/partners/workspace/*" element={<Navigate to="/partner-workspace/overview" replace />} />

          {/* Partner workspace */}
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

          {/* ── MARKETING ROUTES (/marketing/*) ─────────────────────────── */}
          <Route
            path="/marketing"
            element={
              <Suspense fallback={<MarketingFallback />}>
                <SplashPage />
              </Suspense>
            }
          />
          <Route
            path="/marketing/home"
            element={
              <Suspense fallback={<MarketingFallback />}>
                <HomePage />
              </Suspense>
            }
          />
          <Route
            path="/marketing/pricing"
            element={
              <Suspense fallback={<MarketingFallback />}>
                <PricingPage />
              </Suspense>
            }
          />
          <Route
            path="/marketing/contact"
            element={
              <Suspense fallback={<MarketingFallback />}>
                <ContactPage />
              </Suspense>
            }
          />
          <Route
            path="/marketing/downtown"
            element={
              <Suspense fallback={<MarketingFallback />}>
                <DowntownLanding />
              </Suspense>
            }
          />
          <Route
            path="/marketing/for-buildings"
            element={
              <Suspense fallback={<MarketingFallback />}>
                <ForBuildings />
              </Suspense>
            }
          />
          <Route
            path="/marketing/partners"
            element={
              <Suspense fallback={<MarketingFallback />}>
                <PartnersIndex />
              </Suspense>
            }
          />
          <Route
            path="/marketing/partners/venues"
            element={
              <Suspense fallback={<MarketingFallback />}>
                <PartnerVenues />
              </Suspense>
            }
          />
          <Route
            path="/marketing/partners/hotels"
            element={
              <Suspense fallback={<MarketingFallback />}>
                <PartnerHotels />
              </Suspense>
            }
          />
          <Route
            path="/marketing/partners/brands"
            element={
              <Suspense fallback={<MarketingFallback />}>
                <PartnerBrands />
              </Suspense>
            }
          />
          <Route
            path="/marketing/partners/properties"
            element={
              <Suspense fallback={<MarketingFallback />}>
                <PartnerProperties />
              </Suspense>
            }
          />
          <Route
            path="/marketing/partners/residential"
            element={
              <Suspense fallback={<MarketingFallback />}>
                <PartnerResidential />
              </Suspense>
            }
          />
          <Route
            path="/marketing/partners/civic"
            element={
              <Suspense fallback={<MarketingFallback />}>
                <PartnerCivic />
              </Suspense>
            }
          />
          <Route
            path="/marketing/partners/access"
            element={
              <Suspense fallback={<MarketingFallback />}>
                <PartnerAccess />
              </Suspense>
            }
          />

          {/* Legacy redirects for any bookmarked marketing URLs */}
          <Route path="/home" element={<Navigate to="/marketing/home" replace />} />
          <Route path="/pricing" element={<Navigate to="/marketing/pricing" replace />} />
          <Route path="/contact" element={<Navigate to="/marketing/contact" replace />} />
          <Route path="/splash" element={<Navigate to="/marketing" replace />} />

          {/* Catch-all → resident map */}
          <Route path="*" element={<Navigate to="/map?mode=resident&tab=map&filter=All" replace />} />
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
