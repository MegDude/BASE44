import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSharedMapFeed } from "@/lib/map/useSharedMapFeed";
import { resolveResidentContext } from "@/lib/resident/resolveResidentContext";
import UnifiedMapShell from "@/components/map/unified/UnifiedMapShell";
import UnifiedResultsPanel from "@/components/map/unified/UnifiedResultsPanel";
import UnifiedDrawer from "@/components/map/unified/UnifiedDrawer";
import { createMarker } from "@/components/map/markers/MarkerFactory";
import {
  IconArrowRight,
  IconBookmark,
  IconCalendarCheck,
  IconCard,
  IconChevronDown,
  IconChevronUp,
  getEntityIcon,
  getEntityLabel,
  IconInfo,
  IconNavigation,
  IconPerk,
  getResidentTabIcon,
  IconSearch,
  IconSettings,
} from "@/components/icons/DPIcons";
import { useMapStateStore } from "@/store/mapStateStore";
import { useResidentStore } from "@/store/resident-store";
import { useResidentMutations } from "@/hooks/useResidentMutations";

const GUEST_RESIDENT = {
  id: "guest-resident",
  full_name: "Meg Dude",
  email: "guest@downtownperks.demo",
  role: "resident",
  is_guest: true,
  homeBuilding: "The Quincy",
  district: "Rainey / Waterfront",
};

const TAB_CONFIG = [
  { id: "now", label: "Now", path: "/resident-app" },
  { id: "map", label: "Map", path: "/resident-app/map" },
  { id: "saved", label: "Saved", path: "/resident-app/saved" },
  { id: "plan", label: "Plan", path: "/resident-app/plan" },
  { id: "card", label: "Card", path: "/resident-app/card" },
  { id: "you", label: "You", path: "/resident-app/you" },
];

const FILTER_CHIPS = [
  { id: "all", label: "All nearby" },
  { id: "venue", label: "Venues" },
  { id: "event", label: "Events" },
  { id: "perk", label: "Perks" },
  { id: "5min", label: "5 min walk" },
  { id: "coffee", label: "Coffee now" },
  { id: "tonight", label: "Happening tonight" },
  { id: "saved", label: "Saved" },
];

const FAST_PROMPTS = [
  "What is within 5 minutes right now",
  "Coffee near me",
  "Drinks after work",
  "Happening tonight",
];

function getActiveTab(pathname, search) {
  const pathMatch = TAB_CONFIG.find((tab) => pathname === tab.path);
  if (pathMatch) return pathMatch.id;
  return resolveResidentContext({ tab: new URLSearchParams(search).get("tab") }).tab;
}

function matchesResidentFilter(item, activeChip, savedIds) {
  if (activeChip === "all") return true;
  if (activeChip === "saved") return savedIds.has(item.id);
  if (activeChip === "5min") return (item.metadata?.walkMinutes ?? 999) <= 5;
  if (activeChip === "tonight") return item.type === "event" || item.isLive;
  if (activeChip === "coffee") {
    const text = `${item.category || ""} ${item.name || ""} ${item.title || ""}`.toLowerCase();
    return text.includes("coffee") || text.includes("cafe");
  }
  return item.type === activeChip || item.category === activeChip;
}

