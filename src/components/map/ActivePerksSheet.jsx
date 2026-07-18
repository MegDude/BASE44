import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Star, X } from "lucide-react";

const HEIGHT_BY_STATE = {
  collapsed: "104px",
  medium: "46dvh",
  expanded: "min(82dvh, calc(100dvh - var(--dp-map-native-bottom-nav-height) - var(--dp-safe-bottom) - 18px))",
};

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

function PerkRow({ item, saved, redeemed, onOpen, onRedeem, onSave }) {
  const expiry = formatExpiry(item.expiresAt);
  return (
    <article className="dp-active-perk-row">
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
          {(expiry || item.distance) && (
            <small>{[expiry, item.distance].filter(Boolean).join(" · ")}</small>
          )}
        </span>
      </button>
      <div className="dp-active-perk-actions" aria-label={`${item.name} perk actions`}>
        <button type="button" onClick={() => onRedeem(item)} disabled={redeemed}>
          {redeemed ? "Used" : "Redeem"}
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
  const sheetRef = useRef(null);
  const nextState = drawerState === "collapsed" ? "medium" : drawerState === "medium" ? "expanded" : "medium";

  useEffect(() => {
    const node = sheetRef.current;
    if (!node) return;
    const updateSurface = () => {
      const isMobile = window.matchMedia("(max-width: 767px)").matches;
      const properties = {
        position: "fixed",
        right: "0",
        bottom: "calc(var(--dp-map-native-bottom-nav-height) + var(--dp-safe-bottom))",
        left: "0",
        width: isMobile ? "100dvw" : "min(760px, 100dvw)",
        "min-width": "0",
        "max-width": isMobile ? "100dvw" : "760px",
        height: HEIGHT_BY_STATE[drawerState],
        margin: "0 auto",
        "border-radius": "0",
      };
      Object.entries(properties).forEach(([property, value]) => node.style.setProperty(property, value, "important"));
    };
    updateSurface();
    window.addEventListener("resize", updateSurface);
    return () => window.removeEventListener("resize", updateSurface);
  }, [drawerState]);

  return (
    <motion.aside
      ref={sheetRef}
      className={`dp-active-perks-sheet is-${drawerState}`}
      role="dialog"
      aria-modal="true"
      aria-label="Active perks"
      initial={{ opacity: 0, y: 44 }}
      animate={{ opacity: 1, y: 0, height: HEIGHT_BY_STATE[drawerState] }}
      exit={{ opacity: 0, y: 44 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
    >
      <button
        type="button"
        className="dp-active-perks-handle"
        onClick={() => onDrawerStateChange(nextState)}
        aria-label={`Panel size: ${drawerState}. Activate to change the panel height.`}
        aria-expanded={drawerState === "expanded"}
      >
        <span aria-hidden="true" />
      </button>
      <header className="dp-active-perks-header">
        <div>
          <p>Resident benefits</p>
          <h2>Active perks</h2>
        </div>
        <strong aria-live="polite">{items.length} nearby</strong>
        <button type="button" className="dp-active-perks-close" onClick={onClose} aria-label="Close active perks">
          <X aria-hidden="true" />
        </button>
      </header>
      {drawerState !== "collapsed" && (
        <div
          className="dp-active-perks-list"
          data-active-perks-scroll="true"
          ref={(node) => {
            if (node && initialScrollTop > 0 && node.scrollTop === 0) node.scrollTop = initialScrollTop;
          }}
        >
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
    </motion.aside>
  );
}
