import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  Calendar,
  Coffee,
  Gift,
  Hotel,
  House,
  Landmark,
  MapPin,
  Megaphone,
  QrCode,
  Search,
  Sparkles,
  Utensils,
} from "lucide-react";

const heroChips = [
  { id: "venues", label: "Venues", icon: MapPin },
  { id: "events", label: "Events", icon: Calendar },
  { id: "perks", label: "Perks", icon: Gift },
  { id: "walk", label: "5 min walk", icon: Sparkles },
];

const partnerTabs = [
  {
    id: "properties",
    label: "Properties",
    icon: Building2,
    headline: "You're not selling square footage.",
    subhead: "You're selling everything around it.",
    body: "The coffee shop where your barista knows your order. The bar that feels like your living room. The Thai place that's open late. That's what people pay for. Give people a way to see it.",
    pricing: "Free pilot · $39/yr · $99/yr",
    cta: "Bring this to your property",
    href: "/partners/properties",
    includes: [
      "QR access across lobby, leasing, and welcome flow",
      "Live map of nearby places, events, and perks",
      "Your property inside the same experience",
      "Real engagement, not passive info",
    ],
  },
  {
    id: "hotels",
    label: "Hotels",
    icon: Hotel,
    headline: "Extend the stay beyond your lobby.",
    subhead: "One scan. Every option nearby.",
    body: "Give guests a clean local layer for coffee, dinner, music, wellness, and walkable plans without adding another front-desk script.",
    pricing: "$99-$149 / yr",
    cta: "Bring this to your hotel",
    href: "/partners/hotels",
    includes: ["Guest QR access", "Nearby recommendations", "Partner perks", "Useful local proof"],
  },
  {
    id: "venues",
    label: "Venues",
    icon: Utensils,
    headline: "Be the place people choose next.",
    subhead: "Not reach. Relevance.",
    body: "People are already downtown, already walking, and already deciding. Downtown Perks puts your place in front of them when the moment is live.",
    pricing: "Free for 12 months",
    cta: "Join as a venue",
    href: "/partners/venues",
    includes: ["Map placement", "Perk visibility", "Redemption proof", "Local intent signals"],
  },
  {
    id: "brands",
    label: "Brands",
    icon: Megaphone,
    headline: "Buy the moment, not the impression.",
    subhead: "Context beats scale.",
    body: "Place activations inside real neighborhood intent instead of broad advertising that lands too early, too late, or too far away.",
    pricing: "$99-$149 / yr",
    cta: "Launch a brand activation",
    href: "/partners/brands",
    includes: ["Activation placement", "Audience context", "Campaign proof", "District-level visibility"],
  },
  {
    id: "civic",
    label: "Civic",
    icon: Landmark,
    headline: "Turn attendance into participation.",
    subhead: "Discovery drives turnout.",
    body: "Give people one clear way to see district activity, local programming, events, and nearby options without hunting across separate channels.",
    pricing: "$49-$79 / yr",
    cta: "Build the civic layer",
    href: "/partners/civic",
    includes: ["District map layer", "Program visibility", "Event discovery", "Participation reporting"],
  },
];

const pricingCards = [
  {
    title: "Properties",
    meta: "Multifamily, condos, apartments",
    price: "Free · $39 · $99 / yr",
    line: "Management pays. Residents stay.",
    note: "Your address is your key to downtown.",
    icon: Building2,
    href: "/partners/properties",
  },
  {
    title: "Hotels",
    meta: "Hotels, boutiques, extended stays",
    price: "$99-$149 / yr",
    line: "Extend the stay beyond your lobby.",
    note: "One scan. Every option nearby.",
    icon: Hotel,
    href: "/partners/hotels",
  },
  {
    title: "Venues",
    meta: "Restaurants, bars, fitness, wellness",
    price: "Free for 12 months",
    line: "Show up in the moment that counts.",
    note: "Not reach. Relevance. Not impressions. Intent.",
    icon: Utensils,
    href: "/partners/venues",
  },
  {
    title: "Brands",
    meta: "Activations, campaigns, sponsorships",
    price: "$99-$149 / yr",
    line: "Buy the moment, not the impression.",
    note: "Context beats scale. Timing beats frequency.",
    icon: Megaphone,
    href: "/partners/brands",
  },
  {
    title: "Civic",
    meta: "Cities, districts, chambers",
    price: "$49-$79 / yr",
    line: "Turn attendance into participation.",
    note: "Discovery drives turnout.",
    icon: Landmark,
    href: "/partners/civic",
  },
];

