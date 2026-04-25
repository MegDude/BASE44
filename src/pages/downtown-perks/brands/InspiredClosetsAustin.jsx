import { motion } from "framer-motion";
import { Building2, Home, Layers, MapPin, Sparkles, Users, Zap } from "lucide-react";
import BrandHero from "../../../components/downtown-perks/brands/BrandHero";
import { BrandSection, SignalCard, FlowCard, UseCaseCard, BrandCTA } from "../../../components/downtown-perks/brands/BrandSection";
import { MapDemoPanel } from "../../../components/downtown-perks/brands/DemoPanel";

const demo = (
  <MapDemoPanel
    venueName="Inspired Closets Austin"
    tag="Residential services activation · Congress core"
    nearbyItems={["The Austonian", "The Shore", "The Bowie"]}
  />
);

export default function InspiredClosetsAustin() {
  return (
    <div className="min-h-screen bg-background">
      <BrandHero
        eyebrow="Residential Brand Partner · Home Utility Activation"
        headline={<>Inspired Closets Austin belongs<br /><span className="text-primary">inside the downtown residential layer.</span></>}
        support="The attached source confirms Inspired Closets Austin as a corporate sponsorship lead. Downtown Perks turns that relationship into a mapped residential brand surface across high-rise living, move-in moments, and home-upgrade intent."
        ctaLabel="Start a Brand Pilot"
        ctaHref="mailto:partners@downtownperks.com"
        demoPanel={demo}
        bgAccent="from-primary/7"
      />

      <BrandSection label="The Fit" title="Home utility is a strong downtown residential signal.">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-5">
            <p className="text-muted-foreground leading-relaxed">
              Inspired Closets Austin is not a random downtown brand. It aligns with the exact moments when residents care most about how their home works: move-in, renovation, organization, storage, and premium daily living.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The attached downtown building files point to the right context for that activation: towers like The Austonian, The Shore, The Bowie, and Fifth &amp; West where home-improvement and space-optimization messaging is far more relevant than generic advertising.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { label: "Residential relevance", desc: "Closet, storage, and home-organization offers fit the daily reality of downtown high-rise living." },
              { label: "Building-linked timing", desc: "The strongest moment is not broad awareness. It is move-in, reset, renovation, and premium-home planning." },
              { label: "Sponsor to utility layer", desc: "Corporate sponsorship becomes useful resident discovery instead of passive logo placement." },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: 18 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                className="flex items-start gap-4 rounded-xl border border-border bg-card p-4"
              >
                <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                <div>
                  <div className="text-sm font-semibold text-foreground">{item.label}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{item.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </BrandSection>

      <BrandSection label="Activation" title="How Inspired Closets Austin shows up in Downtown Perks." className="bg-card/30 border-y border-border">
        <div className="grid gap-4 md:grid-cols-2">
          <FlowCard step="01" title="Residential map placement" desc="The brand appears as a residential-services campaign layer tied to downtown buildings, not a random citywide ad." delay={0} />
          <FlowCard step="02" title="Building-linked prompts" desc="Move-in, upgrade, and home-reset moments surface in the right buildings at the right time." delay={0.1} />
          <FlowCard step="03" title="QR-led intake" desc="Lobby placements, welcome kits, and resident prompts route directly into one embedded CTA flow." delay={0.2} />
          <FlowCard step="04" title="Preference capture" desc="Residents can express room type, storage need, or project interest without leaving the product flow." delay={0.3} />
          <FlowCard step="05" title="Qualified handoff" desc="The brand gets a warmer, more contextual lead than a generic directory form or cold ad click." delay={0.4} />
          <FlowCard step="06" title="Performance tracking" desc="Scans, saves, CTA starts, building source, and repeat project interest become measurable." delay={0.5} />
        </div>
      </BrandSection>

      <BrandSection label="Value" title="What this brand layer does well.">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <SignalCard icon={<Home className="w-5 h-5" />} label="Home-upgrade intent" sub="Shows up when residents are already thinking about how their space works." delay={0} />
          <SignalCard icon={<Building2 className="w-5 h-5" />} label="Building-specific reach" sub="Anchored to real downtown residential towers instead of broad untargeted exposure." delay={0.1} />
          <SignalCard icon={<MapPin className="w-5 h-5" />} label="District context" sub="Placed inside the same downtown map where residents already decide what to do next." delay={0.2} />
          <SignalCard icon={<Users className="w-5 h-5" />} label="Qualified audience" sub="High-rise residents and homeowners are closer to the service than a generic local audience." delay={0.3} />
          <SignalCard icon={<Zap className="w-5 h-5" />} label="Embedded conversion" sub="CTA flows stay in-product with no forced redirection away from the experience." delay={0.4} />
          <SignalCard icon={<Sparkles className="w-5 h-5" />} label="Premium fit" sub="Home organization aligns naturally with premium residential positioning downtown." delay={0.5} />
        </div>
      </BrandSection>

      <BrandSection label="Use Cases" title="How this actually gets used." className="bg-card/30 border-y border-border">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <UseCaseCard tag="Move-In" title="Welcome-kit project prompt" detail="A new resident in The Bowie scans a QR from the move-in packet and starts a closet-planning request without leaving the resident journey." delay={0} />
          <UseCaseCard tag="Upgrade" title="Premium home reset campaign" detail="A downtown resident at The Austonian sees a timed brand prompt around organization, wardrobe storage, or office conversion during a seasonal reset moment." delay={0.1} />
          <UseCaseCard tag="Resident Services" title="Building amenity crossover" detail="Property teams can surface Inspired Closets Austin alongside other home-utility partners as part of a premium amenity story." delay={0.2} />
          <UseCaseCard tag="QR" title="Lobby activation" detail="A simple building placement converts curiosity into a qualified lead with building source and CTA completion tied back to the property." delay={0.3} />
          <UseCaseCard tag="Lifecycle" title="Post-purchase follow-up" detail="Residents who save the brand but do not submit immediately can be retargeted through the same downtown resident layer later." delay={0.4} />
        </div>
      </BrandSection>

      <BrandSection label="Proof" title="The signals that matter for a residential sponsor.">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <SignalCard value="Corporate" label="Source status" sub="Readable source confirms corporate sponsorship relationship" delay={0} />
          <SignalCard value="4+" label="Building anchors" sub="Austonian, Shore, Bowie, and Fifth & West in attached building context" delay={0.1} />
          <SignalCard value="Embedded" label="CTA model" sub="Lead capture can stay inside the resident and partner flow" delay={0.2} />
          <SignalCard value="Brand" label="Map role" sub="Residential activation anchor rather than generic storefront listing" delay={0.3} />
        </div>
      </BrandSection>

      <BrandCTA
        headline="Put Inspired Closets Austin where downtown residential intent already exists."
        sub="One mapped campaign layer, one embedded lead journey, and one clearer fit for premium home utility downtown."
        ctaLabel="Plan the activation"
        ctaHref="mailto:partners@downtownperks.com"
      />
    </div>
  );
}
