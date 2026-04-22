import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "@/lib/query-client";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import PageNotFound from "./lib/PageNotFound";
import { AuthProvider, useAuth } from "@/lib/AuthContext";
import UserNotRegisteredError from "@/components/UserNotRegisteredError";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Landing from "./pages/downtown-perks/Landing";
import ExploreRebuilt from "./pages/downtown-perks/ExploreRebuilt";
import Events from "./pages/downtown-perks/Events";
import PerksPage from "./pages/downtown-perks/PerksPage";
import PerksCard from "./pages/downtown-perks/PerksCard";
import ForBuildings from "./pages/downtown-perks/ForBuildings";
import About from "./pages/downtown-perks/About";
import BrandsIndex from "./pages/downtown-perks/brands/Index";
import ThePaseo from "./pages/downtown-perks/brands/ThePaseo";
import TheWaterline from "./pages/downtown-perks/brands/TheWaterline";
import Bangers from "./pages/downtown-perks/brands/Bangers";
import TheStayPut from "./pages/downtown-perks/brands/TheStayPut";
import Yeti from "./pages/downtown-perks/brands/Yeti";
import Rivian from "./pages/downtown-perks/brands/Rivian";
import Lululemon from "./pages/downtown-perks/brands/Lululemon";
import Equinox from "./pages/downtown-perks/brands/Equinox";
import AustinFC from "./pages/downtown-perks/brands/AustinFC";
import FabiAndRosi from "./pages/downtown-perks/brands/FabiAndRosi";
import HotelVanZandt from "./pages/downtown-perks/brands/HotelVanZandt";
import FourSeasons from "./pages/downtown-perks/brands/FourSeasons";
import FourSeasonsResidences from "./pages/downtown-perks/brands/FourSeasonsResidences";
import TheShore from "./pages/downtown-perks/brands/TheShore";
import PartnersIndex from "./pages/partners/Index";
import ResidentialPartner from "./pages/partners/Residential";
import CivicPartner from "./pages/partners/Civic";
import HotelsPartner from "./pages/partners/Hotels";
import VenuesPartner from "./pages/partners/Venues";
import BrandsPartner from "./pages/partners/Brands";
import PartnerWorkspace from "./pages/PartnerWorkspace";
import Dashboard from "./pages/Dashboard";
import PartnerDashboard from "./pages/PartnerDashboard";
import ResidentApp from "./pages/resident-app";
import ResidentsPage from "./pages/Residents";

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" />
      </div>
    );
  }

  if (authError) {
    if (authError.type === "user_not_registered") {
      return <UserNotRegisteredError />;
    }
    if (authError.type === "auth_required") {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/downtown-perks" element={<Landing />} />
        <Route path="/downtown-perks/explore" element={<ExploreRebuilt />} />
        <Route path="/downtown-perks/events" element={<Events />} />
        <Route path="/downtown-perks/perks" element={<PerksPage />} />
        <Route path="/downtown-perks/card" element={<PerksCard />} />
        <Route path="/downtown-perks/for-buildings" element={<ForBuildings />} />
        <Route path="/downtown-perks/about" element={<About />} />

        <Route path="/brands" element={<BrandsIndex />} />
        <Route path="/brands/analytics" element={<BrandAnalyticsFallback />} />
        <Route path="/brands/the-paseo" element={<ThePaseo />} />
        <Route path="/brands/the-waterline" element={<TheWaterline />} />
        <Route path="/brands/bangers" element={<Bangers />} />
        <Route path="/brands/the-stay-put" element={<TheStayPut />} />
        <Route path="/brands/yeti" element={<Yeti />} />
        <Route path="/brands/rivian" element={<Rivian />} />
        <Route path="/brands/lululemon" element={<Lululemon />} />
        <Route path="/brands/equinox" element={<Equinox />} />
        <Route path="/brands/laz-y-boy-park" element={<AustinFC />} />
        <Route path="/brands/fabi-and-rosi" element={<FabiAndRosi />} />
        <Route path="/brands/hotel-van-zandt" element={<HotelVanZandt />} />
        <Route path="/brands/four-seasons" element={<FourSeasons />} />
        <Route path="/brands/four-seasons-residences" element={<FourSeasonsResidences />} />
        <Route path="/brands/the-shore" element={<TheShore />} />

        <Route path="/partners" element={<PartnersIndex />} />
        <Route path="/partners/civic" element={<CivicPartner />} />
        <Route path="/partners/residential" element={<ResidentialPartner />} />
        <Route path="/partners/properties" element={<ResidentialPartner />} />
        <Route path="/partners/hotels" element={<HotelsPartner />} />
        <Route path="/partners/hospitality" element={<HotelsPartner />} />
        <Route path="/partners/venues" element={<VenuesPartner />} />
        <Route path="/partners/brands" element={<BrandsPartner />} />
        <Route path="/partners/dashboard" element={<Dashboard defaultSection="partners" />} />
        <Route path="/partner-workspace" element={<PartnerWorkspace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/partner-dashboard" element={<PartnerDashboard />} />

        <Route path="/residents" element={<ResidentsPage />} />
        <Route path="/resident-dashboard" element={<ResidentApp defaultTab="map" />} />
        <Route path="/resident-dashboard/map" element={<ResidentApp defaultTab="map" />} />
        <Route path="/resident-dashboard/saved" element={<ResidentApp defaultTab="saved" />} />
        <Route path="/resident-dashboard/plan" element={<ResidentApp defaultTab="plan" />} />
        <Route path="/resident-dashboard/card" element={<ResidentApp defaultTab="card" />} />
        <Route path="/resident-dashboard/perks" element={<ResidentApp defaultTab="perks" />} />
        <Route path="/resident-dashboard/profile" element={<ResidentApp defaultTab="profile" />} />
        <Route path="/resident-app" element={<ResidentApp defaultTab="now" />} />
        <Route path="/resident-app/map" element={<ResidentApp defaultTab="map" />} />
        <Route path="/resident-app/saved" element={<ResidentApp defaultTab="saved" />} />
        <Route path="/resident-app/plan" element={<ResidentApp defaultTab="plan" />} />
        <Route path="/resident-app/card" element={<ResidentApp defaultTab="card" />} />
        <Route path="/resident-app/profile" element={<ResidentApp defaultTab="profile" />} />
        <Route path="/resident-app/access" element={<ResidentApp defaultTab="now" />} />
        <Route path="/resident-app/building/:slug" element={<ResidentApp defaultTab="map" />} />
        <Route path="/resident-app/place/:slug" element={<ResidentApp defaultTab="map" />} />
        <Route path="/resident-app/event/:slug" element={<ResidentApp defaultTab="map" />} />
        <Route path="/resident-app/perk/:slug" element={<ResidentApp defaultTab="card" />} />

        <Route path="*" element={<PageNotFound />} />
      </Route>
    </Routes>
  );
};

function BrandAnalyticsFallback() {
  return <PageNotFound />;
}

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
