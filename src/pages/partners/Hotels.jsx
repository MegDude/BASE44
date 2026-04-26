import MapShell from "@/components/map/MapShell";
import PartnerInterestForm from "@/components/forms/PartnerInterestForm";
import AudienceHero from "@/components/sections/AudienceHero";
import AudienceStoryPanel from "@/components/sections/AudienceStoryPanel";

export default function HotelsPartner() {
  return (
    <main>
      <AudienceHero
        kicker="Hotels and hospitality"
        title="Extend the stay beyond the lobby."
        description="Guests do not need another static list. They need orientation. Downtown Perks turns nearby coffee, dinner, events, perks, and local favorites into a live guest-facing map."
        primaryLabel="See guest map"
        primaryHref="#hospitality-map"
        secondaryLabel="Start hospitality pilot"
        secondaryHref="#partner-form"
      />

      <section id="hospitality-map">
        <MapShell mode="hospitality" compact initialQuery="guest coffee dinner events near hotel" />
      </section>

      <AudienceStoryPanel
        items={[
          {
            title: "Arrival becomes orientation.",
            body: "QR access in rooms, lobby, concierge materials, and guest messaging opens a live downtown map tied to the hotel location."
          },
          {
            title: "Recommendations become useful.",
            body: "Guests can see what is nearby, what is open, what has a perk, what is happening tonight, and how close each place is."
          },
          {
            title: "The hotel gets measurable local engagement.",
            body: "The dashboard should show scans, guest map opens, top categories, partner clicks, and event engagement."
          }
        ]}
      />

      <section id="partner-form" className="dp-section">
        <div className="dp-page-shell">
          <PartnerInterestForm
            partnerType="hospitality"
            source="hospitality_partner_page"
            title="Build the guest discovery layer."
            description="Tell us about the property, guest flow, and local partner network."
          />
        </div>
      </section>
    </main>
  );
}
