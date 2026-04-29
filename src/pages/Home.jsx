import MapShell from "@/components/map/MapShell";
import WhySection from "@/components/home/WhySection";
import LiveTonight from "@/components/home/LiveTonight";
import PartnerSlides from "@/components/home/PartnerSlides";
import PricingSection from "@/components/home/PricingSection";
import FAQSection from "@/components/home/FAQSection";
import ContactSection from "@/components/home/ContactSection";

export default function Home() {
  return (
    <main>
      <MapShell mode="home" />
      <WhySection />
      <LiveTonight />
      <PartnerSlides />
      <PricingSection />
      <FAQSection />
      <ContactSection />
    </main>
  );
}
