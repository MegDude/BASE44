import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { queryClientInstance } from "@/lib/query-client";
import { AuthProvider, useAuth } from "@/lib/AuthContext";
import { DEFAULT_RESIDENT_MAP_PATH } from "@/lib/authReturnPath";
import { currentSafeReturnTo, preserveIntentParams } from "@/lib/routeIntent";
import Layout from "./components/Layout";

// Platform pages
const MapPage = lazy(() => import("./pages/Map"));
const PartnerWorkspace = lazy(() => import("./pages/PartnerWorkspace"));
const PartnerLifecycle = lazy(() => import("./pages/PartnerLifecycle"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const PartnersDashboardPage = lazy(() => import("./pages/partners/Dashboard"));
const PricingPage = lazy(() => import("./pages/Pricing"));
const ContactPage = lazy(() => import("./pages/Contact"));
const ResidentSignIn = lazy(() => import("./pages/ResidentSignIn"));
const ResidentResetPassword = lazy(() => import("./pages/ResidentResetPassword"));
const ResidentGovernance = lazy(() => import("./pages/ResidentGovernance"));
const AuthCallbackPage = lazy(() => import("./pages/AuthCallbackPage"));
const AboutPage = lazy(() => import("./pages/downtown-perks/About"));
const PartnerGateway = lazy(() => import("./pages/PartnerGateway"));
const PartnerAccess = lazy(() => import("./pages/partners/Access"));
const PartnerCampaigns = lazy(() => import("./pages/partners/Campaigns"));
const PartnerHappyHours = lazy(() => import("./pages/partners/HappyHours"));
const PartnerProperties = lazy(() => import("./pages/partners/Properties"));
const AskMapAgent = lazy(() => import("./pages/AskMapAgent"));
const SplashPage = lazy(() => import("./pages/SplashPage"));
const InteractionSystemPreview = lazy(() => import("./pages/InteractionSystemPreview"));
const MicrositeDirectory = lazy(() => import("./components/microsites/MicrositeDirectory"));
const PartnerMicrositePage = lazy(() => import("./components/microsites/PartnerMicrositePage"));
const MicrositeAdminRegistry = lazy(() => import("./components/microsites/MicrositeAdminRegistry"));
const PartnerJourneyResource = lazy(() => import("./components/admin/PartnerJourneyResource"));
const AdminContentIndex = lazy(() => import("./pages/AdminContentIndex"));
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
  const { isAuthenticated, isLoadingAuth, user } = useAuth();
  if (isLoadingAuth) return <MarketingFallback />;
  if (isAuthenticated) {
    const role = String(user?.role || "resident").toLowerCase();
    if (role === "resident") return <Navigate to={DEFAULT_RESIDENT_MAP_PATH} replace />;
    return children;
  }
  return (
    <Navigate
      to={`/partners/sign-in?returnTo=${encodeURIComponent(currentSafeReturnTo(location, DEFAULT_RESIDENT_MAP_PATH))}`}
      replace
    />
  );
}

function AdminProtectedRoute({ children }) {
  const location = useLocation();
  const { isAuthenticated, isLoadingAuth, user } = useAuth();

  if (isLoadingAuth) return <MarketingFallback />;
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/partners/sign-in"
        replace
        state={{ from: `${location.pathname}${location.search}${location.hash}` }}
      />
    );
  }

  const role = String(user?.role || "").toLowerCase();
  if (!["admin", "platform_admin", "super_admin"].includes(role)) {
    return <Navigate to="/partner-workspace/home" replace />;
  }
  return children;
}

const ADMIN_STUDIO_DESTINATIONS = {
  "/admin-studio": "/partner-workspace/overview",
  "/admin-studio/command-center": "/partner-workspace/overview",
  "/admin-studio/campaign-builder": "/partner-workspace/campaigns?intent=new",
  "/admin-studio/audience-builder": "/partner-workspace/audience",
  "/admin-studio/content-library": "/partner-workspace/media",
  "/admin-studio/approval-queue": "/partner-workspace/governance",
  "/admin-studio/distribution": "/partner-workspace/broadcasts",
  "/admin-studio/performance": "/partner-workspace/analytics",
  "/admin-studio/partner-intelligence": "/partner-workspace/reports",
  "/admin-studio/residents": "/partner-workspace/residents",
};

