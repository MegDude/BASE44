import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, Camera, Gift, MapPin, MessageCircle, Sparkles, Users } from "lucide-react";
import { motion } from "framer-motion";

const researchPoints = [
  {
    title: "People change the day",
    body: "Who you see, who knows your name, and who you can text for a quick plan all shape how downtown feels.",
  },
  {
    title: "Loneliness shows up quietly",
    body: "It is the empty elevator, the unused lounge, the night you wanted to go out but did not know where to start.",
  },
  {
    title: "A good place has a rhythm",
    body: "The best buildings and blocks give you small reasons to step out, run into people, and come back again.",
  },
];

const addOns = [
  {
    icon: Camera,
    title: "Event photo galleries",
    body: "Photos from member nights, ready to save, send, or remember later.",
  },
  {
    icon: MessageCircle,
    title: "Nearby updates",
    body: "Quick notes on what is happening before it gets buried in another feed.",
  },
  {
    icon: Gift,
    title: "Useful perks",
    body: "Local rates, member moments, and easy redemptions from places you already like.",
  },
  {
    icon: Sparkles,
    title: "Local notes",
    body: "Short neighborhood tips that make downtown feel easier to know and easier to use.",
  },
];

const questions = [
  "Do people use the common spaces, or do they sit empty?",
  "Are there recurring reasons to show up, or only pretty amenity photos?",
  "Can residents meet people when they want to, without a forced social calendar?",
  "Does the building help people connect to the neighborhood outside the lobby?",
];

