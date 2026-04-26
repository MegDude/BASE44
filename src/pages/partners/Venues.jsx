import MapShell from "@/components/map/MapShell";
import PartnerInterestForm from "@/components/forms/PartnerInterestForm";
import AudienceHero from "@/components/sections/AudienceHero";
import AudienceStoryPanel from "@/components/sections/AudienceStoryPanel";

export default function VenuesPartner() {
  return (
    <main>
      <AudienceHero
        kicker="Venues and local businesses"
        title="Be the place people choose next."
        description="Downtown Perks helps restaurants, bars, coffee shops, retail, wellness, hotels, services, and local businesses become visible when nearby residents are deciding where to go."
        primaryLabel="See live visibility"
        primaryHref="#venue-map"
        secondaryLabel="List your business"
        secondaryHref="#partner-form"
      />

      <section id="venue-map">
        <MapShell mode="venue" compact initialQuery="rooftop bars coffee restaurants wellness nearby" />
      </section>

      <AudienceStoryPanel
        items={[
          {
            title: "Bars capture nearby intent before the night starts.",
            body: "The venue appears in the map when residents search for drinks, rooftops, live music, nightlife, or happy hours."
          },
          {
            title: "Restaurants reach people deciding where to eat now.",
            body: "Dining results should show distance, offer, current relevance, and a quick action such as save, open, or show card."
          },
          {
            title: "Coffee, retail, wellness, and services own routines.",
            body: "The system should support morning, midday, and weekly behavior. These partners are not hidden in a directory; they appear in context."
          },
          {
            title: "The redemption flow is simple.",
            body: "The resident shows the card. Staff scan or verify. The partner gets redemptions, saves, visits, and useful engagement snapshots."
          }
        ]}
      />

      <section id="partner-form" className="dp-section">
        <div className="dp-page-shell">
          <PartnerInterestForm
            partnerType="venue"
            source="venue_partner_page"
            title="Put your business on the decision map."
            description="Add your place, offer, event, or scan flow. The form keeps attribution hidden and the page keeps moving."
          />
        </div>
      </section>
    </main>
  );
}
