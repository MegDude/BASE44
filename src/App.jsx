import { useCallback, useEffect, useMemo, useState } from "react";
import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { queryClientInstance } from "@/lib/query-client";
import { AuthProvider, useAuth } from "@/lib/AuthContext";
import Layout from "./components/Layout";
import MapPage from "./pages/Map";
import PartnerWorkspace from "./pages/PartnerWorkspace";
import PartnerLifecycle from "./pages/PartnerLifecycle";
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
const PartnerCampaigns = lazy(() => import("./pages/partners/Campaigns"));
const PartnerRolePage = lazy(() => import("./pages/partners/RolePage"));
const PartnerHappyHours = lazy(() => import("./pages/partners/HappyHours"));
const ResidentApp = lazy(() => import("./pages/resident-app"));
const ExplorePage = lazy(() => import("./pages/downtown-perks/Explore"));
const EventsPage = lazy(() => import("./pages/downtown-perks/Events"));
const PerksPage = lazy(() => import("./pages/downtown-perks/PerksPage"));
const CardPage = lazy(() => import("./pages/downtown-perks/PerksCard"));
const BrandsDirectory = lazy(() => import("./pages/downtown-perks/brands/Index"));
const InKindPartnerPage = lazy(() => import("./pages/downtown-perks/brands/InKind"));
const AskMapAgent = lazy(() => import("./pages/AskMapAgent"));

function MarketingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-5 h-5 border-2 border-[rgba(11,31,51,0.12)] border-t-[#0B1F33] rounded-full animate-spin" />
    </div>
  );
}

function ProtectedRoute({ children }) {
  const location = useLocation();
  const { isAuthenticated, isLoadingAuth } = useAuth();

  if (isLoadingAuth) return <MarketingFallback />;
  if (isAuthenticated) return children;

  return (
    <Navigate
      to="/partners/sign-in"
      replace
      state={{ from: `${location.pathname}${location.search}${location.hash}` }}
    />
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

const OPENING_STORY_SESSION_KEY = "dp-opening-story-seen";

function normalizeMapLaunchPath(pathname, search) {
  const params = new URLSearchParams(search || "");
  if (!params.get("mode")) params.set("mode", "resident");
  if (!params.get("tab")) params.set("tab", "map");
  if (!params.get("filter")) params.set("filter", "All");
  const targetPath = pathname === "/app/map" ? "/app/map" : pathname === "/app" ? "/app" : "/map";
  return `${targetPath}?${params.toString()}`;
}

function MapLaunchGate() {
  const location = useLocation();
  const [storySeen, setStorySeen] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.sessionStorage?.getItem(OPENING_STORY_SESSION_KEY) === "true";
  });

  const targetHref = useMemo(
    () => normalizeMapLaunchPath(location.pathname, location.search),
    [location.pathname, location.search],
  );

  const completeLaunchStory = useCallback(() => {
    if (typeof window !== "undefined") {
      window.sessionStorage?.setItem(OPENING_STORY_SESSION_KEY, "true");
    }
    setStorySeen(true);
  }, []);

  if (storySeen) return <MapPage />;

  return (
    <Suspense fallback={<MarketingFallback />}>
      <SplashPage
        residentMapHref={targetHref}
        partnerMapHref="/map?mode=partner&tab=map&filter=All"
        skipHref={targetHref}
        onOpenMap={completeLaunchStory}
      />
    </Suspense>
  );
}

