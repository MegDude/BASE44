import FAQSection from "@/components/home/FAQSection";
import HomeNarrativeSection from "@/components/home/HomeNarrativeSection";
import PartnerSlides from "@/components/home/PartnerSlides";
import PricingSection from "@/components/home/PricingSection";
import MapShell from "@/components/map/MapShell";

export default function Home() {
  return (
    <main>
      <MapShell mode="home" />
      <HomeNarrativeSection />
      <PartnerSlides />
      <PricingSection />
      <FAQSection />
    </main>
  );
}
