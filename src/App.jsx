import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { queryClientInstance } from "@/lib/query-client";
import { AuthProvider, useAuth } from "@/lib/AuthContext";
import { buildResidentMapPath } from "@/lib/authReturnPath";
import Layout from "./components/Layout";

// Platform pages
const MapPage = lazy(() => import("./pages/Map"));
const PartnerWorkspace = lazy(() => import("./pages/PartnerWorkspace"));
const PartnerLifecycle = lazy(() => import("./pages/PartnerLifecycle"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const PartnersDashboardPage = lazy(() => import("./pages/partners/Dashboard"));
const PricingPage = lazy(() => import("./pages/Pricing"));
const ContactPage = lazy(() => import("./pages/Contact"));
const ResidentAccess = lazy(() => import("./pages/ResidentAccess"));
const ResidentSignIn = lazy(() => import("./pages/ResidentSignIn"));
const ResidentHome = lazy(() => import("./pages/ResidentHome"));
const ResidentOnboardingFlow = lazy(() => import("./onboarding/ResidentOnboardingFlow"));
const AuthCallbackPage = lazy(() => import("./pages/AuthCallbackPage"));
const AboutPage = lazy(() => import("./pages/downtown-perks/About"));
const PartnerGateway = lazy(() => import("./pages/PartnerGateway"));
const PartnerAccess = lazy(() => import("./pages/partners/Access"));
const PartnerCampaigns = lazy(() => import("./pages/partners/Campaigns"));
const PartnerHappyHours = lazy(() => import("./pages/partners/HappyHours"));
const PartnerProperties = lazy(() => import("./pages/partners/Properties"));
const AskMapAgent = lazy(() => import("./pages/AskMapAgent"));
const SplashPage = lazy(() => import("./pages/SplashPage"));
const AdminMarketingStudio = lazy(() => import("./pages/AdminMarketingStudio"));
const ROUTER_FUTURE_FLAGS = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
};

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
  const params = new URLSearchParams(location.search);
  const hasWorkspaceActivation =
    typeof window !== "undefined" &&
    Boolean(window.localStorage.getItem("dp_partner_workspace:activation"));
  const canBootstrapWorkspace =
    location.pathname.startsWith("/partner-workspace") &&
    (params.get("checkout") === "success" || params.get("provisioned") === "1" || hasWorkspaceActivation);

  if (isLoadingAuth) return <MarketingFallback />;
  if (isAuthenticated || canBootstrapWorkspace) return children;

  return (
    <Navigate
      to="/partners/sign-in"
      replace
      state={{ from: `${location.pathname}${location.search}${location.hash}` }}
    />
  );
}