function getAdminStudioDestination(location) {
  const configured = ADMIN_STUDIO_DESTINATIONS[location.pathname] || ADMIN_STUDIO_DESTINATIONS["/admin-studio"];
  const [pathname, configuredSearch = ""] = configured.split("?");
  const params = new URLSearchParams(configuredSearch);
  preserveIntentParams(location.search).forEach((value, key) => params.set(key, value));
  const search = params.toString();
  return `${pathname}${search ? `?${search}` : ""}${location.hash}`;
}

function ProtectedAdminStudio() {
  const location = useLocation();
  return (
    <AdminProtectedRoute>
      <Navigate to={getAdminStudioDestination(location)} replace />
    </AdminProtectedRoute>
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
  const residentMapHref = `/app${location.search || "?mode=resident&tab=map&filter=All"}`;

  return (
    <Suspense fallback={<MarketingFallback />}>
      <SplashPage
        residentMapHref={residentMapHref}
        partnerMapHref="/map?mode=partner&tab=map&filter=All"
        replayOpening
      />
    </Suspense>
  );
}

function MapLaunchGate() {
  const location = useLocation();
  if (location.pathname === "/app" && !location.search) {
    return <SplashLaunchGate />;
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
          <Route path="/" element={<Navigate to={DEFAULT_RESIDENT_MAP_PATH} replace />} />
          <Route path="/app" element={<MapLaunchGate />} />
          <Route path="/app/map" element={<RedirectWithSearch to="/map" />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/onboarding" element={<Navigate to={DEFAULT_RESIDENT_MAP_PATH} replace />} />
          <Route path="/onboarding/:step" element={<Navigate to={DEFAULT_RESIDENT_MAP_PATH} replace />} />
          <Route path="/resident" element={<Navigate to={DEFAULT_RESIDENT_MAP_PATH} replace />} />
          <Route path="/resident/home" element={<Navigate to={DEFAULT_RESIDENT_MAP_PATH} replace />} />
          <Route path="/resident/onboarding" element={<Navigate to={DEFAULT_RESIDENT_MAP_PATH} replace />} />
          <Route path="/resident/card" element={<Navigate to="/map?mode=resident&tab=pass" replace />} />
          <Route path="/resident/saved" element={<Navigate to="/map?mode=resident&tab=saved&filter=Featured&collection=downtown-perks-featured" replace />} />
          <Route path="/resident/events" element={<Navigate to="/map?mode=resident&tab=events&filter=Events&collection=events-nearby" replace />} />
          <Route path="/resident/perks" element={<Navigate to="/map?mode=resident&tab=perks&filter=Perks&collection=resident-benefits" replace />} />
          <Route path="/resident/civic" element={<ResidentGovernance />} />
          <Route path="/resident/civic/:actionId" element={<ResidentGovernance />} />
          <Route path="/resident/*" element={<Navigate to={DEFAULT_RESIDENT_MAP_PATH} replace />} />
          <Route path="/residents/governance" element={<ResidentGovernance />} />
          <Route path="/residents/membership" element={<Navigate to="/residents/login" replace />} />
          <Route path="/residents/register" element={<Navigate to="/residents/login" replace />} />
          <Route path="/residents/login" element={<Suspense fallback={<MarketingFallback />}><ResidentSignIn /></Suspense>} />
          <Route path="/residents/reset-password" element={<Suspense fallback={<MarketingFallback />}><ResidentResetPassword /></Suspense>} />
          <Route path="/residents/welcome" element={<Navigate to={DEFAULT_RESIDENT_MAP_PATH} replace />} />
          <Route path="/interaction-system" element={<InteractionSystemPreview />} />
          <Route
            path="/ask-map"
            element={
              <Suspense fallback={<MarketingFallback />}>
                <AskMapAgent />
              </Suspense>
            }
          />
          <Route path="/admin-studio" element={<ProtectedAdminStudio />} />
          <Route path="/admin-studio/command-center" element={<ProtectedAdminStudio />} />
          <Route path="/admin-studio/campaign-builder" element={<ProtectedAdminStudio />} />
          <Route path="/admin-studio/audience-builder" element={<ProtectedAdminStudio />} />
          <Route path="/admin-studio/content-library" element={<ProtectedAdminStudio />} />
          <Route path="/admin-studio/approval-queue" element={<ProtectedAdminStudio />} />
          <Route path="/admin-studio/distribution" element={<ProtectedAdminStudio />} />
          <Route path="/admin-studio/performance" element={<ProtectedAdminStudio />} />
          <Route path="/admin-studio/partner-intelligence" element={<ProtectedAdminStudio />} />
          <Route path="/admin-studio/residents" element={<ProtectedAdminStudio />} />
          <Route
            path="/admin-studio/microsites"
            element={<AdminProtectedRoute><MicrositeAdminRegistry /></AdminProtectedRoute>}
          />
          <Route
            path="/admin/resources/partner-journey"
            element={<AdminProtectedRoute><PartnerJourneyResource /></AdminProtectedRoute>}
          />
          <Route path="/admin/content-index" element={<AdminProtectedRoute><AdminContentIndex /></AdminProtectedRoute>} />
          <Route path="/studio" element={<Navigate to="/admin-studio/command-center" replace />} />
          <Route path="/residents" element={<Navigate to={DEFAULT_RESIDENT_MAP_PATH} replace />} />
          <Route path="/explore" element={<Navigate to="/map?mode=resident&tab=map&filter=All" replace />} />
          <Route path="/events" element={<Navigate to="/map?mode=resident&tab=map&filter=Events" replace />} />
          <Route path="/perks" element={<Navigate to="/map?mode=resident&tab=map&filter=Perks" replace />} />
          <Route path="/properties" element={<Navigate to="/map?mode=resident&tab=map&filter=Properties" replace />} />
          <Route path="/hotels" element={<Navigate to="/map?mode=resident&tab=map&filter=Hotels" replace />} />
          <Route path="/card" element={<Navigate to="/map?mode=resident&tab=pass" replace />} />
          <Route path="/sign-in" element={<RedirectWithSearch to="/residents/login" />} />
          <Route path="/auth/callback" element={<Suspense fallback={<MarketingFallback />}><AuthCallbackPage /></Suspense>} />
          <Route path="/about" element={<Suspense fallback={<MarketingFallback />}><AboutPage /></Suspense>} />
          <Route path="/resident-sign-up" element={<Navigate to="/residents/login" replace />} />
          <Route path="/resident-access" element={<Navigate to="/residents/login" replace />} />
          <Route path="/downtown-perks" element={<Navigate to="/map?mode=resident&tab=map&filter=Perks" replace />} />
          <Route path="/downtown-perks/*" element={<Navigate to="/map?mode=resident&tab=map&filter=Perks" replace />} />

          {/* Partner landing, onboarding, and public marketing routes. */}
          <Route path="/partners" element={<PartnerLifecycle />} />
          <Route path="/network" element={<MicrositeDirectory />} />
          <Route path="/network/:type/:slug" element={<PartnerMicrositePage />} />
          <Route path="/partners/launch/:type/:slug" element={<PartnerMicrositePage />} />
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
            element={
              <Suspense fallback={<MarketingFallback />}>
                <PartnerAccess mode="sign-up" />
              </Suspense>
            }
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
          <Route path="/partners/dashboard" element={<RedirectWithSearch to="/partner-workspace/home" />} />
          <Route path="/partners/dashboard/map" element={<RedirectWithSearch to="/partner-workspace/map" />} />
          <Route path="/partners/dashboard/properties" element={<RedirectWithSearch to="/partner-workspace/buildings" />} />
          <Route path="/partners/dashboard/residential" element={<RedirectWithSearch to="/partner-workspace/buildings" />} />
          <Route path="/partners/dashboard/hotels" element={<RedirectWithSearch to="/partner-workspace/profile" />} />
          <Route path="/partners/dashboard/hospitality" element={<RedirectWithSearch to="/partner-workspace/profile" />} />
          <Route path="/partners/dashboard/venues" element={<RedirectWithSearch to="/partner-workspace/profile" />} />
          <Route path="/partners/dashboard/brands" element={<RedirectWithSearch to="/partner-workspace/profile" />} />
          <Route path="/partners/dashboard/civic" element={<RedirectWithSearch to="/partner-workspace/profile" />} />
          <Route path="/partners/dashboard/real-estate" element={<RedirectWithSearch to="/partner-workspace/buildings" />} />
          <Route path="/partners/dashboard/redemptions" element={<RedirectWithSearch to="/partner-workspace/redemptions" />} />
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
          <Route path="/partners/reports" element={<RedirectWithSearch to="/partner-workspace/reports" />} />
          <Route path="/partners/reporting" element={<RedirectWithSearch to="/partner-workspace/reports" />} />
          <Route path="/partners/analytics" element={<RedirectWithSearch to="/partner-workspace/analytics" />} />
          <Route path="/partners/reports-preview" element={<RedirectWithSearch to="/partner-workspace/reports" />} />
          <Route path="/partners/analytics-preview" element={<RedirectWithSearch to="/partner-workspace/analytics" />} />
          <Route path="/partners/map" element={<MapPage />} />
          <Route path="/partners/start" element={<PartnerLifecycle />} />
          <Route path="/partners/register" element={<RedirectWithSearch to="/partners/sign-up" />} />
          <Route path="/partners/checkout" element={<RedirectWithSearch to="/pricing" />} />
          <Route path="/partners/provision" element={<RedirectWithSearch to="/partners/sign-up" />} />
          <Route path="/partners/workspace/*" element={<RedirectWithSearch to="/partner-workspace/home" />} />

          {/* Partner workspace */}
          <Route path="/workspace" element={<RedirectWithSearch to="/partner-workspace/home" />} />
          <Route path="/workspace/home" element={<RedirectWithSearch to="/partner-workspace/home" />} />
          <Route path="/workspace/map" element={<RedirectWithSearch to="/partner-workspace/map" />} />
          <Route path="/workspace/offers" element={<RedirectWithSearch to="/partner-workspace/offers" />} />
          <Route path="/workspace/events" element={<RedirectWithSearch to="/partner-workspace/events" />} />
          <Route path="/workspace/surveys" element={<RedirectWithSearch to="/partner-workspace/surveys" />} />
          <Route path="/workspace/broadcasts" element={<RedirectWithSearch to="/partner-workspace/broadcasts" />} />
          <Route path="/workspace/campaigns" element={<RedirectWithSearch to="/partner-workspace/reach" />} />
          <Route path="/workspace/audience" element={<RedirectWithSearch to="/partner-workspace/results" />} />
          <Route path="/workspace/media" element={<RedirectWithSearch to="/partner-workspace/media" />} />
          <Route path="/workspace/reports" element={<RedirectWithSearch to="/partner-workspace/reports" />} />
          <Route path="/workspace/redemptions" element={<RedirectWithSearch to="/partner-workspace/results" />} />
          <Route path="/workspace/analytics" element={<RedirectWithSearch to="/partner-workspace/results" />} />
          <Route path="/workspace/assistant" element={<RedirectWithSearch to="/partner-workspace/assistant" />} />
          <Route path="/workspace/profile" element={<RedirectWithSearch to="/partner-workspace/profile" />} />
          <Route path="/workspace/team" element={<RedirectWithSearch to="/partner-workspace/team" />} />
          <Route path="/workspace/billing" element={<RedirectWithSearch to="/partner-workspace/billing" />} />
          <Route path="/workspace/settings" element={<RedirectWithSearch to="/partner-workspace/settings" />} />
          {/* Legacy workspace URLs must enter the canonical workspace shell. */}
          <Route path="/app/workspace" element={<RedirectWithSearch to="/partner-workspace/home" />} />
          <Route path="/app/workspace/home" element={<RedirectWithSearch to="/partner-workspace/home" />} />
          <Route path="/app/workspace/overview" element={<RedirectWithSearch to="/partner-workspace/home" />} />
          <Route path="/app/workspace/map" element={<RedirectWithSearch to="/partner-workspace/map" />} />
          <Route path="/app/workspace/offers" element={<RedirectWithSearch to="/partner-workspace/offers" />} />
          <Route path="/app/workspace/events" element={<RedirectWithSearch to="/partner-workspace/events" />} />
          <Route path="/app/workspace/campaigns" element={<RedirectWithSearch to="/partner-workspace/reach" />} />
          <Route path="/app/workspace/audience" element={<RedirectWithSearch to="/partner-workspace/results" />} />
          <Route path="/app/workspace/media" element={<RedirectWithSearch to="/partner-workspace/media" />} />
          <Route path="/app/workspace/sources" element={<RedirectWithSearch to="/partner-workspace/connections" />} />
          <Route path="/app/workspace/share-links" element={<RedirectWithSearch to="/partner-workspace/share-links" />} />
          <Route path="/app/workspace/reports" element={<RedirectWithSearch to="/partner-workspace/reports" />} />
          <Route path="/app/workspace/redemptions" element={<RedirectWithSearch to="/partner-workspace/results" />} />
          <Route path="/app/workspace/analytics" element={<RedirectWithSearch to="/partner-workspace/results" />} />
          <Route path="/app/workspace/assistant" element={<RedirectWithSearch to="/partner-workspace/assistant" />} />
          <Route path="/app/workspace/profile" element={<RedirectWithSearch to="/partner-workspace/profile" />} />
          <Route path="/app/workspace/team" element={<RedirectWithSearch to="/partner-workspace/team" />} />
          <Route path="/app/workspace/billing" element={<RedirectWithSearch to="/partner-workspace/settings" />} />
          <Route path="/app/workspace/*" element={<RedirectWithSearch to="/partner-workspace/home" />} />
          <Route path="/partner-workspace" element={<RedirectWithSearch to="/partner-workspace/home" />} />
          <Route path="/partner-workspace/home" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-workspace/overview" element={<RedirectWithSearch to="/partner-workspace/home" />} />
          <Route path="/partner-workspace/launch" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-workspace/publish" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-workspace/performance" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-workspace/workspace" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-workspace/map" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-workspace/offers" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-workspace/perks" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-workspace/parking" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-workspace/events" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-workspace/surveys" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-workspace/broadcasts" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-workspace/sources" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-workspace/share-links" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-workspace/governance" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-workspace/civic/*" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-workspace/profile" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-workspace/campaigns" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-workspace/reach" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-workspace/updates" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-workspace/results" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-workspace/connections" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-workspace/settings" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-workspace/audience" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-workspace/media" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-workspace/residents" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-workspace/buildings" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-workspace/messages" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-workspace/team" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-workspace/billing" element={<RedirectWithSearch to="/partner-workspace/settings" />} />
          <Route path="/partner-workspace/dashboard" element={<RedirectWithSearch to="/partner-workspace/home" />} />
          <Route path="/partner-workspace/reports" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-workspace/redemptions" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-workspace/analytics" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-workspace/assistant" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-workspace/analytics/experiences/downtown-art-parks-tour" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-workspace/*" element={<RedirectWithSearch to="/partner-workspace/home" />} />

          <Route path="/partner/audience" element={<Navigate to="/partner-workspace/audience" replace />} />
          <Route path="/partner/audiences" element={<Navigate to="/partner-workspace/audience" replace />} />

          {/* Partner portal aliases: always enter the workspace shell, even when no partner is linked. */}
          <Route path="/partner-portal" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-portal/dashboard" element={<RedirectWithSearch to="/partner-workspace/home" />} />
          <Route path="/partner-portal/properties" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-portal/hotels" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-portal/venues" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-portal/brands" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-portal/civic" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-portal/real-estate" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-portal/campaigns" element={<RedirectWithSearch to="/partner-workspace/reach" />} />
          <Route path="/partner-portal/reports" element={<RedirectWithSearch to="/partner-workspace/reports" />} />
          <Route path="/partner-portal/events" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-portal/perks" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-portal/*" element={<RedirectWithSearch to="/partner-workspace/home" />} />

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
