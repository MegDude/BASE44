import { MapPin, Music, QrCode } from "lucide-react";
import BrandHero from "../../../components/downtown-perks/brands/BrandHero";
import { BrandCTA, BrandSection, FlowCard, SignalCard, UseCaseCard } from "../../../components/downtown-perks/brands/BrandSection";
import { CampaignImagePanel, campaignImages } from "../../../components/downtown-perks/brands/CampaignImagePanel";

const heroImage = (
  <CampaignImagePanel
    image={campaignImages.qwrFrontDesk}
    eyebrow="Lobby QR"
    title="One scan from the front desk"
    body="Guests can open nearby events, live music, local favorites, and offers as soon as they arrive."
  />
);

export default function HotelVanZandt() {
  return (
    <div className="min-h-screen bg-background">
      <BrandHero
        eyebrow="Hotel Partner · Rainey Street"
        headline={<>Beyond the lobby.<br /><span className="text-primary">Austin starts here.</span></>}
        support="Discover nearby events, live music, local favorites, and experiences worth stepping out for."
        ctaLabel="Partner With Downtown Perks"
        ctaHref="mailto:partners@downtownperks.com"
        demoPanel={heroImage}
      />

      <BrandSection label="Partner Benefits" title="Help guests experience Rainey Street and downtown without sending them searching.">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <SignalCard icon={<Music className="w-5 h-5" />} label="Live music nearby" sub="See what is happening tonight around Rainey Street and Downtown Austin." delay={0} />
          <SignalCard icon={<MapPin className="w-5 h-5" />} label="Local recommendations" sub="Explore places guests save, visit, and come back to." delay={0.1} />
          <SignalCard icon={<QrCode className="w-5 h-5" />} label="One scan away" sub="Guests can access events, offers, and nearby experiences instantly." delay={0.2} />
        </div>
      </BrandSection>

      <BrandSection label="Real World Placement" title="Where guests meet the guide." className="bg-card/30 border-y border-border">
        <div className="grid gap-4 md:grid-cols-2">
          <FlowCard step="01" title="Front desk QR" desc="Guests see a simple scan point at check-in while they are already asking what to do nearby." delay={0} />
          <FlowCard step="02" title="Room and lobby prompts" desc="The guide can appear in welcome materials, lobby signage, and concierge moments." delay={0.1} />
          <FlowCard step="03" title="Tonight's nearby plan" desc="Dining, live music, happy hour, wellness, and events are organized around the hotel." delay={0.2} />
          <FlowCard step="04" title="Useful follow-up" desc="The team can see what guests opened, saved, RSVP'd to, and visited." delay={0.3} />
        </div>
      </BrandSection>

      <BrandSection label="Map Preview" title="What guests can do after one scan.">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <UseCaseCard tag="Arrival" title="Find a first-night plan" detail="A guest checks in and sees nearby dinner, live music, and walkable things to do before unpacking." delay={0} />
          <UseCaseCard tag="Evening" title="Choose something local" detail="Rainey Street events and nearby favorites appear with enough context to make a quick decision." delay={0.1} />
          <UseCaseCard tag="Return" title="Save places for later" detail="Guests can save a spot, come back during the stay, or remember it on their next Austin trip." delay={0.2} />
        </div>
      </BrandSection>

      <BrandSection label="Proof" title="Simple measures for a better local stay." className="bg-card/30 border-y border-border">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <SignalCard value="1 scan" label="Guest access" sub="No app download required" delay={0} />
          <SignalCard value="Tonight" label="Event timing" sub="Nearby plans when guests need them" delay={0.1} />
          <SignalCard value="Save" label="Local favorites" sub="Places guests want to revisit" delay={0.2} />
          <SignalCard value="RSVP" label="Participation" sub="Events guests can join" delay={0.3} />
        </div>
      </BrandSection>

      <BrandCTA
        headline="Extend the stay beyond the lobby."
        sub="Give guests an easy way to discover what is nearby, happening, and worth visiting."
        ctaLabel="Partner With Downtown Perks"
        ctaHref="mailto:partners@downtownperks.com"
      />
    </div>
  );
}
