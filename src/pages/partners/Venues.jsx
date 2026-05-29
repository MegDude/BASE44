import { useState, useRef, useEffect } from "react";
import { motion, useInView, animate } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, X, Search } from "lucide-react";
import PartnerMapIntelligenceLayer from "@/components/partner/PartnerMapIntelligenceLayer";
import { PARTNER_SPACING, PARTNER_GRIDS } from '@/lib/partner-system';
import FAQAccordionBlock from '@/components/ui/FAQAccordionBlock';
import { FAQ_VENUES } from '@/lib/faq-partner-data';

const CAT_COLORS = { bar: "#081521", restaurant: "#B38F4F", fitness: "#0B1F33", wellness: "#B38F4F", retail: "#0B1F33", coffee: "#B38F4F" };

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

const VENUES = [
  { id: "halfstep", name: "Half Step", cat: "bar", lat: 30.2578, lng: -97.7368, dist: "0.3 mi · 5 min walk", views: 124, saves: 42, visits: 19, redemptions: 7, trend: "+18% this week", trigger: "Happy Hour Nearby", live: ["Happy Hour", "Jazz Night", "Good for groups"], offer: "15% off cocktails tonight" },
  { id: "bangers", name: "Banger's", cat: "bar", lat: 30.2575, lng: -97.7372, dist: "0.4 mi · 6 min walk", views: 110, saves: 36, visits: 17, redemptions: 5, trend: "+11% this week", trigger: "Dinner near Rainey", live: ["Late Night Menu", "Live Music", "Patio open"], offer: "Free first drink for card holders" },
  { id: "merit", name: "Merit Coffee", cat: "coffee", lat: 30.2695, lng: -97.7500, dist: "0.2 mi · 3 min walk", views: 98, saves: 28, visits: 15, redemptions: 4, trend: "+9% this week", trigger: "Coffee near Seaholm", live: ["Open now", "Espresso bar", "Quiet workspace"], offer: "Free drip with a pastry" },
  { id: "equinox", name: "Equinox", cat: "fitness", lat: 30.2670, lng: -97.7420, dist: "0.5 mi · 7 min walk", views: 88, saves: 24, visits: 13, redemptions: 3, trend: "+7% this week", trigger: "Wellness near Congress", live: ["Morning classes", "Pilates", "Sauna open"], offer: "First class free for residents" },
  { id: "aba", name: "Aba", cat: "restaurant", lat: 30.2600, lng: -97.7380, dist: "0.3 mi · 5 min walk", views: 84, saves: 22, visits: 12, redemptions: 3, trend: "+6% this week", trigger: "Dinner near Rainey", live: ["Dinner service", "Rooftop open", "Happy hour 4–7"], offer: "Complimentary mezze for two" },
  { id: "twohands", name: "Two Hands", cat: "coffee", lat: 30.2635, lng: -97.7400, dist: "0.4 mi · 6 min walk", views: 78, saves: 19, visits: 11, redemptions: 2, trend: "+5% this week", trigger: "Coffee on the way", live: ["Brunch menu", "All-day coffee"], offer: "15% off for card holders" },
  { id: "paperboy", name: "Paperboy", cat: "restaurant", lat: 30.2650, lng: -97.7410, dist: "0.3 mi · 4 min walk", views: 72, saves: 17, visits: 10, redemptions: 2, trend: "+4% this week", trigger: "Brunch nearby", live: ["Brunch", "Outdoor seating"], offer: "Free coffee with breakfast" },
  { id: "hestia", name: "Hestia", cat: "restaurant", lat: 30.2660, lng: -97.7430, dist: "0.2 mi · 3 min walk", views: 68, saves: 15, visits: 9, redemptions: 2, trend: "+4% this week", trigger: "Dinner on Congress", live: ["Dinner service", "Bar open"], offer: "Dessert on the house" },
];

const MAP_FILTERS = [
  { id: "all", label: "Venues", count: 24 },
  { id: "live", label: "Live now", count: 8 },
  { id: "offers", label: "Offers", count: 10 },
  { id: "walkable", label: "Walkable now", count: 12 },
  { id: "trending", label: "Trending", count: 7 },
  { id: "saved", label: "Saved nearby", count: 6 },
];

const DECISION_MOMENTS = [
  { query: '"coffee near Seaholm"', result: "Merit Coffee", sub: "0.2 mi · Free drip with a pastry" },
  { query: '"dinner near Rainey"', result: "Aba and Banger's", sub: "0.3–0.4 mi · Offers active" },
  { query: '"wellness near Congress"', result: "Equinox", sub: "0.5 mi · First class free" },
  { query: '"where should I meet someone"', result: "Half Step", sub: "0.3 mi · Happy Hour on now" },
];

