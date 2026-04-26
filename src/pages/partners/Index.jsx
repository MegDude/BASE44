import PartnerInterestForm from "@/components/forms/PartnerInterestForm";
import AudienceHero from "@/components/sections/AudienceHero";
import AudienceStoryPanel from "@/components/sections/AudienceStoryPanel";
import MapShell from "@/components/map/MapShell";

export default function PartnersIndex() {
  return (
    <main>
      <AudienceHero
        kicker="Partner ecosystem"
        title="The people nearby are already deciding."
        description="Downtown Perks helps properties, venues, hotels, brands, sponsors, and civic partners show up inside the same live downtown decision layer."
        primaryLabel="Explore partner map"
        primaryHref="#partner-map"
        secondaryLabel="Start partner flow"
        secondaryHref="#partner-form"
        showBack={false}
      />

      <section id="partner-map">
        <MapShell mode="partners" compact initialQuery="properties venues brands civic downtown" />
      </section>

      <AudienceStoryPanel
        items={[
          {
            title: "Properties turn downtown into an amenity.",
            body: "Buildings can give residents a live map, perks card, QR access, and measurable local engagement."
          },
          {
            title: "Venues and local businesses become easier to choose.",
            body: "Restaurants, bars, coffee, retail, wellness, hotels, and services appear when nearby users are deciding."
          },
          {
            title: "Brands sponsor useful moments.",
            body: "Sponsors can support districts, event windows, perks card moments, and local bundles with actual behavioral reporting."
          },
          {
            title: "Civic partners make participation easier.",
            body: "Community organizations can surface events, support local businesses, and understand aggregate downtown activity."
          }
        ]}
      />

      <section id="partner-form" className="dp-section">
        <div className="dp-page-shell">
          <PartnerInterestForm
            partnerType="venue"
            source="partners_overview_page"
            title="Find the right partner path."
            description="Choose your role and the system will route the request without showing internal source fields."
          />
        </div>
      </section>
    </main>
  );
}
