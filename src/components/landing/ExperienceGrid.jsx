import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const experiences = [
  { label: "Run Clubs", tag: "fitness" },
  { label: "Rooftop Socials", tag: "social" },
  { label: "Cold Plunge", tag: "wellness" },
  { label: "Local Dining", tag: "dining" },
  { label: "Yoga Classes", tag: "fitness" },
  { label: "IV Drips", tag: "wellness" },
  { label: "Live Music", tag: "entertainment" },
  { label: "Sauna Sessions", tag: "wellness" },
  { label: "Art Walks", tag: "arts" },
  { label: "Wine Tastings", tag: "dining" },
  { label: "Meditation", tag: "wellness" },
  { label: "Networking", tag: "social" },
];

export default function ExperienceGrid({ images }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-32 px-6 relative">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-6"
        >
          <span className="text-primary text-sm font-medium uppercase tracking-widest">
            What's Happening
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="font-heading text-3xl md:text-5xl font-bold text-center mb-20 leading-tight"
        >
          Not just options.
          <br />
          <span className="text-primary">Confidence in what to do next.</span>
        </motion.h2>

        {/* Image grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-16">
          {images.map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.3 + i * 0.1 }}
              className="relative group rounded-2xl overflow-hidden aspect-[4/3]"
            >
              <img
                src={img.src}
                alt={img.alt}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <span className="text-foreground font-heading font-semibold text-sm">
                  {img.label}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tags */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-wrap justify-center gap-3"
        >
          {experiences.map((exp, i) => (
            <span
              key={i}
              className="px-4 py-2 rounded-full border border-border text-sm text-muted-foreground hover:border-primary/50 hover:text-primary transition-all cursor-default"
            >
              {exp.label}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}