import { motion } from "framer-motion";
import { Hotel, MapPin, QrCode, Shirt, Sparkles, Store, Users } from "lucide-react";
import BrandHero from "../../../components/downtown-perks/brands/BrandHero";
import { BrandSection, SignalCard, FlowCard, UseCaseCard, BrandCTA } from "../../../components/downtown-perks/brands/BrandSection";
import { MapDemoPanel, QRDemoPanel } from "../../../components/downtown-perks/brands/DemoPanel";
import CampaignConcept from "../../../components/campaign/CampaignConcept";

const demo = (
  <div className="grid gap-5 md:grid-cols-2">
    <MapDemoPanel
      venueName="Heritage Boots"
      tag="Hotel + building + event campaign example"
      nearbyItems={["Hotel Van Zandt", "The Shore", "Waterloo Park"]}
    />
    <QRDemoPanel
      headline="Boot Fit RSVP"
      sub="A guest or resident scans from a hotel, building, or event moment and reserves a fitting or in-store offer."
      action="Reserve the fitting"
    />
  </div>
);

export default function HeritageBoots() {
  return (
    <div className="min-h-screen bg-background">
      <BrandHero
        eyebrow="Retail Campaign Example · Austin Style"
        headline={
          <>
            Heritage Boots works best
            <br />
            <span className="text-primary">when style follows place.</span>
          </>
        }
        support="This example campaign shows how a local style retailer can use the Downtown Perks map, hotels, buildings, and events to turn district relevance into measurable visits without falling back on generic coupon traffic."
        ctaLabel="Use this campaign model"
        ctaHref="mailto:partners@downtownperks.com"
        demoPanel={demo}
      />

      <CampaignConcept
        name="Heritage Boots × District Style Trail"
        objective="Convert high-intent downtown foot traffic into fittings, event-day visits, and repeat local awareness through map-native placement."
        audience="Hotel guests wanting a local Austin stop, residents in Rainey and Congress towers, event-goers, and downtown professionals looking for locally grounded style."
        offer="Boot fit reservation, event-night styling offer, and hotel-to-store QR referral that preserves source attribution."
        placements={[
          "Hotel concierge and lobby QR prompts",
          "Resident building welcome and lifestyle inserts",
          "Map pins near music, nightlife, and event corridors",
          "Austin-style event moments around Waterloo and Congress",
        ]}
        keyMetrics={[
          { label: "Visit source", value: "Hotel, building, event, or map" },
          { label: "Primary action", value: "RSVP or fitting request" },
          { label: "Repeat signal", value: "Saved brand + return visit" },
          { label: "Proof", value: "Scan-to-visit conversion" },
        ]}
      />

      <BrandSection label="The Fit" title="This is how a local retail brand avoids wasted impressions.">
        <div className="grid gap-10 md:grid-cols-2">
          <div className="space-y-5">
            <p className="text-muted-foreground leading-relaxed">
              Heritage retail works when the context is right. A local style brand should show up around hotels, nightlife, events, and resident lifestyle moments where people are already primed to buy or browse with intent.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Downtown Perks gives that brand a better operating model: one map, one set of QR touchpoints, one event layer, and one attribution path back to the actual corridor, building, or venue that created the lead.
            </p>
          </div>
          <div className="space-y-4">
            {[
              { icon: Store, label: "Local-first positioning", desc: "The brand feels like a real downtown stop, not a promoted tile with no context." },
              { icon: Hotel, label: "Hotel crossover", desc: "Concierge referrals and guest prompts send high-intent visitors into the same system as residents." },
              { icon: Users, label: "Resident reuse", desc: "Saved places and repeat visits keep the brand in the resident loop after the first visit." },
              { icon: Shirt, label: "Event-night relevance", desc: "The campaign can flex around music, nightlife, gifting, and seasonal style moments." },
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

      <BrandSection label="Activation Structure" title="A simple retail flow that still measures cleanly." className="bg-card/30 border-y border-border">
        <div className="grid gap-4 md:grid-cols-2">
          <FlowCard step="01" title="Pin the brand at the right corridors" desc="The map plots Heritage Boots near hotel, nightlife, and event touchpoints where style-led traffic is already active." delay={0} />
          <FlowCard step="02" title="Use QR at real-world moments" desc="Hotel desks, building kits, event tables, and in-venue signage all point back to one reservation or offer flow." delay={0.1} />
          <FlowCard step="03" title="Surface the right reason to go" desc="Tonight's live music, a local gifting need, or a visitor looking for Austin-specific retail becomes the trigger." delay={0.2} />
          <FlowCard step="04" title="Capture source without adding friction" desc="The guest or resident books, saves, or scans once. Source can stay lightweight and flow into Google Sheets until the CRM is live." delay={0.3} />
          <FlowCard step="05" title="Read what really drove the visit" desc="The brand sees whether the strongest lift came from a hotel, building, event night, or district pin." delay={0.4} />
          <FlowCard step="06" title="Repeat the best-performing pattern" desc="The next campaign leans into the corridor and context that actually created visits, not the one that looked good on paper." delay={0.5} />
        </div>
      </BrandSection>

      <BrandSection label="Use Cases" title="Four ways the campaign can run.">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <UseCaseCard tag="Hotel" title="Van Zandt guest referral" detail="A guest scans a local-style recommendation from the lobby and reserves a same-day fitting or offer." delay={0} />
          <UseCaseCard tag="Residents" title="Rainey welcome loop" detail="A new resident gets a local style prompt inside a building welcome flow and saves Heritage Boots for the weekend." delay={0.1} />
          <UseCaseCard tag="Events" title="Music-night crossover" detail="Before a show or partner venue visit, the map surfaces Heritage Boots as a nearby stop with a clear reason to go." delay={0.2} />
          <UseCaseCard tag="Seasonal" title="Austin gifting window" detail="Holiday or event-season gifting prompts can turn district traffic into measurable retail visits." delay={0.3} />
        </div>
      </BrandSection>

      <BrandSection label="Value" title="What the retail operator gets.">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <SignalCard icon={<MapPin className="w-5 h-5" />} label="District context" sub="Pins appear where nearby intent already exists." delay={0} />
          <SignalCard icon={<QrCode className="w-5 h-5" />} label="Simple capture" sub="QR-driven reservation or save flow without a heavy funnel." delay={0.1} />
          <SignalCard icon={<Sparkles className="w-5 h-5" />} label="Brand fit" sub="The campaign feels local and premium instead of discount-led." delay={0.2} />
          <SignalCard icon={<Users className="w-5 h-5" />} label="Repeatable proof" sub="Visits can be attributed back to source, place, and timing." delay={0.3} />
        </div>
      </BrandSection>

      <BrandCTA
        headline="Use Heritage Boots as the template for local retail activations."
        sub="Put the brand at the right downtown touchpoints, keep the conversion path short, and measure which real-world placements actually move people."
        ctaLabel="Plan a retail pilot"
        ctaHref="mailto:partners@downtownperks.com"
      />
    </div>
  );
}
