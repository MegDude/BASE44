import { useCallback, useState } from "react";
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
  const [mapContext, setMapContext] = useState(DEFAULT_MAP_CONTEXT);

  const scrollToMap = useCallback(() => {
    document.getElementById("home-live-map")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  const updateMapContext = useCallback((nextState) => {
    setMapContext((current) => ({
      ...current,
      ...nextState,
      requestKey: current.requestKey + 1,
    }));
  }, []);

  const handleExplore = useCallback(
    ({ query = "", category = "all", walkMinutes = null } = {}) => {
      updateMapContext({
        query,
        category,
        walkMinutes,
        askMode: false,
      });
      scrollToMap();
    },
    [scrollToMap, updateMapContext]
  );

  const handleAsk = useCallback(
    ({ query = "", category = "all", walkMinutes = null } = {}) => {
      updateMapContext({
        query,
        category,
        walkMinutes,
        askMode: true,
      });
      scrollToMap();
    },
    [scrollToMap, updateMapContext]
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
