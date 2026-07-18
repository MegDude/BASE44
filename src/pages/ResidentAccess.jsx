import { useMemo, useState } from "react";
import { ArrowRight, Building2, CalendarDays, CheckCircle2, ChevronDown, CreditCard, Home, MapPin, QrCode, ScanLine, ShieldCheck, Sparkles } from "lucide-react";
import { resolveCheckoutTarget } from "@/config/checkoutLinks";
import {
  markLocalRecord,
} from "@/lib/productionGuards";

const RESIDENT_ACCESS_KEY = "dp_resident_access:current";
const RESIDENT_RECORDS_KEY = "dp_admin_resident_records";
const APP_HREF = "/app?mode=resident&tab=map&filter=Perks";

const INCLUDED = [
  "Resident QR card",
  "Eligible local offers",
  "Saved places",
  "Events and map",
];

const BENEFITS = [
  { title: "Perks near you", body: "See the offers your active card can unlock at participating places.", icon: ShieldCheck, href: "/app?mode=resident&tab=map&filter=Perks" },
  { title: "Events this week", body: "Find downtown events and add the ones you want to remember.", icon: CalendarDays, href: "/app?mode=resident&tab=events&filter=Events&intent=events" },
  { title: "Places to save", body: "Keep restaurants, shops, hotels, and useful local stops close.", icon: MapPin, href: "/app?mode=resident&tab=saved&filter=All" },
  { title: "Your building", body: "Connect where you live with nearby benefits and neighborhood updates.", icon: Building2, href: "/app?mode=resident&tab=map&filter=Properties&intent=properties" },
];

const PROCESS = [
  ["01", "Open your card", "Find your resident card from the map whenever you need it."],
  ["02", "Show the QR", "Present the active card at a participating place."],
  ["03", "Confirm the perk", "The partner scans your QR and confirms the available benefit."],
  ["04", "Use your benefit", "Continue with the verified offer shown for that place."],
];

const PLACES = [
  { title: "Rainey", name: "Hotel Van Zandt", body: "Find rooftop dining, live music, and hotel experiences near Rainey Street.", image: "/images/reports/hotel-van-zandt-rooftop-pool.jpg", href: "/app?mode=resident&tab=map&filter=Hotels&entityId=hotel-van-zandt" },
  { title: "Convention District", name: "Fairmont Austin", body: "Save the restaurants, wellness stops, and events connected to the Fairmont.", image: "/images/map-pins/property/fairmont-austin.jpg", href: "/app?mode=resident&tab=map&filter=Hotels&entityId=brand-fairmont-austin" },
  { title: "Rainey Residential", name: "The Shore", body: "See resident access alongside the dining, trails, and events around your building.", image: "/images/residential-content/the-shore.jpg", href: "/app?mode=resident&tab=map&filter=Properties&entityId=the-shore" },
];

const BUILDINGS = [
  "The Independent",
  "Seaholm Residences",
  "Spring Condominiums",
  "The Shore",
  "Austin Proper Residences",
  "Fifth & West",
  "44 East",
  "Milago",
  "The Waterline",
  "Four Seasons Residences",
  "My building is not listed",
];

function readRecords() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(RESIDENT_RECORDS_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeResidentAccess(record) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(RESIDENT_ACCESS_KEY, JSON.stringify(record));
  const records = readRecords().filter((item) => item.id !== record.id);
  window.localStorage.setItem(RESIDENT_RECORDS_KEY, JSON.stringify([record, ...records].slice(0, 200)));
}

function readCurrentResidentAccess() {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(window.localStorage.getItem(RESIDENT_ACCESS_KEY) || "null");
  } catch {
    return null;
  }
}

function getResidentCardCode(record) {
  const source = record?.id || record?.email || record?.fullName || "resident";
  const clean = String(source).replace(/[^a-z0-9]/gi, "").slice(-10).toUpperCase();
  return `DP-${clean || "RESIDENT"}`;
}

function getResidentMapHref(record) {
  const params = new URLSearchParams({
    mode: "resident",
    tab: "card",
    filter: "Perks",
  });

  if (record?.id) params.set("residentId", record.id);
  if (record?.verificationStatus) params.set("access", record.verificationStatus);

  return `/app?${params.toString()}`;
}

function getResidentQrSrc(record) {
  const fallbackBase = "https://base-44-h2iq.vercel.app";
  const base = typeof window === "undefined" ? fallbackBase : window.location.origin;
  const url = new URL(getResidentMapHref(record), base);
  url.searchParams.set("card", getResidentCardCode(record));
  return `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=12&data=${encodeURIComponent(url.toString())}`;
}

