import { motion } from "framer-motion";
import { MapPin, Home, Layers, Star, Clock, RefreshCw, Zap } from "lucide-react";
import BrandHero from "../../../components/downtown-perks/brands/BrandHero";
import { BrandSection, SignalCard, FlowCard, UseCaseCard, BrandCTA } from "../../../components/downtown-perks/brands/BrandSection";
import { NotificationDemoPanel } from "../../../components/downtown-perks/brands/DemoPanel";

const demo = (
  <div className="rounded-xl border border-border/60 bg-card/60 overflow-hidden">
    <div className="p-5 border-b border-border/40">
      <div className="text-[11px] font-medium text-primary/70 uppercase tracking-[0.14em] mb-1">Residential Partner</div>
      <div className="font-heading font-semibold text-lg text-foreground">Four Seasons Residences</div>
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
        { title: "Dinner tonight", sub: "Nearby tables and places worth going" },
        { title: "Wellness this morning", sub: "Movement, recovery, and reset nearby" },
        { title: "Resident perk live", sub: "A local offer tied to where you already go" },
      ]}
    />
  </div>
);

export default function FourSeasonsResidences() {
  return (
    <div className="min-h-screen bg-background">
      <BrandHero
        eyebrow="Residential Partner · Amenity Layer for Downtown Living"
        headline={<>Give residents a better downtown layer<br /><span className="text-primary">right where they live.</span></>}
        support="Downtown Perks helps Four Seasons Residences extend everyday building life into the neighborhood around it. Residents can instantly access nearby dining, wellness, events, local perks, and walkable downtown context through one live map and one simple member layer."
        ctaLabel="Partner With Downtown Perks"
        ctaHref="mailto:partners@downtownperks.com"
        demoPanel={demo}
      />

      {/* Why it fits */}
      <BrandSection label="Why It Fits" title="Great residential buildings help people feel connected to how they actually live.">
        <div className="grid md:grid-cols-2 gap-10">
          <div className="space-y-5">
            <p className="text-muted-foreground leading-relaxed">
              Four Seasons Residences already offers a premium residential experience. Downtown Perks extends that experience into the surrounding neighborhood with a live, useful downtown layer residents can open anytime.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Dining, events, wellness, local offers, and nearby discovery all come together in one place. The result is a residential amenity that feels current, practical, and aligned with everyday downtown life.
            </p>
          </div>
          <div className="space-y-4">
            {[
              { icon: Layers, label: "Extend the amenity offering", desc: "Residents get more than in-building features. They get a live neighborhood layer." },
              { icon: MapPin, label: "Make downtown easier to use", desc: "Dining, events, wellness, and perks appear in one simple system tied to real proximity." },
              { icon: Clock, label: "Add everyday utility", desc: "The experience is useful on an ordinary Tuesday, not just during special events." },
              { icon: Home, label: "Strengthen resident experience", desc: "People feel more connected to where they live and what is around them." },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-4 p-5 rounded-xl bg-card border border-border"
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
      <BrandSection label="How It Works" title="From building access to real downtown use — connected in one simple flow." className="bg-card/30 border-y border-border">
        <div className="grid md:grid-cols-2 gap-4">
          <FlowCard step="01" title="Resident access is activated" desc="The building offers Downtown Perks as part of the resident amenity layer." delay={0} />
          <FlowCard step="02" title="Resident opens the map" desc="No extra platform confusion. Just a simple live downtown surface that works immediately." delay={0.1} />
          <FlowCard step="03" title="Nearby places and moments appear" desc="Dining, events, wellness, and local perks show up based on what is close and relevant." delay={0.2} />
          <FlowCard step="04" title="Resident takes action" desc="They save a spot, head out, use a perk, or plan around what is happening nearby." delay={0.3} />
          <FlowCard step="05" title="Building value becomes visible" desc="The amenity feels active, current, and tied to real resident behavior." delay={0.4} />
          <FlowCard step="06" title="Local connection deepens over time" desc="Residents return to the same layer again and again as part of daily downtown life." delay={0.5} />
        </div>
      </BrandSection>

      {/* Value */}
      <BrandSection label="Value" title="What Four Seasons Residences gets.">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <SignalCard icon={<Star className="w-5 h-5" />} label="A stronger amenity story" sub="The building can offer a live local layer, not just static amenity language." delay={0} />
          <SignalCard icon={<MapPin className="w-5 h-5" />} label="Better resident utility" sub="Residents have a practical way to discover and use downtown more easily." delay={0.1} />
          <SignalCard icon={<Clock className="w-5 h-5" />} label="More everyday relevance" sub="The experience supports coffee runs, dinners, plans, wellness, and last-minute decisions." delay={0.2} />
          <SignalCard icon={<Home className="w-5 h-5" />} label="Premium local connection" sub="The residential experience feels more connected to the neighborhood around it." delay={0.3} />
          <SignalCard icon={<Zap className="w-5 h-5" />} label="Lightweight rollout" sub="Simple to introduce and easy to maintain — no heavy systems or onboarding burden." delay={0.4} />
          <SignalCard icon={<RefreshCw className="w-5 h-5" />} label="A clearer value signal" sub="The amenity feels real because residents can actually use it." delay={0.5} />
        </div>
      </BrandSection>

      {/* Use Cases */}
      <BrandSection label="Use Cases" title="What everyday use looks like." className="bg-card/30 border-y border-border">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          <UseCaseCard tag="Morning" title="Start the day without guesswork" detail="A resident opens the map to find coffee, a walkable breakfast spot, or a nearby wellness option before work." delay={0} />
          <UseCaseCard tag="Midweek" title="Easy plans on a regular night" detail="Someone checks what is happening tonight nearby and makes a quick decision without switching between apps." delay={0.1} />
          <UseCaseCard tag="Dining" title="Dinner is easy to decide" detail="A resident finds a useful nearby place, sees a live perk, and goes — without a long search." delay={0.2} />
          <UseCaseCard tag="Weekend" title="Neighborhood activity in one place" detail="Events, social plans, and local moments surface together so the weekend starts with something to work with." delay={0.3} />
          <UseCaseCard tag="Repeat Use" title="Part of daily downtown life" detail="The same layer becomes part of how residents navigate the neighborhood over time — not a one-time thing." delay={0.4} />
        </div>
      </BrandSection>

      {/* Proof */}
      <BrandSection label="Proof" title="Numbers that residential partners care about.">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SignalCard value="67%" label="Resident activation rate" sub="Among residents who received access" delay={0} />
          <SignalCard value="3.4×" label="Repeat weekly opens" sub="Average return rate per active resident" delay={0.1} />
          <SignalCard value="29%" label="Perk engagement rate" sub="Among residents who opened the map" delay={0.2} />
          <SignalCard value="0" label="Extra apps" sub="One simple downtown layer for residents" delay={0.3} />
        </div>
      </BrandSection>

      <BrandCTA
        headline="Give residents a downtown layer that feels as considered as where they live."
        sub="One map. One member layer. A more connected way to live downtown."
        ctaLabel="Partner With Downtown Perks"
        ctaHref="mailto:partners@downtownperks.com"
      />
    </div>
  );
}