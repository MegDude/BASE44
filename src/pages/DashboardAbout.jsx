import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MapPinned, PlayCircle, Send, Sparkles } from "lucide-react";
import { LEGENDS_IMPORTED_PROPERTIES, LEGENDS_IMPORT_SUMMARY } from "@/data/legendsImportData";

const LEGENDS_LOGO =
  "https://media.base44.com/images/public/69d94e4f5b7886cf42a2cf62/59a2b6b9d_legends-logocopy.png";

const DASHBOARD_LINKS = [
  { label: "Overview", href: "/partners/dashboard" },
  { label: "Map", href: "/partners/dashboard/map" },
  { label: "Partner", href: "/partners/dashboard/residential" },
  { label: "Redemptions", href: "/partners/dashboard/redemptions" },
  { label: "Integrations", href: "/partners/dashboard/integrations" },
  { label: "About", href: "/partner-workspace" },
];

const HOW_IT_WORKS_STEPS = [
  {
    title: "Connect your property",
    kicker: "Step 1 of 4",
    body:
      "We connect the property profile, the building entry points, and the surrounding neighborhood layer in one setup. No separate app, no separate map, and no extra resident system to explain.",
    outcome:
      "The building appears inside the live downtown layer right away, with nearby places, events, and perks already tied to it.",
  },
  {
    title: "People find their way in",
    kicker: "Step 2 of 4",
    body:
      "Residents, guests, and prospects can enter through QR, building links, card prompts, or map discovery. They stay inside one working experience instead of jumping across separate sign-up flows.",
    outcome:
      "People understand the system faster because the path in feels obvious and local.",
  },
  {
    title: "The neighborhood becomes visible",
    kicker: "Step 3 of 4",
    body:
      "Coffee, dinner, perks, events, and daily anchors show up around the building in real time. Context stops being a pitch and starts behaving like something people can actually use.",
    outcome:
      "The value of living there is visible at the same moment someone is deciding where to go, stay, or live.",
  },
  {
    title: "The dashboard answers back",
    kicker: "Step 4 of 4",
    body:
      "Scans, saves, visits, redemptions, and repeat use come back into one measured layer. The next step becomes clear without waiting on a quarterly recap.",
    outcome:
      "You can see what worked, what did not, and what needs more visibility the next day.",
  },
];

const PRINCIPLES = [
  {
    title: "Show what actually happened",
    body:
      "If a saved perk led to a visit the next day, that should be visible. The point is clarity while the signal is still useful.",
  },
  {
    title: "Build around how downtown works",
    body:
      "Buildings, events, local businesses, and daily routines all affect each other. The product should show those relationships instead of flattening them.",
  },
  {
    title: "Keep the surface worth opening",
    body:
      "People should open Downtown Perks because something useful is waiting. If the view does not lead to action, it should not be on the page.",
  },
];

function inferDistrictLabel(address = "") {
  const value = String(address || "").toLowerCase();
  if (value.includes("rainey") || value.includes("river st")) return "Rainey";
  if (value.includes("west ave") || value.includes("nueces") || value.includes("seaholm")) return "Seaholm";
  if (value.includes("congress") || value.includes("san jacinto")) return "Congress";
  if (value.includes("5th") || value.includes("6th") || value.includes("colorado")) return "Warehouse";
  if (value.includes("guadalupe") || value.includes("11th") || value.includes("12th")) return "UT Edge";
  return "Downtown Core";
}

