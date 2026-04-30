import PageShell from "@/components/layout/PageShell";
import HomeCanDoSummary from "@/components/home/HomeCanDoSummary";
import HomeFAQ from "@/components/home/HomeFAQ";
import HomeFinalCTA from "@/components/home/HomeFinalCTA";
import HomeFeaturedExample from "@/components/home/HomeFeaturedExample";
import HomeGetStartedForm from "@/components/home/HomeGetStartedForm";
import HomeHero from "@/components/home/HomeHero";
import HomeHowItWorks from "@/components/home/HomeHowItWorks";
import HomeIntroSection from "@/components/home/HomeIntroSection";
import HomeEverythingNearby from "@/components/home/HomeEverythingNearby";
import HomeEventsPropertiesSplit from "@/components/home/HomeEventsPropertiesSplit";
import HomeNearbyDiscovery from "@/components/home/HomeNearbyDiscovery";
import HomePartnerSummary from "@/components/home/HomePartnerSummary";
import HomePartnerTabs from "@/components/home/HomePartnerTabs";
import HomePerksCardSummary from "@/components/home/HomePerksCardSummary";
import HomePricingSection from "@/components/home/HomePricingSection";
import HomeProductSection from "@/components/home/HomeProductSection";
import HomeSearchMap from "@/components/home/HomeSearchMap";
import { homePageCopy } from "@/content/homePageCopy";
import {
  featuredNearbyExample,
  getStartedFields,
  homeEventsPreview,
  homeFaqItems,
  nearbyDiscoveryGroups,
  partnerTabPanels,
  pricingCards,
  propertyPreview,
} from "@/data/homePageData";

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
      <HomeIntroSection copy={homePageCopy.intro} />
      <HomeProductSection copy={homePageCopy.product} />
      <HomeEverythingNearby copy={homePageCopy.everythingNearby} />
      <HomeCanDoSummary copy={homePageCopy.canDo} />
      <HomeFeaturedExample copy={homePageCopy.featured} example={featuredNearbyExample} />
      <HomeHowItWorks copy={homePageCopy.howItWorks} />
      <HomeEventsPropertiesSplit copy={homePageCopy.eventsProperties} events={homeEventsPreview} property={propertyPreview} />
      <HomePerksCardSummary copy={homePageCopy.card} />
      <HomeNearbyDiscovery copy={homePageCopy.nearbyDiscovery} groups={nearbyDiscoveryGroups} />
      <HomePartnerSummary copy={homePageCopy.partners} />
      <HomePartnerTabs tabs={partnerTabPanels} />
      <HomePricingSection copy={homePageCopy.pricing} cards={pricingCards} />
      <HomeFAQ copy={homePageCopy.faq} items={homeFaqItems} />
      <HomeGetStartedForm copy={homePageCopy.getStarted} fields={getStartedFields} />
      <HomeFinalCTA copy={homePageCopy.finalCta} />
    </PageShell>
  );
}
