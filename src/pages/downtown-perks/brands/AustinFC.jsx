import { motion } from "framer-motion";
import { MapPin, Users, TrendingUp, QrCode, Trophy, Volume2 } from "lucide-react";
import BrandHero from "../../../components/downtown-perks/brands/BrandHero";
import { BrandSection, SignalCard, FlowCard, UseCaseCard, BrandCTA } from "../../../components/downtown-perks/brands/BrandSection";
import { NotificationDemoPanel } from "../../../components/downtown-perks/brands/DemoPanel";

const demo = (
  <div className="grid md:grid-cols-2 gap-5">
    <NotificationDemoPanel
      items={[
        { title: "Austin FC — match day tonight 7:30pm", sub: "Q2 Stadium · Members early-entry via card" },
        { title: "Pre-match district energy — open now", sub: "6th Street + Rainey · 5pm onward" },
        { title: "Post-match at Bangers — members discount", sub: "Tonight only · Show your card at the door" },
      ]}
    />
    <div className="rounded-lg border border-border bg-card p-7">
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-5">Match Day District Flow</div>
      <div className="space-y-4">
        {[
          { step: "01", label: "Pre-match: member meetup", sub: "District bar takeover — members gather at Bangers" },
          { step: "02", label: "Early entry via perks card", sub: "Members scan at stadium gate — skip the line" },
          { step: "03", label: "Post-match: late night map", sub: "Active venues surface in real time after the whistle" },
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

export default function AustinFC() {
  return (
    <div className="min-h-screen bg-background">
      <BrandHero
        eyebrow="Civic & Sport · Q2 Stadium · Austin"
        headline={<>Match day should move<br /><span className="text-primary">the whole district.</span></>}
        support="Austin FC activations that spread from Q2 Stadium through the downtown map — pre-match energy, members-first entry, and a post-match district that stays lit."
        ctaLabel="Activate the District"
        ctaHref="mailto:partners@downtownperks.com"
        demoPanel={demo}
        bgAccent="from-primary/8"
      />

      <BrandSection label="The Fit" title="The most powerful recurring event in Austin is already here.">
        <div className="grid md:grid-cols-2 gap-10">
          <div className="space-y-5">
            <p className="text-muted-foreground leading-relaxed">
              Austin FC match days don't just fill the stadium — they move the city. Residents pre-game in the district, post-game even harder, and spend the 48 hours before a match looking for local spots to build the moment.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Downtown Perks is the connective layer that maps that energy. Match day content, pre-game district recommendations, partner venue activation, and post-match late-night surfacing — all tied to the member feed.
            </p>
          </div>
          <div className="space-y-4">
            {[
              { label: "District energy amplification", desc: "Match day doesn't stop at the gate. Downtown Perks extends it to every bar, restaurant, and rooftop nearby." },
              { label: "Residents already there", desc: "Downtown residents are Austin FC's most walkable audience. They don't need a ride — they need a reason." },
              { label: "Recurring activation surface", desc: "Every home match is a new activation. 17+ home games per season." },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                <div>
                  <div className="font-semibold text-[13px] mb-0.5">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </BrandSection>

      <BrandSection label="Activation" title="How match day works with Downtown Perks." className="bg-card/30 border-y border-border">
        <div className="grid md:grid-cols-2 gap-4">
          <FlowCard step="01" title="Match day event listing" desc="Every home match appears in the member event feed. Date, time, key info, and linked partner venues." delay={0} />
          <FlowCard step="02" title="Pre-match district map" desc="Hours before kickoff, the map highlights the active pre-match district — bars, restaurants, rooftops." delay={0.1} />
          <FlowCard step="03" title="Members-first entry" desc="Downtown Perks members get an early-entry window via their card — scannable at the gate, trackable." delay={0.2} />
          <FlowCard step="04" title="Partner venue co-activation" desc="Bangers, The Stay Put, and other partners run match-day-specific perks — surfaced only to members on game day." delay={0.3} />
          <FlowCard step="05" title="Post-match late night map" desc="After the final whistle, the map updates in real time. Active venues, open bars, member offers — all live." delay={0.4} />
          <FlowCard step="06" title="Season campaign surface" desc="Austin FC can distribute season ticket offers, merchandise moments, and club events through the member feed year-round." delay={0.5} />
        </div>
      </BrandSection>

      <BrandSection label="Value" title="What this activation delivers.">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <SignalCard icon={<Trophy className="w-5 h-5" />} label="District energy ownership" sub="Match day becomes a full-district event, not just a stadium event." delay={0} />
          <SignalCard icon={<Users className="w-5 h-5" />} label="Walkable audience" sub="Downtown residents are the highest-proximity, lowest-barrier Austin FC audience." delay={0.1} />
          <SignalCard icon={<Volume2 className="w-5 h-5" />} label="Recurring reach" sub="17+ home matches. 17+ activations. Built-in calendar presence." delay={0.2} />
          <SignalCard icon={<MapPin className="w-5 h-5" />} label="District map presence" sub="Austin FC mapped alongside partner venues — visible before, during, and after every match." delay={0.3} />
          <SignalCard icon={<QrCode className="w-5 h-5" />} label="Entry-linked engagement" sub="Members who use early-entry flow are trackable, re-engageable all season." delay={0.4} />
          <SignalCard icon={<TrendingUp className="w-5 h-5" />} label="Partner lift" sub="District venues see measurable foot traffic on match days via Downtown Perks distribution." delay={0.5} />
        </div>
      </BrandSection>

      <BrandSection label="Use Cases" title="Match day, season-long." className="bg-card/30 border-y border-border">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          <UseCaseCard tag="Pre-Match" title="District bar takeover" detail="2 hours before kickoff, Bangers and 2 partner venues activate member-exclusive pre-match deals. Members see them in the feed on their walk over." delay={0} />
          <UseCaseCard tag="Entry" title="Members-first gate flow" detail="Downtown Perks members scan a QR at the gate — priority lane, measured attendance, and a post-match offer waiting on the other side." delay={0.1} />
          <UseCaseCard tag="Post-Match" title="Late night district map" detail="90 minutes after the final whistle, the map highlights what's still alive — venues, music, rooftops. Members get targeted push with the closest active spot." delay={0.2} />
          <UseCaseCard tag="Season" title="Ticket offer in the feed" detail="Austin FC distributes season ticket offers and match pack deals through the member feed at the right moment — tied to engagement patterns." delay={0.3} />
          <UseCaseCard tag="Community" title="Building watch party" detail="The Waterline hosts a match watch party in the lobby. Austin FC co-brands it. Downtown Perks distributes it to all members in the building's proximity." delay={0.4} />
        </div>
      </BrandSection>

      <BrandSection label="Proof" title="What the season looks like.">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SignalCard value="17+" label="Home matches" sub="Recurring activation surfaces every season" delay={0} />
          <SignalCard value="3,400+" label="Members reachable" sub="Downtown residents within the district" delay={0.1} />
          <SignalCard value="Match day" label="Peak engagement" sub="Highest member activity days align with Austin FC schedule" delay={0.2} />
          <SignalCard value="Full loop" label="Pre to post-match" sub="Activation covers the entire match-day arc" delay={0.3} />
        </div>
      </BrandSection>

      <BrandCTA
        headline="Move the district on match day."
        sub="From Q2 Stadium to every bar on 6th — fully connected, member-led."
        ctaLabel="Activate the District"
        ctaHref="mailto:partners@downtownperks.com"
      />
    </div>
  );
}