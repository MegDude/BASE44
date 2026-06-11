import BrandHero from "../../../components/downtown-perks/brands/BrandHero";
import { BrandCTA, BrandSection, FlowCard, SignalCard, UseCaseCard } from "../../../components/downtown-perks/brands/BrandSection";
import { CampaignImagePanel, campaignImages } from "../../../components/downtown-perks/brands/CampaignImagePanel";

const heroImage = (
  <CampaignImagePanel
    image={campaignImages.bangersPoster}
    eyebrow="Rainey Street"
    title="Stay Put appears while people are already deciding where to go."
    body="A single campaign surface can point residents toward the map, the offer, and the next local plan."
  />
);

const appearances = [
  {
    tag: "After Work",
    title: "Rainey plans start before people leave the building.",
    detail: "Stay Put appears when residents are deciding between a drink nearby, dinner first, or a longer night out.",
  },
  {
    tag: "Events",
    title: "Monday Meetups become part of the weekly rhythm.",
    detail: "The event sits inside the map as a nearby plan, not a separate promo that residents have to remember.",
  },
  {
    tag: "Perks",
    title: "A resident offer gives people a reason to try it tonight.",
    detail: "The perk connects discovery to action without turning the experience into a coupon wall.",
  },
  {
    tag: "Nearby",
    title: "The bar stays tied to buildings, hotels, and walkable plans.",
    detail: "People see Stay Put because it fits the moment, the distance, and the neighborhood context.",
  },
];

const qrSignals = [
  { label: "First time or returning", sub: "The scan can separate new curiosity from repeat interest." },
  { label: "Local or visiting", sub: "The map can show whether the moment is resident-led, guest-led, or mixed." },
  { label: "Favorite drink", sub: "Simple prompts turn a generic offer into a better future recommendation." },
  { label: "Event interest", sub: "Saved events and RSVP intent show which nights are worth promoting again." },
  { label: "Return intent", sub: "The strongest signal is whether someone wants Stay Put in the next plan." },
];

const nightSignals = [
  { label: "Peak Window", sub: "The strongest activity clusters around the moment residents are deciding what comes after work." },
  { label: "Resident Mix", sub: "Nearby buildings and hotels show where Stay Put is becoming part of the local routine." },
  { label: "Most Saved Event", sub: "Monday Meetups give the venue a recurring reason to appear on the map." },
  { label: "Most Used Perk", sub: "Simple drink-led offers work best when the night is already in motion." },
  { label: "Return Reason", sub: "People come back when the place feels easy to remember and easy to reach." },
];

const campaignIdeas = [
  {
    tag: "Resident Nights",
    title: "Turn Monday Meetups into the recurring anchor.",
    detail: "One weekly moment gives residents a familiar reason to save, RSVP, and come back.",
  },
  {
    tag: "Rainey Weather",
    title: "Promote rooftop and patio timing when the evening opens up.",
    detail: "Weather-aware placement helps Stay Put appear when the decision is still flexible.",
  },
  {
    tag: "Hotel Nearby",
    title: "Surface Stay Put to guests looking for an easy first Austin stop.",
    detail: "A nearby venue with a clear reason to go beats a long list of generic recommendations.",
  },
];

export default function TheStayPut() {
  return (
    <div className="dp-editorial-page min-h-screen bg-background">
      <BrandHero
        eyebrow="Venue Partner · Rainey Street"
        headline={<>Stay Put becomes<br /><span className="text-primary">the plan people remember.</span></>}
        support="Downtown Perks helps the bar show up when residents, guests, and nearby teams are already deciding where the night should go."
        ctaLabel="Build The Stay Put Plan"
        ctaHref="mailto:partners@downtownperks.com"
        demoPanel={heroImage}
      />

      <BrandSection label="Resident Journey" title="How Stay Put becomes a habit.">
        <div className="dp-editorial-list">
          <FlowCard step="01" title="Discover" desc="The venue appears inside the map when someone asks what is nearby, walkable, and worth showing up for tonight." />
          <FlowCard step="02" title="Save" desc="Residents save the place, the meetup, or the perk while the plan is still forming." delay={0.1} />
          <FlowCard step="03" title="Show Up" desc="The map connects Stay Put to directions, nearby buildings, hotel context, and the active offer." delay={0.2} />
          <FlowCard step="04" title="Come Back" desc="QR scans, saved events, and return intent make the next promotion more useful." delay={0.3} />
        </div>
      </BrandSection>

      <BrandSection label="Map Placement" title="Where Stay Put appears.">
        <div className="dp-editorial-list">
          {appearances.map((item, index) => (
            <UseCaseCard key={item.title} {...item} delay={index * 0.08} />
          ))}
        </div>
      </BrandSection>

      <BrandSection label="Recurring Moment" title="Monday Meetups gives the map a reason to bring people back.">
        <div className="dp-editorial-list">
          <SignalCard label="The event is simple." sub="Residents understand the plan quickly: a recurring reason to meet nearby without overthinking the night." />
          <SignalCard label="The venue stays visible." sub="Recurring programming gives Stay Put a reason to appear before, during, and after the decision window." delay={0.1} />
          <SignalCard label="The follow-up gets smarter." sub="Saved events, RSVP interest, and QR scans show what should happen next Monday." delay={0.2} />
        </div>
      </BrandSection>

      <BrandSection label="QR Journey" title="The scan should explain the night, not just count it.">
        <div className="dp-editorial-list">
          <FlowCard step="01" title="Building QR" desc="A resident scans while deciding what to do after work." />
          <FlowCard step="02" title="Map Answer" desc="Stay Put appears with the reason it fits the moment." delay={0.1} />
          <FlowCard step="03" title="Perk Or Meetup" desc="The user saves the offer, opens the event, or gets directions." delay={0.2} />
          <FlowCard step="04" title="Return Signal" desc="The venue learns what made the person likely to come back." delay={0.3} />
        </div>
      </BrandSection>

      <BrandSection label="Venue Intelligence" title="What Stay Put learns.">
        <div className="dp-editorial-list">
          {qrSignals.map((item, index) => (
            <SignalCard key={item.label} {...item} delay={index * 0.08} />
          ))}
        </div>
      </BrandSection>

      <BrandSection label="Night Readout" title="What the night showed.">
        <div className="dp-editorial-list">
          {nightSignals.map((item, index) => (
            <SignalCard key={item.label} {...item} delay={index * 0.08} />
          ))}
        </div>
      </BrandSection>

      <BrandSection label="Campaign Ideas" title="Three useful ways to keep the venue in the decision.">
        <div className="dp-editorial-list">
          {campaignIdeas.map((item, index) => (
            <UseCaseCard key={item.title} {...item} delay={index * 0.08} />
          ))}
        </div>
      </BrandSection>

      <BrandSection label="Why It Works" title="Less UI. More meaning.">
        <p className="dp-editorial-meaning max-w-2xl">
          Stay Put does not need another catalogue of cards, metrics, or offers. It needs one clear path from discovery to return: appear at the right moment, make the plan easy, learn what worked, and come back with a better reason next time.
        </p>
      </BrandSection>

      <BrandCTA
        headline="Make Stay Put easier to find, save, and return to."
        sub="One venue story, one map flow, and a clearer way to understand what made the night work."
        ctaLabel="Start The Stay Put Plan"
        ctaHref="mailto:partners@downtownperks.com"
      />
    </div>
  );
}
