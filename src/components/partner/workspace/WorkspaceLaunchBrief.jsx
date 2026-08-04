import { useEffect, useState } from "react";
import { Check, CheckCircle2, Copy, ExternalLink, LockKeyhole, ShieldCheck } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  launchDecisions,
  launchMetrics,
  launchPriorityTargets,
  launchReachEngines,
  launchSequence,
  launchWorkingRecords,
} from "@/data/launchOutreachPlan";
import { withPartnerWorkspaceContext } from "@/lib/partnerWorkspaceContext";
import WorkspaceFoundingPartnerTargets from "@/components/partner/workspace/WorkspaceFoundingPartnerTargets";
import { fetchFoundingPartnerOperations } from "@/lib/partner/foundingPartnerOperationsClient";

const NINA_BRIEF = "Meg is launching Downtown Perks through Frost Tower, a small group of ready residential buildings, and several hospitality partners; she has a practical 30-day pilot and needs introductions to the people who can approve the first properties, tenant communications, and multi-venue offers.";

export default function WorkspaceLaunchBrief({ organizationId }) {
  const location = useLocation();
  const view = new URLSearchParams(location.search).get("view") || "overview";
  const [copied, setCopied] = useState(false);
  const [accessState, setAccessState] = useState("checking");
  const [operations, setOperations] = useState(null);

  useEffect(() => {
    if (view !== "targets") return undefined;
    let active = true;
    setAccessState("checking");
    fetchFoundingPartnerOperations()
      .then((data) => {
        if (!active) return;
        setOperations(data);
        setAccessState("granted");
      })
      .catch((error) => {
        if (!active) return;
        const denied = error?.code === "COLLECTION_OPERATIONS_FORBIDDEN" || error?.message === "AUTH_REQUIRED";
        setAccessState(denied ? "denied" : "error");
      });
    return () => {
      active = false;
    };
  }, [view]);

  const copyBrief = async () => {
    try {
      await navigator.clipboard.writeText(NINA_BRIEF);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  if (view === "targets") {
    if (accessState === "granted" && operations) {
      return <WorkspaceFoundingPartnerTargets operations={operations} organizationId={organizationId} />;
    }
    return (
      <section className="dp-target-directory dp-target-directory--gate" aria-labelledby="target-gate-title">
        <div className="dp-target-directory__gate-card" role="status" aria-live="polite">
          <LockKeyhole aria-hidden="true" />
          <p>Downtown Perks · Founding Partner Collection</p>
          <h1 id="target-gate-title">
            {accessState === "checking"
              ? "Verifying operator access…"
                : accessState === "denied"
                  ? "Authorized operations access required."
                  : "This confidential brief could not be loaded."}
          </h1>
          <span>
            {accessState === "checking"
              ? "Confirming your Downtown Perks operator credentials before revealing relationship data."
              : accessState === "denied"
                ? "Sign in with an authorized Downtown Perks operator account to open the Founding Partner target directory."
                : "Please retry in a moment. If this persists, confirm your session is still active."}
          </span>
          <div className="dp-target-directory__gate-actions">
            <Link to={withPartnerWorkspaceContext("/partner-workspace/launch", organizationId)}>Return to launch overview</Link>
            <a href="/founding-partners" target="_blank" rel="noreferrer">
              Public invitation
              <ExternalLink aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>
    );
  }

  return <section className="dp-launch-brief" aria-labelledby="launch-brief-title">
    <header className="dp-launch-brief__hero">
      <p>Launch</p>
      <h1 id="launch-brief-title">Turn a few relationships into downtown reach.</h1>
      <span>Start with Frost Tower, convert warm relationships into proof, then expand through portfolios.</span>
      <div><Link to={withPartnerWorkspaceContext("/partner-workspace/launch?view=targets", organizationId)}>Open all targets<LockKeyhole aria-hidden="true" /></Link><Link to={withPartnerWorkspaceContext("/partner-workspace/campaigns", organizationId)}>Open campaigns</Link><Link to="/map?mode=partner&tab=map&filter=All">Open partner map<ExternalLink aria-hidden="true" /></Link></div>
    </header>

    <section className="dp-launch-brief__minute" aria-labelledby="launch-minute-title">
      <h2 id="launch-minute-title">Launch in one minute</h2>
      <ol>
        <li><span>01</span><div><strong>Anchor at Frost Tower.</strong><p>Confirm ownership, property management, tenant communications, and employer contacts.</p></div></li>
        <li><span>02</span><div><strong>Turn warm relationships into proof.</strong><p>Activate Legends, DANA, the Alliance, Waterloo Greenway, Hotel Van Zandt, Pouring With Heart, and The Shore.</p></div></li>
        <li><span>03</span><div><strong>Expand through portfolios.</strong><p>Ask every operator for one pilot property and the route to the next two or three.</p></div></li>
        <li><span>04</span><div><strong>Build a useful offer network.</strong><p>Prioritize multi-venue operators, walkable businesses, events, wellness, retail, and local brands.</p></div></li>
        <li><span>05</span><div><strong>Measure every route.</strong><p>Use a unique link or QR code and report sign-ups, saves, visits, redemptions, and repeat use.</p></div></li>
      </ol>
    </section>

    <section className="dp-launch-brief__decisions" aria-labelledby="launch-decisions-title">
      <header><p>Now</p><h2 id="launch-decisions-title">Immediate decisions</h2></header>
      <ul>{launchDecisions.map((decision) => <li key={decision}><CheckCircle2 aria-hidden="true" /><span>{decision}</span></li>)}</ul>
    </section>

    <section className="dp-launch-brief__frost" aria-labelledby="launch-frost-title">
      <div><p>First route</p><h2 id="launch-frost-title">Frost Tower</h2><span>Use Travis Dunaway at Endeavor as the proposed opening route, then verify the complete operating chain.</span></div>
      <ol aria-label="Frost Tower decision chain"><li>Asset lead</li><li>Property manager</li><li>Tenant experience</li><li>Communications authority</li><li>Employer contacts</li></ol>
      <aside><ShieldCheck aria-hidden="true" /><p>Relationship route only. Confirm current ownership, management, occupancy, authority, and contact details immediately before outreach.</p></aside>
    </section>

    <section className="dp-launch-brief__engines" aria-labelledby="launch-engines-title">
      <header><p>Reach</p><h2 id="launch-engines-title">Relationship engines</h2></header>
      <div>{launchReachEngines.map((engine) => <article key={engine.id}><span><strong>{engine.label}</strong><small>{engine.outcome}</small></span><span><em>{engine.targets}</em><small>{engine.proof}</small></span></article>)}</div>
    </section>

    <section className="dp-launch-brief__targets" aria-labelledby="launch-targets-title">
      <header><p>Outreach</p><h2 id="launch-targets-title">Priority relationships</h2></header>
      <div>{["Now", "Next", "Later"].map((tier) => <section key={tier} aria-labelledby={`launch-tier-${tier.toLowerCase()}`}><h3 id={`launch-tier-${tier.toLowerCase()}`}>{tier}</h3>{launchPriorityTargets.filter((target) => target.tier === tier).map((target) => <article key={target.name}><div><strong>{target.name}</strong><small>{target.route}</small></div><p>{target.ask}</p><span>Verify before outreach</span></article>)}</section>)}</div>
    </section>

    <section className="dp-launch-brief__sequence" aria-labelledby="launch-sequence-title">
      <header><p>60 days</p><h2 id="launch-sequence-title">Execution sequence</h2></header>
      <ol>{launchSequence.map((item) => <li key={item.period}><span>{item.period}</span><div><strong>{item.title}</strong><p>{item.detail}</p></div></li>)}</ol>
    </section>

    <section className="dp-launch-brief__metrics" aria-labelledby="launch-metrics-title">
      <header><p>Proof</p><h2 id="launch-metrics-title">Success measures</h2></header>
      <div role="table" aria-label="60-day launch targets"><div role="row"><strong role="columnheader">Measure</strong><strong role="columnheader">Minimum</strong><strong role="columnheader">Strong</strong></div>{launchMetrics.map(([label, minimum, strong]) => <div role="row" key={label}><span role="cell">{label}</span><strong role="cell">{minimum}</strong><strong role="cell">{strong}</strong></div>)}</div>
    </section>

    <section className="dp-launch-brief__records" aria-labelledby="launch-records-title">
      <header><p>Review materials</p><h2 id="launch-records-title">Read these first</h2></header>
      <ol>{launchWorkingRecords.map(([title, description], index) => <li key={title}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{title}</strong><p>{description}</p></div></li>)}</ol>
      <p className="dp-launch-brief__record-note">Add the source links before sharing these materials outside the team. The supplied brief did not include a Notion link.</p>
    </section>

    <section className="dp-launch-brief__nina" aria-labelledby="launch-nina-title">
      <p>For Nina</p><h2 id="launch-nina-title">One-sentence introduction</h2><blockquote>{NINA_BRIEF}</blockquote><button type="button" onClick={copyBrief}>{copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}{copied ? "Copied" : "Copy introduction"}</button>
    </section>

    <footer className="dp-launch-brief__verification"><ShieldCheck aria-hidden="true" /><p><strong>Before outreach</strong> Confirm current ownership, property management, tenant occupancy, venue ownership, operating status, and decision authority. Internal relationship notes are not public confirmation.</p><time dateTime="2026-07-18">Summary created July 18, 2026</time></footer>
  </section>;
}
