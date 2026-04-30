import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "@/lib/query-client";
import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import PageNotFound from "./lib/PageNotFound";
import { AuthProvider } from "./lib/AuthContext";
import Layout from "./components/Layout";
import Pricing from "./pages/Pricing";
import Home from "./pages/Home";
import Map from "./pages/Map";
import DashboardHub from "./pages/DashboardHub";
import DashboardAbout from "./pages/DashboardAbout";
import BuildingIntelligence from "./pages/BuildingIntelligence";
import PartnerWorkspace from "./pages/PartnerWorkspace";
import Dashboard from "./pages/Dashboard";
import AskMapAgent from "./pages/AskMapAgent";
import PartnerDashboard from "./pages/PartnerDashboard";
import Residents from "./pages/Residents";
import ResidentApp from "./pages/resident-app";
import WalkingHappyHour from "./pages/residents/WalkingHappyHour";
import BuildPack from "./pages/BuildPack";
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
import BrandAnalytics from "./pages/downtown-perks/brands/BrandAnalytics";
import PartnersIndex from "./pages/partners/Index";
import PropertiesPartner from "./pages/partners/Properties";
import HotelsPartner from "./pages/partners/Hotels";
import VenuesPartner from "./pages/partners/Venues";
import BrandsPartner from "./pages/partners/Brands";
import CivicPartner from "./pages/partners/Civic";
import PartnerApply from "./pages/partners/Apply";
import PartnerDashboardUnified from "./pages/partners/Dashboard";
import AdminQA from "./pages/AdminQA";
import { CTAFlowProvider } from "./components/cta/CTAFlowProvider";
import { ROUTES } from "@/lib/routes";

