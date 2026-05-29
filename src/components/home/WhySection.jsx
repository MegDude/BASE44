import { motion, useInView } from "framer-motion";
import { ArrowRight, Building2, MapPin } from "lucide-react";
import { useRef } from "react";
import { Link } from "react-router-dom";

const audienceSections = [
  {
    label: "For residents",
    icon: MapPin,
    title: "Use downtown without piecing it together.",
    body: "Find nearby places, events, perks, and useful building context from one live map built around where you already are.",
    points: [
      "See what is nearby and worth doing now",
      "Find perks from places you already visit",
      "RSVP, save, or open the map without another app",
    ],
    cta: "Explore as a resident",
    href: "/residents",
  },
  {
    label: "For partners",
    icon: Building2,
    title: "Reach residents at the moment they are deciding.",
    body: "Give buildings, hotels, venues, brands, and civic teams a useful way to show up inside everyday downtown decisions.",
    points: [
      "Put your place, offer, or event into the local map",
      "Connect QR entry points to measurable actions",
      "See what residents open, save, RSVP to, and use",
    ],
    cta: "Explore partner options",
    href: "/partners",
  },
];

export default function WhySection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-20 px-5 border-t border-[#0B1F33]/8 bg-white">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mb-10 max-w-3xl"
        >
          <span className="text-[11px] font-medium text-primary/80 uppercase tracking-[0.16em] block mb-5">
            Two clear paths
          </span>
          <h2 className="font-heading text-3xl md:text-[40px] font-medium leading-[1.08] tracking-normal mb-4 text-foreground">
            Downtown Perks works differently for residents and partners.
          </h2>
          <p className="text-foreground/60 text-[14px] leading-relaxed">
            Residents need a simpler way to use downtown. Partners need a better way to be discovered, measured, and chosen. Same local layer, different jobs.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {audienceSections.map((section, index) => {
            const Icon = section.icon;

            return (
              <motion.div
                key={section.label}
                initial={{ opacity: 0, y: 16 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.12 + index * 0.1 }}
                className="border border-[#0B1F33]/8 bg-[#F7F8FB] p-5 md:p-6"
              >
                <div className="mb-5 flex h-10 w-10 items-center justify-center border border-primary/15 bg-white text-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-[11px] font-medium text-primary/75 uppercase tracking-[0.16em] block mb-4">
                  {section.label}
                </span>
                <h3 className="font-heading text-2xl md:text-[30px] font-medium leading-[1.08] tracking-normal text-foreground">
                  {section.title}
                </h3>
                <p className="mt-4 text-[13px] leading-relaxed text-foreground/62">
                  {section.body}
                </p>

                <ul className="mt-6 space-y-3 border-t border-[#0B1F33]/8 pt-5">
                  {section.points.map((point) => (
                    <li key={point} className="flex gap-3 text-[13px] leading-relaxed text-foreground/62">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-primary/65" />
                      {point}
                    </li>
                  ))}
                </ul>

                <Link
                  to={section.href}
                  className="mt-7 inline-flex items-center gap-2 bg-primary px-5 py-2.5 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {section.cta}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
