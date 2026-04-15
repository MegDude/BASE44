import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Home, MapPin, Layers, Clock, Zap, RefreshCw, Star } from "lucide-react";

const RESIDENTIAL_PARTNERS = [
  {
    slug: "/brands/four-seasons-residences",
    name: "Four Seasons Residents",
    category: "Residential Partner",
    desc: "A live amenity layer that helps residents discover dining, wellness, events, and local perks around where they live.",
    cta: "View Residential Partnership",
    hover: "Extend everyday building life into one live downtown layer.",
  },
  {
    slug: "/brands/the-shore",
    name: "The Shore",
    category: "Residential Partner",
    desc: "Residents of The Shore enjoy access to Hotel Van Zandt amenities and exclusive local-resident rates — paired with a live downtown discovery layer.",
    cta: "View Residential Partnership",
    hover: "Make nearby plans, perks, and places easier to use every day.",
  },
];

const BENEFITS = [
  { icon: Layers, label: "Extend the amenity offering", desc: "Residents get more than in-building features. They get a live neighborhood layer." },
  { icon: MapPin, label: "Make downtown easier to use", desc: "Dining, events, wellness, and local perks appear in one simple system tied to real proximity." },
  { icon: Clock, label: "Add everyday utility", desc: "The experience is useful on an ordinary Tuesday, not just during special moments." },
  { icon: Home, label: "Strengthen resident experience", desc: "People feel more connected to where they live and what is around them." },
];

const HOW_STEPS = [
  { n: "01", label: "Building goes live", detail: "The property joins Downtown Perks as a residential partner." },
  { n: "02", label: "Residents receive access", detail: "Access is introduced through QR, text, or building onboarding — no heavy tech required." },
  { n: "03", label: "The downtown layer opens", detail: "Residents instantly see nearby places, events, wellness options, and local perks." },
  { n: "04", label: "Useful moments surface", detail: "Coffee runs, dinner decisions, after-work plans, and weekend activity all become easier." },
  { n: "05", label: "Residents take action", detail: "They save places, use perks, and move through downtown with less friction." },
  { n: "06", label: "The amenity proves itself", detail: "The building offers something residents actually return to and use regularly." },
];

const VALUE_CARDS = [
  { icon: Star, label: "A stronger amenity story", desc: "The property can offer a live local layer, not just static amenity language." },
  { icon: MapPin, label: "Better resident utility", desc: "Residents have a practical way to discover and use downtown more easily." },
  { icon: Clock, label: "More everyday relevance", desc: "The experience supports normal routines, not just occasional events." },
  { icon: Home, label: "Premium neighborhood connection", desc: "The building feels more connected to the district around it." },
  { icon: Zap, label: "Lightweight rollout", desc: "The system is simple to launch and easy to maintain." },
  { icon: RefreshCw, label: "Clearer value", desc: "The amenity feels real because residents can actually use it." },
];

const PROOF = [
  { value: "67%", label: "Resident activation rate" },
  { value: "3.4×", label: "Repeat weekly opens" },
  { value: "29%", label: "Perk engagement rate" },
  { value: "0", label: "Extra apps needed" },
];

const USE_CASES = [
  { tag: "Morning", title: "Start the day without guesswork", detail: "A resident opens the map for coffee, breakfast, or a wellness option before work." },
  { tag: "Midweek plans", title: "Easy plans on a regular night", detail: "Someone checks what is happening nearby tonight and makes a quick decision without switching between apps." },
  { tag: "Dinner", title: "Dinner is easy to decide", detail: "A resident finds a useful nearby place for dinner, sees a live perk, and goes." },
  { tag: "Weekend flow", title: "Neighborhood activity in one place", detail: "Events, social plans, and neighborhood activity surface together." },
  { tag: "Repeat use", title: "Part of everyday downtown living", detail: "The same layer becomes part of how residents navigate downtown over time." },
];

