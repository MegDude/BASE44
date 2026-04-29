import MapShell from "@/components/map/MapShell";
import ResidentCardForm from "@/components/forms/ResidentCardForm";
import AudienceHero from "@/components/sections/AudienceHero";
import AudienceStoryPanel from "@/components/sections/AudienceStoryPanel";
import { createExploreLink } from "@/lib/routeHelpers";

export default function Residents() {
  return (
    <main>
      <AudienceHero
        kicker="Resident app"
        title="Your downtown, easier to use."
        description="Find places, events, and perks nearby without jumping between apps."
        primaryLabel="Open the map"
        primaryHref={createExploreLink({ intent: "nearby" })}
        secondaryLabel="Get your perks card"
        secondaryHref="#resident-card"
      />

      <MapShell mode="resident" compact />

      <AudienceStoryPanel
        items={[
          {
            title: "Places nearby",
            body: "Open one live map for downtown coffee, dinner, drinks, services, and everyday places that are actually walkable right now."
          },
          {
            title: "Happening tonight",
            body: "See what is live, what is starting soon, and what makes sense in the next 5 to 30 minutes."
          },
          {
            title: "Perks you can use",
            body: "Perks stay inside the map instead of living in a separate coupon wall. If it matters, it is tied back to a real place nearby."
          },
          {
            title: "Save for later",
            body: "Save, RSVP, or show the card only when it matters. Browse first, then act when the decision is clear."
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
