import { Link } from "react-router-dom";
import { CalendarDays, ChevronRight, MapPin, Route, Sparkles } from "lucide-react";
import { formatDistanceLabel } from "@/utils/nearbyRecommendations";

const NAV_ITEMS = [
  ["overview", "Overview"],
  ["perks", "Perks"],
  ["campaigns", "Campaigns"],
  ["amenities", "Amenities"],
  ["events", "Events"],
  ["nearby", "Nearby"],
  ["guide", "Guide"],
];

function scrollToSection(sectionId) {
  document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function Section({ id, title, description, children }) {
  return (
    <section id={id} className="dp-building-experience-section" aria-labelledby={`${id}-title`}>
      <header>
        <h3 id={`${id}-title`}>{title}</h3>
        {description && <p>{description}</p>}
      </header>
      {children}
    </section>
  );
}

function PlaceRow({ place, meta, onSelect }) {
  return (
    <button type="button" className="dp-building-place-row" onClick={() => onSelect?.(place)}>
      <span><strong>{place.name || place.title}</strong>{meta && <small>{meta}</small>}</span>
      <ChevronRight aria-hidden="true" />
    </button>
  );
}

export default function BuildingExperienceModule({ building, experience, mode = "resident", onSelect, onExplore, onOpenRoute }) {
  const isPartner = mode === "partner";
  const campaignRoute = `/partner-workspace/campaigns?entityId=${encodeURIComponent(building.id)}`;

  return (
    <div className="dp-system dp-building-experience-host">
    <div className="dp-building-experience" data-building-experience={building.id}>
      <nav className="dp-building-experience-nav" aria-label={`${building.name} sections`}>
        {NAV_ITEMS.map(([id, label]) => <button key={id} type="button" onClick={() => scrollToSection(`building-${id}`)}>{label}</button>)}
      </nav>

      <Section id="building-overview" title="At a glance">
        <div className="dp-building-status-line">
          <span>{experience.perks.length} perks</span>
          <span>{experience.events.length} events</span>
          <span>{experience.routes.length} routes</span>
        </div>
        {!!experience.identity.length && <ul className="dp-building-identity-list" aria-label="Building character">{experience.identity.map((tag) => <li key={tag}>{tag}</li>)}</ul>}
      </Section>

      <Section id="building-perks" title="Perks" description="Useful resident benefits available around this building.">
        {experience.perks.length ? (
          <div className="dp-building-row-list">{experience.perks.map((place) => <PlaceRow key={place.id} place={place} meta={place.offer || place.deals_offers} onSelect={onSelect} />)}</div>
        ) : <p className="dp-building-empty">No active perks nearby. Check again as partners publish new offers.</p>}
      </Section>

      <Section id="building-collections" title="Collections" description="Plans shaped by this building and what is nearby.">
        <div className="dp-building-collection-list">
          {experience.collections.map((collection) => (
            <button key={collection.id} type="button" onClick={() => onExplore?.(collection.intent)}>
              <span><strong>{collection.title}</strong><small>{collection.places.length ? `${collection.places.length} nearby` : "Search nearby"}</small></span>
              <ChevronRight aria-hidden="true" />
            </button>
          ))}
        </div>
      </Section>

      <Section id="building-campaigns" title={isPartner ? "Campaigns" : "Building programs"} description={isPartner ? "Recommendations generated from building metadata and nearby demand." : "Resident programs selected for this building."}>
        <div className="dp-building-campaign-list">
          {experience.campaigns.map((campaign) => (
            campaign.entity ? <PlaceRow key={campaign.id} place={campaign.entity} meta={`${campaign.family} · ${campaign.status}`} onSelect={onSelect} /> : (
              <article key={campaign.id}>
                <Sparkles aria-hidden="true" />
                <span><strong>{campaign.title}</strong><small>{campaign.family} · {campaign.status}</small></span>
              </article>
            )
          ))}
        </div>
        {isPartner && <Link className="dp-building-inline-action" to={campaignRoute}>Plan a campaign<ChevronRight aria-hidden="true" /></Link>}
      </Section>

      <Section id="building-amenities" title="Shared amenities" description="Structured by how residents use the building.">
        {experience.amenities.length ? <div className="dp-building-amenity-groups">
          {experience.amenities.map((group) => <article key={group.id}><h4>{group.title}</h4><ul>{group.amenities.map((amenity) => <li key={amenity}>{amenity}</li>)}</ul></article>)}
        </div> : <p className="dp-building-empty">Amenity details have not been published.</p>}
      </Section>

      <Section id="building-events" title="Events" description="Building and downtown events close to home.">
        {experience.events.length ? <div className="dp-building-row-list">{experience.events.map((event) => <PlaceRow key={event.id} place={event} meta={event.date || event.startDate || event.district} onSelect={onSelect} />)}</div> : <p className="dp-building-empty">No upcoming events are connected yet.</p>}
      </Section>

      {!!experience.routes.length && <Section id="building-routes" title="Walking routes">
        <div className="dp-building-route-list">{experience.routes.map((routeItem) => <button key={routeItem.id} type="button" onClick={() => onOpenRoute?.(routeItem.id, routeItem.title)}><Route aria-hidden="true" /><span><strong>{routeItem.title}</strong><small>{routeItem.estimatedTime || routeItem.distanceLabel || "Walking route"}</small></span><ChevronRight aria-hidden="true" /></button>)}</div>
      </Section>}

      <Section id="building-nearby" title="Nearby" description="Closest useful places from the active map results.">
        {experience.nearby.length ? <div className="dp-building-row-list">{experience.nearby.map((place) => <PlaceRow key={place.id} place={place} meta={formatDistanceLabel(place.buildingDistanceMeters) || place.category} onSelect={onSelect} />)}</div> : <button type="button" className="dp-building-empty-action" onClick={() => onExplore?.("Nearby") }><MapPin aria-hidden="true" />Search nearby</button>}
      </Section>

      <Section id="building-guide" title="Resident guide">
        {experience.guide.summary && <p className="dp-building-guide-copy">{experience.guide.summary}</p>}
        {!!experience.guide.routines.length && <ol className="dp-building-guide-list">{experience.guide.routines.map((routine) => <li key={routine}>{routine}</li>)}</ol>}
        <div className="dp-building-guide-actions">
          <button type="button" onClick={() => onExplore?.("Events")}><CalendarDays aria-hidden="true" />View events</button>
          <button type="button" onClick={() => onExplore?.("Nearby")}><MapPin aria-hidden="true" />Explore nearby</button>
        </div>
      </Section>
    </div>
    </div>
  );
}
