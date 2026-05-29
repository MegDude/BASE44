import { useEffect, useMemo, useState } from "react";
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
  X,
} from "lucide-react";
import L from "leaflet";
import MapShell from "@/components/map/MapShell";
import AmenityReservationForm from "@/components/booking/AmenityReservationForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BUILDING_ROUTE_TABS, getBuildingById } from "@/data/buildingIntelligence";

const TAB_COPY = {
  overview: {
    eyebrow: "Building overview",
    title: "What residents can use from the front door.",
    body: "This view shows the building, nearby activity, resident use, and partner opportunities together so the property team can see what is actually helping people downtown.",
  },
  residents: {
    eyebrow: "Residents",
    title: "Who is using the card and what they come back for.",
    body: "These demo profiles show the kind of resident behavior a building can understand: saves, RSVPs, scans, and the nearby habits that make the amenity useful.",
  },
  amenities: {
    eyebrow: "Amenities",
    title: "Building amenities with the neighborhood around them.",
    body: "Residents still need the basics to work. The difference is that amenities now sit beside the plans, perks, and places people can use right after.",
  },
  maintenance: {
    eyebrow: "Maintenance",
    title: "Open requests without leaving the building view.",
    body: "A simple operating view keeps service items close to resident activity, so the team is not jumping between disconnected tools.",
  },
  reports: {
    eyebrow: "Reports",
    title: "What the building is helping people do.",
    body: "The useful numbers are simple: who opened the card, what they saved, where they went, and what nearby partners got traction.",
  },
  partners: {
    eyebrow: "Nearby partners",
    title: "The places and brands getting attention nearby.",
    body: "This keeps partners tied to real building activity instead of treating every listing like it belongs everywhere.",
  },
};

function getBuildingBasePath(pathname, buildingId) {
  return (
    [`/partners/properties/${buildingId}`, `/building-intelligence/${buildingId}`, `/properties/${buildingId}`, `/buildings/${buildingId}`].find((prefix) =>
      pathname.startsWith(prefix)
    ) || `/buildings/${buildingId}`
  );
}

