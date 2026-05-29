import { motion } from "framer-motion";
import { MapPin, Layers, Clock, Zap, Star, RefreshCw, Waves } from "lucide-react";
import BrandHero from "../../../components/downtown-perks/brands/BrandHero";
import { BrandSection, SignalCard, FlowCard, UseCaseCard, BrandCTA } from "../../../components/downtown-perks/brands/BrandSection";
import { NotificationDemoPanel } from "../../../components/downtown-perks/brands/DemoPanel";

const demo = (
  <div className="rounded-xl border border-border/60 bg-card/60 overflow-hidden">
    <div className="p-5 border-b border-border/40">
      <div className="text-[11px] font-medium text-primary/70 uppercase tracking-[0.14em] mb-1">Residential Partner</div>
      <div className="font-heading font-semibold text-lg text-foreground">The Shore</div>
      <div className="text-[12px] text-muted-foreground mt-0.5">Your downtown layer is live.</div>
      <p className="text-[12px] text-muted-foreground mt-3 leading-relaxed">
        See what is nearby right now — places to go, events worth knowing about, and local perks that fit the rhythm of the day.
      </p>
      <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full bg-primary text-primary-foreground text-[12px] font-medium">
        <Zap className="w-3 h-3" /> Open Resident Access
      </div>
    </div>
    <NotificationDemoPanel
      items={[
        { title: "Coffee nearby now", sub: "A short walk from home" },
        { title: "Hotel Van Zandt pool access", sub: "Resident amenity — no booking required" },
        { title: "Dinner tonight", sub: "Walkable places worth going" },
        { title: "Resident perk live", sub: "Local resident rate on Van Zandt stays" },
      ]}
    />
  </div>
);