function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path={ROUTES.map} element={<Map />} />
        <Route path={ROUTES.explore} element={<ExploreRebuilt />} />
        <Route path={ROUTES.askMap} element={<AskMapAgent />} />
        <Route path="/search" element={<Map />} />
        <Route path="/ask-the-map" element={<Map />} />
        <Route path={ROUTES.events} element={<Events />} />
        <Route path={ROUTES.happyHourWalkingMap} element={<Navigate to={ROUTES.residentWalkingHappyHour} replace />} />
        <Route path={ROUTES.perks} element={<PerksPage />} />
        <Route path={ROUTES.card} element={<PerksCard />} />
        <Route path={ROUTES.about} element={<About />} />
        <Route path={ROUTES.buildPack} element={<BuildPack />} />
        <Route path="/implementation-spec" element={<BuildPack />} />
        <Route path="/downtown-perks" element={<Navigate to={ROUTES.home} replace />} />
        <Route path="/downtown-perks/explore" element={<Navigate to={ROUTES.explore} replace />} />
        <Route path="/downtown-perks/events" element={<Navigate to={ROUTES.events} replace />} />
        <Route path="/downtown-perks/happy-hour-walking-map" element={<Navigate to={ROUTES.residentWalkingHappyHour} replace />} />
        <Route path="/downtown-perks/perks" element={<Navigate to={ROUTES.perks} replace />} />
        <Route path="/downtown-perks/card" element={<Navigate to={ROUTES.card} replace />} />
        <Route path="/downtown-perks/for-buildings" element={<Navigate to={ROUTES.partnerProperties} replace />} />
        <Route path="/downtown-perks/about" element={<Navigate to={ROUTES.about} replace />} />
        <Route path="/downtown-perks/build-pack" element={<Navigate to={ROUTES.buildPack} replace />} />
        <Route path="/downtown-perks/*" element={<Navigate to={ROUTES.home} replace />} />

        <Route path={ROUTES.brands} element={<Navigate to={ROUTES.partnerBrands} replace />} />
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
        <Route path="/brands/laz-y-boy-park" element={<Navigate to="/brands/austin-fc" replace />} />
        <Route path="/brands/fabi-and-rosi" element={<FabiAndRosi />} />
        <Route path="/brands/hotel-van-zandt" element={<HotelVanZandt />} />
        <Route path="/brands/four-seasons" element={<FourSeasons />} />
        <Route path="/brands/four-seasons-residences" element={<FourSeasonsResidences />} />
        <Route path="/brands/the-shore" element={<TheShore />} />
        <Route path="/brands/inspired-closets-austin" element={<InspiredClosetsAustin />} />

        <Route path={ROUTES.partners} element={<PartnersIndex />} />
        <Route path={ROUTES.partnerResidential} element={<Navigate to={ROUTES.partnerProperties} replace />} />
        <Route path={ROUTES.partnerProperties} element={<PropertiesPartner />} />
        <Route path="/property-and-building-management" element={<PropertiesPartner />} />
        <Route path={ROUTES.partnerHotelsLegacy} element={<HotelsPartner />} />
        <Route path={ROUTES.partnerHospitality} element={<Navigate to={ROUTES.partnerHotelsLegacy} replace />} />
        <Route path={ROUTES.partnerVenues} element={<VenuesPartner />} />
        <Route path={ROUTES.partnerBrands} element={<BrandsPartner />} />
        <Route path={ROUTES.partnerCivic} element={<CivicPartner />} />
        <Route path={ROUTES.partnerApply} element={<PartnerApply />} />

        <Route path={ROUTES.partnerDashboard} element={<PartnerDashboardUnified />} />
        <Route path="/partners/dashboard/overview" element={<PartnerDashboardUnified />} />
        <Route path="/partners/dashboard/map" element={<PartnerDashboardUnified />} />
        <Route path="/partners/dashboard/properties" element={<PartnerDashboardUnified />} />
        <Route path={ROUTES.partnerDashboardResidential} element={<PartnerDashboardUnified />} />
        <Route path={ROUTES.partnerDashboardHospitality} element={<PartnerDashboardUnified />} />
        <Route path={ROUTES.partnerDashboardVenues} element={<PartnerDashboardUnified />} />
        <Route path={ROUTES.partnerDashboardBrands} element={<PartnerDashboardUnified />} />
        <Route path={ROUTES.partnerDashboardCivic} element={<PartnerDashboardUnified />} />
        <Route path="/partners/dashboard/perks" element={<PartnerDashboardUnified />} />
        <Route path="/partners/dashboard/events" element={<PartnerDashboardUnified />} />
        <Route path="/partners/dashboard/campaigns" element={<PartnerDashboardUnified />} />
        <Route path="/partners/dashboard/redemptions" element={<PartnerDashboardUnified />} />
        <Route path="/partners/dashboard/integrations" element={<PartnerDashboardUnified />} />
        <Route path="/partners/dashboard/performance" element={<PartnerDashboardUnified />} />
        <Route path="/partners/dashboard/reports" element={<PartnerDashboardUnified />} />
        <Route path="/partners/dashboard/settings" element={<PartnerDashboardUnified />} />
        <Route path="/partners/dashboard/about" element={<Navigate to={ROUTES.partnerWorkspace} replace />} />
        <Route path={ROUTES.partnerWorkspace} element={<PartnerWorkspace />} />
        <Route path="/admin/qa" element={<AdminQA />} />
        <Route path={ROUTES.dashboardHub} element={<DashboardHub />} />
        <Route path="/dashboard/about" element={<DashboardAbout />} />
        <Route path="/dashboard/partner" element={<Dashboard />} />
        <Route path="/dashboard/partner/properties" element={<PropertiesPartner />} />
        <Route path="/dashboard/resident" element={<ResidentApp />} />
        <Route path="/partner-dashboard" element={<PartnerDashboard />} />

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

        <Route path={ROUTES.residents} element={<Residents />} />
        <Route path={ROUTES.residentWalkingHappyHour} element={<WalkingHappyHour />} />
        <Route path={ROUTES.residentApp} element={<ResidentApp />} />
        <Route path="/resident-app/map" element={<ResidentApp />} />
        <Route path="/resident-app/events" element={<ResidentApp />} />
        <Route path="/resident-app/explore" element={<ResidentApp />} />
        <Route path="/resident-app/perks" element={<ResidentApp />} />
        <Route path="/resident-app/properties" element={<ResidentApp />} />
        <Route path="/resident-app/saved" element={<ResidentApp />} />
        <Route path="/resident-app/plan" element={<ResidentApp />} />
        <Route path="/resident-app/card" element={<ResidentApp />} />
        <Route path="/resident-app/profile" element={<ResidentApp />} />
        <Route path="/resident-app/you" element={<ResidentApp />} />
        <Route path="/resident-app/station" element={<ResidentApp />} />

        <Route path="/pricing" element={<Pricing />} />
        <Route path="*" element={<PageNotFound />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <CTAFlowProvider>
            <AppRoutes />
          </CTAFlowProvider>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
