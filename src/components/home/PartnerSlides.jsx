import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowLeft, Building2, Hotel, Utensils, Megaphone, Landmark } from "lucide-react";

const slides = [
  {
    id: "properties",
    icon: Building2,
    label: "Properties",
    headline: "You're not selling square footage.",
    subhead: "You're selling everything around it.",
    body: "The coffee shop where your barista knows your order. The bar that feels like your living room. The Thai place that's open late. That's what people pay for. Give people a way to see it.",
    includes: [
      "QR access across lobby, leasing, and welcome flow",
      "Live map of nearby places, events, and perks",
      "Your property inside the same experience",
      "Real engagement, not passive info",
    ],
    pricing: "Free pilot · $39/yr · $99/yr",
    pricingNote: "Start for nothing. Upgrade when it's obvious.",
    cta: "Bring this to your property",
    href: "/partners/properties",
  },
  {
    id: "hotels",
    icon: Hotel,
    label: "Hotels",
    headline: "You nail the arrival.",
    subhead: "Then leave the rest to chance.",
    body: "Guests don't want recommendations. They want orientation. One scan — and they know where to go. Coffee. Dinner. Tonight. Now you're not just a stay. You're their north star.",
    includes: [
      "QR access in rooms, lobby, and guest flow",
      "Live map of nearby venues, events, and perks",
      "Better experience, zero extra friction",
      "Discovery tied to actual location",
    ],
    pricing: "From $99/yr",
    pricingNote: "Less than one bad review costs you.",
    cta: "Use this for guests",
    href: "/partners/hotels",
  },
  {
    id: "venues",
    icon: Utensils,
    label: "Venues",
    headline: "People don't remember ads.",
    subhead: "They remember what's nearby when they're hungry.",
    body: "The place they passed. The bar they noticed. The coffee that showed up at the right moment. That's not branding. That's timing.",
    includes: [
      "Map placement based on proximity",
      "Perks and offers that actually get used",
      "Events surfaced in the right moment",
      "Clear engagement at 30, 60, 90 days",
    ],
    pricing: "Free for 12 months · From $49/yr after",
    pricingNote: "Pay nothing until you see the value.",
    cta: "Discuss activation",
    href: "/partners/venues",
  },
  {
    id: "brands",
    icon: Megaphone,
    label: "Brands",
    headline: "The best advertising doesn't feel like advertising.",
    subhead: "It feels like something useful that arrived at the right time.",
    body: "You're not interrupting. You're appearing inside a decision already happening. Coffee. Lunch. Drinks. Tonight. That's where brands belong.",
    includes: [
      "Corridor-based visibility across downtown",
      "Placement tied to location and timing",
      "Event and campaign integration",
      "Trackable actions, not vague impressions",
    ],
    pricing: "From $149/yr",
    pricingNote: "Less than one underperforming media buy.",
    cta: "Start a conversation",
    href: "/partners/brands",
  },
  {
    id: "civic",
    icon: Landmark,
    label: "Civic",
    headline: "Cities work better when people know what's happening.",
    subhead: "Right now, finding a local event takes too much effort.",
    body: "What if it didn't? One place. One map. Everything visible. More people show up. More things actually happen.",
    includes: [
      "Community events in one visible layer",
      "District-wide discovery",
      "Shared map for participation",
      "Clear access to what's happening nearby",
    ],
    pricing: "From $49/yr",
    pricingNote: "Less than printing flyers no one reads.",
    cta: "Talk to us",
    href: "/partners/civic",
  },
];