function matchesQuery(item, query) {
  const value = String(query || "").trim().toLowerCase();
  if (!value) return true;
  const haystack = [
    item.name,
    item.title,
    item.description,
    item.address,
    item.category,
    item.district,
    ...(item.metadata?.tags || []),
    ...(item.metadata?.searchKeywords || []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(value);
}

function sortResidentItems(items) {
  return [...items].sort((a, b) => {
    const liveDelta = Number(Boolean(b.isLive)) - Number(Boolean(a.isLive));
    if (liveDelta !== 0) return liveDelta;
    const walkDelta = (a.metadata?.walkMinutes ?? 999) - (b.metadata?.walkMinutes ?? 999);
    if (walkDelta !== 0) return walkDelta;
    return (b.metadata?.popularity ?? 0) - (a.metadata?.popularity ?? 0);
  });
}

function ResidentHeader({ user, activeTab }) {
  return (
    <div className="border-b border-[rgba(11,31,51,0.08)] bg-[rgba(247,249,252,0.95)] px-4 py-4 backdrop-blur md:px-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[rgba(11,31,51,0.48)]">
            Resident app
          </div>
          <h1 className="mt-1 text-[20px] font-semibold tracking-[-0.03em] text-foreground">
            Downtown, in one place
          </h1>
          <div className="mt-1 text-[12px] text-muted-foreground">
            {user.homeBuilding} · {user.district} · {TAB_CONFIG.find((tab) => tab.id === activeTab)?.label}
          </div>
        </div>

        <Link
          to="/resident-app/card"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-[14px] border border-[rgba(11,31,51,0.08)] bg-white px-4 text-sm font-medium text-foreground transition-colors hover:bg-[#fbfcff]"
        >
          <IconCard className="h-4 w-4" />
          Open card
        </Link>
      </div>
    </div>
  );
}

function ResidentTabBar({ activeTab }) {
  return (
    <div className="border-b border-[rgba(11,31,51,0.08)] bg-white px-2 py-2 md:px-4">
      <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto pb-1">
        {TAB_CONFIG.map((tab) => {
          const Icon = getResidentTabIcon(tab.id);
          const isActive = activeTab === tab.id;
          return (
            <Link
              key={tab.id}
              to={tab.path}
              className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium whitespace-nowrap transition-all ${
                isActive
                  ? "border-primary bg-primary text-white"
                  : "border-[rgba(11,31,51,0.08)] bg-white text-foreground/70 hover:bg-[#f7f9fc]"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function ResidentMapSurface({
  title,
  subtitle,
  items,
  activeChip,
  onChipChange,
  queryInput,
  onQueryInputChange,
  onRunQuery,
  onPrompt,
  resultsExpanded,
  onToggleResults,
  mapCenter,
  setMapCenter,
  mapZoom,
  setMapZoom,
}) {
  const selectedEntity = useMapStateStore((state) => state.selectedEntity);
  const selectEntity = useMapStateStore((state) => state.selectEntity);
  const setDrawerState = useMapStateStore((state) => state.setDrawerState);

  return (
    <div className="grid h-full grid-cols-1 lg:grid-cols-[380px_minmax(0,1fr)]">
      <div className="order-2 border-t border-[rgba(11,31,51,0.08)] bg-white lg:order-1 lg:border-t-0 lg:border-r">
        <div className="border-b border-[rgba(11,31,51,0.08)] px-4 py-4 md:px-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(11,31,51,0.48)]">
            Live downtown map
          </div>
          <h2 className="mt-1 text-[18px] font-semibold tracking-[-0.03em] text-foreground">{title}</h2>
          <p className="mt-1 text-[12px] leading-5 text-muted-foreground">{subtitle}</p>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              onRunQuery();
            }}
            className="mt-4 flex gap-2"
          >
            <div className="flex h-11 flex-1 items-center gap-3 rounded-[14px] border border-[rgba(11,31,51,0.08)] bg-[#f7f9fc] px-4">
              <IconSearch className="h-4 w-4 text-foreground/45" />
              <input
                value={queryInput}
                onChange={(event) => onQueryInputChange(event.target.value)}
                placeholder="Where do you want to go?"
                className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-foreground/42"
              />
            </div>
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-[14px] bg-primary px-4 text-sm font-medium text-white"
            >
              Explore
            </button>
          </form>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {FAST_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => onPrompt(prompt)}
                className="rounded-full border border-[rgba(11,31,51,0.08)] bg-[#f7f9fc] px-3 py-2 text-[11px] font-medium whitespace-nowrap text-foreground/78"
              >
                {prompt}
              </button>
            ))}
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {FILTER_CHIPS.map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={() => onChipChange(chip.id)}
                className={`rounded-full border px-3 py-2 text-[12px] font-medium whitespace-nowrap transition-all ${
                  activeChip === chip.id
                    ? "border-primary bg-primary text-white"
                    : "border-[rgba(11,31,51,0.08)] bg-white text-foreground/70 hover:bg-[#f7f9fc]"
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        <div className="px-4 py-3 md:px-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground/50">
                Nearby results
              </div>
              <div className="mt-1 text-[12px] text-muted-foreground">
                {FILTER_CHIPS.find((chip) => chip.id === activeChip)?.label || "All nearby"} · {items.length} results
              </div>
            </div>
            <button
              type="button"
              onClick={onToggleResults}
              className="inline-flex items-center gap-1 rounded-full border border-[rgba(11,31,51,0.08)] px-3 py-1.5 text-[11px] font-medium text-foreground"
            >
              {resultsExpanded ? "Hide results" : "Show results"}
              {resultsExpanded ? <IconChevronUp className="h-3.5 w-3.5" /> : <IconChevronDown className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        {resultsExpanded ? (
          <div className="h-[320px] border-t border-[rgba(11,31,51,0.08)] lg:h-[calc(100%-208px)]">
            <UnifiedResultsPanel
              items={items}
              title="Nearby now"
              onSelectResult={(item) => {
                selectEntity(item);
                setDrawerState("preview");
              }}
            />
          </div>
        ) : (
          <div className="px-4 pb-4 md:px-5">
            {selectedEntity ? (
              <div className="rounded-[18px] border border-[rgba(11,31,51,0.08)] bg-[#f7f9fc] p-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary/70">
                  Selected
                </div>
                <div className="mt-2 text-[15px] font-semibold text-foreground">{selectedEntity.name}</div>
                <div className="mt-1 text-[12px] leading-5 text-muted-foreground">
                  {selectedEntity.address || selectedEntity.description}
                </div>
              </div>
            ) : (
              <div className="rounded-[18px] border border-dashed border-[rgba(11,31,51,0.12)] bg-[#f7f9fc] p-4 text-[12px] text-muted-foreground">
                Select a pin to see details, save it, add it to plan, or open your card.
              </div>
            )}
          </div>
        )}
      </div>

      <div className="order-1 relative min-h-[420px] bg-[#eef2f7] lg:order-2 lg:min-h-0">
        <UnifiedMapShell
          items={items}
          selectedId={selectedEntity?.id}
          markerIcon={(item, isSelected) => createMarker(item, { isSelected })}
          onMarkerSelect={(item) => {
            selectEntity(item);
            setDrawerState("preview");
          }}
          mapCenter={mapCenter}
          mapZoom={mapZoom}
          onMapCenterChange={setMapCenter}
          onMapZoomChange={setMapZoom}
          className="h-full w-full"
        />
        <UnifiedDrawer selected={selectedEntity} />
      </div>
    </div>
  );
}

function ResidentNowTab({ items, onOpenMap, onSelectItem }) {
  const liveEvents = items.filter((item) => item.type === "event").slice(0, 5);
  const nearbyPerks = items.filter((item) => item.type === "perk" || item.perk_value).slice(0, 5);
  const topPicks = items.slice(0, 6);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-5 md:px-6">
      <div className="rounded-[24px] border border-[rgba(11,31,51,0.08)] bg-white p-5 shadow-[0_10px_24px_rgba(11,31,51,0.04)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(11,31,51,0.48)]">
              Nearby now
            </div>
            <h2 className="mt-2 text-[28px] font-semibold tracking-[-0.04em] text-foreground">
              Good choices in the next 5 to 30 minutes
            </h2>
            <p className="mt-2 max-w-2xl text-[13px] leading-6 text-muted-foreground">
              Open now, happening tonight, worth saving, and easy to reach from your building.
            </p>
          </div>
          <Link
            to="/resident-app/map"
            onClick={onOpenMap}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[14px] bg-primary px-4 text-sm font-medium text-white"
          >
            Open map
            <IconArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <ResidentRail
        eyebrow="Happening tonight"
        title="Live events and social moments"
        items={liveEvents}
        onSelectItem={onSelectItem}
      />

      <ResidentRail
        eyebrow="Resident-only unlocks"
        title="Perks worth using nearby"
        items={nearbyPerks}
        onSelectItem={onSelectItem}
      />

      <ResidentRail
        eyebrow="Best within 5 minutes"
        title="Fast local decisions"
        items={topPicks}
        onSelectItem={onSelectItem}
      />
    </div>
  );
}

function ResidentRail({ eyebrow, title, items, onSelectItem }) {
  return (
    <section>
      <div className="mb-4">
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(11,31,51,0.48)]">
          {eyebrow}
        </div>
        <h3 className="mt-2 text-[22px] font-semibold tracking-[-0.03em] text-foreground">{title}</h3>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {items.map((item) => (
          <ResidentEntityCard key={item.id} item={item} onClick={() => onSelectItem(item)} className="w-[84%] shrink-0 md:w-[340px]" />
        ))}
      </div>
    </section>
  );
}

function ResidentEntityCard({ item, onClick, className = "" }) {
  const EntityIcon = getEntityIcon(item);
  const entityLabel = getEntityLabel(item);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[20px] border border-[rgba(11,31,51,0.08)] bg-white p-4 text-left shadow-[0_8px_20px_rgba(11,31,51,0.04)] transition-all hover:-translate-y-[1px] ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(11,31,51,0.05)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-foreground/72">
          <EntityIcon className="h-3.5 w-3.5" />
          {entityLabel}
        </span>
        {item.metadata?.walkMinutes ? (
          <span className="text-[11px] font-medium text-[var(--dp-gold-muted)]">{item.metadata.walkMinutes} min</span>
        ) : null}
      </div>
      <div className="mt-3 text-[16px] font-semibold tracking-[-0.02em] text-foreground">{item.name}</div>
      <div className="mt-2 text-[12px] leading-5 text-muted-foreground">{item.perk_value || item.description || item.address}</div>
    </button>
  );
}

function ResidentSavedTab({ items, onSelectItem }) {
  const savedIds = useResidentStore((state) => state.history.saved);
  const savedSet = useMemo(() => new Set(savedIds), [savedIds]);
  const savedItems = items.filter((item) => savedSet.has(item.id));

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-5 md:px-6">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(11,31,51,0.48)]">
          Saved
        </div>
        <h2 className="mt-2 text-[28px] font-semibold tracking-[-0.04em] text-foreground">
          Save places, perks, and events to come back later
        </h2>
        <p className="mt-2 text-[13px] leading-6 text-muted-foreground">
          Keep nearby options worth remembering, then move them into your plan when the timing makes sense.
        </p>
      </div>

      {savedItems.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-[rgba(11,31,51,0.12)] bg-white p-8">
          <div className="text-lg font-semibold text-foreground">Nothing saved yet</div>
          <div className="mt-2 max-w-xl text-[13px] leading-6 text-muted-foreground">
            Save places, perks, and events from the map or the Now tab. They will show up here instantly.
          </div>
          <Link
            to="/resident-app/map"
            className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-[14px] bg-primary px-4 text-sm font-medium text-white"
          >
            Open map
            <IconArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {savedItems.map((item) => (
            <ResidentEntityCard key={item.id} item={item} onClick={() => onSelectItem(item)} />
          ))}
        </div>
      )}
    </div>
  );
}

function ResidentPlanTab({ items }) {
  const tonight = items.filter((item) => item.type === "event" || item.isLive).slice(0, 4);
  const later = items.filter((item) => item.type !== "event").slice(0, 4);

  const sections = [
    { label: "Tonight", items: tonight, description: "Things worth showing up for tonight." },
    { label: "Later this week", items: later, description: "Easy nearby options to keep in mind." },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-5 md:px-6">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(11,31,51,0.48)]">
          Plan
        </div>
        <h2 className="mt-2 text-[28px] font-semibold tracking-[-0.04em] text-foreground">
          Lightweight planning for tonight and later
        </h2>
        <p className="mt-2 text-[13px] leading-6 text-muted-foreground">
          Keep a short list of what fits after work, this weekend, or the next open window downtown.
        </p>
      </div>

      {sections.map((section) => (
        <section key={section.label}>
          <div className="mb-4">
            <div className="text-[18px] font-semibold tracking-[-0.02em] text-foreground">{section.label}</div>
            <div className="mt-1 text-[12px] text-muted-foreground">{section.description}</div>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {section.items.map((item) => (
              <div
                key={`${section.label}-${item.id}`}
                className="rounded-[20px] border border-[rgba(11,31,51,0.08)] bg-white p-4 shadow-[0_8px_20px_rgba(11,31,51,0.04)]"
              >
                {(() => {
                  const EntityIcon = getEntityIcon(item);
                  const entityLabel = getEntityLabel(item);
                  return (
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(11,31,51,0.05)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-foreground/72">
                    <EntityIcon className="h-3.5 w-3.5" />
                    {entityLabel}
                  </span>
                  {item.type === "event" ? <IconCalendarCheck className="h-4 w-4 text-primary" /> : <IconNavigation className="h-4 w-4 text-primary" />}
                </div>
                  );
                })()}
                <div className="mt-3 text-[15px] font-semibold text-foreground">{item.name}</div>
                <div className="mt-2 text-[12px] leading-5 text-muted-foreground">
                  {item.metadata?.time || item.eventTiming?.title || item.address || item.description}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function ResidentCardTab({ user, items }) {
  const nearbyPerks = items.filter((item) => item.type === "perk" || item.perk_value).slice(0, 3);
  const cardCode = `DP-${user.id.slice(0, 6).toUpperCase()}-ATX`;
  const qrValue = JSON.stringify({
    type: "downtown_perks_member_card",
    memberId: cardCode,
    name: user.full_name,
    status: "active",
    source: "resident_app",
  });
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${encodeURIComponent(qrValue)}`;

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-5 md:px-6">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(11,31,51,0.48)]">
          Card
        </div>
        <h2 className="mt-2 text-[28px] font-semibold tracking-[-0.04em] text-foreground">Your Perks Card</h2>
        <p className="mt-2 text-[13px] leading-6 text-muted-foreground">
          Discovery stays open. The card becomes important when you are ready to unlock something nearby.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
        <div className="rounded-[28px] border border-[rgba(11,31,51,0.08)] bg-white p-6 shadow-[0_18px_48px_rgba(11,31,51,0.07)]">
          <div className="mx-auto w-fit rounded-[24px] bg-[#f7f9fc] p-4 shadow-[0_12px_32px_rgba(11,31,51,0.08)]">
            <img src={qrUrl} alt="Downtown Perks resident QR code" className="h-52 w-52 rounded-[16px]" />
          </div>
          <div className="mt-5 text-center">
            <div className="text-lg font-semibold tracking-[-0.03em] text-foreground">{user.full_name}</div>
            <div className="mt-1 text-sm text-muted-foreground">Active downtown member</div>
            <div className="mt-4 rounded-[14px] border border-[rgba(11,31,51,0.08)] bg-[#f7f9fc] px-4 py-3 text-sm font-medium text-foreground">
              {cardCode}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[24px] border border-[rgba(11,31,51,0.08)] bg-white p-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(11,31,51,0.48)]">
              How it works
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              {[
                "Find a participating venue or perk nearby.",
                "Open your card when intent is real.",
                "Show the QR and let the venue scan it.",
              ].map((step) => (
                <div key={step} className="rounded-[16px] bg-[#f7f9fc] px-4 py-4 text-[13px] leading-6 text-muted-foreground">
                  {step}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-[rgba(11,31,51,0.08)] bg-white p-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(11,31,51,0.48)]">
              Nearby unlocks
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              {nearbyPerks.map((item) => (
                <div key={item.id} className="rounded-[16px] bg-[#f7f9fc] px-4 py-4">
                  <div className="text-[14px] font-semibold text-foreground">{item.name}</div>
                  <div className="mt-1 text-[11px] text-[var(--dp-gold-muted)]">{item.perk_value || "Member perk"}</div>
                  <div className="mt-2 text-[12px] leading-5 text-muted-foreground">{item.address}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResidentYouTab({ user, items }) {
  const savedIds = useResidentStore((state) => state.history.saved);
  const redeemedIds = useResidentStore((state) => state.history.redeemed);
  const savedCount = savedIds.length;
  const redeemedCount = redeemedIds.length;
  const eventCount = items.filter((item) => item.type === "event").length;

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-5 md:px-6">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(11,31,51,0.48)]">
          You
        </div>
        <h2 className="mt-2 text-[28px] font-semibold tracking-[-0.04em] text-foreground">Your downtown profile</h2>
        <p className="mt-2 text-[13px] leading-6 text-muted-foreground">
          Home building, preferences, recent behavior, support, and the settings that shape your resident experience.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <div className="rounded-[24px] border border-[rgba(11,31,51,0.08)] bg-white p-5">
          <div className="text-lg font-semibold text-foreground">{user.full_name}</div>
          <div className="mt-1 text-sm text-muted-foreground">{user.email}</div>
          <div className="mt-4 rounded-[16px] bg-[#f7f9fc] p-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgba(11,31,51,0.48)]">
              Home building
            </div>
            <div className="mt-2 text-[15px] font-semibold text-foreground">{user.homeBuilding}</div>
            <div className="mt-1 text-[12px] text-muted-foreground">{user.district}</div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            {[
              { label: "Saved", value: savedCount, icon: IconBookmark },
              { label: "Redeemed", value: redeemedCount, icon: IconPerk },
              { label: "Live events nearby", value: eventCount, icon: IconCalendarCheck },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-[20px] border border-[rgba(11,31,51,0.08)] bg-white p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">{item.label}</div>
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="mt-3 text-[1.9rem] font-semibold tracking-[-0.04em] text-foreground">{item.value}</div>
                </div>
              );
            })}
          </div>

          <div className="rounded-[24px] border border-[rgba(11,31,51,0.08)] bg-white p-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(11,31,51,0.48)]">
              Preferences
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {["Coffee", "Dining", "Rooftops", "Live music", "Wellness"].map((item) => (
                <span key={item} className="rounded-full border border-[rgba(11,31,51,0.08)] bg-[#f7f9fc] px-3 py-2 text-[12px] font-medium text-foreground/76">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-[rgba(11,31,51,0.08)] bg-white p-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(11,31,51,0.48)]">
              Support and settings
            </div>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              {[
                { label: "Notification settings", icon: IconSettings },
                { label: "About Downtown Perks", icon: IconInfo },
                { label: "Help and support", icon: IconBookmark },
                { label: "Reset resident access", icon: IconCard },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="rounded-[16px] bg-[#f7f9fc] px-4 py-4 text-[13px] font-medium text-foreground">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-primary" />
                      {item.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResidentApp() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user] = useState(GUEST_RESIDENT);
  const [activeChip, setActiveChip] = useState("all");
  const [queryInput, setQueryInput] = useState("");
  const [query, setQuery] = useState("");
  const [resultsExpanded, setResultsExpanded] = useState(true);
  const [mapCenter, setMapCenter] = useState([30.267, -97.743]);
  const [mapZoom, setMapZoom] = useState(14);

  const activeTab = getActiveTab(location.pathname, location.search);
  const mutations = useResidentMutations(user.id);
  const selectEntity = useMapStateStore((state) => state.selectEntity);
  const setSaved = useMapStateStore((state) => state.setSaved);
  const savedIds = useResidentStore((state) => state.history.saved);

  useEffect(() => {
    setSaved(savedIds);
  }, [savedIds, setSaved]);

  const { items } = useSharedMapFeed({
    query,
    activeCategory:
      activeChip === "venue" || activeChip === "event" || activeChip === "perk"
        ? activeChip
        : "all",
    limit: 120,
  });

  const residentItems = useMemo(() => sortResidentItems(items), [items]);
  const filteredItems = useMemo(() => {
    const savedSet = new Set(savedIds);
    return residentItems.filter((item) => matchesResidentFilter(item, activeChip, savedSet) && matchesQuery(item, query));
  }, [activeChip, query, residentItems, savedIds]);

  const handleSelectItem = async (item) => {
    selectEntity(item);
    await mutations.logInteraction(item, "open", query, { surface: activeTab });
    navigate("/resident-app/map");
  };

  const sharedMapProps = {
    title: activeTab === "map" ? "Live map of what is nearby" : "Downtown map",
    subtitle: "Decide faster with walk time, nearby perks, events, and places worth opening now.",
    items: filteredItems,
    activeChip,
    onChipChange: setActiveChip,
    queryInput,
    onQueryInputChange: setQueryInput,
    onRunQuery: () => setQuery(queryInput.trim()),
    onPrompt: (prompt) => {
      setQueryInput(prompt);
      setQuery(prompt);
    },
    resultsExpanded,
    onToggleResults: () => setResultsExpanded((current) => !current),
    mapCenter,
    setMapCenter,
    mapZoom,
    setMapZoom,
  };

  return (
    <div className="min-h-screen bg-[#f7f9fc] pt-[68px] text-[var(--dp-navy,#0B1A2B)]">
      <ResidentHeader user={user} activeTab={activeTab} />
      <ResidentTabBar activeTab={activeTab} />

      <main className="min-h-[calc(100vh-152px)]">
        {activeTab === "now" ? (
          <ResidentNowTab items={filteredItems} onOpenMap={() => setQuery(queryInput.trim())} onSelectItem={handleSelectItem} />
        ) : null}
        {activeTab === "map" ? <ResidentMapSurface {...sharedMapProps} /> : null}
        {activeTab === "saved" ? <ResidentSavedTab items={residentItems} onSelectItem={handleSelectItem} /> : null}
        {activeTab === "plan" ? <ResidentPlanTab items={residentItems} /> : null}
        {activeTab === "card" ? <ResidentCardTab user={user} items={residentItems} /> : null}
        {activeTab === "you" ? <ResidentYouTab user={user} items={residentItems} /> : null}
      </main>
    </div>
  );
}
