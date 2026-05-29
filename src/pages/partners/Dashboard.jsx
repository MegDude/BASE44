import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  Eye,
  Layers3,
  Radio,
  Search,
  Users,
  ChevronDown,
  ChevronUp,
  Clock,
} from "lucide-react";
import { useEventRsvpStore } from "@/store/event-rsvp-store";
import { getHappyHourPlaces, saveHappyHour } from "@/lib/happyHours";

const anchors = [
  {
    id: "the-bowie",
    name: "The Bowie",
    district: "Seaholm",
    role: "Main building",
    insight: "People nearby look for coffee, lunch, and after-work plans around this building.",
  },
  {
    id: "amli-downtown",
    name: "AMLI Downtown",
    district: "2nd Street",
    role: "Apartment building",
    insight: "More residents open their card around events and weekend plans.",
  },
  {
    id: "the-independent",
    name: "The Independent",
    district: "Seaholm",
    role: "Apartment building",
    insight: "People nearby often look for dining, fitness, and apartments in the same trip.",
  },
  {
    id: "the-austonian",
    name: "The Austonian",
    district: "Congress",
    role: "Apartment building",
    insight: "Hotels, events, and popular venues bring more people into this area.",
  },
];

const metrics = [
  {
    id: "reach",
    label: "People nearby",
    value: "18.4k",
    detail: "People active in nearby downtown areas.",
    shows: "This estimates how many people are close enough to do something right now.",
    example: "Example: a Four Seasons guest guide reaches guests already deciding where to eat after check-in.",
  },
  {
    id: "yield",
    label: "Took action",
    value: "24%",
    detail: "People who saved, scanned, RSVP'd, or asked for directions.",
    shows: "This shows whether people did something useful after seeing the campaign.",
    example: "Example: a Legends Real Estate listing campaign counts saves, scans, and showing intent.",
  },
  {
    id: "impact",
    label: "Map lift",
    value: "3.8x",
    detail: "How much better this performs when it appears on the map at the right time.",
    shows: "This compares map-timed placement against passive visibility.",
    example: "Example: a YETI district placement performs better when tied to a rooftop or event moment.",
  },
  {
    id: "flux",
    label: "Resident activity",
    value: "+31%",
    detail: "Change in resident activity around the selected area.",
    shows: "This reads whether residents are moving, opening cards, and making plans in that area.",
    example: "Example: a Lululemon run club should bring more morning activity near participating buildings.",
  },
];

const campaignSteps = ["Setup", "People", "Area", "Timing", "Access", "Placement", "Preview", "Launch"];

const campaignStepDetails = {
  Setup: {
    title: "Define the campaign goal",
    body: "Pick the thing you want people to do: save a place, scan a QR, RSVP, redeem a perk, request a showing, join an event, or visit a partner.",
    example: "Legends Real Estate might start with: get downtown residents to request showings for new listings this month.",
  },
  People: {
    title: "Choose who should see it",
    body: "Choose residents, hotel guests, people near an event, building prospects, or people already searching for something related.",
    example: "Rivian can focus on people near hotels, events, and mobility stops instead of showing up everywhere.",
  },
  Area: {
    title: "Set the walkable area",
    body: "The campaign should only appear where it still feels easy to act. A five-minute walk usually beats a large loose radius.",
    example: "Banger's works best around Rainey because the action is immediate: lunch, drinks, event arrival, or weekend plans.",
  },
  Timing: {
    title: "Run it when decisions happen",
    body: "Choose a time window that matches the behavior: coffee in the morning, lunch mid-day, events before arrival, drinks after work.",
    example: "Hotel Van Zandt can surface dinner and music options between check-in and evening plans.",
  },
  Access: {
    title: "Decide what people get",
    body: "This is the simple hook: resident rate, QR unlock, RSVP access, event reminder, private appointment, survey, or local guide.",
    example: "Four Seasons can offer a curated guest guide that feels like service, not advertising.",
  },
  Placement: {
    title: "Place it where it belongs",
    body: "Tie the campaign to a building, venue, event, district, QR surface, or map category so it feels native to the moment.",
    example: "YETI can place a product moment inside an Austin outdoor/event corridor instead of a generic ad slot.",
  },
  Preview: {
    title: "Check what residents will see",
    body: "Preview the map card, QR path, offer language, district context, and what action will be measured.",
    example: "Lululemon can preview how a run-club RSVP appears to nearby residents before launching.",
  },
  Launch: {
    title: "Go live and watch behavior",
    body: "Once live, the report tracks scans, saves, redemptions, RSVPs, directions, and activity by district and time.",
    example: "The Paseo can see which nearby experiences residents actually use after a lobby QR scan.",
  },
};

const brandCampaignExamples = [
  {
    brand: "Legends Real Estate",
    route: "/brands/analytics?brand=legends",
    format: "Verified listing campaign",
    result: "Measures saves, scans, showing intent, and nearby residential demand.",
    metric: "Yield",
  },
  {
    brand: "YETI",
    route: "/brands/yeti",
    format: "Austin brand moment",
    result: "Tracks district placement, event tie-ins, QR scans, and product interest near outdoor/social moments.",
    metric: "Map lift",
  },
  {
    brand: "Rivian",
    route: "/brands/rivian",
    format: "Downtown test-drive moment",
    result: "Connects test-drive or product interest to hotels, residences, events, and walkable downtown plans.",
    metric: "People nearby",
  },
  {
    brand: "Four Seasons",
    route: "/brands/four-seasons",
    format: "Hospitality guide",
    result: "Shows how guests use dining, wellness, events, and saved places after scanning from the stay experience.",
    metric: "Resident activity",
  },
  {
    brand: "Lululemon",
    route: "/brands/lululemon",
    format: "Run club and wellness",
    result: "Reads RSVPs, morning movement, repeat attendance, and building-linked wellness interest.",
    metric: "Took action",
  },
];

