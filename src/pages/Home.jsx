import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  CreditCard,
  MapPin,
  Search,
  Sparkles,
} from "lucide-react";
import DowntownPerksHero from "@/components/shared/DowntownPerksHero";

const partnerCategories = {
  Properties: {
    pricing: "$199/year",
    cta: "Bring this to your property",
    href: "/partners/properties",
    body: "Management pays. Residents stay. Your address is your key to unlock downtown.",
    faq: "Annual property tier with resident access, reporting, and building placement.",
  },
  Hotels: {
    pricing: "$149/year",
    cta: "Use this for guests",
    href: "/partners/hospitality",
    body: "Extend the stay beyond your lobby. One scan. Every option. Guests navigate. You benefit.",
    faq: "90-day pilot. See what guests actually do.",
  },
  Venues: {
    pricing: "$79-$149/year",
    cta: "Discuss activation",
    href: "/partners/venues",
    body: "Show up in the moment that counts. Not reach. Relevance. Not impressions. Intent.",
    faq: "Choose the annual venue tier that fits your placement, offer, and reporting needs.",
  },
  Brands: {
    pricing: "$149-$199/year",
    cta: "Start a conversation",
    href: "/partners/brands",
    body: "Buy the moment, not the impression. Context beats scale. Timing beats frequency.",
    faq: "Test it. Measure it. Scale it.",
  },
  Civic: {
    pricing: "$49-$79/year",
    cta: "Talk to us",
    href: "/partners/civic",
    body: "Turn attendance into participation. Discovery drives turnout. Access drives engagement.",
    faq: "Start with 90 days. Keep what works.",
  },
};

const residentFaqs = [
  ["Do I need to download an app?", "No. It's a mobile web experience. Scan a QR code, and you're in. No download. No login. No extra platform."],
  ["Does it cost anything for residents?", "Your building covers resident access as part of the amenity. You get map access, event RSVPs, and your perks card through the building program."],
  ["Is my info shared with partners?", "No. We track actions for reporting, not personal contact information. Your details aren't shared unless you explicitly opt in. Privacy is the default."],
  ["Who can join?", "Downtown residents in participating buildings. It's exclusive by design, built for people who actually live here."],
  ["How do resident connections work?", "See an event or activity you want to join. Use Connect Nearby to signal interest and reach out to others who are going. It's opt-in, lightweight, and designed to make it easier to show up together."],
];

const partnerFaqs = [
  ["Do venues pay to join?", "Yes. Venue plans are $79-$149/year depending on placement, offers, events, and reporting needs."],
  ["What do buildings pay?", "Properties use the $199/year annual tier, which includes resident access, building placement, reporting, and engagement tools."],
  ["How fast can a partner launch?", "7-10 days. We handle setup, map placement, QR generation, and entry point coordination."],
  ["What gets tracked?", "Scans, saves, RSVPs, and redemptions. You get reporting snapshots at 30, 60, and 90 days to see what's working."],
  ["What kind of perks?", "Discounts on food and drinks, priority access to events, welcome offers, and members-only specials. Each business sets its own perks."],
  ["Can partners update listings?", "Yes. Partners get a simple dashboard to update hours, add perks, post events, and adjust map presence."],
  ["Where is this available?", "Downtown Austin. We're starting with one district, proving the model, then expanding to other downtown corridors based on partner and resident demand."],
];

const residentCategories = [
  { icon: Search, title: "Places nearby", body: "Tap. Learn. Go. Every location shows what it is, what it offers, and how far you are from the door." },
  { icon: MapPin, title: "Around the corner", body: "Everything you need, within walking distance. See what's close, decide quickly, and go." },
  { icon: CalendarDays, title: "Events happening now", body: "See what is on. RSVP in one tap. From happy hours to local programming without leaving the map." },
  { icon: CreditCard, title: "Want to live here?", body: "Browse what's available and what comes with it. See properties nearby, not just listings online." },
];

const searchIntentPrompts = [
  ["Where do you want to go?", "Coffee. Dinner. Groceries. Fitness. Drinks. All within walking distance."],
  ["What do you want to do?", "See what is on tonight. Find something worth showing up for."],
  ["Who do you want to meet?", "See who is going. Join in. Make a plan."],
];

