import { motion } from "framer-motion";
import { MapPin, Users, Star, TrendingUp, QrCode, Target, Layers, BarChart2 } from "lucide-react";
import BrandHero from "../../../components/downtown-perks/brands/BrandHero";
import { BrandSection, SignalCard, FlowCard, UseCaseCard, BrandCTA } from "../../../components/downtown-perks/brands/BrandSection";
import { QRDemoPanel } from "../../../components/downtown-perks/brands/DemoPanel";

const demo = (
  <div className="grid md:grid-cols-2 gap-5">
    <div className="rounded-lg border border-border bg-card p-7">
      <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-6">YETI × Downtown Perks</div>
      <div className="space-y-4">
        {[
          { event: "YETI Cold Gear Drop — Exclusive Preview", loc: "Downtown Austin · This Saturday" },
          { event: "Run Club x YETI Hydration Station", loc: "Lady Bird Lake Trail · 6am" },
          { event: "YETI x Live Music Late Night Pop-Up", loc: "6th Street District · Members Only" },
        ].map((e, i) => (
          <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-muted/40 border border-border/50">
            <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
            <div>
              <div className="text-[13px] font-medium">{e.event}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{e.loc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
    <QRDemoPanel
      headline="YETI × Downtown Perks"
      sub="Scan to claim your member activation — limited gear, exclusive access, and one night you'll actually talk about."
      action="Claim Member Access"
    />
  </div>
);

export default function Yeti() {
  return (
    <div className="min-h-screen bg-background">
      <BrandHero
        eyebrow="Austin Brand Campaign · Premium Activation"
        headline={<>YETI was built here.<br /><span className="text-primary">Downtown Perks keeps it here.</span></>}
        support="A flagship city-brand activation that puts YETI at the center of Austin's downtown culture — through event tie-ins, building placements, and QR-led product moments with measurable participation."
        ctaLabel="Design the Campaign"
        ctaHref="mailto:partners@downtownperks.com"
        demoPanel={demo}
        bgAccent="from-primary/10"
      />

      {/* Why they fit */}
      <BrandSection label="The Fit" title="YETI's city is Downtown Perks's city.">
        <div className="grid md:grid-cols-2 gap-10">
          <div className="space-y-5">
            <p className="text-muted-foreground leading-relaxed">
              YETI built its identity in Austin. Outdoor culture, local sport, post-run cold drinks, live music on a hot night. That's not a brand story — that's a lifestyle. And Downtown Perks is the layer that makes that lifestyle visible and actionable.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The overlap isn't incidental. YETI's customer is a downtown resident. They run the trail at 6am, meet at Barton Springs on Saturdays, and want to discover what's happening tonight. Downtown Perks is where that discovery happens.
            </p>
          </div>
          <div className="space-y-4">
            {[
              { icon: Target, label: "Exact audience match", desc: "Downtown residents are YETI's primary demo — active, high-income, local-first." },
              { icon: MapPin, label: "District-native placement", desc: "YETI activates where the culture is already live — not in an ad, on a map." },
              { icon: Layers, label: "Multi-surface campaign", desc: "Buildings, events, venue tie-ins, and QR activations all at once." },
              { icon: BarChart2, label: "Measurable participation", desc: "Every RSVP, scan, and redemption traced to the YETI campaign." },
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
      <BrandSection label="Campaign Structure" title="How YETI activates across Downtown Perks." className="bg-card/30 border-y border-border">
        <div className="grid md:grid-cols-2 gap-4">
          <FlowCard step="01" title="District map placement" desc="YETI activations appear on the live downtown map — events, pop-ups, and product moments pinned in real time." delay={0} />
          <FlowCard step="02" title="Building-level drops" desc="Campaign content drops into the member feed at The Waterline, The Paseo, and other partner buildings — targeted by proximity." delay={0.1} />
          <FlowCard step="03" title="Event co-activation" desc="Run clubs, yoga sessions, and fitness events get YETI-branded hydration placement — visible in the event listing." delay={0.2} />
          <FlowCard step="04" title="QR-led product moments" desc="At activations, QR codes unlock YETI exclusive offers for Downtown Perks members. Scan, claim, redeem." delay={0.3} />
          <FlowCard step="05" title="Live music tie-ins" desc="YETI and live music events pair naturally. Members who attend music events see YETI cool gear moments in-feed." delay={0.4} />
          <FlowCard step="06" title="Campaign dashboard" desc="YETI sees total reach, event attendance, QR activations, and member engagement — for every campaign iteration." delay={0.5} />
        </div>
      </BrandSection>

      {/* What they gain */}
      <BrandSection label="Value" title="What YETI gets from Downtown Perks.">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <SignalCard icon={<Star className="w-5 h-5" />} label="Local identity amplification" sub="YETI's Austin roots become an active campaign, not background brand lore." delay={0} />
          <SignalCard icon={<MapPin className="w-5 h-5" />} label="District presence" sub="Pinned on the map, in the feeds, at the events. Always visible in context." delay={0.1} />
          <SignalCard icon={<Users className="w-5 h-5" />} label="High-value audience" sub="Downtown residents: active, high-income, outdoor-curious, brand-aware." delay={0.2} />
          <SignalCard icon={<QrCode className="w-5 h-5" />} label="QR-led product conversion" sub="Activations drive physical engagement — not impressions, but people showing up." delay={0.3} />
          <SignalCard icon={<BarChart2 className="w-5 h-5" />} label="Measurable participation" sub="Every campaign element tracked. Attendance, scans, redemptions, re-engagement." delay={0.4} />
          <SignalCard icon={<TrendingUp className="w-5 h-5" />} label="Earned media lift" sub="Residents who experience YETI in their neighborhood share it — not as an ad." delay={0.5} />
        </div>
      </BrandSection>

      {/* Use cases */}
      <BrandSection label="Campaign Examples" title="Five activations YETI can run with Downtown Perks." className="bg-card/30 border-y border-border">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          <UseCaseCard tag="Flagship Drop" title="Limited gear preview for members" detail="YETI announces an exclusive gear preview to Downtown Perks members only. Invited via their card. Attendance capped. Product stories emerge from there." delay={0} />
          <UseCaseCard tag="Run Club Tie-In" title="YETI hydration station on trail" detail="Saturday morning run club departs the lobby of The Waterline. YETI-branded hydration station at the midpoint. Scan at station for exclusive offer." delay={0.1} />
          <UseCaseCard tag="Live Music" title="YETI × late night at Bangers" detail="YETI co-hosts a live music night. Member-only early entry. Custom cooler setup. Perk unlocked via member card scan at the door." delay={0.2} />
          <UseCaseCard tag="Seasonal Campaign" title="Summer cold chain moment" detail="YETI launches a summer campaign in the member event feed — tied to pool season, lake days, and outdoor activity. QR-led offer unlocked by local behavior." delay={0.3} />
          <UseCaseCard tag="Building Placement" title="Lobby-to-product moment" detail="YETI product display placed in The Waterline lobby. Residents scan to learn more or claim offer. Building-native product discovery." delay={0.4} />
        </div>
      </BrandSection>

      {/* Metrics */}
      <BrandSection label="Proof" title="What campaign performance looks like.">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SignalCard value="3,400+" label="Member reach" sub="Downtown residents in YETI's exact demo" delay={0} />
          <SignalCard value="38%" label="Event attendance rate" sub="Members who RSVP and actually show up" delay={0.1} />
          <SignalCard value="QR live" label="Product activation" sub="Measurable scan-to-offer conversion at every moment" delay={0.2} />
          <SignalCard value="0 waste" label="No impression inventory" sub="Every touchpoint is a behavior, not a view" delay={0.3} />
        </div>
      </BrandSection>

      <BrandCTA
        headline="YETI's next Austin campaign starts here."
        sub="Not a sponsorship. A real city activation. Let's design it."
        ctaLabel="Let's Design the Campaign"
        ctaHref="mailto:partners@downtownperks.com"
      />
    </div>
  );
}