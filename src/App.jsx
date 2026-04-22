import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "@/lib/query-client";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import PageNotFound from "./lib/PageNotFound";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Pricing from "./pages/Pricing";
import DashboardHub from "./pages/DashboardHub";
// Downtown Perks pages
import ExploreRebuilt from "./pages/downtown-perks/ExploreRebuilt";
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
import ResidentApp from "./pages/resident-app";
import BrandAnalytics from "./pages/downtown-perks/brands/BrandAnalytics";

function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <Router>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />

            <Route path="/map" element={<ExploreRebuilt />} />
            <Route path="/explore" element={<ExploreRebuilt />} />
            <Route path="/events" element={<Events />} />
            <Route path="/perks" element={<PerksPage />} />
            <Route path="/card" element={<PerksCard />} />
            <Route path="/about" element={<About />} />

            <Route path="/downtown-perks" element={<Home />} />
            <Route path="/downtown-perks/explore" element={<ExploreRebuilt />} />
            <Route path="/downtown-perks/events" element={<Events />} />
            <Route path="/downtown-perks/perks" element={<PerksPage />} />
            <Route path="/downtown-perks/card" element={<PerksCard />} />
            <Route path="/downtown-perks/for-buildings" element={<ForBuildings />} />
            <Route path="/downtown-perks/about" element={<About />} />

            <Route path="/brands" element={<BrandsIndex />} />
            <Route path="/brands/analytics" element={<BrandAnalytics />} />
            <Route path="/brands/the-paseo" element={<ThePaseo />} />
            <Route path="/brands/the-waterline" element={<TheWaterline />} />
            <Route path="/brands/bangers" element={<Bangers />} />
            <Route path="/brands/the-stay-put" element={<TheStayPut />} />
            <Route path="/brands/yeti" element={<Yeti />} />
            <Route path="/brands/rivian" element={<Rivian />} />
            <Route path="/brands/lululemon" element={<Lululemon />} />
            <Route path="/brands/equinox" element={<Equinox />} />
            <Route path="/brands/austin-fc" element={<AustinFC />} />
            <Route path="/brands/laz-y-boy-park" element={<AustinFC />} />
            <Route path="/brands/fabi-and-rosi" element={<FabiAndRosi />} />
            <Route path="/brands/hotel-van-zandt" element={<HotelVanZandt />} />
            <Route path="/brands/four-seasons" element={<FourSeasons />} />
            <Route path="/brands/four-seasons-residences" element={<FourSeasonsResidences />} />
            <Route path="/brands/the-shore" element={<TheShore />} />

            <Route path="/partners" element={<PartnersIndex />} />
            <Route path="/partners/civic" element={<CivicPartner />} />
            <Route path="/partners/residential" element={<ResidentialPartner />} />
            <Route path="/partners/properties" element={<PropertiesPartner />} />
            <Route path="/property-and-building-management" element={<PropertiesPartner />} />
            <Route path="/partners/hospitality" element={<HotelsPartner />} />
            <Route path="/partners/hotels" element={<HotelsPartner />} />
            <Route path="/partners/venues" element={<VenuesPartner />} />
            <Route path="/partners/brands" element={<BrandsPartner />} />
            <Route path="/partners/dashboard" element={<Dashboard />} />
            <Route path="/partner-workspace" element={<PartnerWorkspace />} />
            <Route path="/dashboard" element={<DashboardHub />} />
            <Route path="/dashboard/partner" element={<Dashboard />} />
            <Route path="/buildings/:buildingId" element={<BuildingIntelligence />} />
            <Route path="/buildings/:buildingId/residents" element={<BuildingIntelligence />} />
            <Route path="/buildings/:buildingId/amenities" element={<BuildingIntelligence />} />
            <Route path="/buildings/:buildingId/maintenance" element={<BuildingIntelligence />} />
            <Route path="/buildings/:buildingId/reports" element={<BuildingIntelligence />} />
            <Route path="/buildings/:buildingId/partners" element={<BuildingIntelligence />} />
            <Route path="/properties/:buildingId" element={<BuildingIntelligence />} />
            <Route path="/properties/:buildingId/residents" element={<BuildingIntelligence />} />
            <Route path="/properties/:buildingId/amenities" element={<BuildingIntelligence />} />
            <Route path="/properties/:buildingId/maintenance" element={<BuildingIntelligence />} />
            <Route path="/properties/:buildingId/reports" element={<BuildingIntelligence />} />
            <Route path="/properties/:buildingId/partners" element={<BuildingIntelligence />} />
            <Route path="/dashboard/partner/properties" element={<PropertiesPartner />} />
            <Route path="/dashboard/resident" element={<ResidentApp />} />
            <Route path="/partner-dashboard" element={<PartnerDashboard />} />
            <Route path="/resident-app" element={<ResidentApp />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="*" element={<PageNotFound />} />
          </Route>
        </Routes>
      </Router>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
