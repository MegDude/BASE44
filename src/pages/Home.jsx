import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Quote,
  Sparkles,
} from "lucide-react";
import DowntownPerksHowItWorks from "@/components/shared/DowntownPerksHowItWorks";
import { BUILDING_INTELLIGENCE } from "@/data/buildingIntelligence";
import { legendsListingPlaces } from "@/data/legendsListings";
import { luxuryPresenceBuildings } from "@/data/luxuryPresenceInventory";
import { MAP_ENTITIES } from "@/data/mapEntities";

const partnerCategories = {
  Properties: {
    pricing: "$199-$2,388/year",
    cta: "Bring this to your property",
    href: "/partners/properties",
    body: "Management pays. Residents stay. Your address is your key to unlock downtown.",
    faq: "Property partner plans are annual and range from $199/year to $2,388/year depending on building needs.",
  },
  Hotels: {
    pricing: "$1,188-$2,388/year",
    cta: "Use this for guests",
    href: "/partners/hospitality",
    body: "Extend the stay beyond your lobby. One scan. Every option. Guests navigate. You benefit.",
    faq: "90-day pilot. See what guests actually do.",
  },
  Venues: {
    pricing: "Free-$2,388/year",
    cta: "Plan a campaign",
    href: "/partners/venues",
    body: "Show up in the moment that counts. Not reach. Relevance. Not impressions. Intent.",
    faq: "Venues can start with a free listing path. Paid venue plans start at $360/year.",
  },
  Brands: {
    pricing: "$1,188-$2,388/year",
    cta: "Start a conversation",
    href: "/partners/brands",
    body: "Buy the moment, not the impression. Context beats scale. Timing beats frequency.",
    faq: "Test it. Measure it. Scale it.",
  },
  Civic: {
    pricing: "$49-$1,188/year",
    cta: "Talk to us",
    href: "/partners/civic",
    body: "Turn attendance into participation. Discovery drives turnout. Access drives engagement.",
    faq: "Start with 90 days. Keep what works.",
  },
};

const heroMedia = [
  {
    src: "/images/districts/rainey-hero.jpg",
    label: "Rainey",
    title: "Nearby nights, visible as people choose.",
  },
  {
    src: "/images/restaurants/comedor-architecture.png",
    label: "Dining",
    title: "Restaurants, bars, and offers in the same local view.",
  },
  {
    src: "/buildings/shore.webp",
    label: "Residents",
    title: "Building access connected to what is worth doing nearby.",
  },
  {
    src: "/images/splash/walkable-map.png",
    label: "Map",
    title: "A clean discovery layer for places, perks, and events.",
  },
];

const marketingValueSections = [
  {
    eyebrow: "For Residents",
    title: "A faster way to decide where to go.",
    body: "Residents do not need another app to manage. They need a clean way to see what is nearby, what is worth doing, and what they can use today.",
    points: ["Find nearby places, events, and perks", "Save what matters", "Use the perks card when it is time to go"],
  },
  {
    eyebrow: "For Partners",
    title: "Show up while people are choosing.",
    body: "Downtown Perks gives local partners visibility inside the decision moment — not after attention has already moved somewhere else.",
    points: ["Appear on the live map", "Promote offers and events", "Track saves, scans, directions, and redemptions"],
  },
];

const marketingPartnerTypes = [
  ["Properties", "A building amenity people actually use."],
  ["Hotels", "The stay continues outside your doors."],
  ["Venues", "Show up when nearby people are deciding."],
  ["Brands", "Buy the moment, not the impression."],
  ["Civic", "Turn local activity into participation."],
  ["Real Estate", "Connect listings to neighborhood context."],
];

