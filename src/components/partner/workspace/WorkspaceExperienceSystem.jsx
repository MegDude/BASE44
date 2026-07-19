import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, MoveDown, MoveUp, X } from "lucide-react";
import { Link } from "react-router-dom";
import { MapSurveyPrompt } from "@/components/map/MapSurveyModule";
import { useWorkspaceSheet } from "@/components/partner/workspace/WorkspaceSheetSystem";
import {
  EXPERIENCE_BUILDER_STEPS,
  EXPERIENCE_API_CONTRACT,
  EXPERIENCE_TEMPLATES,
  buildExperiencePublishRequest,
  createExperienceDraft,
} from "@/lib/experiences/experienceSystem";
import { withPartnerWorkspaceContext } from "@/lib/partnerWorkspaceContext";

const GOALS = [
  ["visit_place", "Visit a place"], ["use_offer", "Use an offer"], ["view_listing", "View a listing"],
  ["request_showing", "Request a showing"], ["join_event", "Join an event"], ["explore_building", "Explore a building"],
  ["use_amenity", "Use an amenity"], ["follow_route", "Follow a route"], ["answer_questions", "Answer questions"],
  ["contact_team", "Contact the team"], ["save_collection", "Save a collection"],
];

const AUDIENCES = ["Public users", "Residents", "Verified residents", "Building residents", "Hotel guests", "Visitors", "Nearby workers", "Event attendees", "Prior redeemers", "Listing prospects"];
const PLACEMENTS = [["map", "Map"], ["resident_home", "Resident Home"], ["perks", "Perks"], ["events", "Events"], ["listings", "Listings"], ["building_page", "Building page"], ["partner_page", "Partner page"], ["route", "Route"], ["collection", "Collection"], ["qr", "QR"], ["shared_link", "Shared link"], ["broadcast", "Broadcast"]];
const INTERACTIONS = [["entity_saved", "Save"], ["share_tapped", "Share"], ["directions_tapped", "Directions"], ["event_rsvp_completed", "RSVP"], ["perk_redeemed", "Redeem"], ["survey_completed", "Answer"], ["route_completed", "Complete route"], ["showing_requested", "Request showing"], ["campaign_result_completed", "Complete primary action"]];

function toggleValue(values, value) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

function BuilderChoiceList({ legend, options, selected, onToggle, single = false }) {
  return <fieldset className="dp-experience-builder__choices"><legend>{legend}</legend>{options.map(([value, label]) => {
    const active = selected.includes(value);
    return <label key={value}><input type={single ? "radio" : "checkbox"} checked={active} onChange={() => onToggle(value)} /><span><strong>{label}</strong>{active ? <Check aria-hidden="true" /> : null}</span></label>;
  })}</fieldset>;
}

