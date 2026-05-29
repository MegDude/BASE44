import { motion } from "framer-motion";
import { MapPin, Users, Zap, Building2, Star, TrendingUp } from "lucide-react";
import BrandHero from "../../../components/downtown-perks/brands/BrandHero";
import { BrandSection, SignalCard, FlowCard, UseCaseCard, BrandCTA } from "../../../components/downtown-perks/brands/BrandSection";
import { MapDemoPanel } from "../../../components/downtown-perks/brands/DemoPanel";

const demo = (
  <MapDemoPanel
    venueName="The Paseo"
    tag="Mixed-use lifestyle property · Downtown Austin"
    nearbyItems={["Equinox", "Local Café", "Yoga Studio"]}
  />
);

export default function ThePaseo() {
  return (
    <div className="min-h-screen bg-background">
      <BrandHero
        eyebrow="Mixed-Use Property · Downtown Austin"
        headline={<>The Paseo runs on what's<br /><span className="text-primary">right outside your door.</span></>}
        support="Downtown Perks gives The Paseo's residents and guests a live layer of everything walkable, bookable, and happening — making the property more useful every single day."
        ctaLabel="Partner With Downtown Perks"
        ctaHref="mailto:partners@downtownperks.com"
        demoPanel={demo}
        bgAccent="from-primary/8"
      />

      {/* Why they fit */}
      <BrandSection label="The Fit" title="Mixed-use was made for this.">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-5">
            <p className="text-muted-foreground leading-relaxed">
              The Paseo isn't just an address — it's a lifestyle proposition built around walkable Austin. But the promise of walkability only lands when residents actually know what's around them, what's happening tonight, and where to go.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Downtown Perks closes that gap. A live neighborhood layer that surfaces nearby venues, real-time events, and exclusive offers — all tied to The Paseo's resident community.
            </p>
          </div>
          <div className="space-y-4">
            {[
              { label: "Walkable context", desc: "Residents see what's within 5 minutes — filtered, curated, live." },
              { label: "Community signal", desc: "Events and offers surface through the building's identity, not a generic app." },
              { label: "Property value", desc: "The digital layer becomes part of what makes living at The Paseo different." },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border"
              >
                <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                <div>
                  <div className="font-semibold text-[13px] text-foreground mb-0.5">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </BrandSection>

      {/* How they show up */}
      <BrandSection label="Activation" title="How The Paseo shows up." className="bg-card/30 border-y border-border">
        <div className="grid md:grid-cols-2 gap-4">
          <FlowCard step="01" title="Map placement" desc="The Paseo anchors the downtown map. Nearby venues, events, and perks radiate out from the property." delay={0} />
          <FlowCard step="02" title="Building-linked discovery" desc="Resident cards are tagged to The Paseo. Perks and events surface contextually — at the right time, in the right radius." delay={0.1} />
          <FlowCard step="03" title="QR activation at entry" desc="Lobby and elevator placements drive card scans. New residents activate in under 60 seconds." delay={0.2} />
          <FlowCard step="04" title="Neighborhood event feed" desc="The Paseo residents see a curated event calendar — fitness, dining, social — tied to what's walkable from their building." delay={0.3} />
          <FlowCard step="05" title="Business partner tie-ins" desc="Ground-floor or nearby tenants get featured placement — connecting commerce to community." delay={0.4} />
          <FlowCard step="06" title="Campaign surfaces" desc="Seasonal activations, new business openings, and building milestones can all appear as featured moments." delay={0.5} />
        </div>
      </BrandSection>

      {/* What they gain */}
      <BrandSection label="Value" title="What The Paseo gets.">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <SignalCard icon={<Star className="w-5 h-5" />} label="Resident retention signal" sub="Digital amenity that makes staying more compelling." delay={0} />
          <SignalCard icon={<Users className="w-5 h-5" />} label="Community lift" sub="Residents who feel connected to the neighborhood re-lease." delay={0.1} />
          <SignalCard icon={<MapPin className="w-5 h-5" />} label="District presence" sub="The Paseo appears in every relevant nearby search." delay={0.2} />
          <SignalCard icon={<TrendingUp className="w-5 h-5" />} label="Measurable engagement" sub="Card activations, event RSVPs, and perk redemptions tracked per building." delay={0.3} />
          <SignalCard icon={<Zap className="w-5 h-5" />} label="Real-time visibility" sub="Live events and perks surface to residents without any manual effort." delay={0.4} />
          <SignalCard icon={<Building2 className="w-5 h-5" />} label="Tenant draw" sub="Prospective residents see a live neighborhood — not a static description." delay={0.5} />
        </div>
      </BrandSection>

      {/* Use cases */}
      <BrandSection label="Use Cases" title="Five things The Paseo does with Downtown Perks." className="bg-card/30 border-y border-border">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          <UseCaseCard tag="Resident Activation" title="Move-in welcome flow" detail="New residents scan a QR in the welcome packet. Their card activates in 30 seconds. First neighborhood recommendations appear immediately." delay={0} />
          <UseCaseCard tag="Discovery" title="Weekend itinerary surfacing" detail="Friday afternoon, The Paseo residents see a curated weekend list — yoga, brunch, live music — all within a 6-minute walk." delay={0.1} />
          <UseCaseCard tag="Tenant Benefit" title="Ground-floor partner perks" detail="Ground-level tenants or nearby partners get priority placement in the resident feed — building community and driving foot traffic." delay={0.2} />
          <UseCaseCard tag="Event Activation" title="Building-hosted events on the live map" detail="A rooftop social or fitness pop-up at The Paseo appears in real time on the downtown event feed — visible to all nearby members." delay={0.3} />
          <UseCaseCard tag="Leasing" title="Digital amenity in the tour" detail="Leasing teams show the live map during property tours. Prospective residents see a connected, active neighborhood rather than a static sales pitch." delay={0.4} />
        </div>
      </BrandSection>

      {/* Metrics */}
      <BrandSection label="Proof" title="The signals that matter.">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SignalCard value="68%" label="Card activation" sub="Residents who activate within first 2 weeks" delay={0} />
          <SignalCard value="3.2×" label="Engagement lift" sub="vs. buildings without a digital layer" delay={0.1} />
          <SignalCard value="$0" label="Setup cost" sub="Zero upfront. Starts on a pilot basis." delay={0.2} />
          <SignalCard value="12min" label="Setup time" sub="Average building integration time" delay={0.3} />
        </div>
      </BrandSection>

      <BrandCTA
        headline="Let's put The Paseo on the map — for real."
        sub="Start with a 90-day pilot. No fee. Full activation for your residents."
        ctaLabel="Talk to the Team"
        ctaHref="mailto:partners@downtownperks.com"
      />
    </div>
  );
}