const matrixColumns = [
  {
    id: "intent",
    title: "What people want nearby",
    icon: Layers3,
    metricId: "yield",
    description: "Searches, saves, scans, and card views grouped by time of day.",
  },
  {
    id: "audience",
    title: "Who is nearby",
    icon: Users,
    metricId: "reach",
    description: "Residents, hotel guests, and event visitors tied to the selected building.",
  },
  {
    id: "activation",
    title: "Best next move",
    icon: BarChart3,
    metricId: "impact",
    description: "Simple next steps based on timing, walking distance, and resident card use.",
  },
];

const matrixRows = [
  {
    id: "morning",
    label: "Morning",
    timing: "7-10 AM",
    cells: {
      intent: {
        value: "Coffee + wellness",
        score: "74",
        detail: "People open their card and search for coffee, lobby stops, and fitness before work.",
        action: "Show a weekday resident offer within a 5-minute walk.",
      },
      audience: {
        value: "Regular resident trips",
        score: "68",
        detail: "Residents and nearby hotel guests often make quick morning stops in the same area.",
        action: "Focus on buildings where people already use the card in the morning.",
      },
      activation: {
        value: "Breakfast timing",
        score: "61",
        detail: "Short offers work best before people leave the area for the day.",
        action: "Run a simple morning offer that people can scan quickly.",
      },
    },
  },
  {
    id: "lunch",
    label: "Lunch",
    timing: "11 AM-2 PM",
    cells: {
      intent: {
        value: "Dining decisions",
        score: "89",
        detail: "Searches, saves, and directions rise when residents compare nearby lunch options.",
        action: "Feature restaurants and quick-service spots near the selected building.",
      },
      audience: {
        value: "Workers and residents",
        score: "82",
        detail: "Residents, office workers, and hotel guests are nearby at the same time.",
        action: "Show lunch options to everyone near this building.",
      },
      activation: {
        value: "Best walking area",
        score: "86",
        detail: "Lunch offers work best when they are close enough to walk to right away.",
        action: "Set the area to a 5-minute walk and keep the message simple.",
      },
    },
  },
  {
    id: "evening",
    label: "Evening",
    timing: "5-8 PM",
    cells: {
      intent: {
        value: "Plans forming",
        score: "81",
        detail: "Event searches, saved places, and card opens rise as residents decide where to go next.",
        action: "Surface dining, events, and rooftop options together.",
      },
      audience: {
        value: "Hotel and venue traffic",
        score: "76",
        detail: "Residents, hotel guests, and venue visitors are nearby after work.",
        action: "Connect hotel and venue partners to this building's area.",
      },
      activation: {
        value: "Before-event timing",
        score: "79",
        detail: "Offers work best before the busiest event arrivals begin.",
        action: "Show the offer before the rush, not in the middle of it.",
      },
    },
  },
  {
    id: "weekend",
    label: "Weekend",
    timing: "Fri-Sun",
    cells: {
      intent: {
        value: "Weekend browsing",
        score: "72",
        detail: "Saved places, perks, and apartment views rise when people make flexible weekend plans.",
        action: "Group nearby experiences together instead of promoting one lonely offer.",
      },
      audience: {
        value: "Guests and residents",
        score: "78",
        detail: "Residents, hotel guests, event visitors, and friends are all in the area.",
        action: "Use the resident card to connect hotels with local places.",
      },
      activation: {
        value: "People staying nearby",
        score: "84",
        detail: "People act more often when the place is close and the card is easy to use.",
        action: "Promote places people can reach without leaving the area.",
      },
    },
  },
];

const matrixInstructions = [
  {
    step: "1",
    title: "Choose the time",
    body: "Start with the row that matches when people are most likely to act: morning, lunch, evening, or weekend.",
  },
  {
    step: "2",
    title: "Choose the question",
    body: "Pick what you need to understand: what people want, who is nearby, or the best next move.",
  },
  {
    step: "3",
    title: "Use the side panel",
    body: "The right side explains the selected cell, shows the timing score, and turns it into a simple campaign step.",
  },
];

function ButtonLink({ to, children, variant = "primary" }) {
  const base =
    "inline-flex h-10 items-center justify-center gap-2 rounded-md px-5 text-xs font-semibold uppercase tracking-[0.16em] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F]";
  const styles =
    variant === "primary"
      ? "bg-[#0B1F33] text-white hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(11,31,51,0.18)]"
      : "border border-[#0B1F33]/12 bg-white text-[#0B1F33] hover:-translate-y-0.5 hover:border-[#B38F4F]/60";
  return (
    <Link to={to} className={`${base} ${styles}`}>
      {children}
    </Link>
  );
}

