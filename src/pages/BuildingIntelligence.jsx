import { useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  MapPin,
  Users,
  Wrench,
} from "lucide-react";
import MapExplorer from "@/components/partner/MapExplorer";
import AmenityReservationForm from "@/components/booking/AmenityReservationForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BUILDING_ROUTE_TABS, getBuildingById } from "@/data/buildingIntelligence";

const TAB_META = {
  overview: {
    eyebrow: "Building overview",
    title: "What the building offers inside and what it unlocks outside.",
    body: "This route folds the Harmony-style building layer into Downtown Perks: address, resident utility, nearby context, and measurable partner behavior in one product surface.",
  },
  residents: {
    eyebrow: "Resident roster",
    title: "Profiles, segments, and activation context.",
    body: "Residents stay tied to building source, card status, and neighborhood behavior rather than living in a separate property-only interface.",
  },
  amenities: {
    eyebrow: "Amenities",
    title: "Building amenities connected to the live neighborhood layer.",
    body: "Amenity booking stays operational, but the resident experience extends into what is walkable, useful, and active around the property.",
  },
  maintenance: {
    eyebrow: "Maintenance",
    title: "Requests, priority, and follow-up without leaving the system.",
    body: "This keeps operational requests alongside resident activity and nearby value instead of splitting building service from the product.",
  },
  reports: {
    eyebrow: "Reports",
    title: "Attribution, repeat behavior, and building-driven conversion.",
    body: "The reporting layer shows what the building is actually driving: scans, saves, repeat visits, and partner activity from this address.",
  },
  partners: {
    eyebrow: "Partner network",
    title: "Nearby venues, brands, and hospitality tied to this building.",
    body: "Use the building as an anchor for the partner layer instead of flattening it into a static amenity page.",
  },
};