export default function Home() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("resident");
  const [partnerType, setPartnerType] = useState("Properties");
  const [query, setQuery] = useState("");
  const [openFaq, setOpenFaq] = useState(0);

  const isPartner = mode === "partner";
  const partner = partnerCategories[partnerType];
  const faqs = isPartner ? partnerFaqs : residentFaqs;

  const hero = useMemo(() => {
    if (isPartner) {
      return {
        eyebrow: "Partner Mode",
        title: "Turn residents into",
        titleAccent: "regulars.",
        lead: "Be the place people choose next.",
        support: "People are already downtown. Already walking. Already deciding. You don't need more attention. You need better timing. Downtown Perks puts you in front of them when it matters.",
        primary: "See how it works for you",
        primaryHref: "/partners#contact",
        secondary: "Explore Downtown",
        secondaryHref: "/map?mode=resident&tab=map",
        image: "/images/map-entities/perks/partner_dining_patio_1779052819620.png",
        imageLabel: "LOCAL VISIBILITY",
      };
    }

    return {
      eyebrow: "Resident View",
      title: "Where downtown",
      titleAccent: "meets you.",
      lead: "Everything nearby — in one map.",
      support: "Built for people who actually live here — and the places that make it feel like home. From coffee to dinner, live events, and everything in between, plus the perks you didn’t know you had. All in one place. No extra apps. No logins. No platforms or directories guessing what matters.",
      primary: "Explore Downtown",
      primaryHref: "/map?mode=resident&tab=map",
      secondary: "Get Your Perks Card",
      secondaryHref: "/card",
      image: "/images/splash/rooftop-nearby.jpeg",
      imageLabel: "LIVE DISCOVERY",
    };
  }, [isPartner]);

  function submitSearch(event) {
    event.preventDefault();
    const targetMode = isPartner ? "partner" : "resident";
    const prompt = query ? `&prompt=${encodeURIComponent(query)}` : "";
    navigate(`/map?mode=${targetMode}&tab=map${prompt}`);
  }

  return (
    <main className="bg-white text-[#0B1F33]">
      <DowntownPerksHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        titleAccent={hero.titleAccent}
        lead={hero.lead}
        support={hero.support}
        primary={hero.primary}
        primaryHref={hero.primaryHref}
        secondary={hero.secondary}
        secondaryHref={hero.secondaryHref}
        image={hero.image}
        imageAlt={isPartner ? "Downtown partner patio moment" : "Downtown Austin rooftop moment"}
        imageLabel={hero.imageLabel}
        className="pt-28"
      />

      <section className="px-5 py-12 md:py-16">
        <div className="mx-auto max-w-6xl">
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
              <div className="grid gap-3 md:grid-cols-4">
                {residentCategories.map((item) => {
                  const Icon = item.icon;
                  return (
                    <article key={item.title} className="dp-glass-card p-5">
                      <Icon className="mb-4 h-5 w-5 text-[#B38F4F]" />
                      <h3 className="font-body text-[14px] font-semibold">{item.title}</h3>
                      <p className="mt-2 text-[12px] leading-relaxed text-[#0B1F33]/62">{item.body}</p>
                    </article>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <div className="mb-7 max-w-3xl">
                <span className="dp-label mb-3 block">Your role</span>
                <h2 className="font-heading text-3xl font-medium">Spend less. Do more.</h2>
                <p className="mt-3 text-[14px] leading-relaxed text-[#0B1F33]/64">
                  Start with a pilot. Decide with real data. No setup. No long-term commitment. Just a live test.
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
                <article className="dp-glass-card p-6">
                  <div className="grid gap-5 md:grid-cols-[1fr_220px]">
                    <div>
                      <h3 className="font-heading text-3xl font-medium">{partnerType}</h3>
                      <p className="mt-4 text-[14px] leading-relaxed text-[#0B1F33]/68">{partner.body}</p>
                      <p className="mt-5 font-heading text-2xl italic">You're not selling square footage. You're selling everything around it.</p>
                    </div>
                    <div className="bg-white/68 p-4 shadow-[0_12px_40px_rgba(11,31,51,0.05)]">
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

      <section id="pricing" className="relative overflow-hidden bg-[#0B1F33] px-5 py-12 text-[#F7F8FB] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_-18px_60px_rgba(11,31,51,0.08)] md:py-16">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent)]" aria-hidden="true" />
        <div className="pointer-events-none absolute -left-16 top-1/2 h-56 w-56 -translate-y-1/2 bg-white/8 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute right-[8%] top-0 h-40 w-40 bg-white/6 blur-3xl" aria-hidden="true" />
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="relative">
            <span className="dp-label mb-3 block">Pricing</span>
            <h2 className="font-heading text-3xl font-medium">
              {isPartner ? "A smarter way to activate downtown" : "Ready when you are."}
            </h2>
            <p className="mt-3 text-[14px] leading-relaxed text-[#F7F8FB]/66">
              {isPartner
                ? "Final pricing reflects footprint, visibility, and activation."
                : "It’s 6:30. You’re home. You want dinner, a drink, or something to do without scrolling for 20 minutes. You pick what’s close, what’s open, and what sounds fun."}
            </p>
          </div>
          <div className="relative grid gap-3 md:grid-cols-3">
            {(isPartner
                ? [
                  ["Properties", "$199/year"],
                  [partnerType, partner.pricing],
                  ["Top tier", "$199/year"],
                ]
              : [
                  ["Resident Map", "Included"],
                  ["Perks Card", "Building amenity"],
                  ["Events", "RSVP in one tap"],
                ]
            ).map(([label, value]) => (
              <div key={label} className="bg-white/7 p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06),0_16px_40px_rgba(11,31,51,0.10)] transition hover:-translate-y-0.5 hover:bg-white/10 hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08),0_18px_44px_rgba(11,31,51,0.12)]">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#B38F4F]">{label}</div>
                <div className="mt-2 text-xl font-semibold text-white">{value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-12 md:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-7 max-w-2xl">
            <span className="dp-label mb-3 block">FAQs</span>
            <h2 className="font-heading text-3xl font-medium">{isPartner ? "Partner questions" : "Resident questions"}</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {faqs.map(([question, answer], index) => (
              <button
                key={question}
                onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                className="bg-white/82 p-5 text-left shadow-[0_12px_40px_rgba(11,31,51,0.04)] transition hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_12px_40px_rgba(11,31,51,0.06)]"
                aria-expanded={openFaq === index}
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-body text-[14px] font-semibold">{question}</h3>
                  <Sparkles className="h-4 w-4 shrink-0 text-[#B38F4F]" />
                </div>
                {openFaq === index && <p className="mt-3 text-[13px] leading-relaxed text-[#0B1F33]/64">{answer}</p>}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="relative px-5 py-12 md:py-16">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(11,31,51,0.08),transparent)]" aria-hidden="true" />
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <span className="dp-label mb-3 block">{isPartner ? "Get started" : "Ready When You Are"}</span>
            <h2 className="font-heading text-3xl font-medium">
              {isPartner ? "Tell us what you want to activate" : "Check if your building is part of Downtown Perks."}
            </h2>
            <p className="mt-3 text-[14px] leading-relaxed text-[#0B1F33]/64">
              {isPartner ? "Choose your partner type and send the details. We will find the right setup." : "If you sign up now and your building joins later, you will be refunded."}
            </p>
          </div>
          <form className="grid gap-3 bg-white/82 p-5 shadow-[0_12px_40px_rgba(11,31,51,0.06)]">
            {(isPartner ? ["Organization Name", "Your Name & Role", "Email", "Phone"] : ["Your Name", "Phone Number", "Email", "Building Address", "How did you hear about us?"]).map((label) => (
              <label key={label} className="grid gap-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0B1F33]/50">{label}</span>
                <input className="h-10 rounded-md bg-white px-3 text-[13px] shadow-[inset_0_0_0_1px_rgba(11,31,51,0.04)] outline-none transition focus:shadow-[inset_0_0_0_1px_rgba(179,143,79,0.10),0_0_24px_rgba(179,143,79,0.08)]" />
              </label>
            ))}
            <button type="button" className="mt-2 inline-flex h-10 items-center justify-center rounded-md bg-[#0B1F33] px-5 text-xs font-semibold uppercase tracking-[0.16em] text-white">
              {isPartner ? "See how it works for you" : "Get My Perks Card"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