const residentFaqs = [
  ["Do I need to download an app?", "No. It's a mobile web experience. Scan a QR code, and you're in. No download. No login. No extra platform."],
  ["Does it cost anything for residents?", "Your building covers resident access as part of the amenity. You get map access, event RSVPs, and your perks card through the building program."],
  ["Is my info shared with partners?", "No. We track actions for reporting, not personal contact information. Your details aren't shared unless you explicitly opt in. Privacy is the default."],
  ["Who can join?", "Downtown residents in participating buildings. It's exclusive by design, built for people who actually live here."],
  ["How do resident connections work?", "See an event or activity you want to join. Use Connect Nearby to signal interest and reach out to others who are going. It's opt-in, lightweight, and designed to make it easier to show up together."],
];

const communityStories = [
  {
    residentName: "Maya R.",
    buildingName: "The Shore",
    quote: "The best part is finding something close by that actually fits my routine. I scanned the perk at the bar, answered one quick question, and got a free drink before meeting friends on Rainey.",
    favoritePerk: "Free welcome beer",
    partner: "Rainey Social House",
    image: "/images/imported/perks/4-scan-perk.png",
    cta: "Explore Resident Perks",
    href: "/perks",
  },
];

const partnerFaqs = [
  ["Do venues pay to join?", "Venues can start with a free listing path. Paid venue plans start at $360/year."],
  ["What do buildings pay?", "Properties use annual plans from $199/year to $2,388/year depending on resident access, reporting, and building needs."],
  ["How fast can a partner launch?", "7-10 days. We handle setup, map placement, QR generation, and entry point coordination."],
  ["What gets tracked?", "Scans, saves, RSVPs, and redemptions. You get reporting snapshots at 30, 60, and 90 days to see what's working."],
  ["What kind of perks?", "Discounts on food and drinks, priority access to events, welcome offers, and members-only specials. Each business sets its own perks."],
  ["Can partners update listings?", "Yes. Partners get a simple dashboard to update hours, add perks, post events, and adjust map presence."],
  ["Where is this available?", "Downtown Austin. We're starting with one district, proving the model, then expanding to other downtown corridors based on partner and resident demand."],
];

const downtownBuildingDirectory = [
  "The Bowie",
  "The Quincy",
  "The Independent",
  "Hanover Republic Square",
  "The Waterline",
  "The Paseo",
  "Four Seasons Residences",
  "Gables Republic Square",
  "Gables Park Tower",
  "Gables Park Plaza",
  "The Austonian",
  "360 Condominiums",
  "Austin Proper Residences",
  "Fifth & West",
  "Seaholm Residences",
  "Austin City Lofts",
  "The Monarch",
  "Spring Condominiums",
  "The Nokonah",
  "Milago Condominiums",
  "The Shore",
  "Towers of Town Lake",
  "AMLI on 2nd",
  "AMLI Downtown",
  "The Whitley",
  "Seven Apartments",
  "SkyHouse Austin",
  "Northshore Austin",
  "Windsor on the Lake",
  "The Ashton",
  "Camden Rainey Street",
  "Alexan Waterloo",
  "Symphony Square",
  "Hanover Brazos",
  "Sienna at The Thompson",
  "The Travis",
  "Vesper",
  "The Modern Austin Residences",
  "44 East Ave",
  "Natiivo Austin",
  "River Street Residences",
  "Travis Parkside",
  "Residences at 6G",
  "6 X Guadalupe",
  "Wilson Tower",
  "The Waller",
  "Block 36",
  "321 West",
  "The Republic",
  "505 W 7th St",
  "506 W 7th St",
  "222 West Ave",
  "301 West Ave",
  "501 West Ave",
  "800 W 5th St",
  "360 Nueces St",
  "202 Nueces St",
  "1908 San Antonio St",
  "My building is not listed",
];