function normalizeBuildingName(value = "") {
  return String(value || "")
    .replace(/,.*$/i, "")
    .replace(/\b(unit|#)\s*[:#-]?\s*[a-z0-9-]+.*$/i, "")
    .replace(/\bwest\b/gi, "W")
    .replace(/\bstreet\b/gi, "ST")
    .replace(/\bboulevard\b/gi, "Blvd")
    .replace(/\s+w\s+#/gi, " #")
    .replace(/\s+/g, " ")
    .trim();
}

const LEGENDS_STATS = [
  { value: String(LEGENDS_IMPORT_SUMMARY.groupedBuildings), label: "Grouped buildings" },
  { value: String(LEGENDS_IMPORT_SUMMARY.importedInBounds), label: "Mapped listings" },
  { value: String(new Set(LEGENDS_IMPORTED_PROPERTIES.map((item) => inferDistrictLabel(item.address))).size), label: "Districts covered" },
  { value: "Live", label: "Map status" },
];

const LEGENDS_BUILDINGS = Object.values(
  LEGENDS_IMPORTED_PROPERTIES.reduce((accumulator, item) => {
    const district = inferDistrictLabel(item.address || item.name);
    const type = item.categoryKeys?.includes("commercial_property") ? "Mixed-use" : "Residential";
    const normalizedName = normalizeBuildingName(item.address || item.name);
    const key = `${normalizedName}-${district}-${type}`;

    if (!accumulator[key]) {
      accumulator[key] = {
        id: key,
        name: normalizedName,
        district,
        type,
        listings: 0,
        unitCount: 0,
      };
    }

    accumulator[key].listings += Number(item.groupedListingCount || 0);
    accumulator[key].unitCount += 1;
    return accumulator;
  }, {})
).sort((left, right) => right.listings - left.listings);

const CONTACT_INTERESTS = [
  "Property onboarding",
  "Venue launch",
  "Brand campaign",
  "Civic rollout",
  "Resident access",
];

function DashNav() {
  return (
    <div className="mt-6 flex flex-wrap gap-2">
      {DASHBOARD_LINKS.map((item) => (
        <Link
          key={item.href}
          to={item.href}
          className={`inline-flex min-h-[38px] items-center rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] transition-all ${
            item.label === "About"
              ? "bg-white text-[var(--dp-navy)]"
              : "bg-white/10 text-white/72 hover:bg-white/14 hover:text-white"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}

export default function DashboardAbout() {
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedType, setSelectedType] = useState("All");
  const [selectedDistrict, setSelectedDistrict] = useState("All districts");
  const [showAllBuildings, setShowAllBuildings] = useState(false);
  const [formState, setFormState] = useState({
    name: "",
    organization: "",
    email: "",
    role: "",
    interest: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const activeStep = HOW_IT_WORKS_STEPS[stepIndex];

  const districtOptions = useMemo(
    () => ["All districts", ...Array.from(new Set(LEGENDS_BUILDINGS.map((item) => item.district))).sort()],
    []
  );

  const visibleBuildings = useMemo(() => {
    return LEGENDS_BUILDINGS.filter((item) => {
      const typeMatch = selectedType === "All" ? true : item.type === selectedType;
      const districtMatch = selectedDistrict === "All districts" ? true : item.district === selectedDistrict;
      return typeMatch && districtMatch;
    });
  }, [selectedDistrict, selectedType]);

  const displayedBuildings = useMemo(
    () => (showAllBuildings ? visibleBuildings : visibleBuildings.slice(0, 6)),
    [showAllBuildings, visibleBuildings]
  );

  function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen bg-[var(--dp-surface-base)] pt-[68px] text-foreground">
      <section className="px-4 py-6 md:px-6 md:py-8">
        <div className="dp-page-shell">
          <div className="dp-stage-dark overflow-hidden p-6 md:p-8 lg:p-10">
            <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
              <div className="max-w-4xl">
                <div className="dp-kicker">Partner Dashboard</div>
                <h1 className="dp-display-hero mt-5 text-[2.6rem] text-white md:text-[4.2rem]">
                  The downtown layer, explained properly.
                </h1>
                <p className="mt-4 max-w-3xl text-[15px] leading-7 text-white/74">
                  Downtown Perks connects buildings, daily movement, events, local businesses, and resident action inside one live map. This page explains how that system is structured, why Legends fits into it, and how the dashboard turns neighborhood activity into something a team can actually use.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 lg:justify-end">
                <Link to="/resident-app" className="dp-cta-primary bg-white text-[var(--dp-navy)]">
                  View Resident App
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/" className="dp-cta-secondary border-white/12 bg-white/10 text-white">
                  Downtown Perks Home
                </Link>
              </div>
            </div>

            <DashNav />
          </div>
        </div>
      </section>

      <section className="px-4 py-4 md:px-6">
        <div className="dp-page-shell">
          <div className="grid gap-10 lg:grid-cols-[0.88fr_1.12fr] lg:items-start">
            <div>
              <div className="dp-micro-label">About Downtown Perks</div>
              <h2 className="dp-display-section mt-4 text-[2.1rem] md:text-[3rem]">
                One map for residents, properties, and the places that shape downtown life.
              </h2>
            </div>
            <div className="space-y-4 text-[15px] leading-7 text-muted-foreground">
              <p>
                This is not a separate partner brochure. It is the operating explanation for how Downtown Perks connects buildings, resident behavior, local demand, and measurable action in one system.
              </p>
              <p>
                The point is simple: people should not need five different tools to understand what is nearby, what is worth doing, and what is actually driving movement around a building or district.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-6 md:px-6">
        <div className="dp-page-shell">
          <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
            <div>
              <div className="dp-micro-label">How it works</div>
              <h2 className="dp-display-section mt-4 text-[2rem] md:text-[2.8rem]">
                From setup to live neighborhood signal.
              </h2>
              <button
                type="button"
                onClick={() => setStepIndex((current) => (current + 1) % HOW_IT_WORKS_STEPS.length)}
                className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[var(--dp-navy)]"
              >
                <PlayCircle className="h-4 w-4 text-[var(--dp-gold-muted)]" />
                Move to next step
              </button>
            </div>

            <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
              <div className="space-y-3">
                {HOW_IT_WORKS_STEPS.map((step, index) => (
                  <button
                    key={step.title}
                    type="button"
                    onClick={() => setStepIndex(index)}
                    className={`w-full border-l-2 pl-4 pr-2 py-2 text-left transition-all ${
                      stepIndex === index
                        ? "border-[var(--dp-gold-muted)] text-foreground"
                        : "border-[rgba(11,31,51,0.08)] text-foreground/56 hover:border-[rgba(194,143,84,0.28)] hover:text-foreground"
                    }`}
                  >
                    <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--dp-gold-muted)]">
                      0{index + 1}
                    </div>
                    <div className="mt-1 text-[14px] font-semibold">{step.title}</div>
                  </button>
                ))}
              </div>

              <div className="rounded-[32px] bg-[linear-gradient(180deg,rgba(255,255,255,0.62),rgba(255,255,255,0.32))] px-6 py-6 shadow-[0_20px_44px_rgba(11,31,51,0.05)] backdrop-blur-sm">
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--dp-gold-muted)]">
                  {activeStep.kicker}
                </div>
                <h3 className="mt-4 font-heading text-[2rem] font-semibold tracking-[-0.04em] text-foreground">
                  {activeStep.title}
                </h3>
                <p className="mt-4 max-w-3xl text-[15px] leading-7 text-muted-foreground">
                  {activeStep.body}
                </p>
                <div className="mt-6 border-l-2 border-[rgba(194,143,84,0.26)] pl-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--dp-gold-muted)]">
                    What happens
                  </div>
                  <p className="mt-2 text-[14px] leading-7 text-foreground/78">{activeStep.outcome}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-6 md:px-6">
        <div className="dp-page-shell">
          <div className="grid gap-8 md:grid-cols-3">
            {PRINCIPLES.map((principle, index) => (
              <div key={principle.title} className="border-t border-[rgba(194,143,84,0.22)] pt-5">
                <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--dp-gold-muted)]">
                  0{index + 1}
                </div>
                <h3 className="mt-3 text-[1.25rem] font-semibold tracking-[-0.03em] text-foreground">
                  {principle.title}
                </h3>
                <p className="mt-3 text-[14px] leading-7 text-muted-foreground">{principle.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-6 md:px-6">
        <div className="dp-page-shell">
          <div className="dp-stage-dark overflow-hidden p-6 md:p-8 lg:p-10">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--dp-gold)]">
                  <Sparkles className="h-3.5 w-3.5" />
                  Founding partner
                </div>
                <div className="mt-5 flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-white">
                    <img src={LEGENDS_LOGO} alt="Legends Real Estate" className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <div className="dp-micro-label text-[var(--dp-gold)]">Legends Real Estate</div>
                    <h2 className="mt-2 text-[2rem] font-semibold tracking-[-0.04em] text-white md:text-[2.7rem]">
                      Downtown listings, with the neighborhood attached.
                    </h2>
                  </div>
                </div>

                <div className="mt-5 space-y-4 text-[15px] leading-7 text-white/74">
                  <p>
                    Legends fits this system because a listing is never just a unit. It is the building, the block, the walk, the nearby routine, and the local energy around it. Downtown Perks makes that context visible without making a resident or prospect do the work to find it.
                  </p>
                  <p>
                    The latest Legends import brought {LEGENDS_IMPORT_SUMMARY.importedInBounds} in-bounds property records into the downtown layer, grouped into {LEGENDS_IMPORT_SUMMARY.groupedBuildings} map-ready buildings. That turns inventory into a real neighborhood view instead of a static property list.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  {LEGENDS_STATS.map((item) => (
                    <div key={item.label} className="border-b border-white/12 pb-3">
                      <div className="font-heading text-[1.75rem] font-semibold tracking-[-0.04em] text-white">{item.value}</div>
                      <div className="mt-1 text-[11px] uppercase tracking-[0.12em] text-white/54">{item.label}</div>
                    </div>
                  ))}
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div className="border-l border-[rgba(194,143,84,0.3)] pl-4">
                    <div className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--dp-gold)]">Legends brings</div>
                    <ul className="mt-3 space-y-2 text-[14px] leading-6 text-white/72">
                      <li>Verified buildings across downtown</li>
                      <li>Active listings and availability context</li>
                      <li>Real building knowledge, not generic inventory</li>
                    </ul>
                  </div>
                  <div className="border-l border-[rgba(194,143,84,0.3)] pl-4">
                    <div className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--dp-gold)]">Downtown Perks brings</div>
                    <ul className="mt-3 space-y-2 text-[14px] leading-6 text-white/72">
                      <li>Live venues, perks, and event layers</li>
                      <li>Walkable context around each address</li>
                      <li>The daily-use map residents already open</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="space-y-5">
                <div>
                  <div className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--dp-gold)]">How the map integrates</div>
                  <div className="mt-4 space-y-3 text-[14px] leading-7 text-white/74">
                    <p>Buildings, listings, and nearby places appear in one layer instead of on separate property pages.</p>
                    <p>Residents and prospects can see coffee, dinner, perks, parks, events, and everyday anchors around a building without searching for them one by one.</p>
                    <p>The map can show whether an address reads as active, quiet, social, walkable, or event-driven based on what is actually around it.</p>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-4 text-[14px] leading-7 text-white/72">
                  All visible at once. That is the point. A resident should not have to compare tabs and guess whether a place fits the pattern of their life. The system should show it directly.
                </div>
              </div>

              <div className="rounded-[28px] bg-white/6 p-5 backdrop-blur-sm">
                <div className="grid gap-3 md:grid-cols-[160px_160px_1fr]">
                  <label className="grid gap-1">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/52">Type</span>
                    <select
                      value={selectedType}
                      onChange={(event) => setSelectedType(event.target.value)}
                      className="h-11 rounded-[14px] border border-white/10 bg-white/8 px-3 text-[13px] font-medium text-white outline-none"
                    >
                      {["All", "Residential", "Mixed-use"].map((option) => (
                        <option key={option} value={option} className="text-[var(--dp-navy)]">
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="grid gap-1">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/52">District</span>
                    <select
                      value={selectedDistrict}
                      onChange={(event) => setSelectedDistrict(event.target.value)}
                      className="h-11 rounded-[14px] border border-white/10 bg-white/8 px-3 text-[13px] font-medium text-white outline-none"
                    >
                      {districtOptions.map((option) => (
                        <option key={option} value={option} className="text-[var(--dp-navy)]">
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="flex items-end text-[13px] text-white/64">
                    Showing {displayedBuildings.length} of {visibleBuildings.length} mapped Legends buildings
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {displayedBuildings.map((building) => (
                    <div
                      key={building.id}
                      className="flex items-start justify-between gap-4 border-b border-white/10 pb-3 last:border-b-0 last:pb-0"
                    >
                      <div className="min-w-0">
                        <div className="text-[14px] font-semibold text-white">{building.name}</div>
                        <div className="mt-1 text-[12px] text-white/54">
                          {building.district} · {building.type} · {building.unitCount} mapped {building.unitCount === 1 ? "record" : "records"}
                        </div>
                      </div>
                      <div className="shrink-0 text-[12px] font-medium text-[var(--dp-gold)]">
                        {building.listings} listing{building.listings === 1 ? "" : "s"}
                      </div>
                    </div>
                  ))}
                </div>

                {visibleBuildings.length > 6 ? (
                  <button
                    type="button"
                    onClick={() => setShowAllBuildings((current) => !current)}
                    className="mt-4 inline-flex items-center gap-2 text-[12px] font-semibold text-[var(--dp-gold)]"
                  >
                    {showAllBuildings ? "Show fewer buildings" : `Show ${visibleBuildings.length - 6} more buildings`}
                    <ArrowRight className={`h-3.5 w-3.5 transition-transform ${showAllBuildings ? "-rotate-90" : "rotate-90"}`} />
                  </button>
                ) : null}
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3 text-[13px] font-medium text-white/78">
              {["Listings", "Lifestyle", "Buildings", "Behavior", "Real estate", "Real daily use"].map((item) => (
                <span key={item} className="inline-flex items-center gap-3">
                  <span>{item}</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--dp-gold)] last:hidden" />
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-6 md:px-6 pb-12">
        <div className="dp-page-shell">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <div className="dp-micro-label">Contact</div>
              <h2 className="dp-display-section mt-4 text-[2rem] md:text-[2.8rem]">
                Start with a real conversation.
              </h2>
              <p className="mt-4 text-[15px] leading-7 text-muted-foreground">
                Whether you manage buildings, run a venue, or are shaping downtown more broadly, this should start with something straightforward. No deck first. No pitch theatre. Just a clear conversation about where Downtown Perks fits.
              </p>
              <div className="mt-6 border-l-2 border-[rgba(194,143,84,0.24)] pl-4">
                <div className="inline-flex items-center gap-2 text-sm font-medium text-[var(--dp-navy)]">
                  <MapPinned className="h-4 w-4 text-[var(--dp-gold-muted)]" />
                  Downtown is a network of decisions made every day.
                </div>
                <p className="mt-2 text-[14px] leading-7 text-muted-foreground">
                  Downtown Perks works when those decisions become easier to see and easier to act on.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-5">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-1.5">
                  <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground">Your name</span>
                  <input
                    value={formState.name}
                    onChange={(event) => setFormState((current) => ({ ...current, name: event.target.value }))}
                    className="h-12 border-0 border-b border-[rgba(11,31,51,0.12)] bg-transparent px-0 text-sm outline-none"
                    type="text"
                  />
                </label>
                <label className="grid gap-1.5">
                  <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground">Company or property</span>
                  <input
                    value={formState.organization}
                    onChange={(event) => setFormState((current) => ({ ...current, organization: event.target.value }))}
                    className="h-12 border-0 border-b border-[rgba(11,31,51,0.12)] bg-transparent px-0 text-sm outline-none"
                    type="text"
                  />
                </label>
                <label className="grid gap-1.5">
                  <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground">Email address</span>
                  <input
                    value={formState.email}
                    onChange={(event) => setFormState((current) => ({ ...current, email: event.target.value }))}
                    className="h-12 border-0 border-b border-[rgba(11,31,51,0.12)] bg-transparent px-0 text-sm outline-none"
                    type="email"
                  />
                </label>
                <label className="grid gap-1.5">
                  <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground">I am a...</span>
                  <input
                    value={formState.role}
                    onChange={(event) => setFormState((current) => ({ ...current, role: event.target.value }))}
                    className="h-12 border-0 border-b border-[rgba(11,31,51,0.12)] bg-transparent px-0 text-sm outline-none"
                    type="text"
                  />
                </label>
              </div>

              <label className="grid gap-1.5">
                <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground">Interested in...</span>
                <select
                  value={formState.interest}
                  onChange={(event) => setFormState((current) => ({ ...current, interest: event.target.value }))}
                  className="h-12 border-0 border-b border-[rgba(11,31,51,0.12)] bg-transparent px-0 text-sm outline-none"
                >
                  <option value="">Select one</option>
                  {CONTACT_INTERESTS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex flex-wrap items-center gap-4">
                <button type="submit" className="dp-cta-primary">
                  Start a conversation
                  <Send className="h-4 w-4" />
                </button>
                {submitted ? (
                  <div className="text-sm text-muted-foreground">
                    Conversation request captured. Next step is routing this into the right Downtown Perks path.
                  </div>
                ) : null}
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
