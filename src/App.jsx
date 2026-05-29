import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "@/lib/query-client";
import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from "react-router-dom";
import PageNotFound from "./lib/PageNotFound";
import { AuthProvider } from "@/lib/AuthContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import SplashPage from "./pages/SplashPage";
import DashboardHub from "./pages/DashboardHub";
import Pricing from "./pages/Pricing";
// Downtown Perks pages
import Landing from "./pages/downtown-perks/Landing";
import Events from "./pages/downtown-perks/Events";
import PerksPage from "./pages/downtown-perks/PerksPage";
import PerksCard from "./pages/downtown-perks/PerksCard";
import ForBuildings from "./pages/downtown-perks/ForBuildings";
import About from "./pages/downtown-perks/About";
// Brands pages
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
import PartnerWorkspace from "./pages/PartnerWorkspace";
import Dashboard from "./pages/Dashboard";
import PartnerDashboard from "./pages/PartnerDashboard";
import BuildingIntelligence from "./pages/BuildingIntelligence";
import PropertiesPartner from "./pages/partners/Properties";
import HotelsPartner from "./pages/partners/Hotels";
import VenuesPartner from "./pages/partners/Venues";
import BrandsPartner from "./pages/partners/Brands";
import PartnersDashboardPage from "./pages/partners/Dashboard";
import ResidentApp from "./pages/resident-app";
import BrandAnalytics from "./pages/downtown-perks/brands/BrandAnalytics";
// New Map Page import
import MapPage from "./pages/Map";
import AskMapAgent from "./pages/AskMapAgent";
import HappyHourMap from "./pages/HappyHourMap";

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

