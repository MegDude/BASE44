import { forwardRef, useEffect, useRef, useState } from "react";
import {
  Bell,
  Bookmark,
  Check,
  ChevronDown,
  ExternalLink,
  Heart,
  MapPin,
  MoreHorizontal,
  Navigation,
  Share2,
  Sparkles,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const MOTION_TOKENS = [
  { name: "Enter", token: "--dp-ease-enter", value: "cubic-bezier(0, 0, 0.2, 1)", className: "is-enter" },
  { name: "Exit", token: "--dp-ease-exit", value: "cubic-bezier(0.4, 0, 1, 1)", className: "is-exit" },
  { name: "Standard", token: "--dp-ease-standard", value: "cubic-bezier(0.4, 0, 0.2, 1)", className: "is-standard" },
  { name: "Spring", token: "--dp-ease-spring", value: "cubic-bezier(0.34, 1.3, 0.64, 1)", className: "is-spring" },
];

export const DURATION_TOKENS = [
  { name: "Micro", use: "Checks and icon feedback", value: "80ms", width: "20%" },
  { name: "Fast", use: "Hover and pressed states", value: "120ms", width: "32%" },
  { name: "Standard", use: "Controls and navigation", value: "200ms", width: "50%" },
  { name: "Moderate", use: "Panels and dialogs", value: "280ms", width: "70%" },
  { name: "Slow", use: "Previews and staged entry", value: "400ms", width: "100%" },
];

export const DPButton = forwardRef(function DPButton({ variant = "primary", icon: Icon, children, className = "", ...props }, ref) {
  return (
    <button ref={ref} className={`dp-is-button dp-is-button--${variant} ${className}`.trim()} {...props}>
      {Icon ? <Icon aria-hidden="true" /> : null}
      <span>{children}</span>
    </button>
  );
});

export function MotionTokenPreview({ token }) {
  const [running, setRunning] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => () => window.clearTimeout(timeoutRef.current), []);

  function run() {
    window.clearTimeout(timeoutRef.current);
    setRunning(false);
    requestAnimationFrame(() => requestAnimationFrame(() => setRunning(true)));
    timeoutRef.current = window.setTimeout(() => setRunning(false), 900);
  }

  return (
    <button type="button" className="dp-is-motion-card" onClick={run} aria-label={`Preview ${token.name} easing`}>
      <span className="dp-is-motion-card__top">
        <strong>{token.name}</strong>
        <span>Run preview</span>
      </span>
      <span className="dp-is-motion-track" aria-hidden="true">
        <span className={`dp-is-motion-marker ${token.className} ${running ? "is-running" : ""}`} />
      </span>
      <code>{token.token}</code>
      <small>{token.value}</small>
    </button>
  );
}

export function DurationRows() {
  return (
    <div className="dp-is-duration-list">
      {DURATION_TOKENS.map((duration) => (
        <div className="dp-is-duration-row" key={duration.name}>
          <div>
            <strong>{duration.name}</strong>
            <span>{duration.use}</span>
          </div>
          <div className="dp-is-duration-meter" aria-hidden="true">
            <span style={{ "--duration-width": duration.width }} />
          </div>
          <code>{duration.value}</code>
        </div>
      ))}
    </div>
  );
}

export function TooltipIconButton({ label, icon: Icon, onClick }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button type="button" className="dp-is-icon-button" aria-label={label} onClick={onClick}>
          <Icon aria-hidden="true" />
        </button>
      </TooltipTrigger>
      <TooltipContent className="dp-is-tooltip" sideOffset={9}>{label}</TooltipContent>
    </Tooltip>
  );
}

export function EntityCard({ image, imageAlt, type, district, title, description, status, action = "Open details", onAction }) {
  return (
    <article className="dp-is-entity-card">
      <img src={image} alt={imageAlt} />
      <div className="dp-is-entity-card__body">
        <div className="dp-is-entity-card__meta"><span>{type}</span><span>{district}</span></div>
        <h3>{title}</h3>
        <p>{description}</p>
        <footer>
          <span className="dp-is-status">{status}</span>
          <button type="button" className="dp-is-text-action" onClick={onAction}>
            {action}<ExternalLink aria-hidden="true" />
          </button>
        </footer>
      </div>
    </article>
  );
}

