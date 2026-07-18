import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, X, Building2, Star, Waves, Dumbbell, Car, Bell, MapPin } from "lucide-react";

const PROPERTY_HERO_IMAGE = "/images/reports/waterline-building.jpg";

const BUILDINGS = [
  {
    id: "quincy", name: "The Quincy", address: "300 W 6th St", lat: 30.2680, lng: -97.7460,
    dist: "0.2 mi to Congress", top: "Public Art Walk", x: 45, y: 38,
    amenities: ["Pool", "Gym", "Parking", "Concierge"],
    nearby: ["Downtown Style Weekend", "Public Art Walk", "Rooftop Yoga", "Happy Hour at Half Step"],
  },
  {
    id: "seaholm", name: "Seaholm Residences", address: "222 West Ave", lat: 30.2700, lng: -97.7510,
    dist: "0.3 mi to Seaholm", top: "Coffee near Seaholm", x: 26, y: 44,
    amenities: ["Pool", "Gym", "Dog Park"],
    nearby: ["Coffee near Seaholm", "Waterloo Sunset Series", "Wellness Walk Club"],
  },
  {
    id: "independent", name: "The Independent", address: "301 West Ave", lat: 30.2710, lng: -97.7500,
    dist: "0.4 mi to Seaholm", top: "Dinner near Congress", x: 31, y: 36,
    amenities: ["Pool", "Parking", "Gym"],
    nearby: ["Dinner near Congress", "Public Art Walk", "Legends listing request"],
  },
  {
    id: "hanover", name: "Hanover Republic Square", address: "115 W 3rd St", lat: 30.2660, lng: -97.7420,
    dist: "0.1 mi to Republic Sq", top: "Happy Hour nearby", x: 56, y: 50,
    amenities: ["Pool", "Concierge", "Parking"],
    nearby: ["Happy Hour at Half Step", "Public Art Walk"],
  },
  {
    id: "bowie", name: "The Bowie", address: "400 Bowie St", lat: 30.2645, lng: -97.7445,
    dist: "0.2 mi to Convention Ctr", top: "Dinner near Rainey", x: 36, y: 54,
    amenities: ["Gym", "Parking"],
    nearby: ["Dinner near Rainey", "Waterloo Sunset Series"],
  },
  {
    id: "6g", name: "Residences at 6G", address: "600 Guadalupe St", lat: 30.2730, lng: -97.7490,
    dist: "0.3 mi to UT edge", top: "Coffee nearby", x: 42, y: 28,
    amenities: ["Gym", "Rooftop"],
    nearby: ["Coffee nearby", "Wellness Walk Club"],
  },
  {
    id: "austonian", name: "The Austonian", address: "200 Congress Ave", lat: 30.2656, lng: -97.7435,
    dist: "0.1 mi to Congress", top: "Congress Avenue dining", x: 61, y: 56,
    amenities: ["Pool", "Gym", "Concierge"],
    nearby: ["Congress Avenue dining", "Paramount Theatre", "Happy Hour at Half Step"],
  },
  {
    id: "the-shore", name: "The Shore", address: "603 Davis St", lat: 30.2602, lng: -97.7389,
    dist: "0.2 mi to Rainey", top: "Lady Bird Lake Trail", x: 79, y: 67,
    amenities: ["Pool", "Gym", "Parking"],
    nearby: ["Lady Bird Lake Trail", "Dinner near Rainey", "Hotel Van Zandt"],
  },
  {
    id: "44-east", name: "44 East", address: "44 East Ave", lat: 30.2609, lng: -97.7382,
    dist: "0.2 mi to Rainey", top: "Rainey dinner plans", x: 83, y: 59,
    amenities: ["Pool", "Gym", "Concierge"],
    nearby: ["Rainey dinner plans", "Waterloo Sunset Series", "Lady Bird Lake Trail"],
  },
  {
    id: "fifth-and-west", name: "Fifth & West", address: "501 West Ave", lat: 30.2688, lng: -97.7505,
    dist: "0.2 mi to Seaholm", top: "Coffee and errands", x: 28, y: 31,
    amenities: ["Pool", "Gym", "Concierge"],
    nearby: ["Coffee and errands", "Public Art Walk", "Wellness Walk Club"],
  },
  {
    id: "spring", name: "Spring", address: "300 Bowie St", lat: 30.2670, lng: -97.7516,
    dist: "0.2 mi to Whole Foods", top: "Market District errands", x: 22, y: 52,
    amenities: ["Pool", "Parking", "Concierge"],
    nearby: ["Market District errands", "Coffee near Seaholm", "Public Art Walk"],
  },
  {
    id: "70-rainey", name: "70 Rainey", address: "70 Rainey St", lat: 30.2597, lng: -97.7396,
    dist: "0.2 mi to Lady Bird Lake", top: "Trail and Rainey plans", x: 76, y: 74,
    amenities: ["Pool", "Gym", "Parking"],
    nearby: ["Trail and Rainey plans", "Dinner near Rainey", "Lady Bird Lake Trail"],
  },
];

