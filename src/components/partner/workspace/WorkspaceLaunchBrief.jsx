import { useEffect, useMemo, useState } from "react";
import { Check, Copy, ExternalLink, LockKeyhole, Search, ShieldCheck, X } from "lucide-react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  collectionAdditionalRoutes,
  collectionLaunchSequence,
  collectionOperatingGoals,
  collectionPriorityTargets,
  collectionResidentialRoutes,
  collectionSuccessMeasures,
  collectionTechnicalNotes,
  collectionWorkingRecords,
} from "@/data/foundingPartnerCollectionOperations";
import { canViewEverything } from "@/lib/auth/session";
import { withPartnerWorkspaceContext } from "@/lib/partnerWorkspaceContext";

const COLLECTION_NAME = "Downtown Perks · Founding Partner Collection";

function buildTargetBrief(target) {
  return [
    target.name,
    `Segment: ${target.segment}`,
    `Pilot: ${target.pilot}`,
    `Approval route: ${target.approvalRoute}`,
    `Operating route: ${target.operatingRoute}`,
    `Contact path: ${target.contactPath}`,
    `Confidence: ${target.confidence}`,
    `Next action: ${target.nextAction}`,
    "",
    `Starter message: ${target.message}`,
  ].join("\n");
}

export default function WorkspaceLaunchBrief({ organizationId, hasPrivilegedAccess = false }) {
  const [accessState, setAccessState] = useState(hasPrivilegedAccess ? "granted" : "checking");
  const [query, setQuery] = useState("");
  const [segment, setSegment] = useState("all");
  const [selectedTargetId, setSelectedTargetId] = useState(collectionPriorityTargets[0]?.id || "");
  const [copied, setCopied] = useState("");

  useEffect(() => {
    if (hasPrivilegedAccess) {
      setAccessState("granted");
      return undefined;
    }

    let active = true;
    base44.auth.me()
      .then((user) => {
        if (active) setAccessState(canViewEverything(user || {}) ? "granted" : "denied");
      })
      .catch(() => {
        if (active) setAccessState("denied");
      });

    return () => { active = false; };
  }, [hasPrivilegedAccess]);

  const filteredTargets = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return collectionPriorityTargets.filter((target) => {
      const segmentMatch = segment === "all" || target.segment.toLowerCase().includes(segment);
      const queryMatch = !normalizedQuery || [
        target.name,
        target.segment,
        target.pilot,
        target.approvalRoute,
        target.operatingRoute,
        target.contactPath,
        target.nextAction,
      ].join(" ").toLowerCase().includes(normalizedQuery);
      return segmentMatch && queryMatch;
    });
  }, [query, segment]);

  const selectedTarget = collectionPriorityTargets.find((target) => target.id === selectedTargetId) || filteredTargets[0] || collectionPriorityTargets[0];

  async function copyText(key, value) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      window.setTimeout(() => setCopied(""), 1800);
    } catch {
      setCopied("");
    }
  }

  if (accessState !== "granted") {
    const checking = accessState === "checking";
    return (
      <section className="dp-launch-brief dp-launch-brief--locked" aria-labelledby="collection-access-title">
        <LockKeyhole aria-hidden="true" />
        <p>{COLLECTION_NAME}</p>
        <h1 id="collection-access-title">{checking ? "Checking authorized access…" : "Authorized operations access required."}</h1>
        <span>{checking ? "Confirming the current Downtown Perks operator session." : "Relationship management, verification, approvals, technical notes, and pilot execution are available only to authorized Downtown Perks operators."}</span>
        {!checking ? <Link to="/partners/sign-in">Sign in</Link> : null}
      </section>
    );
  }

  return (
    <section className="dp-launch-brief" aria-labelledby="collection-operations-title">
      <header className="dp-launch-brief__hero">
        <p>{COLLECTION_NAME}</p>
        <h1 id="collection-operations-title">Turn relationships into approved, measurable pilots.</h1>
        <span>Relationship management, verification, approvals, technical notes, and pilot execution—kept separate from the public Founding Partner invitation.</span>
        <div>
          <Link to={withPartnerWorkspaceContext("/partner-workspace/campaigns", organizationId)}>Open campaigns</Link>
          <Link to="/map?mode=partner&tab=map&filter=All">Open partner map<ExternalLink aria-hidden="true" /></Link>
          <a href="/founding-partners" target="_blank" rel="noreferrer">View public invitation<ExternalLink aria-hidden="true" /></a>
        </div>
      </header>

      <section className="dp-launch-brief__goals" aria-labelledby="collection-goals-title">
        <header><p>Proof set</p><h2 id="collection-goals-title">The first operating outcome</h2></header>
        <div>{collectionOperatingGoals.map((goal) => <div key={goal.label}><strong>{goal.value}</strong><span>{goal.label}</span></div>)}</div>
      </section>

      <section className="dp-launch-brief__minute" aria-labelledby="collection-minute-title">
        <header><p>Now</p><h2 id="collection-minute-title">Move the strongest routes first</h2></header>
        <ol>
          <li><span>01</span><div><strong>Approve one residential pilot.</strong><p>Choose Paseo or one board-ready downtown property and document who signs, who communicates, and who operates.</p></div></li>
          <li><span>02</span><div><strong>Approve one hospitality pilot.</strong><p>Begin with Dunlap ATX, Uchibā, White Lodging, or one verified inKind cohort with one accountable operating owner.</p></div></li>
          <li><span>03</span><div><strong>Write the expansion path before launch.</strong><p>Define what evidence would unlock the next building, venue set, hotel, or portfolio relationship.</p></div></li>
          <li><span>04</span><div><strong>Use one measurable distribution path.</strong><p>Every pilot needs a resident, tenant, guest, venue, event, link, or QR channel that can be attributed.</p></div></li>
          <li><span>05</span><div><strong>Report what people did next.</strong><p>Prioritize opens, saves, directions, RSVPs, scans, redemptions, repeat use, and operating effort.</p></div></li>
        </ol>
      </section>

      <section className="dp-launch-brief__targets" aria-labelledby="collection-targets-title">
        <header><p>Relationships</p><h2 id="collection-targets-title">Approval, operating, and contact routes</h2></header>
        <div className="dp-launch-brief__tools">
          <label><Search aria-hidden="true" /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search organization, person, property, or next action" aria-label="Search Founding Partner operations" />{query ? <button type="button" onClick={() => setQuery("")} aria-label="Clear relationship search"><X aria-hidden="true" /></button> : null}</label>
          <div aria-label="Filter relationship segments">
            {["all", "residential", "hospitality", "commercial", "dining"].map((value) => <button type="button" key={value} className={segment === value ? "is-active" : ""} onClick={() => setSegment(value)} aria-pressed={segment === value}>{value === "all" ? "All" : value}</button>)}
          </div>
        </div>
        <div className="dp-launch-brief__target-list">
          {filteredTargets.length ? filteredTargets.map((target) => (
            <article key={target.id} className={selectedTarget?.id === target.id ? "is-selected" : ""}>
              <div><strong>{target.name}</strong><small>{target.segment} · {target.pilot}</small></div>
              <p><span>Approval</span>{target.approvalRoute}</p>
              <p><span>Confidence</span>{target.confidence}</p>
              <button type="button" onClick={() => setSelectedTargetId(target.id)}>Open brief</button>
            </article>
          )) : <p className="dp-launch-brief__empty">No operating routes match this view.</p>}
        </div>

        {selectedTarget ? (
          <section className="dp-launch-brief__target-detail" aria-labelledby="selected-target-title">
            <header><p>{selectedTarget.segment}</p><h3 id="selected-target-title">{selectedTarget.name}</h3><span>{selectedTarget.pilot}</span></header>
            <dl>
              <div><dt>Approval route</dt><dd>{selectedTarget.approvalRoute}</dd></div>
              <div><dt>Operating route</dt><dd>{selectedTarget.operatingRoute}</dd></div>
              <div><dt>Best current contact path</dt><dd>{selectedTarget.contactPath}</dd></div>
              <div><dt>Confidence</dt><dd>{selectedTarget.confidence}</dd></div>
              <div><dt>Immediate next action</dt><dd>{selectedTarget.nextAction}</dd></div>
            </dl>
            <blockquote>{selectedTarget.message}</blockquote>
            <div className="dp-launch-brief__detail-actions">
              <button type="button" onClick={() => copyText(`${selectedTarget.id}-message`, selectedTarget.message)}>{copied === `${selectedTarget.id}-message` ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}{copied === `${selectedTarget.id}-message` ? "Message copied" : "Copy starter message"}</button>
              <button type="button" onClick={() => copyText(`${selectedTarget.id}-brief`, buildTargetBrief(selectedTarget))}>{copied === `${selectedTarget.id}-brief` ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}{copied === `${selectedTarget.id}-brief` ? "Brief copied" : "Copy full brief"}</button>
            </div>
            <nav aria-label={`${selectedTarget.name} source links`}>{selectedTarget.sources.map(([label, href]) => <a key={href} href={href} target="_blank" rel="noreferrer">{label}<ExternalLink aria-hidden="true" /></a>)}</nav>
          </section>
        ) : null}
      </section>

      <section className="dp-launch-brief__residential" aria-labelledby="collection-residential-title">
        <header><p>Residential</p><h2 id="collection-residential-title">Building-ready starting routes</h2></header>
        <div role="table" aria-label="Residential launch contacts">
          <div role="row"><strong role="columnheader">Property</strong><strong role="columnheader">Contact</strong><strong role="columnheader">Email</strong><strong role="columnheader">Phone</strong></div>
          {collectionResidentialRoutes.map((route) => <div role="row" key={route.property}><span role="cell">{route.property}</span><span role="cell">{route.contact}</span><a role="cell" href={`mailto:${route.email}`}>{route.email}</a><a role="cell" href={`tel:${route.phone.replace(/[^\d+]/g, "")}`}>{route.phone}</a></div>)}
        </div>
      </section>

      <section className="dp-launch-brief__additional" aria-labelledby="collection-additional-title">
        <header><p>Additional routes</p><h2 id="collection-additional-title">Keep these available without expanding the first move</h2></header>
        <div>{collectionAdditionalRoutes.map((route) => <article key={route.organization}><strong>{route.organization}</strong><p>{route.contacts}</p><span>{route.contactPath}</span></article>)}</div>
      </section>

      <section className="dp-launch-brief__technical" aria-labelledby="collection-technical-title">
        <header><p>Technical notes</p><h2 id="collection-technical-title">Product integrity stays inside operations</h2></header>
        <div>{collectionTechnicalNotes.map((note) => <article key={note.id}><strong>{note.title}</strong><span>{note.status}</span><p>{note.summary}</p></article>)}</div>
      </section>

      <section className="dp-launch-brief__sequence" aria-labelledby="collection-sequence-title">
        <header><p>90 days</p><h2 id="collection-sequence-title">Execution sequence</h2></header>
        <ol>{collectionLaunchSequence.map((item) => <li key={item.period}><span>{item.period}</span><div><strong>{item.title}</strong><p>{item.detail}</p></div></li>)}</ol>
      </section>

      <section className="dp-launch-brief__metrics" aria-labelledby="collection-metrics-title">
        <header><p>Proof</p><h2 id="collection-metrics-title">Success measures</h2></header>
        <div role="table" aria-label="Founding Partner Collection launch targets"><div role="row"><strong role="columnheader">Measure</strong><strong role="columnheader">Minimum</strong><strong role="columnheader">Strong</strong></div>{collectionSuccessMeasures.map(([label, minimum, strong]) => <div role="row" key={label}><span role="cell">{label}</span><strong role="cell">{minimum}</strong><strong role="cell">{strong}</strong></div>)}</div>
      </section>

      <section className="dp-launch-brief__records" aria-labelledby="collection-records-title">
        <header><p>Source of truth</p><h2 id="collection-records-title">Operating records</h2></header>
        <ol>{collectionWorkingRecords.map(([title, description], index) => <li key={title}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{title}</strong><p>{description}</p></div></li>)}</ol>
      </section>

      <footer className="dp-launch-brief__verification"><ShieldCheck aria-hidden="true" /><p><strong>Operating standard</strong>Use confirmed public routes or documented warm introductions. Reconfirm titles, portfolio scope, participating assets, and approval authority at the moment of outreach; unknown authority is never treated as approval.</p><time dateTime="2026-07-22">Reconciled July 22, 2026</time></footer>
    </section>
  );
}