function getActiveTabFromPath(pathname, buildingId) {
  const matchedPrefix = getBuildingBasePath(pathname, buildingId);
  const remainder = pathname.slice(matchedPrefix.length).replace(/^\//, "");
  return BUILDING_ROUTE_TABS.find((tab) => tab.id === remainder)?.id || "overview";
}

function getTabHref(pathname, buildingId, tabId) {
  const base = getBuildingBasePath(pathname, buildingId);
  return tabId === "overview" ? base : `${base}/${tabId}`;
}

function buildingMarkerIcon(item, active) {
  const isBuilding = item.entity_type === "building";
  const size = isBuilding ? 34 : 28;
  const bg = active ? "#B38F4F" : isBuilding ? "#0B1F33" : "#081521";
  return L.divIcon({
    className: "",
    html: `<div style="height:${size}px;width:${size}px;border-radius:7px;background:${bg};border:3px solid white;display:flex;align-items:center;justify-content:center;color:white;box-shadow:0 12px 30px rgba(11,31,51,.2);font-size:11px;font-weight:700">${isBuilding ? "B" : "+"}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function StatTile({ label, value, detail }) {
  return (
    <div className="rounded-lg border border-[#0B1F33]/8 bg-white p-4 shadow-[0_14px_34px_rgba(11,31,51,0.04)]">
      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#0B1F33]/50">{label}</div>
      <div className="mt-2 font-heading text-2xl font-medium text-[#0B1F33]">{value}</div>
      {detail ? <p className="mt-1 text-[12px] leading-5 text-[#0B1F33]/58">{detail}</p> : null}
    </div>
  );
}

function SectionIntro({ eyebrow, title, body }) {
  return (
    <div className="max-w-3xl">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#B38F4F]">{eyebrow}</p>
      <h2 className="mt-3 font-heading text-3xl font-medium leading-tight tracking-normal text-[#0B1F33] md:text-4xl">{title}</h2>
      <p className="mt-3 text-[14px] leading-7 text-[#0B1F33]/64">{body}</p>
    </div>
  );
}

export default function BuildingIntelligence() {
  const { buildingId = "the-bowie", tabId } = useParams();
  const location = useLocation();
  const [showReservation, setShowReservation] = useState(false);
  const [selectedNearby, setSelectedNearby] = useState(null);
  const [activeTab, setActiveTab] = useState(() => getActiveTabFromPath(location.pathname, buildingId));

  const building = useMemo(() => getBuildingById(buildingId), [buildingId]);
  const activeCopy = TAB_COPY[activeTab] || TAB_COPY.overview;
  const selectedMapItem = selectedNearby || building.nearby[0];
  const tabContentId = `building-${building.id}-${activeTab}`;

  useEffect(() => {
    const nextTab = BUILDING_ROUTE_TABS.some((tab) => tab.id === tabId)
      ? tabId
      : getActiveTabFromPath(location.pathname, buildingId);
    setActiveTab(nextTab);
  }, [buildingId, location.pathname, tabId]);

  function selectBuildingTab(tabId) {
    setActiveTab(tabId);
    const nextPath = getTabHref(location.pathname, buildingId, tabId);
    if (window.location.pathname !== nextPath) {
      window.history.pushState(window.history.state, "", `${nextPath}${location.search || ""}`);
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F8FB] pt-[72px] text-[#0B1F33]">
      <section className="border-b border-[#0B1F33]/8 bg-white px-5 py-10 md:py-14">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-center gap-2 text-[12px] text-[#0B1F33]/52">
            <Link to="/partners/properties" className="hover:text-[#0B1F33]">Properties</Link>
            <span>/</span>
            <Link to="/map?mode=partner&filter=Properties" className="hover:text-[#0B1F33]">Map</Link>
            <span>/</span>
            <span className="text-[#0B1F33]">{building.name}</span>
          </div>

          <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#B38F4F]">Building intelligence</p>
              <h1 className="mt-3 font-heading text-4xl font-medium leading-none tracking-normal text-[#0B1F33] md:text-6xl">
                {building.name}
              </h1>
              <p className="mt-4 max-w-3xl text-[15px] leading-7 text-[#0B1F33]/66">{building.positioning}</p>

              <div className="mt-5 flex flex-wrap gap-2">
                {[building.address, building.district, building.walkScore, building.availability].map((chip) => (
                  <span key={chip} className="rounded-[3px] border border-[#0B1F33]/10 bg-[#F7F8FB] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#0B1F33]/64">
                    {chip}
                  </span>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/map?mode=resident&tab=pass"
                  className="inline-flex h-10 items-center gap-2 rounded-[3px] bg-[#0B1F33] px-4 text-[12px] font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#081521]"
                >
                  Resident card
                  <CreditCard className="h-4 w-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => setShowReservation(true)}
                  className="inline-flex h-10 items-center gap-2 rounded-[3px] border border-[#0B1F33]/10 bg-white px-4 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#0B1F33] transition-colors hover:bg-[#F7F8FB]"
                >
                  Reserve amenity
                  <Calendar className="h-4 w-4" />
                </button>
                <Link
                  to={`/map?mode=partner&tab=map&filter=Properties&entityId=${building.id}`}
                  className="inline-flex h-10 items-center gap-2 rounded-[3px] border border-[#0B1F33]/10 bg-white px-4 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#0B1F33] transition-colors hover:bg-[#F7F8FB]"
                >
                  Open map
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="rounded-lg border border-[#0B1F33]/8 bg-[#F7F8FB] p-4">
              <div className="grid grid-cols-2 gap-3">
                <StatTile label="Homes" value={building.unitCount} />
                <StatTile label="Occupancy" value={building.occupancy} />
                <StatTile label="Card starts" value={building.cardActivations} />
                <StatTile label="From" value={building.priceFrom} />
              </div>
              <div className="mt-3 rounded-lg bg-[#0B1F33] p-4 text-white">
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/58">Resident mix</div>
                <p className="mt-2 text-[13px] leading-6 text-white/78">{building.residentMix}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="sticky top-[64px] z-20 border-b border-[#0B1F33]/8 bg-white/95 px-5 backdrop-blur">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto py-3">
          {BUILDING_ROUTE_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => selectBuildingTab(tab.id)}
              aria-controls={tabContentId}
              aria-selected={activeTab === tab.id}
              className={`shrink-0 rounded-[3px] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] transition ${
                activeTab === tab.id
                  ? "bg-[#0B1F33] text-white"
                  : "border border-[#0B1F33]/8 bg-white text-[#0B1F33]/58 hover:text-[#0B1F33]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      <section className="px-5 py-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <SectionIntro {...activeCopy} />
            <div className="rounded-lg border border-[#0B1F33]/8 bg-white p-5">
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#0B1F33]/48">Why this is useful</div>
              <div className="mt-4 space-y-3">
                {building.lifestyleUnlocks.map((item) => (
                  <div key={item} className="flex gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#B38F4F]" />
                    <p className="text-[13px] leading-6 text-[#0B1F33]/66">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div id={tabContentId} className="mt-8" role="tabpanel" aria-live="polite">
            {activeTab === "overview" && (
              <div className="grid gap-6">
                <div className="grid gap-3 md:grid-cols-4">
                  {building.reports.map((item) => (
                    <StatTile key={item.label} label={item.label} value={item.value} detail={item.detail} />
                  ))}
                </div>
                <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
                  <InfoBlock icon={Building2} title="Amenities in the building" items={building.amenities} />
                  <InfoBlock icon={MapPin} title="What is easy nearby" items={building.residentConveniences} />
                </div>
              </div>
            )}

            {activeTab === "residents" && (
              <CardGrid>
                {building.residents.map((resident) => (
                  <div key={resident.name} className="rounded-lg border border-[#0B1F33]/8 bg-white p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-heading text-xl font-medium tracking-normal">{resident.name}</div>
                        <div className="mt-1 text-[12px] text-[#0B1F33]/50">Unit {resident.unit}</div>
                      </div>
                      <Users className="h-4 w-4 text-[#B38F4F]" />
                    </div>
                    <div className="mt-4 space-y-2 text-[13px] text-[#0B1F33]/64">
                      <div>Status: {resident.status}</div>
                      <div>Use pattern: {resident.segment}</div>
                      <div>Comes back for: {resident.favorite}</div>
                    </div>
                  </div>
                ))}
              </CardGrid>
            )}

            {activeTab === "amenities" && (
              <CardGrid>
                {building.amenities.map((amenity) => (
                  <div key={amenity} className="rounded-lg border border-[#0B1F33]/8 bg-white p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-heading text-xl font-medium tracking-normal">{amenity}</div>
                      <button
                        type="button"
                        onClick={() => setShowReservation(true)}
                        className="rounded-[3px] bg-[#0B1F33] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-white"
                      >
                        Reserve
                      </button>
                    </div>
                    <p className="mt-3 text-[13px] leading-6 text-[#0B1F33]/62">
                      Keep the amenity simple to book, then point residents toward what is nearby before or after.
                    </p>
                  </div>
                ))}
              </CardGrid>
            )}

            {activeTab === "maintenance" && (
              <div className="space-y-3">
                {building.maintenance.map((ticket) => (
                  <div key={ticket.title} className="rounded-lg border border-[#0B1F33]/8 bg-white p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 font-heading text-xl font-medium tracking-normal">
                          <Wrench className="h-4 w-4 text-[#B38F4F]" />
                          {ticket.title}
                        </div>
                        <div className="mt-2 text-[13px] text-[#0B1F33]/62">Location: {ticket.location}</div>
                      </div>
                      <div className="flex gap-2 text-[10px] font-semibold uppercase tracking-[0.12em]">
                        <span className="rounded-[3px] border border-[#B38F4F]/30 bg-white px-3 py-1.5 text-[#0B1F33]">{ticket.priority}</span>
                        <span className="rounded-[3px] border border-[#0B1F33]/10 bg-[#F7F8FB] px-3 py-1.5 text-[#0B1F33]/62">{ticket.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "reports" && (
              <CardGrid>
                {building.reports.map((report) => (
                  <div key={report.label} className="rounded-lg border border-[#0B1F33]/8 bg-white p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#0B1F33]/48">{report.label}</div>
                        <div className="mt-2 font-heading text-3xl font-medium tracking-normal text-[#B38F4F]">{report.value}</div>
                      </div>
                      <ClipboardList className="h-4 w-4 text-[#0B1F33]" />
                    </div>
                    <p className="mt-3 text-[13px] leading-6 text-[#0B1F33]/64">{report.detail}</p>
                  </div>
                ))}
              </CardGrid>
            )}

            {activeTab === "partners" && (
              <CardGrid>
                {building.partners.map((partner) => (
                  <div key={partner.name} className="rounded-lg border border-[#0B1F33]/8 bg-white p-5">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#0B1F33]/48">{partner.category}</div>
                    <div className="mt-2 font-heading text-xl font-medium tracking-normal">{partner.name}</div>
                    <div className="mt-2 text-[13px] font-semibold text-[#B38F4F]">{partner.result}</div>
                    <p className="mt-3 text-[13px] leading-6 text-[#0B1F33]/64">{partner.context}</p>
                  </div>
                ))}
              </CardGrid>
            )}
          </div>
        </div>
      </section>

      <section className="border-y border-[#0B1F33]/8 bg-white px-5 py-10">
        <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[1.25fr_0.75fr]">
          <div>
            <div className="mb-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#B38F4F]">{building.shortLabel} nearby map</p>
              <h2 className="mt-2 font-heading text-3xl font-medium tracking-normal">The building and what is close enough to matter.</h2>
            </div>
            <div className="h-[420px] overflow-hidden rounded-lg border border-[#0B1F33]/8">
              <MapShell
                items={building.nearby}
                selected={selectedMapItem}
                onSelect={setSelectedNearby}
                markerIcon={buildingMarkerIcon}
                center={[building.coordinates.latitude, building.coordinates.longitude]}
                zoom={15}
              />
            </div>
          </div>
          <aside className="rounded-lg border border-[#0B1F33]/8 bg-[#F7F8FB] p-5 lg:self-end">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#0B1F33]/48">
                  {selectedMapItem?.label || "Nearby"}
                </p>
                <h3 className="mt-2 font-heading text-2xl font-medium tracking-normal">{selectedMapItem?.title}</h3>
              </div>
              {selectedNearby ? (
                <button
                  type="button"
                  onClick={() => setSelectedNearby(null)}
                  className="rounded-[3px] border border-[#0B1F33]/10 bg-white p-2"
                  aria-label="Clear selected place"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>
            <p className="mt-3 text-[13px] leading-6 text-[#0B1F33]/64">{selectedMapItem?.description}</p>
            <div className="mt-4 rounded-lg bg-[#0B1F33] p-4 text-white">
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/58">Activity</div>
              <div className="mt-2 font-heading text-3xl font-medium text-[#B38F4F]">
                {selectedMapItem?.value?.toLocaleString?.() || selectedMapItem?.value || "Live"}
              </div>
            </div>
          </aside>
        </div>
      </section>

      <Dialog open={showReservation} onOpenChange={setShowReservation}>
        <DialogContent className="max-w-xl border-[#0B1F33]/10 bg-[#F7F8FB]">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl font-medium tracking-normal">
              Reserve an amenity at {building.name}
            </DialogTitle>
          </DialogHeader>
          <AmenityReservationForm building={building} amenities={building.amenities} onClose={() => setShowReservation(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CardGrid({ children }) {
  return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{children}</div>;
}

function InfoBlock({ icon: Icon, title, items }) {
  return (
    <div className="rounded-lg border border-[#0B1F33]/8 bg-white p-5">
      <div className="mb-4 flex items-center gap-2 font-heading text-xl font-medium tracking-normal">
        <Icon className="h-4 w-4 text-[#B38F4F]" />
        {title}
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item} className="rounded-[3px] border border-[#0B1F33]/10 bg-[#F7F8FB] px-3 py-1.5 text-[12px] text-[#0B1F33]/66">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
