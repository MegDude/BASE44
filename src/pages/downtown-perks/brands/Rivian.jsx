import { motion } from "framer-motion";
import { MapPin, Users, Zap, Target, Car, BarChart2, Navigation } from "lucide-react";
import BrandHero from "../../../components/downtown-perks/brands/BrandHero";
import { BrandSection, SignalCard, FlowCard, UseCaseCard, BrandCTA } from "../../../components/downtown-perks/brands/BrandSection";
import { NotificationDemoPanel } from "../../../components/downtown-perks/brands/DemoPanel";

const demo = (
  <div className="grid md:grid-cols-2 gap-5">
    <NotificationDemoPanel
      items={[
        { title: "Rivian Test Drive — Reserve your spot", sub: "The Waterline · This Weekend · Members First" },
        { title: "Rivian × Run Club departs at 6am", sub: "Lady Bird Lake · Gear provided · 0 emissions" },
        { title: "Exclusive: Rivian downtown pop-up", sub: "Saturday · 2nd Street District · RSVP via card" },
      ]}
    />
    <div className="rounded-lg border border-border bg-card p-7">
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-5">Rivian Activation Flow</div>
      <div className="space-y-4">
        {[
          { step: "01", label: "Discovery in member feed", sub: "Activation surfaces to members by building" },
          { step: "02", label: "RSVP via perks card", sub: "Tap to reserve. No friction." },
          { step: "03", label: "Experience on arrival", sub: "QR confirms. Event begins." },
          { step: "04", label: "Post-event follow-up", sub: "Rivian tracks engagement per member tier" },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-primary font-heading font-bold text-xs">{s.step}</span>
            </div>
            <div>
              <div className="text-[13px] font-medium">{s.label}</div>
              <div className="text-xs text-muted-foreground">{s.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default function Rivian() {
  return (
    <div className="min-h-screen bg-background">
      <BrandHero
        eyebrow="Mobility & Experiential · Downtown Austin"
        headline={<>Rivian moves people.<br /><span className="text-primary">Downtown Perks moves them closer.</span></>}
        support="Downtown placement, building-level activation, and event-tied RSVP flows that turn curious downtown residents into high-intent Rivian experiences — measurable and behavior-led."
        ctaLabel="Design the Activation"
        ctaHref="mailto:partners@downtownperks.com"
        demoPanel={demo}
        bgAccent="from-primary/8"
      />

      {/* Why they fit */}
      <BrandSection label="The Fit" title="Rivian's buyer lives downtown.">
        <div className="grid md:grid-cols-2 gap-10">
          <div className="space-y-5">
            <p className="text-muted-foreground leading-relaxed">
              Rivian's audience is active, values-driven, and local. They run trails, care about where they live, and make considered purchase decisions. That describes every Downtown Perks member in Austin's residential core.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Traditional auto marketing reaches the right demo in the wrong context. Downtown Perks puts Rivian in the moment — at the trail, at the event, at the building entrance — where behavior already aligns with the product.
            </p>
          </div>
          <div className="space-y-4">
            {[
              { icon: Target, label: "High-intent audience", desc: "Downtown residents: active lifestyle, high income, values-aligned. Rivian's exact buyer." },
              { icon: Navigation, label: "Mobility meets discovery", desc: "Rivian is about going places. Downtown Perks is about discovering them." },
              { icon: Car, label: "Experiential over transactional", desc: "Test drives, pop-ups, and events replace dealership pressure with genuine enthusiasm." },
              { icon: BarChart2, label: "Behavior-led measurement", desc: "Every RSVP, event attendance, and QR scan tied back to Rivian campaign metrics." },
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
      <BrandSection label="Activation Structure" title="How Rivian shows up in the system." className="bg-card/30 border-y border-border">
        <div className="grid md:grid-cols-2 gap-4">
          <FlowCard step="01" title="Downtown map placement" desc="Rivian activations — test drives, events, pop-ups — appear as live map pins in the district." delay={0} />
          <FlowCard step="02" title="Building-level distribution" desc="Campaign surfaces in the feeds of residents at The Waterline, The Paseo, and partner buildings — targeted by proximity and lifestyle signals." delay={0.1} />
          <FlowCard step="03" title="RSVP-gated test drives" desc="Members reserve test drive slots through their perks card. Intent is confirmed before the experience begins." delay={0.2} />
          <FlowCard step="04" title="Event tie-ins" desc="Rivian co-activates with run clubs, fitness events, and outdoor moments — where the overlap with product values is organic." delay={0.3} />
          <FlowCard step="05" title="QR at the moment" desc="Pop-up placements include QR codes that unlock member-exclusive Rivian experiences, content, or reservation flows." delay={0.4} />
          <FlowCard step="06" title="Post-event tracking" desc="Rivian receives engagement data per activation: attendees, card scans, RSVPs, and post-event intent signals." delay={0.5} />
        </div>
      </BrandSection>

      {/* What they gain */}
      <BrandSection label="Value" title="What Rivian gets from this.">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <SignalCard icon={<Target className="w-5 h-5" />} label="Exact demographic reach" sub="Downtown residents who match Rivian's buyer profile, in context." delay={0} />
          <SignalCard icon={<Car className="w-5 h-5" />} label="Experiential conversion" sub="Test drive RSVPs from people who already live the lifestyle." delay={0.1} />
          <SignalCard icon={<MapPin className="w-5 h-5" />} label="Downtown presence" sub="Rivian is visible where residents live, move, and make decisions." delay={0.2} />
          <SignalCard icon={<BarChart2 className="w-5 h-5" />} label="Behavior-led data" sub="Every engagement is a behavior, not an impression." delay={0.3} />
          <SignalCard icon={<Users className="w-5 h-5" />} label="Community authenticity" sub="No paid placement feel. Rivian shows up because it belongs in the district." delay={0.4} />
          <SignalCard icon={<Zap className="w-5 h-5" />} label="Campaign agility" sub="Activations can be deployed, modified, and measured in real time." delay={0.5} />
        </div>
      </BrandSection>

      {/* Use cases */}
      <BrandSection label="Campaign Examples" title="Five activations Rivian can run." className="bg-card/30 border-y border-border">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          <UseCaseCard tag="Test Drive" title="Building-adjacent test drive weekend" detail="Rivian parks outside The Waterline Saturday morning. Members RSVP'd through their card. 30-minute slot. Test drive leads to genuine interest — no dealership context." delay={0} />
          <UseCaseCard tag="Run Club" title="Rivian × trail event co-activation" detail="Rivian sponsors a Saturday morning run club. Gear and hydration at the trailhead. QR unlock for members. Product in the moment it belongs." delay={0.1} />
          <UseCaseCard tag="Pop-Up" title="2nd Street district pop-up" detail="Rivian activates in the 2nd Street district for a weekend. Map pin drives foot traffic. Members get exclusive access before general walk-in." delay={0.2} />
          <UseCaseCard tag="Incentive" title="RSVP-linked offer" detail="Members who RSVP to a Rivian event through their card receive an exclusive incentive — extended test drive, merchandise, or referral credit." delay={0.3} />
          <UseCaseCard tag="Discovery" title="Apartment lobby presence" detail="Rivian branded content and QR at The Paseo lobby. Residents scan while coming and going. Intent surfaces naturally over time." delay={0.4} />
        </div>
      </BrandSection>

      {/* Metrics */}
      <BrandSection label="Proof" title="What performance looks like.">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SignalCard value="3,400+" label="Reachable members" sub="Downtown residents matching Rivian's audience" delay={0} />
          <SignalCard value="41%" label="RSVP-to-attend rate" sub="Members who RSVP and show up to activations" delay={0.1} />
          <SignalCard value="Live" label="Real-time campaign" sub="Events, placements, and engagement tracked live" delay={0.2} />
          <SignalCard value="0 ads" label="Zero paid placement" sub="All distribution is through the resident trust layer" delay={0.3} />
        </div>
      </BrandSection>

      <BrandCTA
        headline="Rivian deserves an audience that's already moving."
        sub="Build the activation. Reserve the spot. Put the brand in context."
        ctaLabel="Start the Conversation"
        ctaHref="mailto:partners@downtownperks.com"
      />
    </div>
  );
}