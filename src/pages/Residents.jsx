import MapShell from "@/components/map/MapShell";
import ResidentCardForm from "@/components/forms/ResidentCardForm";
import AudienceHero from "@/components/sections/AudienceHero";
import AudienceStoryPanel from "@/components/sections/AudienceStoryPanel";

export default function Residents() {
  return (
    <main>
      <AudienceHero
        kicker="Resident app"
        title="Your downtown, in one map."
        description="Find nearby perks, events, restaurants, bars, coffee, services, properties, and local favorites without downloading another app."
        primaryLabel="Open the map"
        primaryHref="/map"
        secondaryLabel="Get your perks card"
        secondaryHref="#resident-card"
      />

      <MapShell mode="resident" compact />

      <AudienceStoryPanel
        items={[
          {
            title: "Open the map.",
            body: "The resident starts with the live downtown map instead of a directory. The Ask the Map input is prominent and lets them search for coffee, dinner, rooftop bars, events, fitness, groceries, or services."
          },
          {
            title: "Tap, learn, decide.",
            body: "Every location shows what it is, why it matters, how close it is, and what the resident can do next. The result drawer can be closed, rolled up, or expanded."
          },
          {
            title: "Save, RSVP, or show the card.",
            body: "The resident can save a place, RSVP to an event, or show the perks card at a participating partner. The action is tracked without adding friction."
          },
          {
            title: "Redeem and keep moving.",
            body: "The partner scans or verifies the perk. The resident gets the benefit and the partner gets measurable engagement."
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
