import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  Check,
  Coffee,
  CreditCard,
  Home,
  MapPin,
  Search,
  Tag,
  Users,
} from "lucide-react";
import FAQAccordionBlock from "@/components/ui/FAQAccordionBlock";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1];

const residentFaqs = [
  {
    id: "resident-faq-1",
    question: "Do I need to download an app?",
    answer: "No. It's a mobile web experience. Scan a QR code, and you're in. No download. No login.",
  },
  {
    id: "resident-faq-2",
    question: "Does it cost anything for residents?",
    answer: "No. Your building covers it. Downtown Perks is included as a building amenity: map access, event RSVPs, and your perks card at no cost.",
  },
  {
    id: "resident-faq-3",
    question: "Is my info shared with partners?",
    answer: "No. We track actions for reporting, not personal contact information. Your details aren't shared unless you explicitly opt in.",
  },
  {
    id: "resident-faq-4",
    question: "Who can join?",
    answer: "Downtown residents in participating buildings.",
  },
  {
    id: "resident-faq-5",
    question: "How do resident connections work?",
    answer: "See an event or activity you want to join. Use Connect Nearby to signal interest and reach out to others who are going. Opt-in, lightweight, and built to make it easier to show up together.",
  },
];

const capabilityGroups = [
  {
    id: "find",
    label: "Find what you need",
    items: [
      "Restaurants, bars, coffee shops, and services nearby",
      "Events happening tonight, ready to RSVP",
      "Perks from places you'd go anyway",
      "Places worth coming back to",
      "People around you, when you want to be social",
    ],
  },
  {
    id: "use",
    label: "Use it faster",
    items: [
      "Open one live map instead of five apps",
      "Filter to places, offers, events, or properties",
      "Save something for later or head there now",
      "Show your card when you arrive",
      "Keep downtown plans lightweight",
    ],
  },
];

const mapModules = [
  {
    id: "places",
    label: "Places Nearby",
    icon: Coffee,
    headline: "Tap. Learn. Go.",
    body: "Every location shows what it is, what it offers, and how far you are from the door.",
    cta: "Open the Map",
    href: "/map",
  },
  {
    id: "corner",
    label: "Around the Corner",
    icon: MapPin,
    headline: "Everything you need, within walking distance.",
    body: "See what's close, decide quickly, and go.",
    cta: "Open the Map",
    href: "/map",
  },
  {
    id: "events",
    label: "Events Happening Now",
    icon: CalendarDays,
    headline: "See what's on. RSVP in one tap.",
    body: "From happy hours to local programming, RSVP without leaving the map.",
    cta: "See events",
    href: "/events",
  },
  {
    id: "properties",
    label: "Want to live here?",
    icon: Home,
    headline: "Browse what's available, and what comes with it.",
    body: "See participating buildings, rentals, and homes for sale nearby. Filter the map to Properties, then tap any building for availability, pricing, and what's walkable from the door.",
    cta: "View properties",
    href: "/map",
  },
];

const stepperSteps = [
  {
    id: "open",
    step: "Step 1",
    title: "Open the map",
    body: "See what's close to you right now.",
  },
  {
    id: "tap",
    step: "Step 2",
    title: "Tap a place",
    body: "Get the basics fast: what it is, what it's like, and how far the walk is.",
  },
  {
    id: "save",
    step: "Step 3",
    title: "Save it or go",
    body: "Make a quick plan, or decide in the moment.",
  },
  {
    id: "show",
    step: "Step 4",
    title: "Show your card",
    body: "They scan. You get the perk. Done.",
  },
];

