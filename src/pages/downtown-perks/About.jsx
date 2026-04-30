import { ROUTES } from "@/lib/routes";
import SectionContainer from "@/components/SectionContainer";
import {
  HeroSplit,
  InlineDataPanel,
  NarrativeSteps,
  StepRail,
  RuleList,
  SegmentSwitcher,
  Accordion,
  ClosingStatement,
} from "@/components/about";

const NARRATIVE_STEPS = [
  {
    title: "A live map of downtown — not another feed to scroll.",
    body: "See what’s nearby, what’s happening, and what’s worth your time right now. From coffee to happy hour to events, everything shows up in one place so you can make a quick decision and move.",
  },
  {
    title: "Downtown has everything. It’s just hard to piece together.",
    body: "You’re usually jumping between Google, Instagram, and random sites to figure out what to do. This fixes that. Everything is in one place, already organized around where you are.",
  },
  {
    title: "Start simple. Use more when you need it.",
    body: "You can browse freely. When you want to save something, RSVP, or use a perk, your card is there when you need it.",
  },
];

const HOW_IT_WORKS = [
  {
    title: "Open the map",
    body: "See restaurants, bars, coffee shops, events, and more — all in one view.",
  },
  {
    title: "Find what fits right now",
    body: "What’s close, what’s open, what’s happening — it’s all clear at a glance.",
  },
  {
    title: "Take the next action",
    body: "Save a spot, RSVP, or use a perk. No dead ends. No extra steps.",
  },
];

const PRODUCT_TRUTHS = [
  "One map instead of five apps",
  "Browse first, no friction",
  "Use the card only when needed",
  "Everything is based on what’s nearby and relevant now",
];

const SEGMENTS = [
  {
    label: "Residents",
    eyebrow: "Resident view",
    linkLabel: "Residents",
    href: ROUTES.residents,
    headline: "Residents",
    body: "Find places nearby, see what’s happening, and use perks — all without downloading anything.",
    practice: "Find somewhere to go, see what’s happening tonight, and use perks when they matter.",
    detailsTitle: "What residents can do",
    details: [
      "Browse nearby places and events",
      "See what fits right now",
      "Save places for later",
      "RSVP when something looks good",
      "Use the card when needed",
    ],
  },
  {
    label: "Properties",
    eyebrow: "Property view",
    linkLabel: "Properties",
    href: ROUTES.partnerProperties,
    headline: "Properties",
    body: "Give residents something they’ll actually use, and see what they engage with around your building.",
    practice: "Turn the neighborhood into a real amenity — not just a list.",
    detailsTitle: "What properties can measure",
    details: [
      "Property views",
      "Resident actions",
      "Saves",
      "Nearby engagement",
      "Card activations",
      "Redemption activity around the building",
    ],
  },
  {
    label: "Hospitality",
    eyebrow: "Hospitality",
    linkLabel: "Hospitality",
    href: ROUTES.partnerHospitality,
    headline: "Hospitality",
    body: "Give guests one simple map for dining, events, wellness, and nightlife.",
    practice: "Extend the stay beyond the lobby without making guests piece things together themselves.",
    detailsTitle: "What hospitality partners can measure",
    details: [
      "Guest opens",
      "Local guide engagement",
      "Attributed visits",
      "Offer usage",
      "Event interest",
      "Source scans",
    ],
  },
  {
    label: "Venues",
    eyebrow: "Venues",
    linkLabel: "Venues",
    href: ROUTES.partnerVenues,
    headline: "Venues",
    body: "Show up when people nearby are deciding where to go — not after.",
    practice: "Appear in the moment that counts, when someone is close and ready to choose.",
    detailsTitle: "What venues can measure",
    details: [
      "Map views",
      "Saves",
      "RSVPs",
      "Redemptions",
      "Physical visit signals",
      "Best-performing timing windows",
    ],
  },
  {
    label: "Brands",
    eyebrow: "Brands",
    linkLabel: "Brands",
    href: ROUTES.partnerBrands,
    headline: "Brands",
    body: "Reach people who are already nearby and already out.",
    practice: "Show up in the right corridor, at the right time, without relying on broad reach.",
    detailsTitle: "What brands can measure",
    details: [
      "Map opens",
      "Source scans",
      "Campaign clicks",
      "Event participation",
      "Partner-location engagement",
      "Redemptions and follow-through",
    ],
  },
  {
    label: "Civic",
    eyebrow: "Civic",
    linkLabel: "Civic",
    href: ROUTES.partnerCivic,
    headline: "Civic",
    body: "Help more people find what’s going on and take part.",
    practice: "Surface events and local initiatives where people are already looking and deciding.",
    detailsTitle: "What civic partners can measure",
    details: [
      "RSVPs",
      "Repeat participation",
      "District engagement",
      "Event visibility",
      "Campaign source performance",
      "Movement across public-space activations",
    ],
  },
];

