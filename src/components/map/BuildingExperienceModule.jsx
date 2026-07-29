import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { CalendarDays, ChevronRight, MapPin, Route, Sparkles } from "lucide-react";
import { formatDistanceLabel } from "@/utils/nearbyRecommendations";

const RESIDENT_SECTION_LABELS = {
  overview: "Overview",
  perks: "Perks",
  collections: "Ideas",
  campaigns: "Programs",
  amenities: "Amenities",
  events: "Events",
  routes: "Walks",
  nearby: "Nearby",
  guide: "Guide",
};

const PARTNER_SECTION_LABELS = {
  overview: "Overview",
  perks: "Offers",
  collections: "Ideas",
  campaigns: "Campaigns",
  amenities: "Amenities",
  events: "Events",
  routes: "Routes",
  nearby: "Nearby",
  guide: "Profile",
};

function partnerIdentityLabel(value) {
  const label = String(value || "").trim();
  if (/resident perks?/i.test(label)) return "Published offers";
  if (/resident/i.test(label)) return label.replace(/resident/ig, "audience");
  return label;
}

function withQuery(path, values = {}) {
  const [pathname, existingSearch = ""] = String(path).split("?");
  const params = new URLSearchParams(existingSearch);
  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
  });
  const search = params.toString();
  return search ? `${pathname}?${search}` : pathname;
}

function Section({ id, controlId, title, description, action, children }) {
  return (
    <section
      id={controlId}
      data-building-section={id}
      className="dp-building-experience-section"
      aria-labelledby={`${controlId}-title`}
    >
      <header className="dp-building-section-header">
        <div>
          <h3 id={`${controlId}-title`}>{title}</h3>
          {description && <p>{description}</p>}
        </div>
        {action || null}
      </header>
      {children}
    </section>
  );
}

function PlaceRow({ place, meta, onSelect }) {
  const label = place.name || place.title || "Open place";
  return (
    <button
      type="button"
      className="dp-building-place-row"
      onClick={() => onSelect?.(place)}
      disabled={!onSelect}
      aria-label={`${label}${meta ? `, ${meta}` : ""}`}
    >
      <span><strong>{label}</strong>{meta && <small>{meta}</small>}</span>
      <ChevronRight aria-hidden="true" />
    </button>
  );
}

function EmptyState({ children, action }) {
  return (
    <div className="dp-building-empty-state">
      <p>{children}</p>
      {action || null}
    </div>
  );
}

