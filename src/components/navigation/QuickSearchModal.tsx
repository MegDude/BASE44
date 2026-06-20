import { useEffect, useMemo, useRef, useState } from "react";
import type React from "react";
import {
  Badge,
  Building2,
  CalendarDays,
  ChevronRight,
  Coffee,
  Home,
  Hotel,
  Landmark,
  Search,
  Sparkles,
  Store,
  Tag,
  TicketPercent,
  Utensils,
  X,
} from "lucide-react";
import { useMapEntityData } from "@/hooks/useMapEntityData";
import type { SearchResult, SearchResultKind } from "@/types";

type QuickSearchModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelectResult: (result: SearchResult) => void;
};

type SearchSection = {
  key: string;
  label: string;
  kinds: SearchResultKind[];
};

const SECTIONS: SearchSection[] = [
  { key: "properties", label: "Properties", kinds: ["property"] },
  { key: "venues", label: "Partners & Venues", kinds: ["partner", "venue"] },
  { key: "events", label: "Local Events", kinds: ["event"] },
  { key: "perks", label: "Perks", kinds: ["perk"] },
  { key: "hotels", label: "Hotels", kinds: ["hotel"] },
  { key: "civic", label: "Civic", kinds: ["civic"] },
  { key: "brands", label: "Brands", kinds: ["brand"] },
  { key: "listings", label: "Listings", kinds: ["listing"] },
];

const STARTER_LABELS: Record<string, string> = {
  properties: "Top properties",
  perks: "Active perks",
  events: "Upcoming events",
  venues: "Featured partners",
};

const KIND_ICON = {
  property: Building2,
  partner: Store,
  venue: Store,
  event: CalendarDays,
  perk: TicketPercent,
  hotel: Hotel,
  brand: Tag,
  civic: Landmark,
  listing: Home,
} satisfies Record<SearchResultKind, typeof Building2>;

function readText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function getCoords(entity: any) {
  const lat = Number(entity?.latitude ?? entity?.lat ?? entity?.coords?.[0]);
  const lng = Number(entity?.longitude ?? entity?.lng ?? entity?.coords?.[1]);
  return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : {};
}

