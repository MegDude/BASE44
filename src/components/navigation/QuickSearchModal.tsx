import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type React from "react";
import {
  ArrowLeft,
  ChevronRight,
  Coffee,
  LoaderCircle,
  MapPin,
  Music,
  Search,
  Sparkles,
  TicketPercent,
  Utensils,
  Wine,
  X,
} from "lucide-react";
import { useSearchDrivenMapEntities } from "@/hooks/useSearchDrivenMapEntities";
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
  filter?: (result: SearchResult) => boolean;
};

type AgentEntity = {
  id: string;
  title: string;
  reason?: string;
  deepLink?: string;
};

type AgentSearchResponse = {
  answer?: string;
  entities?: AgentEntity[];
  followUpPrompts?: string[];
  source?: string;
  degraded?: boolean;
};

type AgentState =
  | { status: "idle" }
  | { status: "loading"; query: string }
  | { status: "success"; query: string; response: AgentSearchResponse }
  | { status: "error"; query: string };

const DISCOVERY_SECTIONS: SearchSection[] = [
  {
    key: "trending",
    label: "Trending Nearby",
    kinds: ["event", "venue", "partner", "perk"],
    filter: (result) => /\b(live|music|coffee|dining|restaurant|happy|cocktail|drink|perk|event|tonight)\b/i.test(getSearchBlob(result)),
  },
  {
    key: "tonight",
    label: "Tonight",
    kinds: ["event", "venue", "partner", "perk"],
    filter: (result) => /\b(tonight|music|event|happy|hour|cocktail|drinks|dinner|live)\b/i.test(getSearchBlob(result)),
  },
  {
    key: "live-nearby",
    label: "Live Nearby",
    kinds: ["property", "hotel", "listing"],
    filter: (result) => /\b(residential|building|property|condo|apartment|hotel|rainey|seaholm|downtown)\b/i.test(getSearchBlob(result)),
  },
  {
    key: "benefits",
    label: "Member Benefits",
    kinds: ["perk", "venue", "partner"],
    filter: (result) => /\b(perk|benefit|offer|member|included|discount|complimentary|free|inkind|happy hour)\b/i.test(getSearchBlob(result)),
  },
];

const SEARCH_PLACEHOLDERS = [
  "Ask about coffee, music, or perks",
  "What is good nearby tonight?",
  "Find something walkable downtown",
];

const INTENT_SHORTCUTS = [
  { label: "Best Coffee Nearby", query: "Best coffee nearby", icon: Coffee },
  { label: "Happy Hour Specials", query: "Happy hour specials nearby", icon: Wine },
  { label: "Live Music Tonight", query: "Live music tonight", icon: Music },
  { label: "Rainey Street Dining", query: "Rainey Street dining", icon: Utensils },
  { label: "Active Perks", query: "Active resident perks", icon: TicketPercent },
];

const FALLBACK_IMAGES: Record<SearchResultKind, string> = {
  property: "/images/map-pins/property/downtown-view.jpg",
  partner: "/images/imported/perks/edgerooftop-homepage-sipinthescene-638515e802064.jpg",
  venue: "/images/imported/perks/edgerooftop-homepage-sipinthescene-638515e802064.jpg",
  event: "/images/map-entities/events/palmer-events-center-grounds.webp",
  perk: "/images/imported/perks/happy-hour-2.png",
  hotel: "/images/map-pins/property/hotel-van-zandt.webp",
  brand: "/images/imported/perks/designation-campaign.png",
  civic: "/images/imported/perks/contempary-austin.jpg",
  listing: "/images/map-pins/property/downtown-view.jpg",
};

function readText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function getImage(entity: any) {
  return readText(
    entity?.image ||
      entity?.imageUrl ||
      entity?.heroImage ||
      entity?.hero_image ||
      entity?.media?.hero ||
      entity?.primaryImage ||
      entity?.raw?.image ||
      entity?.raw?.imageUrl ||
      entity?.raw?.heroImage ||
      entity?.raw?.hero_image ||
      entity?.raw?.media?.hero,
  );
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
    return `/map?layer=rentals&listing=${encodeURIComponent(result.id)}`;
  }

  if (result.kind === "event") {
    return `/map?mode=resident&tab=events&entityId=${encodeURIComponent(result.id)}`;
  }

  return `/map?mode=resident&tab=map&entityId=${encodeURIComponent(result.id)}`;
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
  const summary = readText(entity?.residentLabel || entity?.subtitle || entity?.summary || entity?.description || entity?.offer || entity?.raw?.summary);
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
    image: getImage(entity),
    context: summary,
    ...coords,
  };
  result.route = getRoute(result, entity);
  return result;
}