const NEARBY = [
  { name: "Public Art Walk", lat: 30.2670, lng: -97.7440 },
  { name: "Happy Hour at Half Step", lat: 30.2655, lng: -97.7380 },
  { name: "Coffee near Seaholm", lat: 30.2695, lng: -97.7515 },
  { name: "Waterloo Sunset Series", lat: 30.2720, lng: -97.7390 },
  { name: "Wellness Walk Club", lat: 30.2715, lng: -97.7385 },
];

const MAP_FILTERS = [
  { id: "all", label: "Buildings", count: 12 },
  { id: "perks", label: "Perks", count: 9 },
  { id: "events", label: "Events", count: 6 },
  { id: "walkable", label: "Walkable now", count: 8 },
  { id: "saved", label: "Saved by residents", count: 5 },
  { id: "trending", label: "Popular nearby", count: 4 },
];

const PROPERTY_FILTER_COPY = {
  all: {
    label: "Building portfolio",
    title: "See each building beside the places residents can actually use.",
    body: "This view brings the building, nearby places, resident access, and partner setup into one simple map.",
  },
  perks: {
    label: "Resident perks",
    title: "See which offers are close enough to become a resident habit.",
    body: "Connect each property to restaurants, wellness, retail, and local offers that residents can use without planning a whole outing.",
  },
  events: {
    label: "Event context",
    title: "Show residents what is worth leaving the building for.",
    body: "Events are easier to use when residents can see what is nearby, when it starts, and what else they can do before or after.",
  },
  walkable: {
    label: "Walkable now",
    title: "Explain what is reachable from the front door.",
    body: "Show coffee, dinner, wellness, parks, errands, and offers by how easy they are to reach from the building.",
  },
  saved: {
    label: "Saved by residents",
    title: "Track what people keep for later.",
    body: "Saved places show what residents want to remember, revisit, or compare when they are making plans.",
  },
  trending: {
    label: "Popular nearby",
    title: "See what residents are opening nearby.",
    body: "See which nearby places, events, and offers are getting more attention so your team can plan around what residents already care about.",
  },
};

const AMENITY_ICONS = { Pool: Waves, Gym: Dumbbell, Parking: Car, Concierge: Bell, "Dog Park": Star, Rooftop: Star };

const PROMPTS = [
  "We want to add a neighborhood layer for our residents.",
  "Help us set up building access.",
  "We want to connect nearby offers and events to our building.",
  "Show us how the resident card works.",
];

