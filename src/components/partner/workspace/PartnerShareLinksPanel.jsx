import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Download, ExternalLink, Pause, Play, QrCode } from "lucide-react";
import { demoOrganizations, getOrganizationEntities } from "@/config/workspaceArchitecture";
import { createPartnerShareLink, listPartnerShareLinks, updatePartnerShareLink } from "@/lib/partner/partnerShareLinksClient";
import "@/styles/partner-share-links-final.css";

const PLACEMENTS = [
  ["building_lobby", "Building lobby"], ["leasing_flow", "Leasing follow-up"], ["hotel_lobby", "Hotel lobby"],
  ["guest_room", "Guest room"], ["venue_counter", "Venue counter"], ["event_poster", "Event poster"],
  ["email", "Email"], ["social", "Social post"], ["website", "Website"], ["other", "Other"],
];

function recommendationFor(organization, entities) {
  const first = entities[0];
  const placeName = first?.display_name || organization?.name || "your place";
  if (organization?.type === "hospitality_group") return { title: `Help guests explore from ${placeName}`, detail: "Start with a guest-room or lobby QR that opens a short, walkable guide near the hotel.", placement: "guest_room" };
  if (organization?.type === "property_group") return { title: `Give residents one useful starting point`, detail: `Create a lobby link for nearby benefits, events, and everyday places connected to ${placeName}.`, placement: "building_lobby" };
  if (organization?.type === "venue_group") return { title: `Turn nearby interest into a visit`, detail: `Share the live map view for ${placeName} from the venue counter, an event poster, or a current campaign.`, placement: "venue_counter" };
  if (organization?.type === "real_estate") return { title: `Connect the listing to its neighborhood`, detail: "Use a listing link that helps buyers or renters understand the places and routines around the property.", placement: "website" };
  if (organization?.type === "civic") return { title: `Open the right downtown guide`, detail: "Use a public sign or event link to connect people with a verified route, place, or civic program.", placement: "event_poster" };
  return { title: `Share ${organization?.name || "Downtown Perks"} at the right moment`, detail: "Choose the exact map destination and the place where people will see the link.", placement: "social" };
}

function labelFor(value) {
  return value ? value.replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase()) : "—";
}