function ExperienceBuilder({ template, organizationId }) {
  const { closeSheet } = useWorkspaceSheet();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState(() => createExperienceDraft(template, organizationId));
  const [publishState, setPublishState] = useState("idle");
  const [publishMessage, setPublishMessage] = useState("");
  const update = (patch) => setDraft((current) => ({ ...current, ...patch }));
  const moveContent = (index, direction) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= draft.content.length) return;
    const next = [...draft.content];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    update({ content: next });
  };

  const publish = async () => {
    setPublishState("publishing");
    setPublishMessage("");
    try {
      const response = await fetch(EXPERIENCE_API_CONTRACT.publish, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildExperiencePublishRequest(draft)),
      });
      if (!response.ok) throw new Error("publish unavailable");
      setPublishState("published");
      setPublishMessage("Published. The experience is ready for its configured placements.");
    } catch {
      setPublishState("error");
      setPublishMessage("Publishing is unavailable. Nothing was sent, and this draft remains open in this session.");
    }
  };

  let content = null;
  if (step === 0) content = <BuilderChoiceList legend="What should people do?" options={GOALS} selected={[draft.goal]} single onToggle={(goal) => update({ goal })} />;
  if (step === 1) content = <div className="dp-experience-builder__type"><p>Experience type</p><strong>{template.label}</strong><span>{template.description}</span></div>;
  if (step === 2) content = <section className="dp-experience-builder__content" aria-labelledby="experience-content-title"><h3 id="experience-content-title">Content order</h3>{draft.content.map((item, index) => <div key={item}><span><small>{String(index + 1).padStart(2, "0")}</small><strong>{item}</strong></span><span><button type="button" onClick={() => moveContent(index, -1)} disabled={index === 0} aria-label={`Move ${item} up`}><MoveUp aria-hidden="true" /></button><button type="button" onClick={() => moveContent(index, 1)} disabled={index === draft.content.length - 1} aria-label={`Move ${item} down`}><MoveDown aria-hidden="true" /></button></span></div>)}</section>;
  if (step === 3) content = <BuilderChoiceList legend="Who should see it?" options={AUDIENCES.map((item) => [item, item])} selected={draft.audience} onToggle={(value) => update({ audience: toggleValue(draft.audience, value) })} />;
  if (step === 4) content = <BuilderChoiceList legend="Where should people see it?" options={PLACEMENTS} selected={draft.placements} onToggle={(value) => update({ placements: toggleValue(draft.placements, value) })} />;
  if (step === 5) content = <BuilderChoiceList legend="What can people do?" options={INTERACTIONS} selected={draft.interactions} onToggle={(value) => update({ interactions: toggleValue(draft.interactions, value) })} />;
  if (step === 6) content = <fieldset className="dp-experience-builder__fields"><legend>When is it available?</legend><label><span>Start</span><input type="date" value={draft.timing.start} onChange={(event) => update({ timing: { ...draft.timing, start: event.target.value } })} /></label><label><span>End</span><input type="date" value={draft.timing.end} onChange={(event) => update({ timing: { ...draft.timing, end: event.target.value } })} /></label><label><span>Recurrence</span><input value={draft.timing.recurrence} placeholder="Optional, such as Sundays" onChange={(event) => update({ timing: { ...draft.timing, recurrence: event.target.value } })} /></label></fieldset>;
  if (step === 7) content = <BuilderChoiceList legend="Choose one primary result" options={INTERACTIONS} selected={[draft.primaryResult]} single onToggle={(primaryResult) => update({ primaryResult })} />;
  if (step === 8) content = template.type === "survey" ? <MapSurveyPrompt preview survey={{ id: template.id, eyebrow: "Optional question", title: draft.title, question: { id: "preview-question", label: "What would make this experience more useful?", options: ["Better nearby choices", "Clearer directions", "A resident perk", "More event details"] } }} /> : <section className="dp-experience-preview"><p>Map preview</p><h3>{draft.title}</h3><span>{template.description}</span><dl><div><dt>Who sees it</dt><dd>{draft.audience.join(", ") || "Not selected"}</dd></div><div><dt>Places shown</dt><dd>{draft.placements.length}</dd></div><div><dt>Main result</dt><dd>{draft.primaryResult.replaceAll("_", " ")}</dd></div></dl></section>;
  if (step === 9) content = <section className="dp-experience-publish"><p>Ready to publish</p><h3>{draft.title}</h3><ul><li><span>Goal</span><strong>{draft.goal.replaceAll("_", " ")}</strong></li><li><span>Sections</span><strong>{draft.content.length}</strong></li><li><span>Places shown</span><strong>{draft.placements.length}</strong></li><li><span>Main result</span><strong>{draft.primaryResult.replaceAll("_", " ")}</strong></li></ul><button type="button" onClick={publish} disabled={publishState === "publishing"}>{publishState === "publishing" ? "Publishing…" : "Publish experience"}</button>{publishMessage ? <p role="status" className={`dp-experience-publish__status is-${publishState}`}>{publishMessage}</p> : null}</section>;

  return <div className="dp-experience-builder"><nav aria-label="Experience builder progress"><ol>{EXPERIENCE_BUILDER_STEPS.map((label, index) => <li key={label} aria-current={index === step ? "step" : undefined} data-complete={index < step ? "true" : "false"}><button type="button" onClick={() => setStep(index)}><span>{index < step ? <Check aria-hidden="true" /> : index + 1}</span><strong>{label}</strong></button></li>)}</ol></nav><div className="dp-experience-builder__stage"><header><p>Step {step + 1} of {EXPERIENCE_BUILDER_STEPS.length}</p><h2>{EXPERIENCE_BUILDER_STEPS[step]}</h2></header>{content}<footer><button type="button" onClick={() => step > 0 ? setStep((current) => current - 1) : closeSheet()}><ChevronLeft aria-hidden="true" />Back</button><button type="button" onClick={closeSheet} aria-label="Close experience builder"><X aria-hidden="true" />Close</button>{step < EXPERIENCE_BUILDER_STEPS.length - 1 ? <button type="button" onClick={() => setStep((current) => Math.min(EXPERIENCE_BUILDER_STEPS.length - 1, current + 1))}>Next<ChevronRight aria-hidden="true" /></button> : null}</footer></div></div>;
}

