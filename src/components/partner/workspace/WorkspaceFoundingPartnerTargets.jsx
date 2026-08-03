import { useEffect, useMemo, useState } from "react";
import { Check, Copy, ExternalLink, Search, X } from "lucide-react";
import { Link } from "react-router-dom";
import { withPartnerWorkspaceContext } from "@/lib/partnerWorkspaceContext";
import "@/styles/workspace-founding-partner-drawer-final.css";

function targetBucket(target) {
  const segment = String(target?.segment || "").toLowerCase();
  if (segment.includes("residential")) return "residential";
  if (segment.includes("hospitality") || segment.includes("restaurant") || segment.includes("dining") || segment.includes("hotel")) return "hospitality";
  if (segment.includes("commercial") || segment.includes("developer")) return "commercial";
  if (segment.includes("civic") || segment.includes("district")) return "civic";
  if (segment.includes("media") || segment.includes("destination")) return "media";
  if (segment.includes("brokerage") || segment.includes("referral") || segment.includes("intelligence")) return "referral";
  if (segment.includes("brand")) return "brand";
  return "other";
}

function contactLink(contact) {
  if (contact?.email) return `mailto:${contact.email}`;
  if (contact?.phone) return `tel:${String(contact.phone).replace(/[^\d+]/g, "")}`;
  return "";
}

function contactValue(contact) {
  return [contact?.email, contact?.phone, contact?.channel].filter(Boolean).join(" · ");
}

function buildTargetBrief(target) {
  const contacts = (target.contacts || []).map((contact) => [contact.name, contact.role, contact.email, contact.phone, contact.channel, contact.status].filter(Boolean).join(" — "));
  return [
    `${target.name} · Priority ${target.priority}`,
    `Segment: ${target.segment}`,
    `Relationship: ${target.relationshipStrength}`,
    `Page status: ${target.pageStatus}`,
    `Why it matters: ${target.why}`,
    `Pilot: ${target.pilot}`,
    `Assets / entities: ${(target.assets || []).join("; ")}`,
    target.assetNote ? `Asset note: ${target.assetNote}` : "",
    `Contacts:\n${contacts.map((contact) => `- ${contact}`).join("\n")}`,
    `Prepared pages: ${(target.preparedPages || []).join("; ") || "None recorded"}`,
    `Missing pages: ${(target.missingPages || []).join("; ") || "None recorded"}`,
    `Immediate next action: ${target.nextAction}`,
    `Copy-ready approval ask: ${target.ask}`,
  ].filter(Boolean).join("\n\n");
}

function readReadyTargets() {
  try {
    return JSON.parse(window.localStorage.getItem("dp_founding_partner_ready_targets") || "[]");
  } catch {
    return [];
  }
}

