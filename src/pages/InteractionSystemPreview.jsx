import { useEffect, useRef, useState } from "react";
import {
  ActionDropdown,
  Bell,
  Bookmark,
  DPButton,
  DurationRows,
  EntityCard,
  Heart,
  InteractionStateCard,
  MOTION_TOKENS,
  MapPin,
  MoreHorizontal,
  MotionTokenPreview,
  Navigation,
  RedemptionDialog,
  ResidentPreferenceForm,
  SegmentedNavigation,
  Share2,
  ToastRegion,
  TooltipIconButton,
  TooltipProvider,
} from "@/components/interaction-system/DowntownPerksInteractionSystem";
import "@/styles/interaction-system-preview.css";

const sections = [
  ["motion", "Motion"], ["actions", "Actions"], ["entities", "Entities"],
  ["states", "States"], ["preferences", "Preferences"], ["navigation", "Navigation"], ["feedback", "Feedback"],
];

const entities = [
  { image: "/images/map/entities/stay-put-rainey-patio.jpg", imageAlt: "The Stay Put patio on Rainey Street", type: "Resident perk", district: "Rainey", title: "The Stay Put", description: "A resident welcome offer at a neighborhood bar built into the Rainey Street map journey.", status: "Perk available", action: "View perk" },
  { image: "/images/reports/alexan-waterloo.jpg", imageAlt: "Alexan Waterloo residential building", type: "Resident property", district: "Waterloo", title: "Alexan Waterloo", description: "Building access, saved nearby places, and useful resident benefits in one local view.", status: "Resident access", action: "View building" },
  { image: "/images/legends-listings/83dcefb7.jpeg", imageAlt: "Downtown Austin home represented by Legends Real Estate", type: "Property partner", district: "Downtown", title: "Legends Real Estate", description: "Downtown listings connected to neighborhood context, local places, and discovery routes.", status: "Partner verified", action: "View partner" },
];