function normalizeCatalogResult(document: any): SearchResult | null {
  const id = readText(document?.id);
  const title = readText(document?.title);
  if (!id || !title) return null;
  const resultType = readText(document?.resultType);
  const kindByResultType: Partial<Record<string, SearchResultKind>> = {
    listing: "listing",
    event: "event",
    perk: "perk",
    place: "venue",
    service: "venue",
    organization: "partner",
    person: "partner",
    campaign: "brand",
    route: "civic",
    report: "partner",
    tool: "partner",
  };
  const entityId = readText(document?.entityId || document?.linkedEntityId || id);
  const params = new URLSearchParams({
    mode: "resident",
    tab: "map",
    filter: "All",
    query: title,
  });
  if (entityId) params.set("entityId", entityId);
  return {
    id,
    kind: kindByResultType[resultType] || "venue",
    title,
    subtitle: readText(document?.subtitle),
    category: resultType,
    route: readText(document?.route) || `/map?${params.toString()}`,
  };
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

function getIntentNeedle(query: string) {
  return String(query || "")
    .toLowerCase()
    .replace(/\bwhere do you want to go\??/g, "coffee dining drinks rooftops events perks")
    .replace(/\bwhat do you want to do\??/g, "event live music happy hour dinner wellness perk")
    .replace(/\bwho do you want to meet\??/g, "events live music community resident hotel coffee")
    .replace(/\bbefore work\b/g, "coffee")
    .replace(/\bwith friends\b/g, "dining restaurant drinks")
    .replace(/\bthis weekend\b/g, "event")
    .replace(/\bnearby\b/g, "")
    .replace(/\btonight\b/g, "tonight live music event")
    .replace(/\bmember benefits\b/g, "perk offer benefit")
    .trim();
}

function sectionResults(results: SearchResult[], query: string) {
  const needle = getIntentNeedle(query);
  const used = new Set<string>();
  return DISCOVERY_SECTIONS.map((section) => {
    const matches = results
      .filter((result) => section.kinds.includes(result.kind))
      .filter((result) => !section.filter || section.filter(result))
      .filter((result) => !needle || getSearchBlob(result).includes(needle) || needle.split(/\s+/).some((part) => part.length > 2 && getSearchBlob(result).includes(part)))
      .filter((result) => {
        if (used.has(result.id)) return false;
        used.add(result.id);
        return true;
      })
      .slice(0, query ? 5 : 4);
    return { ...section, matches };
  }).filter((section) => section.matches.length > 0);
}

function starterResults(results: SearchResult[]) {
  return sectionResults(results, "");
}

export default function QuickSearchModal({ isOpen, onClose, onSelectResult }: QuickSearchModalProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const agentRequestRef = useRef<AbortController | null>(null);
  const agentDelayRef = useRef<number | null>(null);
  const agentRequestIdRef = useRef(0);
  const resultsRef = useRef<SearchResult[]>([]);
  const { places, catalogState, runSearch, searchCatalog } = useSearchDrivenMapEntities();
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [agentState, setAgentState] = useState<AgentState>({ status: "idle" });

  const results = useMemo(() => {
    const seen = new Set<string>();
    return [
      ...(catalogState.results || []).map(normalizeCatalogResult),
      ...places.map(normalizeResult),
    ]
      .filter((result): result is SearchResult => Boolean(result))
      .filter((result) => {
        if (seen.has(result.id)) return false;
        seen.add(result.id);
        return true;
      });
  }, [catalogState.results, places]);
  resultsRef.current = results;

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

  useEffect(() => {
    if (!isOpen || query) return undefined;
    const timer = window.setInterval(() => {
      setPlaceholderIndex((index) => (index + 1) % SEARCH_PLACEHOLDERS.length);
    }, 3000);
    return () => window.clearInterval(timer);
  }, [isOpen, query]);

  useEffect(() => {
    if (isOpen) {
      setSubmittedQuery("");
      setAgentState({ status: "idle" });
      return;
    }
    agentRequestRef.current?.abort();
    agentRequestRef.current = null;
    if (agentDelayRef.current !== null) window.clearTimeout(agentDelayRef.current);
    agentDelayRef.current = null;
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const cleanQuery = query.trim();
    if (!cleanQuery) {
      void searchCatalog("");
      return undefined;
    }
    if (cleanQuery.length < 2) return undefined;
    const timeoutId = window.setTimeout(() => {
      void searchCatalog(cleanQuery, places, "resident");
    }, 120);
    return () => window.clearTimeout(timeoutId);
  }, [isOpen, places, query, searchCatalog]);

  const requestAgentRecommendation = useCallback(async (cleanQuery: string) => {
    agentRequestRef.current?.abort();
    const controller = new AbortController();
    const requestId = agentRequestIdRef.current + 1;
    agentRequestIdRef.current = requestId;
    agentRequestRef.current = controller;
    setAgentState({ status: "loading", query: cleanQuery });

    const mapContext = resultsRef.current.slice(0, 25).map((result) => ({
      id: result.id,
      title: result.title,
      kind: result.kind,
      category: result.category,
      district: result.neighborhood,
      address: result.address,
      summary: result.context || result.subtitle,
      offer: result.badge,
      deepLink: result.route,
    }));

    try {
      const response = await fetch("/api/ask-map", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: cleanQuery,
          mode: "resident",
          intent: "quick_search",
          currentDistrict: "Downtown Austin",
          activeFilter: "All",
          mapContext,
          agentContext: { entityRegistry: mapContext, selectedDistrict: "Downtown Austin" },
        }),
        signal: controller.signal,
      });
      if (!response.ok) throw new Error("Search intelligence unavailable");
      const data = await response.json() as AgentSearchResponse;
      if (requestId !== agentRequestIdRef.current) return;
      setAgentState({ status: "success", query: cleanQuery, response: data });
    } catch (error) {
      if (controller.signal.aborted || requestId !== agentRequestIdRef.current) return;
      setAgentState({ status: "error", query: cleanQuery });
    }
  }, []);

  const executeQuickSearch = useCallback((nextQuery = query) => {
    const cleanQuery = nextQuery.trim();
    if (!cleanQuery || cleanQuery.length < 2) return;
    setSubmittedQuery(cleanQuery);
    void runSearch({
      query: cleanQuery,
      intent: "",
      filter: "All",
      audienceMode: "resident",
      currentBounds: null,
      zoom: 16,
      radius: "5 min walk",
      activeEntityId: "",
      resultLimit: 8,
    }, "quick_search_submit");
    if (agentDelayRef.current !== null) window.clearTimeout(agentDelayRef.current);
    agentDelayRef.current = window.setTimeout(() => {
      void requestAgentRecommendation(cleanQuery);
    }, 220);
  }, [query, requestAgentRecommendation, runSearch]);

  if (!isOpen) return null;

  function chooseResult(result: SearchResult) {
    onSelectResult(result);
    onClose();
  }

  function resolveAgentResult(entity: AgentEntity) {
    const normalizedTitle = entity.title.trim().toLowerCase();
    return results.find((result) => result.id === entity.id)
      || results.find((result) => result.title.trim().toLowerCase() === normalizedTitle)
      || null;
  }

  function clearSearch() {
    agentRequestRef.current?.abort();
    if (agentDelayRef.current !== null) window.clearTimeout(agentDelayRef.current);
    agentDelayRef.current = null;
    agentRequestIdRef.current += 1;
    setQuery("");
    setSubmittedQuery("");
    setAgentState({ status: "idle" });
    inputRef.current?.focus({ preventScroll: true });
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

    if (event.key === "Enter" && (event.nativeEvent.isComposing || event.keyCode === 229)) return;

    if (event.key === "Enter" && query.trim() && query.trim() !== submittedQuery) {
      event.preventDefault();
      executeQuickSearch();
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

  function handleResultImageError(event: React.SyntheticEvent<HTMLImageElement>, kind: SearchResultKind) {
    const fallback = FALLBACK_IMAGES[kind] || FALLBACK_IMAGES.venue;
    if (event.currentTarget.dataset.fallbackApplied === "true") return;
    event.currentTarget.dataset.fallbackApplied = "true";
    event.currentTarget.src = fallback;
  }

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
          <button type="button" className="dp-quick-search-back" onClick={onClose} aria-label="Go back from search">
            <ArrowLeft size={16} aria-hidden="true" />
          </button>
          <div>
            <p className="dp-quick-search-eyebrow dp-eyebrow text-[11px] font-bold uppercase tracking-[0.15em]">Downtown Austin intelligence</p>
            <h2 id="dp-quick-search-title">Ask Downtown</h2>
            <p className="dp-quick-search-support">AI guidance grounded in the live map.</p>
          </div>
          <div className="dp-quick-search-actions" aria-label="Search controls">
            <button type="button" className="dp-quick-search-close" onClick={onClose} aria-label="Close search">
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="dp-quick-search-input-wrap">
          <Search size={17} aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={SEARCH_PLACEHOLDERS[placeholderIndex]}
            aria-label="Search Downtown Perks"
          />
          {query ? (
            <button type="button" onClick={clearSearch} aria-label="Clear search">
              <X size={15} />
            </button>
          ) : (
            <span aria-hidden="true" />
          )}
        </div>

        <div className="dp-quick-search-intents" aria-label="Grounded discovery prompts">
          <h3>Try a grounded search</h3>
          <div className="dp-quick-search-intent-rail">
            {INTENT_SHORTCUTS.map((intent) => {
              const Icon = intent.icon;
              const isSelected = query === intent.query;
              return (
                <button
                  key={intent.label}
                  type="button"
                  className={isSelected ? "is-active" : ""}
                  onClick={() => {
                    setQuery(intent.query);
                    executeQuickSearch(intent.query);
                    inputRef.current?.focus({ preventScroll: true });
                  }}
                  aria-pressed={isSelected}
                >
                  <Icon size={15} aria-hidden="true" />
                  <span>{intent.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="dp-quick-search-results" aria-label="Search results">
          {agentState.status === "loading" ? (
            <section className="dp-quick-search-agent is-loading" role="status" aria-live="polite">
              <LoaderCircle aria-hidden="true" />
              <div><strong>Reading the live map</strong><p>Matching {agentState.query} to current places, events, and perks.</p></div>
            </section>
          ) : null}

          {agentState.status === "success" ? (
            <section className="dp-quick-search-agent" aria-labelledby="dp-agent-recommendation-title">
              <div className="dp-quick-search-agent-label"><Sparkles aria-hidden="true" /><span id="dp-agent-recommendation-title">Map intelligence</span>{agentState.response.degraded ? <small>Local match</small> : null}</div>
              <p className="dp-quick-search-agent-answer">{agentState.response.answer || "These are the strongest matches in the current downtown map."}</p>
              {agentState.response.entities?.some((entity) => resolveAgentResult(entity)) ? (
                <div className="dp-quick-search-agent-entities" aria-label="Recommended map results">
                  {agentState.response.entities.map((entity) => {
                    const matchedResult = resolveAgentResult(entity);
                    if (!matchedResult) return null;
                    return (
                      <button key={entity.id} type="button" onClick={() => chooseResult(matchedResult)}>
                        <MapPin aria-hidden="true" />
                        <span><strong>{matchedResult.title}</strong><small>{entity.reason || matchedResult.subtitle || "Open on the downtown map"}</small></span>
                        <ChevronRight aria-hidden="true" />
                      </button>
                    );
                  })}
                </div>
              ) : null}
              {agentState.response.followUpPrompts?.length ? (
                <div className="dp-quick-search-agent-followups" aria-label="Follow-up searches">
                  {agentState.response.followUpPrompts.slice(0, 3).map((prompt) => (
                    <button key={prompt} type="button" onClick={() => { setQuery(prompt); executeQuickSearch(prompt); }}>{prompt}</button>
                  ))}
                </div>
              ) : null}
            </section>
          ) : null}

          {agentState.status === "error" ? (
            <section className="dp-quick-search-agent is-error" role="status">
              <Sparkles aria-hidden="true" />
              <div><strong>Map results are still available</strong><p>Intelligent guidance could not load. Browse the grounded matches below or try again.</p></div>
              <button type="button" onClick={() => executeQuickSearch(agentState.query)}>Try again</button>
            </section>
          ) : null}

          {noResults ? (
            <div className="dp-quick-search-no-results">
              <strong>No matching places yet.</strong>
              <span>Try coffee, live music, happy hour, dinner, rooftops, events, or a downtown building.</span>
            </div>
          ) : (
            grouped.map((section) => (
              <section key={section.key} className="dp-quick-search-section">
                <h3>{section.label}</h3>
                <div className="dp-quick-search-row-list" role="listbox" aria-label={`${section.label} results`}>
                  {section.matches.map((result) => {
                    resultCounter += 1;
                    const rowIndex = resultCounter;
                    const isActive = rowIndex === activeIndex;
                    const image = result.image || FALLBACK_IMAGES[result.kind] || FALLBACK_IMAGES.venue;
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
                        <span className="dp-quick-search-image" aria-hidden="true">
                          <img src={image} alt="" loading="lazy" decoding="async" onError={(event) => handleResultImageError(event, result.kind)} />
                        </span>
                        <span className="dp-quick-search-copy">
                          <strong>{result.title}</strong>
                          <small>{[result.neighborhood, result.context || result.subtitle || result.address || result.kind].filter(Boolean).join(" · ")}</small>
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

        <div className="dp-quick-search-footer" aria-hidden="true" />
      </div>
    </div>
  );
}
