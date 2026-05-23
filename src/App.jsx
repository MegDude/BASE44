import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "@/lib/query-client";
import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import PageNotFound from "./lib/PageNotFound";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Pricing from "./pages/Pricing";
import DashboardHub from "./pages/DashboardHub";
import DashboardAbout from "./pages/DashboardAbout";
// Downtown Perks pages
import ExploreRebuilt from "./pages/downtown-perks/ExploreRebuilt";
import Events from "./pages/downtown-perks/Events";
import HappyHourWalkingMap from "./pages/downtown-perks/HappyHourWalkingMap";
import PerksPage from "./pages/downtown-perks/PerksPage";
import PerksCard from "./pages/downtown-perks/PerksCard";
import ForBuildings from "./pages/downtown-perks/ForBuildings";
import About from "./pages/downtown-perks/About";
import BuildPack from "./pages/BuildPack";
// Brands pages
import BrandsIndex from "./pages/downtown-perks/brands/Index";
import ThePaseo from "./pages/downtown-perks/brands/ThePaseo";
import TheWaterline from "./pages/downtown-perks/brands/TheWaterline";
import Bangers from "./pages/downtown-perks/brands/Bangers";
import TheStayPut from "./pages/downtown-perks/brands/TheStayPut";
import FineEyewear from "./pages/downtown-perks/brands/FineEyewear";
import HeritageBoots from "./pages/downtown-perks/brands/HeritageBoots";
import DottieMay from "./pages/downtown-perks/brands/DottieMay";
import TopoChico from "./pages/downtown-perks/brands/TopoChico";
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
import InspiredClosetsAustin from "./pages/downtown-perks/brands/InspiredClosetsAustin";
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
import Residents from "./pages/Residents";
import BrandAnalytics from "./pages/downtown-perks/brands/BrandAnalytics";
import { CTAFlowProvider } from "./components/cta/CTAFlowProvider";
import { ROUTES } from "@/lib/routes";

function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <Router>
        <CTAFlowProvider>
          <Routes>
            <Route element={<Layout />}>
            <Route path="/" element={<Home />} />

            <Route path="/map" element={<ExploreRebuilt />} />
            <Route path="/explore" element={<ExploreRebuilt />} />
            <Route path="/events" element={<Events />} />
            <Route path="/happy-hour-walking-map" element={<HappyHourWalkingMap />} />
            <Route path="/perks" element={<PerksPage />} />
            <Route path="/card" element={<PerksCard />} />
            <Route path="/about" element={<About />} />
            <Route path="/build-pack" element={<BuildPack />} />
            <Route path="/implementation-spec" element={<BuildPack />} />

            <Route path="/downtown-perks" element={<Home />} />
            <Route path="/downtown-perks/explore" element={<ExploreRebuilt />} />
            <Route path="/downtown-perks/events" element={<Events />} />
            <Route path="/downtown-perks/happy-hour-walking-map" element={<HappyHourWalkingMap />} />
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
            <Route path="/brands/fine-eyewear" element={<FineEyewear />} />
            <Route path="/brands/heritage-boots" element={<HeritageBoots />} />
            <Route path="/brands/dottie-may" element={<DottieMay />} />
            <Route path="/brands/topo-chico" element={<TopoChico />} />
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
            <Route path="/brands/inspired-closets-austin" element={<InspiredClosetsAustin />} />

            <Route path="/partners" element={<PartnersIndex />} />
            <Route path="/partners/civic" element={<CivicPartner />} />
            <Route path="/partners/residential" element={<ResidentialPartner />} />
            <Route path="/partners/properties" element={<PropertiesPartner />} />
            <Route path="/property-and-building-management" element={<PropertiesPartner />} />
            <Route path={ROUTES.partnerHotelsLegacy} element={<Navigate to={ROUTES.partnerHospitality} replace />} />
            <Route path={ROUTES.partnerHospitality} element={<HotelsPartner />} />
            <Route path="/partners/venues" element={<VenuesPartner />} />
            <Route path="/partners/brands" element={<BrandsPartner />} />
            <Route path="/partners/dashboard" element={<Dashboard />} />
            <Route path="/partners/dashboard/overview" element={<Dashboard />} />
            <Route path="/partners/dashboard/map" element={<Dashboard />} />
            <Route path="/partners/dashboard/residential" element={<Dashboard />} />
            <Route path="/partners/dashboard/hospitality" element={<Dashboard />} />
            <Route path="/partners/dashboard/venues" element={<Dashboard />} />
            <Route path="/partners/dashboard/brands" element={<Dashboard />} />
            <Route path="/partners/dashboard/civic" element={<Dashboard />} />
            <Route path="/partners/dashboard/perks" element={<Dashboard />} />
            <Route path="/partners/dashboard/events" element={<Dashboard />} />
            <Route path="/partners/dashboard/campaigns" element={<Dashboard />} />
            <Route path="/partners/dashboard/redemptions" element={<Dashboard />} />
            <Route path="/partners/dashboard/integrations" element={<Dashboard />} />
            <Route path="/partners/dashboard/performance" element={<Dashboard />} />
            <Route path="/partners/dashboard/reports" element={<Dashboard />} />
            <Route path="/partners/dashboard/settings" element={<Dashboard />} />
            <Route path="/partners/dashboard/about" element={<DashboardAbout />} />
            <Route path="/partner-workspace" element={<PartnerWorkspace />} />
            <Route path="/dashboard" element={<DashboardHub />} />
            <Route path="/dashboard/about" element={<DashboardAbout />} />
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
            <Route path="/residents" element={<Residents />} />
            <Route path="/partner-dashboard" element={<PartnerDashboard />} />
            <Route path="/resident-app" element={<ResidentApp />} />
            <Route path="/resident-app/map" element={<ResidentApp />} />
            <Route path="/resident-app/saved" element={<ResidentApp />} />
            <Route path="/resident-app/plan" element={<ResidentApp />} />
            <Route path="/resident-app/card" element={<ResidentApp />} />
            <Route path="/resident-app/you" element={<ResidentApp />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="*" element={<PageNotFound />} />
            </Route>
          </Routes>
        </CTAFlowProvider>
      </Router>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
