import { motion } from "framer-motion";
import { Users, Zap, Star, TrendingUp, Crown, Globe, Eye } from "lucide-react";
import BrandHero from "../../../components/downtown-perks/brands/BrandHero";
import { BrandSection, SignalCard, FlowCard, UseCaseCard, BrandCTA } from "../../../components/downtown-perks/brands/BrandSection";
import { MapDemoPanel } from "../../../components/downtown-perks/brands/DemoPanel";

const demo = (
  <div className="grid md:grid-cols-2 gap-5">
    <MapDemoPanel
      venueName="The Waterline"
      tag="Premium residential flagship · Downtown Austin"
      nearbyItems={["Hotel Van Zandt", "Lady Bird Lake", "SoCo District"]}
    />
    <div className="rounded-lg border border-border bg-card p-7 flex flex-col justify-between">
      <div>
        <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-5">Live Resident Feed</div>
        <div className="space-y-3">
          {[
            { title: "Rooftop social — tonight 7pm", tag: "Members Only" },
            { title: "Cold plunge pass available", tag: "Wellness" },
            { title: "Run club departs lobby at 6am", tag: "Fitness" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/50">
              <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
              <div>
                <div className="text-[13px] font-medium">{item.title}</div>
                <div className="text-xs text-muted-foreground">{item.tag}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-6 text-xs text-muted-foreground">Updated in real time for Waterline residents</div>
    </div>
  </div>
);

export default function TheWaterline() {
  return (
    <div className="min-h-screen bg-background">
      <BrandHero
        eyebrow="Premium Residential · Downtown Austin"
        headline={<>The Waterline doesn't just<br /><span className="text-primary">overlook downtown. It runs it.</span></>}
        support="Downtown Perks becomes a live extension of The Waterline — delivering neighborhood intelligence, exclusive access, and real-time local context directly to residents."
        ctaLabel="Explore the Partnership"
        ctaHref="mailto:partners@downtownperks.com"
        demoPanel={demo}
        bgAccent="from-primary/10"
      />

      {/* Why they fit */}
      <BrandSection label="The Positioning" title="Premium properties need premium context.">
        <div className="grid md:grid-cols-2 gap-10 items-start">
          <div className="space-y-5">
            <p className="text-muted-foreground leading-relaxed text-lg">
              Residents who choose The Waterline are choosing a downtown experience, not just a unit. They expect the neighborhood to work for them — not to be discovered through Yelp.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Downtown Perks gives The Waterline a live intelligence layer. Curated, proximity-aware, and connected to the exact venues, events, and moments that make the address worth its premium.
            </p>
            <div className="p-6 rounded-lg bg-primary/5 border border-primary/20">
              <blockquote className="text-foreground font-medium italic leading-relaxed">
                "Living at The Waterline already tells you something about yourself. Downtown Perks makes sure your neighborhood reflects that."
              </blockquote>
            </div>
          </div>
          <div className="space-y-4">
            {[
              { icon: Crown, label: "Prestige positioning", desc: "The Waterline appears first on the premium map layer — anchoring the district." },
              { icon: Globe, label: "Neighborhood intelligence", desc: "Residents receive curated local context — not a generic city feed." },
              { icon: Eye, label: "Arrival experience", desc: "New residents step into a connected neighborhood on day one." },
              { icon: Star, label: "Exclusive access", desc: "Members-only events and first-to-know perks tied to residency." },
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

      {/* How they show up */}
      <BrandSection label="Integration" title="How The Waterline activates." className="bg-card/30 border-y border-border">
        <div className="grid md:grid-cols-2 gap-4">
          <FlowCard step="01" title="Flagship map anchor" desc="The Waterline appears at the highest tier — styled separately, with its own branded tile and resident count." delay={0} />
          <FlowCard step="02" title="Resident card activation" desc="Cards are pre-registered at lease signing. Residents activate on move-in day with a single scan." delay={0.1} />
          <FlowCard step="03" title="Curated local intelligence" desc="A private feed surface for Waterline residents — premium dining, wellness, fitness, and district events." delay={0.2} />
          <FlowCard step="04" title="Members-only event layer" desc="Rooftop socials, private dinners, fitness collabs — all surfaced exclusively to Waterline members first." delay={0.3} />
          <FlowCard step="05" title="Partner venue tie-ins" desc="Hotel Van Zandt, local wellness studios, and fine dining partners are pinned within the building's context radius." delay={0.4} />
          <FlowCard step="06" title="Leasing intelligence" desc="Prospective residents see the live neighborhood during tours. Retention data reported monthly to property management." delay={0.5} />
        </div>
      </BrandSection>

      {/* What they gain */}
      <BrandSection label="Value" title="What The Waterline earns.">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <SignalCard icon={<Crown className="w-5 h-5" />} label="Premium differentiation" sub="A digital amenity competitors don't have and can't easily replicate." delay={0} />
          <SignalCard icon={<Users className="w-5 h-5" />} label="Resident connection" sub="Community builds faster when there's a shared layer of local context." delay={0.1} />
          <SignalCard icon={<TrendingUp className="w-5 h-5" />} label="Renewal signal" sub="Residents who engage with the neighborhood layer re-sign at higher rates." delay={0.2} />
          <SignalCard icon={<Eye className="w-5 h-5" />} label="District visibility" sub="The Waterline name appears across the downtown map — beyond its own walls." delay={0.3} />
          <SignalCard icon={<Zap className="w-5 h-5" />} label="Day-one activation" sub="New residents arrive to a fully live neighborhood — no setup required." delay={0.4} />
          <SignalCard icon={<Star className="w-5 h-5" />} label="Leasing edge" sub="A compelling, demonstrable amenity story during tours and marketing." delay={0.5} />
        </div>
      </BrandSection>

      {/* Use cases */}
      <BrandSection label="Use Cases" title="What this looks like in practice." className="bg-card/30 border-y border-border">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          <UseCaseCard tag="Move-In" title="Day-one arrival package" detail="Waterline residents receive a digital welcome with their activated perks card — curated local list, first event RSVP, and a welcome perk from a partner venue." delay={0} />
          <UseCaseCard tag="Retention" title="Monthly neighborhood digest" detail="Automatic monthly snapshot sent to each resident — top events, new perks, usage summary. Zero property management effort." delay={0.1} />
          <UseCaseCard tag="Community" title="Resident-only rooftop activation" detail="The Waterline hosts a quarterly social. Downtown Perks distributes it on the district map — RSVP-gated, members-only, measurable attendance." delay={0.2} />
          <UseCaseCard tag="Discovery" title="Premium wellness pairing" detail="Residents who engage with fitness content get first access to cold plunge passes, yoga class credits, and recovery studio discounts nearby." delay={0.3} />
          <UseCaseCard tag="Leasing" title="Live map in the sales flow" detail="Leasing agents open the live map during the tour. Every nearby venue, event, and perk reinforces the 'location' conversation with proof." delay={0.4} />
        </div>
      </BrandSection>

      {/* Metrics */}
      <BrandSection label="Outcomes" title="Numbers that hold.">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SignalCard value="74%" label="Resident activation" sub="Cards activated within 30 days of move-in at partner buildings" delay={0} />
          <SignalCard value="2.8×" label="Event attendance" sub="vs. buildings without a curated event layer" delay={0.1} />
          <SignalCard value="Day 1" label="Live activation" sub="Residents are connected from the moment they arrive" delay={0.2} />
          <SignalCard value="+19%" label="Lease renewal" sub="Resident re-sign rate lift among active members" delay={0.3} />
        </div>
      </BrandSection>

      <BrandCTA
        headline="The Waterline deserves a live neighborhood. Let's build it."
        sub="90-day pilot. No cost. Full resident activation included."
        ctaLabel="Start the Conversation"
        ctaHref="mailto:partners@downtownperks.com"
      />
    </div>
  );
}