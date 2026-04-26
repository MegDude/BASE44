import MapShell from "@/components/map/MapShell";
import PartnerInterestForm from "@/components/forms/PartnerInterestForm";
import AudienceHero from "@/components/sections/AudienceHero";
import AudienceStoryPanel from "@/components/sections/AudienceStoryPanel";

export default function BrandsPartner() {
  return (
    <main>
      <AudienceHero
        kicker="Brands and sponsors"
        title="Buy the moment, not just the impression."
        description="Downtown Perks lets brands participate in real local behavior through district sponsorships, perks card moments, event windows, building networks, and measurable activity."
        primaryLabel="View sponsor zones"
        primaryHref="#brand-map"
        secondaryLabel="Start a brand conversation"
        secondaryHref="#partner-form"
      />

      <section id="brand-map">
        <MapShell mode="brand" compact initialQuery="brand sponsor zones events nightlife downtown" />
      </section>

      <AudienceStoryPanel
        items={[
          {
            title: "District sponsorships show up in context.",
            body: "Brands can sponsor Rainey, Seaholm, Red River, West 6th, or central business district moments without interrupting the user."
          },
          {
            title: "Event windows create concentrated attention.",
            body: "Concerts, weekends, festivals, games, nightlife windows, and cultural moments can trigger paid visibility zones and dashboard reporting."
          },
          {
            title: "The perks card creates a useful brand touchpoint.",
            body: "Sponsorship should feel like access, not an ad. The brand can support a resident benefit, welcome moment, or local bundle."
          },
          {
            title: "Reporting focuses on behavior.",
            body: "Measure map exposure, card opens, saves, redemptions, district lift, partner lift, and campaign-attributed engagement."
          }
        ]}
      />

      <section id="partner-form" className="dp-section">
        <div className="dp-page-shell">
          <PartnerInterestForm
            partnerType="brand"
            source="brand_sponsor_page"
            title="Design a local activation."
            description="Tell us which district, audience, event, or behavior you want to support."
          />
        </div>
      </section>
    </main>
  );
}