function baseBuildingName(value) {
  return String(value || "")
    .replace(/,\s*Austin,\s*TX.*$/i, "")
    .replace(/\s+#.*$/i, "")
    .trim();
}

const residentBuildingOptions = [
  ...new Set([
    ...BUILDING_INTELLIGENCE.map((building) => building.name),
    ...MAP_ENTITIES
      .filter((entity) => ["building", "property", "hotel"].includes(entity.type) || entity.isBuilding || entity.isProperty)
      .map((entity) => baseBuildingName(entity.name)),
    ...luxuryPresenceBuildings.map((building) => building.name),
    ...legendsListingPlaces.map((listing) => baseBuildingName(listing.legendsListing?.address || listing.name)),
    ...downtownBuildingDirectory,
  ].filter(Boolean)),
].filter((building) => building !== "My building is not listed");

residentBuildingOptions.sort((a, b) => a.localeCompare(b));
residentBuildingOptions.push("My building is not listed");

function CommunityStoriesSection() {
  return (
    <section className="dp-community-stories-section py-12 md:py-16" aria-labelledby="community-stories-title">
      <div className="dp-layout-shell">
        <div className="mb-7 max-w-2xl">
          <span className="dp-label mb-3 block">Resident Favorite</span>
          <h2 id="community-stories-title" className="font-heading text-3xl font-medium">Community Stories</h2>
          <p className="mt-3 text-[14px] leading-relaxed text-[#0B1F33]/64">
            See how downtown residents are using local perks in real life.
          </p>
        </div>

        {communityStories.map((story) => (
          <article key={`${story.residentName}-${story.partner}`} className="dp-community-story-card">
            <figure className="dp-community-story-photo">
              <img src={story.image} alt={`${story.residentName} using Downtown Perks near Rainey`} loading="lazy" decoding="async" />
            </figure>
            <div className="dp-community-story-copy">
              <Quote className="dp-community-story-quote-icon" aria-hidden="true" />
              <blockquote>{story.quote}</blockquote>
              <div className="dp-community-story-person">
                <strong>{story.residentName}</strong>
                <span>{story.buildingName}</span>
              </div>
              <dl className="dp-community-story-meta">
                <div>
                  <dt>Favorite Perk</dt>
                  <dd>{story.favoritePerk}</dd>
                </div>
                <div>
                  <dt>Partner</dt>
                  <dd>{story.partner}</dd>
                </div>
              </dl>
              <Link to={story.href} className="dp-community-story-cta">
                {story.cta}
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  const [partnerType, setPartnerType] = useState("Properties");
  const [openFaq, setOpenFaq] = useState(0);
  const [heroMediaIndex, setHeroMediaIndex] = useState(0);

  const isPartner = false;
  const partner = partnerCategories[partnerType];
  const faqs = isPartner ? partnerFaqs : residentFaqs;
  const hero = {
    eyebrow: "Live Local Discovery",
    title: "Where downtown decisions happen.",
    subhead: "Downtown Perks connects residents, guests, buildings, venues, brands, and civic partners through one map-native discovery layer for Downtown Austin.",
    body: "No app download. No feed to manage. Just the places, perks, events, and signals that matter nearby.",
    primary: "Open the map",
    primaryHref: "/map?mode=resident&tab=map&filter=All",
    secondary: "Explore partner plans",
    secondaryHref: "/marketing/pricing",
  };
  const activeHeroMedia = heroMedia[heroMediaIndex] || heroMedia[0];

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setHeroMediaIndex((current) => (current + 1) % heroMedia.length);
    }, 5200);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <main className="dp-home-page bg-white text-[#0B1F33]">
      <section className="dp-marketing-hero relative overflow-hidden pb-14 pt-28 md:pb-20">
        <div className="relative dp-layout-shell">
          <div className="dp-marketing-hero-grid">
            <div className="dp-marketing-hero-copy">
              <span className="dp-label mb-4 block">{hero.eyebrow}</span>
              <h1>{hero.title}</h1>
              <p className="mt-5 max-w-2xl text-[16px] leading-[1.65] text-[#0B1F33]/68">{hero.subhead}</p>
              {hero.body && <p className="mt-5 max-w-2xl text-[15px] leading-[1.75] text-[#0B1F33]/68">{hero.body}</p>}
              <div className="dp-marketing-hero-actions mt-7 flex flex-wrap items-center gap-2">
                <Link to={hero.primaryHref} className="dp-marketing-primary-link">
                  {hero.primary}
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5 text-[#BFA46A]" />
                </Link>
                <Link to={hero.secondaryHref} className="dp-marketing-secondary-link">
                  {hero.secondary}
                </Link>
              </div>
            </div>
            <div className="dp-marketing-hero-media" aria-label="Downtown Perks local discovery preview">
              <div className="dp-marketing-hero-frame">
                {heroMedia.map((item, index) => (
                  <img
                    key={item.src}
                    src={item.src}
                    alt=""
                    aria-hidden={index === heroMediaIndex ? "false" : "true"}
                    className={index === heroMediaIndex ? "is-active" : ""}
                    loading={index === 0 ? "eager" : "lazy"}
                  />
                ))}
                <div className="dp-marketing-hero-caption">
                  <span>{activeHeroMedia.label}</span>
                  <p>{activeHeroMedia.title}</p>
                </div>
              </div>
              <div className="dp-marketing-hero-dots" aria-label="Hero media slides">
                {heroMedia.map((item, index) => (
                  <button
                    key={item.src}
                    type="button"
                    aria-label={`Show ${item.label}`}
                    aria-pressed={index === heroMediaIndex}
                    onClick={() => setHeroMediaIndex(index)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="dp-marketing-value-section">
        <div className="dp-layout-shell">
          <div className="dp-marketing-value-grid">
            {marketingValueSections.map((section) => (
              <article key={section.eyebrow} className="dp-marketing-value-panel">
                <span className="dp-label">{section.eyebrow}</span>
                <h2>{section.title}</h2>
                <p>{section.body}</p>
                <ul>
                  {section.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="dp-marketing-partner-types">
        <div className="dp-layout-shell">
          <div className="dp-marketing-section-head">
            <span className="dp-label">Partner Types</span>
            <h2>Built around how downtown actually works.</h2>
            <p>Properties, hotels, venues, brands, civic teams, and real estate partners can each show up in the way that matches their role.</p>
          </div>
          <div className="dp-marketing-type-grid">
            {marketingPartnerTypes.map(([title, copy]) => (
              <article key={title}>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CommunityStoriesSection />

      <section className="py-12 md:py-16">
        <div className="dp-layout-shell">
          {!isPartner ? (
            <>
              <div className="mb-7 max-w-2xl">
                <span className="dp-label mb-3 block">Residents</span>
                <h2 className="font-heading text-3xl font-medium">Downtown, in one place</h2>
                <p className="mt-3 text-[14px] leading-relaxed text-[#0B1F33]/64">
                  You live downtown but expect it to be easier. Easier to navigate. Easier to connect. More useful day to day. Instead, everything you want is spread across too many places. Google for restaurants. Instagram for events. Text three friends to find the best happy hour. Downtown Perks fixes that. Because the problem isn’t what to do next — it’s the effort it takes to decide.
                </p>
                <h3 className="mt-6 font-heading text-2xl font-medium">Search less. Do more.</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-[#0B1F33]/64">
                  Downtown Perks brings places, events, and perks together so it's easier to decide what to do next. A simple live map for people who live downtown — and the businesses that want to meet them there.
                </p>
              </div>
              <DowntownPerksHowItWorks
                id="resident-how-it-works"
                initialStep={2}
                className="mt-4 pb-0 pt-8 md:pt-10"
              />
            </>
          ) : (
            <>
              <div className="mb-7 max-w-3xl">
                <span className="dp-label mb-3 block">Your role</span>
                <h2 className="font-heading text-3xl font-medium">Spend less. Do more.</h2>
                <p className="mt-3 text-[14px] leading-relaxed text-[#0B1F33]/64">
                  Start with a focused launch. Decide with real data. No setup. No long-term commitment. Just a clear path to downtown action.
                </p>
              </div>
              <div className="grid gap-6 lg:grid-cols-[250px_1fr]">
                <div className="flex gap-2 overflow-x-auto lg:block lg:space-y-2">
                  {Object.keys(partnerCategories).map((item) => (
                    <button
                      key={item}
                      onClick={() => {
                        setPartnerType(item);
                        setOpenFaq(0);
                      }}
                      className={item === partnerType
                        ? "min-w-[145px] bg-[#0B1F33] px-4 py-2.5 text-left text-[13px] font-semibold text-white shadow-[0_12px_40px_rgba(11,31,51,0.10)] lg:w-full"
                        : "min-w-[145px] bg-white/72 px-4 py-2.5 text-left text-[13px] font-semibold text-[#425466] shadow-[0_12px_40px_rgba(11,31,51,0.04)] transition hover:-translate-y-0.5 hover:bg-white hover:text-[#0B1F33] hover:shadow-[0_12px_40px_rgba(11,31,51,0.06)] lg:w-full"}
                    >
                      {item}
                    </button>
                  ))}
                </div>
                <article className="bg-white p-6 shadow-[0_18px_56px_rgba(11,31,51,0.055),0_0_32px_rgba(191,164,106,0.05)]">
                  <div className="grid gap-5 md:grid-cols-[1fr_220px]">
                    <div>
                      <h3 className="font-heading text-3xl font-medium">{partnerType}</h3>
                      <p className="mt-4 text-[14px] leading-relaxed text-[#0B1F33]/68">{partner.body}</p>
                      <p className="mt-5 font-heading text-2xl italic">You're not selling square footage. You're selling everything around it.</p>
                    </div>
                    <div className="bg-white p-4 shadow-[0_14px_44px_rgba(11,31,51,0.05),0_0_26px_rgba(191,164,106,0.045)]">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0B1F33]/50">Pricing</div>
                      <div className="mt-2 text-2xl font-semibold">{partner.pricing}</div>
                      <Link to={partner.href} className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-md bg-[#0B1F33] px-4 text-xs font-semibold uppercase tracking-[0.14em] text-white">
                        {partner.cta}
                      </Link>
                    </div>
                  </div>
                </article>
              </div>
            </>
          )}
        </div>
      </section>

      <section id="pricing" className="relative overflow-hidden bg-white py-12 text-[#0B1F33] shadow-[0_-18px_60px_rgba(11,31,51,0.045),0_0_44px_rgba(191,164,106,0.045)] md:py-16">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent)]" aria-hidden="true" />
        <div className="pointer-events-none absolute -left-16 top-1/2 h-56 w-56 -translate-y-1/2 bg-white/8 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute right-[8%] top-0 h-40 w-40 bg-white/6 blur-3xl" aria-hidden="true" />
        <div className="dp-layout-shell grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="relative">
            <span className="dp-label mb-3 block">Pricing</span>
            <h2 className="font-heading text-3xl font-medium">
              {isPartner ? "A smarter way to activate downtown" : "Ready when you are."}
            </h2>
            <p className="mt-3 text-[14px] leading-relaxed text-[#0B1F33]/66">
              {isPartner
                ? "Final pricing reflects locations, placements, and campaign scope."
                : "It’s 6:30. You’re home. You want dinner, a drink, or something to do without scrolling for 20 minutes. You pick what’s close, what’s open, and what sounds fun."}
            </p>
          </div>
          <div className="relative grid gap-2 md:grid-cols-3">
            {(isPartner
                ? [
                  ["Properties", "$199-$2,388/year"],
                  [partnerType, partner.pricing],
                  ["Annual model", "Partner subscriptions only"],
                ]
              : [
                  ["Resident Map", "Included"],
                  ["Perks Card", "Building amenity"],
                  ["Events", "RSVP in one tap"],
                ]
            ).map(([label, value]) => (
              <div key={label} className="flex min-h-[58px] items-center justify-between gap-3 bg-white px-3.5 py-3 shadow-[0_10px_30px_rgba(11,31,51,0.04),0_0_20px_rgba(191,164,106,0.035)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_34px_rgba(11,31,51,0.055),0_0_24px_rgba(191,164,106,0.05)]">
                <div className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[#BFA46A]">{label}</div>
                <div className="shrink-0 text-[13px] font-semibold text-[#0B1F33]">{value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="dp-layout-shell">
          <div className="mb-7 max-w-2xl">
            <span className="dp-label mb-3 block">{isPartner ? "Partner questions" : "Resident questions"}</span>
            <h2 className="font-heading text-3xl font-medium">FAQs</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {faqs.map(([question, answer], index) => (
              <button
                key={question}
                onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                className="bg-white p-5 text-left shadow-[0_12px_40px_rgba(11,31,51,0.04),0_0_24px_rgba(191,164,106,0.035)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_44px_rgba(11,31,51,0.055),0_0_28px_rgba(191,164,106,0.05)]"
                aria-expanded={openFaq === index}
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-body text-[14px] font-semibold">{question}</h3>
                  <Sparkles className="h-4 w-4 shrink-0 text-[#BFA46A]" />
                </div>
                {openFaq === index && <p className="mt-3 text-[13px] leading-relaxed text-[#0B1F33]/64">{answer}</p>}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="relative py-12 md:py-16">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(11,31,51,0.08),transparent)]" aria-hidden="true" />
        <div className="dp-layout-shell grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <span className="dp-label mb-3 block">{isPartner ? "Partner access" : "Resident access"}</span>
            <h2 className="font-heading text-3xl font-medium">
              {isPartner ? "Tell us what you want to activate" : "Check if your building is part of Downtown Perks."}
            </h2>
            <p className="mt-3 text-[14px] leading-relaxed text-[#0B1F33]/64">
              {isPartner ? "Choose your partner type and send the details. We will find the right setup." : "If you sign up now and your building joins later, you will be refunded."}
            </p>
          </div>
          <form className="grid gap-3 bg-white p-5 shadow-[0_12px_40px_rgba(11,31,51,0.06),0_0_28px_rgba(191,164,106,0.04)]">
            {(isPartner ? ["Organization Name", "Your Name & Role", "Email", "Phone"] : ["Your Name", "Phone Number", "Email", "Building", "How did you hear about us?"]).map((label) => {
              const isBuildingSelect = !isPartner && label === "Building";
              return (
                <label key={label} className="grid gap-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0B1F33]/50">{label}</span>
                  {isBuildingSelect ? (
                    <select
                      defaultValue=""
                      className="h-10 rounded-md bg-white px-3 text-[13px] text-[#0B1F33] shadow-[inset_0_0_0_1px_rgba(11,31,51,0.04)] outline-none transition focus:shadow-[inset_0_0_0_1px_rgba(191,164,106,0.10),0_0_24px_rgba(191,164,106,0.08)]"
                    >
                      <option value="" disabled>Select your building</option>
                      {residentBuildingOptions.map((building) => (
                        <option key={building} value={building}>{building}</option>
                      ))}
                    </select>
                  ) : (
                    <input className="h-10 rounded-md bg-white px-3 text-[13px] shadow-[inset_0_0_0_1px_rgba(11,31,51,0.04)] outline-none transition focus:shadow-[inset_0_0_0_1px_rgba(191,164,106,0.10),0_0_24px_rgba(191,164,106,0.08)]" />
                  )}
                </label>
              );
            })}
            <button type="button" className="mt-2 inline-flex h-8 items-center justify-center rounded-[2px] bg-[#0B1F33] px-3.5 text-[11px] font-medium uppercase tracking-normal text-white transition hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BFA46A]">
              {isPartner ? "See how it works for you" : "Get My Perks Card"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
