import PageShell from "@/components/layout/PageShell";
import HomeEventsPreview from "@/components/home/HomeEventsPreview";
import HomeFAQ from "@/components/home/HomeFAQ";
import HomeFinalCTA from "@/components/home/HomeFinalCTA";
import HomeGetStarted from "@/components/home/HomeGetStarted";
import HomeHero from "@/components/home/HomeHero";
import HomeHowItWorks from "@/components/home/HomeHowItWorks";
import HomePartnerOverview from "@/components/home/HomePartnerOverview";
import HomePartnerValueSection from "@/components/home/PartnerValueSection";
import HomePerksCard from "@/components/home/HomePerksCard";
import HomePricingPreviewSection from "@/components/home/PricingPreviewSection";
import HomeProductExplanationSection from "@/components/home/ProductExplanationSection";
import HomePropertiesPreviewSection from "@/components/home/PropertiesPreviewSection";
import HomeResidentStory from "@/components/home/HomeResidentStory";
import HomeSearchMap from "@/components/home/HomeSearchMap";
import HomeWhatYouCanDoSection from "@/components/home/WhatYouCanDoSection";
import HomeNearbySection from "@/components/home/NearbySection";
import { homePageCopy } from "@/content/homePageCopy";
import { faqItems, getStartedRoles, homeEvents } from "@/data/homePageData";

const heroMetrics = [
  { value: "Map", label: "discovery" },
  { value: "Card", label: "access" },
  { value: "Dashboard", label: "proof" },
];

export default function Home() {
  return (
    <PageShell>
      <HomeHero copy={homePageCopy.hero} metrics={heroMetrics} />
      <HomeSearchMap searchCopy={homePageCopy.search} mapCopy={homePageCopy.mapPreview} />
      <HomeResidentStory copy={homePageCopy.residentStory} />
      <HomeProductExplanationSection copy={homePageCopy.productExplanation} />
      <HomeWhatYouCanDoSection copy={homePageCopy.whatYouCanDo} />
      <HomeHowItWorks copy={homePageCopy.howItWorks} />
      <HomePerksCard copy={homePageCopy.card} />
      <HomeEventsPreview copy={homePageCopy.events} events={homeEvents} />
      <HomePropertiesPreviewSection copy={homePageCopy.propertiesPreview} />
      <HomeNearbySection copy={homePageCopy.nearby} />
      <HomePartnerValueSection copy={homePageCopy.partnerValue} />
      <HomePartnerOverview copy={homePageCopy.partners} />
      <HomePricingPreviewSection copy={homePageCopy.partnerFit} />
      <HomeFAQ copy={homePageCopy.faq} items={faqItems} />
      <HomeGetStarted copy={homePageCopy.getStarted} roles={getStartedRoles} />
      <HomeFinalCTA copy={homePageCopy.finalCta} />
    </PageShell>
  );
}
