import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Download, MapPin } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ANALYTICS_RANGES,
  ANALYTICS_VIEWS,
  loadWorkspaceAnalytics,
} from "@/lib/analytics/workspaceAnalytics";

const EMPTY_ANALYTICS = {
  status: "loading", statusMessage: "Loading workspace activity…", eventCount: 0,
  scorecard: [], trend: [], funnel: [], places: [], sources: [], geography: [],
  campaigns: [], offers: [], partnerEvents: [], recommendation: null,
};

const RANGE_LABELS = { "7d": "Last 7 days", "30d": "Last 30 days", "60d": "Last 60 days", "90d": "Last 90 days", ytd: "Year to date" };
const COMPARISON_LABELS = { previous_period: "Previous period", previous_year: "Previous year", none: "No comparison" };
const METRIC_LABELS = { opens: "Experience Opens", qr_activity: "QR Activity", views: "Listing Views", saves: "Saves", directions: "Directions", visits: "Verified Visits", redemptions: "Redemptions", rsvps: "Event RSVPs", repeat: "Repeat Engagement" };

export default function PartnerAnalyticsPage({ workspace, entities = [] }) {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const requestedView = params.get("view") || "overview";
  const view = ANALYTICS_VIEWS.some(([id]) => id === requestedView) ? requestedView : "overview";
  const requestedRange = params.get("range") || "30d";
  const range = Object.hasOwn(ANALYTICS_RANGES, requestedRange) ? requestedRange : "30d";
  const requestedComparison = params.get("comparison") || "previous_period";
  const comparison = Object.hasOwn(COMPARISON_LABELS, requestedComparison) ? requestedComparison : "previous_period";
  const [analytics, setAnalytics] = useState(EMPTY_ANALYTICS);
  const [metric, setMetric] = useState("views");

  const filters = useMemo(() => ({
    entity: params.get("entity"), campaign: params.get("campaign"), offer: params.get("offer"),
    partnerEvent: params.get("event"), source: params.get("source"), district: params.get("district"),
  }), [params]);

  useEffect(() => {
    let active = true;
    setAnalytics(EMPTY_ANALYTICS);
    loadWorkspaceAnalytics({ workspace, entities, range, filters }).then((result) => {
      if (active) setAnalytics(result);
    });
    return () => { active = false; };
  }, [entities, filters, range, workspace]);

  function updateQuery(updates) {
    const next = new URLSearchParams(location.search);
    next.set("workspace", workspace.id);
    Object.entries(updates).forEach(([key, value]) => value ? next.set(key, value) : next.delete(key));
    navigate(`${location.pathname}?${next.toString()}`);
  }

  function exportCsv() {
    const rows = [
      ["Workspace", workspace.name], ["Range", RANGE_LABELS[range]], ["Status", analytics.status],
      ...analytics.scorecard.map((item) => [METRIC_LABELS[item.id] || item.id, item.value]),
    ];
    const csv = rows.map((row) => row.map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${workspace.id}-${view}-${range}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="dp-analytics-page" aria-labelledby="partner-analytics-title">
      <header className="dp-analytics-header">
        <div>
          <p className="dp-analytics-eyebrow">{workspace.name}</p>
          <h1 id="partner-analytics-title">Analytics</h1>
          <p>Understand what people discover, save, visit, and act on.</p>
        </div>
        <div className="dp-analytics-header-actions">
          <button type="button" onClick={exportCsv} disabled={analytics.status === "loading"}><Download aria-hidden="true" />Export CSV</button>
          <Link to={`/app/workspace/reports?workspace=${encodeURIComponent(workspace.id)}&period=${range}`}>Create report <ArrowRight aria-hidden="true" /></Link>
        </div>
      </header>

      <div className="dp-analytics-controls" aria-label="Analytics controls">
        <label><span>Date range</span><select value={range} onChange={(event) => updateQuery({ range: event.target.value })}>{Object.entries(RANGE_LABELS).map(([id, label]) => <option value={id} key={id}>{label}</option>)}</select></label>
        <label><span>Comparison</span><select value={comparison} onChange={(event) => updateQuery({ comparison: event.target.value })}>{Object.entries(COMPARISON_LABELS).map(([id, label]) => <option value={id} key={id}>{label}</option>)}</select></label>
        <div className={`dp-analytics-data-status is-${analytics.status}`} role="status"><i aria-hidden="true" /><span>{analytics.statusMessage}</span></div>
      </div>

      <nav className="dp-analytics-view-nav" aria-label="Analytics views">
        {ANALYTICS_VIEWS.map(([id, label]) => <button type="button" key={id} aria-current={view === id ? "page" : undefined} onClick={() => updateQuery({ view: id })}>{label}</button>)}
      </nav>

      {workspace.is_demo ? <p className="dp-analytics-demo-note">Demo workspace · fixture data is isolated from production analytics.</p> : null}
      {comparison !== "none" && analytics.status !== "loading" ? <p className="dp-analytics-limitation">Comparison values appear only after a complete comparison period is available. Current totals are not presented as comparative change.</p> : null}

      {analytics.status === "loading" ? <div className="dp-analytics-loading" role="status"><i aria-hidden="true" /><strong>Loading analytics</strong><span>Checking workspace-scoped records for this period.</span></div> : null}
      {analytics.status !== "loading" && view === "overview" && <AnalyticsOverview analytics={analytics} metric={metric} setMetric={setMetric} range={range} updateQuery={updateQuery} />}
      {analytics.status !== "loading" && view === "audience" && <AudienceView analytics={analytics} />}
      {analytics.status !== "loading" && view === "places" && <PlacesView analytics={analytics} range={range} updateQuery={updateQuery} />}
      {analytics.status !== "loading" && view === "campaigns" && <CampaignsView analytics={analytics} />}
      {analytics.status !== "loading" && view === "activity" && <ActivityView analytics={analytics} />}
      {analytics.status !== "loading" && view === "sources" && <SourcesView analytics={analytics} />}
      {analytics.status !== "loading" && view === "geography" && <GeographyView analytics={analytics} updateQuery={updateQuery} />}
      {analytics.status !== "loading" && view === "reports" && <ReportsView workspaceId={workspace.id} range={range} />}
    </section>
  );
}

function AnalyticsOverview({ analytics, metric, setMetric, range, updateQuery }) {
  const values = Object.fromEntries(analytics.scorecard.map((item) => [item.id, item.value]));
  const topPlace = analytics.places[0];
  const strongestSource = analytics.sources[0];
  const strongestDistrict = analytics.geography[0];
  return (
    <div className="dp-analytics-overview">
      <section className="dp-analytics-decision-summary" aria-labelledby="decision-summary-title">
        <p className="dp-analytics-eyebrow">Decision summary</p>
        <h2 id="decision-summary-title">What the current records support.</h2>
        <dl>
          <div><dt>Measured finding</dt><dd>{analytics.eventCount ? `${analytics.eventCount.toLocaleString()} workspace-scoped events were recorded for this period.` : analytics.statusMessage}</dd></div>
          <div><dt>Interpreted insight</dt><dd>{topPlace ? `${topPlace.entity?.display_name || "The leading place"} generated the most recorded actions.` : "There is not enough place activity for a reliable ranking yet."}</dd></div>
          <div><dt>Recommendation</dt><dd>{analytics.recommendation?.action || "Complete tracking setup"}</dd></div>
        </dl>
      </section>

      <section aria-labelledby="scorecard-title">
        <SectionHeading eyebrow="Scorecard" title="Performance at a glance." id="scorecard-title" />
        <div className="dp-analytics-scorecard">
          {analytics.scorecard.map((item) => <button type="button" key={item.id} onClick={() => updateQuery({ view: metricView(item.id), range })} title={item.definition}><strong>{Number(item.value).toLocaleString()}</strong><span>{METRIC_LABELS[item.id] || item.id}</span><small>{analytics.status === "empty" ? "No recorded data" : "Current period"}</small></button>)}
        </div>
      </section>

      <section className="dp-analytics-trend" aria-labelledby="trend-title">
        <div className="dp-analytics-section-heading-row"><SectionHeading eyebrow="Trend" title="Performance over time." id="trend-title" /><label><span>Metric</span><select value={metric} onChange={(event) => setMetric(event.target.value)}>{analytics.scorecard.map((item) => <option value={item.id} key={item.id}>{METRIC_LABELS[item.id] || item.id}</option>)}</select></label></div>
        <TrendReadout rows={analytics.trend} metric={metric} />
      </section>

      <section className="dp-analytics-funnel" aria-labelledby="funnel-title">
        <SectionHeading eyebrow="Funnel" title="Where people keep going—and where they stop." id="funnel-title" />
        <ol>{analytics.funnel.map((stage) => <li key={stage.label}><div><strong>{stage.label}</strong><span>{stage.value.toLocaleString()}</span></div><i><b style={{ width: `${funnelWidth(stage.value, analytics.funnel[0]?.value)}%` }} /></i><small>{stage.conversion === null ? "Conversion unavailable" : `${stage.conversion}% from previous stage`}</small></li>)}</ol>
      </section>

      <div className="dp-analytics-split">
        <section><SectionHeading eyebrow="Places" title="Top places." /><RankedPlaces rows={analytics.places.slice(0, 5)} /><button type="button" onClick={() => updateQuery({ view: "places" })}>Open Places analysis</button></section>
        <section><SectionHeading eyebrow="Sources" title="How people entered." /><SimpleRows rows={analytics.sources.slice(0, 5).map((row) => [row.label, row.actions, row.conversion === null ? "Conversion unavailable" : `${row.conversion}% actions per entry`])} empty="No source identifiers were recorded." /><button type="button" onClick={() => updateQuery({ view: "sources" })}>Open Sources analysis</button></section>
      </div>

      <section className="dp-analytics-geography-summary"><SectionHeading eyebrow="Geography" title="Strongest recorded areas." /><SimpleRows rows={analytics.geography.slice(0, 5).map((row) => [row.district, row.actions, "Recorded actions"])} empty="No canonical district identifiers were recorded." />{strongestDistrict ? <Link to={`/map?mode=partner&district=${encodeURIComponent(strongestDistrict.district)}`}><MapPin aria-hidden="true" />View {strongestDistrict.district} on map</Link> : null}</section>

      <section className="dp-analytics-recommendation" aria-labelledby="recommendation-title"><p className="dp-analytics-eyebrow">Recommended next action</p><h2 id="recommendation-title">{analytics.recommendation?.action}</h2><dl><div><dt>Evidence</dt><dd>{analytics.recommendation?.evidence}</dd></div><div><dt>Expected outcome</dt><dd>{analytics.recommendation?.outcome}</dd></div><div><dt>Confidence</dt><dd>{analytics.recommendation?.confidence}</dd></div></dl>{strongestSource ? <p>Strongest recorded source: {strongestSource.label}.</p> : null}</section>
    </div>
  );
}

function AudienceView({ analytics }) {
  const value = (id) => analytics.scorecard.find((item) => item.id === id)?.value || 0;
  const segments = [["Viewed but did not save", Math.max(0, value("views") - value("saves"))], ["Saved but did not request directions", Math.max(0, value("saves") - value("directions"))], ["Visited but did not redeem", Math.max(0, value("visits") - value("redemptions"))], ["Repeat engagement", value("repeat")]];
  return <AnalyticsDeepView eyebrow="Audience" title="Behavioral audience signals." description="Segments use recorded actions only. Protected characteristics are never inferred."><SimpleRows rows={segments.map(([label, count]) => [label, count, count ? "Behavioral segment" : "No recorded subjects"])} empty="No audience activity was recorded." /><DataNotice>Survey composition, motivations, and requested improvements appear only after consented survey responses are connected to this workspace.</DataNotice></AnalyticsDeepView>;
}

function PlacesView({ analytics, range, updateQuery }) {
  return <AnalyticsDeepView eyebrow="Places" title="Location performance." description="Only entities attached to the active workspace are ranked."><RankedPlaces rows={analytics.places} detailed /><div className="dp-analytics-inline-actions"><button type="button" onClick={() => updateQuery({ view: "geography" })}>Compare geography</button><Link to={`/map?mode=partner&tab=map&range=${range}`}>Open partner map</Link></div></AnalyticsDeepView>;
}

function CampaignsView({ analytics }) { return <AnalyticsDeepView eyebrow="Campaigns" title="Campaign comparison." description="Campaigns are compared only when workspace-scoped events contain stable campaign identifiers."><SimpleRows rows={analytics.campaigns.map((row) => [row.id, row.actions, "Recorded actions"])} empty="No campaign-linked activity was recorded for this period." /><DataNotice>Cost-per-action remains unavailable until campaign objective and spend records are connected.</DataNotice></AnalyticsDeepView>; }
function ActivityView({ analytics }) { return <AnalyticsDeepView eyebrow="Offers & Events" title="Conversion activity." description="Offer redemptions and event RSVPs remain distinct outcomes."><div className="dp-analytics-split"><section><h3>Offers</h3><SimpleRows rows={analytics.offers.map((row) => [row.id, row.actions, "Offer actions"])} empty="No offer-linked activity was recorded." /></section><section><h3>Events</h3><SimpleRows rows={analytics.partnerEvents.map((row) => [row.id, row.actions, "Event actions"])} empty="No event-linked activity was recorded." /></section></div></AnalyticsDeepView>; }
function SourcesView({ analytics }) { return <AnalyticsDeepView eyebrow="Sources" title="Entry source attribution." description="This is first-touch source reporting from stable event identifiers, not multi-touch attribution."><SimpleRows rows={analytics.sources.map((row) => [row.label, row.actions, `${row.entries} entries · ${row.conversion === null ? "conversion unavailable" : `${row.conversion}% conversion`}`])} empty="No source identifiers were recorded." /></AnalyticsDeepView>; }
function GeographyView({ analytics, updateQuery }) { return <AnalyticsDeepView eyebrow="Geography" title="District and map performance." description="District selections deep-link to the canonical partner map."><div className="dp-analytics-map-layout"><div className="dp-analytics-map-bridge"><MapPin aria-hidden="true" /><h3>Canonical partner map</h3><p>Select an area to open the shared map layer and entity records.</p><Link to="/map?mode=partner&tab=map">Open map</Link></div><SimpleRows rows={analytics.geography.map((row) => [row.district, row.actions, "Recorded actions"])} empty="No district identifiers were recorded." onSelect={(district) => updateQuery({ district, view: "geography" })} /></div></AnalyticsDeepView>; }
function ReportsView({ workspaceId, range }) { const reportBase = `/app/workspace/reports?workspace=${encodeURIComponent(workspaceId)}&period=${range}`; const reports = [["Monthly performance", reportBase], ["Campaign report", `${reportBase}&type=campaign`], ["Place report", `${reportBase}&type=place`], ["Source attribution report", `${reportBase}&type=source`], ["Executive summary", `${reportBase}&type=executive`]]; return <AnalyticsDeepView eyebrow="Reports" title="Turn analysis into a documented read." description="Reports retain the active workspace and clearly state their period, definitions, limitations, and included records."><div className="dp-analytics-report-list">{reports.map(([label, href]) => <Link to={href} key={label}><strong>{label}</strong><span>Open report builder</span><ArrowRight aria-hidden="true" /></Link>)}</div></AnalyticsDeepView>; }

function AnalyticsDeepView({ eyebrow, title, description, children }) { return <div className="dp-analytics-deep-view"><header><p className="dp-analytics-eyebrow">{eyebrow}</p><h2>{title}</h2><p>{description}</p></header>{children}</div>; }
function SectionHeading({ eyebrow, title, id }) { return <div className="dp-analytics-section-heading"><p className="dp-analytics-eyebrow">{eyebrow}</p><h2 id={id}>{title}</h2></div>; }
function DataNotice({ children }) { return <p className="dp-analytics-data-notice">{children}</p>; }
function SimpleRows({ rows, empty, onSelect }) { if (!rows.length) return <EmptyState>{empty}</EmptyState>; return <ol className="dp-analytics-ranked-list">{rows.map(([label, value, detail]) => <li key={label}>{onSelect ? <button type="button" onClick={() => onSelect(label)}><strong>{label}</strong><span>{detail}</span></button> : <div><strong>{label}</strong><span>{detail}</span></div>}<b>{Number(value).toLocaleString()}</b></li>)}</ol>; }
function RankedPlaces({ rows, detailed = false }) { if (!rows.length) return <EmptyState>No place activity was recorded for this workspace and period.</EmptyState>; return <ol className="dp-analytics-ranked-list">{rows.map((row) => <li key={row.entityId}><div><strong>{row.entity?.display_name || row.entityId}</strong><span>{row.entity?.entity_type || "Place"}{detailed ? ` · ${row.views} views · ${row.saves} saves · ${row.directions} directions` : ""}</span></div><b>{row.actions.toLocaleString()}</b><Link to={`/map?mode=partner&entityId=${encodeURIComponent(row.entityId)}`} aria-label={`View ${row.entity?.display_name || row.entityId} on map`}><MapPin aria-hidden="true" /></Link></li>)}</ol>; }
function EmptyState({ children }) { return <div className="dp-analytics-empty"><strong>No data yet</strong><p>{children}</p><Link to="/partner-workspace/overview">Return to workspace overview</Link></div>; }
function TrendReadout({ rows, metric }) { const max = Math.max(...rows.map((row) => Number(row[metric] || 0)), 1); if (!rows.length) return <EmptyState>No time-series activity was recorded for this period.</EmptyState>; return <div className="dp-analytics-trend-readout"><ol aria-label={`${METRIC_LABELS[metric] || metric} by date`}>{rows.map((row) => <li key={row.date}><span>{row.date}</span><i><b style={{ width: `${Math.max(2, Math.round(((row[metric] || 0) / max) * 100))}%` }} /></i><strong>{Number(row[metric] || 0).toLocaleString()}</strong></li>)}</ol><table><caption>Accessible trend data</caption><thead><tr><th>Date</th><th>{METRIC_LABELS[metric] || metric}</th></tr></thead><tbody>{rows.map((row) => <tr key={row.date}><td>{row.date}</td><td>{row[metric] || 0}</td></tr>)}</tbody></table></div>; }
function funnelWidth(value, first) { return first > 0 ? Math.max(2, Math.round((value / first) * 100)) : 0; }
function metricView(id) { if (["redemptions", "rsvps"].includes(id)) return "activity"; if (id === "repeat") return "audience"; if (["views", "directions", "visits", "saves"].includes(id)) return "places"; return "overview"; }
