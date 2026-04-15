import ProductEntryLayer from "../components/home/ProductEntryLayer";
import HeroSection from "../components/home/HeroSection";
import WhySection from "../components/home/WhySection";
import MapSection from "../components/home/MapSection";
import PartnerSlides from "../components/home/PartnerSlides";
import PricingSection from "../components/home/PricingSection";
import FAQSection from "../components/home/FAQSection";
import ContactSection from "../components/home/ContactSection";

export default function Home() {
  return (
    <div className="bg-background">
      {/* Layer 1: Product Entry (immediate interaction) */}
      <ProductEntryLayer />

      {/* Layer 2: Marketing Homepage (refined messaging) */}
      <HeroSection />
      <WhySection />
      <MapSection />
      <PartnerSlides />
      <PricingSection />
      <FAQSection />
      <ContactSection />
    </div>
  );
}