import { CalendarDays, Gift } from "lucide-react";

export function CollectionEntityRail({ title, kind, items, onSelect }) {
  if (!items.length) return null;
  const Icon = kind === "events" ? CalendarDays : Gift;
  return (
    <section className="dp-collection-v3-section" aria-labelledby={`dp-collection-${kind}-heading`}>
      <div className="dp-collection-v3-heading"><p>Live collection layer</p><h3 id={`dp-collection-${kind}-heading`}>{title}</h3></div>
      <div className="dp-collection-entity-rail">
        {items.map((item) => (
          <button type="button" key={item.id} onClick={() => onSelect(item)}>
            <Icon aria-hidden="true" />
            <span><strong>{item.name || item.title}</strong><small>{item.offer || item.dateLabel || item.district || item.category}</small></span>
          </button>
        ))}
      </div>
    </section>
  );
}
