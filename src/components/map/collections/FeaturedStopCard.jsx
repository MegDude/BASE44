import { ChevronRight, Gift, MapPin } from "lucide-react";

function stopImage(stop) {
  return stop?.heroImage || stop?.image || stop?.imageUrl || stop?.thumbnail || stop?.raw?.image || "";
}

export function FeaturedStopCard({ stop, index, checkedIn, onSelect }) {
  const image = stopImage(stop);
  const reward = stop.offer || stop.perk || stop.residentPerk || stop.raw?.offer || "";
  return (
    <button type="button" className="dp-featured-stop-card" onClick={() => onSelect(stop)}>
      <span className="dp-featured-stop-card__media">
        {image ? <img src={image} alt="" loading="lazy" decoding="async" /> : <MapPin aria-hidden="true" />}
        <small>{checkedIn ? "Visited" : `Stop ${index + 1}`}</small>
      </span>
      <span className="dp-featured-stop-card__copy">
        <strong>{stop.name || stop.title}</strong>
        <em>{stop.district || stop.category || "Downtown Austin"}</em>
        {reward ? <span><Gift aria-hidden="true" /> {String(reward).slice(0, 72)}</span> : null}
      </span>
      <ChevronRight aria-hidden="true" />
    </button>
  );
}
