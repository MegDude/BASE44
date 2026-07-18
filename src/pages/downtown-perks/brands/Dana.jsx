import { Handshake, Store, Users } from "lucide-react";
import BrandHero from "../../../components/downtown-perks/brands/BrandHero";
import { BrandCTA, BrandSection, FlowCard, SignalCard, UseCaseCard } from "../../../components/downtown-perks/brands/BrandSection";
import { CampaignImagePanel, campaignImages } from "../../../components/downtown-perks/brands/CampaignImagePanel";

const heroImage = (
  <CampaignImagePanel
    image={campaignImages.dana}
    eyebrow="DANA Campaign"
    title="A stronger downtown starts here"
    body="Connect residents, businesses, and neighborhood leaders through events, updates, and participation."
  />
);

export default function Dana() {
  return (
    <div className="min-h-screen bg-background">
      <BrandHero
        eyebrow="Civic Partner · Neighborhood Participation"
        headline={<>A stronger downtown starts<br /><span className="text-primary">with participation.</span></>}
        support="Connect with residents, businesses, and the people helping shape what comes next."
        ctaLabel="Plan a Civic Campaign"
        ctaHref="mailto:partners@downtownperks.com"
        demoPanel={heroImage}
      />

      <BrandSection label="Partner Benefits" title="Help the downtown neighborhood hear from more of the people who live and work there.">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <SignalCard icon={<Users className="w-5 h-5" />} label="Resident connection" sub="Reach people who live nearby with useful updates and invitations." delay={0} />
          <SignalCard icon={<Store className="w-5 h-5" />} label="Business participation" sub="Bring local businesses into events, surveys, and community efforts." delay={0.1} />
          <SignalCard icon={<Handshake className="w-5 h-5" />} label="Shared action" sub="Make it easier to RSVP, volunteer, respond, and participate." delay={0.2} />
        </div>
      </BrandSection>

      <BrandSection label="Real World Placement" title="A civic campaign with practical next steps." className="bg-card/30 border-y border-border">
        <div className="grid gap-4 md:grid-cols-2">
          <FlowCard step="01" title="DANA campaign poster" desc="Use DANA campaign imagery across buildings, local venues, and neighborhood communications." delay={0} />
          <FlowCard step="02" title="Local updates" desc="Share what is changing, what is planned, and where to read the details." delay={0.1} />
          <FlowCard step="03" title="Participation prompts" desc="People can RSVP, respond to a survey, join a meeting, or support a local initiative." delay={0.2} />
          <FlowCard step="04" title="Community response" desc="DANA can see what people opened, saved, responded to, and attended." delay={0.3} />
        </div>
      </BrandSection>

      <BrandSection label="Map Preview" title="Participation tied to place.">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <UseCaseCard tag="Residents" title="Nearby voices included" detail="People who live downtown can find the issues, events, and updates closest to them." delay={0} />
          <UseCaseCard tag="Businesses" title="Local partners visible" detail="Businesses can join campaigns, host events, or support neighborhood initiatives." delay={0.1} />
          <UseCaseCard tag="Next Steps" title="A clear way to participate" detail="Each update includes a practical action: RSVP, save, respond, attend, or share." delay={0.2} />
        </div>
      </BrandSection>

      <BrandCTA
        headline="Make it easier for people to participate in downtown's next chapter."
        sub="Campaign imagery, local updates, events, and simple participation prompts."
        ctaLabel="Start the Conversation"
        ctaHref="mailto:partners@downtownperks.com"
      />
    </div>
  );
}
