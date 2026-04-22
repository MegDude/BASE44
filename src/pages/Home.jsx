import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import HeroSection from "@/components/home/HeroSection";
import WhySection from "@/components/home/WhySection";
import MapSection from "@/components/home/MapSection";
import PartnerSlides from "@/components/home/PartnerSlides";
import PricingSection from "@/components/home/PricingSection";
import FAQSection from "@/components/home/FAQSection";
import ContactSection from "@/components/home/ContactSection";

const DEFAULT_MAP_CONTEXT = {
  query: "",
  category: "all",
  askMode: false,
  walkMinutes: null,
  requestKey: 0,
};

export default function Home() {
  const navigate = useNavigate();
  const [mapContext, setMapContext] = useState(DEFAULT_MAP_CONTEXT);

  const updateMapContext = useCallback((nextState) => {
    setMapContext((current) => ({
      ...current,
      ...nextState,
      requestKey: current.requestKey + 1,
    }));
  }, []);

  const openExploreRoute = useCallback(({
    query = "",
    category = "all",
    walkMinutes = null,
    askMode = false,
  } = {}) => {
    const params = new URLSearchParams();
    const trimmedQuery = String(query || "").trim();

    if (trimmedQuery) params.set("query", trimmedQuery);
    if (category && category !== "all") params.set("category", category);
    if (Number.isFinite(walkMinutes)) params.set("category", "5min");
    if (askMode) params.set("mode", "ask");

    const nextUrl = params.toString()
      ? `/downtown-perks/explore?${params.toString()}`
      : "/downtown-perks/explore";

    navigate(nextUrl);
  }, [navigate]);

  const handleExplore = useCallback(
    ({ query = "", category = "all", walkMinutes = null } = {}) => {
      updateMapContext({
        query,
        category,
        walkMinutes,
        askMode: false,
      });
      openExploreRoute({ query, category, walkMinutes, askMode: false });
    },
    [openExploreRoute, updateMapContext]
  );

  const handleAsk = useCallback(
    ({ query = "", category = "all", walkMinutes = null } = {}) => {
      updateMapContext({
        query,
        category,
        walkMinutes,
        askMode: true,
      });
      openExploreRoute({ query, category, walkMinutes, askMode: true });
    },
    [openExploreRoute, updateMapContext]
  );

  const handleMapContextChange = useCallback((nextState) => {
    setMapContext((current) => ({
      ...current,
      ...nextState,
    }));
  }, []);

  return (
    <div className="bg-background">
      <HeroSection
        mapContext={mapContext}
        onExplore={handleExplore}
        onAsk={handleAsk}
      />
      <WhySection />
      <MapSection
        mapContext={mapContext}
        onMapContextChange={handleMapContextChange}
      />
      <PartnerSlides />
      <PricingSection />
      <FAQSection />
      <ContactSection />
    </div>
  );
}
