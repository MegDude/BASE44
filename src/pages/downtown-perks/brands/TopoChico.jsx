import { CalendarDays, MapPin, QrCode, Zap } from "lucide-react";
import BrandHero from "../../../components/downtown-perks/brands/BrandHero";
import { BrandSection, SignalCard, FlowCard, UseCaseCard, BrandCTA } from "../../../components/downtown-perks/brands/BrandSection";
import { MapDemoPanel, QRDemoPanel } from "../../../components/downtown-perks/brands/DemoPanel";

const demo = (
  <div className="grid gap-5 md:grid-cols-2">
    <MapDemoPanel
      venueName="Topo Chico hydration layer"
      tag="Events + wellness + nightlife recovery"
      nearbyItems={["Waterloo Park", "Rainey Street", "Hotel Van Zandt"]}
    />
    <QRDemoPanel
      headline="Hydration unlock"
      sub="Scan at an event, venue, or recovery stop to unlock the Topo Chico launch moment and track which touchpoint converted."
      action="Unlock the activation"
    />
  </div>
);

export default function TopoChico() {
  return (
    <div className="min-h-screen bg-background">
      <BrandHero
        eyebrow="Launch Partner · Beverage Brand"
        headline={<>Topo Chico should show up<br /><span className="text-primary">where downtown needs it most.</span></>}
        support="This launch page positions Topo Chico as a district hydration and event utility layer across wellness events, nightlife recovery, and high-footfall partner touchpoints. The brand gets real placement, QR capture, and measurable distribution."
        ctaLabel="Plan the Topo Chico launch"
        ctaHref="mailto:partners@downtownperks.com"
        demoPanel={demo}
      />

      <BrandSection label="What they get" title="What the Topo Chico partner package includes.">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <SignalCard icon={<MapPin className="w-5 h-5" />} label="District map placement" sub="Pinned into wellness, event, and nightlife corridors." delay={0} />
          <SignalCard icon={<QrCode className="w-5 h-5" />} label="QR activation" sub="Scannable brand utility at partner venues and events." delay={0.1} />
          <SignalCard icon={<CalendarDays className="w-5 h-5" />} label="Event sponsorship layer" sub="Attach the brand to Waterloo, fitness, and nightlife moments." delay={0.2} />
          <SignalCard icon={<Zap className="w-5 h-5" />} label="Measured campaign proof" sub="See which corridor, event, and partner drove engagement." delay={0.3} />
        </div>
      </BrandSection>

      <BrandSection label="How it works" title="How the activation runs." className="bg-card/30 border-y border-border">
        <div className="grid gap-4 md:grid-cols-2">
          <FlowCard step="01" title="Choose the downtown moments" desc="Topo Chico is attached to events, partner venues, and recovery or hydration touchpoints that fit the brand naturally." delay={0} />
          <FlowCard step="02" title="Place QR at the touchpoint" desc="Each event table, venue bar, or partner stop gets a simple scan path tied to the same campaign." delay={0.1} />
          <FlowCard step="03" title="Distribute through the map" desc="Residents and guests discover the brand in context while asking the map what to do, where to go, or what is happening now." delay={0.2} />
          <FlowCard step="04" title="Read the best-performing zones" desc="The dashboard can show which event, venue, or corridor actually drove scans and redemptions." delay={0.3} />
        </div>
      </BrandSection>

      <BrandSection label="Pricing" title="What they pay.">
        <div className="grid gap-5 md:grid-cols-3">
          <UseCaseCard tag="Launch sponsor" title="Launch package" detail="$7,500 annual launch partner layer for district placement, QR activation, and event sponsorship support." delay={0} />
          <UseCaseCard tag="Pilot" title="Short pilot option" detail="A paid pilot can start smaller if the brand wants one corridor or one event series first." delay={0.1} />
          <UseCaseCard tag="Included" title="What is included" detail="Map placement, activation design, QR routing, event presence, and measurement across the chosen downtown moments." delay={0.2} />
        </div>
      </BrandSection>

      <BrandSection label="Use cases" title="Where Topo Chico fits immediately.">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <UseCaseCard tag="Waterloo" title="Waterloo wellness event" detail="Hydration support for yoga, run club, or public-space fitness moments with QR engagement." delay={0} />
          <UseCaseCard tag="Nightlife" title="Rainey recovery moment" detail="Topo Chico appears as the reset choice before or after nightlife activity." delay={0.1} />
          <UseCaseCard tag="Hotels" title="Guest welcome layer" detail="Hospitality partners can include Topo Chico in the arrival or neighborhood guide flow." delay={0.2} />
        </div>
      </BrandSection>

      <BrandCTA
        headline="Use Topo Chico as a brand people actually encounter in motion."
        sub="Place it in the right downtown moments, make the QR path easy, and measure which activations are worth repeating."
        ctaLabel="Start the brand launch"
        ctaHref="mailto:partners@downtownperks.com"
      />
    </div>
  );
}