function getActiveTab(pathname, buildingId) {
  const prefix = `/buildings/${buildingId}`;
  const aliasPrefix = `/properties/${buildingId}`;
  const matchedPrefix = pathname.startsWith(aliasPrefix) ? aliasPrefix : prefix;
  const remainder = pathname.slice(matchedPrefix.length).replace(/^\//, "");
  return BUILDING_ROUTE_TABS.find((tab) => tab.id === remainder)?.id || "overview";
}

function getTabHref(buildingId, tabId, pathname) {
  const base = pathname.startsWith(`/properties/${buildingId}`) ? `/properties/${buildingId}` : `/buildings/${buildingId}`;
  return tabId === "overview" ? base : `${base}/${tabId}`;
}

function StatCard({ label, value, detail }) {
  return (
    <div className="rounded-[18px] border border-[rgba(11,31,51,0.08)] bg-white/70 p-4 shadow-[0_10px_28px_rgba(11,31,51,0.05)]">
      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[rgba(11,31,51,0.44)]">{label}</div>
      <div className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-[var(--dp-navy,#0B1F33)]">{value}</div>
      {detail ? <div className="mt-1 text-[12px] leading-5 text-[rgba(11,31,51,0.56)]">{detail}</div> : null}
    </div>
  );
}

export default function BuildingIntelligence() {
  const { buildingId = "the-waterline" } = useParams();
  const location = useLocation();
  const [showReservation, setShowReservation] = useState(false);

  const building = useMemo(() => getBuildingById(buildingId), [buildingId]);
  const activeTab = getActiveTab(location.pathname, buildingId);
  const activeMeta = TAB_META[activeTab];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_18%_0%,rgba(207,175,90,0.10),transparent_28%),linear-gradient(180deg,#F8F7F3_0%,#F1F0EA_100%)] pt-[68px] text-[var(--dp-navy,#0B1F33)]">
      <section className="border-b border-[rgba(11,31,51,0.08)] px-6 py-12 md:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-center gap-2 text-[12px] text-[rgba(11,31,51,0.52)]">
            <Link to="/partners/properties" className="hover:text-[var(--dp-navy,#0B1F33)]">Properties</Link>
            <span>/</span>
            <Link to="/resident-app?tab=buildings" className="hover:text-[var(--dp-navy,#0B1F33)]">Buildings</Link>
            <span>/</span>
            <span className="text-[var(--dp-navy,#0B1F33)]">{building.name}</span>
          </div>

          <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
            <div>
              <p className="dp-micro-label">Building intelligence</p>
              <h1 className="mt-4 dp-display-hero text-4xl md:text-6xl">{building.name}</h1>
              <p className="mt-4 max-w-3xl text-[15px] leading-7 text-[rgba(11,31,51,0.68)]">{building.positioning}</p>

              <div className="mt-5 flex flex-wrap gap-2">
                {[building.address, building.district, building.walkScore, building.availability].map((chip) => (
                  <span key={chip} className="dp-chip">{chip}</span>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/resident-app?tab=card"
                  className="inline-flex h-12 items-center gap-2 rounded-[12px] bg-[var(--dp-navy,#0B1F33)] px-5 text-sm font-semibold uppercase tracking-[0.12em] text-white"
                >
                  Get your card
                  <CreditCard className="h-4 w-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => setShowReservation(true)}
                  className="inline-flex h-12 items-center gap-2 rounded-[12px] bg-white/58 px-5 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--dp-navy,#0B1F33)]"
                >
                  Reserve amenity
                  <Calendar className="h-4 w-4" />
                </button>
                <Link
                  to="/explore"
                  className="inline-flex h-12 items-center gap-2 rounded-[12px] border border-[rgba(11,31,51,0.10)] bg-white/40 px-5 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--dp-navy,#0B1F33)]"
                >
                  Explore nearby
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="rounded-[24px] border border-[rgba(11,31,51,0.10)] bg-[rgba(255,255,255,0.62)] p-5 shadow-[0_18px_42px_rgba(11,31,51,0.08)] backdrop-blur-xl">
              <div className="grid grid-cols-2 gap-3">
                <StatCard label="Units" value={building.unitCount} />
                <StatCard label="Occupancy" value={building.occupancy} />
                <StatCard label="Card activations" value={building.cardActivations} />
                <StatCard label="Price from" value={building.priceFrom} />
              </div>
              <div className="mt-4 rounded-[18px] bg-[var(--dp-navy,#0B1F33)] p-4 text-white">
                <div className="text-[11px] uppercase tracking-[0.16em] text-white/56">Resident mix</div>
                <div className="mt-2 text-sm leading-6 text-white/78">{building.residentMix}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[rgba(11,31,51,0.08)] px-6">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto py-4">
          {BUILDING_ROUTE_TABS.map((tab) => (
            <Link
              key={tab.id}
              to={getTabHref(buildingId, tab.id, location.pathname)}
              className={`rounded-full px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.12em] transition ${
                activeTab === tab.id
                  ? "bg-[var(--dp-navy,#0B1F33)] text-white"
                  : "border border-[rgba(11,31,51,0.08)] bg-white/68 text-[rgba(11,31,51,0.58)] hover:text-[var(--dp-navy,#0B1F33)]"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="px-6 py-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="dp-micro-label">{activeMeta.eyebrow}</p>
              <h2 className="mt-4 dp-display-section text-3xl md:text-5xl">{activeMeta.title}</h2>
              <p className="mt-4 max-w-3xl text-[15px] leading-7 text-[rgba(11,31,51,0.66)]">{activeMeta.body}</p>
            </div>
            <div className="rounded-[24px] border border-[rgba(11,31,51,0.08)] bg-white/52 p-5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[rgba(11,31,51,0.44)]">Why this block works</div>
              <div className="mt-3 space-y-3">
                {building.lifestyleUnlocks.map((item) => (
                  <div key={item} className="flex gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--dp-gold,#C6A269)]" />
                    <p className="text-[13px] leading-6 text-[rgba(11,31,51,0.66)]">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8">
            {activeTab === "overview" && (
              <div className="grid gap-8">
                <div className="grid gap-4 md:grid-cols-3">
                  {building.reports.map((item) => (
                    <StatCard key={item.label} label={item.label} value={item.value} detail={item.detail} />
                  ))}
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-[22px] border border-[rgba(11,31,51,0.08)] bg-white/70 p-5">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold"><Building2 className="h-4 w-4" /> Building amenities</div>
                    <div className="flex flex-wrap gap-2">
                      {building.amenities.map((amenity) => (
                        <span key={amenity} className="dp-chip">{amenity}</span>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-[22px] border border-[rgba(11,31,51,0.08)] bg-white/70 p-5">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold"><MapPin className="h-4 w-4" /> Resident conveniences nearby</div>
                    <div className="space-y-2">
                      {building.residentConveniences.map((item) => (
                        <div key={item} className="text-[13px] text-[rgba(11,31,51,0.66)]">{item}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "residents" && (
              <div className="grid gap-4 md:grid-cols-3">
                {building.residents.map((resident) => (
                  <div key={resident.name} className="rounded-[22px] border border-[rgba(11,31,51,0.08)] bg-white/70 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-lg font-semibold tracking-[-0.03em]">{resident.name}</div>
                        <div className="text-[12px] text-[rgba(11,31,51,0.5)]">Unit {resident.unit}</div>
                      </div>
                      <Users className="h-4 w-4 text-[var(--dp-gold,#C6A269)]" />
                    </div>
                    <div className="mt-4 space-y-2 text-[13px] text-[rgba(11,31,51,0.66)]">
                      <div>Status: {resident.status}</div>
                      <div>Segment: {resident.segment}</div>
                      <div>Behavior: {resident.favorite}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "amenities" && (
              <div className="grid gap-4 md:grid-cols-2">
                {building.amenities.map((amenity) => (
                  <div key={amenity} className="rounded-[22px] border border-[rgba(11,31,51,0.08)] bg-white/70 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-lg font-semibold tracking-[-0.03em]">{amenity}</div>
                      <button
                        type="button"
                        onClick={() => setShowReservation(true)}
                        className="rounded-full bg-[var(--dp-navy,#0B1F33)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-white"
                      >
                        Reserve
                      </button>
                    </div>
                    <p className="mt-3 text-[13px] leading-6 text-[rgba(11,31,51,0.66)]">
                      Amenity access remains operational, but this route keeps it connected to the same neighborhood layer residents already use.
                    </p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "maintenance" && (
              <div className="space-y-4">
                {building.maintenance.map((ticket) => (
                  <div key={ticket.title} className="rounded-[22px] border border-[rgba(11,31,51,0.08)] bg-white/70 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 text-lg font-semibold tracking-[-0.03em]">
                          <Wrench className="h-4 w-4 text-[var(--dp-gold,#C6A269)]" />
                          {ticket.title}
                        </div>
                        <div className="mt-2 text-[13px] text-[rgba(11,31,51,0.66)]">Location: {ticket.unit}</div>
                      </div>
                      <div className="flex gap-2 text-[11px] font-semibold uppercase tracking-[0.12em]">
                        <span className="rounded-full bg-[rgba(198,162,105,0.14)] px-3 py-1 text-[var(--dp-navy,#0B1F33)]">{ticket.priority}</span>
                        <span className="rounded-full border border-[rgba(11,31,51,0.10)] bg-white/72 px-3 py-1 text-[rgba(11,31,51,0.6)]">{ticket.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "reports" && (
              <div className="grid gap-4 md:grid-cols-2">
                {building.reports.map((report) => (
                  <div key={report.label} className="rounded-[22px] border border-[rgba(11,31,51,0.08)] bg-white/70 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[rgba(11,31,51,0.44)]">{report.label}</div>
                        <div className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-[var(--dp-gold,#C6A269)]">{report.value}</div>
                      </div>
                      <ClipboardList className="h-4 w-4 text-[var(--dp-navy,#0B1F33)]" />
                    </div>
                    <p className="mt-3 text-[13px] leading-6 text-[rgba(11,31,51,0.66)]">{report.detail}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "partners" && (
              <div className="grid gap-4 md:grid-cols-3">
                {building.partners.map((partner) => (
                  <div key={partner.name} className="rounded-[22px] border border-[rgba(11,31,51,0.08)] bg-white/70 p-5">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[rgba(11,31,51,0.44)]">{partner.category}</div>
                    <div className="mt-2 text-lg font-semibold tracking-[-0.03em]">{partner.name}</div>
                    <div className="mt-2 text-[13px] text-[var(--dp-gold,#C6A269)]">{partner.result}</div>
                    <p className="mt-3 text-[13px] leading-6 text-[rgba(11,31,51,0.66)]">{partner.context}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <MapExplorer
        mode="partner"
        items={building.nearby}
        selected={building.nearby[0]}
        onSelect={() => {}}
        title={`${building.shortLabel} nearby layer`}
        description="The building page stays map-native: building anchor, nearby partners, event energy, and active perk context remain visible instead of collapsing into a static amenity sheet."
        height="h-[420px] md:h-[520px]"
      />

      <Dialog open={showReservation} onOpenChange={setShowReservation}>
        <DialogContent className="max-w-xl border-[rgba(11,31,51,0.08)] bg-[rgba(247,246,242,0.96)]">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl tracking-[-0.03em]">Reserve an amenity at {building.name}</DialogTitle>
          </DialogHeader>
          <AmenityReservationForm building={building} amenities={building.amenities} onClose={() => setShowReservation(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
