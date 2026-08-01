import { Navigation, Search, Star, X } from "lucide-react";
import { NativeDrawerShell } from "@/components/map/NativeDrawerShell";
import { nextDrawerState, normalizeDrawerState } from "@/lib/map/nativeDrawerState";

function formatExpiry(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `Expires ${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
}

function PerkRowMedia({ image, pin }) {
  const fallbackImage = image ? null : pin?.asset;
  const source = image || fallbackImage;

  if (!source) return null;

  return (
    <span className="dp-active-perk-media" aria-hidden="true">
      {source ? (
        <img
          className={`dp-active-perk-hero${fallbackImage ? " is-logo-fallback" : ""}`}
          src={source}
          alt=""
          loading="lazy"
          decoding="async"
          onError={(event) => {
            event.currentTarget.hidden = true;
          }}
        />
      ) : null}
    </span>
  );
}

function perkAvailabilityLabel(item, redeemed) {
  if (redeemed) return "Already used";
  if (item.expired) return "Expired";
  if (item.unavailable) return "Unavailable";
  if (item.upcoming) return "Upcoming";
  if (item.limited) return "Limited quantity";
  if (item.memberOnly) return "Member-only";
  return "Available now";
}

function PerkRow({ item, saved, redeemed, onOpen, onRedeem, onSave }) {
  const expiry = formatExpiry(item.expiresAt);
  const availability = perkAvailabilityLabel(item, redeemed);
  return (
    <article className="dp-active-perk-row dp-mobile-result-row" data-perk-state={availability.toLowerCase().replace(/[^a-z0-9]+/g, "-")} data-canonical-entity-id={item.id}>
      <button
        id={`dp-active-perk-${item.focusKey}`}
        type="button"
        className={`dp-active-perk-main${item.image || item.pin?.asset ? " has-media" : ""}`}
        onClick={(event) => onOpen(item, event)}
        aria-label={`Open ${item.name} perk`}
      >
        <PerkRowMedia image={item.image} pin={item.pin} />
        <span className="dp-active-perk-copy">
          <strong>{item.name}</strong>
          <span>{item.offerTitle}</span>
          <small>{[item.partner || item.category || "Resident benefit", item.value, item.distance, availability, saved ? "Saved" : ""].filter(Boolean).join(" · ")}</small>
          {expiry ? <em>{expiry}</em> : null}
        </span>
      </button>
      <div className="dp-active-perk-actions" aria-label={`${item.name} perk actions`}>
        <button type="button" onClick={() => onRedeem(item)} disabled={redeemed}>
          {redeemed ? "Used" : "Use perk"}
        </button>
        <button
          type="button"
          className="dp-active-perk-save"
          onClick={() => onSave(item)}
          aria-label={saved ? `Remove ${item.name} from saved` : `Save ${item.name}`}
          aria-pressed={saved}
        >
          <Star aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}

export default function ActivePerksSheet({
  items,
  drawerState,
  savedIds,
  redeemedIds,
  initialScrollTop = 0,
  onDrawerStateChange,
  onClose,
  onOpen,
  onRedeem,
  onSave,
}) {
  const safeState = normalizeDrawerState(drawerState, "list");
  const nextState = nextDrawerState(safeState, "list");

  return (
    <NativeDrawerShell
      className={`dp-active-perks-sheet is-${safeState}`}
      drawerState={safeState}
      panelKind="list"
      onRequestClose={onClose}
      aria-label="Active perks"
      initial={{ opacity: 0, y: 44 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 44 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      scrollClassName="dp-active-perks-list"
      scrollProps={{ "data-active-perks-scroll": "true" }}
      scrollRef={(node) => {
        if (node && initialScrollTop > 0 && node.scrollTop === 0) node.scrollTop = initialScrollTop;
      }}
      header={(
        <>
          <button
            type="button"
            className="dp-active-perks-handle"
            onClick={() => onDrawerStateChange(nextState)}
            aria-label={`Panel size: ${safeState}. Activate to change the panel height.`}
            aria-expanded={safeState === "expanded"}
          >
            <span aria-hidden="true" />
          </button>
          <header className="dp-active-perks-header">
            <div>
              <p>Resident benefits</p>
              <h2>Perks</h2>
            </div>
            <button type="button" className="dp-active-perks-close" onClick={onClose} aria-label="Close perks">
              <X aria-hidden="true" />
            </button>
          </header>
        </>
      )}
    >
      {safeState !== "peek" && (
        <div>
          <section className="dp-active-perks-intro" aria-label="Perks context">
            <p>Available near this map area</p>
            <strong aria-live="polite">{items.length} {items.length === 1 ? "offer" : "offers"}</strong>
          </section>
          <div className="dp-perks-filter-rail" role="group" aria-label="Perk filters">
            {["Active", "Nearby", "Dining", "Fitness", "Wellness", "Events", "Saved"].map((label, index) => (
              <button key={label} type="button" aria-pressed={index === 0}>
                {index === 1 ? <Navigation aria-hidden="true" /> : index === 0 ? <Search aria-hidden="true" /> : null}
                <span>{label}</span>
              </button>
            ))}
          </div>
          {items.length ? items.map((item) => (
            <PerkRow
              key={item.id}
              item={item}
              saved={savedIds.has(item.id)}
              redeemed={redeemedIds.has(item.perkId) || redeemedIds.has(item.id)}
              onOpen={onOpen}
              onRedeem={onRedeem}
              onSave={onSave}
            />
          )) : (
            <div className="dp-active-perks-empty">
              <strong>Nothing matches these filters.</strong>
              <span>Return to the map and try nearby places, dining, coffee, or events.</span>
              <button type="button" onClick={onClose}>Back to map</button>
            </div>
          )}
        </div>
      )}
    </NativeDrawerShell>
  );
}