function getKind(entity: any): SearchResultKind {
  const haystack = [
    entity?.entityType,
    entity?.sourceType,
    entity?.kind,
    entity?.type,
    entity?.category,
    entity?.markerType,
    entity?.detailDrawerType,
    entity?.name,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (haystack.includes("rental") || haystack.includes("listing") || entity?.isLegendsListing) return "listing";
  if (haystack.includes("event") || entity?.isEvent) return "event";
  if (haystack.includes("perk") || haystack.includes("offer") || entity?.hasPerk || entity?.perk) return "perk";
  if (haystack.includes("hotel")) return "hotel";
  if (haystack.includes("brand")) return "brand";
  if (haystack.includes("civic") || haystack.includes("park") || haystack.includes("museum")) return "civic";
  if (haystack.includes("property") || haystack.includes("residential") || haystack.includes("building") || haystack.includes("condo")) return "property";
  if (haystack.includes("coffee")) return "venue";
  if (haystack.includes("restaurant") || haystack.includes("dining")) return "venue";
  return "venue";
}

function getRoute(result: SearchResult, entity: any) {
  if (result.kind === "listing" && String(entity?.sourceType || entity?.kind || "").toLowerCase().includes("rental")) {
    return `/app?layer=rentals&listing=${encodeURIComponent(result.id)}`;
  }

  if (result.kind === "event") {
    return `/app?mode=resident&tab=events&entityId=${encodeURIComponent(result.id)}`;
  }

  return `/app?mode=resident&tab=map&entityId=${encodeURIComponent(result.id)}`;
}

function normalizeResult(entity: any): SearchResult | null {
  const id = readText(entity?.id);
  const title = readText(entity?.name || entity?.title || entity?.building || entity?.address);
  if (!id || !title) return null;

  const kind = getKind(entity);
  const coords = getCoords(entity);
  const neighborhood = readText(entity?.district || entity?.neighborhood);
  const category = readText(entity?.category || entity?.type || entity?.kind);
  const timeLabel = readText(entity?.time || entity?.date);
  const address = readText(entity?.address);
  const listingFacts = readText(entity?.listingFacts);
  const offerTitle = readText(entity?.perk?.title || entity?.perk?.offer || entity?.deals_offers || entity?.specials);
  const subtitle =
    kind === "listing"
      ? listingFacts || [entity?.beds ? `${entity.beds} bed` : "", entity?.baths ? `${entity.baths} bath` : "", neighborhood].filter(Boolean).join(" · ")
      : kind === "event"
        ? [timeLabel, neighborhood].filter(Boolean).join(" · ")
        : [category, neighborhood].filter(Boolean).join(" · ");

  const result: SearchResult = {
    id,
    kind,
    title,
    subtitle,
    address,
    neighborhood,
    timeLabel,
    category,
    badge: kind === "perk" ? offerTitle || "Perk active" : kind === "listing" ? readText(entity?.priceLabel) : "",
    ...coords,
  };
  result.route = getRoute(result, entity);
  return result;
}

function getSearchBlob(result: SearchResult) {
  return [
    result.title,
    result.subtitle,
    result.address,
    result.neighborhood,
    result.timeLabel,
    result.category,
    result.badge,
    result.kind,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function sectionResults(results: SearchResult[], query: string) {
  return SECTIONS.map((section) => {
    const matches = results
      .filter((result) => section.kinds.includes(result.kind))
      .filter((result) => !query || getSearchBlob(result).includes(query))
      .slice(0, query ? 5 : 4);
    return { ...section, matches };
  }).filter((section) => section.matches.length > 0);
}

function starterResults(results: SearchResult[]) {
  const starterSections = new Set(["properties", "perks", "events", "venues"]);
  return sectionResults(results, "")
    .filter((section) => starterSections.has(section.key))
    .map((section) => ({ ...section, label: STARTER_LABELS[section.key] || section.label }));
}

export default function QuickSearchModal({ isOpen, onClose, onSelectResult }: QuickSearchModalProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const places = useMapEntityData();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const results = useMemo(() => {
    const seen = new Set<string>();
    return places
      .map(normalizeResult)
      .filter((result): result is SearchResult => Boolean(result))
      .filter((result) => {
        if (seen.has(result.id)) return false;
        seen.add(result.id);
        return true;
      });
  }, [places]);

  const normalizedQuery = query.trim().toLowerCase();
  const grouped = useMemo(
    () => (normalizedQuery ? sectionResults(results, normalizedQuery) : starterResults(results)),
    [normalizedQuery, results],
  );
  const flatResults = grouped.flatMap((section) => section.matches);
  const noResults = normalizedQuery && flatResults.length === 0;

  useEffect(() => {
    if (!isOpen) return undefined;
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = "hidden";
    window.setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 0);
    return () => {
      document.body.style.overflow = "";
      previousFocusRef.current?.focus?.({ preventScroll: true });
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    setActiveIndex(0);
  }, [isOpen, normalizedQuery]);

  if (!isOpen) return null;

  function chooseResult(result: SearchResult) {
    onSelectResult(result);
    onClose();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, Math.max(0, flatResults.length - 1)));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(0, index - 1));
      return;
    }

    if (event.key === "Enter" && flatResults[activeIndex]) {
      event.preventDefault();
      chooseResult(flatResults[activeIndex]);
      return;
    }

    if (event.key === "Tab") {
      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables?.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }

  let resultCounter = -1;

  return (
    <div className="dp-quick-search-overlay" role="presentation" onMouseDown={onClose}>
      <div
        ref={panelRef}
        className="dp-quick-search-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dp-quick-search-title"
        onMouseDown={(event) => event.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="dp-quick-search-head">
          <div>
            <p className="dp-quick-search-eyebrow">Downtown search</p>
            <h2 id="dp-quick-search-title">Find what is nearby.</h2>
          </div>
          <button type="button" className="dp-quick-search-close" onClick={onClose} aria-label="Close search">
            <X size={18} />
          </button>
        </div>

        <div className="dp-quick-search-input-wrap">
          <Search size={17} aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search places, perks, events, buildings..."
            aria-label="Search Downtown Perks"
          />
          {query ? (
            <button type="button" onClick={() => setQuery("")} aria-label="Clear search">
              <X size={15} />
            </button>
          ) : (
            <Sparkles size={15} aria-hidden="true" />
          )}
        </div>

        <div className="dp-quick-search-results" role="listbox" aria-label="Search results">
          {!normalizedQuery && (
            <p className="dp-quick-search-empty">Start typing to search downtown.</p>
          )}

          {noResults ? (
            <div className="dp-quick-search-no-results">
              <strong>No matching places yet.</strong>
              <span>Try a property, venue, event, perk, or neighborhood.</span>
            </div>
          ) : (
            grouped.map((section) => (
              <section key={section.key} className="dp-quick-search-section">
                <h3>{section.label}</h3>
                <div className="dp-quick-search-row-list">
                  {section.matches.map((result) => {
                    resultCounter += 1;
                    const rowIndex = resultCounter;
                    const Icon = KIND_ICON[result.kind] || Badge;
                    const isActive = rowIndex === activeIndex;
                    return (
                      <button
                        key={`${section.key}-${result.id}`}
                        type="button"
                        role="option"
                        aria-selected={isActive}
                        className={`dp-quick-search-row ${isActive ? "is-active" : ""}`}
                        onMouseEnter={() => setActiveIndex(rowIndex)}
                        onClick={() => chooseResult(result)}
                      >
                        <span className="dp-quick-search-icon" aria-hidden="true">
                          {result.kind === "venue" && /coffee/i.test(result.category || result.subtitle || "") ? (
                            <Coffee size={17} />
                          ) : result.kind === "venue" && /dining|restaurant/i.test(result.category || result.subtitle || "") ? (
                            <Utensils size={17} />
                          ) : (
                            <Icon size={17} />
                          )}
                        </span>
                        <span className="dp-quick-search-copy">
                          <strong>{result.title}</strong>
                          <small>{result.subtitle || result.address || result.neighborhood || result.kind}</small>
                        </span>
                        {result.badge ? <span className="dp-quick-search-badge">{result.badge}</span> : null}
                        <ChevronRight className="dp-quick-search-chevron" size={16} aria-hidden="true" />
                      </button>
                    );
                  })}
                </div>
              </section>
            ))
          )}
        </div>

        <div className="dp-quick-search-footer">
          <span>Start typing to search</span>
          <span>Use ↑ ↓ to navigate</span>
          <span>ESC to close</span>
        </div>
      </div>
    </div>
  );
}
