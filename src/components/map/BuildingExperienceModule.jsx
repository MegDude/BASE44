import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { CalendarDays, ChevronRight, MapPin, Route, Sparkles } from "lucide-react";
import { formatDistanceLabel } from "@/utils/nearbyRecommendations";

const RESIDENT_NAV_ITEMS = [
  ["overview", "Overview"],
  ["perks", "Perks"],
  ["campaigns", "Campaigns"],
  ["amenities", "Amenities"],
  ["events", "Events"],
  ["nearby", "Nearby"],
  ["guide", "Guide"],
];

const PARTNER_NAV_ITEMS = [
  ["overview", "Overview"],
  ["perks", "Offers"],
  ["campaigns", "Campaigns"],
  ["amenities", "Amenities"],
  ["events", "Events"],
  ["nearby", "Nearby"],
  ["guide", "Profile"],
];

function partnerIdentityLabel(value) {
  const label = String(value || "").trim();
  if (/resident perks?/i.test(label)) return "Published offers";
  if (/resident/i.test(label)) return label.replace(/resident/ig, "audience");
  return label;
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
  const navItems = isPartner ? PARTNER_NAV_ITEMS : RESIDENT_NAV_ITEMS;
  const campaignRoute = `/partner-workspace/campaigns?entityId=${encodeURIComponent(building.id)}`;
  const hostRef = useRef(null);
  const navRef = useRef(null);
  const [activeSection, setActiveSection] = useState(navItems[0][0]);
  const reduceMotion = useReducedMotion();

  const scrollToSection = (sectionId, sourceButton) => {
    const target = hostRef.current?.querySelector(`#building-${sectionId}`);
    if (!target) return;

    setActiveSection(sectionId);
    target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    sourceButton?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "nearest", inline: "center" });
  };

  useEffect(() => {
    const host = hostRef.current;
    const nav = navRef.current;
    if (!host || !nav || typeof IntersectionObserver === "undefined") return undefined;

    const scrollRoot = nav.closest(".dp-map-detail-scroll, .dp-map-panel-scroll, .dp-drawer-scroll, [data-panel-scroll]");
    const sections = navItems.map(([id]) => host.querySelector(`#building-${id}`)).filter(Boolean);
    if (!sections.length) return undefined;

    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => {
          if (b.intersectionRatio !== a.intersectionRatio) return b.intersectionRatio - a.intersectionRatio;
          return Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top);
        });

      const nextId = visible[0]?.target.id.replace("building-", "");
      if (nextId) setActiveSection(nextId);
    }, {
      root: scrollRoot || null,
      rootMargin: "-12% 0px -64% 0px",
      threshold: [0, 0.12, 0.32],
    });

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [building.id, navItems]);

  useEffect(() => {
    const activeButton = navRef.current?.querySelector(`[data-building-nav="${activeSection}"]`);
    activeButton?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "nearest", inline: "center" });
  }, [activeSection, reduceMotion]);

  return (
    <div ref={hostRef} className="dp-system dp-building-experience-host">
    <div className="dp-building-experience" data-building-experience={building.id}>
      <nav ref={navRef} className="dp-building-experience-nav" aria-label={`${building.name} sections`}>
        {navItems.map(([id, label]) => {
          const isActive = activeSection === id;
          return (
            <button
              key={id}
              type="button"
              className={isActive ? "is-active" : undefined}
              data-building-nav={id}
              aria-current={isActive ? "location" : undefined}
              onClick={(event) => scrollToSection(id, event.currentTarget)}
            >
              <span className="dp-building-experience-nav__label">{label}</span>
              {isActive && (
                <motion.span
                  className="dp-building-experience-nav__indicator"
                  layoutId={`building-experience-nav-${building.id}`}
                  transition={{ duration: reduceMotion ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] }}
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </nav>

      <Section id="building-overview" title="At a glance">
        <div className="dp-building-status-line">
          <span>{experience.perks.length} {isPartner ? "live offers" : "perks"}</span>
          <span>{experience.events.length} events</span>
          <span>{experience.routes.length} routes</span>
        </div>
        {!!experience.identity.length && <ul className="dp-building-identity-list" aria-label={isPartner ? "Building campaign context" : "Building character"}>{experience.identity.map((tag) => <li key={tag}>{isPartner ? partnerIdentityLabel(tag) : tag}</li>)}</ul>}
      </Section>

      <Section id="building-perks" title={isPartner ? "Offers" : "Perks"} description={isPartner ? "Offers currently connected to this building and its nearby audience." : "Useful resident benefits available around this building."}>
        {experience.perks.length ? (
          <div className="dp-building-row-list">{experience.perks.map((place) => <PlaceRow key={place.id} place={place} meta={place.offer || place.deals_offers} onSelect={onSelect} />)}</div>
        ) : <p className="dp-building-empty">{isPartner ? "No active offers are connected yet. Create one or connect an existing campaign." : "No active perks nearby. Check again as partners publish new offers."}</p>}
      </Section>

      <Section id="building-collections" title={isPartner ? "Audience moments" : "Collections"} description={isPartner ? "Nearby themes that can support a focused campaign for this building." : "Plans shaped by this building and what is nearby."}>
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

      <Section id="building-amenities" title="Shared amenities" description={isPartner ? "Use these verified amenities to shape building campaigns and communications." : "Structured by how residents use the building."}>
        {experience.amenities.length ? <div className="dp-building-amenity-groups">
          {experience.amenities.map((group) => <article key={group.id}><h4>{group.title}</h4><ul>{group.amenities.map((amenity) => <li key={amenity}>{amenity}</li>)}</ul></article>)}
        </div> : <p className="dp-building-empty">Amenity details have not been published.</p>}
      </Section>

      <Section id="building-events" title="Events" description={isPartner ? "Events connected to this building and its surrounding district." : "Building and downtown events close to home."}>
        {experience.events.length ? <div className="dp-building-row-list">{experience.events.map((event) => <PlaceRow key={event.id} place={event} meta={event.date || event.startDate || event.district} onSelect={onSelect} />)}</div> : <p className="dp-building-empty">No upcoming events are connected yet.</p>}
      </Section>

      {!!experience.routes.length && <Section id="building-routes" title="Walking routes">
        <div className="dp-building-route-list">{experience.routes.map((routeItem) => <button key={routeItem.id} type="button" onClick={() => onOpenRoute?.(routeItem.id, routeItem.title)}><Route aria-hidden="true" /><span><strong>{routeItem.title}</strong><small>{routeItem.estimatedTime || routeItem.distanceLabel || "Walking route"}</small></span><ChevronRight aria-hidden="true" /></button>)}</div>
      </Section>}

      <Section id="building-nearby" title="Nearby" description={isPartner ? "Places that can strengthen this building's campaigns, offers, and local guide." : "Closest useful places from the active map results."}>
        {experience.nearby.length ? <div className="dp-building-row-list">{experience.nearby.map((place) => <PlaceRow key={place.id} place={place} meta={formatDistanceLabel(place.buildingDistanceMeters) || place.category} onSelect={onSelect} />)}</div> : <button type="button" className="dp-building-empty-action" onClick={() => onExplore?.("Nearby") }><MapPin aria-hidden="true" />Search nearby</button>}
      </Section>

      <Section id="building-guide" title={isPartner ? "Building profile" : "Resident guide"}>
        {experience.guide.summary && <p className="dp-building-guide-copy">{experience.guide.summary}</p>}
        {!!experience.guide.routines.length && <ol className="dp-building-guide-list">{experience.guide.routines.map((routine) => <li key={routine}>{routine}</li>)}</ol>}
        <div className="dp-building-guide-actions">
          <button type="button" onClick={() => onExplore?.("Events")}><CalendarDays aria-hidden="true" />{isPartner ? "Review events" : "View events"}</button>
          <button type="button" onClick={() => onExplore?.("Nearby")}><MapPin aria-hidden="true" />{isPartner ? "Review nearby places" : "Explore nearby"}</button>
        </div>
      </Section>
    </div>
    </div>
  );
}
