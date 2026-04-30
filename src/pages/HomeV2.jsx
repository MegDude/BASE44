import { useMemo, useState } from "react";

const routes = {
  explore: "/downtown-perks/explore",
  card: "/downtown-perks/card",
  events: "/downtown-perks/events",
  perks: "/downtown-perks/perks",
  about: "/downtown-perks/about",
  partners: "/partners",
  properties: "/partners/properties",
  hotels: "/partners/hotels",
  venues: "/partners/venues",
  brands: "/partners/brands",
  civic: "/partners/civic",
  workspace: "/partner-workspace",
  dashboard: "/dashboard",
};

const filters = ["Venues", "Events", "Perks", "5 min walk"];
const categories = ["All", "Places", "Offers", "Events", "Properties"];
const partnerTypes = ["Properties", "Hotels", "Venues", "Brands", "Civic"];
const leadTypes = ["Buildings", "Hotels", "Venues", "Brands", "Civic", "Real Estate", "Residents"];

const featureItems = [
  "Restaurants, bars, coffee shops, and services nearby",
  "Events happening tonight, ready to RSVP",
  "Local perks from places you'd go anyway",
  "Places worth coming back to",
  "People around you, when you want to be social",
];

const howItWorks = [
  "See what it is, why it matters, and how close you are.",
  "Save it or go now.",
  "Plan ahead — or decide in the moment.",
  "Show your card. Get the perk.",
];

const pricing = [
  ["Properties", "Multifamily, condos, apartments", "Free · $39 · $99 / yr", "Management pays. Residents stay.", "Your address is your key to downtown.", routes.properties],
  ["Hotels", "Hotels, boutiques, extended stays", "$99–$149 / yr", "Extend the stay beyond your lobby.", "One scan. Every option nearby.", routes.hotels],
  ["Venues", "Restaurants, bars, fitness, wellness", "Free for 12 months", "Show up in the moment that counts.", "Not reach. Relevance. Not impressions. Intent.", routes.venues],
  ["Brands", "Activations, campaigns, sponsorships", "$99–$149 / yr", "Buy the moment, not the impression.", "Context beats scale. Timing beats frequency.", routes.brands],
  ["Civic", "Cities, districts, chambers", "$49–$79 / yr", "Turn attendance into participation.", "Discovery drives turnout.", routes.civic],
];

const faqs = [
  ["What is Downtown Perks?", "Downtown Perks is a live downtown map that brings places, events, perks, buildings, and local context into one working layer. It helps people decide what to do based on what is actually nearby and useful right now."],
  ["Do I need to download an app?", "No. Downtown Perks works through the browser, QR codes, and a simple resident card flow."],
  ["Is this just a list of deals?", "No. Perks are one layer inside a broader map of places, events, properties, and local activity."],
  ["Who is it built for?", "It is built for residents first, then for properties, venues, hotels, brands, and civic partners who want to reach people already nearby."],
  ["How do people use it?", "They open the map, filter by intent or distance, save or RSVP, and use the card when there is a perk or access moment."],
  ["Why is the map central?", "Because downtown decisions are spatial. People need to know what is close, open, relevant, and worth acting on now."],
  ["How is performance measured?", "The system tracks signals like scans, saves, RSVPs, redemptions, and partner engagement."],
  ["Is this one system or multiple?", "It is one shared neighborhood layer with resident, partner, dashboard, event, perk, and property views."],
];

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
      <path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ButtonLink({ href, children, variant = "primary", className = "" }) {
  const base = "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#cfaf5a]/50";
  const styles = variant === "primary"
    ? "bg-[#071b2f] text-white shadow-[0_18px_40px_rgba(7,27,47,0.18)] hover:bg-[#0b1f33]"
    : "border border-[#071b2f]/15 bg-white/75 text-[#071b2f] hover:bg-white";
  return <a href={href} className={`${base} ${styles} ${className}`}>{children}<ArrowIcon /></a>;
}

function SectionLabel({ children }) {
  return <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#64748b]">{children}</p>;
}