function Section({ eyebrow, title, children, className = "" }) {
  return (
    <section className={`border-t border-[#0B1F33]/8 px-5 py-14 md:py-18 ${className}`}>
      <div className="mx-auto max-w-6xl">
        {(eyebrow || title) && (
          <div className="mb-8 max-w-3xl">
            {eyebrow && <span className="dp-label mb-3 block">{eyebrow}</span>}
            {title && <h2 className="font-heading text-3xl font-medium leading-[1.08] text-[#0B1F33] md:text-4xl">{title}</h2>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

export default function About() {
  return (
    <main className="min-h-screen bg-[#F7F8FB] pt-[68px] text-[#0B1F33]">
      <section className="relative overflow-hidden px-5 py-16 md:py-24">
        <div className="absolute inset-0 pointer-events-none opacity-[0.035]" style={{ backgroundImage: "linear-gradient(rgba(11,31,51,0.24) 1px, transparent 1px), linear-gradient(90deg, rgba(11,31,51,0.24) 1px, transparent 1px)", backgroundSize: "56px 56px" }} />
        <div className="relative mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}>
            <span className="dp-label mb-4 block">About Downtown Perks</span>
            <h1 className="font-heading text-[42px] font-medium leading-[0.98] md:text-[72px]">
              Where you live changes how you live.
            </h1>
            <p className="mt-6 max-w-2xl font-heading text-2xl italic leading-tight text-[#0B1F33] md:text-3xl">
              Downtown living is about who is close by, not just what is close by.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-lg border border-[#0B1F33]/8 bg-white p-5 shadow-[0_18px_54px_rgba(11,31,51,0.08)]"
          >
            <p className="text-[14px] leading-7 text-[#0B1F33]/68">
              Most residents spend months comparing the apartment checklist: floor plan, finishes, price per square foot. Almost nobody slows down long enough to ask what it feels like to come home, who they might run into, or whether the building gives them a reason to step outside.
            </p>
            <p className="mt-4 text-[14px] leading-7 text-[#0B1F33]/68">
              That is not fluff. It is the day-to-day. The people around you shape your energy, your routine, and whether downtown starts to feel like home.
            </p>
          </motion.div>
        </div>
      </section>

      <Section eyebrow="Why it matters" title="A good day usually has people in it." className="bg-white">
        <div className="grid gap-4 md:grid-cols-3">
          {researchPoints.map((point) => (
            <article key={point.title} className="rounded-md border border-[#0B1F33]/8 bg-[#F7F8FB] p-5">
              <h3 className="text-[14px] font-semibold text-[#0B1F33]">{point.title}</h3>
              <p className="mt-3 text-[13px] leading-6 text-[#0B1F33]/62">{point.body}</p>
            </article>
          ))}
        </div>
        <p className="mt-7 max-w-3xl text-[14px] leading-7 text-[#0B1F33]/68">
          This is not research for a white paper. It is whether you bump into someone at coffee, find a plan without twenty texts, or feel like your block knows you a little bit.
        </p>
      </Section>

      <Section eyebrow="Austin flavor" title="More charm than a biscuit with honey.">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-lg border border-[#0B1F33]/8 bg-[#0B1F33] p-5 text-white shadow-[0_20px_60px_rgba(11,31,51,0.18)]">
            <Sparkles className="h-8 w-8 text-[#B38F4F]" />
            <h3 className="mt-5 font-heading text-3xl font-medium leading-[1.08]">
              Downtown Perks brings the heat and the hospitality.
            </h3>
            <p className="mt-4 text-[13px] leading-6 text-white/72">
              For the folks who still call it Town Lake, know the shortcut through the alley off South Congress, plan their week around happy hour and live music, and understand that “y’all” can be singular, plural, and a whole mood.
            </p>
          </div>
          <div className="space-y-4 text-[14px] leading-7 text-[#0B1F33]/68">
            <p>
              Think of it like a screened-in porch for your city. Easy to use, easy to come back to, and ready for happy hours, rooftop nights, taco runs, tailgates, and everything in between.
            </p>
            <p>
              Find your people, your places, and your next excuse to stay out a little longer. Whether you are repping the city you love or the one that taught you how to dance, Downtown Perks helps you find what is nearby and worth showing up for.
            </p>
            <p>
              Easy to use, easy to come back to, and built for the everyday rhythm of Austin: coffee orders, live music plans, last-minute dinners, rooftop nights, and the small local rituals that make a place feel like yours.
            </p>
          </div>
        </div>
      </Section>

      <Section eyebrow="The home question" title="People tour buildings. They forget to ask how the place lives.">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-lg border border-[#0B1F33]/8 bg-white p-5 shadow-[0_14px_34px_rgba(11,31,51,0.05)]">
            <Users className="h-8 w-8 text-[#B38F4F]" />
            <h3 className="mt-5 font-heading text-3xl font-medium leading-[1.08]">
              The real question is whether a place gives people easy reasons to show up.
            </h3>
            <p className="mt-4 text-[13px] leading-6 text-[#0B1F33]/64">
              People still want their space. They also want a low-pressure way to be around others when the mood hits.
            </p>
          </div>
          <div className="grid gap-3">
            {questions.map((question) => (
              <div key={question} className="rounded-md border border-[#0B1F33]/8 bg-white p-4 text-[13px] font-medium leading-6 text-[#0B1F33]/72">
                {question}
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section eyebrow="What changes the feel" title="A building can feel like storage, or it can feel alive." className="bg-white">
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-lg border border-[#0B1F33]/8 bg-[#F7F8FB] p-5">
            <h3 className="font-heading text-3xl font-medium">Passive amenities fade into the background.</h3>
            <p className="mt-4 text-[13px] leading-6 text-[#0B1F33]/64">
              Empty lounges, silent elevators, rooftops used only for listing photos, neighbors who never learn each other's names. A place can photograph beautifully and still feel flat.
            </p>
          </div>
          <div className="rounded-lg border border-[#0B1F33]/8 bg-[#0B1F33] p-5 text-white shadow-[0_20px_60px_rgba(11,31,51,0.18)]">
            <h3 className="font-heading text-3xl font-medium">Activated spaces have a pulse.</h3>
            <p className="mt-4 text-[13px] leading-6 text-white/72">
              Rooftop nights, game nights, book clubs, local events, nearby perks, and small recurring moments. You do not have to go every time. Just knowing it is there changes how the place feels.
            </p>
          </div>
        </div>
      </Section>

      <Section eyebrow="What Downtown Perks does" title="Downtown Perks makes it easier to use the place you already live.">
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4 text-[14px] leading-7 text-[#0B1F33]/68">
            <p>
              Downtown Perks puts places, events, perks, resident access, and useful local choices in one map. Residents spend less time searching and more time actually going.
            </p>
            <p>
              The key is timing. Fewer steps between “maybe” and “I’m going.” Fewer apps. Fewer loops of “where should we go?” More good ideas when you are already nearby.
            </p>
            <p>
              For buildings and local businesses, it is a simple way to be useful at the right moment: while people are nearby and still deciding.
            </p>
          </div>
          <div className="rounded-lg border border-[#0B1F33]/8 bg-white p-5 shadow-[0_14px_34px_rgba(11,31,51,0.05)]">
            {[
              [MapPin, "Live map", "Places, perks, events, and properties in one view."],
              [CreditCardIcon, "Resident card", "A simple way to save, show, redeem, and come back."],
              [CalendarDays, "Recurring moments", "Events and updates that make showing up easier."],
            ].map(([Icon, title, body]) => (
              <div key={title} className="border-b border-[#0B1F33]/8 py-4 first:pt-0 last:border-b-0 last:pb-0">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#0B1F33] text-[#B38F4F]">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-[13px] font-semibold text-[#0B1F33]">{title}</h3>
                    <p className="mt-1 text-[12px] leading-5 text-[#0B1F33]/58">{body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section eyebrow="Member extras" title="The fun part is making downtown feel more yours." className="bg-white">
        <div className="grid gap-3 md:grid-cols-4">
          {addOns.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="rounded-md border border-[#0B1F33]/8 bg-[#F7F8FB] p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#0B1F33] text-[#B38F4F]">
                  <Icon className="h-4 w-4" />
                </div>
                <h3 className="mt-4 text-[13px] font-semibold text-[#0B1F33]">{item.title}</h3>
                <p className="mt-2 text-[12px] leading-5 text-[#0B1F33]/60">{item.body}</p>
              </article>
            );
          })}
        </div>
      </Section>

      <Section eyebrow="The point" title="Life downtown is timing.">
        <div className="max-w-3xl">
          <p className="text-[14px] leading-7 text-[#0B1F33]/68">
            People do not always choose the best option. They choose what is easy, what is nearby, and what is in front of them at the right moment. Downtown Perks helps that moment show up more often.
          </p>
          <p className="mt-4 text-[14px] leading-7 text-[#0B1F33]/68">
            The goal is simple: make downtown feel easier to enter, easier to know, and easier to come back to.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link to="/map?mode=resident&tab=map" className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#0B1F33] px-5 text-[12px] font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[#081521] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F]">
              Open the map
              <ArrowRight className="h-4 w-4 text-[#B38F4F]" />
            </Link>
            <Link to="/partners" className="inline-flex h-10 items-center justify-center rounded-md border border-[#0B1F33]/10 bg-white px-5 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#0B1F33] transition hover:border-[#B38F4F]/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F]">
              Partner with us
            </Link>
          </div>
        </div>
      </Section>
    </main>
  );
}

function CreditCardIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
      <path d="M7 15h4" />
    </svg>
  );
}