export default function BuildingExperienceModule({ building, experience, mode = "resident", onSelect, onExplore, onOpenRoute }) {
  const isPartner = mode === "partner";
  const labels = isPartner ? PARTNER_SECTION_LABELS : RESIDENT_SECTION_LABELS;
  const entityId = building.id || building.entityId || building.slug || "property";
  const campaignRoute = withQuery("/partner-workspace/campaigns", { entityId, intent: "new" });
  const offerRoute = withQuery("/partner-workspace/offers", { entityId, intent: "new" });
  const eventRoute = withQuery("/partner-workspace/events", { entityId, intent: "new" });
  const profileRoute = withQuery("/partner-workspace/profile", { entityId, section: "amenities" });
  const hostRef = useRef(null);
  const navRef = useRef(null);
  const sectionPrefix = `building-${String(entityId).replace(/[^a-z0-9_-]+/gi, "-")}`;
  const reduceMotion = useReducedMotion();

  const navItems = useMemo(() => {
    const items = ["overview", "perks"];
    if (experience.collections?.length) items.push("collections");
    if (experience.campaigns?.length || isPartner) items.push("campaigns");
    items.push("amenities");
    if (experience.events?.length || isPartner) items.push("events");
    if (experience.routes?.length) items.push("routes");
    items.push("nearby", "guide");
    return items.map((id) => [id, labels[id]]);
  }, [experience.campaigns?.length, experience.collections?.length, experience.events?.length, experience.routes?.length, isPartner, labels]);

  const [activeSection, setActiveSection] = useState(navItems[0][0]);

  useEffect(() => {
    if (!navItems.some(([id]) => id === activeSection)) setActiveSection(navItems[0][0]);
  }, [activeSection, navItems]);

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
  }, [entityId, navItems]);

  useEffect(() => {
    const activeButton = navRef.current?.querySelector(`[data-building-nav="${activeSection}"]`);
    activeButton?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "nearest", inline: "center" });
  }, [activeSection, reduceMotion]);

  return (
    <div ref={hostRef} className="dp-system dp-building-experience-host">
      <div className="dp-building-experience" data-building-experience={entityId} data-building-mode={mode}>
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
                    layoutId={`building-experience-nav-${entityId}`}
                    transition={{ duration: reduceMotion ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] }}
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </nav>

        <Section id="overview" controlId={`${sectionPrefix}-overview`} title="At a glance">
          <dl className="dp-building-status-line" aria-label="Live building content summary">
            <div><dt>{isPartner ? "Offers" : "Perks"}</dt><dd>{experience.perks.length}</dd></div>
            <div><dt>Events</dt><dd>{experience.events.length}</dd></div>
            <div><dt>Routes</dt><dd>{experience.routes.length}</dd></div>
          </dl>
          {!!experience.identity.length && (
            <ul className="dp-building-identity-list" aria-label={isPartner ? "Building campaign context" : "Building character"}>
              {experience.identity.map((tag) => <li key={tag}>{isPartner ? partnerIdentityLabel(tag) : tag}</li>)}
            </ul>
          )}
        </Section>

        <Section
          id="perks"
          controlId={`${sectionPrefix}-perks`}
          title={isPartner ? "Offers" : "Perks"}
          description={isPartner ? "Offers currently connected to this building and its nearby audience." : "Useful resident benefits available around this building."}
          action={isPartner ? <Link className="dp-building-section-action" to={offerRoute}>Create offer</Link> : null}
        >
          {experience.perks.length ? (
            <div className="dp-building-row-list">
              {experience.perks.map((place) => <PlaceRow key={place.id} place={place} meta={place.offer || place.deals_offers} onSelect={onSelect} />)}
            </div>
          ) : (
            <EmptyState action={isPartner ? <Link to={offerRoute}>Create the first offer</Link> : <button type="button" onClick={() => onExplore?.("Perks")} disabled={!onExplore}>Explore nearby perks</button>}>
              {isPartner ? "No active offers are connected to this building." : "No active perks are connected yet."}
            </EmptyState>
          )}
        </Section>

        {!!experience.collections.length && (
          <Section id="collections" controlId={`${sectionPrefix}-collections`} title={isPartner ? "Audience ideas" : "Ideas nearby"} description={isPartner ? "Useful themes generated from real nearby places." : "Simple ways to use the neighborhood around this building."}>
            <div className="dp-building-collection-list">
              {experience.collections.map((collection) => (
                <button key={collection.id} type="button" onClick={() => onExplore?.(collection.intent)} disabled={!onExplore}>
                  <span><strong>{collection.title}</strong><small>{collection.places.length ? `${collection.places.length} nearby` : "Search nearby"}</small></span>
                  <ChevronRight aria-hidden="true" />
                </button>
              ))}
            </div>
          </Section>
        )}

        {(experience.campaigns.length > 0 || isPartner) && (
          <Section
            id="campaigns"
            controlId={`${sectionPrefix}-campaigns`}
            title={isPartner ? "Campaigns" : "Building programs"}
            description={isPartner ? "Recommendations based on building context and nearby demand." : "Programs selected for this building."}
            action={isPartner ? <Link className="dp-building-section-action" to={campaignRoute}>New campaign</Link> : null}
          >
            {experience.campaigns.length ? (
              <div className="dp-building-campaign-list">
                {experience.campaigns.map((campaign) => (
                  campaign.entity ? (
                    <PlaceRow key={campaign.id} place={campaign.entity} meta={`${campaign.family} · ${campaign.status}`} onSelect={onSelect} />
                  ) : isPartner ? (
                    <Link key={campaign.id} to={withQuery(campaignRoute, { suggestion: campaign.title })}>
                      <Sparkles aria-hidden="true" />
                      <span><strong>{campaign.title}</strong><small>{campaign.family} · {campaign.status}</small></span>
                      <ChevronRight aria-hidden="true" />
                    </Link>
                  ) : (
                    <article key={campaign.id}>
                      <Sparkles aria-hidden="true" />
                      <span><strong>{campaign.title}</strong><small>{campaign.family} · {campaign.status}</small></span>
                    </article>
                  )
                ))}
              </div>
            ) : (
              <EmptyState action={<Link to={campaignRoute}>Plan a campaign</Link>}>No campaign is connected yet.</EmptyState>
            )}
          </Section>
        )}

        <Section
          id="amenities"
          controlId={`${sectionPrefix}-amenities`}
          title="Shared amenities"
          description={isPartner ? "Use published amenities to shape building campaigns and communications." : "Organized by how residents use the building."}
          action={isPartner ? <Link className="dp-building-section-action" to={profileRoute}>Edit</Link> : null}
        >
          {experience.amenities.length ? (
            <div className="dp-building-amenity-groups">
              {experience.amenities.map((group) => (
                <article key={group.id}><h4>{group.title}</h4><ul>{group.amenities.map((amenity) => <li key={amenity}>{amenity}</li>)}</ul></article>
              ))}
            </div>
          ) : (
            <EmptyState action={isPartner ? <Link to={profileRoute}>Add amenities</Link> : null}>Amenity details have not been published.</EmptyState>
          )}
        </Section>

        {(experience.events.length > 0 || isPartner) && (
          <Section
            id="events"
            controlId={`${sectionPrefix}-events`}
            title="Events"
            description={isPartner ? "Events connected to this building and its surrounding district." : "Building and downtown events close to home."}
            action={isPartner ? <Link className="dp-building-section-action" to={eventRoute}>Create event</Link> : null}
          >
            {experience.events.length ? (
              <div className="dp-building-row-list">
                {experience.events.map((event) => <PlaceRow key={event.id} place={event} meta={event.date || event.startDate || event.district} onSelect={onSelect} />)}
              </div>
            ) : (
              <EmptyState action={isPartner ? <Link to={eventRoute}>Create the first event</Link> : null}>No upcoming events are connected yet.</EmptyState>
            )}
          </Section>
        )}

        {!!experience.routes.length && (
          <Section id="routes" controlId={`${sectionPrefix}-routes`} title="Walking routes" description="Open a route without leaving the map context.">
            <div className="dp-building-route-list">
              {experience.routes.map((routeItem) => (
                <button key={routeItem.id} type="button" onClick={() => onOpenRoute?.(routeItem.id, routeItem.title)} disabled={!onOpenRoute}>
                  <Route aria-hidden="true" />
                  <span><strong>{routeItem.title}</strong><small>{routeItem.estimatedTime || routeItem.distanceLabel || "Walking route"}</small></span>
                  <ChevronRight aria-hidden="true" />
                </button>
              ))}
            </div>
          </Section>
        )}

        <Section id="nearby" controlId={`${sectionPrefix}-nearby`} title="Nearby" description={isPartner ? "Places that can strengthen this building’s offers, campaigns, and local guide." : "Closest useful places from the active map results."}>
          {experience.nearby.length ? (
            <div className="dp-building-row-list">
              {experience.nearby.map((place) => <PlaceRow key={place.id} place={place} meta={formatDistanceLabel(place.buildingDistanceMeters) || place.category} onSelect={onSelect} />)}
            </div>
          ) : (
            <EmptyState action={<button type="button" onClick={() => onExplore?.("Nearby")} disabled={!onExplore}><MapPin aria-hidden="true" />Search nearby</button>}>
              No nearby results are loaded for this building.
            </EmptyState>
          )}
        </Section>

        <Section id="guide" controlId={`${sectionPrefix}-guide`} title={isPartner ? "Building profile" : "Resident guide"}>
          {experience.guide.summary && <p className="dp-building-guide-copy">{experience.guide.summary}</p>}
          {!!experience.guide.routines.length && <ol className="dp-building-guide-list">{experience.guide.routines.map((routine) => <li key={routine}>{routine}</li>)}</ol>}
          <div className="dp-building-guide-actions">
            <button type="button" onClick={() => onExplore?.("Events")} disabled={!onExplore}><CalendarDays aria-hidden="true" />{isPartner ? "Review events" : "View events"}</button>
            <button type="button" onClick={() => onExplore?.("Nearby")} disabled={!onExplore}><MapPin aria-hidden="true" />{isPartner ? "Review nearby" : "Explore nearby"}</button>
          </div>
        </Section>
      </div>
    </div>
  );
}