export function WorkspaceExperienceSystem({ organizationId, view = "campaigns" }) {
  const { openSheet } = useWorkspaceSheet();
  const firstTemplateButtonRef = useRef(null);
  const surveyOnly = view === "surveys";
  const templates = useMemo(() => surveyOnly ? EXPERIENCE_TEMPLATES.filter((item) => item.type === "survey") : EXPERIENCE_TEMPLATES, [surveyOnly]);
  const groups = useMemo(() => [...new Set(templates.map((item) => item.group))], [templates]);
  const [activeGroup, setActiveGroup] = useState(groups[0]);
  const visible = templates.filter((item) => item.group === activeGroup);
  const start = (template) => openSheet({ eyebrow: surveyOnly ? "Survey" : "Experience", title: template.label, state: "full", content: <ExperienceBuilder template={template} organizationId={organizationId} /> });
  const defaultTemplate = visible[0] || templates[0];
  const startDefaultTemplate = () => firstTemplateButtonRef.current?.click();

  return <motion.section className="dp-workspace-experiences" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} aria-labelledby="workspace-experiences-title">
    <header className="dp-workspace-experiences__header"><p>{surveyOnly ? "Surveys" : "Experiences"}</p><h1 id="workspace-experiences-title">{surveyOnly ? "Ask one useful question" : "Create one useful experience"}</h1><span>{surveyOnly ? "Questions can appear on the map, after an action, along a route, or through a shared link without requiring QR." : "Choose what people see, who should see it, where it appears, and the result you want."}</span><button type="button" disabled={!defaultTemplate} onPointerUp={(event) => { event.preventDefault(); startDefaultTemplate(); }} onClick={(event) => { if (event.detail === 0) startDefaultTemplate(); }}>{surveyOnly ? "Create survey" : "Create experience"}</button></header>
    <section className="dp-workspace-experiences__flow" aria-labelledby="experience-flow-title"><h2 id="experience-flow-title">How publishing works</h2><ol>{["Goal", "Content", "Where shown", "Action", "Result"].map((item, index) => <li key={item}><span>{String(index + 1).padStart(2, "0")}</span><strong>{item}</strong></li>)}</ol></section>
    <section className="dp-workspace-experiences__library" aria-labelledby="experience-library-title"><header><div><p>Starting points</p><h2 id="experience-library-title">Choose a useful structure</h2></div></header>{groups.length > 1 ? <div className="dp-workspace-experiences__tabs" role="tablist" aria-label="Experience groups">{groups.map((group) => <button key={group} type="button" role="tab" aria-selected={group === activeGroup} onClick={() => setActiveGroup(group)}>{group}</button>)}</div> : null}<div className="dp-workspace-experiences__rows">{visible.map((template, index) => <button ref={index === 0 ? firstTemplateButtonRef : undefined} type="button" key={template.id} onClick={() => start(template)}><span><strong>{template.label}</strong><small>{template.description}</small><em>{template.content.length} sections · shown in {template.placements.length} places</em></span><ChevronRight aria-hidden="true" /></button>)}</div></section>
    {surveyOnly ? <aside className="dp-workspace-experiences__integration"><div><h2>Where answers are saved</h2><p>Answers save to Downtown Perks first. You can also copy them to Google Sheets without interrupting a resident response.</p></div><Link to={withPartnerWorkspaceContext("/partner-workspace/sources?section=google-sheets", organizationId)}>Review Google Sheets</Link></aside> : null}
  </motion.section>;
}

export default WorkspaceExperienceSystem;