const faqItems = [
  {
    question: "What is Downtown Perks?",
    answer:
      "Downtown Perks is a live downtown map that brings places, events, perks, buildings, and local context into one working layer. It helps people decide what to do based on what is actually nearby and useful right now.",
  },
  { question: "Do I need to download an app?", answer: "No. It opens from QR, text, or a shared link." },
  { question: "Is this just a list of deals?", answer: "No. Perks are part of the system, but the main value is a live neighborhood layer for decisions, movement, and proof." },
  { question: "Why is the map central?", answer: "Because downtown decisions are spatial. People need to know what is nearby, open, relevant, and worth walking to." },
];

function SectionLabel({ children }) {
  return <span className="text-[11px] font-medium text-primary/80 uppercase tracking-[0.16em] block mb-4">{children}</span>;
}

function Bullet({ children }) {
  return (
    <li className="flex items-start gap-3 text-[13px] text-foreground/60">
      <div className="w-1 h-1 rounded-full bg-primary/60 mt-2 shrink-0" />
      {children}
    </li>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("venues");
  const [partnerTab, setPartnerTab] = useState("properties");
  const [openFaq, setOpenFaq] = useState(0);

  const activePartner = partnerTabs.find((tab) => tab.id === partnerTab) ?? partnerTabs[0];
  const ActivePartnerIcon = activePartner.icon;

  const openMap = () => {
    const params = new URLSearchParams();
    params.set("category", category);
    if (query.trim()) params.set("query", query.trim());
    navigate(`/downtown-perks/explore?${params.toString()}`);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    openMap();
  };

  return (
    <div className="bg-background">
      <section className="relative w-full min-h-screen overflow-hidden bg-[#f6f3ee]">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1531218150217-54595bc2b934?auto=format&fit=crop&w=2400&q=80"
            alt="Downtown Austin"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/25 via-white/10 to-[rgba(15,23,42,0.14)]" />
        </div>

        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-24 md:py-28">
          <div className="mb-5 flex items-center gap-2">
            <span className="rounded-full border border-white/40 bg-white/[0.42] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-[hsl(218,24%,28%)] backdrop-blur-md">
              Downtown Perks
            </span>
          </div>

          <div className="w-full max-w-3xl rounded-[30px] border border-white/[0.38] bg-white/[0.68] p-5 shadow-[0_24px_60px_rgba(14,28,54,0.16)] backdrop-blur-xl md:p-8">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="font-heading text-4xl font-semibold leading-[1.03] tracking-[-0.035em] text-[hsl(218,42%,14%)] md:text-[56px]">
                Where downtown meets you
              </h1>
              <p className="mt-3 text-sm leading-6 text-[hsl(218,20%,42%)] md:mt-4 md:text-[15px]">
                Everything nearby - in one map.
              </p>
            </div>

            <form onSubmit={handleSearchSubmit} className="mx-auto mt-5 max-w-xl rounded-[22px] border border-white/70 bg-white/[0.92] p-2 shadow-[0_12px_30px_rgba(14,28,54,0.10)] md:mt-6">
              <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <div className="flex h-12 flex-1 items-center gap-3 rounded-[16px] border border-[hsl(218,20%,86%)] bg-white px-4 transition-colors focus-within:border-primary/40">
                  <Search className="h-4 w-4 flex-shrink-0 text-foreground/45" />
                  <input
                    type="text"
                    placeholder="Where should I go right now?"
                    className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-foreground/40"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-[16px] bg-[hsl(218,42%,14%)] px-5 text-sm font-medium text-white shadow-[0_10px_24px_rgba(14,28,54,0.18)] transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_14px_28px_rgba(14,28,54,0.24)] active:translate-y-0"
                >
                  Open map
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                {heroChips.map((chip) => {
                  const Icon = chip.icon;
                  const active = category === chip.id;
                  return (
                    <button
                      key={chip.id}
                      type="button"
                      onClick={() => setCategory(chip.id)}
                      className={`inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-xs font-semibold tracking-[0.01em] transition-all ${
                        active
                          ? "border-[#cfaf5a]/45 bg-[#cfaf5a]/12 text-[hsl(218,42%,14%)]"
                          : "border-white/70 bg-white/[0.76] text-foreground/70 backdrop-blur-sm hover:border-primary/25 hover:bg-white hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {chip.label}
                    </button>
                  );
                })}
              </div>
            </form>

            <div className="mt-5 flex flex-wrap justify-center gap-3 md:mt-6">
              <button
                type="button"
                onClick={() => navigate("/downtown-perks/explore")}
                className="inline-flex min-w-[160px] items-center justify-center gap-2 rounded-[16px] bg-[hsl(218,42%,14%)] px-6 py-3 text-sm font-medium text-white shadow-[0_10px_24px_rgba(14,28,54,0.18)] transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_14px_28px_rgba(14,28,54,0.24)] active:translate-y-0"
              >
                Explore downtown
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => navigate("/downtown-perks/explore?mode=ask")}
                className="inline-flex min-w-[160px] items-center justify-center gap-2 rounded-[16px] border border-white/75 bg-white/[0.76] px-6 py-3 text-sm font-medium text-foreground shadow-[0_8px_18px_rgba(14,28,54,0.08)] backdrop-blur-sm transition-all duration-200 hover:-translate-y-[1px] hover:bg-white active:translate-y-0"
              >
                Ask the map
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 border-t border-[hsl(218,20%,88%)] bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-14 items-start">
            <div>
              <SectionLabel>Downtown, in one place</SectionLabel>
              <h2 className="font-heading text-3xl md:text-[38px] font-medium leading-[1.1] tracking-tight mb-5 text-foreground">
                You live downtown but expect it to be easier.
              </h2>
              <p className="text-foreground/60 text-[13px] leading-relaxed mb-5">
                Easier to navigate. Easier to connect. More useful day to day. Instead, everything you want is spread across too many places.
              </p>
              <p className="text-foreground/50 text-[13px] leading-relaxed italic">
                Google for restaurants. Instagram for events. Text three friends to find the best happy hour.
              </p>
              <div className="h-px bg-[hsl(218,20%,90%)] my-6" />
              <p className="text-foreground/80 text-sm leading-relaxed">
                Downtown Perks fixes that. Because the problem isn't what to do next - it's the effort it takes to decide.
              </p>
            </div>
            <div className="md:pt-8 space-y-8">
              <div>
                <h3 className="font-heading text-2xl font-medium leading-[1.1] tracking-tight mb-3 text-foreground">Search less. Do more.</h3>
                <p className="text-foreground/60 text-[13px] leading-relaxed">
                  Downtown Perks brings places, events, and perks together so it's easier to decide what to do next. A simple live map for people who live downtown - and the businesses that want to meet them there.
                </p>
              </div>
              <div>
                <h3 className="font-heading text-xl font-medium leading-[1.1] tracking-tight mb-3 text-foreground">One map. Everything nearby.</h3>
                <p className="text-foreground/60 text-[13px] leading-relaxed">
                  Places, plans, and perks in one simple view. No app downloads. No account setup. No switching between apps. No piecing things together. Just what matters, in one place.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 border-t border-[hsl(218,20%,88%)] bg-[hsl(42,24%,96%)]">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-14 items-end">
            <div>
              <SectionLabel>What You Can Do</SectionLabel>
              <h2 className="font-heading text-3xl md:text-[38px] font-medium leading-[1.1] tracking-tight text-foreground">
                Everything works together -<br />
                <em className="text-primary">so you show up more.</em>
              </h2>
            </div>
            <p className="text-foreground/60 text-[13px] leading-relaxed">
              Spend less time searching and more time showing up. Everything you need to move through downtown is in one place.
            </p>
          </div>

          <div className="flex gap-2 mb-8 overflow-x-auto pb-0.5">
            {['All', 'Places', 'Offers', 'Events', 'Properties'].map((label, index) => (
              <span
                key={label}
                className={`px-4 py-1.5 rounded-full text-[12px] font-medium whitespace-nowrap border cursor-default flex-shrink-0 ${
                  index === 0 ? 'border-primary/50 bg-primary/10 text-primary' : 'border-border/40 text-muted-foreground'
                }`}
              >
                {label}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-[hsl(218,20%,88%)] rounded-xl overflow-hidden mb-10 bg-white shadow-[0_2px_16px_rgba(14,28,54,.06)]">
            <div className="p-8 md:border-r border-[hsl(218,20%,90%)]">
              <div className="text-[11px] font-medium text-foreground/50 uppercase tracking-[0.12em] mb-5">Find What You Need</div>
              <ul className="space-y-3 mb-8">
                <Bullet>Restaurants, bars, coffee shops, and services nearby</Bullet>
                <Bullet>Events happening tonight, ready to RSVP</Bullet>
                <Bullet>Local perks from places you'd go anyway</Bullet>
                <Bullet>Places worth coming back to</Bullet>
                <Bullet>People around you, when you want to be social</Bullet>
              </ul>

              <div className="p-4 rounded-lg bg-[hsl(42,24%,96%)] border border-[hsl(218,20%,90%)] mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full border border-border/60 bg-muted/60 flex items-center justify-center shrink-0">
                    <Coffee className="w-3.5 h-3.5 text-primary/60" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-foreground">Jo's Coffee</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">Coffee. Quick stops. Daily rituals.</div>
                    <div className="text-[11px] text-primary/70 mt-1">Nearby perk · 5-minute walk</div>
                  </div>
                  <span className="text-[11px] font-medium text-primary border border-primary/30 px-2.5 py-1 rounded-full shrink-0">Show Card</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-medium text-[12px] hover:bg-primary/90 transition-all" to="/downtown-perks/explore">
                  <MapPin className="w-3.5 h-3.5" /> Explore Downtown
                </Link>
                <Link className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border/60 text-foreground/70 font-medium text-[12px] hover:text-foreground transition-all" to="/downtown-perks/card">
                  Get a Perks Card
                </Link>
              </div>
            </div>

            <div className="p-8">
              <div className="text-[11px] font-medium text-foreground/50 uppercase tracking-[0.12em] mb-5">How It Works</div>
              <div className="divide-y divide-[hsl(218,20%,92%)]">
                <div className="py-5 first:pt-0 last:pb-0">
                  <div className="font-medium text-sm text-foreground mb-1.5">Tap. Learn. Decide.</div>
                  <div className="text-[13px] text-foreground/60 leading-relaxed">See what it is, why it matters, and how close you are.</div>
                </div>
                <div className="py-5 first:pt-0 last:pb-0">
                  <div className="font-medium text-sm text-foreground mb-1.5">Save it or go now.</div>
                  <div className="text-[13px] text-foreground/60 leading-relaxed">Plan ahead - or decide in the moment.</div>
                </div>
                <div className="py-5 first:pt-0 last:pb-0">
                  <div className="font-medium text-sm text-foreground mb-1.5">Flash your card. Get the perk.</div>
                  <div className="text-[13px] text-foreground/60 leading-relaxed">They scan. You save. Done.</div>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-[hsl(218,20%,92%)] space-y-1">
                <p className="font-heading text-base font-medium text-foreground italic">That's how friction dies.</p>
                <p className="text-[12px] text-foreground/55 leading-relaxed">No extra steps. No guesswork. Just the shortest distance between "maybe" and "I'm going."</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            {[
              { icon: Calendar, title: 'Events Happening Now', text: "See what's on. RSVP in one tap. From happy hours to local programming - without leaving the map.", href: '/downtown-perks/events', cta: 'See events' },
              { icon: House, title: 'Want to live here?', text: "Browse properties nearby. Filter to Properties to view participating buildings, rentals, and homes for sale. Tap any building for availability and what's walkable.", href: '/downtown-perks/explore', cta: 'View properties' },
              { icon: QrCode, title: 'Get Your Perks Card Now', text: 'Scan the QR code to get your Perks Card sent directly to your phone. Sign me up.', href: '/downtown-perks/card', cta: 'Sign me up' },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.title} className="p-6 rounded-xl border border-[hsl(218,20%,88%)] bg-white hover:border-primary/30 hover:shadow-[0_4px_16px_rgba(14,28,54,.06)] transition-all group shadow-[0_1px_4px_rgba(14,28,54,.04)]">
                  <div className="w-8 h-8 rounded-full border border-[hsl(218,20%,88%)] flex items-center justify-center mb-4">
                    <Icon className="w-3.5 h-3.5 text-primary/70" />
                  </div>
                  <div className="font-heading font-medium text-sm text-foreground mb-2">{card.title}</div>
                  <div className="text-[12px] text-foreground/60 leading-relaxed mb-4">{card.text}</div>
                  <Link className="inline-flex items-center gap-1 text-[12px] text-primary font-medium hover:underline underline-offset-4" to={card.href}>
                    {card.cta} <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              );
            })}
          </div>

          <div className="border border-[hsl(218,20%,88%)] rounded-xl p-8 bg-white shadow-[0_1px_8px_rgba(14,28,54,.04)]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="font-heading text-2xl font-medium leading-[1.1] mb-2 text-foreground">What's Around the Corner</h3>
                <p className="text-foreground/60 text-[13px] leading-relaxed">Everything you need, within walking distance. See what's close, decide quickly, and go.</p>
              </div>
              <div className="flex gap-3 md:justify-end">
                <Link className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-all" to="/downtown-perks/explore">
                  <MapPin className="w-3.5 h-3.5" /> Explore nearby
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 border-t border-[hsl(218,20%,88%)] bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12 items-end">
            <div>
              <SectionLabel>Turn Residents Into Regulars</SectionLabel>
              <h2 className="font-heading text-3xl md:text-[38px] font-medium leading-[1.1] tracking-tight text-foreground">
                Be the place<br />
                <em className="text-primary">people choose next.</em>
              </h2>
            </div>
            <p className="text-foreground/60 text-[13px] leading-relaxed">
              People are already downtown. Already walking. Already deciding. Downtown Perks puts you in front of them when it matters - not broad advertising, better timing.
            </p>
          </div>

          <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
            {partnerTabs.map((tab) => {
              const Icon = tab.icon;
              const active = partnerTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setPartnerTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-[12px] font-medium whitespace-nowrap border transition-all duration-200 ${
                    active
                      ? 'border-primary/40 bg-primary/10 text-primary'
                      : 'border-[hsl(218,20%,88%)] text-foreground/60 hover:text-foreground hover:border-[hsl(218,20%,78%)]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="border border-[hsl(218,20%,88%)] rounded-xl overflow-hidden shadow-[0_2px_16px_rgba(14,28,54,.06)]">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-8 md:border-r border-[hsl(218,20%,90%)] bg-white">
                <div className="w-9 h-9 rounded-full border border-[hsl(218,20%,88%)] flex items-center justify-center mb-6">
                  <ActivePartnerIcon className="w-4 h-4 text-primary" />
                </div>
                <h3 className="font-heading text-2xl font-medium leading-[1.08] mb-1.5 text-foreground">{activePartner.headline}</h3>
                <p className="text-foreground/55 text-sm italic mb-5">{activePartner.subhead}</p>
                <p className="text-[13px] text-foreground/60 leading-relaxed mb-8">{activePartner.body}</p>
                <div className="border-t border-[hsl(218,20%,90%)] pt-6">
                  <div className="text-[11px] font-medium text-foreground/50 uppercase tracking-[0.12em] mb-1">Pricing</div>
                  <div className="font-heading font-medium text-foreground text-sm mb-1">{activePartner.pricing}</div>
                  <div className="text-[12px] text-foreground/55 italic mb-5">Start for nothing. Upgrade when it's obvious.</div>
                  <Link className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-all duration-300" to={activePartner.href}>
                    {activePartner.cta} <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              <div className="p-8 bg-[hsl(42,24%,96%)]">
                <div className="text-[11px] font-medium text-foreground/50 uppercase tracking-[0.12em] mb-5">What's Included</div>
                <ul className="space-y-3">
                  {activePartner.includes.map((item) => (
                    <Bullet key={item}>{item}</Bullet>
                  ))}
                </ul>
                <div className="mt-8 pt-6 border-t border-[hsl(218,20%,90%)]">
                  <div className="text-[11px] font-medium text-foreground/50 uppercase tracking-[0.12em] mb-3">How It Works</div>
                  {['Set up QR entry points and map visibility.', 'Track scans, saves, RSVPs, and redemptions.', 'Keep it, scale it, or adjust based on what works.'].map((step, index) => (
                    <div key={step} className="flex items-center gap-3 text-[13px] text-foreground/60 mb-2">
                      <div className="w-5 h-5 rounded-full border border-primary/40 flex items-center justify-center text-[10px] text-primary font-medium shrink-0">{index + 1}</div>
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 border-t border-[hsl(218,20%,88%)] bg-[hsl(42,24%,96%)]">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12 items-end">
            <div>
              <SectionLabel>Pricing</SectionLabel>
              <h2 className="font-heading text-3xl md:text-[38px] font-medium leading-[1.1] tracking-tight text-foreground">
                Spend less.<br />
                <em className="text-primary">Do more.</em>
              </h2>
            </div>
            <p className="text-foreground/60 text-[13px] leading-relaxed">
              Start with a pilot. Decide with real data. No setup. No long-term commitment. You go live, people use it, you see what happens.
              <span className="block mt-2 text-[12px] text-muted-foreground/60 italic">Final pricing reflects footprint, visibility, and activation.</span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {pricingCards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.title} className="group p-5 rounded-lg border border-[hsl(218,20%,88%)] bg-white hover:border-primary/30 hover:shadow-[0_4px_14px_rgba(14,28,54,.06)] transition-all shadow-[0_1px_4px_rgba(14,28,54,.04)] cursor-pointer">
                  <Icon className="w-4 h-4 text-primary/60 mb-3" />
                  <div className="font-heading font-medium text-sm text-foreground mb-0.5 group-hover:text-primary transition-colors">{card.title}</div>
                  <div className="text-[11px] text-foreground/45 mb-3">{card.meta}</div>
                  <div className="font-heading font-medium text-primary text-[13px] mb-1">{card.price}</div>
                  <div className="text-[11px] text-foreground/60 leading-relaxed mb-2">{card.line}</div>
                  <div className="text-[11px] text-foreground/45 italic leading-relaxed mb-3">{card.note}</div>
                  <Link className="text-[11px] text-primary font-medium hover:underline underline-offset-4" to={card.href}>Learn more →</Link>
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-all duration-300" to="/partners">
              Explore all partner types <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <span className="text-[12px] text-foreground/45">No setup fee. No long-term commitment.</span>
          </div>
        </div>
      </section>

      <section className="py-14 px-6 border-t border-border/40 bg-background">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1.6fr] gap-10 items-start">
            <div className="md:sticky md:top-28">
              <span className="text-[11px] font-medium uppercase tracking-[0.16em] block mb-4 text-primary/70">FAQs</span>
              <h2 className="font-heading text-3xl md:text-4xl font-medium leading-[1.1] tracking-tight mb-5 text-foreground">Questions, answered clearly</h2>
              <p className="text-[13px] leading-relaxed mb-8 text-muted-foreground">Downtown Perks is built to make downtown easier to use. These are the questions people usually ask first.</p>
              <Link className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium text-sm transition-all border border-border/70 text-foreground/70 hover:text-foreground hover:border-border" to="/downtown-perks/about">
                Learn more about Downtown Perks
              </Link>
            </div>

            <div className="divide-y divide-border/40">
              {faqItems.map((item, index) => {
                const isOpen = openFaq === index;
                return (
                  <div key={item.question} className={`transition-colors ${isOpen ? 'bg-muted/30 rounded-lg' : ''}`}>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => setOpenFaq(isOpen ? -1 : index)}
                      className="w-full flex items-center gap-4 text-left transition-colors px-2 py-4 group"
                    >
                      <span className={`flex-1 font-medium text-[14px] leading-snug transition-colors duration-200 ${isOpen ? 'text-primary' : 'text-foreground'}`}>{item.question}</span>
                      <span className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                        <span className={`block text-lg leading-none transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}>+</span>
                      </span>
                    </button>
                    {isOpen && (
                      <div className="px-2 pb-4">
                        <p className="text-[13px] leading-relaxed text-muted-foreground">{item.answer}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 border-t border-[hsl(218,20%,88%)] bg-[hsl(42,24%,96%)]">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12 items-end">
            <div>
              <SectionLabel>Get Started</SectionLabel>
              <h2 className="font-heading text-3xl md:text-[38px] font-medium leading-[1.1] tracking-tight text-foreground">
                Ready when<br />
                <em className="text-primary">you are.</em>
              </h2>
            </div>
            <div>
              <p className="text-foreground/60 text-[13px] leading-relaxed mb-4">People don't choose the best option. They choose the one they notice.</p>
              <div className="flex flex-col gap-1.5 text-[12px] text-foreground/50">
                <span className="font-medium text-foreground/70">For residents - Stop searching. Start doing.</span>
                <span className="font-medium text-foreground/70">For partners - Be the one they notice.</span>
              </div>
            </div>
          </div>

          <div className="border border-[hsl(218,20%,88%)] rounded-xl overflow-hidden shadow-[0_2px_16px_rgba(14,28,54,.06)]">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-8 md:border-r border-[hsl(218,20%,90%)] bg-white">
                <h3 className="font-heading text-2xl font-medium leading-[1.08] mb-1.5 text-foreground">90-day free pilot.</h3>
                <p className="text-foreground/55 text-[13px] mb-6">See what residents actually do.</p>
                <div className="space-y-3">
                  {['Building Name & Address', 'Your Name & Role', 'Email', 'Phone', 'Number of Units', 'Any specific goals? (Optional)'].map((label) => (
                    <div key={label}>
                      <label className="block text-[11px] font-medium text-foreground/50 uppercase tracking-[0.1em] mb-1.5">{label}</label>
                      <input
                        type={label === 'Email' ? 'email' : label === 'Phone' ? 'tel' : label === 'Number of Units' ? 'number' : 'text'}
                        className="w-full bg-[hsl(42,24%,97%)] border border-[hsl(218,20%,88%)] rounded-lg px-4 py-2.5 text-[13px] text-foreground placeholder-foreground/30 focus:outline-none focus:border-primary/40 transition-colors"
                      />
                    </div>
                  ))}
                  <button type="button" className="mt-4 w-full px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-all duration-300">
                    Start Free Pilot
                  </button>
                </div>
              </div>

              <div className="p-8 bg-[hsl(42,24%,96%)] flex flex-col justify-between">
                <div>
                  <div className="text-[11px] font-medium text-foreground/50 uppercase tracking-[0.12em] mb-4">Also Available</div>
                  <div className="space-y-2">
                    {partnerTabs.slice(1).map((tab) => (
                      <Link key={tab.id} to={tab.href} className="flex items-center justify-between w-full p-3 rounded-lg border border-[hsl(218,20%,90%)] bg-white hover:border-primary/30 text-left transition-all group">
                        <div>
                          <div className="text-[13px] font-medium text-foreground">{tab.label}</div>
                          <div className="text-[11px] text-foreground/50 mt-0.5">{tab.subhead}</div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-foreground/25 group-hover:text-primary transition-colors shrink-0" />
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="mt-8 pt-6 border-t border-[hsl(218,20%,90%)] space-y-1">
                  <p className="text-[12px] text-foreground/50 italic">
                    Prefer email? <a href="mailto:hello@downtownperks.com" className="text-primary hover:underline underline-offset-4">hello@downtownperks.com</a>
                  </p>
                  <p className="text-[11px] text-foreground/35 mt-2">Downtown Perks · Powered by Boop · Austin, Texas</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[hsl(218,20%,84%)] text-foreground/70 font-medium text-sm hover:text-foreground hover:border-foreground/30 transition-all duration-300" to="/downtown-perks/explore">Explore Downtown</Link>
            <Link className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[hsl(218,20%,84%)] text-foreground/70 font-medium text-sm hover:text-foreground hover:border-foreground/30 transition-all duration-300" to="/downtown-perks/for-buildings">Become a Partner</Link>
            <Link className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[hsl(218,20%,88%)] text-foreground/50 font-medium text-sm hover:text-foreground transition-all duration-300" to="/downtown-perks/explore">Check Availability</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
