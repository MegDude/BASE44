import { useMemo, useState } from "react";
import { Navigation, Star, X } from "lucide-react";
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
      <img
        className={`dp-active-perk-hero${fallbackImage ? " is-logo-fallback" : ""}`}
        src={source}
        alt=""
        loading="lazy"
        decoding="async"
        onError={(event) => {
          event.currentTarget.hidden = true;
          event.currentTarget.closest(".dp-active-perk-media")?.setAttribute("data-media-unavailable", "true");
        }}
      />
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

// Canonical mobile perk categories, in required display order. Kept as a flat
// label list so the shared Perks/Saved/Nearby mobile contract can verify the
// category set, then decorated with optional icons for the data-driven rail.
const PERK_FILTER_LABELS = ["Active", "Nearby", "Dining", "Fitness", "Wellness", "Events", "Saved"];
const PERK_FILTER_ICONS = { Nearby: Navigation, Saved: Star };
const PERK_FILTERS = PERK_FILTER_LABELS.map((label) => ({ label, icon: PERK_FILTER_ICONS[label] ?? null }));
const CATEGORY_TERMS = {
  Dining: ["dining", "restaurant", "food", "coffee", "cafe", "bar", "drink"],
  Fitness: ["fitness", "gym", "workout", "sport", "yoga", "pilates"],
  Wellness: ["wellness", "spa", "health", "beauty", "salon", "massage"],
  Events: ["event", "entertainment", "music", "arts", "culture", "venue"],
};

function matchesPerkFilter(item, filter, savedIds) {
  if (filter === "Active") return !item.expired && !item.unavailable && !item.upcoming;
  if (filter === "Saved") return savedIds.has(item.id);
  if (filter === "Nearby") return Boolean(item.distance);

  const searchable = [item.category, item.name, item.offerTitle, item.partner]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return CATEGORY_TERMS[filter]?.some((term) => searchable.includes(term)) ?? true;
}

function PerkRow({ item, saved, redeemed, onOpen, onRedeem, onSave }) {
  const expiry = formatExpiry(item.expiresAt);
  const availability = perkAvailabilityLabel(item, redeemed);
  return (
    <article className="dp-active-perk-row dp-mobile-result-row" role="listitem" data-perk-state={availability.toLowerCase().replace(/[^a-z0-9]+/g, "-")} data-canonical-entity-id={item.id}>
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
  const [selectedFilter, setSelectedFilter] = useState("Active");
  const matchingItems = useMemo(
    () => items.filter((item) => matchesPerkFilter(item, selectedFilter, savedIds)),
    [items, savedIds, selectedFilter],
  );
  const filteredItems = matchingItems.length || selectedFilter === "Active" ? matchingItems : items;
  const isCatalogFallback = selectedFilter !== "Active" && matchingItems.length === 0;

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
            <div className="dp-active-perks-heading">
              <p>Resident benefits</p>
              <h2>Perks</h2>
              <span className="dp-active-perks-count" aria-live="polite">
                {filteredItems.length} {filteredItems.length === 1 ? "offer" : "offers"} available
              </span>
            </div>
            <button type="button" className="dp-active-perks-close" onClick={onClose} aria-label="Close active perks">
              <X aria-hidden="true" />
            </button>
          </header>
        </>
      )}
    >
      {safeState !== "peek" && (
        <div className="dp-active-perks-body">
          <p className="dp-active-perks-context">
            {selectedFilter === "Active"
              ? "Available near this map area"
              : isCatalogFallback
                ? `No exact ${selectedFilter.toLowerCase()} matches yet — showing all active perks`
                : `${selectedFilter} perks near you`}
          </p>
          <div className="dp-perks-filter-rail" role="group" aria-label="Perk filters">
            {PERK_FILTERS.map(({ label, icon: Icon }) => (
              <button
                key={label}
                type="button"
                aria-pressed={selectedFilter === label}
                onClick={() => setSelectedFilter(label)}
              >
                {Icon ? <Icon aria-hidden="true" /> : null}
                <span>{label}</span>
              </button>
            ))}
          </div>
          <div className="dp-active-perks-collection" role="list">
            {filteredItems.map((item) => (
              <PerkRow
                key={item.id}
                item={item}
                saved={savedIds.has(item.id)}
                redeemed={redeemedIds.has(item.perkId) || redeemedIds.has(item.id)}
                onOpen={onOpen}
                onRedeem={onRedeem}
                onSave={onSave}
              />
            ))}
          </div>
        </div>
      )}
    </NativeDrawerShell>
  );
}
