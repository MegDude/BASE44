import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import HeroSection from "@/components/home/HeroSection";
import WhySection from "@/components/home/WhySection";
import LiveTonight from "@/components/home/LiveTonight";
import PartnerSlides from "@/components/home/PartnerSlides";
import PricingSection from "@/components/home/PricingSection";
import FAQSection from "@/components/home/FAQSection";
import ContactSection from "@/components/home/ContactSection";

const DEFAULT_MAP_CONTEXT = {
  query: "",
  category: "all",
  askMode: false,
  walkMinutes: null,
  toggles: [],
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
    toggles = [],
  } = {}) => {
    const params = new URLSearchParams();
    const trimmedQuery = String(query || "").trim();

    if (trimmedQuery) params.set("query", trimmedQuery);
    if (category && category !== "all") params.set("category", category);
    if (Number.isFinite(walkMinutes)) params.set("category", "5min");
    if (Array.isArray(toggles) && toggles.length > 0) params.set("toggles", toggles.join(","));
    if (askMode) params.set("mode", "ask");

    const nextUrl = params.toString()
      ? `/downtown-perks/explore?${params.toString()}`
      : "/downtown-perks/explore";

    navigate(nextUrl);
  }, [navigate]);

  const handleExplore = useCallback(
    ({ query = "", category = "all", walkMinutes = null, toggles = [] } = {}) => {
      updateMapContext({
        query,
        category,
        walkMinutes,
        askMode: false,
        toggles,
      });
      openExploreRoute({ query, category, walkMinutes, askMode: false, toggles });
    },
    [openExploreRoute, updateMapContext]
  );

  const handleAsk = useCallback(
    ({ query = "", category = "all", walkMinutes = null, toggles = [] } = {}) => {
      updateMapContext({
        query,
        category,
        walkMinutes,
        askMode: true,
        toggles,
      });
      openExploreRoute({ query, category, walkMinutes, askMode: true, toggles });
    },
    [openExploreRoute, updateMapContext]
  );

  return (
    <div className="bg-background">
      <HeroSection
        mapContext={mapContext}
        onExplore={handleExplore}
        onAsk={handleAsk}
      />
      <WhySection />
      <LiveTonight />
      <PartnerSlides />
      <PricingSection />
      <FAQSection />
      <ContactSection />
    </div>
  );
}