export function PartnerShareLinksPanel({ organizationId }) {
  const organization = demoOrganizations.find((item) => item.id === organizationId);
  const entities = useMemo(() => getOrganizationEntities(organizationId), [organizationId]);
  const recommendation = useMemo(() => recommendationFor(organization, entities), [organization, entities]);
  const defaultPath = entities[0]?.map_filter
    ? `/map?mode=resident&tab=map&filter=${encodeURIComponent(entities[0].map_filter)}`
    : "/map?mode=resident&tab=map&filter=All";
  const [links, setLinks] = useState([]);
  const [form, setForm] = useState({ name: `${organization?.name || "Downtown Perks"} map`, placementType: recommendation.placement, destinationType: "map", destinationPath: defaultPath, publishNow: true });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    listPartnerShareLinks(organizationId).then((records) => { if (active) setLinks(records); }).catch((reason) => { if (active) setError(reason.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [organizationId]);

  async function submit(event) {
    event.preventDefault();
    setSaving(true); setError(""); setMessage("");
    try {
      const result = await createPartnerShareLink({ organizationId, ...form });
      setLinks((current) => [result.shareLink, ...current]);
      setMessage(result.message);
    } catch (reason) { setError(reason.message); }
    finally { setSaving(false); }
  }

  async function changeStatus(link, status) {
    setError(""); setMessage("");
    try {
      const result = await updatePartnerShareLink(link.id, organizationId, status);
      setLinks((current) => current.map((item) => item.id === link.id ? result.shareLink : item));
      setMessage(result.message);
    } catch (reason) { setError(reason.message); }
  }

  async function copyLink(link) {
    await navigator.clipboard.writeText(link.shareUrl);
    setCopiedId(link.id);
    window.setTimeout(() => setCopiedId(""), 1600);
  }

  return <section className="dp-share-links" aria-labelledby="share-links-title">
    <header className="dp-share-links-hero">
      <p>Publish</p>
      <h1 id="share-links-title">Share links</h1>
      <span>Create one trackable link or QR code that opens the exact map, place, offer, event, route, campaign, or guide you choose.</span>
    </header>

    <section className="dp-share-links-recommendation" aria-labelledby="share-links-recommendation">
      <p>Recommended for {organization?.name || "this partner"}</p>
      <h2 id="share-links-recommendation">{recommendation.title}</h2>
      <span>{recommendation.detail}</span>
    </section>

    <form className="dp-share-links-form" onSubmit={submit}>
      <header><p>Create a share link</p><h2>Choose what opens and where people find it.</h2><span>The link can go live immediately. Every open stays attributed to {organization?.name || "this partner"} and its placement.</span></header>
      <label><span>Link name</span><input required minLength="2" maxLength="100" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Lobby neighborhood guide" /></label>
      <div className="dp-share-links-fields">
        <label><span>Where people see it</span><select value={form.placementType} onChange={(event) => setForm({ ...form, placementType: event.target.value })}>{PLACEMENTS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label><span>What it opens</span><select value={form.destinationType} onChange={(event) => setForm({ ...form, destinationType: event.target.value })}>{["map", "place", "offer", "event", "route", "campaign", "guide"].map((value) => <option key={value} value={value}>{labelFor(value)}</option>)}</select></label>
      </div>
      <label><span>Downtown Perks destination</span><input required value={form.destinationPath} onChange={(event) => setForm({ ...form, destinationPath: event.target.value })} aria-describedby="share-link-destination-help" /><small id="share-link-destination-help">Use a Downtown Perks path beginning with /map, /partners, /events, /perks, /resident, or /network.</small></label>
      <label className="dp-share-links-publish"><input type="checkbox" checked={form.publishNow} onChange={(event) => setForm({ ...form, publishNow: event.target.checked })} /><span><strong>Publish immediately</strong><small>Creates the working link and downloadable QR as soon as the details pass validation.</small></span></label>
      <button className="dp-share-links-submit" type="submit" disabled={saving}>{saving ? "Creating share link…" : form.publishNow ? "Create and publish" : "Save draft"}</button>
    </form>

    {message ? <p className="dp-share-links-feedback is-success" role="status"><Check aria-hidden="true" />{message}</p> : null}
    {error ? <p className="dp-share-links-feedback is-error" role="alert">{error}</p> : null}

    <section className="dp-share-links-library" aria-labelledby="share-links-library">
      <header><div><p>Current links</p><h2 id="share-links-library">See what is live and what people opened.</h2></div><span>{links.length} {links.length === 1 ? "link" : "links"}</span></header>
      {loading ? <p className="dp-share-links-empty">Loading share links…</p> : links.length === 0 ? <p className="dp-share-links-empty">No share links yet. Create the first one above when account publishing is connected.</p> : <div className="dp-share-links-list">{links.map((link) => <article key={link.id} className="dp-share-link-row">
        <div className="dp-share-link-main"><span>{labelFor(link.placement_type)} · {labelFor(link.destination_type)}</span><h3>{link.name}</h3><p>{link.destination_path}</p></div>
        <dl><div><dt>Opens</dt><dd>{link.analytics?.opens || 0}</dd></div><div><dt>QR opens</dt><dd>{link.analytics?.qrOpens || 0}</dd></div><div><dt>Status</dt><dd>{labelFor(link.status)}</dd></div></dl>
        <div className="dp-share-link-actions">
          <button type="button" onClick={() => copyLink(link)} disabled={!link.shareUrl}><Copy aria-hidden="true" />{copiedId === link.id ? "Copied" : "Copy link"}</button>
          {link.status === "live" ? <a href={link.qrDownloadUrl}><Download aria-hidden="true" />Download QR</a> : null}
          {link.status === "live" ? <a href={link.shareUrl} target="_blank" rel="noreferrer"><ExternalLink aria-hidden="true" />Open link</a> : null}
          <button type="button" onClick={() => changeStatus(link, link.status === "live" ? "paused" : "live")}>{link.status === "live" ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}{link.status === "live" ? "Pause" : "Publish"}</button>
        </div>
      </article>)}</div>}
    </section>

    <section className="dp-share-links-explanation" aria-labelledby="share-links-reporting">
      <QrCode aria-hidden="true" /><div><h2 id="share-links-reporting">How reporting works</h2><p>Each open records the partner, placement, destination, and whether it came from the QR code or copied link. Reports can then compare lobby, room, counter, event, email, social, and website traffic without exposing a visitor’s raw identity.</p></div>
    </section>
  </section>;
}