export default function ResidentialPartner() {
  const heroRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true });

  return (
    <div className="min-h-screen bg-background">

      {/* HERO */}
      <section ref={heroRef} className="pt-36 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: "linear-gradient(hsl(222 18% 40%) 1px,transparent 1px),linear-gradient(90deg,hsl(222 18% 40%) 1px,transparent 1px)", backgroundSize: "56px 56px" }} />
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className="text-[11px] font-medium text-primary/70 uppercase tracking-[0.16em] block mb-5">
              Residential Partners · Amenity Layer for Downtown Living
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-end">
              <div>
                <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-medium leading-[1.05] tracking-tight mb-5">
                  A better downtown layer<br />
                  <em className="text-primary">for people who live here.</em>
                </h1>
                <p className="text-muted-foreground text-base leading-relaxed max-w-lg">
                  Downtown Perks helps residential buildings turn downtown access into a real amenity. Residents open one live map to see nearby dining, events, wellness, and local perks — all tied to where they live and how they actually move through downtown.
                </p>
              </div>
              <div className="space-y-4">
                <div className="rounded-xl border border-border/60 bg-card/60 p-6 space-y-4">
                  <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.12em] mb-2">Resident Access</div>
                  <div className="font-heading font-medium text-foreground mb-1">Your downtown layer is live.</div>
                  <p className="text-[13px] text-muted-foreground leading-relaxed">
                    See what is nearby right now — coffee, dinner, events, wellness, and local perks in one simple layer built around where you live.
                  </p>
                  <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-primary text-primary-foreground text-[12px] font-medium">
                    <Zap className="w-3.5 h-3.5" /> Open Resident Access
                  </div>
                  <div className="space-y-2 pt-2 border-t border-border/40">
                    {[
                      { title: "Coffee nearby now", sub: "A short walk from home" },
                      { title: "Dinner tonight", sub: "Nearby places worth going" },
                      { title: "Wellness this morning", sub: "Movement and reset close by" },
                      { title: "Resident perk live", sub: "A local offer you can actually use" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg bg-muted/30">
                        <div className="w-6 h-6 rounded-full border border-border/50 flex items-center justify-center shrink-0">
                          <Star className="w-2.5 h-2.5 text-primary/50" />
                        </div>
                        <div>
                          <div className="text-[12px] font-medium text-foreground">{item.title}</div>
                          <div className="text-[11px] text-muted-foreground mt-0.5">{item.sub}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-10 flex flex-wrap gap-3">
            <a href="mailto:partners@downtownperks.com"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-all shadow-md shadow-primary/15">
              Partner With Downtown Perks <ArrowRight className="w-4 h-4" />
            </a>
            <Link to="/downtown-perks/for-buildings"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-border/70 text-foreground/70 font-medium text-sm hover:text-foreground transition-all">
              See Residential Partnership Details
            </Link>
          </motion.div>
        </div>
      </section>

      {/* WHY IT FITS */}
      <WhySection benefits={BENEFITS} />

      {/* HOW IT WORKS */}
      <HowSection steps={HOW_STEPS} />

      {/* VALUE CARDS */}
      <ValueSection cards={VALUE_CARDS} />

      {/* USE CASES */}
      <UseCasesSection cases={USE_CASES} />

      {/* FEATURED PARTNERS */}
      <FeaturedPartners partners={RESIDENTIAL_PARTNERS} />

      {/* PROOF */}
      <ProofSection proof={PROOF} />

      {/* CTA */}
      <section className="py-20 px-6 border-t border-border/40">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="font-heading text-3xl md:text-4xl font-medium leading-[1.15] tracking-tight mb-4">
                Give residents a downtown layer that feels as useful as where they live.
              </h2>
              <p className="text-muted-foreground text-[13px] leading-relaxed">
                One map. One member layer. A more connected way to live downtown.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a href="mailto:partners@downtownperks.com"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-all">
                Partner With Downtown Perks <ArrowRight className="w-4 h-4" />
              </a>
              <Link to="/partners"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-border/70 text-foreground/70 font-medium text-sm hover:text-foreground transition-all">
                See All Residential Partnerships
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function WhySection({ benefits }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <section ref={ref} className="py-16 px-6 border-t border-border/40">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }}>
            <span className="text-[11px] font-medium text-primary/70 uppercase tracking-[0.16em] block mb-4">Why it fits</span>
            <h2 className="font-heading text-2xl md:text-3xl font-medium leading-[1.2] tracking-tight mb-5">
              Great residential buildings help people feel connected to how they actually live.
            </h2>
            <div className="space-y-4 text-[13px] text-muted-foreground leading-relaxed">
              <p>Downtown Perks gives buildings a live downtown layer residents can actually use. Instead of static amenity language, outdated welcome packets, or scattered recommendations, residents get one simple system for discovering what is nearby and worth doing right now.</p>
              <p>The result is a residential amenity that feels useful, current, and tied to everyday downtown life.</p>
            </div>
          </motion.div>
          <div className="space-y-3">
            {benefits.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: 16 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ delay: 0.1 + i * 0.08 }}
                className="flex items-start gap-4 p-5 rounded-xl border border-border/50 bg-card/50">
                <div className="w-8 h-8 rounded-full border border-primary/20 bg-primary/5 flex items-center justify-center shrink-0">
                  <item.icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="font-medium text-[13px] text-foreground mb-1">{item.label}</div>
                  <div className="text-[12px] text-muted-foreground leading-relaxed">{item.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function HowSection({ steps }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <section ref={ref} className="py-16 px-6 border-t border-border/40 bg-card/20">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }} className="mb-10">
          <span className="text-[11px] font-medium text-primary/70 uppercase tracking-[0.16em] block mb-3">How it works</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            <h2 className="font-heading text-2xl md:text-3xl font-medium leading-[1.2] tracking-tight">
              From building access to real downtown use.
            </h2>
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              Connected in one simple flow — no heavy tech, no complex setup.
            </p>
          </div>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {steps.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.08 }}
              className="p-5 rounded-xl border border-border/50 bg-card/60">
              <div className="text-[11px] font-medium text-primary/60 mb-3 font-heading tracking-[0.08em]">{s.n}</div>
              <div className="font-medium text-sm text-foreground mb-1.5">{s.label}</div>
              <div className="text-[12px] text-muted-foreground leading-relaxed">{s.detail}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ValueSection({ cards }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <section ref={ref} className="py-16 px-6 border-t border-border/40">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }} className="mb-10">
          <span className="text-[11px] font-medium text-primary/70 uppercase tracking-[0.16em] block mb-3">What residential partners get</span>
          <h2 className="font-heading text-2xl md:text-3xl font-medium leading-[1.2] tracking-tight">
            Six things that make the difference.
          </h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.07 }}
              className="p-6 rounded-xl border border-border/50 bg-card/50 hover:border-primary/20 transition-all">
              <div className="w-8 h-8 rounded-full border border-primary/20 bg-primary/5 flex items-center justify-center mb-4">
                <card.icon className="w-4 h-4 text-primary/70" />
              </div>
              <div className="font-medium text-[14px] text-foreground mb-2">{card.label}</div>
              <div className="text-[12px] text-muted-foreground leading-relaxed">{card.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function UseCasesSection({ cases }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <section ref={ref} className="py-16 px-6 border-t border-border/40 bg-card/20">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }} className="mb-10">
          <span className="text-[11px] font-medium text-primary/70 uppercase tracking-[0.16em] block mb-3">Use cases</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            <h2 className="font-heading text-2xl md:text-3xl font-medium leading-[1.2] tracking-tight">
              When it becomes part of everyday downtown living.
            </h2>
          </div>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cases.map((c, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.07 }}
              className="p-6 rounded-xl border border-border/50 bg-card/50">
              <span className="text-[11px] font-medium text-primary/70 uppercase tracking-[0.12em] block mb-3">{c.tag}</span>
              <div className="font-heading font-medium text-[15px] mb-2 text-foreground">{c.title}</div>
              <p className="text-[12px] text-muted-foreground leading-relaxed">{c.detail}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedPartners({ partners }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <section ref={ref} className="py-16 px-6 border-t border-border/40">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }} className="mb-10">
          <span className="text-[11px] font-medium text-primary/70 uppercase tracking-[0.16em] block mb-3">Featured residential partners</span>
          <h2 className="font-heading text-2xl md:text-3xl font-medium leading-[1.2] tracking-tight">
            Buildings already live on the map.
          </h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {partners.map((p, i) => (
            <motion.div key={p.slug} initial={{ opacity: 0, y: 10 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.08 }}>
              <Link to={p.slug}
                className="group block p-6 rounded-xl border border-border/50 bg-card/50 hover:border-primary/30 hover:bg-card/80 transition-all">
                <span className="text-[11px] font-medium text-primary/60 uppercase tracking-[0.12em] block mb-3">{p.category}</span>
                <h3 className="font-heading font-medium text-lg text-foreground mb-2 group-hover:text-primary transition-colors">{p.name}</h3>
                <p className="text-[12px] text-muted-foreground leading-relaxed mb-4">{p.desc}</p>
                <div className="text-[12px] font-medium text-primary flex items-center gap-1.5">
                  {p.cta} <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            </motion.div>
          ))}
          {/* Placeholder card */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: partners.length * 0.08 }}>
            <div className="p-6 rounded-xl border border-dashed border-border/40 hover:border-primary/20 transition-all flex flex-col justify-center items-center text-center min-h-[180px]">
              <div className="text-[12px] text-muted-foreground/50 mb-1">Future building partners</div>
              <div className="text-[11px] text-muted-foreground/30">Additional residential properties can plug into the same live downtown system as the network expands.</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function ProofSection({ proof }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <section ref={ref} className="py-16 px-6 border-t border-border/40 bg-card/20">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }} className="mb-8">
          <span className="text-[11px] font-medium text-primary/70 uppercase tracking-[0.16em] block mb-3">Proof</span>
          <h2 className="font-heading text-2xl md:text-3xl font-medium leading-[1.2] tracking-tight">
            Numbers that residential partners care about.
          </h2>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {proof.map((p, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.07 }}
              className="p-6 rounded-xl border border-border/50 bg-card/60 text-center">
              <div className="font-heading text-3xl font-medium text-primary mb-1 tracking-tight">{p.value}</div>
              <div className="text-[12px] text-muted-foreground">{p.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}