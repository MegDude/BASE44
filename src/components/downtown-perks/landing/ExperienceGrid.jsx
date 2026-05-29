import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const experiences = [
  { label: "Rooftop Socials", tag: "Community" },
  { label: "Cold Plunge & Recovery", tag: "Wellness" },
  { label: "Run Clubs", tag: "Fitness" },
  { label: "Chef's Tables", tag: "Dining" },
  { label: "Yoga & Movement", tag: "Wellness" },
  { label: "Members-Only Events", tag: "Access" },
  { label: "Curated Retail Moments", tag: "Retail" },
  { label: "Downtown Walks", tag: "Discovery" },
];

export default function ExperienceGrid({ images = [] }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-28 px-5 border-t border-border/40">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mb-12"
        >
          <span className="text-[11px] font-medium text-primary/70 uppercase tracking-[0.16em] block mb-4">
            The Experience
          </span>
          <h2 className="font-heading text-4xl md:text-4xl font-medium leading-[1.1] tracking-normal max-w-xl">
            What downtown life
            <br />
            <em className="text-primary">actually looks like.</em>
          </h2>
        </motion.div>

        {/* Image grid — editorial asymmetric */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-12">
            {images.slice(0, 6).map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 + i * 0.08 }}
                className={`relative overflow-hidden rounded-lg bg-muted ${i === 0 ? "md:row-span-2 aspect-[4/5]" : "aspect-square"}`}
              >
                <img
                  src={img.src}
                  alt={img.alt || img.label}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
                <span className="absolute bottom-3 left-3 text-[11px] font-medium text-white/80 tracking-wide">
                  {img.label}
                </span>
              </motion.div>
            ))}
          </div>
        )}

        {/* Experience tags — clean horizontal scroll */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="flex flex-wrap gap-2"
        >
          {experiences.map((exp, i) => (
            <span
              key={i}
              className="px-4 py-2 rounded-full border border-border/60 text-[12px] text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all cursor-default"
            >
              {exp.label}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}