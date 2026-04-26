import MapShell from "@/components/map/MapShell";
import PartnerInterestForm from "@/components/forms/PartnerInterestForm";
import AudienceHero from "@/components/sections/AudienceHero";
import AudienceStoryPanel from "@/components/sections/AudienceStoryPanel";

export default function PropertiesPartner() {
  return (
    <main>
      <AudienceHero
        kicker="Properties and residential buildings"
        title="Turn the neighborhood into a resident amenity."
        description="Downtown Perks gives apartment communities, condos, mixed-use developments, leasing teams, and developer portfolios a live way to show residents what is around them."
        primaryLabel="See property map"
        primaryHref="#property-map"
        secondaryLabel="Start building pilot"
        secondaryHref="#partner-form"
      />

      <section id="property-map">
        <MapShell mode="property" compact initialQuery="properties and perks near residents" />
      </section>

      <AudienceStoryPanel
        items={[
          {
            title: "The building becomes a gateway.",
            body: "QR codes in the lobby, leasing flow, welcome materials, and resident emails open the same live map. Residents do not need a new app or login wall."
          },
          {
            title: "The neighborhood becomes part of the value.",
            body: "The page should make it clear that properties are not only selling square footage. They are selling the coffee, dinner, bars, parks, services, events, and walkable routines around the building."
          },
          {
            title: "The dashboard proves use.",
            body: "Property teams see scans, map opens, top places, saved events, redemptions, and engagement by time period. The reporting should feel like answers from the map, not a reporting wall."
          },
          {
            title: "The pilot is easy to start.",
            body: "Use the 90-day pilot structure. Keep the pricing compact: free forever for basic visibility, $39 per year for analytics, and $99 per year for the full stack where applicable."
          }
        ]}
      />

      <section id="partner-form" className="dp-section">
        <div className="dp-page-shell">
          <PartnerInterestForm
            partnerType="property"
            source="property_partner_page"
            title="Bring this to your property."
            description="Tell us about the building, portfolio, or leasing flow. Source attribution is captured silently."
          />
        </div>
      </section>
    </main>
  );
}
