import { Bookmark, Play, Share2 } from "lucide-react";

function heroImage(route) {
  const firstStop = route?.stops?.find((stop) => stop?.heroImage || stop?.image || stop?.imageUrl);
  return route?.heroImage || firstStop?.heroImage || firstStop?.image || firstStop?.imageUrl || "";
}

export function CollectionHero({ route, isSaved, onSave, onShare, onStart }) {
  const image = heroImage(route);
  return (
    <section className="dp-collection-hero" data-theme={route.colorTheme || "gold"}>
      {image ? <img src={image} alt="" loading="eager" decoding="async" /> : null}
      <div className="dp-collection-hero__scrim" aria-hidden="true" />
      <div className="dp-collection-hero__content">
        <p>{route.neighborhood || "Downtown Austin"}</p>
        <h2 id={`dp-route-panel-title-${route.id}`}>{route.title}</h2>
        <span>{route.description}</span>
        <div className="dp-collection-hero__actions">
          <button type="button" className="is-primary" onClick={onStart}><Play aria-hidden="true" /> {route.ctaLabel || "Start exploring"}</button>
          <button type="button" aria-pressed={isSaved} onClick={onSave}><Bookmark aria-hidden="true" /> {isSaved ? "Saved" : "Save"}</button>
          <button type="button" aria-label={`Share ${route.title}`} onClick={onShare}><Share2 aria-hidden="true" /></button>
        </div>
      </div>
    </section>
  );
}