function AnchorBadge({ anchor, active }) {
  const initials = anchor.name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <span
      className={`flex h-20 w-full items-center justify-center rounded-md border ${
        active
          ? "border-[#B38F4F]/60 bg-white/10 text-[#B38F4F]"
          : "border-[#0B1F33]/8 bg-[#F7F8FB] text-[#0B1F33]"
      }`}
      aria-hidden="true"
    >
      <span className={`flex h-11 w-11 items-center justify-center rounded-md border ${active ? "border-[#B38F4F]/50 bg-[#0B1F33]" : "border-[#B38F4F]/40 bg-white"}`}>
        <Building2 className="h-5 w-5 text-[#B38F4F]" />
      </span>
      <span className="sr-only">{initials}</span>
    </span>
  );
}

export default function PartnersDashboard() {
  const navigate = useNavigate();
  const eventRsvps = useEventRsvpStore((state) => state.rsvps);
  const [selectedAnchor, setSelectedAnchor] = useState(anchors[0]);
  const [selectedMetric, setSelectedMetric] = useState(metrics[0]);
  const [selectedDistrict, setSelectedDistrict] = useState("All");
  const [activeStep, setActiveStep] = useState("Setup");
  const [visibility, setVisibility] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedMatrixCell, setSelectedMatrixCell] = useState({ rowId: "lunch", columnId: "activation" });
  const [anchorsExpanded, setAnchorsExpanded] = useState(false);
  const [queueExpanded, setQueueExpanded] = useState(false);
  const [queue, setQueue] = useState([
    "Seaholm lunch plan",
    "Weekend resident card offer",
  ]);
  const [happyHours, setHappyHours] = useState(() => getHappyHourPlaces());
  const [happyHourSaved, setHappyHourSaved] = useState("");
  const [happyHourForm, setHappyHourForm] = useState({
    venueName: "Reina Rooftop",
    district: "Downtown Austin",
    address: "206 Trinity Street, Austin, TX 78701",
    latitude: "30.263998",
    longitude: "-97.740641",
    days: "Mon-Fri",
    time: "4-6 PM",
    offer: "$2 off select cocktails and spritzes",
    details: "Rooftop drinks downtown, easy to save before dinner or a show.",
  });

  const visibleAnchors = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return anchors.filter((anchor) => {
      if (selectedDistrict !== "All" && anchor.district !== selectedDistrict) return false;
      if (!normalized) return true;
      return [anchor.name, anchor.district, anchor.role, anchor.insight].join(" ").toLowerCase().includes(normalized);
    });
  }, [query, selectedDistrict]);

  const displayedAnchors = anchorsExpanded ? visibleAnchors : visibleAnchors.slice(0, 2);
  const hiddenAnchorCount = Math.max(0, visibleAnchors.length - displayedAnchors.length);
  const displayedQueue = queueExpanded ? queue : queue.slice(0, 3);
  const hiddenQueueCount = Math.max(0, queue.length - displayedQueue.length);

  const matrixContext = useMemo(() => {
    const row = matrixRows.find((item) => item.id === selectedMatrixCell.rowId) ?? matrixRows[0];
    const column = matrixColumns.find((item) => item.id === selectedMatrixCell.columnId) ?? matrixColumns[0];
    const cell = row.cells[column.id];
    return { row, column, cell };
  }, [selectedMatrixCell]);

  function selectMatrixCell(rowId, columnId) {
    const column = matrixColumns.find((item) => item.id === columnId);
    const metric = metrics.find((item) => item.id === column?.metricId);
    setSelectedMatrixCell({ rowId, columnId });
    if (metric) setSelectedMetric(metric);
  }

  function launchCampaign() {
    const label = `${selectedAnchor.name} ${activeStep.toLowerCase()} plan`;
    setQueue((items) => [label, ...items.filter((item) => item !== label)].slice(0, 5));
    navigate(`/partners/campaigns?entityId=${selectedAnchor.id}&district=${selectedAnchor.district}`);
  }

  function submitHappyHour(event) {
    event.preventDefault();
    const saved = saveHappyHour({
      venueName: happyHourForm.venueName,
      name: `${happyHourForm.venueName} Happy Hour`,
      latitude: Number(happyHourForm.latitude),
      longitude: Number(happyHourForm.longitude),
      district: happyHourForm.district,
      address: happyHourForm.address,
      summary: happyHourForm.details,
      happyHour: {
        days: happyHourForm.days,
        time: happyHourForm.time,
        offer: happyHourForm.offer,
        details: happyHourForm.details,
        redemption: "Show your Downtown Perks Card when you arrive.",
      },
    });
    setHappyHours(getHappyHourPlaces());
    setHappyHourSaved(saved.name);
    setQueue((items) => [`${saved.venueName || saved.name} happy hour added`, ...items].slice(0, 5));
  }

  return (
    <main className="bg-[#F7F8FB] text-[#0B1F33]">
      <section className="mx-auto max-w-7xl px-4 pb-12 pt-28 sm:px-5 lg:px-5">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0B1F33]/58">Partner Workspace</p>
            <h1 className="mt-4 max-w-3xl font-heading text-4xl font-medium leading-[0.96] tracking-normal text-[#0B1F33] md:text-4xl">
              See what is working nearby.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#0B1F33]/64">
              Track what people are looking at, saving, scanning, and using around each building.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink to="/map?mode=partner&tab=map">Open map</ButtonLink>
              <ButtonLink to="/partners/happy-hours" variant="secondary">Manage happy hours</ButtonLink>
              <ButtonLink to="/partner-workspace/reports" variant="secondary">View reports</ButtonLink>
            </div>
          </div>
          <div className="rounded-lg border border-[#0B1F33]/8 bg-white/82 p-4 shadow-[0_18px_44px_rgba(11,31,51,0.10)] backdrop-blur-xl">
            <label className="flex h-10 items-center gap-3 rounded-md border border-[#0B1F33]/8 bg-white px-4">
              <Search className="h-4 w-4 text-[#0B1F33]/45" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search buildings, campaigns, or areas..."
                className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-[#0B1F33]/38"
              />
            </label>
            <div className="mt-4 flex flex-wrap gap-2">
              {["All", "Seaholm", "2nd Street", "Congress"].map((district) => (
                <button
                  key={district}
                  type="button"
                  onClick={() => setSelectedDistrict(district)}
                  className={`rounded-md border px-3 py-2 text-xs font-semibold transition ${
                    selectedDistrict === district
                      ? "border-[#0B1F33] bg-[#0B1F33] text-white"
                      : "border-[#0B1F33]/10 bg-white text-[#0B1F33]"
                  }`}
                >
                  {district}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-5 lg:px-5">
        <div className="grid gap-3 md:grid-cols-4">
          {metrics.map((metric) => (
            <button
              key={metric.id}
              type="button"
              onClick={() => setSelectedMetric(metric)}
              className={`rounded-lg border p-5 text-left transition-all hover:-translate-y-0.5 ${
                selectedMetric.id === metric.id
                  ? "border-[#B38F4F]/70 bg-[#0B1F33] text-white shadow-[0_18px_44px_rgba(11,31,51,0.16)]"
                  : "border-[#0B1F33]/8 bg-white/82 text-[#0B1F33] backdrop-blur-xl"
              }`}
            >
              <div className="text-xs font-semibold uppercase tracking-[0.16em] opacity-70">{metric.label}</div>
              <div className="mt-3 text-3xl font-semibold">{metric.value}</div>
              <div className="mt-2 text-[13px] leading-6 opacity-70">{metric.detail}</div>
              <div className={`mt-4 rounded-md border p-3 text-[12px] leading-5 ${
                selectedMetric.id === metric.id ? "border-white/14 bg-white/8 text-white/78" : "border-[#0B1F33]/8 bg-[#F7F8FB] text-[#0B1F33]/64"
              }`}>
                <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] opacity-70">What this shows</span>
                <span className="mt-1 block">{metric.shows}</span>
              </div>
              <div className="mt-2 text-[11px] leading-5 opacity-62">{metric.example}</div>
            </button>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-5 lg:px-5">
        <div className="rounded-lg border border-[#0B1F33]/8 bg-white/82 p-5 shadow-[0_18px_44px_rgba(11,31,51,0.08)] backdrop-blur-xl">
          <div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0B1F33]/52">Event RSVPs</p>
              <h2 className="mt-2 font-heading text-3xl font-medium">Plans residents have said yes to.</h2>
              <p className="mt-3 text-[13px] leading-6 text-[#0B1F33]/62">
                When someone RSVPs on the Events page, it appears here so partners can see what is pulling people out the door.
              </p>
            </div>
            <div className="grid gap-2">
              {eventRsvps.length ? (
                eventRsvps.slice(0, 5).map((event) => (
                  <div key={event.id} className="grid gap-3 rounded-md border border-[#0B1F33]/8 bg-[#F7F8FB] p-3 sm:grid-cols-[1fr_auto] sm:items-center">
                    <div className="min-w-0">
                      <div className="truncate text-[13px] font-semibold text-[#0B1F33]">{event.title}</div>
                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-[#0B1F33]/58">
                        <span>{event.time}</span>
                        <span>{event.venue}</span>
                        <span>{event.category}</span>
                      </div>
                    </div>
                    <span className="w-fit rounded-md border border-[#B38F4F]/35 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#0B1F33]/66">
                      Resident RSVP
                    </span>
                  </div>
                ))
              ) : (
                <div className="rounded-md border border-[#0B1F33]/8 bg-[#F7F8FB] p-4 text-[13px] leading-6 text-[#0B1F33]/62">
                  No event RSVPs yet. Once residents RSVP from the Events page, they will show up here for partner reporting.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-5 lg:px-5">
        <div className="rounded-lg border border-[#0B1F33]/8 bg-white/82 p-5 shadow-[0_18px_44px_rgba(11,31,51,0.08)] backdrop-blur-xl">
          <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0B1F33]/52">Happy hour map</p>
              <h2 className="mt-2 font-heading text-3xl font-medium">Add a happy hour once. It shows up on the map.</h2>
              <p className="mt-3 text-[13px] leading-6 text-[#0B1F33]/62">
                Partners can enter the days, time, offer, and location here. The happy hour gets its own gold pin and opens with the venue details residents need.
              </p>
              <div className="mt-4 grid gap-2">
                {happyHours.slice(0, 4).map((item) => (
                  <Link
                    key={item.id}
                    to={`/map?mode=partner&tab=map&filter=Happy%20Hours&entityId=${item.id}`}
                    className="grid gap-2 rounded-md border border-[#0B1F33]/8 bg-[#F7F8FB] p-3 text-left transition hover:-translate-y-0.5 hover:border-[#B38F4F]/45 sm:grid-cols-[1fr_auto] sm:items-center"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-semibold text-[#0B1F33]">{item.venueName || item.name}</span>
                      <span className="mt-1 block truncate text-[11px] text-[#0B1F33]/58">
                        {item.happyHour?.days} · {item.happyHour?.time} · {item.district}
                      </span>
                    </span>
                    <span className="inline-flex w-fit items-center gap-1.5 rounded-md border border-[#B38F4F]/35 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#0B1F33]">
                      <Clock className="h-3.5 w-3.5 text-[#B38F4F]" />
                      Map live
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            <form onSubmit={submitHappyHour} className="rounded-lg border border-[#0B1F33]/8 bg-[#F7F8FB] p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ["venueName", "Venue name"],
                  ["district", "District"],
                  ["address", "Address"],
                  ["days", "Days"],
                  ["time", "Time"],
                  ["offer", "Offer"],
                  ["latitude", "Latitude"],
                  ["longitude", "Longitude"],
                ].map(([key, label]) => (
                  <label key={key} className={key === "address" || key === "offer" ? "grid gap-1 sm:col-span-2" : "grid gap-1"}>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#0B1F33]/50">{label}</span>
                    <input
                      value={happyHourForm[key]}
                      onChange={(event) => setHappyHourForm((form) => ({ ...form, [key]: event.target.value }))}
                      required
                      className="h-10 rounded-md border border-[#0B1F33]/8 bg-white px-3 text-[13px] text-[#0B1F33] outline-none focus:border-[#B38F4F]/70"
                    />
                  </label>
                ))}
                <label className="grid gap-1 sm:col-span-2">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#0B1F33]/50">Details residents should see</span>
                  <textarea
                    value={happyHourForm.details}
                    onChange={(event) => setHappyHourForm((form) => ({ ...form, details: event.target.value }))}
                    required
                    className="min-h-20 rounded-md border border-[#0B1F33]/8 bg-white px-3 py-2 text-[13px] leading-5 text-[#0B1F33] outline-none focus:border-[#B38F4F]/70"
                  />
                </label>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  className="inline-flex h-10 items-center justify-center rounded-md bg-[#0B1F33] px-4 text-[12px] font-semibold uppercase tracking-[0.14em] text-white transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F]"
                >
                  Save happy hour
                </button>
                <Link
                  to="/map?mode=partner&tab=map&filter=Happy%20Hours"
                  className="inline-flex h-10 items-center justify-center rounded-md border border-[#0B1F33]/8 bg-white px-4 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#0B1F33]/64 transition hover:border-[#B38F4F]/45 hover:text-[#0B1F33]"
                >
                  View on map
                </Link>
                {happyHourSaved && (
                  <span className="text-[12px] font-medium text-[#0B1F33]/62">{happyHourSaved} is live on the happy hour map.</span>
                )}
              </div>
            </form>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-16 sm:px-5 lg:grid-cols-[0.9fr_1.1fr] lg:px-5">
        <div className="rounded-lg border border-[#0B1F33]/8 bg-white/82 p-4 shadow-[0_18px_44px_rgba(11,31,51,0.10)] backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0B1F33]/52">Resident buildings</p>
              <h2 className="mt-2 font-heading text-3xl font-medium">The Bowie is the main building here.</h2>
            </div>
            <Building2 className="h-6 w-6 text-[#B38F4F]" />
          </div>
          <div className="mt-5 space-y-3">
            {displayedAnchors.map((anchor) => (
              <button
                key={anchor.id}
                type="button"
                onClick={() => setSelectedAnchor(anchor)}
                className={`grid w-full grid-cols-[86px_1fr] gap-4 rounded-md border p-3 text-left transition hover:-translate-y-0.5 ${
                  selectedAnchor.id === anchor.id
                    ? "border-[#B38F4F]/70 bg-[#0B1F33] text-white"
                    : "border-[#0B1F33]/8 bg-white text-[#0B1F33]"
                }`}
              >
                <AnchorBadge anchor={anchor} active={selectedAnchor.id === anchor.id} />
                <span>
                  <span className="block text-[13px] font-semibold">{anchor.name}</span>
                  <span className="mt-1 block text-xs uppercase tracking-[0.14em] opacity-60">{anchor.role} · {anchor.district}</span>
                  <span className="mt-2 block text-[13px] leading-5 opacity-75">{anchor.insight}</span>
                </span>
              </button>
            ))}
            {visibleAnchors.length > 2 && (
              <button
                type="button"
                onClick={() => setAnchorsExpanded((value) => !value)}
                className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-md border border-[#0B1F33]/8 bg-[#F7F8FB] px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#0B1F33]/62 transition hover:border-[#B38F4F]/45 hover:text-[#0B1F33] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F]"
                aria-expanded={anchorsExpanded}
              >
                {anchorsExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
                {anchorsExpanded ? "Show fewer buildings" : `Show more buildings (${hiddenAnchorCount} more)`}
              </button>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-[#0B1F33]/8 bg-white/82 shadow-[0_18px_44px_rgba(11,31,51,0.10)] backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#0B1F33]/8 p-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0B1F33]/52">Partner map</p>
              <h2 className="mt-1 text-xl font-semibold">{selectedAnchor.name} · {selectedAnchor.district}</h2>
            </div>
            <button
              type="button"
              onClick={() => setVisibility((value) => !value)}
              className={`inline-flex h-10 items-center gap-2 rounded-md border px-3 text-xs font-semibold uppercase tracking-[0.14em] ${
                visibility ? "border-[#B38F4F]/60 bg-[#0B1F33] text-white" : "border-[#0B1F33]/10 bg-white text-[#0B1F33]"
              }`}
              aria-pressed={visibility}
              aria-label={visibility ? "Turn map visibility off" : "Turn map visibility on"}
            >
              <Eye className="h-4 w-4" />
              {visibility ? "Map visibility on" : "Map visibility off"}
            </button>
          </div>
          <div className="relative min-h-[420px] bg-[#081521]">
            <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:72px_72px]" />
            {visibility ? (
              <>
                {["Resident activity", "Offer area", "Event traffic", "Hotel traffic"].map((label, index) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setSelectedMetric(metrics[index % metrics.length])}
                    className="absolute rounded-md border border-white/30 bg-white/14 px-3 py-2 text-xs font-semibold text-white backdrop-blur-md transition hover:-translate-y-0.5 hover:border-[#B38F4F]/70"
                    style={{ left: `${16 + index * 18}%`, top: `${22 + (index % 2) * 34}%` }}
                  >
                    {label}
                  </button>
                ))}
                <div className="absolute bottom-5 left-5 right-5 rounded-md border border-white/28 bg-white/12 p-4 text-white backdrop-blur-xl">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/62">
                    <Radio className="h-4 w-4 text-[#B38F4F]" />
                    Live on map
                  </div>
                  <p className="mt-2 text-[13px] leading-6 text-white/78">{selectedMetric.detail}</p>
                  <p className="mt-2 text-[12px] leading-5 text-white/58">
                    This campaign is visible around {selectedAnchor.name} in {selectedAnchor.district}. Click a map signal to see what it is measuring.
                  </p>
                </div>
              </>
            ) : (
              <div className="absolute inset-x-5 top-1/2 -translate-y-1/2 rounded-md border border-white/22 bg-white/12 p-5 text-white shadow-[0_18px_44px_rgba(0,0,0,0.14)] backdrop-blur-xl">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/62">
                  <Eye className="h-4 w-4 text-[#B38F4F]" />
                  Map visibility paused
                </div>
                <p className="mt-3 text-[13px] leading-6 text-white/78">
                  This hides the public map placement preview for {selectedAnchor.name}. Reports and draft campaign settings stay available.
                </p>
                <button
                  type="button"
                  onClick={() => setVisibility(true)}
                  className="mt-4 inline-flex h-9 items-center justify-center rounded-md border border-[#B38F4F]/55 bg-white px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0B1F33] transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F]"
                >
                  Show on map
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-5 lg:px-5">
        <div className="overflow-hidden rounded-lg border border-[#0B1F33]/8 bg-white/82 shadow-[0_18px_44px_rgba(11,31,51,0.10)] backdrop-blur-xl">
          <div className="grid gap-5 border-b border-[#0B1F33]/8 p-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0B1F33]/52">Interactive activity matrix</p>
              <h2 className="mt-2 font-heading text-3xl font-medium">What people do nearby, by time of day.</h2>
              <p className="mt-3 max-w-2xl text-[13px] leading-6 text-[#0B1F33]/62">
                Pick a time and a topic to see what people are doing near {selectedAnchor.name}.
              </p>
            </div>
            <div className="rounded-md border border-[#0B1F33]/8 bg-[#F7F8FB] p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#0B1F33]/52">
                {(() => {
                  const ActiveIcon = matrixContext.column.icon;
                  return <ActiveIcon className="h-4 w-4 text-[#B38F4F]" />;
                })()}
                Selected view
              </div>
              <div className="mt-2 text-[13px] font-semibold text-[#0B1F33]">
                {selectedAnchor.name} · {matrixContext.row.label} · {matrixContext.column.title}
              </div>
              <p className="mt-2 text-[13px] leading-6 text-[#0B1F33]/64">{matrixContext.cell.detail}</p>
            </div>
          </div>

          <div className="grid gap-3 border-b border-[#0B1F33]/8 bg-[#F7F8FB]/72 p-4 md:grid-cols-[0.9fr_1.1fr] md:items-start">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0B1F33]/50">How to use the matrix</p>
              <p className="mt-2 text-[13px] leading-6 text-[#0B1F33]/66">
                Use this like a planning board. Each box connects a time of day with a campaign question, then shows what to try next around {selectedAnchor.district}.
              </p>
              <p className="mt-2 text-[12px] leading-5 text-[#0B1F33]/54">
                The score is a quick signal, not a grade. Higher scores mean the timing, nearby audience, and action are lining up better.
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              {matrixInstructions.map((item) => (
                <div key={item.step} className="rounded-md border border-[#0B1F33]/8 bg-white p-3 shadow-[0_10px_24px_rgba(11,31,51,0.04)]">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#0B1F33] text-[11px] font-semibold text-[#B38F4F]">
                      {item.step}
                    </span>
                    <span className="text-[12px] font-semibold text-[#0B1F33]">{item.title}</span>
                  </div>
                  <p className="mt-2 text-[11.5px] leading-5 text-[#0B1F33]/62">{item.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-[1fr_360px]">
            <div className="overflow-x-auto p-4">
              <div className="min-w-[780px]">
                <div className="grid grid-cols-[150px_repeat(3,minmax(180px,1fr))] gap-2">
                  <div className="rounded-md border border-[#0B1F33]/8 bg-[#F7F8FB] p-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#0B1F33]/52">
                    Timing
                  </div>
                  {matrixColumns.map((column) => {
                    const ColumnIcon = column.icon;
                    return (
                      <button
                        key={column.id}
                        type="button"
                        onClick={() => selectMatrixCell(matrixContext.row.id, column.id)}
                        className={`rounded-md border p-3 text-left transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F] ${
                          matrixContext.column.id === column.id
                            ? "border-[#B38F4F]/70 bg-[#0B1F33] text-white shadow-[0_14px_34px_rgba(11,31,51,0.14)]"
                            : "border-[#0B1F33]/8 bg-[#F7F8FB] text-[#0B1F33] hover:border-[#B38F4F]/45"
                        }`}
                      >
                        <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em]">
                          <ColumnIcon className="h-4 w-4 text-[#B38F4F]" />
                          {column.title}
                        </span>
                        <span className="mt-2 block text-xs leading-5 opacity-70">{column.description}</span>
                      </button>
                    );
                  })}

                  {matrixRows.map((row) => (
                    <div key={row.id} className="contents">
                      <button
                        type="button"
                        onClick={() => selectMatrixCell(row.id, matrixContext.column.id)}
                        className={`rounded-md border p-3 text-left transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F] ${
                          matrixContext.row.id === row.id
                            ? "border-[#B38F4F]/70 bg-[#0B1F33] text-white"
                            : "border-[#0B1F33]/8 bg-white text-[#0B1F33] hover:border-[#B38F4F]/45"
                        }`}
                      >
                        <span className="block text-[13px] font-semibold">{row.label}</span>
                        <span className="mt-1 block text-xs uppercase tracking-[0.14em] opacity-60">{row.timing}</span>
                      </button>
                      {matrixColumns.map((column) => {
                        const cell = row.cells[column.id];
                        const isSelected = matrixContext.row.id === row.id && matrixContext.column.id === column.id;
                        return (
                          <button
                            key={`${row.id}-${column.id}`}
                            type="button"
                            onClick={() => selectMatrixCell(row.id, column.id)}
                            aria-pressed={isSelected}
                            className={`rounded-md border p-3 text-left transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F] ${
                              isSelected
                                ? "border-[#B38F4F]/70 bg-[#0B1F33] text-white shadow-[0_18px_44px_rgba(11,31,51,0.16)]"
                                : "border-[#0B1F33]/8 bg-white text-[#0B1F33] hover:border-[#B38F4F]/45 hover:shadow-[0_12px_28px_rgba(11,31,51,0.08)]"
                            }`}
                          >
                            <span className="flex items-center justify-between gap-3">
                              <span className="text-[13px] font-semibold">{cell.value}</span>
                              <span className={`rounded-[4px] border px-2 py-1 text-[11px] font-semibold ${isSelected ? "border-white/20 bg-white/10" : "border-[#0B1F33]/8 bg-[#F7F8FB]"}`}>
                                {cell.score}
                              </span>
                            </span>
                            <span className="mt-2 block text-xs leading-5 opacity-70">{cell.detail}</span>
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <aside className="border-t border-[#0B1F33]/8 bg-[#F7F8FB] p-5 lg:border-l lg:border-t-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0B1F33]/52">What this means</p>
              <h3 className="mt-3 text-2xl font-semibold leading-tight text-[#0B1F33]">{matrixContext.cell.value}</h3>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-md border border-[#0B1F33]/8 bg-white p-3">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0B1F33]/48">Building</div>
                  <div className="mt-1 text-[13px] font-semibold">{selectedAnchor.name}</div>
                </div>
                <div className="rounded-md border border-[#0B1F33]/8 bg-white p-3">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0B1F33]/48">District</div>
                  <div className="mt-1 text-[13px] font-semibold">{selectedAnchor.district}</div>
                </div>
                <div className="rounded-md border border-[#0B1F33]/8 bg-white p-3">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0B1F33]/48">Window</div>
                  <div className="mt-1 text-[13px] font-semibold">{matrixContext.row.timing}</div>
                </div>
                <div className="rounded-md border border-[#0B1F33]/8 bg-white p-3">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0B1F33]/48">Score</div>
                  <div className="mt-1 text-[13px] font-semibold">{matrixContext.cell.score}/100</div>
                </div>
              </div>
              <div className="mt-4 rounded-md border border-[#0B1F33]/8 bg-white p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#0B1F33]/52">What to do next</div>
                <p className="mt-2 text-[13px] leading-6 text-[#0B1F33]/66">{matrixContext.cell.action}</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setActiveStep("Timing")}
                  className="inline-flex h-10 items-center justify-center rounded-md bg-[#0B1F33] px-4 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F]"
                >
                  Use this
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/map?mode=partner&tab=map&district=${encodeURIComponent(selectedAnchor.district)}&entityId=${selectedAnchor.id}`)}
                  className="inline-flex h-10 items-center justify-center rounded-md border border-[#0B1F33]/10 bg-white px-4 text-xs font-semibold uppercase tracking-[0.14em] text-[#0B1F33] transition hover:-translate-y-0.5 hover:border-[#B38F4F]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F]"
                >
                  View on map
                </button>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-5 lg:px-5">
        <div className="rounded-lg border border-[#0B1F33]/8 bg-white/82 p-5 shadow-[0_18px_44px_rgba(11,31,51,0.10)] backdrop-blur-xl">
          <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0B1F33]/52">Brand examples</p>
              <h2 className="mt-2 font-heading text-3xl font-medium">Examples from existing partner pages.</h2>
            </div>
            <Link to="/partners/brands" className="text-xs font-semibold uppercase tracking-[0.14em] text-[#0B1F33]/62 transition hover:text-[#0B1F33]">
              Brand partner page
            </Link>
          </div>
          <div className="grid gap-3 md:grid-cols-5">
            {brandCampaignExamples.map((example) => (
              <Link
                key={example.brand}
                to={example.route}
                className="rounded-md border border-[#0B1F33]/8 bg-[#F7F8FB] p-4 transition hover:-translate-y-0.5 hover:border-[#B38F4F]/50 hover:bg-white"
              >
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#B38F4F]">{example.metric}</div>
                <h3 className="mt-2 text-[13px] font-semibold text-[#0B1F33]">{example.brand}</h3>
                <div className="mt-1 text-[12px] font-medium text-[#0B1F33]/68">{example.format}</div>
                <p className="mt-3 text-[12px] leading-5 text-[#0B1F33]/62">{example.result}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-20 sm:px-5 lg:grid-cols-[1fr_0.9fr] lg:px-5">
        <div className="rounded-lg border border-[#0B1F33]/8 bg-white/82 p-5 backdrop-blur-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0B1F33]/52">Campaign builder</p>
          <h2 className="mt-2 font-heading text-3xl font-medium">Build a campaign around a place and time.</h2>
          <p className="mt-3 max-w-2xl text-[13px] leading-6 text-[#0B1F33]/62">
            Each step is a real campaign decision. The goal is to keep the setup simple enough for a QR code, a map card, and one clear action.
          </p>
          <div className="mt-5 grid gap-2 sm:grid-cols-4">
            {campaignSteps.map((step) => (
              <button
                key={step}
                type="button"
                onClick={() => setActiveStep(step)}
                className={`rounded-md border px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-[0.14em] ${
                  activeStep === step
                    ? "border-[#B38F4F]/70 bg-[#0B1F33] text-white"
                    : "border-[#0B1F33]/8 bg-white text-[#0B1F33]"
                }`}
              >
                {step}
              </button>
            ))}
          </div>
          <div className="mt-5 rounded-md border border-[#0B1F33]/8 bg-[#F7F8FB] p-4">
            <div className="text-[13px] font-semibold">{activeStep} · {selectedAnchor.name}</div>
            <div className="mt-1 text-xl font-semibold text-[#0B1F33]">{campaignStepDetails[activeStep].title}</div>
            <p className="mt-2 text-[13px] leading-6 text-[#0B1F33]/62">
              {campaignStepDetails[activeStep].body}
            </p>
            <div className="mt-3 rounded-md border border-[#B38F4F]/24 bg-white p-3 text-[12px] leading-5 text-[#0B1F33]/66">
              <span className="font-semibold text-[#0B1F33]">Example: </span>
              {campaignStepDetails[activeStep].example}
            </div>
          </div>
          <button
            type="button"
            onClick={launchCampaign}
            className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#0B1F33] px-5 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F]"
          >
            Launch campaign
            <ArrowRight className="h-4 w-4 text-[#B38F4F]" />
          </button>
        </div>

        <div className="rounded-lg border border-[#0B1F33]/8 bg-white/82 p-5 backdrop-blur-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0B1F33]/52">Planned campaigns</p>
          <p className="mt-2 text-[13px] leading-6 text-[#0B1F33]/62">
            These are drafts for the map. Each one connects a place, the people nearby, the right time, and one action to watch.
          </p>
          <div className="mt-4 space-y-3">
            {displayedQueue.map((item) => (
              <div key={item} className="rounded-md border border-[#0B1F33]/8 bg-white p-3">
                <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-[#B38F4F]" />
                  <span className="text-[13px] font-medium">{item}</span>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/map?mode=partner&tab=map")}
                  className="text-xs font-semibold uppercase tracking-[0.14em] text-[#0B1F33]/62 hover:text-[#0B1F33]"
                >
                  View map
                </button>
                </div>
                <p className="mt-2 pl-7 text-[12px] leading-5 text-[#0B1F33]/58">
                  Shows where it would appear, who is close by, and what action the report will watch first.
                </p>
              </div>
            ))}
            {queue.length > 3 && (
              <button
                type="button"
                onClick={() => setQueueExpanded((value) => !value)}
                className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-md border border-[#0B1F33]/8 bg-[#F7F8FB] px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#0B1F33]/62 transition hover:border-[#B38F4F]/45 hover:text-[#0B1F33] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F]"
                aria-expanded={queueExpanded}
              >
                {queueExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
                {queueExpanded ? "Show fewer planned campaigns" : `Show more planned campaigns (${hiddenQueueCount} more)`}
              </button>
            )}
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <ButtonLink to="/partner-workspace/reports" variant="secondary">Reports</ButtonLink>
            <ButtonLink to="/partners" variant="secondary">Partner overview</ButtonLink>
          </div>
        </div>
      </section>
    </main>
  );
}
