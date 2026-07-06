import { useState, useRef, useEffect } from "react";
import { motion, useInView, animate } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, X, Hotel, QrCode } from "lucide-react";
import PartnerMapIntelligenceLayer from "@/components/partner/PartnerMapIntelligenceLayer";
import { PARTNER_SPACING } from '@/lib/partner-system';
import FAQAccordionBlock from '@/components/ui/FAQAccordionBlock';
import { FAQ_HOSPITALITY } from '@/lib/faq-partner-data';

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

const HOTELS = [
  { id: "vanzandt", name: "Hotel Van Zandt", lat: 30.2580, lng: -97.7370, interactions: 214, saves: 44, unlocks: 18, rsvps: 17, trend: "+16% this week", top: "Rainey Live Music Crawl", access: ["QR live in lobby", "Text-to-open enabled", "Concierge handoff ready"], nearby: ["Rainey Live Music Crawl", "Waterfront Sunset Series", "Two late-night food spots", "Live wellness event"] },
  { id: "fairmont", name: "Fairmont Austin", lat: 30.2665, lng: -97.7400, interactions: 198, saves: 39, unlocks: 16, rsvps: 14, trend: "+10% this week", top: "Waterfront Sunset Series", access: ["QR live in lobby", "Text-to-open enabled"], nearby: ["Waterfront Sunset Series", "Congress dining nearby", "Public Art Walk"] },
  { id: "jwmarriott", name: "JW Marriott", lat: 30.2655, lng: -97.7435, interactions: 184, saves: 34, unlocks: 14, rsvps: 11, trend: "+8% this week", top: "Congress Dining", access: ["QR live in lobby"], nearby: ["Congress dining nearby", "Public Art Walk", "Happy Hour at Half Step"] },
  { id: "theline", name: "The Line", lat: 30.2640, lng: -97.7350, interactions: 172, saves: 31, unlocks: 12, rsvps: 9, trend: "+7% this week", top: "Rainey Night Pulse", access: ["QR live in lobby", "Text-to-open enabled"], nearby: ["Rainey Night Pulse", "Live music tonight"] },
  { id: "proper", name: "Austin Proper", lat: 30.2680, lng: -97.7415, interactions: 167, saves: 31, unlocks: 13, rsvps: 8, trend: "+9% this week", top: "Rooftop Dinner Nearby", access: ["QR live in lobby"], nearby: ["Rooftop dinner nearby", "Wellness Walk Club"] },
  { id: "thompson", name: "Thompson Austin", lat: 30.2620, lng: -97.7390, interactions: 148, saves: 26, unlocks: 11, rsvps: 7, trend: "+6% this week", top: "Live Music Nearby", access: ["Text-to-open enabled"], nearby: ["Live music nearby", "Dinner near Rainey"] },
];

const NEARBY = [
  { name: "Rainey Live Music Crawl", lat: 30.2582, lng: -97.7372 },
  { name: "Waterfront Sunset Series", lat: 30.2720, lng: -97.7390 },
  { name: "Coffee near Congress", lat: 30.2670, lng: -97.7440 },
  { name: "Public Art Walk", lat: 30.2670, lng: -97.7440 },
];

const MAP_FILTERS = [
  { id: "all", label: "Hotels", count: 9 },
  { id: "events", label: "Events nearby", count: 8 },
  { id: "favorites", label: "Guest favorites", count: 6 },
  { id: "walkable", label: "Walkable now", count: 10 },
  { id: "perks", label: "Perks live", count: 7 },
  { id: "saved", label: "Saved by guests", count: 5 },
];

