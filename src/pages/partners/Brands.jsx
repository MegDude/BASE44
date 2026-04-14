import { useState, useRef, useEffect } from "react";
import { motion, useInView, animate } from "framer-motion";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { ArrowLeft, ArrowRight, X, QrCode, MapPin, Zap, Star, TrendingUp } from "lucide-react";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function campaignIcon(active) {
  return L.divIcon({
    className: "",
    html: `<div style="width:11px;height:11px;border-radius:2px;background:${active ? "#C8973A" : "#8B78C8"};border:2px solid rgba(255,255,255,0.85);box-shadow:0 0 8px ${active ? "#C8973A80" : "#8B78C850"};transform:rotate(45deg)"></div>`,
    iconSize: [11, 11], iconAnchor: [5.5, 5.5],
  });
}

function touchpointIcon() {
  return L.divIcon({ className: "", html: `<div style="width:8px;height:8px;border-radius:50%;background:#7B9EC8;border:1.5px solid rgba(255,255,255,0.7);box-shadow:0 0 5px #7B9EC860"></div>`, iconSize: [8, 8], iconAnchor: [4, 4] });
}

function MapFly({ center }) {
  const map = useMap();
  useEffect(() => { if (center) map.flyTo(center, 14, { duration: 1.1 }); }, [center]);
  return null;
}

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

const CAMPAIGNS = [
  {
    id: "fineeyewear", name: "Fine Eyewear × Downtown Perks", type: "Place-based retail activation",
    districts: "Congress · Seaholm · Rainey edge",
    flow: "Lobby QR → resident opens map → sees brand placement → visits store → unlocks offer",
    scans: 412, visits: 188, redemptions: 74, saves: 96, trend: "+21% this week", best: "The Quincy",
    lat: 30.2660, lng: -97.7431,
    touchpoints: ["The Quincy lobby QR", "Hotel Van Zandt guest layer", "Congress district event tie-in", "Resident card unlock"],
  },
  {
    id: "hotelwelcome", name: "Hotel Welcome Campaign", type: "Guest discovery activation",
    districts: "Congress · Rainey",
    flow: "Guest checks in → QR in room → opens map → finds nearby offer → redeems",
    scans: 304, visits: 112, redemptions: 51, saves: 68, trend: "+14% this week", best: "Hotel Van Zandt",
    lat: 30.2580, lng: -97.7370,
    touchpoints: ["Hotel Van Zandt lobby QR", "Austin Proper concierge", "Fairmont guest layer"],
  },
  {
    id: "downtownweekend", name: "Downtown Weekend Activation", type: "District-wide campaign",
    districts: "Congress · Waterloo · Rainey",
    flow: "Event listing → resident taps → map view → venue visit → offer redemption",
    scans: 488, visits: 156, redemptions: 63, saves: 103, trend: "+17% this week", best: "Congress District",
    lat: 30.2665, lng: -97.7410,
    touchpoints: ["Congress district pins", "Waterloo park activation", "Rainey street venues", "Walkable map prompt nearby"],
  },
];

const TOUCHPOINTS = [
  { name: "The Quincy lobby QR", lat: 30.2680, lng: -97.7460 },
  { name: "Hotel Van Zandt", lat: 30.2580, lng: -97.7370 },
  { name: "Fine Eyewear store", lat: 30.2660, lng: -97.7431 },
  { name: "Waterloo park", lat: 30.2720, lng: -97.7390 },
  { name: "Congress event tie-in", lat: 30.2655, lng: -97.7425 },
];

const MAP_FILTERS = [
  { id: "all", label: "Campaigns", count: 3 },
  { id: "buildings", label: "Buildings", count: 4 },
  { id: "venues", label: "Venues", count: 6 },
  { id: "districts", label: "Districts", count: 3 },
  { id: "qr", label: "QR touchpoints", count: 7 },
  { id: "redemptions", label: "Redemptions", count: 5 },
];