const FAQ_ITEMS = [
  {
    q: "Do I need to download anything?",
    a: "No. Just scan a QR code and you’re in.",
  },
  {
    q: "What gets tracked?",
    a: "Basic activity like saves, visits, and perk use — so partners can see what’s actually working.",
  },
  {
    q: "How much does resident access cost?",
    a: "Resident access is simple and low-friction. In many cases, it’s tied to a building, event, or partner setup.",
  },
  {
    q: "Why is this better than a static amenity list?",
    a: "Because it’s live. You see what’s happening now — not outdated info.",
  },
  {
    q: "What kinds of organizations can join?",
    a: "Buildings, local businesses, brands, and community groups can all join.",
  },
  {
    q: "What can we measure?",
    a: "Things like visits, saves, and redemptions — real activity, not guesses.",
  },
];

export default function About() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(207,175,90,0.12),transparent_16%),linear-gradient(180deg,#F7F8FB_0%,#F3F6FA_42%,#F7F8FB_100%)] pb-24 pt-[88px] text-[var(--dp-navy,#0B1F33)]">
      <div className="space-y-20 md:space-y-28">
        <HeroSplit
          eyebrow="About"
          title="Downtown Perks helps you use downtown Austin better."
          subtitle="It puts places, events, and perks in one simple map so you can quickly decide where to go and what to do."
          body={[
            "No apps to download. No switching between tabs. Just one place to look.",
          ]}
          actions={[
            { label: "Open Map", to: ROUTES.explore },
            { label: "View Partner Types", to: ROUTES.partners, variant: "secondary" },
          ]}
          side={
            <InlineDataPanel
              items={[
                {
                  label: "Places",
                  meta: "Live",
                  body: "Restaurants, bars, coffee, wellness, shopping, services, hotels, and everyday stops nearby.",
                },
                {
                  label: "Events",
                  meta: "Live",
                  body: "Live events, resident moments, partner activations, and district programming.",
                },
                {
                  label: "Perks",
                  meta: "Live",
                  body: "Useful offers tied to real places on the map, activated by the card when it matters.",
                },
              ]}
            />
          }
        />

        <NarrativeSteps steps={NARRATIVE_STEPS} />

        <StepRail
          eyebrow="How to use it"
          title="Start simple. Use more when you need it."
          description="Browse freely first. Save, RSVP, or use a perk when the next step actually matters."
          steps={HOW_IT_WORKS}
          detail={{
            title: "Closing line",
            body: "The point is fewer dead ends and faster decisions.",
          }}
        />

        <RuleList
          items={PRODUCT_TRUTHS}
          title="What makes it different"
        />

        <SegmentSwitcher
          segments={SEGMENTS}
          eyebrow="Who it serves"
          title="Built for the people already here — and the places that make downtown work."
          description="It stays useful for residents first, while also helping buildings, venues, brands, and local groups show up at the right time."
        />

        <SectionContainer width="wide">
          <section className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr]">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[rgba(11,31,51,0.48)]">
                What you can do
              </div>
              <h2 className="mt-3 font-heading text-[2rem] font-semibold leading-[1.02] tracking-[-0.04em] text-[var(--dp-navy,#0B1F33)] md:text-[2.6rem]">
                Simple to use for people. Useful for the places around them.
              </h2>
              <p className="mt-4 max-w-[620px] text-[15px] leading-7 text-[rgba(11,31,51,0.68)]">
                The experience stays simple: find, go, save, use. Behind that, the same actions help buildings and partners understand what people actually respond to.
              </p>
            </div>
            <div className="border-t border-[rgba(11,31,51,0.08)]">
              {[
                {
                  title: "Resident utility",
                  body: "Find somewhere to go, see what’s happening tonight, and use perks when they matter.",
                },
                {
                  title: "For buildings",
                  body: "Turn the neighborhood into a real amenity — not just a list.",
                },
                {
                  title: "For partners",
                  body: "Reach people who are already nearby and ready to go out.",
                },
              ].map((item) => (
                <div key={item.title} className="border-b border-[rgba(11,31,51,0.08)] py-4 last:border-b-0">
                  <h3 className="text-[1rem] font-semibold text-[var(--dp-navy,#0B1F33)]">{item.title}</h3>
                  <p className="mt-2 max-w-[620px] text-[14px] leading-7 text-[rgba(11,31,51,0.68)]">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </SectionContainer>

        <Accordion
          items={FAQ_ITEMS}
          eyebrow="Common questions"
          title="Questions people ask first"
          description="The basics: what it is, how it works, and why it’s easier than the usual way of figuring downtown out."
        />

        <ClosingStatement
          title="Everything downtown, just easier to use"
          lines={[
            "You open one map, find something nearby, and go.",
          ]}
          actions={[
            { label: "Open Map", to: ROUTES.explore },
            { label: "Apply to Be a Partner", to: ROUTES.partnerApply, variant: "secondary" },
          ]}
        />
      </div>
    </main>
  );
}