const HOTEL_FILTER_COPY = {
  all: {
    label: "Hotel portfolio",
    title: "See what each property gives guests access to nearby.",
    body: "The guest layer connects hotel locations to dining, events, perks, QR entry points, and nearby recommendations.",
    result: "Logged-in view: hotel profile, QR status, guest activity, reporting access, and billing context.",
  },
  events: {
    label: "Events nearby",
    title: "Give guests something useful to do tonight.",
    body: "Events become a concierge layer when they are paired with distance, timing, category, and the guest’s current location.",
    result: "Logged-in view: event opens, saves, RSVPs, directions, and hotel-attributed activity.",
  },
  favorites: {
    label: "Guest favorites",
    title: "Understand what guests keep choosing.",
    body: "Favorites help hotel teams identify the restaurants, bars, coffee stops, and experiences guests return to most often.",
    result: "Logged-in view: saved places, repeat opens, partner ranking, and guest preference trends.",
  },
  walkable: {
    label: "Walkable now",
    title: "Show the best nearby options without another app.",
    body: "Walkable context helps guests move from lobby, elevator, or room QR into a local plan they can actually use.",
    result: "Logged-in view: distance-based recommendations, directions clicks, and route use.",
  },
  perks: {
    label: "Perks live",
    title: "Make local access feel like part of the stay.",
    body: "Perks connect a hotel’s guest experience to nearby partners without adding work for the front desk.",
    result: "Logged-in view: active perks, unlocks, redemptions, partner attribution, and QR performance.",
  },
  saved: {
    label: "Saved by guests",
    title: "See what guests save before they leave the property.",
    body: "Saved items show what guests are considering, what they return to, and which local categories matter most.",
    result: "Logged-in view: saved entities, source QR, stay-stage context, and follow-up opportunities.",
  },
};

const LIVE_FEED = [
  { text: "Guest opened dinner near Rainey", hotel: "Hotel Van Zandt", time: "Just now" },
  { text: "Guest saved sunset event nearby", hotel: "Fairmont Austin", time: "3 min ago" },
  { text: "Guest unlocked welcome drink perk", hotel: "Austin Proper", time: "Trending" },
  { text: "Guest opened coffee near Congress", hotel: "Thompson Austin", time: "Nearby" },
];

const GUEST_FLOW = [
  { step: "Scan QR", desc: "In lobby, elevator, or room" },
  { step: "Open map", desc: "Downtown Perks loads instantly" },
  { step: "Save something nearby", desc: "Event, place, or perk" },
  { step: "Walk there", desc: "Live directions and distance" },
  { step: "Unlock a local perk", desc: "Tap to redeem at the venue" },
];

const PROMPTS = [
  "We want a simple neighborhood guide guests can open from the lobby.",
  "Help us set up QR access.",
  "We want guests to find dining and events nearby without asking staff.",
  "Show us how offers work for guests.",
];