export default function TheShore() {
  return (
    <div className="min-h-screen bg-background">
      <BrandHero
        eyebrow="Residential Partner · Amenity Layer for Downtown Living"
        headline={<>Give residents a better way to use<br /><span className="text-primary">the neighborhood around them.</span></>}
        support="Downtown Perks helps The Shore extend building life into the downtown layer around it. Residents get access to Hotel Van Zandt amenities, local resident hotel rates, and a live neighborhood discovery layer — all in one simple member experience built around where they live."
        ctaLabel="Partner With Downtown Perks"
        ctaHref="mailto:partners@downtownperks.com"
        demoPanel={demo}
      />

      {/* Why it fits */}
      <BrandSection label="Why It Fits" title="A location advantage that residents can actually use.">
        <div className="grid md:grid-cols-2 gap-10">
          <div className="space-y-5">
            <p className="text-muted-foreground leading-relaxed">
              The Shore sits inside one of the most walkable parts of downtown Austin. Downtown Perks turns that location advantage into a live, practical resident amenity layer — not just a proximity statement in a leasing brochure.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Residents get Hotel Van Zandt pool access and local resident rates as part of the partnership, alongside a live downtown map for dining, events, wellness, and everyday discovery. The result is a residential experience that feels connected, current, and genuinely useful.
            </p>
          </div>
          <div className="space-y-4">
            {[
              { icon: Waves, label: "Hotel Van Zandt access", desc: "Residents enjoy pool access and amenity use at Van Zandt as part of the partnership — not a paid add-on." },
              { icon: MapPin, label: "Local resident hotel rates", desc: "When residents want to book a stay, they access resident pricing — a tangible benefit tied to where they live." },
              { icon: Layers, label: "Live downtown layer", desc: "Dining, events, wellness, and local perks appear in one simple system tied to real proximity." },
              { icon: Clock, label: "Everyday utility", desc: "The experience is useful on an ordinary Tuesday, not just during special moments." },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-4 p-5 rounded-xl bg-card border border-border/50"
              >
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <item.icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-[13px] mb-0.5">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </BrandSection>

      {/* How it works */}
      <BrandSection label="How It Works" title="From resident access to real downtown use — connected in one simple flow." className="bg-card/30 border-y border-border/40">
        <div className="grid md:grid-cols-2 gap-4">
          <FlowCard step="01" title="Resident access is activated" desc="The Shore offers Downtown Perks as part of its residential amenity layer." delay={0} />
          <FlowCard step="02" title="Resident opens the map" desc="No extra platform confusion. A simple live downtown surface that works immediately." delay={0.1} />
          <FlowCard step="03" title="Van Zandt access shows up" desc="Pool access, resident hotel rates, and local perks appear alongside the full neighborhood layer." delay={0.2} />
          <FlowCard step="04" title="Nearby places and moments surface" desc="Dining, events, wellness, and local discovery show up based on what is close and relevant." delay={0.3} />
          <FlowCard step="05" title="Resident takes action" desc="They save a spot, head to the pool, use a perk, or plan around what is happening nearby." delay={0.4} />
          <FlowCard step="06" title="Local connection deepens over time" desc="Residents return to the same layer again and again as part of everyday downtown life." delay={0.5} />
        </div>
      </BrandSection>

      {/* Value */}
      <BrandSection label="Value" title="What The Shore gets.">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <SignalCard icon={<Star className="w-5 h-5" />} label="A stronger amenity story" sub="Live local access — not just static amenity language." delay={0} />
          <SignalCard icon={<Waves className="w-5 h-5" />} label="Van Zandt partnership perks" sub="Pool access and local resident hotel rates as real, usable benefits." delay={0.1} />
          <SignalCard icon={<MapPin className="w-5 h-5" />} label="Better resident utility" sub="One practical way to discover and use downtown every day." delay={0.2} />
          <SignalCard icon={<Clock className="w-5 h-5" />} label="More everyday relevance" sub="The experience supports coffee runs, dinner decisions, events, and plans." delay={0.3} />
          <SignalCard icon={<Zap className="w-5 h-5" />} label="Lightweight rollout" sub="Simple to introduce and easy to maintain." delay={0.4} />
          <SignalCard icon={<RefreshCw className="w-5 h-5" />} label="A clearer value signal" sub="The amenity feels real because residents can actually use it." delay={0.5} />
        </div>
      </BrandSection>

      {/* Use Cases */}
      <BrandSection label="Use Cases" title="When it becomes part of everyday downtown living." className="bg-card/30 border-y border-border/40">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          <UseCaseCard tag="Morning" title="Start the day nearby" detail="A resident opens the map to find coffee, a walkable breakfast spot, or a nearby wellness option before work." delay={0} />
          <UseCaseCard tag="Midafternoon" title="Van Zandt pool" detail="Residents head down to the pool without booking ahead — amenity access that actually gets used." delay={0.1} />
          <UseCaseCard tag="Dinner" title="Dinner is easy to decide" detail="A resident finds a useful nearby place, sees a live perk, and goes — without a long search." delay={0.2} />
          <UseCaseCard tag="Overnight stay" title="Local resident rate" detail="When a resident wants a hotel night or hosts a guest, they book at the local resident rate through the Van Zandt partnership." delay={0.3} />
          <UseCaseCard tag="Weekend flow" title="Neighborhood activity in one place" detail="Events, plans, and local moments surface together so the weekend starts with something to work with." delay={0.4} />
          <UseCaseCard tag="Repeat use" title="Part of everyday life" detail="The same layer becomes part of how residents navigate downtown over time — not a one-time thing." delay={0.5} />
        </div>
      </BrandSection>

      {/* Proof */}
      <BrandSection label="Proof" title="Numbers that residential partners care about.">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SignalCard value="64%" label="Resident activation rate" sub="Among residents who received access" delay={0} />
          <SignalCard value="3.1×" label="Repeat weekly opens" sub="Average return rate per active resident" delay={0.1} />
          <SignalCard value="27%" label="Perk engagement rate" sub="Among residents who opened the map" delay={0.2} />
          <SignalCard value="0" label="Extra apps" sub="One simple downtown layer for residents" delay={0.3} />
        </div>
      </BrandSection>

      <BrandCTA
        headline="Give residents a downtown layer that feels connected to how they actually live."
        sub="One map. One member layer. A better way to live downtown."
        ctaLabel="Partner With Downtown Perks"
        ctaHref="mailto:partners@downtownperks.com"
      />
    </div>
  );
}