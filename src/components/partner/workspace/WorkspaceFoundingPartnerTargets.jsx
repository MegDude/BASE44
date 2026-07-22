import { useMemo, useState } from "react";
import { Check, Copy, ExternalLink, Search, X } from "lucide-react";
import { Link } from "react-router-dom";
import { withPartnerWorkspaceContext } from "@/lib/partnerWorkspaceContext";

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
  const contacts = (target.contacts || []).map((contact) => [
    contact.name,
    contact.role,
    contact.email,
    contact.phone,
    contact.channel,
    contact.status,
  ].filter(Boolean).join(" — "));

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
    `Plain-language ask: ${target.ask}`,
  ].filter(Boolean).join("\n\n");
}

export default function WorkspaceFoundingPartnerTargets({ operations, organizationId }) {
  const targets = operations?.targetDirectory || [];
  const buildings = operations?.buildingDirectory || [];
  const warmRelationships = operations?.warmRelationships || [];
  const [query, setQuery] = useState("");
  const [bucket, setBucket] = useState("all");
  const [priority, setPriority] = useState("all");
  const [copied, setCopied] = useState("");

  const filteredTargets = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return targets.filter((target) => {
      const bucketMatch = bucket === "all" || targetBucket(target) === bucket;
      const priorityMatch = priority === "all" || String(target.priority) === priority;
      const searchable = [
        target.name,
        target.segment,
        target.relationshipStrength,
        target.pageStatus,
        target.why,
        target.pilot,
        target.nextAction,
        ...(target.assets || []),
        ...(target.contacts || []).flatMap((contact) => [contact.name, contact.role, contact.email, contact.phone, contact.channel, contact.status]),
      ].filter(Boolean).join(" ").toLowerCase();
      return bucketMatch && priorityMatch && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [targets, bucket, priority, query]);

  const assetCount = targets.reduce((total, target) => total + (target.assets?.length || 0), 0);
  const meta = operations?.briefMeta || {};

  async function copyText(key, value) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      window.setTimeout(() => setCopied(""), 1800);
    } catch {
      setCopied("");
    }
  }

  return (
    <section className="dp-target-directory" aria-labelledby="target-directory-title">
      <header className="dp-target-directory__hero">
        <p>{meta.label || "CONFIDENTIAL BRIEF"}</p>
        <h1 id="target-directory-title">All target companies, contacts, and assets.</h1>
        <span>{meta.coreDecision}</span>
        <div className="dp-target-directory__prepared">
          <strong>Prepared for {meta.preparedFor || "Nina Seely"}</strong>
          <span>{meta.organization || "Legends Real Estate"} · {meta.location || "Downtown Austin"} · {meta.date || "July 2026"}</span>
        </div>
        <nav aria-label="Founding Partner Collection views">
          <Link to={withPartnerWorkspaceContext("/partner-workspace/launch", organizationId)}>Launch overview</Link>
          <a href="/founding-partners" target="_blank" rel="noreferrer">Public invitation<ExternalLink aria-hidden="true" /></a>
        </nav>
      </header>

      <section className="dp-target-directory__objective" aria-labelledby="target-objective-title">
        <div><p>60-day objective</p><h2 id="target-objective-title">A small proof set, opened through trusted relationships.</h2></div>
        <p>{meta.objective}</p>
      </section>

      <section className="dp-target-directory__summary" aria-label="Confidential target inventory summary">
        <div><strong>{targets.length}</strong><span>companies and networks</span></div>
        <div><strong>{assetCount}</strong><span>listed assets and entities</span></div>
        <div><strong>{buildings.length}</strong><span>direct building routes</span></div>
        <div><strong>{warmRelationships.length}</strong><span>warm relationship contacts</span></div>
      </section>

      <section className="dp-target-directory__directory" aria-labelledby="all-targets-title">
        <header><p>Target directory</p><h2 id="all-targets-title">One line per relationship. Full detail on open.</h2></header>
        <div className="dp-target-directory__tools">
          <label>
            <Search aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search company, person, building, brand, email, or next action"
              aria-label="Search all Founding Partner targets"
            />
            {query ? <button type="button" onClick={() => setQuery("")} aria-label="Clear target search"><X aria-hidden="true" /></button> : null}
          </label>
          <div className="dp-target-directory__filter-row" aria-label="Filter target priority">
            {["all", "1", "2", "3"].map((value) => <button type="button" key={value} className={priority === value ? "is-active" : ""} onClick={() => setPriority(value)} aria-pressed={priority === value}>{value === "all" ? "All priorities" : `P${value}`}</button>)}
          </div>
          <div className="dp-target-directory__filter-row" aria-label="Filter target segment">
            {["all", "residential", "hospitality", "commercial", "civic", "media", "referral", "brand"].map((value) => <button type="button" key={value} className={bucket === value ? "is-active" : ""} onClick={() => setBucket(value)} aria-pressed={bucket === value}>{value === "all" ? "All segments" : value}</button>)}
          </div>
        </div>

        <div className="dp-target-directory__column-head" aria-hidden="true">
          <span>Pri</span><span>Company / network</span><span>Buildings, brands + entities</span><span>Primary contacts</span><span>Status</span>
        </div>

        <div className="dp-target-directory__rows">
          {filteredTargets.length ? filteredTargets.map((target) => {
            const visibleAssets = (target.assets || []).slice(0, 3);
            const visibleContacts = (target.contacts || []).slice(0, 2);
            return (
              <details key={target.id} className="dp-target-directory__row">
                <summary>
                  <span className="dp-target-directory__priority">P{target.priority}</span>
                  <span className="dp-target-directory__identity"><strong>{target.name}</strong><small>{target.segment}</small></span>
                  <span className="dp-target-directory__assets-preview">{visibleAssets.join(" · ")}{(target.assets?.length || 0) > 3 ? ` · +${target.assets.length - 3}` : ""}</span>
                  <span className="dp-target-directory__contacts-preview">{visibleContacts.map((contact) => contact.name).join(" · ") || "Contact research required"}</span>
                  <span className="dp-target-directory__status"><strong>{target.relationshipStrength}</strong><small>{target.pageStatus}</small></span>
                </summary>

                <div className="dp-target-directory__detail">
                  <div className="dp-target-directory__decision-grid">
                    <div><span>Why this relationship matters</span><p>{target.why}</p></div>
                    <div><span>Proposed pilot</span><p>{target.pilot}</p></div>
                    <div><span>Immediate next action</span><p>{target.nextAction}</p></div>
                    <div><span>Plain-language ask</span><p>{target.ask}</p></div>
                  </div>

                  <section aria-labelledby={`${target.id}-assets`}>
                    <h3 id={`${target.id}-assets`}>Buildings, brands, venues, and entities in scope</h3>
                    <ul className="dp-target-directory__asset-list">{(target.assets || []).map((asset) => <li key={asset}>{asset}</li>)}</ul>
                    {target.assetNote ? <p className="dp-target-directory__note">{target.assetNote}</p> : null}
                  </section>

                  <section aria-labelledby={`${target.id}-contacts`}>
                    <h3 id={`${target.id}-contacts`}>Full contact detail from the working data</h3>
                    <div className="dp-target-directory__contacts" role="table" aria-label={`${target.name} contacts`}>
                      <div role="row"><strong role="columnheader">Name</strong><strong role="columnheader">Role / use</strong><strong role="columnheader">Contact route</strong><strong role="columnheader">Status</strong></div>
                      {(target.contacts || []).map((contact, index) => {
                        const href = contactLink(contact);
                        const value = contactValue(contact) || "No direct email or phone supplied";
                        return <div role="row" key={`${contact.name}-${index}`}><span role="cell"><strong>{contact.name}</strong></span><span role="cell">{contact.role}</span>{href ? <a role="cell" href={href}>{value}</a> : <span role="cell">{value}</span>}<span role="cell">{contact.status}</span></div>;
                      })}
                    </div>
                  </section>

                  <div className="dp-target-directory__page-status">
                    <div><span>Prepared pages / assets</span><p>{(target.preparedPages || []).join(" · ") || "None recorded"}</p></div>
                    <div><span>Missing or verification pages</span><p>{(target.missingPages || []).join(" · ") || "None recorded"}</p></div>
                  </div>

                  <div className="dp-target-directory__actions">
                    <button type="button" onClick={() => copyText(target.id, buildTargetBrief(target))}>{copied === target.id ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}{copied === target.id ? "Brief copied" : "Copy target brief"}</button>
                    {(target.sources || []).map(([label, href]) => <a href={href} target="_blank" rel="noreferrer" key={href}>{label}<ExternalLink aria-hidden="true" /></a>)}
                  </div>
                </div>
              </details>
            );
          }) : <p className="dp-target-directory__empty">No targets match this view.</p>}
        </div>
      </section>

      <section className="dp-target-directory__buildings" aria-labelledby="building-directory-title">
        <header><p>Direct building routes</p><h2 id="building-directory-title">Named properties and the best current contact path.</h2></header>
        <div role="table" aria-label="Confidential building target directory">
          <div role="row"><strong role="columnheader">Property</strong><strong role="columnheader">Operator / route</strong><strong role="columnheader">Contact</strong><strong role="columnheader">Email</strong><strong role="columnheader">Phone</strong><strong role="columnheader">Page</strong></div>
          {buildings.map((building) => <div role="row" key={building.property}><span role="cell"><strong>{building.property}</strong><small>{building.route}</small></span><span role="cell">{building.operator}</span><span role="cell">{building.contact}</span><span role="cell">{building.email ? <a href={`mailto:${building.email}`}>{building.email}</a> : "Warm / research route"}</span><span role="cell">{building.phone ? <a href={`tel:${building.phone.replace(/[^\d+]/g, "")}`}>{building.phone}</a> : "—"}</span><span role="cell">{building.pageStatus}</span></div>)}
        </div>
      </section>

      <section className="dp-target-directory__warm" aria-labelledby="warm-routes-title">
        <header><p>Warm relationships</p><h2 id="warm-routes-title">The people Nina can ask first.</h2></header>
        <div>{warmRelationships.map((relationship) => <article key={`${relationship.name}-${relationship.organization}`}><div><strong>{relationship.name}</strong><small>{relationship.organization}</small></div><p>{relationship.why}</p><p>{relationship.recommendedUse}</p><span>{relationship.contact}</span></article>)}</div>
      </section>

      <section className="dp-target-directory__support" aria-label="Confidential brief support material">
        <details>
          <summary>Ten introductions that matter most</summary>
          <div className="dp-target-directory__support-body"><ol>{(operations.introductionPriorities || []).map((item) => <li key={item.need}><strong>{item.count}</strong><span>{item.need}</span><p>{item.purpose}</p></li>)}</ol></div>
        </details>
        <details>
          <summary>Pilot options that are easy to approve</summary>
          <div className="dp-target-directory__support-body"><div role="table" aria-label="Pilot options"><div role="row"><strong role="columnheader">Pilot</strong><strong role="columnheader">What we make</strong><strong role="columnheader">What we learn</strong></div>{(operations.pilotOptions || []).map((item) => <div role="row" key={item.type}><strong role="cell">{item.type}</strong><span role="cell">{item.build}</span><span role="cell">{item.learn}</span></div>)}</div></div>
        </details>
        <details>
          <summary>Forwardable introduction note</summary>
          <div className="dp-target-directory__support-body"><pre>{operations.forwardableNote?.body}</pre><button type="button" onClick={() => copyText("forwardable-note", operations.forwardableNote?.body || "")}>{copied === "forwardable-note" ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}{copied === "forwardable-note" ? "Note copied" : "Copy note"}</button></div>
        </details>
      </section>

      <footer className="dp-target-directory__footer">
        <strong>Confidential operating file.</strong>
        <span>Use the hierarchy: executive approver → portfolio owner → location owner. Reconfirm current roles, assets, emails, phone numbers, participation, and approval authority at the moment of outreach.</span>
      </footer>
    </section>
  );
}
