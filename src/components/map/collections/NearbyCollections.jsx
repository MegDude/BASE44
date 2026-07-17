import { ArrowRight } from "lucide-react";

export function NearbyCollections({ collections, onOpen }) {
  if (!collections.length) return null;
  return (
    <section className="dp-collection-v3-section" aria-labelledby="dp-nearby-collections-heading">
      <div className="dp-collection-v3-heading"><p>Continue exploring</p><h3 id="dp-nearby-collections-heading">Nearby collections</h3></div>
      <div className="dp-nearby-collections">
        {collections.map((collection) => (
          <button type="button" key={collection.id} onClick={() => onOpen?.(collection.id)}>
            <span><small>{collection.neighborhood || "Downtown Austin"}</small><strong>{collection.title}</strong><em>{collection.stops?.length || collection.stopIds?.length || "Live"} stops</em></span>
            <ArrowRight aria-hidden="true" />
          </button>
        ))}
      </div>
    </section>
  );
}
