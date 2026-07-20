import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Building2, FileText, Info, MapPin, Plug, Search, Users } from "lucide-react";
import { demoOrganizations, getOrganizationEntities } from "@/config/workspaceArchitecture";
import { getPartnerAnalyticsIntelligence } from "@/config/partnerAnalyticsIntelligence";
import { withPartnerWorkspaceContext } from "@/lib/partnerWorkspaceContext";
import { getResearchCoverageSummary } from "@/api/researchIntelligenceClient";
import { getPartnerRedemptionOverview } from "@/features/partner/analytics/partnerRedemptionAnalytics";
import { listPartnerShareLinks } from "@/lib/partner/partnerShareLinksClient";

const VIEWS = [
  ["overview", "Overview"],
  ["audience", "Audience"],
  ["research", "Research"],
  ["seo", "SEO Snapshot"],
  ["places", "Places"],
  ["campaigns", "Campaigns"],
  ["activity", "Offers & Events"],
  ["sources", "Sources"],
  ["geography", "Geography"],
  ["reports", "Reports"],
];

function DataNotice({ title = "Verified analytics are not connected.", description = "Potential reach and measured activity will appear after the source provides a verified count." }) {
  return <section className="dp-pa-note" aria-label="Data availability"><Info aria-hidden="true" /><div><strong>{title}</strong><p>{description}</p></div></section>;
}

function PartnerRecommendation({ intelligence, organizationId }) {
  return <section className="dp-pa-panel dp-pa-recommendation"><header><span>Partner recommendation</span><h2>{intelligence.recommendation}</h2><p>{intelligence.context}</p></header><dl><div><dt>Why this fits</dt><dd>{intelligence.evidence}</dd></div><div><dt>What it should improve</dt><dd>{intelligence.outcome}</dd></div><div><dt>Confidence</dt><dd>{intelligence.confidence}</dd></div></dl><Link to={withPartnerWorkspaceContext(intelligence.nextHref, organizationId)}>{intelligence.nextAction} <ArrowRight aria-hidden="true" /></Link></section>;
}

function SeoIntelligence({ intelligence, organization, entities }) {
  return <div className="dp-pa-seo">
    <section className="dp-pa-seo-lead" aria-labelledby="partner-seo-title">
      <div><span>SEO Snapshot</span><h2 id="partner-seo-title">{intelligence.purpose}</h2><p>{intelligence.context}</p></div>
      <div><strong>What to do next</strong><p>{intelligence.recommendation}</p><Link to={withPartnerWorkspaceContext(intelligence.nextHref, organization.id)}>{intelligence.nextAction} <ArrowRight aria-hidden="true" /></Link></div>
    </section>
    <section className="dp-pa-panel dp-pa-seo-opportunities" aria-labelledby="seo-opportunities-title">
      <header><span>Search opportunities</span><h2 id="seo-opportunities-title">Give every connected place a distinct reason to be found.</h2><p>These recommendations use the selected partner and its connected records. They do not borrow another partner's audience, results, or narrative.</p></header>
      <ol>{intelligence.opportunities.map(([name, recommendation], index) => <li key={name}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{name}</strong><p>{recommendation}</p></div></li>)}</ol>
    </section>
    <section className="dp-pa-evidence" aria-label="Recommendation evidence"><div><span>Evidence used</span><p>{intelligence.evidence}</p></div><div><span>Expected result</span><p>{intelligence.outcome}</p></div><div><span>Confidence</span><p>{intelligence.confidence}</p></div></section>
    {!entities.length ? <DataNotice title={`No connected places are available for ${organization.name}.`} description="Connect and verify a place before publishing its search recommendation." /> : null}
  </div>;
}

function ConnectedPlaces({ entities, workspaceId }) {
  if (!entities.length) return <section className="dp-pa-empty"><strong>No connected places.</strong><p>Add a place to the map before reviewing its activity.</p></section>;
  return <section className="dp-pa-panel"><header><span>Places</span><h2>Places you can manage here</h2></header><div className="dp-pa-records">{entities.map((entity) => <article key={entity.entity_id}><div><strong>{entity.display_name}</strong><small>{entity.entity_type} · Ready to manage</small></div><Link to={withPartnerWorkspaceContext(`/map?mode=partner&tab=map&filter=${encodeURIComponent(entity.map_filter || "All")}&entityId=${encodeURIComponent(entity.entity_id)}`, workspaceId)}>Open map</Link></article>)}</div></section>;
}

