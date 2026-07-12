import { ArrowRight, Bookmark, ChevronRight, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { ResidentMobileTabBar } from "@/components/resident/ResidentMobileTabBar";

const nearbyCategories = [
  ["Coffee", "Coffee"],
  ["Dinner", "Dining"],
  ["Cocktails", "Drinks"],
  ["Events", "Events"],
  ["Happy Hour", "Happy Hour"],
  ["Fitness", "Fitness"],
  ["Weekend", "This Week"],
] as const;

const discoveryRows = [
  { title: "Nearby districts", detail: "Rainey, Seaholm, Congress and Waterloo", href: "/map?mode=resident&tab=map&filter=All" },
  { title: "Popular today", detail: "Dining, events and walkable plans", href: "/map?mode=resident&tab=map&filter=Trending" },
  { title: "Saved", detail: "Return to places, perks and events", href: "/map?mode=resident&tab=map&filter=Saved", icon: Bookmark },
] as const;

export default function ResidentHome() {
  return (
    <main className="dp-resident-home">
      <header className="dp-resident-home__header">
        <div><p>Good afternoon</p><h1>Downtown Austin</h1></div>
        <Link to="/map?mode=resident&tab=map&filter=All" aria-label="Search nearby"><Search aria-hidden="true" /></Link>
      </header>

      <Link className="dp-resident-search-entry" to="/map?mode=resident&tab=map&filter=All&console=expanded">
        <Search aria-hidden="true" /><span>Ask the Map</span><small>Walkable dinner tonight</small>
      </Link>

      <section className="dp-resident-home__section" aria-labelledby="recommended-today">
        <div className="dp-resident-section-title"><div><p>Recommended today</p><h2 id="recommended-today">One good plan nearby.</h2></div></div>
        <Link className="dp-resident-hero-card" to="/map?mode=resident&tab=events&filter=Events&query=live%20music">
          <img src="/images/map-entities/perks/moody_theater_live_music_1779052684229.png" alt="Live music performance in downtown Austin" />
          <div><span>Tonight</span><h3>Live music downtown</h3><p>Find a nearby show and the best walkable stops around it.</p><strong>Explore events <ArrowRight aria-hidden="true" /></strong></div>
        </Link>
      </section>

      <section className="dp-resident-home__section" aria-labelledby="nearby-categories">
        <div className="dp-resident-section-title"><h2 id="nearby-categories">What sounds good?</h2></div>
        <div className="dp-resident-category-rail" aria-label="Nearby categories">
          {nearbyCategories.map(([label, filter]) => <Link key={label} to={`/map?mode=resident&tab=map&filter=${encodeURIComponent(filter)}`}>{label}</Link>)}
        </div>
      </section>

      <section className="dp-resident-home__section dp-resident-home__continue" aria-labelledby="continue-exploring">
        <div className="dp-resident-section-title"><h2 id="continue-exploring">Continue exploring</h2></div>
        <div>
          {discoveryRows.map((item) => {
            const Icon = item.icon;
            return <Link key={item.title} to={item.href}>{Icon ? <Icon aria-hidden="true" /> : null}<span><strong>{item.title}</strong><small>{item.detail}</small></span><ChevronRight aria-hidden="true" /></Link>;
          })}
        </div>
      </section>

      <ResidentMobileTabBar activeTab="home" />
    </main>
  );
}