const AuthenticatedApp = () => {
  return (
    <>
      <HashScroll />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<SplashPage />} />
        {/* Downtown Perks routes */}
        <Route path="/downtown-perks" element={<Landing />} />
        <Route path="/residents" element={<Home />} />
        <Route path="/residents/map" element={<MapPage />} />
        <Route path="/residents/discover" element={<MapPage />} />
        <Route path="/residents/events" element={<Events />} />
        <Route path="/residents/events/:eventId" element={<Events />} />
        <Route path="/residents/perks" element={<MapPage />} />
        <Route path="/residents/card" element={<PerksCard />} />
        <Route path="/residents/about" element={<About />} />
        <Route path="/residents/ask" element={<AskMapAgent />} />
        <Route path="/residents/happy-hour" element={<HappyHourMap />} />
        <Route path="/residents/workspace" element={<ResidentApp />} />
        <Route path="/resident-home" element={<Home />} />
        <Route path="/downtown-perks/explore" element={<MapPage />} />
        <Route path="/explore" element={<MapPage />} />
        <Route path="/downtown-perks/events" element={<Events />} />
        <Route path="/events" element={<Events />} />
        <Route path="/downtown-perks/perks" element={<PerksPage />} />
        <Route path="/perks" element={<Navigate to="/map?mode=resident&tab=pass" replace />} />
        <Route path="/perks-card" element={<PerksCard />} />
        <Route path="/downtown-perks/card" element={<PerksCard />} />
        <Route path="/card" element={<PerksCard />} />
        <Route path="/downtown-perks/for-buildings" element={<ForBuildings />} />
        <Route path="/downtown-perks/about" element={<About />} />
        <Route path="/about" element={<About />} />
        <Route path="/ask-map" element={<AskMapAgent />} />
        <Route path="/happy-hour-walking-map" element={<HappyHourMap />} />
        <Route path="/events/:eventId" element={<Events />} />
        {/* Brands routes */}
        <Route path="/brands" element={<BrandsIndex />} />
        <Route path="/downtown-perks/brands" element={<BrandsIndex />} />
        <Route path="/brands/analytics" element={<BrandAnalytics />} />
        <Route path="/downtown-perks/brands/analytics" element={<BrandAnalytics />} />
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
        <Route path="/brand-page" element={<BrandsIndex />} />
        <Route path="/brand-page/:brandId" element={<BrandsIndex />} />
        <Route path="/brands/:brandSlug" element={<BrandsIndex />} />
        {/* Partners routes */}
        <Route path="/partners" element={<PartnersIndex />} />
        <Route path="/partners/map" element={<MapPage />} />
        <Route path="/partners/dashboard" element={<PartnersDashboardPage />} />
        <Route path="/partners/happy-hours" element={<PartnersDashboardPage />} />
        <Route path="/partners/campaigns" element={<PartnersDashboardPage />} />
        <Route path="/partners/reports" element={<Dashboard />} />
        <Route path="/partners/analytics" element={<Dashboard />} />
        <Route path="/partners/workspace" element={<PartnerWorkspace />} />
        <Route path="/partners/workspace/overview" element={<PartnerWorkspace />} />
        <Route path="/partners/workspace/campaigns" element={<PartnerWorkspace />} />
        <Route path="/partners/workspace/analytics" element={<Dashboard />} />
        <Route path="/partners/workspace/buildings" element={<PropertiesPartner />} />
        <Route path="/partners/workspace/events/:eventId" element={<Events />} />
        <Route path="/partners/brand-directory" element={<BrandsIndex />} />
        <Route path="/partners/brand-directory/analytics" element={<BrandAnalytics />} />
        <Route path="/partners/brand-directory/the-paseo" element={<ThePaseo />} />
        <Route path="/partners/brand-directory/the-waterline" element={<TheWaterline />} />
        <Route path="/partners/brand-directory/bangers" element={<Bangers />} />
        <Route path="/partners/brand-directory/the-stay-put" element={<TheStayPut />} />
        <Route path="/partners/brand-directory/yeti" element={<Yeti />} />
        <Route path="/partners/brand-directory/rivian" element={<Rivian />} />
        <Route path="/partners/brand-directory/lululemon" element={<Lululemon />} />
        <Route path="/partners/brand-directory/equinox" element={<Equinox />} />
        <Route path="/partners/brand-directory/laz-y-boy-park" element={<AustinFC />} />
        <Route path="/partners/brand-directory/fabi-and-rosi" element={<FabiAndRosi />} />
        <Route path="/partners/brand-directory/hotel-van-zandt" element={<HotelVanZandt />} />
        <Route path="/partners/brand-directory/four-seasons" element={<FourSeasons />} />
        <Route path="/partners/brand-directory/four-seasons-residences" element={<FourSeasonsResidences />} />
        <Route path="/partners/brand-directory/the-shore" element={<TheShore />} />
        <Route path="/partners/brand-directory/:brandSlug" element={<BrandsIndex />} />
        <Route path="/partner-home" element={<PartnersIndex />} />
        <Route path="/partners/civic" element={<CivicPartner />} />
        <Route path="/partners/residential" element={<ResidentialPartner />} />
        <Route path="/partners/properties" element={<PropertiesPartner />} />
        <Route path="/partners/properties/:buildingId" element={<BuildingIntelligence />} />
        <Route path="/partners/properties/:buildingId/:tabId" element={<BuildingIntelligence />} />
        <Route path="/partners/pricing" element={<Pricing />} />
        <Route path="/property-and-building-management" element={<PropertiesPartner />} />
        <Route path="/partner-workspace" element={<PartnerWorkspace />} />
        <Route path="/partner-workspace/overview" element={<PartnerWorkspace />} />
        <Route path="/partner-workspace/reports" element={<Dashboard />} />
        <Route path="/partner-workspace/campaigns" element={<PartnerWorkspace />} />
        <Route path="/partner-workspace/analytics" element={<Dashboard />} />
        <Route path="/partner-workspace/buildings" element={<PropertiesPartner />} />
        <Route path="/partner-workspace/events/:eventId" element={<Events />} />
        <Route path="/partner-portal" element={<PartnerWorkspace />} />
        <Route path="/reports" element={<Dashboard />} />
        <Route path="/perk-analytics" element={<Dashboard />} />
        <Route path="/building-engagement" element={<PropertiesPartner />} />
        <Route path="/building-intelligence" element={<PropertiesPartner />} />
        <Route path="/building-intelligence/:buildingId" element={<BuildingIntelligence />} />
        <Route path="/building-intelligence/:buildingId/:tabId" element={<BuildingIntelligence />} />
        <Route path="/buildings/:buildingId" element={<BuildingIntelligence />} />
        <Route path="/buildings/:buildingId/:tabId" element={<BuildingIntelligence />} />
        <Route path="/properties/:buildingId" element={<BuildingIntelligence />} />
        <Route path="/properties/:buildingId/:tabId" element={<BuildingIntelligence />} />
        <Route path="/buildings-management" element={<PropertiesPartner />} />
        <Route path="/buildings-with-residents" element={<PropertiesPartner />} />
        <Route path="/developer-engagement" element={<PropertiesPartner />} />
        <Route path="/engagement-hub" element={<Dashboard />} />
        <Route path="/segmentation" element={<Dashboard />} />
        <Route path="/surveys" element={<Dashboard />} />
        <Route path="/welcome-flow" element={<ResidentApp />} />
        <Route path="/announcement-manager" element={<Dashboard />} />
        <Route path="/dashboard" element={<DashboardHub />} />
        <Route path="/dashboard/partner" element={<Dashboard />} />
        <Route path="/dashboard/partner/properties" element={<PropertiesPartner />} />
        <Route path="/dashboard/resident" element={<ResidentApp />} />
        <Route path="/partner-dashboard" element={<PartnerDashboard />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/partners/hospitality" element={<HotelsPartner />} />
        <Route path="/partners/hotels" element={<HotelsPartner />} />
        <Route path="/partners/venues" element={<VenuesPartner />} />
        <Route path="/partners/brands" element={<BrandsPartner />} />
        <Route path="/resident-app" element={<ResidentApp />} />
        <Route path="/resident-workspace" element={<ResidentApp />} />
        <Route path="/contact" element={<Navigate to="/#contact" replace />} />
        {/* Map page route */}
        <Route path="/map" element={<MapPage />} />
        {/* Catch-all route */}
        <Route path="*" element={<PageNotFound />} />
        </Route>
      </Routes>
    </>
  );
};

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