const LIVE_FEED = [
  { text: "Resident scanned at The Quincy", campaign: "Fine Eyewear × Downtown Perks", time: "Just now" },
  { text: "Guest opened campaign from Hotel Van Zandt", campaign: "Hotel Welcome Campaign", time: "4 min ago" },
  { text: "Visit recorded near Congress", campaign: "Downtown Weekend Activation", time: "Trending" },
  { text: "Redemption completed in store", campaign: "Fine Eyewear × Downtown Perks", time: "8 min ago" },
];

const FLOW_STEPS = [
  { label: "Building QR", desc: "Resident or guest scans in lobby" },
  { label: "Resident opens map", desc: "Downtown Perks loads — campaign visible" },
  { label: "Map interaction", desc: "They save, tap, or explore nearby" },
  { label: "Visit", desc: "They walk to the brand placement" },
  { label: "Redemption", desc: "Offer unlocked at point of visit" },
];

const PROMPTS = [
  "We want a campaign that lives across real downtown places.",
  "Help us set up QR-to-map flow.",
  "Show us how a brand campaign connects to buildings and venues.",
  "We want measurable visits and redemptions.",
];

export default function BrandsPartner() {
  const [mapFilter, setMapFilter] = useState("all");
  const [activeCampaign, setActiveCampaign] = useState(null);
  const [mapCenter, setMapCenter] = useState([30.2640, -97.7410]);
  const [formType, setFormType] = useState("Brand");
  const [formText, setFormText] = useState("");

  const campaign = activeCampaign ? CAMPAIGNS.find(c => c.id === activeCampaign) : null;

  function selectCampaign(c) { setActiveCampaign(c.id); setMapCenter([c.lat, c.lng]); }

  return (
    <div className="min-h-screen bg-background">
      {/* HERO */}
      <section className="pt-36 pb-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "linear-gradient(hsl(222 18% 40%) 1px,transparent 1px),linear-gradient(90deg,hsl(222 18% 40%) 1px,transparent 1px)", backgroundSize: "56px 56px" }} />
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Link to="/brands" className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-primary transition-colors mb-8 group">
              <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" /> Partner Directory
            </Link>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-14 items-start">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}>
              <span className="text-[11px] font-medium text-primary/70 uppercase tracking-[0.16em] block mb-4">Brand Partner Layer</span>
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-medium leading-[1.05] tracking-tight mb-5">
                Run campaigns that <em className="text-primary">live in the city, not beside it.</em>
              </h1>
              <p className="text-muted-foreground text-base leading-relaxed mb-8 max-w-lg">Your brand shows up through real downtown places, resident access points, venues, events, and walkable decision moments.</p>
              <div className="flex flex-wrap gap-3">
                <a href="#partner-form" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-all shadow-md shadow-primary/15">
                  Launch a campaign <ArrowRight className="w-4 h-4" />
                </a>
                <a href="#campaign-map" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-border/70 text-foreground/70 font-medium text-sm hover:text-foreground transition-all">
                  See campaign flow
                </a>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}>
              <div className="rounded-xl border border-border/60 bg-card/60 overflow-hidden">
                <div className="grid grid-cols-3 divide-x divide-border/40 border-b border-border/40">
                  {[{ label: "Campaigns live", v: 3 }, { label: "Scans", v: 1204 }, { label: "Visits", v: 412 }].map((s, i) => (
                    <div key={i} className="p-5 text-center">
                      <div className="font-heading text-2xl font-medium text-foreground"><CountUp to={s.v} /></div>
                      <div className="text-[11px] text-muted-foreground mt-1">{s.label}</div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 divide-x divide-border/40 border-b border-border/40">
                  {[{ label: "Redemptions", v: 188 }, { label: "Live placements", v: 7 }, { label: "Districts activated", v: 3 }].map((s, i) => (
                    <div key={i} className="p-3.5 text-center">
                      <div className="font-medium text-sm text-foreground"><CountUp to={s.v} /></div>
                      <div className="text-[11px] text-muted-foreground/60">{s.label}</div>
                    </div>
                  ))}
                </div>
                <div className="px-5 py-3 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[11px] text-muted-foreground/60">Updated 2 min ago</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* MAP */}
      <section id="campaign-map" className="py-12 px-6 border-t border-border/40">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 items-end">
            <div>
              <span className="text-[11px] font-medium text-primary/70 uppercase tracking-[0.16em] block mb-3">Campaign Map</span>
              <h2 className="font-heading text-2xl md:text-3xl font-medium leading-[1.2] tracking-tight">See how a brand shows up across buildings, venues, and downtown movement.</h2>
            </div>
            <p className="text-muted-foreground text-[13px] leading-relaxed">Every campaign touchpoint is a real place — a lobby QR, a map pin, a venue perk, or a district event tie-in.</p>
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
            <div className="lg:col-span-2 rounded-xl border border-border/50 overflow-hidden" style={{ height: 480 }}>
              <MapContainer center={mapCenter} zoom={14} style={{ height: "100%", width: "100%" }} zoomControl={false} scrollWheelZoom={false}>
                <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution="&copy; CARTO" />
                <MapFly center={mapCenter} />
                {CAMPAIGNS.map(c => (
                  <Marker key={c.id} position={[c.lat, c.lng]} icon={campaignIcon(activeCampaign === c.id)} eventHandlers={{ click: () => selectCampaign(c) }}>
                    <Popup><div className="text-xs font-semibold">{c.name}</div></Popup>
                  </Marker>
                ))}
                {TOUCHPOINTS.map(t => (
                  <Marker key={t.name} position={[t.lat, t.lng]} icon={touchpointIcon()}>
                    <Popup><div className="text-xs">{t.name}</div></Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
            <div className="rounded-xl border border-border/50 bg-card/60 overflow-hidden flex flex-col">
              {!campaign ? (
                <>
                  <div className="p-5 border-b border-border/40">
                    <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.12em] mb-1">Campaign flow in action</div>
                  </div>
                  <div className="flex-1 divide-y divide-border/40 overflow-y-auto">
                    {LIVE_FEED.map((item, i) => (
                      <div key={i} className="p-4 flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-1.5 shrink-0" />
                        <div className="flex-1">
                          <div className="text-[12px] text-foreground">{item.text}</div>
                          <div className="text-[11px] text-muted-foreground mt-0.5 truncate">{item.campaign}</div>
                        </div>
                        <span className="text-[10px] text-muted-foreground shrink-0 whitespace-nowrap">{item.time}</span>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 border-t border-border/40">
                    <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.12em] mb-3">Campaigns</div>
                    <div className="space-y-2">
                      {CAMPAIGNS.map(c => (
                        <button key={c.id} onClick={() => selectCampaign(c)} className="w-full flex items-start gap-2.5 p-2.5 rounded-lg border border-border/40 hover:border-primary/30 transition-all text-left">
                          <div className="w-2 h-2 rounded-sm bg-primary/60 mt-0.5 shrink-0" style={{ transform: "rotate(45deg)" }} />
                          <div className="flex-1 min-w-0">
                            <div className="text-[12px] font-medium text-foreground truncate">{c.name}</div>
                            <div className="text-[11px] text-muted-foreground">{c.scans} scans</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <motion.div key={campaign.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full">
                  <div className="p-5 border-b border-border/40 flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground text-sm leading-tight">{campaign.name}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{campaign.type}</div>
                    </div>
                    <button onClick={() => setActiveCampaign(null)} className="text-muted-foreground hover:text-foreground shrink-0"><X className="w-4 h-4" /></button>
                  </div>
                  <div className="flex-1 p-5 space-y-4 overflow-y-auto">
                    <div className="text-[11px] text-primary/70 font-medium">{campaign.districts}</div>
                    <div className="grid grid-cols-4 gap-2">
                      {[{ l: "Scans", v: campaign.scans }, { l: "Visits", v: campaign.visits }, { l: "Redeem", v: campaign.redemptions }, { l: "Saves", v: campaign.saves }].map((s, i) => (
                        <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/40 text-center">
                          <div className="font-heading text-lg font-medium text-foreground">{s.v}</div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">{s.l}</div>
                        </div>
                      ))}
                    </div>
                    <div>
                      <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.1em] mb-1.5">Campaign flow</div>
                      <div className="text-[12px] text-muted-foreground leading-relaxed">{campaign.flow}</div>
                    </div>
                    <div>
                      <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.1em] mb-2">Touchpoints</div>
                      <div className="space-y-1">
                        {campaign.touchpoints.map((t, i) => (
                          <div key={i} className="flex items-center gap-2 text-[12px] text-muted-foreground">
                            <div className="w-1 h-1 rounded-full bg-primary/50 shrink-0" />{t}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
                      <div className="text-[12px] font-medium text-foreground">Trend</div>
                      <div className="text-[12px] font-medium text-primary">{campaign.trend}</div>
                    </div>
                  </div>
                  <div className="p-4 border-t border-border/40 flex gap-2">
                    <button className="flex-1 py-2.5 rounded-full bg-primary text-primary-foreground text-[12px] font-medium hover:bg-primary/90 transition-all">View flow</button>
                    <button className="flex-1 py-2.5 rounded-full border border-border/60 text-foreground/70 text-[12px] font-medium hover:text-foreground transition-all">Launch</button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* IMPACT */}
      <ImpactSection headline="See where campaign attention turns into visits."
        stats={[{ label: "Scans", v: 1204 }, { label: "Visits", v: 412 }, { label: "Saves", v: 267 }, { label: "Redemptions", v: 188 }, { label: "Building placements", v: 7 }]}
        lower={[{ label: "Campaigns live", v: "3" }, { label: "Districts activated", v: "3" }, { label: "Venue partners linked", v: "6" }, { label: "Resident access points", v: "4" }, { label: "Scan-to-visit rate", v: "34%" }, { label: "Offer completions", v: "62%" }]} />

      {/* HOW IT WORKS */}
      <StepsSection label="How it works" headline="From footprint to measurable response."
        steps={[
          { n: "1", label: "Choose the downtown footprint", detail: "Select districts, buildings, and venues for your campaign." },
          { n: "2", label: "Place QR and campaign touchpoints", detail: "Go live in lobbies, on pins, and at partner venues." },
          { n: "3", label: "Show up across map context", detail: "Appear when residents and guests explore nearby." },
          { n: "4", label: "People scan, save, visit, and redeem", detail: "One action. Walk there. Unlock the offer." },
          { n: "5", label: "Track what actually converts", detail: "See scan-to-visit rates, saves, and redemptions per placement." },
        ]}
        proof={["7 QR placements", "412 visits", "188 redemptions", "34% scan-to-visit"]} />

      {/* CAMPAIGN FLOW VISUAL */}
      <CampaignFlowSection steps={FLOW_STEPS} feed={LIVE_FEED} />

      {/* CAMPAIGN CARDS */}
      <CampaignCards campaigns={CAMPAIGNS} selectCampaign={selectCampaign} />

      {/* FORM */}
      <PartnerForm headline="Tell us about your campaign"
        body="Use this form to plan a downtown activation, connect a campaign to real places, or launch a measurable QR-to-map experience."
        formType={formType} setFormType={setFormType} formText={formText} setFormText={setFormText}
        prompts={PROMPTS} submitLabel="Launch a campaign" />

      {/* CLOSING */}
      <ClosingCTA eyebrow="Brand partner layer" headline="Run a campaign people can actually act on."
        body="If your brand is showing up downtown, it should show up in the moments people are already moving through."
        proof="3 live campaigns are already represented across the downtown map."
        ctaLabel="Launch a campaign" ctaHref="#partner-form"
        secondLabel="See campaign flow" secondHref="#campaign-map" />
    </div>
  );
}

function ImpactSection({ headline, stats, lower }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <section ref={ref} className="py-16 px-6 border-t border-border/40">
      <div className="max-w-6xl mx-auto">
        <motion.h2 initial={{ opacity: 0, y: 10 }} animate={inView ? { opacity: 1, y: 0 } : {}} className="font-heading text-2xl md:text-3xl font-medium tracking-tight mb-8">{headline}</motion.h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
          {stats.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.06 }} className="p-5 rounded-lg border border-border/50 bg-card/40 text-center">
              <div className="font-heading text-2xl font-medium text-foreground"><CountUp to={s.v} /></div>
              <div className="text-[11px] text-muted-foreground mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
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
    <section ref={ref} className="py-16 px-6 border-t border-border/40">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={inView ? { opacity: 1, y: 0 } : {}} className="mb-10">
          <span className="text-[11px] font-medium text-primary/70 uppercase tracking-[0.16em] block mb-3">{label}</span>
          <h2 className="font-heading text-2xl md:text-3xl font-medium tracking-tight">{headline}</h2>
        </motion.div>
        <div className="relative">
          <div className="hidden md:block absolute top-8 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {steps.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.1 }} className="flex flex-col items-center text-center md:items-start md:text-left">
                <div className="w-10 h-10 rounded-full border border-primary/40 bg-card flex items-center justify-center mb-4 z-10">
                  <span className="text-primary font-heading font-medium text-sm">{s.n}</span>
                </div>
                <div className="font-medium text-sm text-foreground mb-1.5">{s.label}</div>
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

function CampaignFlowSection({ steps, feed }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <section ref={ref} className="py-16 px-6 border-t border-border/40">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={inView ? { opacity: 1, y: 0 } : {}} className="mb-8">
          <span className="text-[11px] font-medium text-primary/70 uppercase tracking-[0.16em] block mb-3">Campaign flow in action</span>
          <h2 className="font-heading text-2xl md:text-3xl font-medium tracking-tight">QR to visit to redemption.</h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            {steps.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ delay: i * 0.08 }}
                className="flex gap-4 p-4 rounded-lg border border-border/40 bg-card/30">
                <div className="w-7 h-7 rounded-full border border-primary/30 flex items-center justify-center shrink-0">
                  <span className="text-primary text-[11px] font-medium">{i + 1}</span>
                </div>
                <div>
                  <div className="font-medium text-sm text-foreground mb-0.5">{s.label}</div>
                  <div className="text-[12px] text-muted-foreground">{s.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="rounded-xl border border-border/50 bg-card/40 overflow-hidden">
            <div className="p-5 border-b border-border/40">
              <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.12em]">Live campaign activity</div>
            </div>
            <div className="divide-y divide-border/40">
              {feed.map((item, i) => (
                <div key={i} className="p-4 flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-1.5 shrink-0 animate-pulse" />
                  <div className="flex-1">
                    <div className="text-[12px] text-foreground">{item.text}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5 truncate">{item.campaign}</div>
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

function CampaignCards({ campaigns, selectCampaign }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <section ref={ref} className="py-16 px-6 border-t border-border/40">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={inView ? { opacity: 1, y: 0 } : {}} className="mb-8">
          <span className="text-[11px] font-medium text-primary/70 uppercase tracking-[0.16em] block mb-3">Live campaigns</span>
          <h2 className="font-heading text-2xl md:text-3xl font-medium tracking-tight">What each campaign is generating.</h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {campaigns.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.08 }}
              onClick={() => selectCampaign(c)} className="p-5 rounded-xl border border-border/50 bg-card/40 hover:border-primary/30 cursor-pointer transition-all">
              <div className="flex items-start gap-2 mb-4">
                <div className="w-2.5 h-2.5 rounded-sm bg-primary/70 mt-0.5 shrink-0" style={{ transform: "rotate(45deg)" }} />
                <span className="font-heading font-medium text-sm text-foreground leading-tight">{c.name}</span>
              </div>
              <div className="h-1.5 rounded-full bg-border/50 mb-4 overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={inView ? { width: `${Math.min(100, (c.scans / 500) * 100)}%` } : {}} transition={{ duration: 1, delay: 0.3 + i * 0.1 }} className="h-full rounded-full bg-primary" />
              </div>
              <div className="space-y-2 text-[12px]">
                {[["Scans", c.scans], ["Visits", c.visits], ["Redemptions", c.redemptions]].map(([l, v]) => (
                  <div key={l} className="flex justify-between text-muted-foreground"><span>{l}</span><span className="text-foreground font-medium">{v}</span></div>
                ))}
                <div className="flex justify-between text-muted-foreground"><span>Trend</span><span className="text-primary font-medium">{c.trend}</span></div>
              </div>
              <div className="mt-3 pt-3 border-t border-border/40">
                <div className="text-[10px] text-muted-foreground/60 uppercase tracking-[0.1em] mb-1">Best placement</div>
                <div className="text-[12px] text-foreground">{c.best}</div>
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
    <section id="partner-form" ref={ref} className="py-16 px-6 border-t border-border/40">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-8 items-end">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={inView ? { opacity: 1, y: 0 } : {}}>
            <span className="text-[11px] font-medium text-primary/70 uppercase tracking-[0.16em] block mb-3">Get started</span>
            <h2 className="font-heading text-2xl md:text-3xl font-medium tracking-tight">{headline}</h2>
          </motion.div>
          <p className="text-muted-foreground text-[13px] leading-relaxed">{body}</p>
        </div>
        <div className="border border-border/50 rounded-xl overflow-hidden">
          <div className="flex border-b border-border/40 overflow-x-auto">
            {TYPES.map(t => (
              <button key={t} onClick={() => setFormType(t)} className={`px-6 py-4 text-[12px] font-medium whitespace-nowrap border-r border-border/40 last:border-r-0 transition-all ${formType === t ? "text-primary bg-primary/5" : "text-muted-foreground hover:text-foreground"}`}>{t}</button>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-8 md:border-r border-border/40 space-y-4">
              {[["Brand / Organization Name", "text"], ["Your Name & Role", "text"], ["Email", "email"], ["Phone", "tel"]].map(([label, type]) => (
                <div key={label}>
                  <label className="block text-[11px] font-medium text-muted-foreground uppercase tracking-[0.1em] mb-1.5">{label}</label>
                  <input type={type} className="w-full bg-muted/30 border border-border/50 rounded-lg px-4 py-2.5 text-[13px] text-foreground outline-none focus:border-primary/40 transition-colors" />
                </div>
              ))}
              <div>
                <label className="block text-[11px] font-medium text-muted-foreground uppercase tracking-[0.1em] mb-1.5">Tell us about your campaign</label>
                <textarea rows={4} value={formText} onChange={e => setFormText(e.target.value)} placeholder="What are you activating, where, and what response are you looking for?"
                  className="w-full bg-muted/30 border border-border/50 rounded-lg px-4 py-2.5 text-[13px] text-foreground outline-none focus:border-primary/40 transition-colors resize-none placeholder-muted-foreground/30" />
              </div>
              <button className="w-full py-3 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-all">{submitLabel}</button>
            </div>
            <div className="p-8 bg-muted/10 flex flex-col">
              <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.12em] mb-4">Prompts</div>
              <div className="space-y-2 flex-1">
                {prompts.map(p => (<button key={p} onClick={() => setFormText(p)} className="w-full text-left px-4 py-3 rounded-lg border border-border/40 hover:border-primary/30 text-[13px] text-muted-foreground hover:text-foreground transition-all">{p}</button>))}
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
    <section className="py-20 px-6 border-t border-border/40">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="text-[11px] font-medium text-primary/70 uppercase tracking-[0.16em] block mb-4">{eyebrow}</span>
            <h2 className="font-heading text-3xl md:text-4xl font-medium leading-[1.15] tracking-tight mb-3">{headline}</h2>
            <p className="text-muted-foreground text-[13px] leading-relaxed">{body}</p>
          </div>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <a href={ctaHref} className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-all">{ctaLabel} <ArrowRight className="w-4 h-4" /></a>
              <a href={secondHref} className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-border/70 text-foreground/70 font-medium text-sm hover:text-foreground transition-all">{secondLabel}</a>
            </div>
            <p className="text-[12px] text-muted-foreground/50 italic">{proof}</p>
          </div>
        </div>
      </div>
    </section>
  );
}