function toApp(record, extra = {}) {
  writeResidentAccess({ ...record, ...extra });
  const params = new URLSearchParams({
    mode: "resident",
    tab: "map",
    filter: "Perks",
    residentId: record.id,
    access: record.verificationStatus || "perks_card",
  });
  window.location.href = `/app?${params.toString()}`;
}

export default function ResidentAccess() {
  const checkoutTarget = useMemo(() => resolveCheckoutTarget("residentJoinBuildingNotMember"), []);
  const [residentCard, setResidentCard] = useState(() => readCurrentResidentAccess());
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    accessPath: "building",
    buildingName: "",
    buildingAddress: "",
    unitNumber: "",
    moveInStatus: "I live here now",
  });
  const [state, setState] = useState("idle");
  const [message, setMessage] = useState("");

  const isBuildingPath = form.accessPath === "building";
  const checkoutParams = typeof window === "undefined" ? new URLSearchParams() : new URLSearchParams(window.location.search);
  const checkoutSucceeded = checkoutParams.get("checkout") === "success";
  const checkoutCancelled = checkoutParams.get("checkout") === "cancelled";
  const visibleCard = residentCard && (state === "success" || checkoutSucceeded);
  const primaryCardHref = visibleCard ? getResidentMapHref(residentCard) : "#resident-card-access";

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setMessage("");
  }

  async function createResidentRecord() {
    const response = await fetch("/api/resident-access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, source: "resident_access_page" }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || "Resident access could not be saved.");
    const resident = payload.persisted ? payload.resident : markLocalRecord(payload.resident);
    writeResidentAccess(resident);
    return { resident, persisted: Boolean(payload.persisted) };
  }

  async function startCheckout(resident) {
    if (checkoutTarget.type === "url" && checkoutTarget.url) {
      window.location.href = checkoutTarget.url;
      return;
    }

    if (checkoutTarget.type !== "price" && checkoutTarget.type !== "product") {
      setResidentCard(resident);
      setState("error");
      setMessage("We saved your details, but checkout is not available right now. Please try again shortly.");
      return;
    }

    const response = await fetch("/api/stripe/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: checkoutTarget.mode || "subscription",
        priceId: checkoutTarget.type === "price" ? checkoutTarget.priceId : undefined,
        productId: checkoutTarget.type === "product" ? checkoutTarget.productId : undefined,
        metadata: {
          accessType: "resident",
          residentId: resident.id,
          residentEmail: resident.email,
          buildingName: resident.buildingName,
          unitNumber: resident.unitNumber,
          verificationStatus: resident.verificationStatus,
          plan: "Perks Card",
          annualTotal: "25",
        },
      }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.checkoutUrl) throw new Error(result.error || "Checkout is unavailable right now.");
    window.location.href = result.checkoutUrl;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setState("loading");
    setMessage("");

    try {
      const result = await createResidentRecord();
      const resident = result.resident;
      if (!result.persisted) {
        setResidentCard(resident);
        setState("success");
        setMessage("Your request is saved on this device and queued for review. Secure verification and checkout will open when resident account storage is available.");
        return;
      }
      if (isBuildingPath && resident.verificationStatus === "verified") {
        setResidentCard(resident);
        setState("success");
        setMessage("Building access verified. Your Downtown Perks Card is ready.");
        return;
      }

      if (isBuildingPath && resident.verificationStatus === "pending_building_review") {
        setResidentCard(resident);
        setState("success");
        setMessage("Your building request was received. You can open the map now or continue with individual Perks Card checkout.");
        return;
      }

      await startCheckout(resident);
    } catch (error) {
      setState("error");
      setMessage(error.message || "Something went wrong. Your details were not sent.");
    }
  }

  return (
    <main className="dp-resident-access-page">
      <div className="dp-resident-access-editorial">
        <section className="dp-resident-access-hero" aria-labelledby="resident-access-title">
          <div className="dp-resident-access-copy">
            <p className="dp-resident-access-eyebrow">Resident Card</p>
            <h1 id="resident-access-title">Your resident card for downtown.</h1>
            <p>Verify your building to activate the card and see eligible perks. If your building is not participating yet, choose individual access for $25 a year.</p>
            <div className="dp-resident-access-includes" aria-label="Included with resident access">
              {INCLUDED.map((item) => <span key={item}><CheckCircle2 aria-hidden="true" />{item}</span>)}
            </div>
            <div className="dp-resident-access-hero-actions">
              <a href={primaryCardHref} className="is-primary">{visibleCard ? "Open my card" : "Activate my card"}</a>
              <a href={APP_HREF}>Explore perks</a>
              <a href="#how-it-works" className="is-tertiary">See how it works</a>
            </div>
          </div>
          <section className="dp-resident-card-preview" aria-label="Downtown Perks resident card preview">
            <div className="dp-resident-card-preview-head">
              <div><p className="dp-resident-access-eyebrow">Current status</p><strong>{visibleCard ? "Resident access ready" : "Ready to activate"}</strong></div>
              <Sparkles aria-hidden="true" />
            </div>
            <div className="dp-resident-card-preview-qr">
              <img src={visibleCard ? getResidentQrSrc(residentCard) : "/images/card/perks-card-qr.png"} alt={visibleCard ? `Downtown Perks QR card for ${getResidentCardCode(residentCard)}` : "Preview of the Downtown Perks resident QR card"} width="260" height="260" />
              <span><ScanLine aria-hidden="true" />{visibleCard ? getResidentCardCode(residentCard) : "Activate to use your card"}</span>
            </div>
            <p>Partners scan this QR to confirm that your card is active and show the benefit available at that place.</p>
          </section>
        </section>

        <section className="dp-resident-editorial-section" aria-labelledby="benefits-title">
          <header><p className="dp-resident-access-eyebrow">What you can do</p><h2 id="benefits-title">Keep downtown within reach.</h2><p>Use the card with the map to find eligible perks, save places, and see what is happening nearby.</p></header>
          <div className="dp-resident-benefit-list">
            {BENEFITS.map(({ title, body, icon: Icon, href }) => <a key={title} href={href}><Icon aria-hidden="true" /><span><strong>{title}</strong><small>{body}</small></span><ArrowRight aria-hidden="true" /></a>)}
          </div>
        </section>

        <section id="how-it-works" className="dp-resident-editorial-section" aria-labelledby="process-title">
          <header><p className="dp-resident-access-eyebrow">How it works</p><h2 id="process-title">Use it in four steps.</h2><p>Open the card, show the QR, confirm the perk, and continue with the available benefit.</p></header>
          <ol className="dp-resident-process-list">
            {PROCESS.map(([number, title, body]) => <li key={number}><span>{number}</span><div><strong>{title}</strong><p>{body}</p></div></li>)}
          </ol>
        </section>

        <section className="dp-resident-editorial-section" aria-labelledby="places-title">
          <header><p className="dp-resident-access-eyebrow">Start nearby</p><h2 id="places-title">A few places to explore.</h2><p>Open a place on the resident map to see what is nearby and whether a card benefit is available.</p></header>
          <div className="dp-resident-place-grid">
            {PLACES.map((place) => <article key={place.name}><img src={place.image} alt={`${place.name} in downtown Austin`} /><p className="dp-resident-access-eyebrow">{place.title}</p><h3>{place.name}</h3><p>{place.body}</p><a href={place.href}>Explore <ArrowRight aria-hidden="true" /></a></article>)}
          </div>
        </section>

        <form id="resident-card-access" className="dp-resident-access-panel" onSubmit={handleSubmit}>
          <header className="dp-resident-access-form-header"><p className="dp-resident-access-eyebrow">Resident access</p><h2>Choose how to activate.</h2><p>Start with building verification. If your building is not participating yet, you can continue with individual access.</p></header>
          <div className="dp-resident-access-plan">
            <div>
              <p className="dp-resident-access-eyebrow">{isBuildingPath ? "Building access" : "Individual access"}</p>
              <h2>{isBuildingPath ? "Included" : "$25 / year"}</h2>
              <span>{isBuildingPath ? "Available when your building participates in Downtown Perks." : "Use the card even when your building is not participating yet."}</span>
            </div>
            <CreditCard aria-hidden="true" />
          </div>

          <fieldset>
            <legend>Choose your access path</legend>
            <div className="dp-resident-access-paths">
              <button
                type="button"
                data-active={isBuildingPath}
                aria-pressed={isBuildingPath}
                onClick={() => updateField("accessPath", "building")}
              >
                <Home aria-hidden="true" />
                <strong>Verify my building</strong>
                <span>Use your building, unit, and address.</span>
              </button>
              <button
                type="button"
                data-active={!isBuildingPath}
                aria-pressed={!isBuildingPath}
                onClick={() => updateField("accessPath", "card")}
              >
                <ShieldCheck aria-hidden="true" />
                <strong>Get Perks Card</strong>
                <span>Start with individual access.</span>
              </button>
            </div>
          </fieldset>

          <div className="dp-resident-access-fields">
            <label>
              <span>Name</span>
              <input value={form.fullName} onChange={(event) => updateField("fullName", event.target.value)} required autoComplete="name" />
            </label>
            <label>
              <span>Email</span>
              <input type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} required autoComplete="email" />
            </label>
            <label>
              <span>Phone <small>Optional</small></span>
              <input type="tel" value={form.phone} onChange={(event) => updateField("phone", event.target.value)} autoComplete="tel" />
            </label>
          </div>

          {isBuildingPath ? (
            <div className="dp-resident-access-fields">
              <label>
                <span>Building</span>
                <select value={form.buildingName} onChange={(event) => updateField("buildingName", event.target.value)} required>
                  <option value="">Choose building</option>
                  {BUILDINGS.map((building) => <option key={building} value={building}>{building}</option>)}
                </select>
              </label>
              <label>
                <span>Unit number</span>
                <input value={form.unitNumber} onChange={(event) => updateField("unitNumber", event.target.value)} required />
              </label>
              <label>
                <span>Building address</span>
                <input value={form.buildingAddress} onChange={(event) => updateField("buildingAddress", event.target.value)} placeholder="Street address" />
              </label>
              <label>
                <span>Status</span>
                <select value={form.moveInStatus} onChange={(event) => updateField("moveInStatus", event.target.value)}>
                  <option>I live here now</option>
                  <option>I am moving in soon</option>
                  <option>I am checking access for someone else</option>
                </select>
              </label>
            </div>
          ) : null}

          {message ? (
            <div className={`dp-resident-access-message is-${state}`} role={state === "error" ? "alert" : "status"} aria-live="polite">
              {message}
              {state === "success" && isBuildingPath ? (
                <button type="button" onClick={() => updateField("accessPath", "card")}>Use Perks Card path</button>
              ) : null}
            </div>
          ) : null}

          {checkoutCancelled ? (
            <div className="dp-resident-access-message" role="status">
              Checkout was cancelled. Your details are still here when you are ready to continue.
            </div>
          ) : null}

          {visibleCard ? (
            <section className="dp-resident-access-card" aria-label="Your Downtown Perks QR card">
              <div className="dp-resident-access-card-copy">
                <p className="dp-resident-access-eyebrow">Your QR Card</p>
                <h3>{residentCard.fullName || "Resident access"}</h3>
                <p>Show this code when a partner needs to scan your Downtown Perks Card.</p>
              </div>
              <div className="dp-resident-access-qr">
                <img src={getResidentQrSrc(residentCard)} alt={`Downtown Perks QR card for ${getResidentCardCode(residentCard)}`} width="220" height="220" />
                <code>{getResidentCardCode(residentCard)}</code>
              </div>
              <div className="dp-resident-access-actions">
                <a href={getResidentMapHref(residentCard)}>
                  <MapPin aria-hidden="true" />
                  Open my map
                </a>
                <button type="button" onClick={() => toApp(residentCard, { accessSource: "resident_card" })}>
                  <QrCode aria-hidden="true" />
                  Use this card
                </button>
              </div>
            </section>
          ) : null}

          <div className="dp-resident-access-actions">
            <button type="submit" disabled={state === "loading"}>
              {state === "loading" ? "Checking access…" : isBuildingPath ? "Verify and continue" : "Continue to checkout"}
              <ArrowRight aria-hidden="true" />
            </button>
            <a href={APP_HREF}>
              <MapPin aria-hidden="true" />
              Open resident map
            </a>
          </div>
        </form>

        <section className="dp-resident-editorial-section dp-resident-faq" aria-labelledby="faq-title">
          <header><p className="dp-resident-access-eyebrow">Before you activate</p><h2 id="faq-title">Resident card questions.</h2><p>What to expect from building verification, individual access, and partner scans.</p></header>
          <details><summary>How does building verification work?<ChevronDown aria-hidden="true" /></summary><p>Choose your building and provide your unit details. Active buildings may verify immediately; other requests move into review.</p></details>
          <details><summary>What happens when my building is not active?<ChevronDown aria-hidden="true" /></summary><p>You can continue with individual Perks Card access for $25 per year.</p></details>
          <details><summary>What does a partner see when scanning?<ChevronDown aria-hidden="true" /></summary><p>The QR confirms the card identifier and current access context needed for the participating benefit.</p></details>
        </section>

        <section className="dp-resident-card-final-cta" aria-label="Resident card call to action">
          <p className="dp-resident-access-eyebrow">Resident Card</p><h2>{visibleCard ? "Your card is ready." : "Start with your building."}</h2><p>{visibleCard ? "Open your QR card or return to the resident map." : "Verify where you live to see whether resident access is already included."}</p>
          <div className="dp-resident-access-hero-actions"><a href={primaryCardHref} className="is-primary">{visibleCard ? "Open my card" : "Verify my building"}</a><a href={APP_HREF}>Explore perks</a></div>
        </section>
        <footer className="dp-resident-access-footer"><span>Downtown Perks</span><nav aria-label="Resident card footer"><a href={APP_HREF}>Map</a><a href="#benefits-title">Benefits</a><a href="#faq-title">Support</a></nav></footer>
      </div>
    </main>
  );
}
