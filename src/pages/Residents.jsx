import ResidentCardForm from "@/components/forms/ResidentCardForm";
import ResidentWalkingMap from "@/components/resident/ResidentWalkingMap";
import AudienceHero from "@/components/sections/AudienceHero";
import AudienceStoryPanel from "@/components/sections/AudienceStoryPanel";
import { createExploreLink } from "@/lib/routeHelpers";

export default function Residents() {
  return (
    <main>
      <AudienceHero
        kicker="Resident app"
        title="Your downtown, easier to use."
        description="Find places, events, perks, and daily-use downtown context without jumping between apps."
        primaryLabel="Open the map"
        primaryHref={createExploreLink({ intent: "nearby" })}
        secondaryLabel="Get your perks card"
        secondaryHref="#resident-card"
      />

      <section className="px-4 pb-4 md:px-6 md:pb-6">
        <div className="dp-page-shell">
          <ResidentWalkingMap />
        </div>
      </section>

      <AudienceStoryPanel
        items={[
          {
            title: "One map for a normal downtown day",
            body: "Use one resident-first downtown layer to read homes, parks, landmarks, events, and everyday places without stitching together five separate apps."
          },
          {
            title: "See what is actually close",
            body: "The resident view is meant to answer what is nearby, what is easy to walk to, and which parts of downtown fit the way you already move through the day."
          },
          {
            title: "Browse first, unlock when needed",
            body: "Perks, saves, and RSVP moments stay tied to real places. The card shows up when access matters, not before you understand what is useful."
          },
          {
            title: "Use the same system residents already open",
            body: "This walking-map view is part of the same Downtown Perks structure used across explore, perks, events, and building-linked resident access."
          }
        ]}
      />

      <section id="resident-card" className="dp-section">
        <div className="dp-page-shell">
          <ResidentCardForm source="resident_page" />
        </div>
      </section>
    </main>
  );
}
