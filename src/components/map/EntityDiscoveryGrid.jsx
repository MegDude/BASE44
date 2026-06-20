import { resolveMapImage } from "@/lib/map/entityImageResolver";

const FALLBACK_IMAGE = "/images/imported/perks/places-nearby.png";

function fallbackImage(event) {
  event.currentTarget.src = FALLBACK_IMAGE;
}

export default function EntityDiscoveryGrid({ sections = [], mode = "resident", onSelect }) {
  const visibleSections = sections
    .map((section) => ({
      ...section,
      items: (section.items || []).filter((item) => item?.entity || item?.title),
    }))
    .filter((section) => section.items.length);

  if (!visibleSections.length) return null;

  return (
    <div className="dp-entity-discovery-grid-system">
      {visibleSections.map((section) => (
        <div key={section.title} className="dp-entity-discovery-group">
          <h4 className="dp-entity-discovery-group-title">{section.label || section.title}</h4>
          <div className="dp-entity-discovery-grid" aria-label={section.title}>
            {section.items.map((item) => {
              const entity = item.entity || {};
              const title = item.title || entity.name || entity.title || "Downtown place";
              const image = item.image || resolveMapImage(entity, mode === "partner" ? "relatedRail" : "card") || FALLBACK_IMAGE;
              const meta = item.meta || item.distance || item.type || item.status || "";
              const context = item.context && item.context !== meta ? item.context : "";

              return (
                <button
                  type="button"
                  key={entity.id || title}
                  className="dp-entity-discovery-card"
                  onClick={() => entity.id && onSelect?.(entity)}
                >
                  <span className="dp-entity-media">
                    <img src={image} alt="" loading="lazy" decoding="async" onError={fallbackImage} />
                  </span>
                  <strong>{title}</strong>
                  {(meta || context) && (
                    <small>
                      {meta && <span>{meta}</span>}
                      {context && <em>{context}</em>}
                    </small>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
