import MapShell from "@/components/map/MapShell";
import PartnerInterestForm from "@/components/forms/PartnerInterestForm";
import AudienceHero from "@/components/sections/AudienceHero";
import AudienceStoryPanel from "@/components/sections/AudienceStoryPanel";

export default function CivicPartner() {
  return (
    <main>
      <AudienceHero
        kicker="Civic and community"
        title="Make downtown easier to navigate and measure."
        description="Downtown Perks helps civic groups, downtown organizations, chambers, districts, cultural groups, and community partners make events, businesses, and local participation visible."
        primaryLabel="View community map"
        primaryHref="#civic-map"
        secondaryLabel="Start civic partnership"
        secondaryHref="#partner-form"
      />

      <section id="civic-map">
        <MapShell mode="civic" compact initialQuery="community events civic arts downtown" />
      </section>

      <AudienceStoryPanel
        items={[
          {
            title: "Events become visible in context.",
            body: "Instead of asking residents to hunt for what is happening, the civic layer places programming directly inside the downtown map."
          },
          {
            title: "Local business support becomes measurable.",
            body: "Civic partners can support participating venues, local businesses, arts spaces, and public programming with privacy-protected engagement data."
          },
          {
            title: "Navigation becomes part of participation.",
            body: "Users can understand what is nearby, what is walkable, and what is worth joining without needing another app."
          },
          {
            title: "Reporting protects privacy.",
            body: "The dashboard should show aggregated scans, saves, RSVPs, district activity, and time-based engagement without exposing personal contact details."
          }
        ]}
      />

      <section id="partner-form" className="dp-section">
        <div className="dp-page-shell">
          <PartnerInterestForm
            partnerType="civic"
            source="civic_partner_page"
            title="Turn attendance into participation."
            description="Tell us about the district, organization, event series, or community layer."
          />
        </div>
      </section>
    </main>
  );
}
