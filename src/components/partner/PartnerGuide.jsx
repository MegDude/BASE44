import { ChevronDown, ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { readPartnerWorkspaceOrganizationId, withPartnerWorkspaceContext } from "@/lib/partnerWorkspaceContext";

const TOOLS = [
  ["profile", "Profile", "What residents see about your organization", "Published", "/partner-workspace/profile"],
  ["map", "Map", "Where your places appear", "Connected", "/map?mode=partner&tab=map&filter=All"],
  ["publish", "Publish", "Offers, events, campaigns, and messages", "1 recommendation", "/partner-workspace/offers"],
  ["performance", "Performance", "Opens, saves, scans, directions, and use", "Live", "/partner-workspace/analytics"],
  ["audience", "Audience", "People and groups you can reach", "Signals available", "/partner-workspace/audience"],
  ["media", "Photos and files", "Images and documents used in your public pages", "Needs review", "/partner-workspace/media"],
  ["account", "Account", "Team, membership, billing, and settings", "Active", "/partner-workspace/profile?section=account"],
];

const STEPS = [
  ["Publish something useful", "Create an offer, event, or campaign around one clear action."],
  ["Reach people nearby", "Your content can appear on the map, in resident views, and through QR codes."],
  ["See what happened", "Review opens, saves, directions, scans, RSVPs, and redemptions."],
];

const FAQ = [
  ["How do campaigns work?", "Choose one place, one audience, and one action. Publish to the map or resident views, then review the results."],
  ["How are scans counted?", "Each scan stays linked to its QR code and destination. Reports show when it happened and what followed."],
  ["Where do QR codes open?", "Each code opens a specific place, offer, event, route, campaign, or resident experience."],
];

export default function PartnerGuide() {
  const location = useLocation();
  const organizationId = readPartnerWorkspaceOrganizationId(location.search);
  const route = (href) => withPartnerWorkspaceContext(href, organizationId);
  return (
    <div className="dp-tabs-content dp-partner-readable-panel dp-partner-info-panel dp-shared-info-panel is-partner dp-partner-guide-native">
      <div className="dp-tab-stack">
        <section className="dp-partner-guide-hero"><h2>Run your downtown presence from one place.</h2><p>Keep your profile current, publish what matters, and see what people do next.</p><Link to={route("/partner-workspace/overview")}>Open workspace</Link></section>
        <section className="dp-partner-guide-next"><p>Start here</p><h3>Launch one clear campaign</h3><span>Choose one place, one audience, and one action.</span><Link to={route("/partner-workspace/campaigns?intent=new")}>Create campaign</Link></section>
        <section className="dp-partner-guide-tools" aria-labelledby="dp-partner-guide-tools-title"><header><h3 id="dp-partner-guide-tools-title">Workspace tools</h3><p>Everything you need to publish, manage, and measure your downtown presence.</p></header><nav aria-label="Workspace tools">{TOOLS.map(([id,label,description,status,href])=><Link key={id} to={route(href)}><span><strong>{label}</strong><small>{description}</small></span><span><em>{status}</em><ChevronRight aria-hidden="true" /></span></Link>)}</nav></section>
        <section className="dp-partner-guide-how" aria-labelledby="dp-partner-guide-how-title"><h3 id="dp-partner-guide-how-title">How it works</h3><ol>{STEPS.map(([title,description],index)=><li key={title}><b>{String(index+1).padStart(2,"0")}</b><span><strong>{title}</strong><small>{description}</small></span></li>)}</ol></section>
        <section className="dp-info-guide-faq dp-partner-guide-faq" aria-labelledby="dp-partner-guide-faq-title"><h3 id="dp-partner-guide-faq-title">Common questions</h3>{FAQ.map(([question,answer],index)=><details key={question} open={index===0}><summary><span>{question}</span><ChevronDown aria-hidden="true" /></summary><p>{answer}</p></details>)}</section>
        <section className="dp-partner-guide-support" aria-labelledby="dp-partner-guide-support-title"><h3 id="dp-partner-guide-support-title">Need help?</h3><p>Get help with setup, publishing, or reports.</p><Link className="is-primary" to={route("/partner-workspace/sources?section=support")}>Open support & connections</Link><Link className="is-secondary" to="/partners">Open partner documentation</Link></section>
      </div>
    </div>
  );
}