const PROMPTS = [
  "We want to appear when people nearby are searching our category.",
  "Help us add an offer.",
  "Show us how the map placement works.",
  "We want to connect our venue to nearby events.",
];

export default function VenuesPartner() {
  const [mapFilter, setMapFilter] = useState("all");
  const [activeVenue, setActiveVenue] = useState(null);
  const [formType, setFormType] = useState("Venue");
  const [formText, setFormText] = useState("");

  const venue = activeVenue ? VENUES.find(v => v.id === activeVenue) : null;

  function selectVenue(v) { setActiveVenue(v.id); }

  return (
    <div className="min-h-screen bg-background">
      {/* HERO */}
      <section className={`${PARTNER_SPACING.heroVertical} px-5 relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(11,31,51,0.18) 1px,transparent 1px),linear-gradient(90deg,rgba(11,31,51,0.18) 1px,transparent 1px)", backgroundSize: "56px 56px" }} />
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Link to="/brands" className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-primary transition-colors mb-8 group">
              <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" /> Partner Directory
            </Link>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-14 items-start">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}>
              <span className="text-[11px] font-medium text-primary/70 uppercase tracking-[0.16em] block mb-4">Venue Partner Layer</span>
              <h1 className="font-heading text-4xl md:text-4xl lg:text-4xl font-medium leading-[1.05] tracking-normal mb-5">
                Be on the map when people nearby are <em className="text-primary">deciding where to go.</em>
              </h1>
              <p className="text-muted-foreground text-[14px] leading-relaxed mb-8 max-w-lg">Your place shows up at the right moment — when someone close by is looking for food, a drink, a class, or somewhere to go.</p>
              <div className="flex flex-wrap gap-3">
                <a href="#partner-form" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-medium text-[13px] hover:bg-primary/90 transition-all shadow-md shadow-primary/15">
                  Add your venue <ArrowRight className="w-4 h-4" />
                </a>
                <a href="#venue-map" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border/70 text-foreground/70 font-medium text-[13px] hover:text-foreground transition-all">
                  See the live map
                </a>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}>
              <div className="rounded-xl border border-border/60 bg-card/60 overflow-hidden">
                <div className="grid grid-cols-3 divide-x divide-border/40 border-b border-border/40">
                  {[{ label: "Venues active", v: 24 }, { label: "Map views", v: 3182 }, { label: "Saves", v: 712 }].map((s, i) => (
                    <div key={i} className="p-5 text-center">
                      <div className="font-heading text-2xl font-medium text-foreground"><CountUp to={s.v} /></div>
                      <div className="text-[11px] text-muted-foreground mt-1">{s.label}</div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 divide-x divide-border/40 border-b border-border/40">
                  {[{ label: "Visits", v: 289 }, { label: "Redemptions", v: 96 }, { label: "Trending nearby", v: 7 }].map((s, i) => (
                    <div key={i} className="p-3.5 text-center">
                      <div className="font-medium text-[13px] text-foreground"><CountUp to={s.v} /></div>
                      <div className="text-[11px] text-muted-foreground/60">{s.label}</div>
                    </div>
                  ))}
                </div>
                <div className="px-5 py-2.5 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#B38F4F]" />
                  <span className="text-[11px] text-muted-foreground/60">Updated 2 min ago</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* MAP */}
      <section id="venue-map" className={`${PARTNER_SPACING.subsectionVertical} px-5 border-t border-border/40`}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 items-end">
            <div>
              <span className="text-[11px] font-medium text-primary/70 uppercase tracking-[0.16em] block mb-3">Venue Map</span>
              <h2 className="font-heading text-2xl md:text-3xl font-medium leading-[1.2] tracking-normal">Where your venue fits in the neighborhood search.</h2>
            </div>
            <p className="text-muted-foreground text-[13px] leading-relaxed">Select any pin to see how it surfaces in context — category, distance, offer, and the moment that triggered it.</p>
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
                activeId={activeVenue}
                caption="Venue intelligence layer"
                insight="Venues, offers, walkable demand, and decision moments shown in context."
                kind="venue"
                onSelect={selectVenue}
                points={VENUES}
              />
            </div>
            <div className="rounded-xl border border-border/50 bg-card/60 overflow-hidden flex flex-col">
              {!venue ? (
                <>
                  <div className="p-5 border-b border-border/40">
                    <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.12em] mb-1">Decision moments happening now</div>
                  </div>
                  <div className="flex-1 divide-y divide-border/40 overflow-y-auto">
                    {DECISION_MOMENTS.map((m, i) => (
                      <div key={i} className="p-4">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Search className="w-3 h-3 text-primary/50 shrink-0" />
                          <span className="text-[11px] text-primary/70 font-medium italic">{m.query}</span>
                        </div>
                        <div className="text-[12px] font-medium text-foreground">{m.result}</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">{m.sub}</div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 border-t border-border/40">
                    <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.12em] mb-3">Venues</div>
                    <div className="space-y-2">
                      {VENUES.slice(0, 4).map(v => (
                        <button key={v.id} onClick={() => selectVenue(v)} className="w-full flex items-center gap-2.5 p-2.5 rounded-lg border border-border/40 hover:border-primary/30 transition-all text-left">
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ background: CAT_COLORS[v.cat] || "#081521" }} />
                          <span className="text-[12px] font-medium text-foreground flex-1 truncate">{v.name}</span>
                          <span className="text-[10px] text-muted-foreground">{v.views} views</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <motion.div key={venue.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full">
                  <div className="p-5 border-b border-border/40 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-foreground text-[13px]">{venue.name}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{venue.dist}</div>
                    </div>
                    <button onClick={() => setActiveVenue(null)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
                  </div>
                  <div className="flex-1 p-5 space-y-4 overflow-y-auto">
                    <div className="grid grid-cols-4 gap-2">
                      {[{ l: "Views", v: venue.views }, { l: "Saves", v: venue.saves }, { l: "Visits", v: venue.visits }, { l: "Redeem", v: venue.redemptions }].map((s, i) => (
                        <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/40 text-center">
                          <div className="font-heading text-lg font-medium text-foreground">{s.v}</div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">{s.l}</div>
                        </div>
                      ))}
                    </div>
                    <div>
                      <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.1em] mb-2">Live now</div>
                      <div className="space-y-1">
                        {venue.live.map((l, i) => (
                          <div key={i} className="flex items-center gap-2 text-[12px] text-muted-foreground">
                            <div className="w-1 h-1 rounded-full bg-[#B38F4F] shrink-0" />{l}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                      <div className="text-[11px] font-medium text-primary uppercase tracking-[0.1em] mb-1">Offer active</div>
                      <div className="text-[12px] text-foreground">{venue.offer}</div>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/40">
                      <div className="text-[12px] font-medium text-foreground">Trend</div>
                      <div className="text-[12px] font-medium text-primary">{venue.trend}</div>
                    </div>
                  </div>
                  <div className="p-4 border-t border-border/40 flex gap-2">
                    <button className="flex-1 py-2.5 rounded-full bg-primary text-primary-foreground text-[12px] font-medium hover:bg-primary/90 transition-all">Save</button>
                    <button className="flex-1 py-2.5 rounded-full border border-border/60 text-foreground/70 text-[12px] font-medium hover:text-foreground transition-all">Directions</button>
                    <button className="px-4 py-2.5 rounded-full border border-border/60 text-foreground/70 text-[12px] font-medium hover:text-foreground transition-all">Add offer</button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* IMPACT */}
      <ImpactSection headline="From nearby interest to foot traffic."
        stats={[{ label: "Venue views", v: 12440 }, { label: "Saves", v: 712 }, { label: "Visits", v: 289 }, { label: "Redemptions", v: 96 }, { label: "Offer opens", v: 341 }]}
        lower={[{ label: "Venues live", v: "24" }, { label: "Active offers", v: "10" }, { label: "Avg walk time", v: "6 min" }, { label: "Nearby searches", v: "402" }, { label: "Event-linked venues", v: "8" }, { label: "Repeat saves", v: "22%" }]} />

      {/* HOW IT WORKS */}
      <StepsSection label="How it works" headline="From map to door."
        steps={[
          { n: "1", label: "List your venue", detail: "Add your category, location, and basic details." },
          { n: "2", label: "Set your offer and timing", detail: "Tell people what is available and when." },
          { n: "3", label: "Appear at the right moment", detail: "Show up when someone nearby searches your category." },
          { n: "4", label: "They save or walk in", detail: "One tap. Directions if needed. Offer redeemed on arrival." },
          { n: "5", label: "Track what worked", detail: "Views, saves, visits, and redemptions broken down by offer." },
        ]}
        proof={["10 active offers", "289 visits", "96 redemptions", "402 nearby searches"]} />

      {/* DECISION MOMENTS */}
      <DecisionMomentsSection moments={DECISION_MOMENTS} />

      {/* VENUE CARDS */}
      <VenueCards venues={VENUES} selectVenue={selectVenue} />

      {/* FORM */}
      <PartnerForm headline="Add your venue"
        body="List your place, connect an offer, and start appearing when people nearby are looking for somewhere to go."
        formType={formType} setFormType={setFormType} formText={formText} setFormText={setFormText}
        prompts={PROMPTS} submitLabel="Add your venue" />

      {/* FAQ */}
      <FAQAccordionBlock
        sectionEyebrow="Venue FAQs"
        sectionTitle="Questions about venue visibility and conversion"
        sectionIntro="Venue partners use Downtown Perks to show up when people nearby are already deciding where to go."
        items={FAQ_VENUES}
        styleVariant="default"
        showNumbers={false}
        allowMultipleOpen={false}
        defaultOpenIndex={0}
        pageType="venues"
        backgroundVariant="light"
      />

      {/* CLOSING */}
      <ClosingCTA eyebrow="Venue partner layer" headline="Your best customers are already nearby."
        body="24 venues are live. Your offer goes up in minutes and can be updated anytime."
        proof="No setup cost. You only give what the offer is worth."
        ctaLabel="Add your venue" ctaHref="#partner-form"
        secondLabel="See the map" secondHref="#venue-map" />
    </div>
  );
}

function ImpactSection({ headline, stats, lower }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <section ref={ref} className={`${PARTNER_SPACING.subsectionVertical} px-5 border-t border-border/40`}>
      <div className="max-w-6xl mx-auto">
        <motion.h2 initial={{ opacity: 0, y: 10 }} animate={inView ? { opacity: 1, y: 0 } : {}} className="font-heading text-2xl md:text-3xl font-medium tracking-normal mb-8">{headline}</motion.h2>
        <div className={`${PARTNER_GRIDS.gridCardFiveCol} mb-4`}>
          {stats.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.06 }} className="p-5 rounded-lg border border-border/50 bg-card/40 text-center">
              <div className="font-heading text-2xl font-medium text-foreground"><CountUp to={s.v} /></div>
              <div className="text-[11px] text-muted-foreground mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>
        <div className={PARTNER_GRIDS.gridCardCompact}>
          {lower.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.3 + i * 0.05 }} className="p-4 rounded-lg border border-border/40 bg-card/20">
              <div className="font-heading text-lg font-medium text-foreground">{s.v}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StepsSection({ label, headline, steps, proof }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <section ref={ref} className={`${PARTNER_SPACING.subsectionVertical} px-5 border-t border-border/40`}>
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={inView ? { opacity: 1, y: 0 } : {}} className="mb-10">
          <span className="text-[11px] font-medium text-primary/70 uppercase tracking-[0.16em] block mb-3">{label}</span>
          <h2 className="font-heading text-2xl md:text-3xl font-medium tracking-normal">{headline}</h2>
        </motion.div>
        <div className="relative">
          <div className="hidden md:block absolute top-8 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {steps.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.1 }} className="flex flex-col items-center text-center md:items-start md:text-left">
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
            <motion.div key={i} initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.6 + i * 0.05 }} className="flex items-center gap-2 p-3 rounded-lg border border-border/40 bg-card/20">
              <div className="w-1 h-1 rounded-full bg-primary shrink-0" />
              <span className="text-[12px] text-muted-foreground">{item}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DecisionMomentsSection({ moments }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <section ref={ref} className={`${PARTNER_SPACING.subsectionVertical} px-5 border-t border-border/40`}>
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={inView ? { opacity: 1, y: 0 } : {}} className="mb-8">
          <span className="text-[11px] font-medium text-primary/70 uppercase tracking-[0.16em] block mb-3">How people find places</span>
          <h2 className="font-heading text-2xl md:text-3xl font-medium tracking-normal">The moment between "I want to go somewhere" and walking in the door.</h2>
        </motion.div>
        <div className={PARTNER_GRIDS.gridCardTwoCol}>
          {moments.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.08 }}
              className="p-5 rounded-xl border border-border/50 bg-card/40 hover:border-primary/20 transition-all">
              <div className="flex items-center gap-2 mb-3">
                <Search className="w-3.5 h-3.5 text-primary/50 shrink-0" />
                <span className="text-[12px] text-primary/80 font-medium italic">{m.query}</span>
              </div>
              <div className="font-heading font-medium text-[14px] text-foreground mb-1">→ {m.result}</div>
              <div className="text-[12px] text-muted-foreground">{m.sub}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function VenueCards({ venues, selectVenue }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <section ref={ref} className={`${PARTNER_SPACING.subsectionVertical} px-5 border-t border-border/40`}>
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={inView ? { opacity: 1, y: 0 } : {}} className="mb-8">
          <span className="text-[11px] font-medium text-primary/70 uppercase tracking-[0.16em] block mb-3">Live venues</span>
          <h2 className="font-heading text-2xl md:text-3xl font-medium tracking-normal">Activity across live venues.</h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {venues.slice(0, 3).map((v, i) => (
            <motion.div key={v.id} initial={{ opacity: 0, y: 10 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.08 }}
              onClick={() => selectVenue(v)} className="p-5 rounded-xl border border-border/50 bg-card/40 hover:border-primary/30 cursor-pointer transition-all">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: CAT_COLORS[v.cat] || "#081521" }} />
                <span className="font-heading font-medium text-[13px] text-foreground">{v.name}</span>
              </div>
              <div className="h-1.5 rounded-full bg-border/50 mb-4 overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={inView ? { width: `${Math.min(100, (v.views / 130) * 100)}%` } : {}} transition={{ duration: 1, delay: 0.3 + i * 0.1 }} className="h-full rounded-full bg-primary" />
              </div>
              <div className="space-y-2 text-[12px]">
                {[["Views", v.views], ["Saves", v.saves], ["Visits", v.visits], ["Redemptions", v.redemptions]].map(([l, val]) => (
                  <div key={l} className="flex justify-between text-muted-foreground"><span>{l}</span><span className="text-foreground font-medium">{val}</span></div>
                ))}
                <div className="flex justify-between text-muted-foreground"><span>Trend</span><span className="text-primary font-medium">{v.trend}</span></div>
              </div>
              <div className="mt-3 pt-3 border-t border-border/40">
                <div className="text-[10px] text-muted-foreground/60 uppercase tracking-[0.1em] mb-1">Top trigger</div>
                <div className="text-[12px] text-foreground">{v.trigger}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PartnerForm({ headline, body, formType, setFormType, formText, setFormText, prompts, submitLabel }) {
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
              <button key={t} onClick={() => setFormType(t)} className={`px-5 py-4 text-[12px] font-medium whitespace-nowrap border-r border-border/40 last:border-r-0 transition-all ${formType === t ? "text-primary bg-primary/5" : "text-muted-foreground hover:text-foreground"}`}>{t}</button>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-8 md:border-r border-border/40 space-y-4">
              {[["Venue Name", "text"], ["Your Name & Role", "text"], ["Email", "email"], ["Phone", "tel"]].map(([label, type]) => (
                <div key={label}>
                  <label className="block text-[11px] font-medium text-muted-foreground uppercase tracking-[0.1em] mb-1.5">{label}</label>
                  <input type={type} className="w-full bg-muted/30 border border-border/50 rounded-lg px-4 py-2.5 text-[13px] text-foreground outline-none focus:border-primary/40 transition-colors" />
                </div>
              ))}
              <div>
                <label className="block text-[11px] font-medium text-muted-foreground uppercase tracking-[0.1em] mb-1.5">What are you looking to do</label>
                <textarea rows={4} value={formText} onChange={e => setFormText(e.target.value)} placeholder="Tell us about your venue and what you want to offer."
                  className="w-full bg-muted/30 border border-border/50 rounded-lg px-4 py-2.5 text-[13px] text-foreground outline-none focus:border-primary/40 transition-colors resize-none placeholder-muted-foreground/30" />
              </div>
              <button className="w-full py-2.5 rounded-full bg-primary text-primary-foreground font-medium text-[13px] hover:bg-primary/90 transition-all">{submitLabel}</button>
            </div>
            <div className="p-8 bg-muted/10 flex flex-col">
              <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.12em] mb-4">Prompts</div>
              <div className="space-y-2 flex-1">
                {prompts.map(p => (<button key={p} onClick={() => setFormText(p)} className="w-full text-left px-4 py-2.5 rounded-lg border border-border/40 hover:border-primary/30 text-[13px] text-muted-foreground hover:text-foreground transition-all">{p}</button>))}
              </div>
              <div className="mt-6 pt-6 border-t border-border/40">
                <p className="text-[12px] text-muted-foreground/60 italic">Questions? <a href="mailto:partners@downtownperks.com" className="text-primary hover:underline underline-offset-4">partners@downtownperks.com</a></p>
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
              <a href={ctaHref} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-medium text-[13px] hover:bg-primary/90 transition-all">{ctaLabel} <ArrowRight className="w-4 h-4" /></a>
              <a href={secondHref} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border/70 text-foreground/70 font-medium text-[13px] hover:text-foreground transition-all">{secondLabel}</a>
            </div>
            <p className="text-[12px] text-muted-foreground/50 italic">{proof}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
