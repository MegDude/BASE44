import { motion } from "framer-motion";
import { Building2, Glasses, Hotel, MapPin, QrCode, Route, Trees, Users } from "lucide-react";
import BrandHero from "../../../components/downtown-perks/brands/BrandHero";
import { BrandSection, SignalCard, FlowCard, UseCaseCard, BrandCTA } from "../../../components/downtown-perks/brands/BrandSection";
import { MapDemoPanel, QRDemoPanel } from "../../../components/downtown-perks/brands/DemoPanel";
import CampaignConcept from "../../../components/campaign/CampaignConcept";

const demo = (
  <div className="grid gap-5 md:grid-cols-2">
    <MapDemoPanel
      venueName="Fine Eyewear civic campaign"
      tag="DANA + Waterloo + resident buildings + hotel referrals"
      nearbyItems={["The Shore", "Hotel Van Zandt", "Waterloo Greenway"]}
    />
    <QRDemoPanel
      headline="Local Lens Rate"
      sub="Scan from a building welcome insert, DANA event, or walking-map touchpoint to unlock the resident rate and book a fitting."
      action="Unlock the resident rate"
    />
  </div>
);

export default function FineEyewear() {
  return (
    <div className="min-h-screen bg-background">
      <BrandHero
        eyebrow="Neighborhood Wellness Campaign · Civic Distribution"
        headline={
          <>
            Fine Eyewear should feel
            <br />
            <span className="text-primary">like downtown utility, not an ad.</span>
          </>
        }
        support="This campaign uses DANA, Waterloo Greenway, member buildings, hotel referrals, and the walking map to put Fine Eyewear into trusted downtown touchpoints. The goal is qualified local discovery, clean attribution, and a lead flow that starts with neighborhood usefulness."
        ctaLabel="Plan the Fine Eyewear pilot"
        ctaHref="mailto:partners@downtownperks.com"
        demoPanel={demo}
      />

      <BrandSection label="The Fit" title="The strongest Fine Eyewear campaign is community-first.">
        <div className="grid gap-10 md:grid-cols-2">
          <div className="space-y-5">
            <p className="text-muted-foreground leading-relaxed">
              The source material is clear: Fine Eyewear performs best when it is introduced through trusted resident channels, not generic awareness media. DANA is the credibility layer. Waterloo is the public-space kickoff. The walking map is the everyday utility surface.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              That changes the message from “here is a store” to “here is a downtown service that makes everyday life easier.” Sunlight, walkability, trail usage, hotel crossover, and new-resident onboarding all make eyewear relevant without forcing the brand into hard-sell mode.
            </p>
          </div>
          <div className="space-y-4">
            {[
              { icon: Users, label: "Trusted audience path", desc: "DANA, building teams, and resident channels create warmer starts than cold retail traffic." },
              { icon: Trees, label: "Waterloo kickoff", desc: "The campaign opens in public space where wellness, outdoor activity, and visibility naturally belong." },
              { icon: Route, label: "Walking-map utility", desc: "Fine Eyewear is plotted as part of how downtown residents move through sunlight, trails, brunch, and events." },
              { icon: Hotel, label: "Hotel crossover", desc: "Van Zandt and nearby hospitality partners extend the same program to travelers and concierge referrals." },
            ].map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: 18 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                className="flex items-start gap-4 rounded-xl border border-border bg-card p-5"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <item.icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">{item.label}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{item.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </BrandSection>

      <CampaignConcept
        name="Fine Eyewear × Downtown Utility Layer"
        objective="Turn Fine Eyewear into a trusted downtown wellness and style touchpoint through civic channels, resident buildings, hotel referrals, and map-based discovery."
        audience="DANA residents, Rainey and Legends building residents, Waterloo event-goers, concierge referrals, and style-conscious downtown professionals."
        offer="Local Lens Rate, first frame-fitting incentive, QR-led appointment request, and neighborhood-specific style or sun-protection prompts."
        placements={[
          "Waterloo Greenway kickoff and public-space QR touchpoints",
          "DANA building inserts and resident welcome materials",
          "Walking-map shade spots and nearby wellness prompts",
          "Hotel Van Zandt and hospitality concierge referrals",
          "Monthly DANA or neighborhood event presence",
        ]}
        keyMetrics={[
          { label: "Lead source", value: "Building, event, hotel, or map touchpoint" },
          { label: "Intent signal", value: "Scan, save, CTA start, booking request" },
          { label: "Program", value: "Local Lens Rate" },
          { label: "Capture", value: "Google Sheets-ready until CRM is live" },
        ]}
      />

      <BrandSection label="Activation Structure" title="How the Fine Eyewear campaign actually works." className="bg-card/30 border-y border-border">
        <div className="grid gap-4 md:grid-cols-2">
          <FlowCard step="01" title="Plot Fine Eyewear into the shared map" desc="The brand appears in the resident map as a wellness and style touchpoint tied to sunlight, trails, brunch, hotels, and walkable downtown routines." delay={0} />
          <FlowCard step="02" title="Open with Waterloo and DANA" desc="The first campaign moment lives in civic space and resident channels, so the introduction feels trusted instead of bought." delay={0.1} />
          <FlowCard step="03" title="Distribute through buildings" desc="Legends and Rainey towers receive welcome-kit inserts, lobby QR prompts, and resident-specific calls to action." delay={0.2} />
          <FlowCard step="04" title="Extend through hotels" desc="Van Zandt and nearby hospitality partners can route concierge referrals and guest-facing wellness prompts into the same campaign." delay={0.3} />
          <FlowCard step="05" title="Capture intent cleanly" desc="Each QR or CTA routes into one lightweight booking and offer flow. Google Sheets can hold source, building, event, and contact intent until the CRM layer is ready." delay={0.4} />
          <FlowCard step="06" title="Read the lead by source" desc="The partner sees whether Waterloo, DANA, hotel, or building placement is driving the strongest local response and can rebalance the campaign fast." delay={0.5} />
        </div>
      </BrandSection>

      <BrandSection label="Map Touchpoints" title="Where Fine Eyewear shows up on the map.">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <UseCaseCard tag="Waterloo" title="Shade Spot activation" detail="A walking-map touchpoint around Waterloo Greenway links sun exposure, outdoor movement, and resident eyewear utility in one clear moment." delay={0} />
          <UseCaseCard tag="Buildings" title="New resident welcome path" detail="A QR in a building welcome packet sends residents into the Local Lens Rate instead of a cold retail landing page." delay={0.1} />
          <UseCaseCard tag="Hotels" title="Concierge crossover" detail="Van Zandt and nearby hospitality teams can point guests and residents into the same downtown service layer with trackable referrals." delay={0.2} />
          <UseCaseCard tag="DANA" title="Community event presence" detail="Monthly resident events become soft-touch awareness and capture moments that still feel like neighborhood participation." delay={0.3} />
          <UseCaseCard tag="Map" title="Nearby utility prompt" detail="When a resident asks what is useful nearby, Fine Eyewear can surface in the same answer layer as wellness, errands, and services." delay={0.4} />
        </div>
      </BrandSection>

      <BrandSection label="Value" title="What makes this a real lead engine.">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <SignalCard icon={<Glasses className="w-5 h-5" />} label="Qualified interest" sub="The entry point is contextual need, not random awareness." delay={0} />
          <SignalCard icon={<Building2 className="w-5 h-5" />} label="Building attribution" sub="Legends and Rainey towers can be measured separately." delay={0.1} />
          <SignalCard icon={<QrCode className="w-5 h-5" />} label="Low-friction capture" sub="Scan, save, or request an appointment in one step." delay={0.2} />
          <SignalCard icon={<MapPin className="w-5 h-5" />} label="Map-native relevance" sub="The brand lives inside the same downtown decision surface residents already use." delay={0.3} />
        </div>
      </BrandSection>

      <BrandCTA
        headline="Fine Eyewear should be found through trust, place, and timing."
        sub="Use DANA, Waterloo, buildings, hotels, and the map as one campaign system. Capture the source. Learn what converts. Keep the experience elegant."
        ctaLabel="Start the civic pilot"
        ctaHref="mailto:partners@downtownperks.com"
      />
    </div>
  );
}