function ProductRoutes() {
  return (
    <>
      <HashScroll />
      <Routes>
        <Route element={<Layout />}>

          {/* ── PLATFORM ROUTES ─────────────────────────────────────────── */}
          {/* Root opens with the Downtown Perks story before the product map. */}
          <Route
            path="/"
            element={
              <Suspense fallback={<MarketingFallback />}>
                <SplashPage />
              </Suspense>
            }
          />

          <Route path="/app" element={<MapLaunchGate />} />
          <Route path="/app/map" element={<MapLaunchGate />} />
          <Route path="/map" element={<MapLaunchGate />} />
          <Route
            path="/ask-map"
            element={
              <Suspense fallback={<MarketingFallback />}>
                <AskMapAgent />
              </Suspense>
            }
          />
          <Route
            path="/residents"
            element={
              <Suspense fallback={<MarketingFallback />}>
                <ResidentApp />
              </Suspense>
            }
          />
          <Route
            path="/explore"
            element={
              <Suspense fallback={<MarketingFallback />}>
                <ExplorePage />
              </Suspense>
            }
          />
          <Route
            path="/events"
            element={
              <Suspense fallback={<MarketingFallback />}>
                <EventsPage />
              </Suspense>
            }
          />
          <Route
            path="/perks"
            element={
              <Suspense fallback={<MarketingFallback />}>
                <PerksPage />
              </Suspense>
            }
          />
          <Route
            path="/card"
            element={
              <Suspense fallback={<MarketingFallback />}>
                <CardPage />
              </Suspense>
            }
          />
          <Route
            path="/downtown-perks"
            element={
              <Suspense fallback={<MarketingFallback />}>
                <DowntownLanding />
              </Suspense>
            }
          />
          <Route
            path="/downtown-perks/explore"
            element={
              <Suspense fallback={<MarketingFallback />}>
                <ExplorePage />
              </Suspense>
            }
          />
          <Route
            path="/downtown-perks/events"
            element={
              <Suspense fallback={<MarketingFallback />}>
                <EventsPage />
              </Suspense>
            }
          />
          <Route
            path="/downtown-perks/perks"
            element={
              <Suspense fallback={<MarketingFallback />}>
                <PerksPage />
              </Suspense>
            }
          />
          <Route
            path="/downtown-perks/card"
            element={
              <Suspense fallback={<MarketingFallback />}>
                <CardPage />
              </Suspense>
            }
          />
          <Route
            path="/downtown-perks/for-buildings"
            element={
              <Suspense fallback={<MarketingFallback />}>
                <ForBuildings />
              </Suspense>
            }
          />

          {/* Partner platform */}
          <Route
            path="/partners"
            element={
              <Suspense fallback={<MarketingFallback />}>
                <PartnersIndex />
              </Suspense>
            }
          />
          <Route
            path="/partners/apply"
            element={
              <Suspense fallback={<MarketingFallback />}>
                <PartnerAccess mode="sign-up" />
              </Suspense>
            }
          />
          <Route
            path="/partners/sign-in"
            element={
              <Suspense fallback={<MarketingFallback />}>
                <PartnerAccess mode="sign-in" />
              </Suspense>
            }
          />
          <Route
            path="/partners/sign-up"
            element={
              <Suspense fallback={<MarketingFallback />}>
                <PartnerAccess mode="sign-up" />
              </Suspense>
            }
          />
          <Route
            path="/partners/pricing"
            element={
              <Suspense fallback={<MarketingFallback />}>
                <PricingPage />
              </Suspense>
            }
          />
          <Route
            path="/partners/properties"
            element={
              <Suspense fallback={<MarketingFallback />}>
                <PartnerProperties />
              </Suspense>
            }
          />
          <Route path="/partners/residential" element={<Navigate to="/partners/properties" replace />} />
          <Route
            path="/partners/hotels"
            element={
              <Suspense fallback={<MarketingFallback />}>
                <PartnerHotels />
              </Suspense>
            }
          />
          <Route path="/partners/hospitality" element={<Navigate to="/partners/hotels" replace />} />
          <Route
            path="/partners/venues"
            element={
              <Suspense fallback={<MarketingFallback />}>
                <PartnerVenues />
              </Suspense>
            }
          />
          <Route
            path="/partners/brands"
            element={
              <Suspense fallback={<MarketingFallback />}>
                <PartnerBrands />
              </Suspense>
            }
          />
          <Route
            path="/partners/directory"
            element={
              <Suspense fallback={<MarketingFallback />}>
                <PartnerBrands />
              </Suspense>
            }
          />
          <Route
            path="/partners/civic"
            element={
              <Suspense fallback={<MarketingFallback />}>
                <PartnerCivic />
              </Suspense>
            }
          />
          <Route
            path="/partners/real-estate"
            element={
              <Suspense fallback={<MarketingFallback />}>
                <PartnerProperties />
              </Suspense>
            }
          />
          <Route
            path="/partners/legends"
            element={
              <Suspense fallback={<MarketingFallback />}>
                <PartnerProperties />
              </Suspense>
            }
          />
          <Route path="/partners/dashboard" element={<ProtectedRoute><PartnersDashboardPage /></ProtectedRoute>} />
          <Route path="/partners/dashboard/map" element={<ProtectedRoute><MapPage /></ProtectedRoute>} />
          <Route path="/partners/dashboard/properties" element={<ProtectedRoute><PartnersDashboardPage /></ProtectedRoute>} />
          <Route path="/partners/dashboard/residential" element={<Navigate to="/partners/dashboard/properties" replace />} />
          <Route path="/partners/dashboard/hotels" element={<ProtectedRoute><PartnersDashboardPage /></ProtectedRoute>} />
          <Route path="/partners/dashboard/hospitality" element={<Navigate to="/partners/dashboard/hotels" replace />} />
          <Route path="/partners/dashboard/venues" element={<ProtectedRoute><PartnersDashboardPage /></ProtectedRoute>} />
          <Route path="/partners/dashboard/brands" element={<ProtectedRoute><PartnersDashboardPage /></ProtectedRoute>} />
          <Route path="/partners/dashboard/civic" element={<ProtectedRoute><PartnersDashboardPage /></ProtectedRoute>} />
          <Route path="/partners/dashboard/real-estate" element={<ProtectedRoute><PartnersDashboardPage /></ProtectedRoute>} />
          <Route path="/partners/dashboard/redemptions" element={<ProtectedRoute><PartnersDashboardPage /></ProtectedRoute>} />
          <Route
            path="/partners/campaigns"
            element={
              <Suspense fallback={<MarketingFallback />}>
                <PartnerCampaigns />
              </Suspense>
            }
          />
          <Route
            path="/partners/happy-hours"
            element={
              <Suspense fallback={<MarketingFallback />}>
                <PartnerHappyHours />
              </Suspense>
            }
          />
          <Route
            path="/brands"
            element={
              <Suspense fallback={<MarketingFallback />}>
                <BrandsDirectory />
              </Suspense>
            }
          />
          <Route
            path="/partners/inkind"
            element={
              <Suspense fallback={<MarketingFallback />}>
                <InKindPartnerPage />
              </Suspense>
            }
          />
          <Route
            path="/brands/inkind"
            element={
              <Suspense fallback={<MarketingFallback />}>
                <InKindPartnerPage />
              </Suspense>
            }
          />
          <Route
            path="/partners/:role"
            element={
              <Suspense fallback={<MarketingFallback />}>
                <PartnerRolePage />
              </Suspense>
            }
          />
          <Route path="/partners/reports" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/partners/reporting" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/partners/analytics" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/partners/reports-preview" element={<PartnerWorkspace />} />
          <Route path="/partners/analytics-preview" element={<PartnerWorkspace />} />
          <Route path="/partners/map" element={<MapPage />} />
          <Route path="/partners/start" element={<PartnerLifecycle />} />
          <Route path="/partners/register" element={<PartnerLifecycle />} />
          <Route path="/partners/pricing" element={<Navigate to="/marketing/pricing" replace />} />
          <Route path="/partners/checkout" element={<PartnerLifecycle />} />
          <Route path="/partners/provision" element={<PartnerLifecycle />} />
          <Route path="/partners/workspace/*" element={<Navigate to="/partner-workspace/overview" replace />} />

          {/* Partner workspace */}
          <Route path="/workspace" element={<Navigate to="/partner-workspace/overview" replace />} />
          <Route path="/workspace/home" element={<Navigate to="/partner-workspace/overview" replace />} />
          <Route path="/workspace/map" element={<Navigate to="/partner-workspace/map" replace />} />
          <Route path="/workspace/offers" element={<Navigate to="/partner-workspace/offers" replace />} />
          <Route path="/workspace/events" element={<Navigate to="/partner-workspace/events" replace />} />
          <Route path="/workspace/campaigns" element={<Navigate to="/partner-workspace/campaigns" replace />} />
          <Route path="/workspace/reports" element={<Navigate to="/partner-workspace/reports" replace />} />
          <Route path="/workspace/analytics" element={<Navigate to="/partner-workspace/analytics" replace />} />
          <Route path="/workspace/profile" element={<Navigate to="/partner-workspace/profile" replace />} />
          <Route path="/workspace/team" element={<Navigate to="/partner-workspace/team" replace />} />
          <Route path="/workspace/billing" element={<Navigate to="/partner-workspace/billing" replace />} />
          <Route path="/workspace/settings" element={<Navigate to="/partner-workspace/profile" replace />} />
          <Route path="/partner-workspace" element={<Navigate to="/partner-workspace/overview" replace />} />
          <Route path="/partner-workspace/overview" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-workspace/map" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-workspace/offers" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-workspace/perks" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-workspace/parking" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-workspace/events" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-workspace/sources" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-workspace/profile" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-workspace/campaigns" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-workspace/residents" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-workspace/buildings" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-workspace/messages" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-workspace/surveys" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-workspace/team" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-workspace/billing" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-workspace/dashboard" element={<Navigate to="/partners/dashboard" replace />} />
          <Route path="/partner-workspace/reports" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-workspace/analytics" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-workspace/*" element={<Navigate to="/partner-workspace/overview" replace />} />

          {/* Partner portal aliases: always enter the workspace shell, even when no partner is linked. */}
          <Route path="/partner-portal" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-portal/dashboard" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-portal/properties" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-portal/hotels" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-portal/venues" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-portal/brands" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-portal/civic" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-portal/real-estate" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-portal/campaigns" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-portal/reports" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-portal/events" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-portal/perks" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-portal/*" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />

          {/* ── MARKETING ROUTES (/marketing/*) ─────────────────────────── */}
          <Route
            path="/marketing"
            element={
              <Suspense fallback={<MarketingFallback />}>
                <HomePage />
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

          {/* Catch-all → production app route */}
          <Route path="*" element={<Navigate to="/app?mode=resident&tab=map&filter=All" replace />} />
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