export default function PropertiesPartner() {
  const [mapFilter, setMapFilter] = useState("all");
  const [activeBuilding, setActiveBuilding] = useState(null);
  const [formText, setFormText] = useState("");

  const activeFilterCopy = PROPERTY_FILTER_COPY[mapFilter] || PROPERTY_FILTER_COPY.all;

  function selectBuilding(b) {
    setActiveBuilding(b.id);
  }

  return (
    <div className="dp-partner-page min-h-screen bg-white text-[#0B1F33]">

      {/* HERO */}
      <section className="min-h-[86vh] pt-36 pb-16 px-5 relative overflow-hidden text-white">
        <img
          src={PROPERTY_HERO_IMAGE}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-[#07192a]/72" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white via-white/55 to-transparent" />
        <div className="relative max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Link to="/partners" className="dp-partner-back-button mb-8 inline-flex items-center justify-center text-white/80 hover:text-white transition-colors group" aria-label="Back to partners" title="Back to partners">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" aria-hidden="true" />
            </Link>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-14 items-start">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}>
              <span className="text-[11px] font-medium text-[#E7C875] uppercase tracking-[0.16em] block mb-4">Property Partner Layer</span>
              <h1 className="dp-property-partner-hero-title font-body text-[31px] md:text-[38px] lg:text-[40px] font-semibold leading-[1.08] tracking-normal text-white mb-5">
                Connect your building to what is happening around it.
              </h1>
              <p className="text-white/78 text-[14px] leading-relaxed mb-8 max-w-lg">
                Residents get a working map of nearby places, offers, and events. Your team gets a clearer picture of how they use the surrounding neighborhood.
              </p>
              <div className="flex flex-wrap gap-3">
                <a href="#partner-form" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[12px] bg-white text-[#0B1F33] font-medium text-[13px] hover:bg-white/90 transition-all ">
                  Activate your building <ArrowRight className="w-4 h-4" />
                </a>
                <a href="#property-map" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[12px] border border-white/32 text-white/80 font-medium text-[13px] hover:text-white transition-all">
                  See the resident layer
                </a>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
              className="self-end border-l border-white/24 pl-5">
              <span className="font-body text-[11px] font-bold uppercase tracking-[0.18em] text-[#E7C875]">Resident context</span>
              <p className="mt-4 max-w-md font-heading text-[28px] font-bold leading-[1.04] tracking-normal text-white md:text-[34px]">
                Give residents a useful reason to open the map.
              </p>
              <p className="mt-4 max-w-sm font-body text-[14px] font-light leading-relaxed text-white/74">
                Connect your building to nearby places, offers, and events people can use. Start small, then add resident access, reporting, and planning tools as the building layer grows.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* MAP */}
      <section id="property-map" className="py-8 px-5 border-t border-border/40">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 items-end">
            <div>
              <span className="text-[11px] font-medium text-primary/70 uppercase tracking-[0.16em] block mb-3">Property Map</span>
              <h2 className="font-heading text-2xl md:text-3xl font-medium leading-[1.2] tracking-normal">See each building beside the places residents can reach easily.</h2>
            </div>
            <p className="text-muted-foreground text-[13px] leading-relaxed">Select a building to see the nearby offers, events, and places that show up in the resident experience.</p>
          </div>
          <div className="flex gap-2 mb-4 overflow-x-auto pb-0.5">
            {MAP_FILTERS.map(f => (
              <button key={f.id} onClick={() => setMapFilter(f.id)}
                className={`px-3.5 py-2 rounded-[12px] text-[12px] font-medium whitespace-nowrap border transition-all flex-shrink-0 ${mapFilter === f.id ? "border-primary/50 bg-primary/10 text-primary" : "border-border/40 text-muted-foreground hover:text-foreground"}`}>
                {f.label} <span className={`ml-1.5 text-[10px] ${mapFilter === f.id ? "text-primary/70" : "text-muted-foreground/50"}`}>{f.count}</span>
              </button>
            ))}
          </div>
          <CompactPropertyMap
            activeBuilding={activeBuilding}
            activeFilterCopy={activeFilterCopy}
            buildings={BUILDINGS}
            nearby={NEARBY}
            selectBuilding={selectBuilding}
            setActiveBuilding={setActiveBuilding}
          />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <HowItWorks steps={[
        { n: "1", label: "Register the building", detail: "Add your property and configure the resident access layer." },
        { n: "2", label: "Residents get access", detail: "On day one they can open the map and see what is nearby." },
        { n: "3", label: "Nearby context goes live", detail: "Offers, events, and walkable venues appear in the right places." },
        { n: "4", label: "Residents use it", detail: "They save places, unlock offers, and RSVP to things nearby." },
        { n: "5", label: "Your team sees what worked", detail: "Review the places, offers, and events residents used most." },
      ]} proof={["Resident access", "Nearby context", "Local perks", "Useful places"]} />

      {/* BUILDING CARDS */}
      <BuildingCards buildings={BUILDINGS} selectBuilding={selectBuilding} />

      {/* FORM */}
      <PartnerForm headline="Tell us about your building"
        body="Tell us about your building and what you want to connect. We will find the right setup."
        formText={formText} setFormText={setFormText}
        prompts={PROMPTS} defaultType="Property" />
    </div>
  );
}

function CompactPropertyMap({ buildings, nearby, activeBuilding, setActiveBuilding, selectBuilding, activeFilterCopy }) {
  const building = activeBuilding ? buildings.find(b => b.id === activeBuilding) : buildings[0];
  const selected = building || buildings[0];
  const nearbyForBuilding = selected.nearby.slice(0, 4);
  const mapPins = buildings.map((b, index) => ({
    ...b,
    x: [18, 42, 62, 30, 72, 53][index] || 50,
    y: [34, 28, 52, 64, 38, 72][index] || 50,
  }));

  return (
    <div className="dp-property-map-compact" aria-live="polite">
      <div className="dp-property-map-copy">
        <span>{activeFilterCopy.label}</span>
        <h3>{activeFilterCopy.title}</h3>
        <p>{activeFilterCopy.body}</p>
      </div>

      <div className="dp-property-building-rail" aria-label="Buildings">
        {buildings.map(b => (
          <button
            key={b.id}
            type="button"
            className={b.id === selected.id ? "is-active" : ""}
            onClick={() => selectBuilding(b)}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>
              <strong>{b.name}</strong>
              <small>{b.address}</small>
            </span>
          </button>
        ))}
      </div>

      <div className="dp-property-map-layout">
        <div className="dp-property-mini-map" aria-label="Property map preview">
          <div className="dp-property-mini-map-grid" aria-hidden="true" />
          <div className="dp-property-mini-map-route" aria-hidden="true" />
          {mapPins.map(pin => (
            <button
              key={pin.id}
              type="button"
              className={pin.id === selected.id ? "is-active" : ""}
              style={{ "--x": `${pin.x}%`, "--y": `${pin.y}%` }}
              onClick={() => selectBuilding(pin)}
              aria-label={pin.name}
            >
              <span>{pin.name}</span>
            </button>
          ))}
          {nearby.slice(0, 4).map((item, index) => (
            <span
              key={item.name}
              className="dp-property-nearby-pin"
              style={{
                "--x": `${[28, 78, 46, 66][index] || 52}%`,
                "--y": `${[18, 26, 78, 18][index] || 46}%`,
              }}
            >
              {item.name}
            </span>
          ))}
        </div>

        <aside className="dp-property-map-detail" aria-label={`${selected.name} details`}>
          <div className="dp-property-detail-header">
            <div>
              <span>Selected building</span>
              <h3>{selected.name}</h3>
              <p>{selected.address} · {selected.dist}</p>
            </div>
            {activeBuilding ? (
              <button type="button" aria-label="Clear selected building" onClick={() => setActiveBuilding(null)}>
                <X className="w-4 h-4" />
              </button>
            ) : null}
          </div>

          <div className="dp-property-detail-section">
            <h4>What residents see nearby</h4>
            <div className="dp-property-chip-rail">
              {nearbyForBuilding.map(item => <span key={item}>{item}</span>)}
            </div>
          </div>

          <div className="dp-property-detail-section">
            <h4>Building amenities</h4>
            <div className="dp-property-chip-rail">
              {selected.amenities.map(a => {
                const Icon = AMENITY_ICONS[a] || Star;
                return (
                  <span key={a}>
                    <Icon className="w-3 h-3" />
                    {a}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="dp-property-detail-section">
            <h4>Best first setup</h4>
            <p>Start with a resident welcome link, a lobby QR, and a nearby places rail tied to this building.</p>
          </div>

          <div className="dp-property-detail-section">
            <h4>Useful next step</h4>
            <p>Choose one nearby offer or event residents can use this week, then place it beside this building in the map.</p>
          </div>

          <div className="dp-property-detail-actions">
            <a href="/map?mode=partner&tab=map&filter=Properties">
              <MapPin className="w-3.5 h-3.5" />
              Open map
            </a>
            <a href="#partner-form">Activate building</a>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ─── SHARED SUB-COMPONENTS ────────────────────────────────────────────────────

function HowItWorks({ steps, proof }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <section ref={ref} className="py-10 px-5 border-t border-border/40">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={inView ? { opacity: 1, y: 0 } : {}} className="mb-10">
          <span className="text-[11px] font-medium text-primary/70 uppercase tracking-[0.16em] block mb-3">How it works</span>
          <h2 className="font-heading text-2xl md:text-3xl font-medium tracking-normal">From building to the neighborhood around it.</h2>
        </motion.div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-5 md:gap-6">
            {steps.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.1 }}
                className="grid grid-cols-[30px_1fr] gap-3 md:block">
                <div className="font-heading text-[16px] font-bold leading-none text-[#A98B4A] md:text-[20px]">{s.n}</div>
                <div>
                  <div className="text-[13px] font-semibold leading-snug text-[#0B1F33]">{s.label}</div>
                  <div className="mt-1.5 text-[12px] leading-5 text-[#425466]">{s.detail}</div>
                </div>
              </motion.div>
            ))}
        </div>
        <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2">
          {proof.map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.6 + i * 0.05 }}
              className="flex items-center gap-2 py-2">
              <div className="h-px w-4 shrink-0 bg-[#A98B4A]" />
              <span className="text-[12px] leading-5 text-[#425466]">{item}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BuildingCards({ buildings, selectBuilding }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <section ref={ref} className="py-10 px-5 border-t border-border/40">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={inView ? { opacity: 1, y: 0 } : {}} className="mb-8">
          <span className="text-[11px] font-medium text-primary/70 uppercase tracking-[0.16em] block mb-3">Live buildings</span>
          <h2 className="font-heading text-2xl md:text-3xl font-medium tracking-normal">Buildings ready for the resident map.</h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {buildings.slice(0, 3).map((b, i) => (
            <motion.div key={b.id} initial={{ opacity: 0, y: 10 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.08 }}
              onClick={() => selectBuilding(b)}
              className="p-5 rounded-xl border border-border/50 bg-card/40 hover:border-primary/30 cursor-pointer transition-all">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-4 h-4 text-primary/60" />
                <span className="font-heading font-medium text-[13px] text-foreground">{b.name}</span>
              </div>
              <div className="h-1.5 rounded-[12px] bg-border/50 mb-4 overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={inView ? { width: `${70 + i * 8}%` } : {}}
                  transition={{ duration: 1, delay: 0.3 + i * 0.1 }} className="h-full rounded-[12px] bg-primary" />
              </div>
              <div className="space-y-2 text-[12px]">
                <div className="flex justify-between gap-4 text-muted-foreground">
                  <span>Address</span><span className="text-foreground font-medium text-right">{b.address}</span>
                </div>
                <div className="flex justify-between gap-4 text-muted-foreground">
                  <span>Nearby</span><span className="text-foreground font-medium text-right">{b.dist}</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-border/40">
                <div className="text-[10px] text-muted-foreground/60 uppercase tracking-[0.1em] mb-1">Good first placement</div>
                <div className="text-[12px] text-foreground truncate">{b.top}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PartnerForm({ headline, body, formText, setFormText, prompts }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <section id="partner-form" ref={ref} className="py-10 px-5 border-t border-border/40">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-8 items-end">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={inView ? { opacity: 1, y: 0 } : {}}>
            <span className="text-[11px] font-medium text-primary/70 uppercase tracking-[0.16em] block mb-3">Contact</span>
            <h2 className="font-heading text-2xl md:text-3xl font-medium tracking-normal">{headline}</h2>
          </motion.div>
          <p className="text-muted-foreground text-[13px] leading-relaxed">{body}</p>
        </div>
        <div className="border border-border/50 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-8 md:border-r border-border/40 space-y-4">
              {[["Organization / Building Name", "text"], ["Your Name & Role", "text"], ["Email", "email"], ["Phone", "tel"]].map(([label, type]) => (
                <div key={label}>
                  <label className="block text-[11px] font-medium text-[#0B1F33] uppercase tracking-[0.1em] mb-1.5">{label}</label>
                  <input type={type} className="w-full bg-muted/30 border border-border/50 px-4 py-2.5 text-[13px] text-foreground outline-none focus:border-primary/40 transition-colors" />
                </div>
              ))}
              <div className="dp-partner-form-message">
                <label className="block text-[11px] font-medium text-[#0B1F33] uppercase tracking-[0.1em] mb-1.5">What are you looking to do</label>
                <textarea rows={4} value={formText} onChange={e => setFormText(e.target.value)}
                  placeholder="Tell us about your building and what you want to connect."
                  className="w-full bg-muted/30 border border-border/50 px-4 py-2.5 text-[13px] text-foreground outline-none focus:border-primary/40 transition-colors resize-none placeholder-muted-foreground/30" />
                <div className="dp-partner-prompt-inline" aria-label="Suggested prompts">
                  {prompts.map(p => (
                    <button key={p} type="button" onClick={() => setFormText(p)}>{p}</button>
                  ))}
                </div>
              </div>
              <button className="w-full py-2.5 bg-primary text-primary-foreground font-medium text-[13px] hover:bg-primary/90 transition-all">Activate your building</button>
            </div>
            <div className="p-8 bg-muted/10 flex flex-col">
              <p className="text-[13px] leading-6 text-[#0B1F33]/68">Share the building, the resident need, and the first nearby experience you want to connect.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
