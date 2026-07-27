import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { queryClientInstance } from "@/lib/query-client";
import { AuthProvider, useAuth } from "@/lib/AuthContext";
import { DEFAULT_RESIDENT_MAP_PATH } from "@/lib/authReturnPath";
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
const ResidentCivicHub = lazy(() => import("./pages/ResidentCivicHub"));
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
  const params = new URLSearchParams(location.search);
  const hasWorkspaceActivation =
    typeof window !== "undefined" &&
    Boolean(window.localStorage.getItem("dp_partner_workspace:activation"));
  const canBootstrapWorkspace =
    location.pathname.startsWith("/partner-workspace") &&
    (params.get("checkout") === "success" || params.get("provisioned") === "1" || hasWorkspaceActivation);

  if (isLoadingAuth) return <MarketingFallback />;
  if (isAuthenticated) {
    const role = String(user?.role || "resident").toLowerCase();
    if (role === "resident") return <Navigate to={DEFAULT_RESIDENT_MAP_PATH} replace />;
    return children;
  }
  if (canBootstrapWorkspace) return children;

  return (
    <Navigate
      to="/partners/sign-in"
      replace
      state={{ from: `${location.pathname}${location.search}${location.hash}` }}
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
    return <Navigate to="/partner-workspace/overview" replace />;
  }
  return children;
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
          <Route path="/resident/card" element={<Navigate to="/map?mode=resident&tab=card&filter=Featured&collection=downtown-perks-featured" replace />} />
          <Route path="/resident/saved" element={<Navigate to="/map?mode=resident&tab=saved&filter=Featured&collection=downtown-perks-featured" replace />} />
          <Route path="/resident/events" element={<Navigate to="/map?mode=resident&tab=events&filter=Events&collection=events-nearby" replace />} />
          <Route path="/resident/perks" element={<Navigate to="/map?mode=resident&tab=perks&filter=Perks&collection=resident-benefits" replace />} />
          <Route path="/resident/civic" element={<ResidentCivicHub />} />
          <Route path="/resident/civic/:actionId" element={<ResidentCivicHub />} />
          <Route path="/resident/governance" element={<Navigate to="/resident/civic" replace />} />
          <Route path="/residents/governance" element={<Navigate to="/resident/civic" replace />} />
          <Route path="/residents/membership" element={<Navigate to="/residents/login" replace />} />
          <Route path="/residents/login" element={<Suspense fallback={<MarketingFallback />}><ResidentSignIn /></Suspense>} />
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
          <Route path="/explore" element={<Navigate to={DEFAULT_RESIDENT_MAP_PATH} replace />} />
          <Route path="/events" element={<Navigate to="/map?mode=resident&tab=events&filter=Events&collection=events-nearby" replace />} />
          <Route path="/perks" element={<Navigate to="/map?mode=resident&tab=perks&filter=Perks&collection=resident-benefits" replace />} />
          <Route path="/properties" element={<Navigate to="/map?mode=resident&tab=map&filter=Properties&collection=buildings-and-residences" replace />} />
          <Route path="/hotels" element={<Navigate to="/map?mode=resident&tab=map&filter=Buildings&collection=buildings-and-residences" replace />} />
          <Route path="/card" element={<Navigate to="/map?mode=resident&tab=card&filter=Featured&collection=downtown-perks-featured" replace />} />
          <Route path="/sign-in" element={<RedirectWithSearch to="/residents/login" />} />
          <Route path="/auth/callback" element={<Suspense fallback={<MarketingFallback />}><AuthCallbackPage /></Suspense>} />
          <Route path="/about" element={<Suspense fallback={<MarketingFallback />}><AboutPage /></Suspense>} />
          <Route path="/resident-sign-up" element={<Navigate to="/residents/login?mode=register" replace />} />
          <Route path="/resident-access" element={<Navigate to="/residents/login" replace />} />
          <Route path="/downtown-perks" element={<Navigate to="/map?mode=resident&tab=perks&filter=Perks&collection=resident-benefits" replace />} />
          <Route path="/downtown-perks/*" element={<Navigate to="/map?mode=resident&tab=perks&filter=Perks&collection=resident-benefits" replace />} />
          <Route path="/resident/*" element={<Navigate to={DEFAULT_RESIDENT_MAP_PATH} replace />} />

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
          <Route path="/partners/sign-up" element={<PartnerLifecycle />} />
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
          <Route path="/partners/dashboard" element={<RedirectWithSearch to="/partner-workspace/overview" />} />
          <Route path="/partners/dashboard/map" element={<RedirectWithSearch to="/partner-workspace/map" />} />
          <Route path="/partners/dashboard/properties" element={<RedirectWithSearch to="/partner-workspace/buildings" />} />
          <Route path="/partners/dashboard/residential" element={<RedirectWithSearch to="/partner-workspace/buildings" />} />
          <Route path="/partners/dashboard/hotels" element={<RedirectWithSearch to="/partner-workspace/profile" />} />
          <Route path="/partners/campaigns" element={<PartnerCampaigns />} />
          <Route path="/partners/happy-hours" element={<PartnerHappyHours />} />
          <Route path="/partner-workspace" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/partner-workspace/*" element={<ProtectedRoute><PartnerWorkspace /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/partners/dashboard/*" element={<ProtectedRoute><PartnersDashboardPage /></ProtectedRoute>} />
          <Route path="/contact" element={<ContactPage />} />

          <Route path="*" element={<Navigate to={DEFAULT_RESIDENT_MAP_PATH} replace />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <Router future={ROUTER_FUTURE_FLAGS}>
        <AuthProvider>
          <ProductRoutes />
          <Toaster />
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}
