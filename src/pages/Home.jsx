import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  Coffee,
  Gift,
  LandPlot,
  MapPin,
  Megaphone,
  Search,
  Sparkles,
  Ticket,
  Wallet,
  Waves,
} from "lucide-react";

const neighborhoodChips = ["Rainey", "2nd Street", "Congress", "Seaholm", "West 6th"];
const categoryChips = ["Properties", "Venues", "Deals", "Events", "Resident Perks"];

const proofStats = [
  { label: "Residents", value: "7,000+" },
  { label: "Venues", value: "50+" },
  { label: "Corridor engagement", value: "3.8–4.2%" },
  { label: "No app required", value: "QR + text" },
];

const mapItems = [
  {
    id: 1,
    type: "Venue",
    title: "Jo's Coffee",
    subtitle: "Quick coffee, good Wi-Fi, morning reset",
    meta: "4 min walk · Nearby perk",
    action: "Save to Card",
    x: "22%",
    y: "62%",
  },
  {
    id: 2,
    type: "Event",
    title: "Rainey Happy Hour Set",
    subtitle: "Tonight · Live music + partner specials",
    meta: "8 min walk · RSVP open",
    action: "RSVP",
    x: "57%",
    y: "46%",
  },
  {
    id: 3,
    type: "Property",
    title: "The Quincy",
    subtitle: "Participating building with resident access",
    meta: "6 min walk · 12 venues nearby",
    action: "View Building",
    x: "72%",
    y: "28%",
  },
];

const nowCards = [
  {
    title: "Tonight on Rainey",
    label: "Event",
    text: "Live music, walkable drinks, one-tap RSVP.",
    cta: "Open in Map",
    href: "/events",
    icon: Calendar,
  },
  {
    title: "Lunch Perk Nearby",
    label: "Offer",
    text: "Save the perk now and unlock it when you walk in.",
    cta: "Save to Card",
    href: "/card",
    icon: Gift,
  },
  {
    title: "Weekly Highlight",
    label: "Roundup",
    text: "A faster read on what is actually worth leaving for.",
    cta: "See What's On",
    href: "/events",
    icon: Sparkles,
  },
];

const residentBenefits = [
  {
    title: "No app to download",
    text: "Open from QR or text and go straight to the useful part.",
    icon: Waves,
  },
  {
    title: "Real-time local discovery",
    text: "See what is nearby now instead of searching across five places.",
    icon: Search,
  },
  {
    title: "Plans and perks together",
    text: "Events, saved spots, and resident perks live in one layer.",
    icon: Wallet,
  },
  {
    title: "Built around walking",
    text: "Distance, timing, and corridor context help you decide faster.",
    icon: MapPin,
  },
];

const partnerTabs = {
  Properties: {
    problem: "Buildings need a better amenity story than static lists and generic local guides.",
    role: "Downtown Perks becomes a live neighborhood layer residents can actually use.",
    outcome: "Better resident utility, better retention story, better downtown visibility.",
    icon: Building2,
  },
  Developers: {
    problem: "Developers need a sharper way to sell location value before and after lease-up.",
    role: "The platform turns surrounding walkability, partners, and district energy into product.",
    outcome: "Stronger location narrative and clearer neighborhood differentiation.",
    icon: LandPlot,
  },
  Venues: {
    problem: "Local venues need visibility when nearby intent is forming, not after it passes.",
    role: "The map places offers and moments in front of residents already downtown.",
    outcome: "More timely discovery, more visits, more measurable redemptions.",
    icon: Coffee,
  },
  "Brands / Sponsors": {
    problem: "Brand activations need context and relevance, not broad wasted reach.",
    role: "Downtown Perks inserts sponsor moments into real movement and real intent.",
    outcome: "Higher-quality attention and cleaner local activation proof.",
    icon: Megaphone,
  },
  Civic: {
    problem: "District and civic groups need turnout, participation, and easier discovery.",
    role: "The map becomes a working downtown layer for events, programs, and attendance.",
    outcome: "Better visibility for programming and stronger corridor participation.",
    icon: Ticket,
  },
};

