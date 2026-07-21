import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Building2, FileText, Info, MapPin, Plug, Users } from "lucide-react";
import { demoOrganizations, getOrganizationEntities } from "@/config/workspaceArchitecture";
import { withPartnerWorkspaceContext } from "@/lib/partnerWorkspaceContext";
import { getResearchCoverageSummary } from "@/api/researchIntelligenceClient";

const VIEWS = [
  ["overview", "Overview"],
  ["audience", "Audience"],
  ["research", "Research"],
  ["places", "Places"],
  ["campaigns", "Campaigns"],
  ["activity", "Offers & Events"],
  ["sources", "Sources"],
  ["geography", "Geography"],
  ["reports", "Reports"],
];

const POTENTIAL_AUDIENCE_SOURCES = [
  ["DANA", "Member count not connected"],
  ["The Shore", "Resident count not connected"],
  ["Legends", "Contact count not connected"],
];

function DataNotice({ title = "Measured activity is not available yet.", description = "Reach and activity appear after a connected source reports a verified total." }) {
  return <section className="dp-pa-note" aria-label="Data availability"><Info aria-hidden="true" /><div><strong>{title}</strong><p>{description}</p></div></section>;
}

function SourceRows() {
  return <section className="dp-pa-panel"><header><span>Potential reach</span><h2>Audience sources ready to connect.</h2></header><div className="dp-pa-records">{POTENTIAL_AUDIENCE_SOURCES.map(([name, status]) => <article key={name}><div><strong>{name}</strong><small>{status}</small></div><em>Potential source</em></article>)}</div></section>;
}

function ConnectedPlaces({ entities, workspaceId }) {
  if (!entities.length) return <section className="dp-pa-empty"><strong>No connected places.</strong><p>Connect a place before reviewing its activity.</p></section>;
  return <section className="dp-pa-panel"><header><span>Places</span><h2>Places connected to this workspace.</h2></header><div className="dp-pa-records">{entities.map((entity) => <article key={entity.entity_id}><div><strong>{entity.display_name}</strong><small>{entity.entity_type} · Connected place</small></div><Link to={withPartnerWorkspaceContext(`/map?mode=partner&tab=map&filter=${encodeURIComponent(entity.map_filter || "All")}&entityId=${encodeURIComponent(entity.entity_id)}`, workspaceId)}>Open map</Link></article>)}</div></section>;
}

function EmptyMeasurement({ view }) {
  const labels = {
    campaigns: "No verified campaign results.",
    activity: "No verified offer or event activity.",
    sources: "No attributed entry counts.",
    geography: "No verified geographic activity.",
  };
  return <section className="dp-pa-empty"><strong>{labels[view] || "No measured results yet."}</strong><p>Results appear after activity is recorded for this workspace.</p></section>;
}

function Reports({ workspaceId }) {
  return <section className="dp-pa-panel"><header><span>Reports</span><h2>Reports begin with verified records.</h2></header><div className="dp-pa-reports"><article><FileText aria-hidden="true" /><div><strong>Audience and performance report</strong><small>Available after verified audience and action totals are connected.</small></div><Link to={withPartnerWorkspaceContext("/partner-workspace/sources", workspaceId)}>Review sources</Link></article></div></section>;
}

const RESEARCH_COUNTS = [
  ["entities", "Places and organizations", "Records available for matching, map review, and launch planning."],
  ["contacts", "Business contacts", "Research leads that still require verification before outreach."],
  ["pipeline", "Launch targets", "Priority and relationship records gathered from the attached source files."],
  ["campaigns", "Campaign ideas", "Draft concepts only. Nothing in this count is approved to publish."],
  ["content", "Content records", "Place and property copy awaiting editorial and factual review."],
  ["media", "Media checks", "Image and asset records waiting for an approval decision."],
];

