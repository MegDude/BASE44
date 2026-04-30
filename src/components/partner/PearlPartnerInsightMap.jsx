import { useMemo, useState } from "react";
import UnifiedMapShell from "@/components/map/unified/UnifiedMapShell";
import { createMarker } from "@/components/map/markers/MarkerFactory";
import { usePartnerInsights } from "@/lib/map/partnerInsights";

function Icon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3.5l1.7 4.5 4.6 1.7-4.6 1.7L12 16l-1.7-4.6-4.6-1.7 4.6-1.7L12 3.5ZM5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const typeMap = { venue: "venue", building: "building", hotel: "hotel", district: "civic", campaign: "brand", zone: "moment", event: "event" };
const prompts = ["What is driving action right now", "Which places are converting best tonight", "What should we change next"];
const views = ["all", "demand", "events", "offers", "sources"];
const layers = ["all", "venue", "building", "event", "campaign"];

function n(value, suffix = "") {
  return `${Number(value || 0).toLocaleString()}${suffix}`;
}

function score(item, query) {
  const q = String(query || "").trim().toLowerCase();
  if (!q) return 1;
  const text = [item?.title, item?.summary, item?.shortInsight, item?.district, item?.entityType, item?.insightType, item?.recommendedAction, ...(item?.tags || [])]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return q.split(/\s+/).reduce((total, token) => total + (text.includes(token) ? 1 : 0), text.includes(q) ? 8 : 0);
}

function toMarker(item) {
  return { ...item, type: typeMap[item?.entityType] || "venue", markerType: typeMap[item?.entityType] || "venue", name: item?.title, description: item?.summary };
}

