import MapShell from "@/components/map/MapShell";
import PartnerInterestForm from "@/components/forms/PartnerInterestForm";
import AudienceStoryPanel from "@/components/sections/AudienceStoryPanel";

export default function Home() {
  return (
    <main>
      <MapShell mode="home" />

      <section className="dp-section">
        <div className="dp-page-shell">
          <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="dp-page-kicker">Where downtown meets you.</p>
              <h2 className="dp-heading-modern text-4xl md:text-6xl">
                Everything nearby. In one map.
              </h2>
            </div>
            <p className="dp-page-intro">
              One map. Everything nearby. No app download. No login friction. Residents see
              places, perks, events, properties, and local activity in one view. Partners show up
              when people are already choosing where to go.
            </p>
          </div>
        </div>
      </section>

      <AudienceStoryPanel
        items={[
          {
            title: "Residents stop searching and start deciding.",
            body: "They open the map, ask what is nearby, tap one useful result, save it, RSVP, or show the perks card."
          },
          {
            title: "Businesses show up at the moment of intent.",
            body: "Restaurants, bars, coffee shops, wellness studios, hotels, and services can publish offers and events that appear inside the downtown decision flow."
          },
          {
            title: "Properties turn the neighborhood into an amenity.",
            body: "Buildings can give residents QR access, a perks card, and a live local map that supports leasing, retention, and resident engagement."
          },
          {
            title: "Brands and civic partners activate with context.",
            body: "Sponsors and civic organizations can support districts, events, and public-facing discovery without relying on vague impressions."
          }
        ]}
      />

      <section className="dp-section">
        <div className="dp-page-shell">
          <PartnerInterestForm
            partnerType="venue"
            source="homepage_join_section"
            title="Ready when you are."
            description="People don't choose the best option. They choose the one they notice."
          />
        </div>
      </section>
    </main>
  );
}
