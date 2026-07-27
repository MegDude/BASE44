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

function Section({ id, controlId, title, description, children }) {
  return (
    <section
      id={controlId}
      data-building-section={id}
      className="dp-building-experience-section"
      aria-labelledby={`${controlId}-title`}
    >
      <header>
        <h3 id={`${controlId}-title`}>{title}</h3>
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
  const sectionPrefix = `building-${String(building.id || building.entityId || building.slug || "property").replace(/[^a-z0-9_-]+/gi, "-")}`;
  const [activeSection, setActiveSection] = useState(navItems[0][0]);
  const reduceMotion = useReducedMotion();

  const scrollToSection = (sectionId, sourceButton) => {
    const target = hostRef.current?.querySelector(`[data-building-section="${sectionId}"]`);
    if (!target) return;

    setActiveSection(sectionId);
    const scrollRoot = navRef.current?.closest(".dp-map-detail-scroll, .dp-map-panel-scroll, .dp-drawer-scroll, [data-panel-scroll]");
    if (scrollRoot) {
      const rootTop = scrollRoot.getBoundingClientRect().top;
      const targetTop = target.getBoundingClientRect().top;
      scrollRoot.scrollTo({
        top: scrollRoot.scrollTop + targetTop - rootTop - navRef.current.offsetHeight,
        behavior: reduceMotion ? "auto" : "smooth",
      });
    } else {
      target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    }
    sourceButton?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "nearest", inline: "center" });
  };

  const handleNavKeyDown = (event, index) => {
    const lastIndex = navItems.length - 1;
    const nextIndex = event.key === "Home"
      ? 0
      : event.key === "End"
        ? lastIndex
        : event.key === "ArrowRight"
          ? (index + 1) % navItems.length
          : event.key === "ArrowLeft"
            ? (index - 1 + navItems.length) % navItems.length
            : null;
    if (nextIndex === null) return;
    event.preventDefault();
    const [nextId] = navItems[nextIndex];
    const nextButton = navRef.current?.querySelector(`[data-building-nav="${nextId}"]`);
    nextButton?.focus();
    scrollToSection(nextId, nextButton);
  };

  useEffect(() => {
    const host = hostRef.current;
    const nav = navRef.current;
    if (!host || !nav || typeof IntersectionObserver === "undefined") return undefined;

    const scrollRoot = nav.closest(".dp-map-detail-scroll, .dp-map-panel-scroll, .dp-drawer-scroll, [data-panel-scroll]");
    const sections = navItems.map(([id]) => host.querySelector(`[data-building-section="${id}"]`)).filter(Boolean);
    if (!sections.length) return undefined;

    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => {
          if (b.intersectionRatio !== a.intersectionRatio) return b.intersectionRatio - a.intersectionRatio;
          return Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top);
        });

      const nextId = visible[0]?.target.getAttribute("data-building-section");
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
        {navItems.map(([id, label], index) => {
          const isActive = activeSection === id;
          return (
            <button
              key={id}
              type="button"
              className={isActive ? "is-active" : undefined}
              data-building-nav={id}
              aria-controls={`${sectionPrefix}-${id}`}
              aria-current={isActive ? "location" : undefined}
              aria-pressed={isActive}
              onClick={(event) => scrollToSection(id, event.currentTarget)}
              onKeyDown={(event) => handleNavKeyDown(event, index)}
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

      <Section id="overview" controlId={`${sectionPrefix}-overview`} title="At a glance">
        <div className="dp-building-status-line">
          <span>{experience.perks.length} {isPartner ? "live offers" : "perks"}</span>
          <span>{experience.events.length} events</span>
          <span>{experience.routes.length} routes</span>
        </div>
        {!!experience.identity.length && <ul className="dp-building-identity-list" aria-label={isPartner ? "Building campaign context" : "Building character"}>{experience.identity.map((tag) => <li key={tag}>{isPartner ? partnerIdentityLabel(tag) : tag}</li>)}</ul>}
      </Section>

      <Section id="perks" controlId={`${sectionPrefix}-perks`} title={isPartner ? "Offers" : "Perks"} description={isPartner ? "Offers currently connected to this building and its nearby audience." : "Useful resident benefits available around this building."}>
        {experience.perks.length ? (
          <div className="dp-building-row-list">{experience.perks.map((place) => <PlaceRow key={place.id} place={place} meta={place.offer || place.deals_offers} onSelect={onSelect} />)}</div>
        ) : <p className="dp-building-empty">{isPartner ? "No active offers are connected yet. Create one or connect an existing campaign." : "No active perks nearby. Check again as partners publish new offers."}</p>}
      </Section>

      <Section id="collections" controlId={`${sectionPrefix}-collections`} title={isPartner ? "Audience moments" : "Collections"} description={isPartner ? "Nearby themes that can support a focused campaign for this building." : "Plans shaped by this building and what is nearby."}>
        <div className="dp-building-collection-list">
          {experience.collections.map((collection) => (
            <button key={collection.id} type="button" onClick={() => onExplore?.(collection.intent)}>
              <span><strong>{collection.title}</strong><small>{collection.places.length ? `${collection.places.length} nearby` : "Search nearby"}</small></span>
              <ChevronRight aria-hidden="true" />
            </button>
          ))}
        </div>
      </Section>

      <Section id="campaigns" controlId={`${sectionPrefix}-campaigns`} title={isPartner ? "Campaigns" : "Building programs"} description={isPartner ? "Recommendations generated from building metadata and nearby demand." : "Resident programs selected for this building."}>
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

      <Section id="amenities" controlId={`${sectionPrefix}-amenities`} title="Shared amenities" description={isPartner ? "Use these verified amenities to shape building campaigns and communications." : "Structured by how residents use the building."}>
        {experience.amenities.length ? <div className="dp-building-amenity-groups">
          {experience.amenities.map((group) => <article key={group.id}><h4>{group.title}</h4><ul>{group.amenities.map((amenity) => <li key={amenity}>{amenity}</li>)}</ul></article>)}
        </div> : <p className="dp-building-empty">Amenity details have not been published.</p>}
      </Section>

      <Section id="events" controlId={`${sectionPrefix}-events`} title="Events" description={isPartner ? "Events connected to this building and its surrounding district." : "Building and downtown events close to home."}>
        {experience.events.length ? <div className="dp-building-row-list">{experience.events.map((event) => <PlaceRow key={event.id} place={event} meta={event.date || event.startDate || event.district} onSelect={onSelect} />)}</div> : <p className="dp-building-empty">No upcoming events are connected yet.</p>}
      </Section>

      {!!experience.routes.length && <Section id="routes" controlId={`${sectionPrefix}-routes`} title="Walking routes">
        <div className="dp-building-route-list">{experience.routes.map((routeItem) => <button key={routeItem.id} type="button" onClick={() => onOpenRoute?.(routeItem.id, routeItem.title)}><Route aria-hidden="true" /><span><strong>{routeItem.title}</strong><small>{routeItem.estimatedTime || routeItem.distanceLabel || "Walking route"}</small></span><ChevronRight aria-hidden="true" /></button>)}</div>
      </Section>}

      <Section id="nearby" controlId={`${sectionPrefix}-nearby`} title="Nearby" description={isPartner ? "Places that can strengthen this building's campaigns, offers, and local guide." : "Closest useful places from the active map results."}>
        {experience.nearby.length ? <div className="dp-building-row-list">{experience.nearby.map((place) => <PlaceRow key={place.id} place={place} meta={formatDistanceLabel(place.buildingDistanceMeters) || place.category} onSelect={onSelect} />)}</div> : <button type="button" className="dp-building-empty-action" onClick={() => onExplore?.("Nearby") }><MapPin aria-hidden="true" />Search nearby</button>}
      </Section>

      <Section id="guide" controlId={`${sectionPrefix}-guide`} title={isPartner ? "Building profile" : "Resident guide"}>
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
