import { useState, useRef, useEffect } from "react";
import { motion, useInView, animate } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, X, Building2, Star, Waves, Dumbbell, Car, Bell } from "lucide-react";
import PartnerMapIntelligenceLayer from "@/components/partner/PartnerMapIntelligenceLayer";

function CountUp({ to, duration = 1.2 }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    const c = animate(0, to, { duration, onUpdate: v => setVal(Math.round(v)) });
    return c.stop;
  }, [inView, to]);
  return <span ref={ref}>{val.toLocaleString()}</span>;
}

const BUILDINGS = [
  {
    id: "quincy", name: "The Quincy", address: "300 W 6th St", lat: 30.2680, lng: -97.7460,
    dist: "0.2 mi to Congress", interactions: 214, saves: 44, unlocks: 19, scans: 42, rsvps: 8,
    trend: "+14% this week", top: "Public Art Walk",
    amenities: ["Pool", "Gym", "Parking", "Concierge"],
    nearby: ["Downtown Style Weekend", "Public Art Walk", "Rooftop Yoga", "Happy Hour at Half Step"],
  },
  {
    id: "seaholm", name: "Seaholm Residences", address: "222 West Ave", lat: 30.2700, lng: -97.7510,
    dist: "0.3 mi to Seaholm", interactions: 188, saves: 36, unlocks: 17, scans: 34, rsvps: 6,
    trend: "+9% this week", top: "Coffee near Seaholm",
    amenities: ["Pool", "Gym", "Dog Park"],
    nearby: ["Coffee near Seaholm", "Waterloo Sunset Series", "Wellness Walk Club"],
  },
  {
    id: "independent", name: "The Independent", address: "301 West Ave", lat: 30.2710, lng: -97.7500,
    dist: "0.4 mi to Seaholm", interactions: 167, saves: 28, unlocks: 15, scans: 29, rsvps: 5,
    trend: "+11% this week", top: "Dinner near Congress",
    amenities: ["Pool", "Parking", "Gym"],
    nearby: ["Dinner near Congress", "Public Art Walk", "Legends listing request"],
  },
  {
    id: "hanover", name: "Hanover Republic Square", address: "115 W 3rd St", lat: 30.2660, lng: -97.7420,
    dist: "0.1 mi to Republic Sq", interactions: 142, saves: 24, unlocks: 12, scans: 23, rsvps: 4,
    trend: "+7% this week", top: "Happy Hour nearby",
    amenities: ["Pool", "Concierge", "Parking"],
    nearby: ["Happy Hour at Half Step", "Public Art Walk"],
  },
  {
    id: "bowie", name: "The Bowie", address: "400 Bowie St", lat: 30.2645, lng: -97.7445,
    dist: "0.2 mi to Convention Ctr", interactions: 128, saves: 22, unlocks: 11, scans: 19, rsvps: 3,
    trend: "+6% this week", top: "Dinner near Rainey",
    amenities: ["Gym", "Parking"],
    nearby: ["Dinner near Rainey", "Waterloo Sunset Series"],
  },
  {
    id: "6g", name: "Residences at 6G", address: "600 Guadalupe St", lat: 30.2730, lng: -97.7490,
    dist: "0.3 mi to UT edge", interactions: 112, saves: 18, unlocks: 9, scans: 15, rsvps: 2,
    trend: "+5% this week", top: "Coffee nearby",
    amenities: ["Gym", "Rooftop"],
    nearby: ["Coffee nearby", "Wellness Walk Club"],
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
  { id: "all", label: "Buildings", count: 6 },
  { id: "perks", label: "Perks", count: 9 },
  { id: "events", label: "Events", count: 6 },
  { id: "walkable", label: "Walkable now", count: 8 },
  { id: "saved", label: "Saved by residents", count: 5 },
  { id: "trending", label: "Trending nearby", count: 4 },
];

const LIVE_FEED = [
  { text: "The Quincy resident saved Happy Hour at Half Step", time: "Just now" },
  { text: "Seaholm resident opened Waterloo Sunset Series", time: "5 min ago" },
  { text: "6G resident unlocked 15% off dinner nearby", time: "Trending" },
  { text: "Hanover resident viewed coffee near Seaholm", time: "Nearby" },
];

const AMENITY_ICONS = { Pool: Waves, Gym: Dumbbell, Parking: Car, Concierge: Bell, "Dog Park": Star, Rooftop: Star };

const FORM_TYPES = ["Property", "Hotel", "Venue", "Brand", "Civic"];
const PROMPTS = [
  "We want to add a neighborhood layer for our residents.",
  "Help us set up building access.",
  "We want to connect nearby offers and events to our building.",
  "Show us how the resident card works.",
];

export default function PropertiesPartner() {
  const [mapFilter, setMapFilter] = useState("all");
  const [activeBuilding, setActiveBuilding] = useState(null);
  const [formType, setFormType] = useState("Property");
  const [formText, setFormText] = useState("");

  const building = activeBuilding ? BUILDINGS.find(b => b.id === activeBuilding) : null;

  function selectBuilding(b) {
    setActiveBuilding(b.id);
  }

  return (
    <div className="min-h-screen bg-background">

      {/* HERO */}
      <section className="pt-36 pb-16 px-5 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: "linear-gradient(rgba(11,31,51,0.18) 1px,transparent 1px),linear-gradient(90deg,rgba(11,31,51,0.18) 1px,transparent 1px)", backgroundSize: "56px 56px" }} />
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Link to="/brands" className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-primary transition-colors mb-8 group">
              <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" /> Partner Directory
            </Link>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-14 items-start">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}>
              <span className="text-[11px] font-medium text-primary/70 uppercase tracking-[0.16em] block mb-4">Property Partner Layer</span>
              <h1 className="font-heading text-4xl md:text-4xl lg:text-4xl font-medium leading-[1.05] tracking-normal mb-5">
                Connect your building to what is <em className="text-primary">happening around it.</em>
              </h1>
              <p className="text-muted-foreground text-[14px] leading-relaxed mb-8 max-w-lg">
                Residents get a working map of nearby places, offers, and events. Your team gets a clearer picture of how they use the surrounding neighborhood.
              </p>
              <div className="flex flex-wrap gap-3">
                <a href="#partner-form" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-medium text-[13px] hover:bg-primary/90 transition-all shadow-md shadow-primary/15">
                  Activate your building <ArrowRight className="w-4 h-4" />
                </a>
                <a href="#property-map" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border/70 text-foreground/70 font-medium text-[13px] hover:text-foreground transition-all">
                  See the resident layer
                </a>
              </div>
            </motion.div>

            {/* Proof strip */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}>
              <div className="rounded-xl border border-border/60 bg-card/60 overflow-hidden">
                <div className="grid grid-cols-3 divide-x divide-border/40 border-b border-border/40">
                  {[{ label: "Buildings live", v: 6 }, { label: "Resident interactions", v: 1284 }, { label: "Perks unlocked", v: 412 }].map((s, i) => (
                    <div key={i} className="p-5 text-center">
                      <div className="font-heading text-2xl font-medium text-foreground"><CountUp to={s.v} /></div>
                      <div className="text-[11px] text-muted-foreground mt-1">{s.label}</div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 divide-x divide-border/40 border-b border-border/40">
                  {[{ label: "Buildings trending", v: 3 }, { label: "Card activations", v: 186 }, { label: "Resident saves", v: 92 }].map((s, i) => (
                    <div key={i} className="p-3.5 text-center">
                      <div className="font-medium text-[13px] text-foreground"><CountUp to={s.v} /></div>
                      <div className="text-[11px] text-muted-foreground/60">{s.label}</div>
                    </div>
                  ))}
                </div>
                <div className="px-5 py-2.5 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#B38F4F]" />
                  <span className="text-[11px] text-muted-foreground/60">Updated 3 min ago</span>
                </div>
              </div>
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
              <h2 className="font-heading text-2xl md:text-3xl font-medium leading-[1.2] tracking-normal">See each building alongside what is walkable from it.</h2>
            </div>
            <p className="text-muted-foreground text-[13px] leading-relaxed">Select a building to see the nearby offers, events, and places that show up in the resident experience.</p>
          </div>
          <div className="flex gap-2 mb-4 overflow-x-auto pb-0.5">
            {MAP_FILTERS.map(f => (
              <button key={f.id} onClick={() => setMapFilter(f.id)}
                className={`px-3.5 py-2 rounded-full text-[12px] font-medium whitespace-nowrap border transition-all flex-shrink-0 ${mapFilter === f.id ? "border-primary/50 bg-primary/10 text-primary" : "border-border/40 text-muted-foreground hover:text-foreground"}`}>
                {f.label} <span className={`ml-1.5 text-[10px] ${mapFilter === f.id ? "text-primary/70" : "text-muted-foreground/50"}`}>{f.count}</span>
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 overflow-hidden" style={{ height: 480 }}>
              <PartnerMapIntelligenceLayer
                activeId={activeBuilding}
                caption="Property intelligence layer"
                insight="Buildings, resident saves, nearby perks, and events in one working view."
                kind="property"
                nearby={NEARBY}
                onSelect={selectBuilding}
                points={BUILDINGS}
              />
            </div>
            <div className="rounded-xl border border-border/50 bg-card/60 overflow-hidden flex flex-col">
              {!building ? (
                <>
                  <div className="p-5 border-b border-border/40">
                    <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.12em] mb-1">Resident use right now</div>
                  </div>
                  <div className="flex-1 divide-y divide-border/40 overflow-y-auto">
                    {LIVE_FEED.map((item, i) => (
                      <div key={i} className="p-4 flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-1.5 shrink-0" />
                        <div className="flex-1">
                          <div className="text-[12px] text-foreground leading-relaxed">{item.text}</div>
                        </div>
                        <span className="text-[10px] text-muted-foreground shrink-0 whitespace-nowrap">{item.time}</span>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 border-t border-border/40">
                    <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.12em] mb-3">Buildings</div>
                    <div className="space-y-2">
                      {BUILDINGS.slice(0, 4).map(b => (
                        <button key={b.id} onClick={() => selectBuilding(b)}
                          className="w-full flex items-center gap-2.5 p-2.5 rounded-lg border border-border/40 hover:border-primary/30 transition-all text-left">
                          <Building2 className="w-3.5 h-3.5 text-primary/60 shrink-0" />
                          <span className="text-[12px] font-medium text-foreground flex-1 truncate">{b.name}</span>
                          <span className="text-[10px] text-muted-foreground">{b.interactions} interactions</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <motion.div key={building.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full">
                  <div className="p-5 border-b border-border/40 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-foreground text-[13px]">{building.name}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{building.dist}</div>
                    </div>
                    <button onClick={() => setActiveBuilding(null)} className="text-muted-foreground hover:text-foreground transition-colors"><X className="w-4 h-4" /></button>
                  </div>
                  <div className="flex-1 p-5 space-y-4 overflow-y-auto">
                    <div className="grid grid-cols-4 gap-2">
                      {[{ l: "Scans", v: building.scans }, { l: "Saves", v: building.saves }, { l: "Unlocks", v: building.unlocks }, { l: "RSVPs", v: building.rsvps }].map((s, i) => (
                        <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/40 text-center">
                          <div className="font-heading text-lg font-medium text-foreground">{s.v}</div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">{s.l}</div>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
                      <div className="text-[12px] font-medium text-foreground">Trend</div>
                      <div className="text-[12px] font-medium text-primary">{building.trend}</div>
                    </div>
                    <div>
                      <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.1em] mb-2">Amenities</div>
                      <div className="flex flex-wrap gap-2">
                        {building.amenities.map(a => {
                          const Icon = AMENITY_ICONS[a] || Star;
                          return (
                            <span key={a} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border/50 bg-muted/30 text-[11px] text-foreground/80">
                              <Icon className="w-3 h-3 text-primary/50" />{a}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.1em] mb-2">Live nearby</div>
                      <div className="space-y-1.5">
                        {building.nearby.map((n, i) => (
                          <div key={i} className="flex items-center gap-2 text-[12px] text-muted-foreground">
                            <div className="w-1 h-1 rounded-full bg-primary/40 shrink-0" />{n}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border-t border-border/40 flex gap-2">
                    <button className="flex-1 py-2.5 rounded-full bg-primary text-primary-foreground text-[12px] font-medium hover:bg-primary/90 transition-all">View nearby</button>
                    <button className="flex-1 py-2.5 rounded-full border border-border/60 text-foreground/70 text-[12px] font-medium hover:text-foreground transition-all">Activate</button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* IMPACT */}
      <ProofSection stats={[
        { label: "Building views", v: 5420 }, { label: "Resident scans", v: 612 },
        { label: "Saves", v: 184 }, { label: "Offer unlocks", v: 137 }, { label: "Walkable actions", v: 221 },
      ]} lower={[
        { label: "Buildings live", v: "6" }, { label: "Card activations", v: "186" },
        { label: "Nearby offers", v: "12" }, { label: "Events linked", v: "6" },
        { label: "Avg walk radius", v: "5 min" }, { label: "Return visits", v: "38%" },
      ]} headline="What activity looks like across the portfolio." />

      {/* HOW IT WORKS */}
      <HowItWorks steps={[
        { n: "1", label: "Register the building", detail: "Add your property and configure the resident access layer." },
        { n: "2", label: "Residents get access", detail: "On day one they can open the map and see what is nearby." },
        { n: "3", label: "Nearby context goes live", detail: "Offers, events, and walkable venues appear in the right places." },
        { n: "4", label: "Residents use it", detail: "They save places, unlock offers, and RSVP to things nearby." },
        { n: "5", label: "Your team sees the data", detail: "Track which activity is getting the most traction by building." },
      ]} proof={["6 live buildings", "12 nearby offers", "186 card activations", "137 unlocks"]} />

      {/* BUILDING CARDS */}
      <BuildingCards buildings={BUILDINGS} selectBuilding={selectBuilding} />

      {/* FORM */}
      <PartnerForm headline="Tell us about your building"
        body="Tell us about your building and what you want to connect. We will find the right setup."
        formType={formType} setFormType={setFormType} formText={formText} setFormText={setFormText}
        prompts={PROMPTS} defaultType="Property" />

      {/* CLOSING CTA */}
      <ClosingCTA eyebrow="Property partner layer"
        headline="Give your residents a reason to open the map."
        body="Six buildings are already live. Most started with a 90-day pilot at no cost."
        proof="Ready to walk through the setup? Reach out to our team."
        ctaLabel="Add your building" ctaHref="#partner-form"
        secondLabel="See the map" secondHref="#property-map" />
    </div>
  );
}

// ─── SHARED SUB-COMPONENTS ────────────────────────────────────────────────────

function ProofSection({ stats, lower, headline }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <section ref={ref} className="py-10 px-5 border-t border-border/40">
      <div className="max-w-6xl mx-auto">
        <motion.h2 initial={{ opacity: 0, y: 10 }} animate={inView ? { opacity: 1, y: 0 } : {}} className="font-heading text-2xl md:text-3xl font-medium tracking-normal mb-8">{headline}</motion.h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
          {stats.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.06 }}
              className="p-5 rounded-lg border border-border/50 bg-card/40 text-center">
              <div className="font-heading text-2xl font-medium text-foreground"><CountUp to={s.v} /></div>
              <div className="text-[11px] text-muted-foreground mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {lower.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.3 + i * 0.05 }}
              className="p-4 rounded-lg border border-border/40 bg-card/20">
              <div className="font-heading text-lg font-medium text-foreground">{s.v}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

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
        <div className="relative">
          <div className="hidden md:block absolute top-8 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {steps.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center text-center md:items-start md:text-left">
                <div className="w-10 h-10 rounded-full border border-primary/40 bg-card flex items-center justify-center mb-4 z-10">
                  <span className="text-primary font-heading font-medium text-[13px]">{s.n}</span>
                </div>
                <div className="font-medium text-[13px] text-foreground mb-1.5">{s.label}</div>
                <div className="text-[12px] text-muted-foreground leading-relaxed">{s.detail}</div>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3">
          {proof.map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.6 + i * 0.05 }}
              className="flex items-center gap-2 p-3 rounded-lg border border-border/40 bg-card/20">
              <div className="w-1 h-1 rounded-full bg-primary shrink-0" />
              <span className="text-[12px] text-muted-foreground">{item}</span>
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
          <h2 className="font-heading text-2xl md:text-3xl font-medium tracking-normal">Activity across live buildings.</h2>
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
              <div className="h-1.5 rounded-full bg-border/50 mb-4 overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={inView ? { width: `${Math.min(100, (b.interactions / 230) * 100)}%` } : {}}
                  transition={{ duration: 1, delay: 0.3 + i * 0.1 }} className="h-full rounded-full bg-primary" />
              </div>
              <div className="space-y-2 text-[12px]">
                {[["Interactions", b.interactions], ["Saves", b.saves], ["Unlocks", b.unlocks]].map(([l, v]) => (
                  <div key={l} className="flex justify-between text-muted-foreground">
                    <span>{l}</span><span className="text-foreground font-medium">{v}</span>
                  </div>
                ))}
                <div className="flex justify-between text-muted-foreground">
                  <span>Trend</span><span className="text-primary font-medium">{b.trend}</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-border/40">
                <div className="text-[10px] text-muted-foreground/60 uppercase tracking-[0.1em] mb-1">Top nearby</div>
                <div className="text-[12px] text-foreground truncate">{b.top}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PartnerForm({ headline, body, formType, setFormType, formText, setFormText, prompts, defaultType }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const TYPES = ["Property", "Hotel", "Venue", "Brand", "Civic"];
  return (
    <section id="partner-form" ref={ref} className="py-10 px-5 border-t border-border/40">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-8 items-end">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={inView ? { opacity: 1, y: 0 } : {}}>
            <span className="text-[11px] font-medium text-primary/70 uppercase tracking-[0.16em] block mb-3">Get started</span>
            <h2 className="font-heading text-2xl md:text-3xl font-medium tracking-normal">{headline}</h2>
          </motion.div>
          <p className="text-muted-foreground text-[13px] leading-relaxed">{body}</p>
        </div>
        <div className="border border-border/50 rounded-xl overflow-hidden">
          <div className="flex border-b border-border/40 overflow-x-auto">
            {TYPES.map(t => (
              <button key={t} onClick={() => setFormType(t)}
                className={`px-5 py-4 text-[12px] font-medium whitespace-nowrap border-r border-border/40 last:border-r-0 transition-all ${formType === t ? "text-primary bg-primary/5" : "text-muted-foreground hover:text-foreground"}`}>
                {t}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-8 md:border-r border-border/40 space-y-4">
              {[["Organization / Building Name", "text"], ["Your Name & Role", "text"], ["Email", "email"], ["Phone", "tel"]].map(([label, type]) => (
                <div key={label}>
                  <label className="block text-[11px] font-medium text-muted-foreground uppercase tracking-[0.1em] mb-1.5">{label}</label>
                  <input type={type} className="w-full bg-muted/30 border border-border/50 rounded-lg px-4 py-2.5 text-[13px] text-foreground outline-none focus:border-primary/40 transition-colors" />
                </div>
              ))}
              <div>
                <label className="block text-[11px] font-medium text-muted-foreground uppercase tracking-[0.1em] mb-1.5">What are you looking to do</label>
                <textarea rows={4} value={formText} onChange={e => setFormText(e.target.value)}
                  placeholder="Tell us about your building and what you want to connect."
                  className="w-full bg-muted/30 border border-border/50 rounded-lg px-4 py-2.5 text-[13px] text-foreground outline-none focus:border-primary/40 transition-colors resize-none placeholder-muted-foreground/30" />
              </div>
              <button className="w-full py-2.5 rounded-full bg-primary text-primary-foreground font-medium text-[13px] hover:bg-primary/90 transition-all">Activate your building</button>
            </div>
            <div className="p-8 bg-muted/10 flex flex-col">
              <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.12em] mb-4">Prompts</div>
              <div className="space-y-2 flex-1">
                {prompts.map(p => (
                  <button key={p} onClick={() => setFormText(p)}
                    className="w-full text-left px-4 py-2.5 rounded-lg border border-border/40 hover:border-primary/30 text-[13px] text-muted-foreground hover:text-foreground transition-all">{p}</button>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-border/40">
                <p className="text-[12px] text-muted-foreground/60 italic">Questions? <a href="mailto:partners@downtownperks.com" className="text-primary hover:underline underline-offset-4">partners@downtownperks.com</a></p>
                <p className="text-[11px] text-muted-foreground/40 mt-1">Downtown Perks · Austin, Texas</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ClosingCTA({ eyebrow, headline, body, proof, ctaLabel, ctaHref, secondLabel, secondHref }) {
  return (
    <section className="py-12 px-5 border-t border-border/40">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="text-[11px] font-medium text-primary/70 uppercase tracking-[0.16em] block mb-4">{eyebrow}</span>
            <h2 className="font-heading text-3xl md:text-4xl font-medium leading-[1.15] tracking-normal mb-3">{headline}</h2>
            <p className="text-muted-foreground text-[13px] leading-relaxed">{body}</p>
          </div>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <a href={ctaHref} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-medium text-[13px] hover:bg-primary/90 transition-all">
                {ctaLabel} <ArrowRight className="w-4 h-4" />
              </a>
              <a href={secondHref} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border/70 text-foreground/70 font-medium text-[13px] hover:text-foreground transition-all">
                {secondLabel}
              </a>
            </div>
            <p className="text-[12px] text-muted-foreground/50 italic">{proof}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
