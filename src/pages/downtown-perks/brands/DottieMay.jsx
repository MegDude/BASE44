import { motion } from "framer-motion";
import { CalendarDays, MapPin, QrCode, Receipt, Users, Wine } from "lucide-react";
import BrandHero from "../../../components/downtown-perks/brands/BrandHero";
import { BrandSection, SignalCard, FlowCard, UseCaseCard, BrandCTA } from "../../../components/downtown-perks/brands/BrandSection";
import { NotificationDemoPanel, QRDemoPanel } from "../../../components/downtown-perks/brands/DemoPanel";

const demo = (
  <div className="grid gap-5 md:grid-cols-2">
    <NotificationDemoPanel
      items={[
        { title: "Dottie May tonight", sub: "Rainey launch dinner · Walkable now" },
        { title: "Priority seat release", sub: "Scan to unlock launch table access" },
        { title: "Member welcome pour", sub: "QR verifies the perk at the host stand" },
      ]}
    />
    <QRDemoPanel
      headline="Launch table access"
      sub="Residents and guests scan, unlock the perk, and step straight into the launch flow without app friction."
      action="Scan to enter"
    />
  </div>
);

export default function DottieMay() {
  return (
    <div className="min-h-screen bg-background">
      <BrandHero
        eyebrow="Launch Partner · Hospitality"
        headline={<>Dottie May launches better<br /><span className="text-primary">when discovery and redemption are one motion.</span></>}
        support="This launch model uses the live downtown map, QR entry, guest and resident distribution, and one simple redemption path to turn opening-week attention into measurable visits and repeat traffic."
        ctaLabel="Start the Dottie May launch"
        ctaHref="mailto:partners@downtownperks.com"
        demoPanel={demo}
      />

      <BrandSection label="What they get" title="What Dottie May gets from the launch layer.">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <SignalCard icon={<MapPin className="w-5 h-5" />} label="Live map visibility" sub="Pinned into the downtown decision surface from day one." delay={0} />
          <SignalCard icon={<QrCode className="w-5 h-5" />} label="QR entry and redemption" sub="One scan path from map or host stand into the perk and visit." delay={0.1} />
          <SignalCard icon={<Users className="w-5 h-5" />} label="Resident and guest reach" sub="Buildings and hotel partners distribute the opening offer." delay={0.2} />
          <SignalCard icon={<Receipt className="w-5 h-5" />} label="Proof of conversion" sub="Scans, visits, redemptions, and repeat use are measurable." delay={0.3} />
        </div>
      </BrandSection>

      <BrandSection label="How it works" title="How the launch actually runs." className="bg-card/30 border-y border-border">
        <div className="grid gap-4 md:grid-cols-2">
          <FlowCard step="01" title="Plot the venue before opening" desc="Dottie May goes live on the map before launch week with the opening offer, category, and route details attached." delay={0} />
          <FlowCard step="02" title="Distribute the opening perk" desc="Residents, guests, and nearby users see the launch offer when they ask the map what is worth doing nearby." delay={0.1} />
          <FlowCard step="03" title="Use QR at the host stand" desc="A simple QR code verifies the launch perk, priority entry, or welcome pour in seconds." delay={0.2} />
          <FlowCard step="04" title="Track what converted" desc="Every scan and redemption ties back to map discovery, building QR, or hotel distribution." delay={0.3} />
        </div>
      </BrandSection>

      <BrandSection label="Pricing" title="What they pay.">
        <div className="grid gap-5 md:grid-cols-3">
          <UseCaseCard tag="Launch" title="First 90 days" detail="Free for launch venues and bars. No setup fee, no software fee, no sign-up fee during pilot." delay={0} />
          <UseCaseCard tag="After pilot" title="Month 4 onward" detail="$249/month standard venue layer once the venue chooses to stay live with offers, events, and QR redemption." delay={0.1} />
          <UseCaseCard tag="What is included" title="Included in the paid layer" detail="Map pin, perk routing, QR redemption, event distribution, and partner reporting." delay={0.2} />
        </div>
      </BrandSection>

      <BrandSection label="Use cases" title="The launch moments that matter.">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <UseCaseCard tag="Opening Week" title="Launch dinner traffic" detail="The map drives nearby residents and hotel guests into the opening dinner window with a single redeemable offer." delay={0} />
          <UseCaseCard tag="Nightlife" title="Late-night follow-on" detail="After another stop, the map surfaces Dottie May as the next walkable place to go." delay={0.1} />
          <UseCaseCard tag="Events" title="Special event nights" detail="The launch can shift from table access to RSVP or timed offers without changing the core flow." delay={0.2} />
        </div>
      </BrandSection>

      <BrandCTA
        headline="Launch Dottie May with a system that can keep running after opening week."
        sub="Free for the first 90 days, QR-ready from day one, and built to turn launch traffic into repeat behavior."
        ctaLabel="Launch the pilot"
        ctaHref="mailto:partners@downtownperks.com"
      />
    </div>
  );
}