export default function InteractionSystemPreview() {
  const [toast, setToast] = useState("");
  const timerRef = useRef(null);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  function showToast(message) {
    window.clearTimeout(timerRef.current);
    setToast(message);
    timerRef.current = window.setTimeout(() => setToast(""), 3200);
  }

  return (
    <TooltipProvider delayDuration={250}>
      <main className="dp-is-page">
        <header className="dp-is-hero">
          <div className="dp-is-hero__rail">
            <a className="dp-is-wordmark" href="/map?mode=resident&tab=map&filter=All">DOWNTOWN <span>PERKS</span></a>
            <nav aria-label="Interaction system sections">
              {sections.map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}
            </nav>
          </div>
          <div className="dp-is-hero__content">
            <p className="dp-is-eyebrow">Downtown Perks product system</p>
            <h1>Interaction patterns for <strong>real downtown moments.</strong></h1>
            <p>Reusable motion, actions, preferences, navigation, and feedback for resident and partner workflows—built with restrained movement and accessible behavior.</p>
            <div className="dp-is-hero__actions">
              <DPButton variant="primary" onClick={() => document.getElementById("motion")?.scrollIntoView({ behavior: "smooth" })}>Explore the system</DPButton>
              <DPButton variant="outline" onClick={() => document.getElementById("preferences")?.scrollIntoView({ behavior: "smooth" })}>Try resident controls</DPButton>
            </div>
          </div>
          <div className="dp-is-hero__spec" aria-label="System principles">
            <span>01</span><strong>Calm by default</strong><p>Movement clarifies state without competing with the map or the moment.</p>
            <span>02</span><strong>Keyboard ready</strong><p>Focus, menus, dialogs, and controls stay useful without a pointer.</p>
            <span>03</span><strong>Product specific</strong><p>Every specimen maps to a resident or partner action already in Downtown Perks.</p>
          </div>
        </header>

        <SystemSection id="motion" number="01" eyebrow="Foundation" title="Motion tokens" intro="Four easing curves and five durations cover everything from an icon check to a full dialog transition.">
          <div className="dp-is-motion-grid">{MOTION_TOKENS.map((token) => <MotionTokenPreview token={token} key={token.name} />)}</div>
          <DurationRows />
        </SystemSection>

        <SystemSection id="actions" number="02" eyebrow="Controls" title="Buttons, icons, and tooltips" intro="Rectangular controls use clear hierarchy, restrained elevation, and compact feedback for map and redemption actions.">
          <div className="dp-is-component-panel">
            <div className="dp-is-button-row">
              <DPButton variant="primary" icon={Navigation} onClick={() => showToast("Directions opened.")}>Get directions</DPButton>
              <DPButton variant="gold" icon={Bookmark} onClick={() => showToast("Place saved.")}>Save place</DPButton>
              <DPButton variant="outline" icon={MapPin} onClick={() => showToast("Place opened on the map.")}>View on map</DPButton>
              <DPButton variant="quiet" onClick={() => showToast("Button guidance opened.")}>Compare button styles</DPButton>
            </div>
            <div className="dp-is-icon-row">
              <span>Compact actions</span>
              <TooltipIconButton label="Save place" icon={Bookmark} onClick={() => showToast("Place saved.")} />
              <TooltipIconButton label="Add to favorites" icon={Heart} onClick={() => showToast("Added to favorites.")} />
              <TooltipIconButton label="Share place" icon={Share2} onClick={() => showToast("Share link copied.")} />
              <TooltipIconButton label="Notification settings" icon={Bell} onClick={() => showToast("Notification settings opened.")} />
              <TooltipIconButton label="More actions" icon={MoreHorizontal} onClick={() => showToast("More actions opened.")} />
            </div>
          </div>
        </SystemSection>

        <SystemSection id="entities" number="03" eyebrow="Content" title="Downtown entities" intro="Cards connect real product data to resident intent: use a perk, understand a building, or open a trusted partner.">
          <div className="dp-is-entity-grid">{entities.map((entity) => <EntityCard key={entity.title} {...entity} onAction={() => showToast(`${entity.title} opened.`)} />)}</div>
        </SystemSection>

        <SystemSection id="states" number="04" eyebrow="Behavior" title="Interaction states" intro="The same surface language carries hover, pressed, and keyboard focus states across the resident experience.">
          <div className="dp-is-state-grid">
            <InteractionStateCard label="Resting" value="Default" description="Thin border, bright surface, and no unnecessary elevation." />
            <InteractionStateCard label="Pointer" value="Hover" description="A two-pixel lift and stronger border confirm interactivity." state="hover" />
            <InteractionStateCard label="Keyboard" value="Focus" description="A gold focus ring remains visible against every surface." state="focus" />
          </div>
        </SystemSection>

        <SystemSection id="preferences" number="05" eyebrow="Resident settings" title="Map preferences" intro="A complete form specimen for district, outing style, interests, and resident notifications.">
          <ResidentPreferenceForm onSaved={showToast} />
        </SystemSection>

        <SystemSection id="navigation" number="06" eyebrow="Wayfinding" title="Product navigation" intro="Segmented navigation changes content in place while preserving a clear active state and readable information hierarchy.">
          <SegmentedNavigation />
        </SystemSection>

        <SystemSection id="feedback" number="07" eyebrow="Actions + outcomes" title="Menus, redemption, and toast feedback" intro="Layered actions announce outcomes, restore focus, and close predictably with the keyboard.">
          <div className="dp-is-feedback-panel">
            <div><span className="dp-is-feedback-panel__label">Place menu</span><h3>Act without leaving context.</h3><p>Open the menu with a pointer or keyboard, move through actions, and receive immediate confirmation.</p><ActionDropdown onAction={showToast} /></div>
            <div><span className="dp-is-feedback-panel__label">Perk flow</span><h3>Confirm the moment that matters.</h3><p>The redemption dialog traps focus, supports Escape, restores focus, and announces the result.</p><RedemptionDialog onRedeemed={showToast} /></div>
          </div>
        </SystemSection>

        <footer className="dp-is-page-footer"><span>Downtown Perks</span><p>Interaction System · Resident and partner product reference</p><a href="#top" onClick={(event) => { event.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Back to top</a></footer>
      </main>
      <ToastRegion message={toast} />
    </TooltipProvider>
  );
}

function SystemSection({ id, number, eyebrow, title, intro, children }) {
  return (
    <section className="dp-is-section" id={id}>
      <div className="dp-is-section__heading"><span>{number}</span><div><p>{eyebrow}</p><h2>{title}</h2></div><p>{intro}</p></div>
      {children}
    </section>
  );
}
