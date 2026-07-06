import { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, CreditCard, Home, MapPin, ShieldCheck } from "lucide-react";
import { resolveCheckoutTarget } from "@/config/checkoutLinks";

const RESIDENT_ACCESS_KEY = "dp_resident_access:current";
const RESIDENT_RECORDS_KEY = "dp_admin_resident_records";
const APP_HREF = "/app?mode=resident&tab=pass&filter=Perks";

const INCLUDED = [
  "Perks Card",
  "Saved places",
  "Local offers",
  "Events",
  "Map",
  "Instant deals",
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

function toApp(record, extra = {}) {
  writeResidentAccess({ ...record, ...extra });
  const params = new URLSearchParams({
    mode: "resident",
    tab: "pass",
    filter: "Perks",
    residentId: record.id,
    access: record.verificationStatus || "perks_card",
  });
  window.location.href = `/app?${params.toString()}`;
}

export default function ResidentAccess() {
  const checkoutTarget = useMemo(() => resolveCheckoutTarget("residentJoinBuildingNotMember"), []);
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
    writeResidentAccess(payload.resident);
    return payload.resident;
  }

  async function startCheckout(resident) {
    if (checkoutTarget.type === "url" && checkoutTarget.url) {
      window.location.href = checkoutTarget.url;
      return;
    }

    if (checkoutTarget.type !== "price" && checkoutTarget.type !== "product") {
      toApp(resident, { paymentStatus: "saved_without_stripe" });
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
    if (!response.ok || !result.checkoutUrl) throw new Error(result.error || "Checkout is not connected yet.");
    window.location.href = result.checkoutUrl;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setState("loading");
    setMessage("");

    try {
      const resident = await createResidentRecord();
      if (isBuildingPath && resident.verificationStatus === "verified") {
        setState("success");
        setMessage("Building access verified. Opening your card now.");
        window.setTimeout(() => toApp(resident, { accessSource: "building" }), 450);
        return;
      }

      if (isBuildingPath && resident.verificationStatus === "pending_building_review") {
        setState("success");
        setMessage("We saved your building request. You can use the Perks Card path now, or open the app while admin reviews your building.");
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
      <section className="dp-resident-access-shell" aria-labelledby="resident-access-title">
        <div className="dp-resident-access-copy">
          <p className="dp-resident-access-eyebrow">Resident Access</p>
          <h1 id="resident-access-title">Get your Downtown Perks Card.</h1>
          <p>
            Use one card to open local perks, saved places, events, the map, and instant deals. If your building is already part of Downtown Perks, verify your unit. If not, get individual access for $25/year.
          </p>
          <div className="dp-resident-access-includes" aria-label="Included with resident access">
            {INCLUDED.map((item) => (
              <span key={item}><CheckCircle2 aria-hidden="true" />{item}</span>
            ))}
          </div>
        </div>

        <form className="dp-resident-access-panel" onSubmit={handleSubmit}>
          <div className="dp-resident-access-plan">
            <div>
              <p className="dp-resident-access-eyebrow">Perks Card</p>
              <h2>$25/year</h2>
              <span>Individual access when your building is not active yet.</span>
            </div>
            <CreditCard aria-hidden="true" />
          </div>

          <fieldset>
            <legend>Choose your access path</legend>
            <div className="dp-resident-access-paths">
              <button type="button" data-active={isBuildingPath} onClick={() => updateField("accessPath", "building")}>
                <Home aria-hidden="true" />
                <strong>Verify my building</strong>
                <span>Use your building, unit, and address.</span>
              </button>
              <button type="button" data-active={!isBuildingPath} onClick={() => updateField("accessPath", "card")}>
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
              <span>Phone</span>
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
            <div className={`dp-resident-access-message is-${state}`} role="status">
              {message}
              {state === "success" && isBuildingPath ? (
                <button type="button" onClick={() => updateField("accessPath", "card")}>Use Perks Card path</button>
              ) : null}
            </div>
          ) : null}

          <div className="dp-resident-access-actions">
            <button type="submit" disabled={state === "loading"}>
              {state === "loading" ? "Checking access" : isBuildingPath ? "Verify and Continue" : "Continue to Checkout"}
              <ArrowRight aria-hidden="true" />
            </button>
            <a href={APP_HREF}>
              <MapPin aria-hidden="true" />
              Open App
            </a>
          </div>
        </form>
      </section>
    </main>
  );
}