function EmptyMeasurement({ view }) {
  const labels = {
    campaigns: "No verified campaign results.",
    activity: "No verified offer or event activity.",
    sources: "No attributed share-link opens.",
    geography: "No verified geographic activity.",
  };
  return <section className="dp-pa-empty"><strong>{labels[view] || "No verified results."}</strong><p>Downtown Perks will not estimate results. Connect a verified analytics source to report measured activity.</p></section>;
}

function Reports({ workspaceId }) {
  return <section className="dp-pa-panel"><header><span>Reports</span><h2>Reports begin with verified results</h2></header><div className="dp-pa-reports"><article><FileText aria-hidden="true" /><div><strong>Audience and performance report</strong><small>Available after verified audience and action totals are connected.</small></div><Link to={withPartnerWorkspaceContext("/partner-workspace/sources", workspaceId)}>Review sources</Link></article><article><FileText aria-hidden="true" /><div><strong>Share-link report</strong><small>Compare QR and copied-link opens by placement and destination.</small></div><Link to={withPartnerWorkspaceContext("/partner-workspace/share-links", workspaceId)}>Open share links</Link></article></div></section>;
}

function ShareLinkSources({ records, workspaceId, partnerName }) {
  if (!records.length) return <section className="dp-pa-empty"><strong>No share-link opens yet.</strong><p>Create a link or QR code for {partnerName}, then use this view to compare where people started.</p><Link to={withPartnerWorkspaceContext("/partner-workspace/share-links", workspaceId)}>Create share link</Link></section>;
  return <section className="dp-pa-panel"><header><span>Share links</span><h2>See where people started.</h2><p>Each row stays tied to {partnerName}, its placement, and its chosen destination.</p></header><div className="dp-pa-records">{records.map((record) => <article key={record.id}><div><strong>{record.name}</strong><small>{String(record.placement_type || "Other").replaceAll("_", " ")} · {record.status}</small></div><em>{Number(record.analytics?.opens || 0).toLocaleString()} opens</em></article>)}</div><Link to={withPartnerWorkspaceContext("/partner-workspace/share-links", workspaceId)}>Manage share links <ArrowRight aria-hidden="true" /></Link></section>;
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
    return <section className="dp-pa-empty"><strong>Research coverage is not connected yet.</strong><p>The current workspace remains available. Connect the backend source to review aggregate research counts here.</p><Link to={withPartnerWorkspaceContext("/partner-workspace/sources", workspaceId)}>Review sources</Link></section>;
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
  const organization = demoOrganizations.find((item) => item.id === requestedWorkspace) || null;
  const view = VIEWS.some(([id]) => id === params.get("view")) ? params.get("view") : "overview";
  const entities = organization ? getOrganizationEntities(organization.id) : [];
  const intelligence = getPartnerAnalyticsIntelligence(organization, entities);
  const [redemptionOverview, setRedemptionOverview] = useState({ status: "loading", data: null });
  const [shareLinkOverview, setShareLinkOverview] = useState({ status: "loading", records: [] });

  useEffect(() => {
    if (!organization?.id) return undefined;
    const controller = new AbortController();
    getPartnerRedemptionOverview("30d", controller.signal)
      .then((data) => setRedemptionOverview({ status: "ready", data }))
      .catch((error) => {
        if (error?.name !== "AbortError") setRedemptionOverview({ status: "unavailable", data: null });
      });
    return () => controller.abort();
  }, [organization?.id]);

  useEffect(() => {
    let active = true;
    if (!organization?.id) return undefined;
    setShareLinkOverview({ status: "loading", records: [] });
    listPartnerShareLinks(organization.id)
      .then((records) => { if (active) setShareLinkOverview({ status: "ready", records }); })
      .catch(() => { if (active) setShareLinkOverview({ status: "unavailable", records: [] }); });
    return () => { active = false; };
  }, [organization?.id]);

  function update(changes) {
    const next = new URLSearchParams(location.search);
    Object.entries(changes).forEach(([key, value]) => next.set(key, value));
    if (!organization?.id && !changes.workspace) return;
    next.set("workspace", changes.workspace || organization.id);
    next.set("organizationId", changes.workspace || organization.id);
    navigate(`${location.pathname}?${next.toString()}`);
  }

  if (!organization) {
    return <section className="dp-pa-empty"><Search aria-hidden="true" /><strong>Choose a partner to see its recommendations.</strong><p>The workspace will keep every insight tied to the selected organization and its connected places.</p></section>;
  }

  return <motion.section className="dp-partner-analytics" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
    <header className="dp-pa-header"><div><span>{organization.name}</span><h1>{view === "seo" ? intelligence.purpose : "See what people respond to"}</h1><p>{view === "seo" ? "Use partner-specific search guidance to decide which page, place, and message should be improved next." : "Review verified activity, understand what it means for this partner, and choose one useful next action."}</p></div><div><Link to={withPartnerWorkspaceContext("/partner-workspace/sources", organization.id)}><Plug aria-hidden="true" />Review sources</Link><Link to={withPartnerWorkspaceContext("/partner-workspace/reports", organization.id)}><FileText aria-hidden="true" />View reports</Link></div></header>

    <section className="dp-pa-status" aria-label="Recommendation source"><Info aria-hidden="true" /><span><strong>Specific to {organization.name}</strong>Recommendations use this partner's connected places. No generated performance data is shown.</span></section>

    <nav className="dp-pa-tabs" aria-label="Analytics views">{VIEWS.map(([id, label]) => <button key={id} type="button" aria-current={view === id ? "page" : undefined} onClick={() => update({ view: id })}>{label}</button>)}</nav>

    <div className="dp-pa-content">
      {view === "overview" ? <><section className="dp-pa-decision"><div><span>Connected places</span><h2>{entities.length} {entities.length === 1 ? "place is" : "places are"} ready to review.</h2><p>This count describes connected records only. It does not estimate audience size or results.</p></div><div><span>What matters for {organization.name}</span><h3>{intelligence.recommendation}</h3><p>{intelligence.context}</p><Link to={withPartnerWorkspaceContext(intelligence.nextHref, organization.id)}>{intelligence.nextAction} <ArrowRight aria-hidden="true" /></Link></div></section><div className="dp-pa-metrics" aria-label="Verified workspace status"><article><div><span>Places ready to review</span><Building2 aria-hidden="true" /></div><strong>{entities.length}</strong><footer><span>Connected to {organization.name}</span></footer></article><article><div><span>Share-link opens</span><Plug aria-hidden="true" /></div><strong>{shareLinkOverview.status === "ready" ? shareLinkOverview.records.reduce((total, record) => total + Number(record.analytics?.opens || 0), 0) : "—"}</strong><footer><span>{shareLinkOverview.status === "ready" ? `${shareLinkOverview.records.length} tracked ${shareLinkOverview.records.length === 1 ? "link" : "links"}` : "Publishing data not connected"}</span></footer></article><article><div><span>Residents who redeemed</span><Users aria-hidden="true" /></div><strong>{redemptionOverview.status === "ready" ? redemptionOverview.data.metrics.uniqueResidents : "—"}</strong><footer><span>{redemptionOverview.status === "ready" ? "Verified residents" : "Results not connected"}</span></footer></article><article><div><span>Completed redemptions</span><MapPin aria-hidden="true" /></div><strong>{redemptionOverview.status === "ready" ? redemptionOverview.data.metrics.completedRedemptions : "—"}</strong><footer><span>{redemptionOverview.status === "ready" ? "Verified partner activity" : "Results not connected"}</span></footer></article></div><div className="dp-pa-split"><ConnectedPlaces entities={entities.slice(0, 5)} workspaceId={organization.id} /><PartnerRecommendation intelligence={intelligence} organizationId={organization.id} /></div><DataNotice title={redemptionOverview.status === "ready" ? "Verified results are connected." : "No verified perk results are available yet."} description={redemptionOverview.status === "ready" ? "Results come from completed resident perk transactions and tracked share links for the selected partner." : "Sign in with an authorized partner account and complete a resident perk to begin reporting."} /></> : null}
      {view === "audience" ? <><PartnerRecommendation intelligence={intelligence} organizationId={organization.id} /><DataNotice title="No verified user total is available." description={`Connect a consent-aware audience source for ${organization.name} before reporting reach or behavior.`} /></> : null}
      {view === "research" ? <ResearchCoverage workspaceId={organization.id} /> : null}
      {view === "seo" ? <SeoIntelligence intelligence={intelligence} organization={organization} entities={entities} /> : null}
      {view === "places" ? <ConnectedPlaces entities={entities} workspaceId={organization.id} /> : null}
      {view === "sources" ? <><ShareLinkSources records={shareLinkOverview.records} workspaceId={organization.id} partnerName={organization.name} />{shareLinkOverview.status === "unavailable" ? <DataNotice title="Share-link results are not connected." description="Connect the publishing service before reporting attributed opens." /> : null}</> : null}
      {["campaigns", "activity", "geography"].includes(view) ? <><EmptyMeasurement view={view} /><DataNotice /></> : null}
      {view === "reports" ? <><Reports workspaceId={organization.id} /><DataNotice /></> : null}
    </div>
  </motion.section>;
}