export default function HotelsPartner() {
  const [mapFilter, setMapFilter] = useState("all");
  const [activeHotel, setActiveHotel] = useState(null);
  const [formType, setFormType] = useState("Hotel");
  const [formText, setFormText] = useState("");

  const hotel = activeHotel ? HOTELS.find(h => h.id === activeHotel) : null;
  const activeFilterCopy = HOTEL_FILTER_COPY[mapFilter] || HOTEL_FILTER_COPY.all;

  function selectHotel(h) { setActiveHotel(h.id); }

  return (
    <div className="dp-partner-page min-h-screen bg-white text-[#0B1F33]">
      {/* HERO */}
      <section className={`${PARTNER_SPACING.heroVertical} px-5 relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(11,31,51,0.18) 1px,transparent 1px),linear-gradient(90deg,rgba(11,31,51,0.18) 1px,transparent 1px)", backgroundSize: "56px 56px" }} />
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Link to="/partners" className="dp-partner-back-button mb-8 inline-flex items-center justify-center text-muted-foreground hover:text-primary transition-colors group" aria-label="Back to partners" title="Back to partners">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" aria-hidden="true" />
            </Link>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-14 items-start">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}>
              <span className="text-[11px] font-medium text-primary/70 uppercase tracking-[0.16em] block mb-4">Hotel Partner Layer</span>
              <h1 className="font-heading text-4xl md:text-4xl lg:text-4xl font-medium leading-[1.05] tracking-normal mb-5">
                Help guests find what to do <em className="text-primary">from the moment they arrive.</em>
              </h1>
              <p className="text-muted-foreground text-[14px] leading-relaxed mb-8 max-w-lg">One QR code gives guests access to nearby dining, events, and local offers — without asking your front desk to handle it.</p>
              <div className="flex flex-wrap gap-3">
                <a href="#partner-form" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[12px] bg-primary text-primary-foreground font-medium text-[13px] hover:bg-primary/90 transition-all ">
                  Connect your hotel <ArrowRight className="w-4 h-4" />
                </a>
                <a href="#hotel-map" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[12px] border border-border/70 text-foreground/70 font-medium text-[13px] hover:text-foreground transition-all">
                  See the guest layer
                </a>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}>
              <div className="rounded-xl border border-border/60 bg-card/60 overflow-hidden">
                <div className="grid grid-cols-3 divide-x divide-border/40 border-b border-border/40">
                  {[{ label: "Hotels active", v: 9 }, { label: "Guest interactions", v: 2104 }, { label: "Saves", v: 612 }].map((s, i) => (
                    <div key={i} className="p-5 text-center">
                      <div className="font-heading text-2xl font-medium text-foreground"><CountUp to={s.v} /></div>
                      <div className="text-[11px] text-muted-foreground mt-1">{s.label}</div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 divide-x divide-border/40 border-b border-border/40">
                  {[{ label: "RSVPs", v: 184 }, { label: "Perk unlocks", v: 93 }, { label: "Hubs trending", v: 4 }].map((s, i) => (
                    <div key={i} className="p-3.5 text-center">
                      <div className="font-medium text-[13px] text-foreground"><CountUp to={s.v} /></div>
                      <div className="text-[11px] text-muted-foreground/60">{s.label}</div>
                    </div>
                  ))}
                </div>
                <div className="px-5 py-2.5 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-[12px] bg-[#C8A96A]" />
                  <span className="text-[11px] text-muted-foreground/60">Updated 2 min ago</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* MAP */}
      <section id="hotel-map" className={`${PARTNER_SPACING.subsectionVertical} px-5 border-t border-border/40`}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 items-end">
            <div>
              <span className="text-[11px] font-medium text-primary/70 uppercase tracking-[0.16em] block mb-3">Hotel Map</span>
              <h2 className="font-heading text-2xl md:text-3xl font-medium leading-[1.2] tracking-normal">What guests can reach from each location.</h2>
            </div>
            <p className="text-muted-foreground text-[13px] leading-relaxed">Select a hotel to see the nearby events, places, and offers your guests can access during their stay.</p>
          </div>
          <div className="flex gap-2 mb-4 overflow-x-auto pb-0.5">
            {MAP_FILTERS.map(f => (
              <button key={f.id} onClick={() => setMapFilter(f.id)}
                className={`px-3.5 py-2 rounded-[12px] text-[12px] font-medium whitespace-nowrap border transition-all flex-shrink-0 ${mapFilter === f.id ? "border-primary/50 bg-primary/10 text-primary" : "border-border/40 text-muted-foreground hover:text-foreground"}`}>
                {f.label} <span className={`ml-1.5 text-[10px] ${mapFilter === f.id ? "text-primary/70" : "text-muted-foreground/50"}`}>{f.count}</span>
              </button>
            ))}
          </div>
          <FilterInsight copy={activeFilterCopy} />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 overflow-hidden" style={{ height: 480 }}>
              <PartnerMapIntelligenceLayer
                activeId={activeHotel}
                caption="Guest intelligence layer"
                insight="Hotels, lobby scans, guest saves, and nearby things to do in one live view."
                kind="hotel"
                nearby={NEARBY}
                onSelect={selectHotel}
                points={HOTELS}
              />
            </div>
            <div className="rounded-xl border border-border/50 bg-card/60 overflow-hidden flex flex-col">
              {!hotel ? (
                <>
                  <div className="p-5 border-b border-border/40">
                    <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.12em] mb-1">Guest flow in action</div>
                  </div>
                  <div className="flex-1 divide-y divide-border/40 overflow-y-auto">
                    {LIVE_FEED.map((item, i) => (
                      <div key={i} className="p-4 flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-[12px] bg-primary/60 mt-1.5 shrink-0" />
                        <div className="flex-1">
                          <div className="text-[12px] text-foreground">{item.text}</div>
                          <div className="text-[11px] text-muted-foreground mt-0.5">{item.hotel}</div>
                        </div>
                        <span className="text-[10px] text-muted-foreground shrink-0 whitespace-nowrap">{item.time}</span>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 border-t border-border/40">
                    <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.12em] mb-3">Hotels</div>
                    <div className="space-y-2">
                      {HOTELS.slice(0, 4).map(h => (
                        <button key={h.id} onClick={() => selectHotel(h)} className="w-full flex items-center gap-2.5 p-2.5 rounded-lg border border-border/40 hover:border-primary/30 transition-all text-left">
                          <Hotel className="w-3.5 h-3.5 text-primary/60 shrink-0" />
                          <span className="text-[12px] font-medium text-foreground flex-1 truncate">{h.name}</span>
                          <span className="text-[10px] text-muted-foreground">{h.interactions}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <motion.div key={hotel.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full">
                  <div className="p-5 border-b border-border/40 flex items-center justify-between">
                    <div className="font-medium text-foreground text-[13px]">{hotel.name}</div>
                    <button onClick={() => setActiveHotel(null)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
                  </div>
                  <div className="flex-1 p-5 space-y-4 overflow-y-auto">
                    <div className="grid grid-cols-4 gap-2">
                      {[{ l: "Taps", v: hotel.interactions }, { l: "Saves", v: hotel.saves }, { l: "RSVPs", v: hotel.rsvps }, { l: "Unlocks", v: hotel.unlocks }].map((s, i) => (
                        <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/40 text-center">
                          <div className="font-heading text-lg font-medium text-foreground">{s.v}</div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">{s.l}</div>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
                      <div className="text-[12px] font-medium text-foreground">Trend</div>
                      <div className="text-[12px] font-medium text-primary">{hotel.trend}</div>
                    </div>
                    <div>
                      <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.1em] mb-2">Guest activity nearby</div>
                      <div className="space-y-1.5">
                        {hotel.nearby.map((n, i) => (
                          <div key={i} className="flex items-center gap-2 text-[12px] text-muted-foreground">
                            <div className="w-1 h-1 rounded-[12px] bg-primary/40 shrink-0" />{n}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.1em] mb-2">Access</div>
                      <div className="space-y-1">
                        {hotel.access.map((a, i) => (
                          <div key={i} className="flex items-center gap-2 text-[12px] text-foreground/70">
                            <QrCode className="w-3 h-3 text-primary/40 shrink-0" />{a}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border-t border-border/40 flex gap-2">
                    <button className="flex-1 py-2.5 rounded-[12px] bg-primary text-primary-foreground text-[12px] font-medium hover:bg-primary/90 transition-all">View guest activity</button>
                    <button className="flex-1 py-2.5 rounded-[12px] border border-border/60 text-foreground/70 text-[12px] font-medium hover:text-foreground transition-all">Connect</button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <StepsSection label="How it works" headline="From check-in to neighborhood use in one step."
        steps={[
          { n: "1", label: "Register the hotel", detail: "Set up the property and configure guest access." },
          { n: "2", label: "Add the QR touchpoint", detail: "Guests open the map from the lobby, elevator, or room — no app required." },
          { n: "3", label: "Nearby context is ready", detail: "Dining, events, and offers surface automatically based on proximity." },
          { n: "4", label: "Guests decide and go", detail: "One tap to save, directions when needed, offer redeemed on arrival." },
          { n: "5", label: "See what got used", detail: "Track which nearby places and events drove the most guest activity." },
        ]}
        proof={["18 QR access points", "16 nearby venues linked", "184 RSVPs", "93 offer unlocks"]} />

      {/* GUEST FLOW VISUAL */}
      <GuestFlowSection steps={GUEST_FLOW} feed={LIVE_FEED} />

      {/* HOTEL CARDS */}
      <HotelCards hotels={HOTELS} selectHotel={selectHotel} />

      {/* FORM */}
      <PartnerForm headline="Tell us about your hotel"
        body="Share a few details and we will help you set up guest access and connect nearby context."
        formType={formType} setFormType={setFormType} formText={formText} setFormText={setFormText}
        prompts={PROMPTS} submitLabel="Connect your hotel" />

      {/* FAQ */}
      <FAQAccordionBlock
        sectionEyebrow="Hospitality FAQs"
        sectionTitle="Questions about hospitality use"
        sectionIntro="Hospitality is about giving guests a better way into downtown through the same shared map system."
        items={FAQ_HOSPITALITY}
        styleVariant="default"
        showNumbers={false}
        allowMultipleOpen={false}
        defaultOpenIndex={0}
        pageType="hospitality"
        backgroundVariant="light"
      />

      {/* CLOSING */}
      <ClosingCTA eyebrow="Hotel partner layer" headline="Your guests already want to explore. Make it simple."
        body="Nine hotels are live. Setup takes less than a day and works from the first QR scan."
        proof="Questions? Reach the team at partners@downtownperks.com"
        ctaLabel="Connect your hotel" ctaHref="#partner-form"
        secondLabel="See the map" secondHref="#hotel-map" />
    </div>
  );
}

function FilterInsight({ copy }) {
  return (
    <div className="dp-partner-filter-insight" aria-live="polite">
      <div>
        <span>{copy.label}</span>
        <h3>{copy.title}</h3>
        <p>{copy.body}</p>
      </div>
      <p>{copy.result}</p>
    </div>
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
        <div className="grid grid-cols-1 gap-5 md:grid-cols-5 md:gap-6">
            {steps.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.1 }} className="grid grid-cols-[30px_1fr] gap-3 md:block">
                <div className="font-heading text-[16px] font-bold leading-none text-[#B38F4F] md:text-[20px]">{s.n}</div>
                <div>
                  <div className="text-[13px] font-semibold leading-snug text-[#0B1F33]">{s.label}</div>
                  <div className="mt-1.5 text-[12px] leading-5 text-[#425466]">{s.detail}</div>
                </div>
              </motion.div>
            ))}
        </div>
        {proof?.length > 0 && (
          <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2">
            {proof.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.6 + i * 0.05 }} className="flex items-center gap-2 py-2">
                <div className="h-px w-4 shrink-0 bg-[#B38F4F]" />
                <span className="text-[12px] leading-5 text-[#425466]">{item}</span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function GuestFlowSection({ steps, feed }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <section ref={ref} className={`${PARTNER_SPACING.subsectionVertical} px-5 border-t border-border/40`}>
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={inView ? { opacity: 1, y: 0 } : {}} className="mb-8">
          <span className="text-[11px] font-medium text-primary/70 uppercase tracking-[0.16em] block mb-3">Guest experience</span>
          <h2 className="font-heading text-2xl md:text-3xl font-medium tracking-normal">What a guest does from scan to visit.</h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {steps.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ delay: i * 0.08 }}
                className="grid grid-cols-[30px_1fr] gap-3">
                <span className="font-heading text-[16px] font-bold leading-none text-[#B38F4F]">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <div className="text-[13px] font-semibold leading-snug text-[#0B1F33]">{s.step}</div>
                  <div className="mt-1 text-[12px] leading-5 text-[#425466]">{s.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="rounded-xl border border-border/50 bg-card/40 overflow-hidden">
            <div className="p-5 border-b border-border/40">
              <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.12em]">Live guest activity</div>
            </div>
            <div className="divide-y divide-border/40">
              {feed.map((item, i) => (
                <div key={i} className="p-4 flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-[12px] bg-[#C8A96A] mt-1.5 shrink-0 animate-pulse" />
                  <div className="flex-1">
                    <div className="text-[12px] text-foreground">{item.text}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{item.hotel}</div>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HotelCards({ hotels, selectHotel }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <section ref={ref} className={`${PARTNER_SPACING.subsectionVertical} px-5 border-t border-border/40`}>
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={inView ? { opacity: 1, y: 0 } : {}} className="mb-8">
          <span className="text-[11px] font-medium text-primary/70 uppercase tracking-[0.16em] block mb-3">Live hotels</span>
          <h2 className="font-heading text-2xl md:text-3xl font-medium tracking-normal">Activity across live hotels.</h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {hotels.slice(0, 3).map((h, i) => (
            <motion.div key={h.id} initial={{ opacity: 0, y: 10 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.08 }}
              onClick={() => selectHotel(h)} className="p-5 rounded-xl border border-border/50 bg-card/40 hover:border-primary/30 cursor-pointer transition-all">
              <div className="flex items-center gap-2 mb-4">
                <Hotel className="w-4 h-4 text-primary/60" />
                <span className="font-heading font-medium text-[13px] text-foreground">{h.name}</span>
              </div>
              <div className="h-1.5 rounded-[12px] bg-border/50 mb-4 overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={inView ? { width: `${Math.min(100, (h.interactions / 230) * 100)}%` } : {}} transition={{ duration: 1, delay: 0.3 + i * 0.1 }} className="h-full rounded-[12px] bg-primary" />
              </div>
              <div className="space-y-2 text-[12px]">
                {[["Guest interactions", h.interactions], ["Saves", h.saves], ["Unlocks", h.unlocks]].map(([l, v]) => (
                  <div key={l} className="flex justify-between text-muted-foreground"><span>{l}</span><span className="text-foreground font-medium">{v}</span></div>
                ))}
                <div className="flex justify-between text-muted-foreground"><span>Trend</span><span className="text-primary font-medium">{h.trend}</span></div>
              </div>
              <div className="mt-3 pt-3 border-t border-border/40">
                <div className="text-[10px] text-muted-foreground/60 uppercase tracking-[0.1em] mb-1">Top nearby</div>
                <div className="text-[12px] text-foreground truncate">{h.top}</div>
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
        <div className="border border-border/50 overflow-hidden">
          <div className="flex border-b border-border/40 overflow-x-auto">
            {TYPES.map(t => (
              <button key={t} onClick={() => setFormType(t)} className={`px-5 py-4 text-[12px] font-medium whitespace-nowrap border-r border-border/40 last:border-r-0 transition-all ${formType === t ? "text-primary bg-primary/5" : "text-muted-foreground hover:text-foreground"}`}>{t}</button>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-8 md:border-r border-border/40 space-y-4">
              {[["Hotel Name", "text"], ["Your Name & Role", "text"], ["Email", "email"], ["Phone", "tel"]].map(([label, type]) => (
                <div key={label}>
                  <label className="block text-[11px] font-medium text-[#0B1F33] uppercase tracking-[0.1em] mb-1.5">{label}</label>
                  <input type={type} className="w-full bg-muted/30 border border-border/50 px-4 py-2.5 text-[13px] text-foreground outline-none focus:border-primary/40 transition-colors" />
                </div>
              ))}
              <div>
                <label className="block text-[11px] font-medium text-[#0B1F33] uppercase tracking-[0.1em] mb-1.5">What are you looking to set up</label>
                <textarea rows={4} value={formText} onChange={e => setFormText(e.target.value)} placeholder="Tell us about your hotel and what you want to offer guests."
                  className="w-full bg-muted/30 border border-border/50 px-4 py-2.5 text-[13px] text-foreground outline-none focus:border-primary/40 transition-colors resize-none placeholder-muted-foreground/30" />
                <div className="dp-partner-prompt-inline" aria-label="Suggested prompts">
                  {prompts.map(p => (
                    <button key={p} type="button" onClick={() => setFormText(p)}>{p}</button>
                  ))}
                </div>
              </div>
              <button className="w-full py-2.5 bg-primary text-primary-foreground font-medium text-[13px] hover:bg-primary/90 transition-all">{submitLabel}</button>
            </div>
            <div className="p-8 bg-muted/10 flex flex-col">
              <p className="text-[13px] leading-6 text-[#0B1F33]/68">Share the guest need, lobby entry point, and nearby experiences you want to connect.</p>
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
              <a href={ctaHref} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[12px] bg-primary text-primary-foreground font-medium text-[13px] hover:bg-primary/90 transition-all">{ctaLabel} <ArrowRight className="w-4 h-4" /></a>
              <a href={secondHref} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[12px] border border-border/70 text-foreground/70 font-medium text-[13px] hover:text-foreground transition-all">{secondLabel}</a>
            </div>
            <p className="text-[12px] text-muted-foreground/50 italic">{proof}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
