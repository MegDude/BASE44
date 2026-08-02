import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Download, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { downloadWorkspaceReport, getWorkspaceReport } from "@/services/platform/reportClient";
import { withPartnerWorkspaceScope } from "@/lib/partnerWorkspaceContext";

const METRICS = [
  ["views", "Views"],
  ["mapActions", "Map actions"],
  ["offerOpens", "Offer opens"],
  ["saves", "Saves"],
  ["redemptions", "Redemptions"],
  ["conversions", "Conversions"],
];

function dateValue(date) {
  return date.toISOString().slice(0, 10);
}

function defaultRange() {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - 29);
  return { startDate: dateValue(start), endDate: dateValue(end) };
}

function displayNumber(value) {
  return Number(value || 0).toLocaleString();
}

function metricChange(metric) {
  const value = Number(metric?.change || metric?.delta || 0);
  if (!Number.isFinite(value) || !value) return "No change from the previous period";
  return `${value > 0 ? "Up" : "Down"} ${Math.abs(value).toLocaleString()} from the previous period`;
}

function sourceRows(report) {
  return Array.isArray(report?.actions) ? report.actions : [];
}

export function WorkspaceReportsSurface({ scope }) {
  const initialRange = useMemo(defaultRange, []);
  const [draft, setDraft] = useState(() => ({ ...initialRange, compareTo: "previous_period" }));
  const [applied, setApplied] = useState(() => ({ ...initialRange, compareTo: "previous_period" }));
  const [state, setState] = useState({ status: "loading", report: null, error: "" });
  const [exporting, setExporting] = useState(false);
  const retryRef = useRef(0);

  const reportScope = useMemo(() => ({
    organizationId: scope?.organizationId,
    portfolioId: scope?.portfolioId,
    listingId: scope?.listingId,
    ...applied,
  }), [scope?.organizationId, scope?.portfolioId, scope?.listingId, applied]);

  const reportScopeKey = useMemo(() => JSON.stringify(reportScope), [reportScope]);

  useEffect(() => {
    if (!reportScope.organizationId) {
      setState({ status: "unavailable", report: null, error: "" });
      return undefined;
    }
    const controller = new AbortController();
    setState((current) => ({ status: "loading", report: current.report, error: "" }));
    getWorkspaceReport(JSON.parse(reportScopeKey), controller.signal)
      .then((report) => setState({ status: "ready", report, error: "" }))
      .catch((error) => {
        if (error?.name === "AbortError") return;
        setState({ status: error?.status === 403 ? "unavailable" : "error", report: null, error: error?.message || "Reports are unavailable right now." });
      });
    return () => controller.abort();
  }, [reportScopeKey, retryRef.current]);

  const report = state.report;
  const summary = report?.summary || {};
  const hasActivity = METRICS.some(([key]) => Number(summary[key] || 0) > 0);
  const destination = (path) => withPartnerWorkspaceScope(path, scope || {});

  function applyRange(event) {
    event.preventDefault();
    setApplied({ ...draft });
  }

  async function exportCsv() {
    try {
      setExporting(true);
      const blob = await downloadWorkspaceReport(reportScope);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "downtown-perks-report.csv";
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  if (state.status === "unavailable") {
    return <section className="dp-reports-state"><p>Reports</p><h1>Reports are not connected for this workspace yet.</h1><span>Choose an authorized organization or connect its reporting source before reviewing results.</span><Link to={destination("/partner-workspace/sources")}>Review sources <ArrowRight aria-hidden="true" /></Link></section>;
  }

  return <section className="dp-reports-surface" aria-busy={state.status === "loading"}>
    <header className="dp-reports-header">
      <div><p>Reports</p><h1>See what people did and what to do next.</h1><span>{report?.scope?.organization?.name || "Loading workspace results"}</span></div>
      <div className="dp-reports-actions">
        <button type="button" onClick={() => { retryRef.current += 1; setApplied({ ...applied }); }} disabled={state.status === "loading"}><RefreshCw aria-hidden="true" /> Refresh</button>
        <button type="button" onClick={exportCsv} disabled={!report || exporting}><Download aria-hidden="true" /> {exporting ? "Preparing…" : "Export CSV"}</button>
      </div>
    </header>

    <form className="dp-reports-range" onSubmit={applyRange}>
      <label>From<input type="date" value={draft.startDate} onChange={(event) => setDraft((current) => ({ ...current, startDate: event.target.value }))} /></label>
      <label>To<input type="date" value={draft.endDate} min={draft.startDate} onChange={(event) => setDraft((current) => ({ ...current, endDate: event.target.value }))} /></label>
      <button type="submit">Apply range</button>
      {report?.updatedAt ? <span>Updated {new Date(report.updatedAt).toLocaleString()}</span> : null}
    </form>

    {state.status === "error" ? <section className="dp-reports-state"><p>Reports unavailable</p><h2>We could not load this report.</h2><span>{state.error}</span><button type="button" onClick={() => { retryRef.current += 1; setApplied({ ...applied }); }}>Try again <ArrowRight aria-hidden="true" /></button></section> : null}

    {state.status === "loading" && !report ? <section className="dp-reports-skeleton" aria-live="polite"><i /><i /><i /><i /><i /><i /></section> : null}

    {state.status === "ready" && !hasActivity ? <section className="dp-reports-state"><p>No activity yet</p><h2>No activity has been recorded for this selection yet.</h2><span>Publish an offer, event, or map listing to start collecting verified results.</span><div><Link to={destination("/partner-workspace/map")}>Open map <ArrowRight aria-hidden="true" /></Link><Link to={destination("/partner-workspace/offers")}>Create offer <ArrowRight aria-hidden="true" /></Link></div></section> : null}

    {state.status === "ready" && hasActivity ? <div className="dp-reports-content">
      <section className="dp-reports-metrics" aria-label="Performance summary">
        {METRICS.map(([key, label]) => <article key={key}><span>{label}</span><strong>{displayNumber(summary[key])}</strong><small>{metricChange(summary[key])}</small></article>)}
      </section>

      <section className="dp-reports-panel">
        <header><p>What people did</p><h2>Actions in this period</h2></header>
        {sourceRows(report).length ? <ol className="dp-reports-rows">{sourceRows(report).map((row) => <li key={row.id || row.name}><span>{row.name || row.label || "Activity"}</span><strong>{displayNumber(row.count || row.value)}</strong><small>{row.conversionRate != null ? `${Math.round(Number(row.conversionRate) * 100)}% conversion` : "Verified activity"}</small></li>)}</ol> : <p className="dp-reports-muted">Action detail is not available for this period.</p>}
      </section>

      <section className="dp-reports-panel">
        <header><p>Top places and content</p><h2>What drew attention</h2></header>
        {Array.isArray(report?.content) && report.content.length ? <ol className="dp-reports-rows">{report.content.map((item) => <li key={item.id || item.name}><span>{item.name || item.title}</span><strong>{displayNumber(item.views || item.count)}</strong><small>{item.type || "Connected content"}</small></li>)}</ol> : <p className="dp-reports-muted">No item-level results are available yet.</p>}
      </section>
    </div> : null}
  </section>;
}