export default function PearlPartnerInsightMap({ partnerType = "dashboard", title, description }) {
  const { items = [], summary = {}, activityFeed = [], loading, hasLiveData } = usePartnerInsights(partnerType);
  const [queryInput, setQueryInput] = useState("");
  const [query, setQuery] = useState("");
  const [view, setView] = useState("all");
  const [layer, setLayer] = useState("all");
  const [selectedId, setSelectedId] = useState(null);
  const [tab, setTab] = useState("answer");
  const [mapCenter, setMapCenter] = useState([30.267, -97.743]);
  const [mapZoom, setMapZoom] = useState(14);

  const filtered = useMemo(() => {
    return [...items]
      .filter((item) => {
        if (view === "all") return true;
        if (view === "demand") return ["engagement", "performance"].includes(item.insightType);
        if (view === "events") return item.entityType === "event" || item.insightType === "campaign" || (item.relatedEvents || []).length;
        if (view === "offers") return item.insightType === "performance" || item.insightType === "opportunity" || Number(item.metrics?.activePerks || 0) > 0;
        if (view === "sources") return (item.sourceBreakdown || []).length > 0;
        return true;
      })
      .filter((item) => (layer === "all" ? true : item.entityType === layer || typeMap[item.entityType] === layer))
      .filter((item) => score(item, query) > 0)
      .sort((a, b) => Number(b.metrics?.visits || 0) - Number(a.metrics?.visits || 0));
  }, [items, layer, query, view]);

  const active = filtered.find((item) => item.id === selectedId) || filtered[0] || null;
  const markers = filtered.map(toMarker);
  const metrics = [
    ["Scans", n(summary.impressions), "Captured visibility"],
    ["Action rate", n(summary.conversionRate, "%"), "Intent to action"],
    ["Redemptions", n(summary.redemptions), "Proof of use"],
    ["Live offers / events", `${n(summary.activePerks)} / ${n(summary.activeEvents)}`, "Active inventory"],
  ];
  const proof = [
    ["Scans", n(active?.metrics?.impressions)],
    ["Visits", n(active?.metrics?.visits)],
    ["Redemptions", n(active?.metrics?.redemptions)],
    ["Repeat", n(active?.metrics?.repeatRate, "%")],
  ];

  return (
    <section className="pearl-page px-4 py-6 md:px-6">
      <div className="dp-page-shell">
        <div className="mb-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_460px] lg:items-end">
          <div>
            <div className="dp-page-kicker inline-flex items-center gap-2"><Icon className="h-3.5 w-3.5 text-[var(--dp-gold)]" />Partner intelligence</div>
            <h2 className="dp-display-section mt-3 text-[clamp(2rem,4vw,3.6rem)]">{title}</h2>
            <p className="dp-page-intro mt-3">{description}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
            {metrics.map(([label, value, note]) => (
              <div key={label} className="pearl-surface rounded-2xl p-4">
                <div className="dp-micro-label">{label}</div>
                <div className="mt-2 text-[1.25rem] font-semibold tracking-[-0.04em] text-[var(--dp-navy)]">{value}</div>
                <div className="mt-1 text-[11px] leading-5 text-[rgba(20,32,51,0.62)]">{note}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="pearl-surface overflow-hidden rounded-[28px]">
          <div className="grid lg:grid-cols-[350px_minmax(0,1fr)_370px]">
            <aside className="border-b border-[var(--dp-border)] p-4 lg:border-b-0 lg:border-r">
              <div className="dp-micro-label">Ask the map</div>
              <form className="mt-3 flex gap-2" onSubmit={(event) => { event.preventDefault(); setQuery(queryInput.trim()); }}>
                <input value={queryInput} onChange={(event) => setQueryInput(event.target.value)} placeholder="Ask what to change next" className="pearl-glass h-11 min-w-0 flex-1 rounded-xl px-3 text-sm text-[var(--dp-navy)] outline-none" />
                <button className="dp-cta-primary h-11 min-h-0 px-4 text-sm normal-case tracking-normal" type="submit">Ask</button>
              </form>
              <div className="mt-3 grid gap-2">
                {prompts.map((prompt) => <button key={prompt} type="button" className="dp-chip justify-start text-left text-[11px]" onClick={() => { setQueryInput(prompt); setQuery(prompt); }}>{prompt}</button>)}
              </div>
              <div className="mt-5 grid gap-4">
                <div><div className="dp-micro-label mb-2">View</div><div className="flex flex-wrap gap-2">{views.map((item) => <button key={item} type="button" className={`dp-chip text-[11px] capitalize ${view === item ? "dp-chip-active" : ""}`} onClick={() => setView(item)}>{item}</button>)}</div></div>
                <div><div className="dp-micro-label mb-2">Layers</div><div className="flex flex-wrap gap-2">{layers.map((item) => <button key={item} type="button" className={`dp-chip text-[11px] capitalize ${layer === item ? "dp-chip-active" : ""}`} onClick={() => setLayer(item)}>{item}</button>)}</div></div>
              </div>
            </aside>

            <div className="h-[520px] bg-[#eef2f7] lg:h-[720px]">
              <UnifiedMapShell items={markers} selectedId={active?.id} markerIcon={(entity, isSelected) => createMarker(entity, { isSelected })} onMarkerSelect={(entity) => setSelectedId(entity.id)} mapCenter={mapCenter} mapZoom={mapZoom} onMapCenterChange={setMapCenter} onMapZoomChange={setMapZoom} className="h-full w-full" />
            </div>

            <aside className="border-t border-[var(--dp-border)] p-4 lg:border-l lg:border-t-0">
              <div className="flex items-start justify-between gap-4"><div><div className="dp-micro-label">Answer</div><div className="mt-1 text-[12px] text-[rgba(20,32,51,0.62)]">{loading ? "Updating" : `${filtered.length} answers`} · {hasLiveData ? "Live" : "Preview"}</div></div><Icon className="h-5 w-5 text-[var(--dp-gold)]" /></div>
              {active ? <div className="mt-4"><div className="inline-flex rounded-xl bg-[var(--dp-gold-soft)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--dp-gold-muted)]">{n(active.metrics?.redemptions)} redemptions · {n(active.metrics?.visits)} visits</div><h3 className="mt-3 text-[1.35rem] font-semibold leading-tight tracking-[-0.035em] text-[var(--dp-navy)]">{active.title} is the clearest answer right now.</h3><p className="mt-3 text-[13px] leading-6 text-[rgba(20,32,51,0.68)]">{active.shortInsight || active.summary || "This is the strongest current signal based on nearby activity, response, and walkable pull."}</p><div className="mt-4 flex gap-2">{["answer", "proof", "sources"].map((item) => <button key={item} type="button" className={`dp-chip text-[11px] capitalize ${tab === item ? "dp-chip-active" : ""}`} onClick={() => setTab(item)}>{item}</button>)}</div>{tab === "answer" ? <div className="mt-4 pearl-surface rounded-2xl p-4"><div className="dp-micro-label">Recommended move</div><p className="mt-2 text-[13px] leading-6 text-[rgba(20,32,51,0.7)]">{active.recommendedAction || "Keep this visible, refresh the offer if activity slows, and use this corridor to test the next partner placement."}</p></div> : null}{tab === "proof" ? <div className="mt-4 grid grid-cols-2 gap-3">{proof.map(([label, value]) => <div key={label} className="pearl-surface rounded-2xl p-4"><div className="dp-micro-label">{label}</div><div className="mt-2 text-[1.15rem] font-semibold text-[var(--dp-navy)]">{value}</div></div>)}</div> : null}{tab === "sources" ? <div className="mt-4 space-y-2">{(active.sourceBreakdown || []).slice(0, 4).map((source) => <div key={source.label} className="pearl-surface flex items-center justify-between gap-3 rounded-2xl px-4 py-3"><span className="text-[12px] font-medium text-[var(--dp-navy)]">{source.label}</span><span className="text-[12px] text-[rgba(20,32,51,0.62)]">{source.value}</span></div>)}{!active.sourceBreakdown?.length ? <div className="rounded-2xl border border-dashed border-[var(--dp-border)] p-4 text-[12px] text-[rgba(20,32,51,0.62)]">No source breakdown is attached to this signal yet.</div> : null}</div> : null}</div> : <div className="mt-4 rounded-2xl border border-dashed border-[var(--dp-border)] p-4 text-[13px] text-[rgba(20,32,51,0.62)]">Ask another question or clear filters to bring answers back.</div>}
              <div className="mt-5"><div className="dp-micro-label mb-2">Now</div><div className="space-y-2">{(activityFeed || filtered).slice(0, 4).map((item) => <button key={item.id || item.title || item.label} type="button" className="pearl-glass w-full rounded-2xl px-4 py-3 text-left" onClick={() => setSelectedId(item.id)}><div className="text-[12px] font-semibold text-[var(--dp-navy)]">{item.title || item.label}</div><div className="mt-1 text-[11px] text-[rgba(20,32,51,0.58)]">{item.shortInsight || item.summary || item.value}</div></button>)}</div></div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