function Section({ id, eyebrow, title, children, className = "" }) {
  return (
    <section id={id} className={cn("border-t border-[#0B1F33]/8 px-5 py-14 md:py-20", className)}>
      <div className="mx-auto max-w-6xl">
        {(eyebrow || title) && (
          <div className="mb-8 max-w-3xl">
            {eyebrow && <span className="dp-label mb-3 block">{eyebrow}</span>}
            {title && <h2 className="font-heading text-3xl font-medium leading-[1.08] tracking-normal text-[#0B1F33] md:text-4xl">{title}</h2>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

function CTAButton({ to, children, variant = "primary" }) {
  const className = cn(
    "inline-flex h-10 items-center justify-center gap-2 rounded-[2px] px-5 text-[13px] font-medium transition-colors",
    variant === "primary"
      ? "bg-[#0B1F33] text-white hover:bg-[#081521]"
      : "border border-[#0B1F33]/10 bg-white text-[#0B1F33] hover:bg-[#F7F8FB]"
  );

  return (
    <Link to={to} className={className}>
      {children}
      <ArrowRight className="h-4 w-4" />
    </Link>
  );
}

function SearchIntentCard() {
  const prompts = [
    {
      icon: Search,
      title: "Where do you want to go?",
      body: "Coffee. Dinner. Groceries. Fitness. Drinks. All within walking distance.",
    },
    {
      icon: CalendarDays,
      title: "What do you want to do?",
      body: "See what's on tonight. Find something worth showing up for.",
    },
    {
      icon: Users,
      title: "Who do you want to meet?",
      body: "See who's going. Join in. Make a plan.",
    },
  ];

  return (
    <div className="rounded-[2px] border border-[#0B1F33]/8 bg-white/86 p-5 shadow-[0_14px_34px_rgba(6,27,51,0.04)]">
      <span className="dp-label mb-3 block">Search Intent Integration</span>
      <div className="rounded-[2px] border border-[#0B1F33]/8 bg-[#F7F8FB] p-3">
        <div className="flex items-center gap-2 rounded-[2px] border border-[#0B1F33]/8 bg-white px-3 py-2 text-[13px] text-[#0B1F33]/58">
          <Search className="h-4 w-4 text-[#B38F4F]" />
          Search downtown
        </div>
        <div className="mt-4 divide-y divide-[#0B1F33]/8">
          {prompts.map((prompt) => {
            const Icon = prompt.icon;
            return (
              <div key={prompt.title} className="flex gap-3 py-2.5 first:pt-0 last:pb-0">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[2px] border border-[#0B1F33]/8 bg-white">
                  <Icon className="h-4 w-4 text-[#B38F4F]" />
                </span>
                <div>
                  <div className="text-[13px] font-medium text-[#0B1F33]">{prompt.title}</div>
                  <p className="mt-1 text-[12px] leading-[1.6] text-[#0B1F33]/58">{prompt.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MiniMapVisual({ activeStep }) {
  return (
    <div className="relative min-h-[290px] overflow-hidden rounded-[2px] border border-[#0B1F33]/8 bg-[#EEF4F8]">
      <div className="absolute inset-0 opacity-80 [background-image:linear-gradient(rgba(6,27,51,.06)_1px,transparent_1px),linear-gradient(90deg,rgba(6,27,51,.06)_1px,transparent_1px)] [background-size:42px_42px]" />
      <div className="absolute left-[12%] top-[32%] h-px w-[72%] rotate-[16deg] bg-[#0B1F33]/14" />
      <div className="absolute left-[16%] top-[66%] h-px w-[66%] -rotate-[11deg] bg-[#0B1F33]/12" />
      {(activeStep === 0 || activeStep === 2) && (
        <motion.div
          className="absolute left-[32%] top-[47%] h-[2px] w-[40%] origin-left rotate-[-16deg] bg-[#B38F4F]"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.75, ease }}
        />
      )}
      <motion.div
        className="absolute left-[30%] top-[42%] flex h-10 w-10 items-center justify-center rounded-[2px] border border-[#B38F4F]/70 bg-[#0B1F33] text-white shadow-[0_18px_46px_rgba(6,27,51,0.16)]"
        animate={{ scale: activeStep === 0 ? [1, 1.09, 1] : 1 }}
        transition={{ duration: 1.3, repeat: activeStep === 0 ? Infinity : 0, ease }}
      >
        <Coffee className="h-4 w-4" />
      </motion.div>
      <div className="absolute left-[68%] top-[26%] flex h-8 w-8 items-center justify-center rounded-[2px] border border-[#0B1F33]/10 bg-white text-[#0B1F33]/70">
        <CalendarDays className="h-3.5 w-3.5" />
      </div>
      <div className="absolute left-[60%] top-[68%] flex h-8 w-8 items-center justify-center rounded-[2px] border border-[#0B1F33]/10 bg-white text-[#0B1F33]/70">
        <Tag className="h-3.5 w-3.5" />
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {activeStep === 1 && (
          <motion.div
            key="place-card"
            className="absolute bottom-5 left-5 right-5 rounded-[2px] border border-[#0B1F33]/8 bg-white p-4 shadow-[0_14px_34px_rgba(6,27,51,0.06)]"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.38, ease }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-heading text-xl font-medium text-[#0B1F33]">Jo's Coffee</div>
                <p className="mt-1 text-[12px] text-[#0B1F33]/58">Open now · 5 min walk</p>
              </div>
              <span className="rounded-[2px] bg-[#0B1F33]/14 px-2.5 py-1 text-[11px] font-medium text-[#0B1F33]">0.3 mi</span>
            </div>
          </motion.div>
        )}
        {activeStep === 2 && (
          <motion.div
            key="saved"
            className="absolute bottom-5 left-5 rounded-[2px] border border-[#B38F4F]/50 bg-white px-3 py-2 text-[12px] font-medium text-[#0B1F33] shadow-[0_14px_34px_rgba(6,27,51,0.06)]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.32, ease }}
          >
            Saved · 5 min walk
          </motion.div>
        )}
        {activeStep === 3 && (
          <motion.div
            key="card"
            className="absolute bottom-5 left-5 right-5 overflow-hidden rounded-[2px] border border-[#0B1F33]/10 bg-[#0B1F33] p-5 text-white shadow-[0_18px_46px_rgba(6,27,51,0.18)]"
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.42, ease }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/60">Resident Card</span>
              <CreditCard className="h-4 w-4 text-[#B38F4F]" />
            </div>
            <div className="mt-8 font-heading text-2xl font-medium">Perk confirmed</div>
            <p className="mt-1 text-[12px] text-white/58">They scan. You get the perk. Done.</p>
            <motion.div className="absolute left-4 right-4 top-1/2 h-px bg-[#B38F4F]" initial={{ x: "-115%" }} animate={{ x: "115%" }} transition={{ duration: 1.1, ease }} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ResidentsHowItWorksStepper() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return undefined;
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % stepperSteps.length);
    }, 2800);
    return () => window.clearInterval(timer);
  }, [paused]);

  return (
    <div
      className="rounded-[2px] border border-[#0B1F33]/8 bg-white p-5 md:p-6"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="grid gap-6 lg:grid-cols-[0.78fr_1.22fr]">
        <div>
          <span className="dp-label mb-3 block">How it works</span>
          <h3 className="font-heading text-3xl font-medium leading-tight text-[#0B1F33]">Less planning. More going.</h3>
          <div className="mt-5 space-y-2">
            {stepperSteps.map((step, index) => {
              const selected = index === active;
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => {
                    setActive(index);
                    setPaused(true);
                  }}
                  className={cn(
                    "w-full rounded-[2px] border p-3 text-left transition-colors",
                    selected ? "border-[#0B1F33] bg-[#0B1F33] text-white" : "border-[#0B1F33]/8 bg-[#F7F8FB] text-[#0B1F33]"
                  )}
                >
                  <div className={cn("text-[10px] font-medium uppercase tracking-[0.16em]", selected ? "text-[#B38F4F]" : "text-[#0B1F33]/42")}>{step.step}</div>
                  <div className="mt-1 text-[14px] font-medium">{step.title}</div>
                  <p className={cn("mt-1 text-[12px] leading-[1.55]", selected ? "text-white/68" : "text-[#0B1F33]/58")}>{step.body}</p>
                </button>
              );
            })}
          </div>
        </div>
        <MiniMapVisual activeStep={active} />
      </div>
    </div>
  );
}

function CapabilityToggle() {
  const [active, setActive] = useState(capabilityGroups[0].id);
  const current = capabilityGroups.find((group) => group.id === active) || capabilityGroups[0];

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {capabilityGroups.map((group) => (
          <button
            key={group.id}
            type="button"
            onClick={() => setActive(group.id)}
            className={cn(
              "shrink-0 rounded-[2px] border px-4 py-2 text-[13px] font-medium transition-colors",
              active === group.id ? "border-[#0B1F33] bg-[#0B1F33] text-white" : "border-[#0B1F33]/8 bg-white text-[#0B1F33]/64 hover:border-[#B38F4F]/50"
            )}
          >
            {group.label}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.ul
          key={current.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease }}
          className="mt-4 grid gap-3 md:grid-cols-2"
        >
          {current.items.map((item) => (
            <li key={item} className="flex gap-2 text-[13px] leading-[1.6] text-[#0B1F33]/68">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#B38F4F]" />
              {item}
            </li>
          ))}
        </motion.ul>
      </AnimatePresence>
    </div>
  );
}

function MapMoveModules() {
  const [active, setActive] = useState(mapModules[0].id);
  const current = mapModules.find((module) => module.id === active) || mapModules[0];
  const CurrentIcon = current.icon;

  return (
    <div className="grid gap-5 lg:grid-cols-[0.78fr_1.22fr]">
      <div>
        <div className="mb-4 rounded-[2px] border border-[#0B1F33]/8 bg-white p-3">
          <span className="dp-label mb-3 block">Map Filter Tabs</span>
          <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto">
            {["All", "Places", "Offers", "Events", "Properties"].map((filter, index) => (
              <span
                key={filter}
                className={cn(
                  "shrink-0 snap-start rounded-[2px] border px-3 py-2 text-[12px] font-medium",
                  index === 0 ? "border-[#0B1F33] bg-[#0B1F33] text-white" : "border-[#0B1F33]/8 bg-[#F7F8FB] text-[#0B1F33]/62"
                )}
              >
                {filter}
              </span>
            ))}
          </div>
        </div>
        <div className="grid gap-2">
          {mapModules.map((module) => {
            const Icon = module.icon;
            const selected = module.id === active;
            return (
              <button
                key={module.id}
                type="button"
                onClick={() => setActive(module.id)}
                className={cn(
                  "flex items-center gap-3 rounded-[2px] border p-3 text-left transition-colors",
                  selected ? "border-[#0B1F33] bg-[#0B1F33] text-white" : "border-[#0B1F33]/8 bg-white text-[#0B1F33]/70 hover:border-[#B38F4F]/50"
                )}
              >
                <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-[2px] border", selected ? "border-white/10 bg-white/10" : "border-[#0B1F33]/8 bg-[#F7F8FB]")}>
                  <Icon className={cn("h-4 w-4", selected ? "text-[#B38F4F]" : "text-[#0B1F33]/52")} />
                </span>
                <span className="text-[13px] font-medium">{module.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="rounded-[2px] border border-[#0B1F33]/8 bg-white p-5 md:p-7">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.32, ease }}
          >
            <span className="mb-4 flex h-10 w-11 items-center justify-center rounded-[2px] border border-[#0B1F33]/8 bg-[#F7F8FB]">
              <CurrentIcon className="h-5 w-5 text-[#B38F4F]" />
            </span>
            <h3 className="font-heading text-3xl font-medium leading-tight text-[#0B1F33]">{current.label}</h3>
            <p className="mt-4 font-heading text-xl font-medium leading-tight text-[#0B1F33]">{current.headline}</p>
            <p className="mt-3 max-w-2xl text-[13px] leading-[1.7] text-[#0B1F33]/64">{current.body}</p>
            <Link to={current.href} className="mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-[2px] bg-[#0B1F33] px-4 text-[12px] font-medium text-white transition-colors hover:bg-[#081521]">
              {current.cta}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function PerksCardBlock() {
  return (
    <div className="grid gap-5 rounded-[2px] border border-[#0B1F33]/8 bg-white p-5 shadow-[0_14px_34px_rgba(6,27,51,0.04)] md:grid-cols-[1fr_220px] md:p-7">
      <div>
        <span className="dp-label mb-3 block">Get Your Perks Card Now</span>
        <h2 className="font-heading text-3xl font-medium leading-tight text-[#0B1F33]">Sign Me Up</h2>
        <p className="mt-3 max-w-2xl text-[14px] leading-[1.7] text-[#0B1F33]/66">
          Scan the QR code to get your Perks Card sent directly to your phone.
        </p>
        <Link to="/card" className="mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-[2px] bg-[#0B1F33] px-5 text-[13px] font-medium text-white transition-colors hover:bg-[#081521]">
          Get Your Perks Card
          <CreditCard className="h-4 w-4" />
        </Link>
      </div>
      <div className="flex aspect-square items-center justify-center rounded-[2px] border border-[#0B1F33]/8 bg-[#F7F8FB] p-5">
        <div className="grid h-full w-full grid-cols-5 grid-rows-5 gap-1">
          {Array.from({ length: 25 }).map((_, index) => (
            <span
              key={index}
              className={cn(
                "rounded-sm",
                [0, 1, 2, 5, 10, 12, 14, 19, 20, 22, 24].includes(index) ? "bg-[#0B1F33]" : "bg-[#0B1F33]/10",
                [6, 7, 11, 17, 18].includes(index) && "bg-[#B38F4F]"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ResidentSignupForm() {
  const heardOptions = ["Building", "Friend", "Social", "Event", "Other"];

  return (
    <div className="rounded-[2px] border border-[#0B1F33]/8 bg-white p-5 md:p-7">
      <div className="grid gap-6 md:grid-cols-[0.85fr_1.15fr]">
        <div>
          <h3 className="font-heading text-3xl font-medium leading-tight text-[#0B1F33]">Check if your building is part of Downtown Perks.</h3>
          <p className="mt-3 text-[13px] leading-[1.7] text-[#0B1F33]/64">If you sign up now and your building joins later, you will be refunded.</p>
        </div>
        <form className="grid gap-3">
          {[
            ["Your Name", "text"],
            ["Phone Number", "tel"],
            ["Email", "email"],
            ["Building Address", "text"],
          ].map(([label, type]) => (
            <label key={label} className="grid gap-1.5">
              <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#0B1F33]/45">
                {label}
                {label === "Phone Number" && <span className="normal-case tracking-normal"> (Used for QR perks card login)</span>}
                {label === "Email" && <span className="normal-case tracking-normal"> (Optional)</span>}
              </span>
              <input type={type} className="h-10 rounded-[2px] border border-[#0B1F33]/10 bg-[#F7F8FB] px-3 text-[13px] outline-none focus:border-[#B38F4F]/60" />
            </label>
          ))}
          <div>
            <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#0B1F33]/45">How did you hear about us?</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {heardOptions.map((option) => (
                <label key={option} className="inline-flex cursor-pointer items-center gap-2 rounded-[2px] border border-[#0B1F33]/8 bg-[#F7F8FB] px-3 py-2 text-[12px] font-medium text-[#0B1F33]/66">
                  <input type="radio" name="heard" className="h-3.5 w-3.5 accent-[#0B1F33]" />
                  {option}
                </label>
              ))}
            </div>
          </div>
          <button type="button" className="mt-2 inline-flex h-10 items-center justify-center gap-2 rounded-[2px] bg-[#0B1F33] px-5 text-[13px] font-medium text-white transition-colors hover:bg-[#081521]">
            Get My Perks Card
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

export default function Landing() {
  return (
    <div className="bg-[#F7F8FB] pt-[68px] text-[#0B1F33]">
      <section className="px-5 py-16 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div>
            <span className="dp-label mb-4 block">Residents</span>
            <h1 className="font-heading text-4xl font-medium leading-[1.04] tracking-normal md:text-4xl">Where downtown meets you</h1>
            <p className="mt-6 max-w-2xl font-heading text-2xl font-medium leading-tight text-[#0B1F33]">
              Built for people who actually live here — and the places that make it feel like home.
            </p>
            <p className="mt-4 max-w-2xl text-[15px] leading-[1.7] text-[#0B1F33]/70">
              From coffee to dinner, live events, and everything in between - plus the perks you didn’t know you had. All in one place. No extra apps. No logins. No platforms or directories guessing what matters.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <CTAButton to="/map">Open the Map</CTAButton>
              <CTAButton to="/card" variant="secondary">Get Your Perks Card</CTAButton>
            </div>
            <Link to="/partners" className="mt-5 inline-flex text-[13px] font-medium text-[#0B1F33]/62 underline underline-offset-4 hover:text-[#0B1F33]">
              For businesses & buildings: Partners
            </Link>
          </div>
          <SearchIntentCard />
        </div>
      </section>

      <Section eyebrow="Residents" title="Downtown, in one place" className="bg-white">
        <div className="grid gap-6 md:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-4 text-[15px] leading-[1.7] text-[#0B1F33]/70">
            <p>You live downtown but expect it to be easier. Easier to navigate. Easier to connect. More useful day to day. Instead, everything you want is spread across too many places.</p>
            <p>Google for restaurants. Instagram for events. Text three friends to find the best happy hour.</p>
            <p>Downtown Perks fixes that. Because the problem isn’t what to do next — it’s the effort it takes to decide.</p>
          </div>
          <div className="border-l border-[#B38F4F]/50 pl-5">
            <h3 className="font-heading text-3xl font-medium leading-tight text-[#0B1F33]">Search less. Do more.</h3>
            <p className="mt-3 text-[14px] leading-[1.7] text-[#0B1F33]/64">
              Downtown Perks brings places, events, and perks together so it's easier to decide what to do next. A simple live map for people who live downtown — and the businesses that want to meet them there.
            </p>
          </div>
        </div>
      </Section>

      <Section eyebrow="What you can do" title="Everything works together, so you spend less time searching and more time showing up.">
        <CapabilityToggle />
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <CTAButton to="/map">Explore Downtown</CTAButton>
          <CTAButton to="/card" variant="secondary">Get a Perks Card</CTAButton>
        </div>
      </Section>

      <Section eyebrow="Product truth" title="One map. Everything nearby." className="bg-white">
        <p className="mb-8 max-w-3xl text-[15px] leading-[1.7] text-[#0B1F33]/68">
          Places, plans, and perks in one simple view. No app downloads. No account setup. No switching between apps. No piecing things together. Just what matters, in one place.
        </p>
        <ResidentsHowItWorksStepper />
      </Section>

      <Section eyebrow="Pick your next move" title="Map filters help you get there faster.">
        <MapMoveModules />
      </Section>

      <Section eyebrow="Stop searching. Start doing." title="Ready when you are." className="bg-white">
        <div className="max-w-3xl">
          <p className="text-[17px] leading-[1.75] text-[#0B1F33]/72">
            It's 6:30. You're home. You want dinner, a drink, or something to do without scrolling for 20 minutes.
          </p>
          <p className="mt-3 text-[15px] leading-[1.7] text-[#0B1F33]/64">
            Pick what's close, what's open, and what sounds fun.
          </p>
        </div>
      </Section>

      <Section>
        <PerksCardBlock />
      </Section>

      <FAQAccordionBlock
        sectionEyebrow="FAQs"
        sectionTitle="Questions, answered clearly"
        sectionIntro="Downtown Perks is built to make downtown easier to use. These are the resident questions people usually ask first."
        items={residentFaqs}
        styleVariant="split"
        showNumbers={false}
        allowMultipleOpen={false}
        defaultOpenIndex={0}
        pageType="residents"
        backgroundVariant="light"
      />

      <Section id="get-started" eyebrow="Get Started" title="Get My Perks Card" className="bg-white">
        <ResidentSignupForm />
      </Section>
    </div>
  );
}