export function InteractionStateCard({ label, value, description, state = "default" }) {
  return (
    <button type="button" className={`dp-is-state-card is-${state}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{description}</small>
    </button>
  );
}

const preferenceOptions = [
  ["Food + drink", "Resident perks and nearby openings"],
  ["Arts + culture", "Exhibitions, performances, and public art"],
  ["Parks + wellness", "Outdoor routes and wellbeing events"],
  ["Local shopping", "Independent retailers and useful services"],
];

export function ResidentPreferenceForm({ onSaved }) {
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  function submit(event) {
    event.preventDefault();
    setSaving(true);
    setStatus("");
    window.setTimeout(() => {
      setSaving(false);
      setStatus("Preferences saved.");
      onSaved?.("Your resident map preferences were updated.");
    }, 550);
  }

  return (
    <form className="dp-is-form" onSubmit={submit}>
      <div className="dp-is-form-grid">
        <label className="dp-is-field">
          <span>Home district</span>
          <select defaultValue="rainey">
            <option value="rainey">Rainey Street</option>
            <option value="seaholm">Seaholm</option>
            <option value="waterloo">Waterloo</option>
            <option value="congress">Congress Avenue</option>
          </select>
        </label>
        <label className="dp-is-field">
          <span>Typical outing</span>
          <select defaultValue="walk">
            <option value="walk">Walkable, under 20 minutes</option>
            <option value="bike">Bike-friendly route</option>
            <option value="transit">Transit-connected</option>
            <option value="any">Show every option</option>
          </select>
        </label>
      </div>

      <fieldset>
        <legend>What should Downtown Perks prioritize?</legend>
        <div className="dp-is-choice-grid">
          {preferenceOptions.map(([label, detail], index) => (
            <label className="dp-is-checkbox-row" key={label}>
              <input type="checkbox" defaultChecked={index < 2} />
              <span className="dp-is-checkbox-ui" aria-hidden="true"><Check /></span>
              <span><strong>{label}</strong><small>{detail}</small></span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="dp-is-toggle-list">
        <PreferenceToggle icon={Bell} title="Nearby perk alerts" detail="Notify me when a saved place publishes a resident offer." defaultChecked />
        <PreferenceToggle icon={Sparkles} title="Weekly downtown edit" detail="A concise Friday shortlist based on my saved interests." />
      </div>

      <div className="dp-is-form-actions">
        <p role="status">{status}</p>
        <DPButton type="submit" variant="primary" disabled={saving}>{saving ? "Saving…" : "Save preferences"}</DPButton>
      </div>
    </form>
  );
}

function PreferenceToggle({ icon: Icon, title, detail, defaultChecked = false }) {
  return (
    <label className="dp-is-toggle-row">
      <span className="dp-is-toggle-copy"><Icon aria-hidden="true" /><span><strong>{title}</strong><small>{detail}</small></span></span>
      <span className="dp-is-switch">
        <input type="checkbox" defaultChecked={defaultChecked} />
        <span className="dp-is-switch__track" aria-hidden="true"><span /></span>
      </span>
    </label>
  );
}

const navPanels = {
  map: ["Resident view", "Map", "Explore venues, properties, events, services, and resident benefits across downtown Austin."],
  perks: ["Resident benefits", "Perks", "Review active offers, redemption terms, partner details, and benefits available nearby."],
  events: ["Downtown calendar", "Events", "Find live music, public programs, neighborhood gatherings, and partner-led experiences."],
  saved: ["Personal collection", "Saved", "Return to saved places, upcoming events, walking routes, and perks you plan to use later."],
};

export function SegmentedNavigation() {
  const [active, setActive] = useState("map");
  const [eyebrow, title, body] = navPanels[active];
  return (
    <div className="dp-is-nav-demo">
      <div className="dp-is-segmented-nav" role="tablist" aria-label="Resident product areas">
        {Object.keys(navPanels).map((key) => (
          <button key={key} type="button" role="tab" aria-selected={active === key} className={active === key ? "is-active" : ""} onClick={() => setActive(key)}>
            {navPanels[key][1]}
          </button>
        ))}
      </div>
      <div className="dp-is-nav-panel" role="tabpanel" key={active}>
        <span>{eyebrow}</span><h3>{title}</h3><p>{body}</p>
      </div>
    </div>
  );
}

export function ActionDropdown({ onAction }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className="dp-is-button dp-is-button--outline dp-is-dropdown-trigger">
          Place actions <ChevronDown aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" sideOffset={8} className="dp-is-dropdown-content">
        <DropdownMenuItem onSelect={() => onAction?.("Directions opened for The Stay Put.")}><Navigation />Get directions</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onAction?.("The Stay Put was added to Saved.")}><Bookmark />Save place</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onAction?.("Share link copied.")}><Share2 />Share place</DropdownMenuItem>
        <DropdownMenuSeparator className="dp-is-dropdown-separator" />
        <DropdownMenuItem className="dp-is-dropdown-danger" onSelect={() => onAction?.("Listing issue report started.")}>Report an issue</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function RedemptionDialog({ onRedeemed }) {
  return (
    <Dialog>
      <DialogTrigger asChild><DPButton variant="gold">Preview redemption</DPButton></DialogTrigger>
      <DialogContent className="dp-is-dialog">
        <span className="dp-is-dialog__eyebrow dp-eyebrow text-[11px] font-bold uppercase tracking-[0.15em]">Resident perk</span>
        <DialogTitle>Redeem your Stay Put welcome drink?</DialogTitle>
        <DialogDescription>Confirm this with a team member at the venue. The perk can be redeemed once per resident account.</DialogDescription>
        <dl className="dp-is-redemption-summary">
          <div><dt>Partner</dt><dd>The Stay Put</dd></div>
          <div><dt>Benefit</dt><dd>Complimentary welcome drink</dd></div>
          <div><dt>Valid</dt><dd>Today, during service hours</dd></div>
        </dl>
        <div className="dp-is-dialog__actions">
          <DialogClose asChild><DPButton variant="quiet">Not yet</DPButton></DialogClose>
          <DialogClose asChild><DPButton variant="primary" onClick={() => onRedeemed?.("Perk redeemed. Your resident activity was updated.")}>Confirm redemption</DPButton></DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ToastRegion({ message }) {
  return <div className="dp-is-toast-region" aria-live="polite" aria-atomic="true">{message ? <div className="dp-is-toast">{message}</div> : null}</div>;
}

export { Bell, Bookmark, Heart, MapPin, MoreHorizontal, Navigation, Share2, TooltipProvider };
