import type { LegendsProperty } from "@/data/legendsPropertyContent";
import { handlePanelMediaError } from "@/lib/map/panelMediaPresentation";

type DrawerState = "peek" | "half" | "expanded";

type LegendsPropertyDrawerProps = {
  property: LegendsProperty;
  drawerState: DrawerState;
  onDrawerStateChange: (state: DrawerState) => void;
  onClose: () => void;
  onSave?: () => void;
  onPrimaryCTA?: () => void;
  onSecondaryCTA?: () => void;
};

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <article className="dp-legends-property-card">
      <strong>{title}</strong>
      <span>{items.filter(Boolean).join(", ")}</span>
    </article>
  );
}

export function LegendsPropertyPanel({
  property,
  drawerState,
  onDrawerStateChange,
  onClose,
  onSave,
  onPrimaryCTA,
  onSecondaryCTA,
}: LegendsPropertyDrawerProps) {
  const expanded = drawerState === "expanded";
  return (
    <aside className={`dp-legends-property-drawer dp-legends-property-drawer--${drawerState}`}>
      <div className="dp-legends-property-handle" aria-hidden="true" />
      <div className="dp-legends-property-controls">
        <button type="button" onClick={() => onDrawerStateChange(drawerState === "peek" ? "half" : "peek")}>Collapse</button>
        <button type="button" onClick={onClose}>Close</button>
      </div>
      <img src={property.imageAsset} alt={property.buildingName} className="dp-legends-property-hero" loading="eager" decoding="async" onError={handlePanelMediaError} />
      <p className="dp-legends-property-meta">Residential · {property.neighborhood}</p>
      <h2>{property.buildingName}</h2>
      <p className="dp-legends-property-address">{property.address}</p>
      <p className="dp-legends-property-summary">{property.summary}</p>
      <div className="dp-legends-property-actions">
        <button type="button" onClick={onPrimaryCTA}>{property.ctaPrimary}</button>
        <button type="button" onClick={onSecondaryCTA}>{property.ctaSecondary}</button>
      </div>
      {drawerState !== "peek" && (
        <>
          <section>
            <h3>Included With Downtown Perks</h3>
            <p>The neighborhood becomes part of the amenity.</p>
          </section>
          <section>
            <h3>Benefits Matrix</h3>
            <div className="dp-legends-property-grid">
              <ListBlock title="Coffee" items={property.coffee} />
              <ListBlock title="Dining" items={property.dining} />
              <ListBlock title="Drinks" items={property.drinks} />
              <ListBlock title="Wellness" items={property.wellness} />
              <ListBlock title="Groceries" items={property.groceries} />
              <ListBlock title="Nearby" items={property.nearbyLocations} />
            </div>
          </section>
          <section>
            <h3>Why It Matters</h3>
            <p>{property.whyItMatters}</p>
          </section>
          {expanded && (
            <>
              <section>
                <h3>Available Listings</h3>
                <div className="dp-legends-property-list">
                  {(property.listings.length ? property.listings : ["No active Legends listings are attached to this building yet."]).map((listing) => (
                    <span key={listing}>{listing}</span>
                  ))}
                </div>
              </section>
              <section>
                <h3>Interested?</h3>
                <p>Want to live here? Legends can help you compare availability, building fit, and nearby lifestyle.</p>
                <div className="dp-legends-property-actions">
                  <button type="button" onClick={onPrimaryCTA}>Contact Legends</button>
                  <button type="button" onClick={onSave}>Save Building</button>
                </div>
              </section>
            </>
          )}
        </>
      )}
    </aside>
  );
}

export const LegendsPropertyDrawer = LegendsPropertyPanel;
export default LegendsPropertyDrawer;