function ResearchCoverage({ workspaceId }) {
  const [state, setState] = useState({ status: "loading", data: null });

  useEffect(() => {
    const controller = new AbortController();
    getResearchCoverageSummary(controller.signal)
      .then((data) => setState({ status: "ready", data }))
      .catch((error) => {
        if (error?.name !== "AbortError") setState({ status: "error", data: null });
      });
    return () => controller.abort();
  }, []);

  if (state.status === "loading") {
    return <section className="dp-pa-empty" aria-live="polite"><strong>Reading the research library…</strong><p>Checking the current source coverage without loading contact records.</p></section>;
  }

  if (state.status === "error" || !state.data) {
    return <section className="dp-pa-empty"><strong>Research activity is not available yet.</strong><p>The workspace remains ready. Connect a research source to review totals here.</p><Link to={withPartnerWorkspaceContext("/partner-workspace/sources", workspaceId)}>Review sources</Link></section>;
  }

  return <>
    <section className="dp-pa-panel dp-pa-research-coverage" aria-labelledby="research-coverage-title">
      <header><span>Research coverage</span><h2 id="research-coverage-title">Know what is ready before you use it.</h2><p>These are source-library counts, not audience size or performance results. Every contact, campaign, content record, and media item still requires review.</p></header>
      <div className="dp-pa-records">
        {RESEARCH_COUNTS.map(([key, label, explanation]) => <article key={key}><div><strong>{label}</strong><small>{explanation}</small></div><em>{state.data.summary[key].toLocaleString()}</em></article>)}
      </div>
    </section>
    <DataNotice title="Research is evidence, not publication approval." description="These counts describe source coverage only. They do not represent audience size, live activity, or approved material." />
  </>;
}

export function PartnerAnalyticsExperience() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const requestedWorkspace = params.get("workspace") || params.get("organizationId");
  const organization = demoOrganizations.find((item) => item.id === requestedWorkspace) || demoOrganizations[0];
  const view = VIEWS.some(([id]) => id === params.get("view")) ? params.get("view") : "overview";
  const entities = getOrganizationEntities(organization.id);

  function update(changes) {
    const next = new URLSearchParams(location.search);
    Object.entries(changes).forEach(([key, value]) => next.set(key, value));
    next.set("workspace", changes.workspace || organization.id);
    next.set("organizationId", changes.workspace || organization.id);
    navigate(`${location.pathname}?${next.toString()}`);
  }

  return <motion.section className="dp-partner-analytics" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
    <header className="dp-pa-header"><div><span>Analytics</span><h1>See what is working.</h1><p>Review connected places now. Audience and action totals appear as activity is recorded.</p></div><div><Link to={withPartnerWorkspaceContext("/partner-workspace/sources", organization.id)}><Plug aria-hidden="true" />Review sources</Link><Link to={withPartnerWorkspaceContext("/partner-workspace/reports", organization.id)}><FileText aria-hidden="true" />Reports</Link></div></header>

    <section className="dp-pa-controls" aria-label="Analytics workspace"><label>Workspace<select value={organization.id} onChange={(event) => update({ workspace: event.target.value })}>{demoOrganizations.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><div className="dp-pa-status"><Info aria-hidden="true" /><span><strong>Measured results only</strong>No estimated performance</span></div></section>

    <nav className="dp-pa-tabs" aria-label="Analytics views">{VIEWS.map(([id, label]) => <button key={id} type="button" aria-current={view === id ? "page" : undefined} onClick={() => update({ view: id })}>{label}</button>)}</nav>

    <div className="dp-pa-content">
      {view === "overview" ? <><section className="dp-pa-decision"><div><span>Connected records</span><h2>{entities.length} {entities.length === 1 ? "place is" : "places are"} connected.</h2><p>This is an inventory count, not an audience or performance claim.</p></div><div><span>Potential reach</span><h3>DANA, The Shore, and Legends are ready as source relationships.</h3><p>Their member, resident, and contact totals are not connected, so no combined reach number is shown.</p><Link to={withPartnerWorkspaceContext("/partner-workspace/sources", organization.id)}>Review sources <ArrowRight aria-hidden="true" /></Link></div></section><div className="dp-pa-metrics" aria-label="Verified workspace status"><article><div><span>Connected places</span><Building2 aria-hidden="true" /></div><strong>{entities.length}</strong><footer><span>Canonical records</span></footer></article><article><div><span>Verified users</span><Users aria-hidden="true" /></div><strong>—</strong><footer><span>Count not connected</span></footer></article><article><div><span>Measured actions</span><MapPin aria-hidden="true" /></div><strong>—</strong><footer><span>Analytics not connected</span></footer></article></div><div className="dp-pa-split"><ConnectedPlaces entities={entities.slice(0, 5)} workspaceId={organization.id} /><SourceRows /></div><DataNotice /></> : null}
      {view === "audience" ? <><SourceRows /><DataNotice title="No verified user total is available." /></> : null}
      {view === "research" ? <ResearchCoverage workspaceId={organization.id} /> : null}
      {view === "places" ? <ConnectedPlaces entities={entities} workspaceId={organization.id} /> : null}
      {["campaigns", "activity", "sources", "geography"].includes(view) ? <><EmptyMeasurement view={view} /><DataNotice /></> : null}
      {view === "reports" ? <><Reports workspaceId={organization.id} /><DataNotice /></> : null}
    </div>
  </motion.section>;
}