export default function WorkspaceFoundingPartnerTargets({ operations, organizationId }) {
  const targets = operations?.targetDirectory || [];
  const buildings = operations?.buildingDirectory || [];
  const warmRelationships = operations?.warmRelationships || [];
  const [query, setQuery] = useState("");
  const [bucket, setBucket] = useState("all");
  const [priority, setPriority] = useState("all");
  const [selectedTargetId, setSelectedTargetId] = useState("");
  const [copied, setCopied] = useState("");
  const [readyTargets, setReadyTargets] = useState(readReadyTargets);

  const selectedTarget = targets.find((target) => target.id === selectedTargetId) || null;
  const filteredTargets = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return targets.filter((target) => {
      const bucketMatch = bucket === "all" || targetBucket(target) === bucket;
      const priorityMatch = priority === "all" || String(target.priority) === priority;
      const searchable = [target.name, target.segment, target.relationshipStrength, target.pageStatus, target.why, target.pilot, target.nextAction, ...(target.assets || []), ...(target.contacts || []).flatMap((contact) => [contact.name, contact.role, contact.email, contact.phone, contact.channel, contact.status])].filter(Boolean).join(" ").toLowerCase();
      return bucketMatch && priorityMatch && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [targets, bucket, priority, query]);

  const assetCount = targets.reduce((total, target) => total + (target.assets?.length || 0), 0);
  const meta = operations?.briefMeta || {};

  useEffect(() => {
    if (!selectedTarget) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setSelectedTargetId("");
    };
    document.body.classList.add("dp-drawer-open");
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.classList.remove("dp-drawer-open");
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedTarget]);

  async function copyText(key, value) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      window.setTimeout(() => setCopied(""), 1800);
    } catch {
      setCopied("");
    }
  }

  function toggleReady(targetId) {
    const next = readyTargets.includes(targetId) ? readyTargets.filter((id) => id !== targetId) : [...readyTargets, targetId];
    setReadyTargets(next);
    window.localStorage.setItem("dp_founding_partner_ready_targets", JSON.stringify(next));
  }

  return (
    <section className="dp-target-directory" aria-labelledby="target-directory-title">
      <header className="dp-target-directory__hero">
        <p>{meta.label || "CONFIDENTIAL BRIEF"}</p>
        <h1 id="target-directory-title">All target companies, contacts, and assets.</h1>
        <span>{meta.coreDecision}</span>
        <div className="dp-target-directory__prepared"><strong>Prepared for {meta.preparedFor || "Nina Seely"}</strong><span>{meta.organization || "Legends Real Estate"} · {meta.location || "Downtown Austin"} · {meta.date || "July 2026"}</span></div>
        <nav aria-label="Founding Partner Collection views">
          <Link to={withPartnerWorkspaceContext("/partner-workspace/launch", organizationId)}>Launch overview</Link>
          <Link to={withPartnerWorkspaceContext("/partner-workspace/campaigns", organizationId)}>Campaigns</Link>
          <Link to="/map?mode=partner&tab=map&filter=All">Partner map</Link>
          <a href="/founding-partners" target="_blank" rel="noreferrer">Public invitation<ExternalLink aria-hidden="true" /></a>
        </nav>
      </header>

      <section className="dp-target-directory__objective" aria-labelledby="target-objective-title"><div><p>60-day objective</p><h2 id="target-objective-title">A small proof set, opened through trusted relationships.</h2></div><p>{meta.objective}</p></section>
      <section className="dp-target-directory__summary" aria-label="Confidential target inventory summary"><div><strong>{targets.length}</strong><span>companies and networks</span></div><div><strong>{assetCount}</strong><span>listed assets and entities</span></div><div><strong>{buildings.length}</strong><span>direct building routes</span></div><div><strong>{readyTargets.length}</strong><span>routes marked ready</span></div></section>

      <section className="dp-target-directory__directory" aria-labelledby="all-targets-title">
        <header><p>Target directory</p><h2 id="all-targets-title">One line per relationship. Full detail opens in a decision drawer.</h2></header>
        <div className="dp-target-directory__tools">
          <label><Search aria-hidden="true" /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search company, person, building, brand, email, or next action" aria-label="Search all Founding Partner targets" />{query ? <button type="button" onClick={() => setQuery("")} aria-label="Clear target search"><X aria-hidden="true" /></button> : null}</label>
          <div className="dp-target-directory__filter-row" aria-label="Filter target priority">{["all", "1", "2", "3"].map((value) => <button type="button" key={value} className={priority === value ? "is-active" : ""} onClick={() => setPriority(value)} aria-pressed={priority === value}>{value === "all" ? "All priorities" : `P${value}`}</button>)}</div>
          <div className="dp-target-directory__filter-row" aria-label="Filter target segment">{["all", "residential", "hospitality", "commercial", "civic", "media", "referral", "brand"].map((value) => <button type="button" key={value} className={bucket === value ? "is-active" : ""} onClick={() => setBucket(value)} aria-pressed={bucket === value}>{value === "all" ? "All segments" : value}</button>)}</div>
        </div>
        <div className="dp-target-directory__column-head" aria-hidden="true"><span>Pri</span><span>Company / network</span><span>Buildings, brands + entities</span><span>Primary contacts</span><span>Status</span></div>
        <div className="dp-target-directory__rows">
          {filteredTargets.length ? filteredTargets.map((target) => {
            const visibleAssets = (target.assets || []).slice(0, 3);
            const visibleContacts = (target.contacts || []).slice(0, 2);
            const isReady = readyTargets.includes(target.id);
            return <button type="button" key={target.id} className={`dp-target-directory__row-button${isReady ? " is-ready" : ""}`} onClick={() => setSelectedTargetId(target.id)} aria-haspopup="dialog">
              <span className="dp-target-directory__priority">P{target.priority}</span>
              <span className="dp-target-directory__identity"><strong>{target.name}</strong><small>{target.segment}</small></span>
              <span className="dp-target-directory__assets-preview">{visibleAssets.join(" · ")}{(target.assets?.length || 0) > 3 ? ` · +${target.assets.length - 3}` : ""}</span>
              <span className="dp-target-directory__contacts-preview">{visibleContacts.map((contact) => contact.name).join(" · ") || "Contact research required"}</span>
              <span className="dp-target-directory__status"><strong>{isReady ? "Ready" : target.relationshipStrength}</strong><small>{target.pageStatus}</small></span>
            </button>;
          }) : <p className="dp-target-directory__empty">No targets match this view.</p>}
        </div>
      </section>

      <section className="dp-target-directory__buildings" aria-labelledby="building-directory-title"><header><p>Direct building routes</p><h2 id="building-directory-title">Named properties and the best current contact path.</h2></header><div role="table" aria-label="Confidential building target directory"><div role="row"><strong role="columnheader">Property</strong><strong role="columnheader">Operator / route</strong><strong role="columnheader">Contact</strong><strong role="columnheader">Email</strong><strong role="columnheader">Phone</strong><strong role="columnheader">Page</strong></div>{buildings.map((building) => <div role="row" key={building.property}><span role="cell"><strong>{building.property}</strong><small>{building.route}</small></span><span role="cell">{building.operator}</span><span role="cell">{building.contact}</span><span role="cell">{building.email ? <a href={`mailto:${building.email}`}>{building.email}</a> : "Warm / research route"}</span><span role="cell">{building.phone ? <a href={`tel:${building.phone.replace(/[^\d+]/g, "")}`}>{building.phone}</a> : "—"}</span><span role="cell">{building.pageStatus}</span></div>)}</div></section>

      <section className="dp-target-directory__warm" aria-labelledby="warm-routes-title"><header><p>Warm relationships</p><h2 id="warm-routes-title">The people Nina can ask first.</h2></header><div>{warmRelationships.map((relationship) => <article key={`${relationship.name}-${relationship.organization}`}><div><strong>{relationship.name}</strong><small>{relationship.organization}</small></div><p>{relationship.why}</p><p>{relationship.recommendedUse}</p><span>{relationship.contact}</span></article>)}</div></section>

      <section className="dp-target-directory__support" aria-label="Confidential brief support material">
        <details><summary>Ten introductions that matter most</summary><div className="dp-target-directory__support-body"><ol>{(operations.introductionPriorities || []).map((item) => <li key={item.need}><strong>{item.count}</strong><span>{item.need}</span><p>{item.purpose}</p></li>)}</ol></div></details>
        <details><summary>Pilot options that are easy to approve</summary><div className="dp-target-directory__support-body"><div role="table" aria-label="Pilot options"><div role="row"><strong role="columnheader">Pilot</strong><strong role="columnheader">What we make</strong><strong role="columnheader">What we learn</strong></div>{(operations.pilotOptions || []).map((item) => <div role="row" key={item.type}><strong role="cell">{item.type}</strong><span role="cell">{item.build}</span><span role="cell">{item.learn}</span></div>)}</div></div></details>
        <details><summary>Forwardable introduction note</summary><div className="dp-target-directory__support-body"><pre>{operations.forwardableNote?.body}</pre><button type="button" onClick={() => copyText("forwardable-note", operations.forwardableNote?.body || "")}>{copied === "forwardable-note" ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}{copied === "forwardable-note" ? "Note copied" : "Copy note"}</button></div></details>
      </section>

      <footer className="dp-target-directory__footer"><strong>Confidential operating file.</strong><span>Use the hierarchy: executive approver → portfolio owner → location owner. Reconfirm current roles, assets, emails, phone numbers, participation, and approval authority at the moment of outreach.</span></footer>

      {selectedTarget ? <>
        <button type="button" className="dp-relationship-drawer__scrim" aria-label="Close relationship brief" onClick={() => setSelectedTargetId("")} />
        <aside className="dp-relationship-drawer is-open" role="dialog" aria-modal="true" aria-labelledby="relationship-drawer-title">
          <div className="dp-relationship-drawer__head"><strong>Relationship brief</strong><button type="button" aria-label="Close relationship brief" onClick={() => setSelectedTargetId("")}><X aria-hidden="true" /></button></div>
          <div className="dp-relationship-drawer__body">
            <span className="dp-relationship-drawer__eyebrow text-[11px] uppercase text-[11px] uppercase tracking-[0.15em] text-[11px] uppercase tracking-[0.15em] text-[11px] uppercase tracking-[0.15em] dp-eyebrow text-[11px] font-bold uppercase tracking-[0.15em]">{selectedTarget.segment} · {selectedTarget.relationshipStrength}</span>
            <h2 id="relationship-drawer-title">{selectedTarget.name}</h2>
            <p className="dp-relationship-drawer__lead">{selectedTarget.why}</p>
            <div className="dp-relationship-drawer__meta"><div><span>Relationship</span><strong>{selectedTarget.relationshipStrength}</strong></div><div><span>Pilot scope</span><strong>{selectedTarget.pilot}</strong></div><div><span>Page status</span><strong>{selectedTarget.pageStatus}</strong></div><div><span>Priority</span><strong>P{selectedTarget.priority}</strong></div></div>
            <section><span className="dp-relationship-drawer__eyebrow text-[11px] uppercase text-[11px] uppercase tracking-[0.15em] text-[11px] uppercase tracking-[0.15em] text-[11px] uppercase tracking-[0.15em] dp-eyebrow text-[11px] font-bold uppercase tracking-[0.15em]">Approval and operating routes</span><p className="dp-relationship-drawer__contacts-note">Full contact detail from the working data. Reconfirm every route before outreach.</p><div className="dp-relationship-drawer__contacts">{(selectedTarget.contacts || []).map((contact, index) => { const href = contactLink(contact); const value = contactValue(contact) || "No direct email or phone supplied"; return <div key={`${contact.name}-${index}`}><strong>{contact.name}</strong><span>{contact.role}</span>{href ? <a href={href}>{value}</a> : <span>{value}</span>}<small>{contact.status}</small></div>; })}</div></section>
            <p className="dp-relationship-drawer__note"><strong>Immediate next action</strong><br />{selectedTarget.nextAction}</p>
            <div className="dp-relationship-drawer__copy"><span className="dp-relationship-drawer__eyebrow text-[11px] uppercase text-[11px] uppercase tracking-[0.15em] text-[11px] uppercase tracking-[0.15em] text-[11px] uppercase tracking-[0.15em] dp-eyebrow text-[11px] font-bold uppercase tracking-[0.15em]">Copy-ready approval ask</span><p>{selectedTarget.ask}</p><div><button type="button" onClick={() => copyText(`${selectedTarget.id}-ask`, selectedTarget.ask)}>{copied === `${selectedTarget.id}-ask` ? "Message copied" : "Copy message"}</button><button type="button" onClick={() => copyText(`${selectedTarget.id}-brief`, buildTargetBrief(selectedTarget))}>{copied === `${selectedTarget.id}-brief` ? "Brief copied" : "Copy full brief"}</button></div></div>
            <button className={`dp-relationship-drawer__ready${readyTargets.includes(selectedTarget.id) ? " is-ready" : ""}`} type="button" onClick={() => toggleReady(selectedTarget.id)}>{readyTargets.includes(selectedTarget.id) ? "Route marked ready" : "Mark route ready"}</button>
            <div className="dp-relationship-drawer__sources">{(selectedTarget.sources || []).map(([label, href]) => <a href={href} target="_blank" rel="noreferrer" key={href}>{label}<ExternalLink aria-hidden="true" /></a>)}</div>
          </div>
        </aside>
      </> : null}
    </section>
  );
}
