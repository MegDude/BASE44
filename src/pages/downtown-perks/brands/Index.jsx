import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";
import { FEATURED_BRANDS } from "@/data/featuredBrands";

const brands = FEATURED_BRANDS;

function BrandCard({ brand, index }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.05 }}
    >
      <Link
        to={`/brands/${brand.slug}`}
        className="group block p-6 rounded-lg border border-border/60 hover:border-border bg-card/40 hover:bg-card/80 transition-all duration-300"
      >
        <div className="flex items-start justify-between mb-4">
          <span className="text-[11px] font-medium text-primary/70 uppercase tracking-[0.12em]">
            {brand.tag}
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
        </div>
        <h3 className="font-heading text-xl font-medium mb-1 group-hover:text-primary transition-colors duration-300">
          {brand.name}
        </h3>
        <div className="text-[11px] text-muted-foreground/60 uppercase tracking-wide mb-3">{brand.category}</div>
        <p className="text-[13px] text-muted-foreground leading-relaxed">{brand.description}</p>
      </Link>
    </motion.div>
  );
}

export default function BrandsIndex() {
  return (
    <div className="min-h-screen bg-[var(--dp-surface-base)]">

      {/* Hero */}
      <section className="px-4 py-8 md:px-6 md:py-10">
        <div className="dp-page-shell">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="dp-band p-6 md:p-10"
          >
            <span className="dp-micro-label block mb-4">
              Partner Directory
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-end mb-14">
              <h1 className="dp-display-hero text-[2.8rem] md:text-[4.25rem]">
                Brands that belong
                <br />
                <em className="text-[var(--dp-gold-muted)] not-italic">downtown.</em>
              </h1>
              <div>
                <p className="mb-8 text-[15px] leading-7 text-[rgba(11,31,51,0.68)]">
                  Every partner here earns their place on the map. Real presence. Real activation. Real foot traffic from real residents.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/partners/properties"
                    className="dp-cta-primary"
                  >
                    Become a Partner <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    to="/explore"
                    className="dp-cta-secondary"
                  >
                    <MapPin className="w-3.5 h-3.5" /> View on Map
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="grid grid-cols-2 gap-0 overflow-hidden rounded-[22px] border border-[rgba(11,31,51,0.08)] bg-[rgba(255,255,255,0.74)] md:grid-cols-4 md:divide-x divide-[rgba(11,31,51,0.08)]"
          >
            {[
              { value: String(brands.length), label: "Partner brands" },
              { value: "3,400+", label: "Downtown residents" },
              { value: "0.4 mi", label: "Avg walk distance" },
              { value: "Live", label: "Real-time map layer" },
            ].map((s, i) => (
              <div key={i} className="p-5 text-left">
                <div className="mb-1 font-heading text-2xl font-medium text-[var(--dp-navy)] tracking-tight">{s.value}</div>
                <div className="text-[12px] text-[rgba(11,31,51,0.56)]">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Brand grid */}
      <section className="py-12 px-6 border-t border-border/40">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-10">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.12em]">
              All Partners
            </span>
            <span className="text-[11px] text-muted-foreground/40">—</span>
            <span className="text-[11px] text-muted-foreground/40">{brands.length}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {brands.map((brand, i) => (
              <BrandCard key={brand.slug} brand={brand} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 border-t border-border/40">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="font-heading text-3xl md:text-4xl font-medium leading-[1.15] tracking-tight"
            >
              Your brand
              <br />
              <em className="text-primary">belongs here.</em>
            </motion.h2>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="space-y-5"
            >
              <p className="text-muted-foreground text-base leading-relaxed">
                If you operate downtown, serve downtown residents, or want to build a real presence in the district — let's talk.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="mailto:partners@downtownperks.com"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-all duration-300"
                >
                  Start the Conversation <ArrowRight className="w-3.5 h-3.5" />
                </a>
                <Link
                  to="/partners/properties"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border/70 text-foreground/70 font-medium text-sm hover:text-foreground transition-all duration-300"
                >
                  Partnership Details
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
