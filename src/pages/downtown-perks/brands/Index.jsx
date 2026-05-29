import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";

const brands = [
  { slug: "the-paseo", name: "The Paseo", category: "Mixed-Use Property", description: "Neighborhood-first lifestyle positioning with walkable discovery built in.", tag: "Property" },
  { slug: "the-waterline", name: "The Waterline", category: "Premium Residential", description: "Skyline-level positioning meets live neighborhood intelligence.", tag: "Property · Prestige" },
  { slug: "bangers", name: "Bangers", category: "Venue & Hospitality", description: "Map discovery, event activation, and measurable district foot traffic.", tag: "Venue" },
  { slug: "the-stay-put", name: "Stay Put", category: "Local Bar & Venue", description: "Real-time discovery, timed traffic moments, and live programming for downtown's social scene.", tag: "Venue · Social" },
  { slug: "hotel-van-zandt", name: "Hotel Van Zandt", category: "Hospitality Partner", description: "Live neighborhood layer for guests — dining, events, wellness, and local perks on arrival.", tag: "Hospitality" },
  { slug: "four-seasons", name: "Four Seasons", category: "Hospitality Partner", description: "Curated downtown guide that extends the quality of the stay into the city around it.", tag: "Hospitality · Premium" },
  { slug: "four-seasons-residences", name: "Four Seasons Residences", category: "Residential Partner", description: "A live amenity layer that helps residents discover dining, wellness, events, and local perks around where they live.", tag: "Residential" },
  { slug: "the-shore", name: "The Shore", category: "Residential Partner", description: "Residents enjoy Hotel Van Zandt pool access, local resident hotel rates, and a live neighborhood discovery layer.", tag: "Residential" },
  { slug: "yeti", name: "YETI", category: "Austin Brand Campaign", description: "Flagship city-brand activation. QR-led product moments. District presence.", tag: "Brand Campaign" },
  { slug: "rivian", name: "Rivian", category: "Mobility & Experiential", description: "Downtown placement. Experiential activation. Behavior-led engagement.", tag: "Mobility" },
  { slug: "lululemon", name: "lululemon", category: "Premium Retail & Wellness", description: "Run clubs, studio tie-ins, and QR-activated product moments for members.", tag: "Retail · Wellness" },
  { slug: "equinox", name: "Equinox", category: "Premium Fitness", description: "Class passes, building partnerships, and members-only event access.", tag: "Fitness" },
  { slug: "laz-y-boy-park", name: "Austin FC", category: "Civic & Entertainment", description: "Match-day activation, district energy, and building-linked RSVP flows.", tag: "Civic · Sport" },
  { slug: "fabi-and-rosi", name: "Fabi & Rosi", category: "Local Dining", description: "Neighborhood table, resident perks, and curated dining moments.", tag: "Dining" },
];

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
    <div className="min-h-screen bg-background">

      {/* Hero */}
      <section className="relative pt-36 pb-20 px-5">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="text-[11px] font-medium text-primary/70 uppercase tracking-[0.16em] block mb-4">
              Partner Directory
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-end mb-14">
              <h1 className="font-heading text-4xl md:text-4xl font-medium leading-[1.05] tracking-normal">
                Brands that belong
                <br />
                <em className="text-primary">downtown.</em>
              </h1>
              <div>
                <p className="text-muted-foreground text-[14px] leading-relaxed mb-8">
                  Every partner here earns their place on the map. Real presence. Real activation. Real foot traffic from real residents.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/downtown-perks/for-buildings"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-medium text-[13px] hover:bg-primary/90 transition-all duration-300"
                  >
                    Become a Partner <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    to="/map?mode=resident&tab=map"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border/70 text-foreground/70 font-medium text-[13px] hover:text-foreground transition-all duration-300"
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
            className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-border/40 border border-border/40 rounded-lg"
          >
            {[
              { value: "10+", label: "Partner brands" },
              { value: "3,400+", label: "Downtown residents" },
              { value: "0.4 mi", label: "Avg walk distance" },
              { value: "Live", label: "Real-time map layer" },
            ].map((s, i) => (
              <div key={i} className="p-5 text-center">
                <div className="font-heading text-2xl font-medium text-primary mb-1 tracking-normal">{s.value}</div>
                <div className="text-[12px] text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Brand grid */}
      <section className="py-12 px-5 border-t border-border/40">
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
      <section className="py-20 px-5 border-t border-border/40">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="font-heading text-3xl md:text-4xl font-medium leading-[1.15] tracking-normal"
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
              <p className="text-muted-foreground text-[14px] leading-relaxed">
                If you operate downtown, serve downtown residents, or want to build a real presence in the district — let's talk.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="mailto:partners@downtownperks.com"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-medium text-[13px] hover:bg-primary/90 transition-all duration-300"
                >
                  Start the Conversation <ArrowRight className="w-3.5 h-3.5" />
                </a>
                <Link
                  to="/downtown-perks/for-buildings"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border/70 text-foreground/70 font-medium text-[13px] hover:text-foreground transition-all duration-300"
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