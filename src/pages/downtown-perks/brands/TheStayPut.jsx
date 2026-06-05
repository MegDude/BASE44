import { Building2, CalendarDays, MapPin, QrCode, Star, Ticket } from "lucide-react";
import BrandHero from "../../../components/downtown-perks/brands/BrandHero";
import { BrandCTA, BrandSection, FlowCard, SignalCard, UseCaseCard } from "../../../components/downtown-perks/brands/BrandSection";
import { StackedCampaignImages, campaignImages } from "../../../components/downtown-perks/brands/CampaignImagePanel";

const heroImages = (
  <StackedCampaignImages
    items={[
      {
        image: campaignImages.elevatorQr,
        eyebrow: "Elevator QR",
        title: "Scan on the way out",
        body: "Residents can see what is happening nearby before they leave the building.",
      },
      {
        image: campaignImages.mapUi,
        eyebrow: "Map preview",
        title: "Nearby, saved, and happening now",
        body: "Events, offers, and local favorites stay tied to the neighborhood.",
      },
    ]}
  />
);

export default function TheStayPut() {
  return (
    <div className="min-h-screen bg-background">
      <BrandHero
        eyebrow="Residential Partner · Downtown Amenity"
        headline={<>The neighborhood becomes<br /><span className="text-primary">part of the amenity.</span></>}
        support="Residents can discover nearby events, local perks, new places, and everything happening around downtown."
        ctaLabel="Partner With Downtown Perks"
        ctaHref="mailto:partners@downtownperks.com"
        demoPanel={heroImages}
      />

      <BrandSection label="Partner Benefits" title="A resident experience that starts inside the building and continues outside.">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <SignalCard icon={<Building2 className="w-5 h-5" />} label="Everyday amenity" sub="Living nearby feels more useful when residents know what is happening around them." delay={0} />
          <SignalCard icon={<CalendarDays className="w-5 h-5" />} label="Local events" sub="Residents can RSVP, save, and show up to events without leaving the neighborhood." delay={0.1} />
          <SignalCard icon={<Ticket className="w-5 h-5" />} label="Local perks" sub="Offers give people a reason to try nearby places and come back." delay={0.2} />
        </div>
      </BrandSection>

      <BrandSection label="Real World Placement" title="Where the resident habit forms." className="bg-card/30 border-y border-border">
        <div className="grid gap-4 md:grid-cols-2">
          <FlowCard step="01" title="Elevator QR" desc="A resident scans while heading out and sees what is nearby today." delay={0} />
          <FlowCard step="02" title="Lobby and move-in materials" desc="The building introduces the neighborhood as part of everyday living." delay={0.1} />
          <FlowCard step="03" title="Map preview" desc="Nearby restaurants, fitness, errands, events, and offers stay organized around the address." delay={0.2} />
          <FlowCard step="04" title="Resident actions" desc="Teams can see what people opened, saved, RSVP'd to, and visited." delay={0.3} />
        </div>
      </BrandSection>

      <BrandSection label="Map Preview" title="What residents expect to find.">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <UseCaseCard tag="Weeknight" title="A nearby plan after work" detail="Residents see happy hour, dinner, fitness, or music within walking distance." delay={0} />
          <UseCaseCard tag="Weekend" title="Things worth joining" detail="Local events and neighborhood gatherings make it easier to participate." delay={0.1} />
          <UseCaseCard tag="Routine" title="Places to save and revisit" detail="Coffee, wellness, errands, and favorites become part of the resident's weekly rhythm." delay={0.2} />
        </div>
      </BrandSection>

      <BrandCTA
        headline="Make downtown feel easier to live in."
        sub="Elevator QR, local map preview, events, offers, and nearby places residents can actually use."
        ctaLabel="Partner With Downtown Perks"
        ctaHref="mailto:partners@downtownperks.com"
      />
    </div>
  );
}