const partnershipOptions = [
  {
    title: "Properties",
    price: "Pilot available",
    text: "Residential buildings and mixed-use properties bringing the map into resident life.",
    href: "/partners/properties",
  },
  {
    title: "Developers",
    price: "Custom rollout",
    text: "Use neighborhood intelligence as part of leasing, launch, and location storytelling.",
    href: "/partners/properties",
  },
  {
    title: "Venues",
    price: "Annual plans",
    text: "Show up when nearby residents are deciding where to go next.",
    href: "/partners/venues",
  },
  {
    title: "Brands / Sponsors",
    price: "Activation pricing",
    text: "Own the moment instead of buying generic impressions.",
    href: "/partners/brands",
  },
  {
    title: "Civic",
    price: "District plans",
    text: "Turn programming and attendance into participation across downtown.",
    href: "/partners/civic",
  },
];

export default function Home() {
  const [selectedMapItem, setSelectedMapItem] = useState(mapItems[1]);
  const [activePartnerTab, setActivePartnerTab] = useState("Properties");
  const ActivePartnerIcon = partnerTabs[activePartnerTab].icon;

  return (
    <div className="min-h-screen bg-[#f7f7fb] text-slate-900">
      <main>
        <section className="border-b border-slate-200/70">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-14 md:px-6 md:py-20 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
            <div>
              <div className="mb-4 inline-flex rounded-full border border-[#b69247]/30 bg-[#b69247]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0b1f33]">
                Built for residents. Backed by properties and local partners.
              </div>

              <h1 className="max-w-3xl text-4xl font-semibold leading-[0.96] tracking-[-0.04em] text-[#0b1f33] md:text-6xl">
                Walk Downtown with a Better Read on What’s Worth It
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
                Discover nearby events, perks, and venues through one live map and perks card.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  to="/explore"
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#0b1f33] px-5 py-3 text-sm font-medium text-white transition hover:-translate-y-[1px]"
                >
                  Explore Live Map
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/events"
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-800 transition hover:-translate-y-[1px]"
                >
                  See What’s On Tonight
                </Link>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
                {proofStats.map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="text-lg font-semibold tracking-tight text-[#0b1f33]">{stat.value}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.12em] text-slate-500">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_20px_60px_rgba(11,31,51,0.08)]">
              <div className="rounded-[24px] border border-slate-200 bg-[#fbfbfd] p-4">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                    <Search className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-500">coffee right now · dinner tonight on Rainey</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {["Venues", "Events", "Perks", "5 min walk"].map((chip, index) => (
                      <span
                        key={chip}
                        className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                          index === 0
                            ? "bg-[#0b1f33] text-white"
                            : "border border-slate-200 bg-white text-slate-600"
                        }`}
                      >
                        {chip}
                      </span>
                    ))}
                  </div>

                  <div className="relative h-[360px] overflow-hidden rounded-[22px] border border-slate-200 bg-[radial-gradient(circle_at_top,_#ffffff_0%,_#eef2f7_55%,_#e7edf5_100%)]">
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,31,51,0.04)_1px,transparent_1px),linear-gradient(rgba(11,31,51,0.04)_1px,transparent_1px)] bg-[size:24px_24px]" />
                    <div className="absolute left-[12%] top-[18%] h-40 w-40 rounded-full bg-[#b69247]/10 blur-3xl" />
                    <div className="absolute right-[10%] top-[8%] h-44 w-44 rounded-full bg-[#0b1f33]/8 blur-3xl" />

                    {mapItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setSelectedMapItem(item)}
                        className="absolute -translate-x-1/2 -translate-y-1/2"
                        style={{ left: item.x, top: item.y }}
                      >
                        <span
                          className={`flex h-11 w-11 items-center justify-center rounded-full border shadow-lg transition ${
                            selectedMapItem.id === item.id
                              ? "border-[#0b1f33] bg-[#0b1f33] text-white"
                              : "border-white bg-white text-[#0b1f33]"
                          }`}
                        >
                          <MapPin className="h-5 w-5" />
                        </span>
                      </button>
                    ))}

                    <div className="absolute bottom-4 left-4 right-4 rounded-[22px] border border-slate-200 bg-white/95 p-4 backdrop-blur">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <span className="rounded-full bg-[#b69247]/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#0b1f33]">
                          {selectedMapItem.type}
                        </span>
                        <span className="text-xs text-slate-500">{selectedMapItem.meta}</span>
                      </div>
                      <h3 className="text-base font-semibold tracking-tight text-[#0b1f33]">
                        {selectedMapItem.title}
                      </h3>
                      <p className="mt-1 text-sm text-slate-600">{selectedMapItem.subtitle}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button className="rounded-xl bg-[#0b1f33] px-4 py-2 text-sm font-medium text-white">
                          {selectedMapItem.action}
                        </button>
                        <Link
                          to="/explore"
                          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700"
                        >
                          Open Full Map
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-2xl border border-slate-200 bg-white p-3">
                      <div className="text-xs uppercase tracking-[0.12em] text-slate-500">Map-led</div>
                      <div className="mt-1 text-sm font-medium text-[#0b1f33]">One live surface</div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-3">
                      <div className="text-xs uppercase tracking-[0.12em] text-slate-500">Resident-first</div>
                      <div className="mt-1 text-sm font-medium text-[#0b1f33]">Useful before persuasive</div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-3">
                      <div className="text-xs uppercase tracking-[0.12em] text-slate-500">Walkable</div>
                      <div className="mt-1 text-sm font-medium text-[#0b1f33]">Downtown in minutes</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-slate-200/70 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b69247]">
                  Live Map Preview
                </span>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#0b1f33] md:text-4xl">
                  One map. Better decisions.
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                  Search, filter by corridor, switch categories, and decide faster without bouncing between apps.
                </p>
              </div>

              <Link to="/explore" className="inline-flex items-center gap-2 text-sm font-medium text-[#0b1f33]">
                Open Full Map
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-[#f7f7fb] p-5">
              <div className="mb-4 flex flex-col gap-3">
                <div className="flex flex-wrap gap-2">
                  {neighborhoodChips.map((chip, index) => (
                    <span
                      key={chip}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                        index === 0
                          ? "bg-[#0b1f33] text-white"
                          : "border border-slate-200 bg-white text-slate-600"
                      }`}
                    >
                      {chip}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  {categoryChips.map((chip, index) => (
                    <span
                      key={chip}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                        index === 1
                          ? "border border-[#b69247]/35 bg-[#b69247]/10 text-[#0b1f33]"
                          : "border border-slate-200 bg-white text-slate-600"
                      }`}
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.3fr_.7fr]">
                <div className="rounded-[24px] border border-slate-200 bg-white p-4">
                  <div className="relative h-[320px] overflow-hidden rounded-[18px] bg-[linear-gradient(135deg,#eef4fb_0%,#f9fbff_100%)]">
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,31,51,0.04)_1px,transparent_1px),linear-gradient(rgba(11,31,51,0.04)_1px,transparent_1px)] bg-[size:28px_28px]" />
                    {mapItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setSelectedMapItem(item)}
                        className="absolute -translate-x-1/2 -translate-y-1/2"
                        style={{ left: item.x, top: item.y }}
                      >
                        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white bg-[#0b1f33] text-white shadow-lg">
                          <MapPin className="h-4 w-4" />
                        </span>
                      </button>
                    ))}

                    <div className="absolute bottom-5 left-5 rounded-full border border-[#b69247]/25 bg-[#b69247]/10 px-3 py-1.5 text-xs font-medium text-[#0b1f33]">
                      5-minute walk radius
                    </div>
                  </div>
                </div>

                <div className="rounded-[24px] border border-slate-200 bg-white p-5">
                  <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Selected pin
                  </div>
                  <h3 className="text-xl font-semibold tracking-tight text-[#0b1f33]">
                    {selectedMapItem.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">{selectedMapItem.subtitle}</p>

                  <div className="mt-4 space-y-3">
                    <div className="rounded-2xl border border-slate-200 bg-[#f7f7fb] p-3 text-sm text-slate-600">
                      {selectedMapItem.meta}
                    </div>
                    <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0b1f33] px-4 py-3 text-sm font-medium text-white">
                      {selectedMapItem.action}
                    </button>
                    <Link
                      to="/explore"
                      className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-800"
                    >
                      Open in Map
                    </Link>
                  </div>

                  <div className="mt-5 border-t border-slate-200 pt-5">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Actions
                    </div>
                    <div className="mt-3 grid gap-2">
                      {[
                        { label: "Open in Map", href: "/explore" },
                        { label: "Save to Card", href: "/card" },
                        { label: "RSVP", href: "/events" },
                      ].map((action) => (
                        <Link
                          key={action.label}
                          to={action.href}
                          className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700"
                        >
                          {action.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-slate-200/70 bg-[#f7f7fb]">
          <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
            <div className="mb-10 max-w-2xl">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b69247]">
                How It Works
              </span>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#0b1f33] md:text-4xl">
                Four steps. No friction.
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              {[
                {
                  step: "01",
                  title: "Explore the map",
                  text: "Open the live layer and see what is nearby right now.",
                  icon: Search,
                },
                {
                  step: "02",
                  title: "Save a perk or event",
                  text: "Keep the option you want without losing the thread.",
                  icon: Gift,
                },
                {
                  step: "03",
                  title: "Walk in and redeem or check in",
                  text: "Use your card or RSVP flow when you get there.",
                  icon: CheckCircle2,
                },
                {
                  step: "04",
                  title: "Get rewarded and see what’s next",
                  text: "Keep moving through downtown with less effort.",
                  icon: ArrowRight,
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.step} className="rounded-[24px] border border-slate-200 bg-white p-5">
                    <div className="mb-5 flex items-center justify-between">
                      <span className="text-xs font-semibold tracking-[0.14em] text-slate-400">
                        {item.step}
                      </span>
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0b1f33] text-white">
                        <Icon className="h-4 w-4" />
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold tracking-tight text-[#0b1f33]">{item.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{item.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="border-b border-slate-200/70 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b69247]">
                  What’s Happening Now
                </span>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#0b1f33] md:text-4xl">
                  Tonight’s events, nearby specials, weekly highlights.
                </h2>
              </div>
              <Link to="/events" className="text-sm font-medium text-[#0b1f33]">
                View all activity
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {nowCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div key={card.title} className="rounded-[24px] border border-slate-200 bg-[#f7f7fb] p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                        {card.label}
                      </span>
                      <Icon className="h-4 w-4 text-[#0b1f33]" />
                    </div>
                    <h3 className="text-lg font-semibold tracking-tight text-[#0b1f33]">{card.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{card.text}</p>
                    <Link
                      to={card.href}
                      className="mt-5 inline-flex rounded-xl bg-[#0b1f33] px-4 py-2.5 text-sm font-medium text-white"
                    >
                      {card.cta}
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="border-b border-slate-200/70 bg-[#f7f7fb]">
          <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
            <div className="mb-8 max-w-2xl">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b69247]">
                Why Residents Use It
              </span>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#0b1f33] md:text-4xl">
                Useful by default.
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                No app. Real-time discovery. Saved plans in one place. Walkable perks that make downtown easier to use.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {residentBenefits.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-[24px] border border-slate-200 bg-white p-5">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0b1f33] text-white">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-5 text-lg font-semibold tracking-tight text-[#0b1f33]">{item.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{item.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="border-b border-slate-200/70 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
            <div className="mb-8">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b69247]">
                Why Partners Join
              </span>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#0b1f33] md:text-4xl">
                Show up when the decision is being made.
              </h2>
            </div>

            <div className="mb-5 flex flex-wrap gap-2">
              {Object.keys(partnerTabs).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActivePartnerTab(tab)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    activePartnerTab === tab
                      ? "bg-[#0b1f33] text-white"
                      : "border border-slate-200 bg-white text-slate-600"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-4 rounded-[28px] border border-slate-200 bg-[#f7f7fb] p-5 md:grid-cols-[.8fr_1.2fr]">
              <div className="rounded-[22px] border border-slate-200 bg-white p-6">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0b1f33] text-white">
                  <ActivePartnerIcon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-2xl font-semibold tracking-tight text-[#0b1f33]">
                  {activePartnerTab}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Compact homepage preview. Detailed workflow belongs on the partner pages.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-[22px] border border-slate-200 bg-white p-5">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Problem solved
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-700">
                    {partnerTabs[activePartnerTab].problem}
                  </p>
                </div>

                <div className="rounded-[22px] border border-slate-200 bg-white p-5">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Platform role
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-700">
                    {partnerTabs[activePartnerTab].role}
                  </p>
                </div>

                <div className="rounded-[22px] border border-slate-200 bg-white p-5">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Outcome delivered
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-700">
                    {partnerTabs[activePartnerTab].outcome}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-slate-200/70 bg-[#f7f7fb]">
          <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
            <div className="mb-8 max-w-2xl">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b69247]">
                Proof
              </span>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#0b1f33] md:text-4xl">
                Better than broad. Stronger than static.
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                A simple comparison of broad targeting, corridor targeting, and event-timed targeting.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-[1.2fr_.8fr]">
              <div className="rounded-[28px] border border-slate-200 bg-white p-5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {[
                    {
                      title: "Broad targeting",
                      value: "Low intent",
                      text: "Large reach, weak timing, weak local context.",
                    },
                    {
                      title: "Corridor targeting",
                      value: "3.8–4.2%",
                      text: "Rainey corridor engagement when people are already nearby.",
                    },
                    {
                      title: "Event targeting",
                      value: "Higher action",
                      text: "Better alignment between timing, location, and decision moment.",
                    },
                  ].map((item) => (
                    <div key={item.title} className="rounded-[22px] border border-slate-200 bg-[#f7f7fb] p-5">
                      <div className="text-sm font-semibold text-[#0b1f33]">{item.title}</div>
                      <div className="mt-3 text-2xl font-semibold tracking-tight text-[#0b1f33]">
                        {item.value}
                      </div>
                      <p className="mt-2 text-sm leading-7 text-slate-600">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-[#0b1f33] p-6 text-white">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/65">
                  Corridor signal
                </div>
                <div className="mt-4 text-5xl font-semibold tracking-[-0.04em]">3.8–4.2%</div>
                <p className="mt-4 text-sm leading-7 text-white/75">
                  Highlighting Rainey corridor engagement as a clearer local signal than generic reach metrics.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-slate-200/70 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b69247]">
                  Partnership Options
                </span>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#0b1f33] md:text-4xl">
                  Short. Clear. Scan-friendly.
                </h2>
              </div>
              <Link to="/partners" className="text-sm font-medium text-[#0b1f33]">
                Explore all options
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
              {partnershipOptions.map((option) => (
                <Link
                  key={option.title}
                  to={option.href}
                  className="rounded-[24px] border border-slate-200 bg-[#f7f7fb] p-5 transition hover:-translate-y-[2px] hover:border-[#0b1f33]/20"
                >
                  <div className="text-sm font-semibold text-[#0b1f33]">{option.title}</div>
                  <div className="mt-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#b69247]">
                    {option.price}
                  </div>
                  <p className="mt-4 text-sm leading-7 text-slate-600">{option.text}</p>
                  <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[#0b1f33]">
                    Learn more
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#f7f7fb]" id="contact">
          <div className="mx-auto max-w-5xl px-4 py-20 text-center md:px-6">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b69247]">
              Ready when you are
            </span>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[#0b1f33] md:text-5xl">
              Downtown works better when it works like a system.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-600">
              Start with the map, unlock the card, or bring the platform into your building or district.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/card" className="rounded-2xl bg-[#0b1f33] px-5 py-3 text-sm font-medium text-white">
                Get Access
              </Link>
              <Link
                to="/partners/properties"
                className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-800"
              >
                Bring It to My Building
              </Link>
              <Link
                to="/partners"
                className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-800"
              >
                Start a Partner Pilot
              </Link>
              <a
                href="mailto:hello@downtownperks.com"
                className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-800"
              >
                Contact
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}