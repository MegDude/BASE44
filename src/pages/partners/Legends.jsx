import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, Building2, Layers3, MapPinned, Route, Send, Sparkles, Users } from "lucide-react";
import { LEGENDS_IMPORTED_PROPERTIES, LEGENDS_IMPORT_SUMMARY } from "@/data/legendsImportData";
import { ROUTES } from "@/lib/routes";

const LEGENDS_LOGO = "https://media.base44.com/images/public/69d94e4f5b7886cf42a2cf62/59a2b6b9d_legends-logocopy.png";

function inferDistrictLabel(address = "") {
  const value = String(address || "").toLowerCase();
  if (value.includes("rainey") || value.includes("river st")) return "Rainey";
  if (value.includes("west ave") || value.includes("nueces") || value.includes("seaholm")) return "Seaholm";
  if (value.includes("congress") || value.includes("san jacinto")) return "Congress";
  if (value.includes("5th") || value.includes("6th") || value.includes("colorado")) return "Warehouse";
  if (value.includes("guadalupe") || value.includes("11th") || value.includes("12th")) return "UT Edge";
  return "Downtown Core";
}

const LEGENDS_BUILDINGS = LEGENDS_IMPORTED_PROPERTIES.map((item) => ({
  id: item.id,
  name: item.address || item.name,
  district: inferDistrictLabel(item.address || item.name),
  type: item.categoryKeys?.includes("commercial_property") ? "Mixed-use" : "Residential",
  listings: item.groupedListingCount,
}));

const DISTRICT_COUNT = new Set(LEGENDS_BUILDINGS.map((item) => item.district)).size;

const STATS = [
  { value: String(LEGENDS_IMPORT_SUMMARY.groupedBuildings), label: "Grouped buildings" },
  { value: String(LEGENDS_IMPORT_SUMMARY.importedInBounds), label: "Mapped listings" },
  { value: String(DISTRICT_COUNT), label: "Districts covered" },
  { value: "Live", label: "Map status" },
];

const STEPS = [
  {
    title: "Import and group",
    body: "Legends listings are brought into the Downtown Perks property layer, deduped, and grouped into map-ready buildings.",
    icon: Building2,
  },
  {
    title: "Attach the neighborhood",
    body: "Each building is shown with nearby venues, perks, events, parks, coffee, restaurants, nightlife, errands, and everyday anchors.",
    icon: Layers3,
  },
  {
    title: "Make the address explorable",
    body: "Residents and prospects can evaluate a building as part of a real routine, not as a listing floating outside the city around it.",
    icon: Route,
  },
  {
    title: "Read the signal back",
    body: "The dashboard is designed to surface useful signals around saves, views, redemptions, visits, districts, and activity patterns.",
    icon: BarChart3,
  },
];

const BRINGS = [
  {
    title: "Legends brings",
    items: [
      "Verified buildings across downtown",
      "Active listings and availability context",
      "Real building knowledge, not generic inventory",
      "A practical read on how prospects compare addresses",
    ],
  },
  {
    title: "Downtown Perks brings",
    items: [
      "Live venues, perks, and event layers",
      "Walkable context around each address",
      "The daily-use map residents already open",
      "A measurable layer for district activity and movement",
    ],
  },
];

const DASHBOARD_SIGNALS = [
  "Which districts are active",
  "Which buildings are getting attention",
  "How nearby perks and events support resident interest",
  "What neighborhood anchors drive movement",
  "How listing context can support prospect conversations",
];

const USE_CASES = [
  {
    title: "Resident comparing buildings",
    body: "A resident can see what life around each address feels like before deciding where to tour, save, or revisit.",
  },
  {
    title: "Prospect evaluating the block",
    body: "A prospect can understand coffee, dinner, events, parks, daily errands, and nightlife without opening five tabs.",
  },
  {
    title: "Broker or property team",
    body: "A team can explain the neighborhood with live context instead of flattening the address into generic marketing copy.",
  },
  {
    title: "Local venue or brand",
    body: "A partner can see how residential movement connects to nearby offers, events, and district-level attention.",
  },
];

