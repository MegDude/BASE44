import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Building2, Hotel, UtensilsCrossed, Megaphone, Landmark } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

const TIER_ICONS = { Properties: Building2, Hotels: Hotel, Venues: UtensilsCrossed, Brands: Megaphone, Civic: Landmark };

const tiers = [
  {
    label: "Properties",
    sub: "Multifamily, condos, apartments",
    price: "Free · $39 · $99 / yr",
    note: "Management pays. Residents stay.",
    detail: "Your address is your key to downtown.",
    href: "/partners/properties",
  },
  {
    label: "Hotels",
    sub: "Hotels, boutiques, extended stays",
    price: "$99–$149 / yr",
    note: "Extend the stay beyond your lobby.",
    detail: "One scan. Every option nearby.",
    href: "/partners/hotels",
  },
  {
    label: "Venues",
    sub: "Restaurants, bars, fitness, wellness",
    price: "Free for 12 months",
    note: "Show up in the moment that counts.",
    detail: "Not reach. Relevance. Not impressions. Intent.",
    href: "/partners/venues",
  },
  {
    label: "Brands",
    sub: "Activations, campaigns, sponsorships",
    price: "$99–$149 / yr",
    note: "Buy the moment, not the impression.",
    detail: "Context beats scale. Timing beats frequency.",
    href: "/partners/brands",
  },
  {
    label: "Civic",
    sub: "Cities, districts, chambers",
    price: "$49–$79 / yr",
    note: "Turn attendance into participation.",
    detail: "Discovery drives turnout.",
    href: "/partners/civic",
  },
];

export default function PricingSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-14 md:py-20 px-5 border-t border-[#0B1F33]/8 bg-[#F7F8FB]">
      <div className="max-w-4xl mx-auto">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12 items-end">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <span className="text-[11px] font-medium text-primary/80 uppercase tracking-[0.16em] block mb-4">
              Pricing
            </span>
            <h2 className="font-heading text-3xl md:text-[38px] font-medium leading-[1.1] tracking-normal text-foreground">
              Spend less.
              <br />
              <em className="text-primary">Do more.</em>
            </h2>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-foreground/60 text-[13px] leading-relaxed"
          >
            Start with a pilot. Decide with real data. No setup. No long-term commitment. You go live, people use it, you see what happens.
            <span className="block mt-2 text-[12px] text-muted-foreground/60 italic">
              Final pricing reflects footprint, visibility, and activation.
            </span>
          </motion.p>
        </div>

        <Carousel
          opts={{ align: "start", loop: false }}
          className="relative"
          aria-label="Partner pricing options"
        >
          <div className="mb-4 flex justify-end gap-2">
            <CarouselPrevious
              aria-label="Previous pricing option"
              className="static h-8 w-8 translate-x-0 translate-y-0 rounded-[6px] border-[#0B1F33]/8 bg-white shadow-[0_14px_34px_rgba(11,31,51,0.04)]"
            />
            <CarouselNext
              aria-label="Next pricing option"
              className="static h-8 w-8 translate-x-0 translate-y-0 rounded-[6px] border-[#0B1F33]/8 bg-white shadow-[0_14px_34px_rgba(11,31,51,0.04)]"
            />
          </div>
          <CarouselContent className="-ml-3">
            {tiers.map((tier, i) => (
              <CarouselItem key={i} className="pl-3 basis-[84%] sm:basis-[52%] lg:basis-[32%]">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.07 }}
                  className="group flex h-full min-h-[232px] flex-col rounded-[6px] border border-[#0B1F33]/8 bg-white/82 p-5 shadow-[0_14px_34px_rgba(11,31,51,0.04)] transition-all hover:-translate-y-0.5 hover:border-[#B38F4F]/50 hover:shadow-[0_18px_48px_rgba(11,31,51,0.06)]"
                >
                  {(() => { const Icon = TIER_ICONS[tier.label]; return Icon ? <Icon className="w-4 h-4 text-primary/60 mb-3" /> : null; })()}
                  <div className="font-heading font-medium text-[13px] text-foreground mb-0.5 group-hover:text-primary transition-colors">{tier.label}</div>
                  <div className="text-[11px] text-foreground/45 mb-3">{tier.sub}</div>
                  <div className="font-heading font-medium text-primary text-[13px] mb-1">{tier.price}</div>
                  <div className="text-[11px] text-foreground/60 leading-relaxed mb-2">{tier.note}</div>
                  <div className="text-[11px] text-foreground/45 italic leading-relaxed mb-3">{tier.detail}</div>
                  <Link to={tier.href} className="mt-auto text-[11px] text-primary font-medium hover:underline underline-offset-4">
                    Learn more →
                  </Link>
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-8 flex flex-wrap items-center gap-4"
        >
          <Link
            to="/partners"
            className="inline-flex h-10 items-center gap-2 rounded-[6px] bg-[#0B1F33] px-5 text-[13px] font-medium text-white transition-all duration-300 hover:bg-[#081521]"
          >
            Explore all partner types <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <span className="text-[12px] text-foreground/45">No setup fee. No long-term commitment.</span>
        </motion.div>
      </div>
    </section>
  );
}