function MapFirstHero() {
  return (
    <section className="relative overflow-hidden px-5 pb-14 pt-10 sm:px-8 lg:px-12 lg:pb-20">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_16%_10%,rgba(207,175,90,.18),transparent_26%),radial-gradient(circle_at_82%_18%,rgba(7,27,47,.10),transparent_24%),linear-gradient(180deg,#fbfcff,#f7f8fb)]" />
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.86fr_1.14fr] lg:items-stretch">
        <div className="flex flex-col justify-center rounded-[2rem] bg-white/45 p-6 backdrop-blur md:p-9">
          <SectionLabel>Downtown Perks</SectionLabel>
          <h1 className="mt-5 text-5xl font-semibold leading-[0.92] tracking-[-0.055em] text-[#071b2f] sm:text-6xl lg:text-7xl">Where downtown meets you</h1>
          <p className="mt-5 max-w-xl text-xl leading-8 text-[#475569]">Everything nearby — in one map.</p>
          <div className="mt-7 rounded-2xl border border-[#071b2f]/10 bg-white/85 p-3 shadow-[0_18px_50px_rgba(7,27,47,0.08)]">
            <div className="flex flex-col gap-3 sm:flex-row">
              <input aria-label="Ask the map" placeholder="Where should I go right now?" className="min-h-12 flex-1 rounded-xl bg-[#f7f8fb] px-4 text-sm outline-none ring-1 ring-[#071b2f]/8 focus:ring-[#cfaf5a]" />
              <ButtonLink href={routes.explore}>Open map</ButtonLink>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {filters.map((filter) => <a key={filter} href={routes.explore} className="rounded-full bg-[#071b2f]/5 px-3 py-2 text-xs font-semibold text-[#071b2f] hover:bg-[#cfaf5a]/15">{filter}</a>)}
            </div>
          </div>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={routes.explore} variant="secondary">Explore downtown</ButtonLink>
            <ButtonLink href={routes.explore} variant="secondary">Ask the map</ButtonLink>
          </div>
        </div>

        <div className="relative min-h-[520px] overflow-hidden rounded-[2rem] bg-[#071b2f] p-5 shadow-[0_34px_100px_rgba(7,27,47,0.26)]">
          <img src="https://images.unsplash.com/photo-1531218150217-54595bc2b934?auto=format&fit=crop&w=1400&q=80" alt="Downtown Austin" className="absolute inset-0 h-full w-full object-cover opacity-35" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(207,175,90,.32),transparent_22%),linear-gradient(135deg,rgba(7,27,47,.92),rgba(11,31,51,.82))]" />
          <div className="absolute left-[12%] top-[20%] h-3 w-3 rounded-full bg-[#cfaf5a] shadow-[0_0_0_10px_rgba(207,175,90,.18)]" />
          <div className="absolute left-[62%] top-[31%] h-3 w-3 rounded-full bg-[#cfaf5a] shadow-[0_0_0_10px_rgba(207,175,90,.18)]" />
          <div className="absolute left-[42%] top-[58%] h-3 w-3 rounded-full bg-[#cfaf5a] shadow-[0_0_0_10px_rgba(207,175,90,.18)]" />
          <div className="relative z-10 max-w-md rounded-2xl border border-white/15 bg-white/10 p-4 text-white backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.28em] text-white/60">Live map layer</p>
            <h2 className="mt-2 text-2xl font-semibold">Places, events, perks, and properties in one view.</h2>
          </div>
          <div className="absolute bottom-5 left-5 right-5 z-10 rounded-2xl bg-white/95 p-4 text-[#071b2f] shadow-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#64748b]">Nearby result</p>
            <h3 className="mt-1 text-2xl font-semibold">Jo's Coffee</h3>
            <p className="mt-1 text-sm text-[#64748b]">Coffee. Quick stops. Daily rituals. Nearby perk · 5-minute walk</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HomeV2() {
  const [category, setCategory] = useState("All");
  const [partnerType, setPartnerType] = useState("Properties");
  const [leadType, setLeadType] = useState("Buildings");
  const [openFaq, setOpenFaq] = useState(0);

  const leadHeadline = useMemo(() => {
    if (leadType === "Residents") return "Get your downtown card.";
    return "90-day free pilot.";
  }, [leadType]);

  return (
    <main className="min-h-screen bg-[#f7f8fb] text-[#142033]">
      <MapFirstHero />

      <section className="px-5 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div><SectionLabel>Downtown, in one place</SectionLabel><h2 className="mt-4 text-4xl font-semibold tracking-[-0.045em] text-[#071b2f] sm:text-6xl">You live downtown but expect it to be easier.</h2></div>
          <div className="space-y-5 text-lg leading-8 text-[#475569]"><p>Easier to navigate. Easier to connect. More useful day to day. Instead, everything you want is spread across too many places.</p><p>Google for restaurants. Instagram for events. Text three friends to find the best happy hour.</p><p>Downtown Perks fixes that. Because the problem isn't what to do next — it's the effort it takes to decide.</p></div>
        </div>
      </section>

      <section className="px-5 py-14 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl rounded-[2.5rem] bg-white/75 p-7 shadow-[0_24px_80px_rgba(7,27,47,0.08)] md:p-10">
          <SectionLabel>Search less. Do more.</SectionLabel>
          <h2 className="mt-3 max-w-4xl text-4xl font-semibold tracking-[-0.045em] text-[#071b2f] sm:text-6xl">One map. Everything nearby.</h2>
          <p className="mt-5 max-w-4xl text-lg leading-8 text-[#64748b]">Downtown Perks brings places, events, and perks together so it's easier to decide what to do next. A simple live map for people who live downtown — and the businesses that want to meet them there.</p>
          <p className="mt-5 max-w-4xl text-lg leading-8 text-[#64748b]">Places, plans, and perks in one simple view. No app downloads. No account setup. No switching between apps. No piecing things together. Just what matters, in one place.</p>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <SectionLabel>What you can do</SectionLabel>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.045em] text-[#071b2f] sm:text-6xl">Everything works together — so you show up more.</h2>
            <p className="mt-5 text-lg leading-8 text-[#64748b]">Spend less time searching and more time showing up. Everything you need to move through downtown is in one place.</p>
            <div className="mt-7 flex flex-wrap gap-2">{categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={`rounded-full px-4 py-2 text-sm font-semibold ${category === item ? "bg-[#071b2f] text-white" : "bg-white text-[#071b2f]"}`}>{item}</button>)}</div>
          </div>
          <div className="rounded-[2rem] bg-white/80 p-6 shadow-[0_20px_70px_rgba(7,27,47,0.08)]">
            <h3 className="text-2xl font-semibold text-[#071b2f]">Find What You Need</h3>
            <div className="mt-5 grid gap-3">{featureItems.map((item) => <div key={item} className="rounded-2xl bg-[#f7f8fb] px-4 py-3 text-sm text-[#475569]">{item}</div>)}</div>
            <div className="mt-6 rounded-2xl border border-[#cfaf5a]/30 bg-[#cfaf5a]/10 p-5"><h4 className="text-xl font-semibold text-[#071b2f]">Jo's Coffee</h4><p className="mt-1 text-sm text-[#64748b]">Coffee. Quick stops. Daily rituals.</p><p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#071b2f]">Nearby perk · 5-minute walk</p><ButtonLink href={routes.card} className="mt-4">Show Card</ButtonLink></div>
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <SectionLabel>How it works</SectionLabel><h2 className="mt-3 text-4xl font-semibold tracking-[-0.045em] text-[#071b2f] sm:text-6xl">Tap. Learn. Decide.</h2>
          <div className="mt-9 grid gap-4 md:grid-cols-4">{howItWorks.map((copy, index) => <div key={copy} className="rounded-[1.5rem] bg-white/75 p-5 shadow-[0_16px_50px_rgba(7,27,47,0.06)]"><span className="text-sm font-bold text-[#cfaf5a]">0{index + 1}</span><p className="mt-4 leading-7 text-[#475569]">{copy}</p></div>)}</div>
          <p className="mt-8 max-w-3xl text-lg leading-8 text-[#64748b]">No extra steps. No guesswork. Just the shortest distance between "maybe" and "I'm going."</p>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-3">
          <div className="rounded-[2rem] bg-[#071b2f] p-7 text-white"><SectionLabel>Events Happening Now</SectionLabel><h2 className="mt-4 text-3xl font-semibold">See what's on.</h2><p className="mt-4 text-white/70">RSVP in one tap. From happy hours to local programming — without leaving the map.</p><ButtonLink href={routes.events} className="mt-6">See events</ButtonLink></div>
          <div className="rounded-[2rem] bg-white/80 p-7 shadow-[0_20px_70px_rgba(7,27,47,0.08)]"><SectionLabel>Want to live here?</SectionLabel><h2 className="mt-4 text-3xl font-semibold text-[#071b2f]">Browse properties nearby.</h2><p className="mt-4 text-[#64748b]">Filter to Properties to view participating buildings, rentals, and homes for sale. Tap any building for availability and what's walkable.</p><ButtonLink href={routes.explore} variant="secondary" className="mt-6">View properties</ButtonLink></div>
          <div className="rounded-[2rem] bg-white/80 p-7 shadow-[0_20px_70px_rgba(7,27,47,0.08)]"><SectionLabel>Perks Card</SectionLabel><h2 className="mt-4 text-3xl font-semibold text-[#071b2f]">Get Your Perks Card Now</h2><p className="mt-4 text-[#64748b]">Scan the QR code to get your Perks Card sent directly to your phone.</p><ButtonLink href={routes.card} variant="secondary" className="mt-6">Sign me up</ButtonLink></div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto rounded-[2.5rem] bg-white/70 p-7 shadow-[0_20px_70px_rgba(7,27,47,0.08)] md:p-10 lg:max-w-7xl">
          <SectionLabel>What's Around the Corner</SectionLabel><h2 className="mt-4 text-4xl font-semibold tracking-[-0.045em] text-[#071b2f] sm:text-6xl">Everything you need, within walking distance.</h2><p className="mt-5 max-w-3xl text-lg leading-8 text-[#64748b]">See what's close, decide quickly, and go.</p><ButtonLink href={routes.explore} className="mt-7">Explore nearby</ButtonLink>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div><SectionLabel>Turn Residents Into Regulars</SectionLabel><h2 className="mt-4 text-4xl font-semibold tracking-[-0.045em] text-[#071b2f] sm:text-6xl">Be the place people choose next.</h2><p className="mt-5 text-lg leading-8 text-[#64748b]">People are already downtown. Already walking. Already deciding. Downtown Perks puts you in front of them when it matters — not broad advertising, better timing.</p></div>
          <div className="rounded-[2rem] bg-[#071b2f] p-6 text-white">
            <div className="flex flex-wrap gap-2">{partnerTypes.map((type) => <button key={type} onClick={() => setPartnerType(type)} className={`rounded-full px-4 py-2 text-sm font-semibold ${partnerType === type ? "bg-[#cfaf5a] text-[#071b2f]" : "bg-white/10 text-white"}`}>{type}</button>)}</div>
            <h3 className="mt-7 text-3xl font-semibold">You're not selling square footage. You're selling everything around it.</h3>
            <p className="mt-5 leading-7 text-white/70">The coffee shop where your barista knows your order. The bar that feels like your living room. The Thai place that's open late. That's what people pay for. Give people a way to see it.</p>
            <ButtonLink href={routes.partners} className="mt-7">Explore all partner types</ButtonLink>
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl"><SectionLabel>Pricing</SectionLabel><h2 className="mt-4 text-4xl font-semibold tracking-[-0.045em] text-[#071b2f] sm:text-6xl">Spend less. Do more.</h2><p className="mt-5 max-w-3xl text-lg leading-8 text-[#64748b]">Start with a pilot. Decide with real data. No setup. No long-term commitment. You go live, people use it, you see what happens.</p><p className="mt-2 text-[#64748b]">Final pricing reflects footprint, visibility, and activation.</p>
          <div className="mt-9 grid gap-4 md:grid-cols-2 xl:grid-cols-5">{pricing.map(([title, audience, price, line, signal, href]) => <a key={title} href={href} className="rounded-[1.5rem] bg-white/80 p-5 shadow-[0_16px_50px_rgba(7,27,47,0.06)] transition hover:-translate-y-1"><h3 className="text-xl font-semibold text-[#071b2f]">{title}</h3><p className="mt-2 text-sm text-[#64748b]">{audience}</p><p className="mt-5 text-lg font-semibold text-[#071b2f]">{price}</p><p className="mt-4 text-sm text-[#475569]">{line}</p><p className="mt-2 text-sm text-[#64748b]">{signal}</p><span className="mt-5 inline-flex text-sm font-semibold text-[#071b2f]">Learn more →</span></a>)}</div>
          <p className="mt-6 text-sm font-semibold text-[#64748b]">No setup fee. No long-term commitment.</p>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.85fr_1.15fr]"><div><SectionLabel>FAQs</SectionLabel><h2 className="mt-4 text-4xl font-semibold tracking-[-0.045em] text-[#071b2f] sm:text-6xl">Questions, answered clearly</h2><p className="mt-5 text-lg leading-8 text-[#64748b]">Downtown Perks is built to make downtown easier to use. These are the questions people usually ask first.</p><ButtonLink href={routes.about} variant="secondary" className="mt-7">Learn more about Downtown Perks</ButtonLink></div>
          <div className="space-y-3">{faqs.map(([question, answer], index) => <div key={question} className="rounded-2xl bg-white/80 p-4 shadow-[0_12px_36px_rgba(7,27,47,0.05)]"><button onClick={() => setOpenFaq(openFaq === index ? -1 : index)} className="flex w-full items-center justify-between gap-4 text-left font-semibold text-[#071b2f]"><span>{question}</span><span>{openFaq === index ? "−" : "+"}</span></button>{openFaq === index && <p className="mt-3 leading-7 text-[#64748b]">{answer}</p>}</div>)}</div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-8 rounded-[2.5rem] bg-[#071b2f] p-7 text-white md:p-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div><SectionLabel>Get Started</SectionLabel><h2 className="mt-4 text-4xl font-semibold tracking-[-0.045em] sm:text-6xl">Ready when you are.</h2><p className="mt-5 text-lg leading-8 text-white/70">People don't choose the best option. They choose the one they notice.</p><p className="mt-5 text-white/80">For residents — Stop searching. Start doing.</p><p className="text-white/80">For partners — Be the one they notice.</p></div>
          <form className="rounded-[2rem] bg-white p-5 text-[#071b2f] md:p-6">
            <div className="flex flex-wrap gap-2">{leadTypes.map((type) => <button type="button" key={type} onClick={() => setLeadType(type)} className={`rounded-full px-3 py-2 text-xs font-semibold ${leadType === type ? "bg-[#071b2f] text-white" : "bg-[#f7f8fb] text-[#071b2f]"}`}>{type}</button>)}</div>
            <h3 className="mt-6 text-2xl font-semibold">{leadHeadline}</h3><p className="mt-2 text-sm text-[#64748b]">See what residents actually do.</p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">{["Building Name & Address", "Your Name & Role", "Email", "Phone", "Number of Units", "Any specific goals? (Optional)"].map((label) => <label key={label} className="text-sm font-semibold text-[#071b2f]">{label}<input type={label === "Email" ? "email" : label === "Phone" ? "tel" : label === "Number of Units" ? "number" : "text"} className="mt-2 min-h-11 w-full rounded-xl bg-[#f7f8fb] px-3 outline-none ring-1 ring-[#071b2f]/10 focus:ring-[#cfaf5a]" /></label>)}</div>
            <button type="button" className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-[#071b2f] px-5 py-3 text-sm font-semibold text-white">Start Free Pilot</button>
            <p className="mt-5 text-sm text-[#64748b]">Prefer email? <a href="mailto:hello@downtownperks.com" className="font-semibold text-[#071b2f]">hello@downtownperks.com</a></p>
          </form>
        </div>
      </section>
    </main>
  );
}
