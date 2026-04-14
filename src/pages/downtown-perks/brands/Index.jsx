import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Building2, Zap, Star } from "lucide-react";

const brands = [
  {
    slug: "the-paseo",
    name: "The Paseo",
    category: "Mixed-Use Property",
    description: "Neighborhood-first lifestyle positioning with walkable discovery built in.",
    tag: "Property",
  },
  {
    slug: "the-waterline",
    name: "The Waterline",
    category: "Premium Residential",
    description: "Skyline-level positioning meets live neighborhood intelligence.",
    tag: "Property · Prestige",
  },
  {
    slug: "bangers",
    name: "Bangers",
    category: "Venue & Hospitality",
    description: "Map discovery, event activation, and measurable district foot traffic.",
    tag: "Venue",
  },
  {
    slug: "the-stay-put",
    name: "The Stay Put",
    category: "Boutique Hotel",
    description: "Guest-facing discovery. Local itinerary building. Timed offers.",
    tag: "Hospitality",
  },
  {
    slug: "yeti",
    name: "YETI",
    category: "Austin Brand Campaign",
    description: "Flagship city-brand activation. QR-led product moments. District presence.",
    tag: "Brand Campaign",
  },
  {
    slug: "rivian",
    name: "Rivian",
    category: "Mobility & Experiential",
    description: "Downtown placement. Experiential activation. Behavior-led engagement.",
    tag: "Mobility",
  },
  {
    slug: "lululemon",
    name: "lululemon",
    category: "Premium Retail & Wellness",
    description: "Run clubs, studio tie-ins, and QR-activated product moments for downtown members.",
    tag: "Retail · Wellness",
  },
  {
    slug: "equinox",
    name: "Equinox",
    category: "Premium Fitness",
    description: "Class passes, building partnerships, and members-only event access.",
    tag: "Fitness",
  },
  {
    slug: "laz-y-boy-park",
    name: "Austin FC",
    category: "Civic & Entertainment",
    description: "Match-day activation, district energy, and building-linked RSVP flows.",
    tag: "Civic · Sport",
  },
  {
    slug: "fabi-and-rosi",
    name: "Fabi & Rosi",
    category: "Local Dining",
    description: "Neighborhood table, resident perks, and curated dining moments.",
    tag: "Dining",
  },
];

function BrandCard({ brand, index }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.07 }}
    >
      <Link
        to={`/brands/${brand.slug}`}
        className="group block p-7 rounded-2xl bg-card border border-border hover:border-primary/40 transition-all duration-300"
      >
        <div className="flex items-start justify-between mb-5">
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
            {brand.tag}
          </span>
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </div>
        <h3 className="font-heading text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
          {brand.name}
        </h3>
        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3">{brand.category}</div>
        <p className="text-sm text-muted-foreground leading-relaxed">{brand.description}</p>
      </Link>
    </motion.div>
  );
}

export default function BrandsIndex() {
  const heroRef = useRef(null);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium tracking-wider uppercase mb-6">
              Partner Directory
            </div>
            <h1 className="font-heading text-5xl md:text-7xl font-bold leading-none tracking-tight mb-6 max-w-4xl">
              Brands that belong<br />
              <span className="text-primary">downtown.</span>
            </h1>
            <p className="text-muted-foreground text-xl max-w-2xl mb-10 leading-relaxed">
              Every partner on this page earns their place on the map. Real presence. Real activation. Real foot traffic from real residents.
            </p>
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <Link
                to="/downtown-perks/for-buildings"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all shadow-xl shadow-primary/25"
              >
                Become a Partner <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/downtown-perks/explore"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-border text-foreground font-semibold text-sm hover:bg-secondary transition-all"
              >
                <MapPin className="w-4 h-4" /> View on Map
              </Link>
            </div>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20"
          >
            {[
              { value: "10+", label: "Partner brands" },
              { value: "3,400+", label: "Downtown residents" },
              { value: "0.4mi", label: "Average walk distance" },
              { value: "Live", label: "Real-time map layer" },
            ].map((s, i) => (
              <div key={i} className="p-5 rounded-2xl bg-card border border-border text-center">
                <div className="font-heading text-2xl font-bold text-primary mb-1">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Brand grid */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-12">
            <Star className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">All Partners</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {brands.map((brand, i) => (
              <BrandCard key={brand.slug} brand={brand} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 border-t border-border">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="font-heading text-4xl md:text-5xl font-bold mb-6"
          >
            Your brand belongs here.
          </motion.h2>
          <p className="text-muted-foreground text-lg mb-10">
            If you operate downtown, serve downtown residents, or want to build a real presence in the district — let's talk.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="mailto:partners@downtownperks.com"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all shadow-2xl shadow-primary/30"
            >
              Start the Conversation <ArrowRight className="w-4 h-4" />
            </a>
            <Link
              to="/downtown-perks/for-buildings"
              className="px-8 py-4 rounded-full border border-border text-foreground font-semibold text-sm hover:bg-secondary transition-all"
            >
              Partnership Details
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}