export default function LegendsPartner() {
  const [selectedType, setSelectedType] = useState("All");
  const [selectedDistrict, setSelectedDistrict] = useState("All districts");

  const districtOptions = useMemo(
    () => ["All districts", ...Array.from(new Set(LEGENDS_BUILDINGS.map((item) => item.district))).sort()],
    []
  );

  const visibleBuildings = useMemo(() => {
    return LEGENDS_BUILDINGS.filter((item) => {
      const typeMatch = selectedType === "All" || item.type === selectedType;
      const districtMatch = selectedDistrict === "All districts" || item.district === selectedDistrict;
      return typeMatch && districtMatch;
    });
  }, [selectedDistrict, selectedType]);

  return (
    <div className="min-h-screen bg-[var(--dp-surface-base)] pt-[68px] text-foreground">
      <section className="px-4 py-6 md:px-6 md:py-8">
        <div className="dp-page-shell">
          <div className="dp-stage-dark overflow-hidden p-6 md:p-8 lg:p-10">
            <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
              <div className="max-w-4xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--dp-gold)]">
                  <Sparkles className="h-3.5 w-3.5" />
                  Founding partner
                </div>
                <div className="mt-6 flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-white shadow-[0_18px_40px_rgba(0,0,0,0.16)]">
                    <img src={LEGENDS_LOGO} alt="Legends Real Estate" className="h-full w-full object-cover" />
                  </div>
                  <div className="dp-micro-label text-[var(--dp-gold)]">Legends Real Estate x Downtown Perks</div>
                </div>
                <h1 className="dp-display-hero mt-6 text-[2.65rem] text-white md:text-[4.4rem]">
                  Downtown listings, with the neighborhood attached.
                </h1>
                <p className="mt-5 max-w-3xl text-[15px] leading-7 text-white/74">
                  Downtown Perks turns Legends inventory into a living neighborhood layer, connecting buildings, listings, events, venues, perks, and walkable resident routines inside one live map.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link to={ROUTES.explore} className="dp-cta-primary bg-white text-[var(--dp-navy)]">
                    View the live map <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link to={ROUTES.residentApp} className="dp-cta-secondary border-white/12 bg-white/10 text-white">
                    Explore resident experience
                  </Link>
                  <Link to={ROUTES.partnerApply} className="dp-cta-secondary border-white/12 bg-white/10 text-white">
                    Start a partner conversation
                  </Link>
                </div>
              </div>

              <div className="rounded-[32px] bg-white/6 p-5 backdrop-blur-sm">
                <div className="grid grid-cols-2 gap-4">
                  {STATS.map((item) => (
                    <div key={item.label} className="border-b border-white/12 pb-4">
                      <div className="font-heading text-[2rem] font-semibold tracking-[-0.04em] text-white">{item.value}</div>
                      <div className="mt-1 text-[11px] uppercase tracking-[0.12em] text-white/54">{item.label}</div>
                    </div>
                  ))}
                </div>
                <p className="mt-5 text-[13px] leading-6 text-white/68">
                  Latest Legends import: {LEGENDS_IMPORT_SUMMARY.importedInBounds} in-bounds property records grouped into {LEGENDS_IMPORT_SUMMARY.groupedBuildings} map-ready buildings across downtown Austin.
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              {[
                { label: "Partner overview", href: ROUTES.partners },
                { label: "Properties", href: ROUTES.partnerProperties },
                { label: "Dashboard", href: ROUTES.partnerDashboard },
                { label: "Live map", href: ROUTES.explore },
              ].map((item) => (
                <Link key={item.href} to={item.href} className="inline-flex min-h-[38px] items-center rounded-full bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-white/72 transition-all hover:bg-white/14 hover:text-white">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-6 md:px-6">
        <div className="dp-page-shell grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <div className="dp-micro-label">Why Legends fits</div>
            <h2 className="dp-display-section mt-4 text-[2.05rem] md:text-[3rem]">
              A listing is never just a unit.
            </h2>
          </div>
          <div className="space-y-4 text-[15px] leading-7 text-muted-foreground">
            <p>
              It is the building, the block, the walk, the nearby routine, and the local energy around it. Downtown real estate is evaluated through daily behavior: coffee, dinner, nightlife, events, parks, errands, anchors, and the feeling of the streets around the address.
            </p>
            <p>
              Legends gives Downtown Perks a real property backbone. Downtown Perks gives Legends a live neighborhood context residents and prospects can actually use.
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 py-6 md:px-6">
        <div className="dp-page-shell grid gap-6 md:grid-cols-2">
          {BRINGS.map((column) => (
            <div key={column.title} className="rounded-[32px] bg-white/62 p-6 shadow-[0_20px_44px_rgba(11,31,51,0.05)] backdrop-blur-sm">
              <h3 className="font-heading text-[1.8rem] font-semibold tracking-[-0.04em] text-foreground">{column.title}</h3>
              <ul className="mt-5 space-y-3 text-[14px] leading-7 text-muted-foreground">
                {column.items.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--dp-gold-muted)]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 py-6 md:px-6">
        <div className="dp-page-shell">
          <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
            <div>
              <div className="dp-micro-label">How it works</div>
              <h2 className="dp-display-section mt-4 text-[2rem] md:text-[2.8rem]">
                From listing import to live neighborhood signal.
              </h2>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              {STEPS.map(({ title, body, icon: Icon }, index) => (
                <div key={title} className="border-t border-[rgba(194,143,84,0.22)] pt-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[rgba(194,143,84,0.12)] text-[var(--dp-gold-muted)]">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--dp-gold-muted)]">0{index + 1}</div>
                  </div>
                  <h3 className="mt-4 text-[1.25rem] font-semibold tracking-[-0.03em] text-foreground">{title}</h3>
                  <p className="mt-3 text-[14px] leading-7 text-muted-foreground">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-6 md:px-6">
        <div className="dp-page-shell">
          <div className="dp-stage-dark grid gap-8 overflow-hidden p-6 md:p-8 lg:grid-cols-[0.95fr_1.05fr] lg:p-10">
            <div>
              <div className="dp-micro-label text-[var(--dp-gold)]">The neighborhood view</div>
              <h2 className="mt-4 font-heading text-[2.25rem] font-semibold leading-[0.96] tracking-[-0.05em] text-white md:text-[3.3rem]">
                The listing becomes a live context page.
              </h2>
              <p className="mt-5 text-[15px] leading-7 text-white/72">
                Buildings, listings, and nearby places appear in one layer instead of separate property pages. Residents and prospects can see coffee, dinner, perks, parks, events, and everyday anchors around a building without searching one by one.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {["Building", "Block", "Walking radius", "Nearby perks", "Live events", "Lifestyle pattern"].map((item) => (
                <div key={item} className="rounded-[24px] border border-white/10 bg-white/6 p-4 text-white/76">
                  <MapPinned className="mb-4 h-4 w-4 text-[var(--dp-gold)]" />
                  <div className="text-[14px] font-semibold text-white">{item}</div>
                  <p className="mt-2 text-[12px] leading-5 text-white/58">Part of the address story, visible in the same decision surface.</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-6 md:px-6">
        <div className="dp-page-shell">
          <div className="mb-6 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <div className="dp-micro-label">Legends inventory</div>
              <h2 className="dp-display-section mt-4 text-[2rem] md:text-[2.8rem]">Mapped buildings in the downtown layer.</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1">
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Type</span>
                <select value={selectedType} onChange={(event) => setSelectedType(event.target.value)} className="h-11 rounded-[14px] border border-[rgba(11,31,51,0.12)] bg-white/70 px-3 text-[13px] font-medium text-[var(--dp-navy)] outline-none">
                  {["All", "Residential", "Mixed-use"].map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </label>
              <label className="grid gap-1">
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">District</span>
                <select value={selectedDistrict} onChange={(event) => setSelectedDistrict(event.target.value)} className="h-11 rounded-[14px] border border-[rgba(11,31,51,0.12)] bg-white/70 px-3 text-[13px] font-medium text-[var(--dp-navy)] outline-none">
                  {districtOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </label>
            </div>
          </div>

          <div className="rounded-[32px] bg-white/62 p-5 shadow-[0_20px_44px_rgba(11,31,51,0.05)] backdrop-blur-sm">
            <div className="mb-4 text-[13px] text-muted-foreground">Showing {visibleBuildings.length} of {LEGENDS_BUILDINGS.length} mapped Legends buildings</div>
            <div className="grid gap-3 lg:grid-cols-3">
              {visibleBuildings.map((building) => (
                <div key={building.id} className="rounded-[22px] border border-[rgba(11,31,51,0.08)] bg-white/52 p-4">
                  <div className="text-[14px] font-semibold text-foreground">{building.name}</div>
                  <div className="mt-1 text-[12px] text-muted-foreground">{building.district} · {building.type}</div>
                  <div className="mt-4 text-[12px] font-medium text-[var(--dp-gold-muted)]">{building.listings} listing{building.listings === 1 ? "" : "s"}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-6 md:px-6">
        <div className="dp-page-shell grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <div className="dp-micro-label">Dashboard value</div>
            <h2 className="dp-display-section mt-4 text-[2rem] md:text-[2.8rem]">Turn neighborhood context into partner intelligence.</h2>
            <p className="mt-4 text-[15px] leading-7 text-muted-foreground">
              The dashboard is designed to make useful movement visible without overcomplicating the workflow. It can help surface where attention is building, how nearby offers and events support interest, and which location stories are worth sharpening.
            </p>
          </div>
          <div className="space-y-3">
            {DASHBOARD_SIGNALS.map((item) => (
              <div key={item} className="flex items-center gap-3 border-b border-[rgba(11,31,51,0.08)] pb-3 text-[14px] text-foreground/78">
                <BarChart3 className="h-4 w-4 text-[var(--dp-gold-muted)]" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-6 md:px-6">
        <div className="dp-page-shell">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {USE_CASES.map((item) => (
              <div key={item.title} className="border-t border-[rgba(194,143,84,0.22)] pt-5">
                <Users className="h-4 w-4 text-[var(--dp-gold-muted)]" />
                <h3 className="mt-4 text-[1.1rem] font-semibold tracking-[-0.03em] text-foreground">{item.title}</h3>
                <p className="mt-3 text-[14px] leading-7 text-muted-foreground">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-6 pb-14 md:px-6">
        <div className="dp-page-shell">
          <div className="rounded-[36px] bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(255,255,255,0.38))] p-6 shadow-[0_20px_44px_rgba(11,31,51,0.05)] backdrop-blur-sm md:p-8 lg:p-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <div className="dp-micro-label">Next step</div>
                <h2 className="dp-display-section mt-4 text-[2.15rem] md:text-[3rem]">Turn inventory into a living downtown layer.</h2>
                <p className="mt-4 max-w-3xl text-[15px] leading-7 text-muted-foreground">
                  Legends gives Downtown Perks a real property backbone; Downtown Perks gives Legends a live neighborhood context residents and prospects can actually use.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 lg:justify-end">
                <Link to={ROUTES.explore} className="dp-cta-primary">View map <ArrowRight className="h-4 w-4" /></Link>
                <Link to={ROUTES.partnerApply} className="dp-cta-secondary">Contact Downtown Perks <Send className="h-4 w-4" /></Link>
                <Link to={ROUTES.partnerDashboard} className="dp-cta-secondary">Back to Partner Dashboard</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