function RedirectWithSearch({ to }) {
  const location = useLocation();
  return <Navigate to={`${to}${location.search}${location.hash}`} replace />;
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

function SplashLaunchGate() {
  const location = useLocation();
  const { isAuthenticated, isLoadingAuth } = useAuth();
  const residentReturnTo = buildResidentMapPath(location.search, "/map");
  const guestParams = new URLSearchParams(residentReturnTo.split("?")[1] || "");
  guestParams.set("guest", "true");
  const residentGuestHref = `/map?${guestParams.toString()}`;

  if (isLoadingAuth) return <MarketingFallback />;
  if (isAuthenticated) {
    return <Navigate to={residentReturnTo} replace />;
  }

  return (
    <Suspense fallback={<MarketingFallback />}>
      <SplashPage
        residentSignInHref={`/sign-in?returnTo=${encodeURIComponent(residentReturnTo)}`}
        residentCreateHref={`/resident-sign-up?returnTo=${encodeURIComponent(residentReturnTo)}`}
        residentGuestHref={residentGuestHref}
        partnerMapHref="/map?mode=partner&tab=map&filter=All"
      />
    </Suspense>
  );
}

function MapLaunchGate() {
  const location = useLocation();
  const { isAuthenticated, isLoadingAuth } = useAuth();
  const params = new URLSearchParams(location.search);
  const mode = params.get("mode") || "resident";
  const isEmbed = params.get("embed") === "true";
  const isGuest = params.get("guest") === "true";
  const isMapEntryRoute = location.pathname === "/map" || location.pathname === "/app" || location.pathname === "/app/map";

  if (location.pathname === "/app" && !location.search) {
    return <SplashLaunchGate />;
  }

  if (isMapEntryRoute && !isEmbed && !isGuest) {
    if (isLoadingAuth) return <MarketingFallback />;
    if (isAuthenticated && location.pathname !== "/map") {
      return <Navigate to={buildResidentMapPath(location.search, "/map")} replace />;
    }
    if (!isAuthenticated) {
      const returnTo = buildResidentMapPath(location.search, "/map");
      const target =
        mode === "partner"
          ? `/partners/sign-in?returnTo=${encodeURIComponent(returnTo)}`
          : `/sign-in?returnTo=${encodeURIComponent(returnTo)}`;
      return <Navigate to={target} replace />;
    }
  }

  return <MapPage />;
}

function ProductRoutes() {
  return (
    <>
      <HashScroll />
      <Suspense fallback={<MarketingFallback />}>
        <Routes>
          <Route element={<Layout />}>

          {/* ── PLATFORM ROUTES ─────────────────────────────────────────── */}
          <Route path="/" element={<Navigate to="/map?mode=resident&tab=map&filter=All" replace />} />
          <Route path="/app" element={<MapLaunchGate />} />
          <Route path="/app/map" element={<MapLaunchGate />} />
          <Route path="/map" element={<MapLaunchGate />} />
          <Route path="/onboarding" element={<ResidentOnboardingFlow />} />
          <Route path="/onboarding/:step" element={<ResidentOnboardingFlow />} />
          <Route path="/resident/home" element={<ResidentHome />} />
          <Route
            path="/ask-map"
            element={
              <Suspense fallback={<MarketingFallback />}>
                <AskMapAgent />
              </Suspense>
            }
          />
          <Route path="/admin-studio" element={<AdminMarketingStudio />} />
          <Route path="/admin-studio/command-center" element={<AdminMarketingStudio />} />
          <Route path="/admin-studio/campaign-builder" element={<AdminMarketingStudio />} />
          <Route path="/admin-studio/audience-builder" element={<AdminMarketingStudio />} />
          <Route path="/admin-studio/content-library" element={<AdminMarketingStudio />} />
          <Route path="/admin-studio/approval-queue" element={<AdminMarketingStudio />} />
          <Route path="/admin-studio/distribution" element={<AdminMarketingStudio />} />
          <Route path="/admin-studio/performance" element={<AdminMarketingStudio />} />
          <Route path="/admin-studio/partner-intelligence" element={<AdminMarketingStudio />} />
          <Route path="/admin-studio/residents" element={<AdminMarketingStudio />} />
          <Route path="/studio" element={<Navigate to="/admin-studio/command-center" replace />} />
          <Route path="/residents" element={<Navigate to="/map?mode=resident&tab=map&filter=All" replace />} />
          <Route path="/explore" element={<Navigate to="/map?mode=resident&tab=map&filter=All" replace />} />
          <Route path="/events" element={<Navigate to="/map?mode=resident&tab=map&filter=Events" replace />} />
          <Route path="/perks" element={<Navigate to="/map?mode=resident&tab=map&filter=Perks" replace />} />
          <Route path="/properties" element={<Navigate to="/map?mode=resident&tab=map&filter=Properties" replace />} />
          <Route path="/hotels" element={<Navigate to="/map?mode=resident&tab=map&filter=Hotels" replace />} />
          <Route path="/card" element={<Suspense fallback={<MarketingFallback />}><ResidentAccess /></Suspense>} />
          <Route path="/sign-in" element={<Suspense fallback={<MarketingFallback />}><ResidentSignIn /></Suspense>} />
          <Route path="/auth/callback" element={<Suspense fallback={<MarketingFallback />}><AuthCallbackPage /></Suspense>} />
          <Route path="/about" element={<Suspense fallback={<MarketingFallback />}><AboutPage /></Suspense>} />
          <Route path="/resident-sign-up" element={<Suspense fallback={<MarketingFallback />}><ResidentAccess /></Suspense>} />
          <Route path="/resident-access" element={<Navigate to="/card" replace />} />
          <Route path="/downtown-perks" element={<Navigate to="/map?mode=resident&tab=map&filter=Perks" replace />} />
          <Route path="/downtown-perks/*" element={<Navigate to="/map?mode=resident&tab=map&filter=Perks" replace />} />

          {/* Partner landing, onboarding, and public marketing routes. */}
          <Route path="/partners" element={<PartnerLifecycle />} />
          <Route path="/partner-gateway" element={<PartnerGateway />} />
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
            element={<PartnerLifecycle />}
          />
          <Route path="/partners/tools" element={<PartnerLifecycle />} />
          <Route path="/pricing" element={<Suspense fallback={<MarketingFallback />}><PricingPage /></Suspense>} />
          <Route path="/partners/pricing" element={<RedirectWithSearch to="/pricing" />} />
          <Route path="/partners/properties" element={<Suspense fallback={<MarketingFallback />}><PartnerProperties /></Suspense>} />
          <Route path="/partners/residential" element={<Suspense fallback={<MarketingFallback />}><PartnerProperties /></Suspense>} />
          <Route path="/partners/hotels" element={<Navigate to="/partners/sign-up?type=hotel" replace />} />
          <Route path="/partners/hospitality" element={<Navigate to="/partners/sign-up?type=hotel" replace />} />
          <Route path="/partners/venues" element={<Navigate to="/partners/sign-up?type=venue" replace />} />
          <Route path="/partners/brands" element={<Navigate to="/partners/sign-up?type=brand" replace />} />
          <Route path="/partners/directory" element={<Navigate to="/partners/sign-up?type=brand" replace />} />
          <Route path="/partners/civic" element={<Navigate to="/partners/sign-up?type=civic" replace />} />
          <Route path="/partners/real-estate" element={<Navigate to="/partners/sign-up?type=real-estate" replace />} />
          <Route path="/partners/legends" element={<Navigate to="/partners/sign-up?type=property" replace />} />
          <Route path="/partners/dashboard" element={<Navigate to="/partner-workspace/overview" replace />} />
          <Route path="/partners/dashboard/map" element={<Navigate to="/partner-workspace/map" replace />} />
          <Route path="/partners/dashboard/properties" element={<Navigate to="/partner-workspace/buildings" replace />} />
          <Route path="/partners/dashboard/residential" element={<Navigate to="/partner-workspace/buildings" replace />} />
          <Route path="/partners/dashboard/hotels" element={<Navigate to="/partner-workspace/profile" replace />} />
          <Route path="/partners/dashboard/hospitality" element={<Navigate to="/partner-workspace/profile" replace />} />
          <Route path="/partners/dashboard/venues" element={<Navigate to="/partner-workspace/profile" replace />} />
          <Route path="/partners/dashboard/brands" element={<Navigate to="/partner-workspace/profile" replace />} />
          <Route path="/partners/dashboard/civic" element={<Navigate to="/partner-workspace/profile" replace />} />
          <Route path="/partners/dashboard/real-estate" element={<Navigate to="/partner-workspace/buildings" replace />} />
          <Route path="/partners/dashboard/redemptions" element={<Navigate to="/partner-workspace/reports" replace />} />
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
          <Route path="/brands" element={<Navigate to="/map?mode=resident&tab=map&filter=Brands" replace />} />
          <Route path="/brands/*" element={<Navigate to="/map?mode=resident&tab=map&filter=Brands" replace />} />
          <Route path="/partners/inkind" element={<Navigate to="/app?mode=partner&tab=map&filter=Perks&query=inKind" replace />} />
          <Route path="/partners/:role" element={<Navigate to="/partners/sign-up" replace />} />
          <Route path="/partners/reports" element={<Navigate to="/partner-workspace/reports" replace />} />
          <Route path="/partners/reporting" element={<Navigate to="/partner-workspace/reports" replace />} />
          <Route path="/partners/analytics" element={<Navigate to="/partner-workspace/analytics" replace />} />
          <Route path="/partners/reports-preview" element={<Navigate to="/partner-workspace/reports" replace />} />
          <Route path="/partners/analytics-preview" element={<Navigate to="/partner-workspace/analytics" replace />} />
          <Route path="/partners/map" element={<MapPage />} />
          <Route path="/partners/start" element={<PartnerLifecycle />} />
          <Route path="/partners/register" element={<PartnerLifecycle />} />
          <Route path="/partners/checkout" element={<PartnerLifecycle />} />
          <Route path="/partners/provision" element={<PartnerLifecycle />} />
          <Route path="/partners/workspace/*" element={<Navigate to="/partner-workspace/overview" replace />} />

          {/* Partner workspace */}
          <Route path="/workspace" element={<Navigate to="/partner-workspace/overview" replace />} />
          <Route path="/workspace/home" element={<Navigate to="/partner-workspace/overview" replace />} />
          <Route path="/workspace/map" element={<Navigate to="/partner-workspace/map" replace />} />
          <Route path="/workspace/offers" element={<Navigate to="/partner-workspace/offers" replace />} />
          <Route path="/workspace/events" element={<Navigate to="/partner-workspace/events" replace />} />
          <Route path="/workspace/surveys" element={<Navigate to="/partner-workspace/surveys" replace />} />
          <Route path="/workspace/broadcasts" element={<Navigate to="/partner-workspace/broadcasts" replace />} />
          <Route path="/workspace/campaigns" element={<Navigate to="/partner-workspace/campaigns" replace />} />
          <Route path="/workspace/audience" element={<Navigate to="/partner-workspace/audience" replace />} />
          <Route path="/workspace/media" element={<Navigate to="/partner-workspace/media" replace />} />
          <Route path="/workspace/reports" element={<Navigate to="/partner-workspace/reports" replace />} />
          <Route path="/workspace/analytics" element={<Navigate to="/partner-workspace/analytics" replace />} />
          <Route path="/workspace/profile" element={<Navigate to="/partner-workspace/profile" replace />} />
          <Route path="/workspace/team" element={<Navigate to="/partner-workspace/team" replace />} />
          <Route path="/workspace/billing" element={<Navigate to="/partner-workspace/billing" replace />} />
          <Route path="/workspace/settings" element={<Navigate to="/partner-workspace/profile" replace />} />
          <Route path="/app/workspace/profile" element={<Navigate to="/partner-workspace/profile" replace />} />
          <Route path="/partner-workspace" element={<Navigate to="/partner-workspace/overview" replace />} />
          <Route path="/partner-workspace/overview" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-workspace/map" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-workspace/offers" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-workspace/perks" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-workspace/parking" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-workspace/events" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-workspace/surveys" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-workspace/broadcasts" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-workspace/sources" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-workspace/profile" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-workspace/campaigns" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-workspace/audience" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-workspace/media" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-workspace/residents" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-workspace/buildings" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-workspace/messages" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-workspace/surveys" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-workspace/team" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-workspace/billing" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-workspace/dashboard" element={<Navigate to="/partner-workspace/overview" replace />} />
          <Route path="/partner-workspace/reports" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-workspace/analytics" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-workspace/analytics/experiences/downtown-art-parks-tour" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-workspace/*" element={<Navigate to="/partner-workspace/overview" replace />} />

          <Route path="/partner/audience" element={<Navigate to="/partner-workspace/audience" replace />} />
          <Route path="/partner/audiences" element={<Navigate to="/partner-workspace/audience" replace />} />

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

          {/* Legacy public marketing URLs now enter the product or commerce flow. */}
          <Route path="/marketing" element={<Navigate to="/" replace />} />
          <Route path="/marketing/home" element={<Navigate to="/" replace />} />
          <Route path="/marketing/pricing" element={<RedirectWithSearch to="/pricing" />} />
          <Route path="/marketing/contact" element={<Navigate to="/partners/sign-up" replace />} />
          <Route path="/marketing/downtown" element={<Navigate to="/map?mode=resident&tab=map&filter=Perks" replace />} />
          <Route path="/marketing/for-buildings" element={<Navigate to="/partners/sign-up?type=property" replace />} />
          <Route path="/marketing/partners" element={<Navigate to="/partners/sign-up" replace />} />
          <Route path="/marketing/partners/venues" element={<Navigate to="/partners/sign-up?type=venue" replace />} />
          <Route path="/marketing/partners/hotels" element={<Navigate to="/partners/sign-up?type=hotel" replace />} />
          <Route path="/marketing/partners/brands" element={<Navigate to="/partners/sign-up?type=brand" replace />} />
          <Route path="/marketing/partners/properties" element={<Navigate to="/partners/properties" replace />} />
          <Route path="/marketing/partners/residential" element={<Navigate to="/partners/residential" replace />} />
          <Route path="/marketing/partners/civic" element={<Navigate to="/partners/sign-up?type=civic" replace />} />
          <Route path="/marketing/partners/access" element={<Navigate to="/partners/sign-up" replace />} />

          {/* Legacy redirects for any bookmarked marketing URLs */}
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="/contact" element={<Suspense fallback={<MarketingFallback />}><ContactPage /></Suspense>} />
          <Route path="/splash" element={<SplashLaunchGate />} />

          {/* Catch-all → production app route */}
          <Route path="*" element={<Navigate to="/map?mode=resident&tab=map&filter=Perks" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router future={ROUTER_FUTURE_FLAGS}>
          <ProductRoutes />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