export default function PartnerSlides() {
  const [active, setActive] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const slide = slides[active];
  const Icon = slide.icon;

  return (
    <section ref={ref} className="py-20 px-5 border-t border-[#0B1F33]/8 bg-white">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12 items-end">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <span className="text-[11px] font-medium text-primary/80 uppercase tracking-[0.16em] block mb-4">
              Turn Residents Into Regulars
            </span>
            <h2 className="font-heading text-3xl md:text-[38px] font-medium leading-[1.1] tracking-normal text-foreground">
              Be the place
              <br />
              <em className="text-primary">people choose next.</em>
            </h2>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-foreground/60 text-[13px] leading-relaxed"
          >
            People are already downtown. Already walking. Already deciding. Downtown Perks puts you in front of them when it matters — not broad advertising, better timing.
          </motion.p>
        </div>

        {/* Slide tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex gap-2 mb-8 overflow-x-auto pb-1"
        >
          {slides.map((s, i) => {
            const SlideIcon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => setActive(i)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-[12px] font-medium whitespace-nowrap border transition-all duration-200 ${
                  active === i
                    ? "border-[#0B1F33]/10 bg-[#0B1F33]/[0.06] text-[#0B1F33]"
                    : "border-[#0B1F33]/8 text-[#425466] hover:border-[#0B1F33]/10 hover:text-[#0B1F33]"
                }`}
              >
                <SlideIcon className="w-3.5 h-3.5" />
                {s.label}
              </button>
            );
          })}
        </motion.div>

        {/* Slide content */}
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="border border-[#0B1F33]/8 rounded-xl overflow-hidden shadow-[0_12px_40px_rgba(11,31,51,0.05)]"
        >
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Left */}
            <div className="p-8 md:border-r border-[#0B1F33]/8 bg-white">
              <div className="w-9 h-9 rounded-full border border-[#0B1F33]/8 flex items-center justify-center mb-6">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-heading text-2xl font-medium leading-[1.08] mb-1.5 text-foreground">{slide.headline}</h3>
              <p className="text-foreground/55 text-[13px] italic mb-5">{slide.subhead}</p>
              <p className="text-[13px] text-foreground/60 leading-relaxed mb-8">{slide.body}</p>

              <div className="border-t border-[#0B1F33]/8 pt-6">
                <div className="text-[11px] font-medium text-foreground/50 uppercase tracking-[0.12em] mb-1">
                  Pricing
                </div>
                <div className="font-heading font-medium text-foreground text-[13px] mb-1">{slide.pricing}</div>
                <div className="text-[12px] text-foreground/55 italic mb-5">{slide.pricingNote}</div>
                <Link
                  to={slide.href}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-medium text-[13px] hover:bg-primary/90 transition-all duration-300"
                >
                  {slide.cta} <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Right — what's included */}
            <div className="p-8 bg-[#F7F8FB]">
              <div className="text-[11px] font-medium text-foreground/50 uppercase tracking-[0.12em] mb-5">
                What's Included
              </div>
              <ul className="space-y-3">
                {slide.includes.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-[13px] text-foreground/60">
                    <div className="w-1 h-1 rounded-full bg-primary/60 mt-2 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="mt-8 pt-6 border-t border-[#0B1F33]/8">
                <div className="text-[11px] font-medium text-foreground/50 uppercase tracking-[0.12em] mb-3">
                  How It Works
                </div>
                {["Launch", "Measure", "Decide"].map((step, i) => (
                  <div key={i} className="flex items-center gap-3 text-[13px] text-foreground/60 mb-2">
                    <div className="w-5 h-5 rounded-full border border-primary/40 flex items-center justify-center text-[10px] text-primary font-medium shrink-0">
                      {i + 1}
                    </div>
                    {step === "Launch" && "Set up QR entry points and map visibility."}
                    {step === "Measure" && "Track scans, saves, RSVPs, and redemptions."}
                    {step === "Decide" && "Keep it, scale it, or adjust based on what works."}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Nav */}
        <div className="flex items-center justify-between mt-5">
          <button
            onClick={() => setActive((a) => Math.max(0, a - 1))}
            disabled={active === 0}
            className="p-2.5 rounded-full border border-[#0B1F33]/8 text-[#425466] hover:text-[#0B1F33] disabled:opacity-30 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${active === i ? "bg-[#0B1F33] w-4" : "bg-[#DCE3EB]"}`}
              />
            ))}
          </div>
          <button
            onClick={() => setActive((a) => Math.min(slides.length - 1, a + 1))}
            disabled={active === slides.length - 1}
            className="p-2.5 rounded-full border border-[#0B1F33]/8 text-[#425466] hover:text-[#0B1F33] disabled:opacity-30 transition-all"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
