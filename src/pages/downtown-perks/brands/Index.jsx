import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";
import { campaignImages } from "../../../components/downtown-perks/brands/CampaignImagePanel";

const brands = [
  { slug: "hotel-van-zandt", name: "Hotels", category: "Hotel Van Zandt", headline: "Stay nearby. Experience more.", description: "Discover local events, resident favorites, and neighborhood experiences beyond the lobby.", tag: "Hotel", image: campaignImages.qwrFrontDesk },
  { slug: "the-stay-put", name: "Residential", category: "The Stay Put", headline: "Live connected to downtown.", description: "See what is happening nearby, discover local perks, and make the neighborhood part of everyday life.", tag: "Residential", image: campaignImages.elevatorQr },
  { slug: "bangers", name: "Restaurants & Venues", category: "Banger's", headline: "Show up when people are deciding.", description: "Happy hours. Events. Local perks. Reasons to come back.", tag: "Venue", image: campaignImages.bangersPoster },
  { slug: "inkind", name: "Dining Value", category: "inKind", headline: "Create the visit before the check.", description: "Connect dining benefits to map discovery, saved places, nearby recommendations, and resident intent.", tag: "Dining Layer", image: { src: "/images/partner/drop-in-images/inkind-table-spread.jpg", fallback: "/images/partner/drop-in-images/inkind-plated-dinner.jpg" } },
  { slug: "fine-eyewear", name: "Retail", category: "Fine Eyewear", headline: "Become part of the routine.", description: "Help nearby residents discover, save, and revisit local favorites.", tag: "Retail", image: campaignImages.fineEyewear },
  { slug: "rivian", name: "Brand Activations", category: "Rivian", headline: "Adventure starts downtown.", description: "Bring people together through experiences, events, and moments worth showing up for.", tag: "Brand Experience", image: campaignImages.rivian },
  { slug: "daa", name: "Civic", category: "DAA", headline: "Help shape downtown.", description: "Connect residents, businesses, and local initiatives through participation.", tag: "Civic", image: campaignImages.daa },
  { slug: "dana", name: "Neighborhood Civic", category: "DANA", headline: "A stronger downtown starts with participation.", description: "Connect with residents, businesses, and the people helping shape what comes next.", tag: "Civic", image: campaignImages.dana },
  { slug: "the-paseo", name: "Housing", category: "The Paseo", headline: "Live near what matters.", description: "Discover local events, restaurants, fitness, and everyday essentials within walking distance.", tag: "Residential", image: campaignImages.mapUi },
];

function CardImage({ image, alt }) {
  const [src, setSrc] = useState(image?.src);
  return (
    <div className="mb-5 aspect-[4/5] overflow-hidden rounded-[18px] border border-[#BFA46A]/20 bg-[#FFFFFF]">
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        onError={() => {
          if (image?.fallback && src !== image.fallback) setSrc(image.fallback);
        }}
      />
    </div>
  );
}

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
        className="group block rounded-lg border border-[#BFA46A]/20 bg-[#FFFFFF] p-4 transition-all duration-300 hover:border-[#BFA46A]/50"
      >
        <CardImage image={brand.image} alt={`${brand.category} campaign`} />
        <div className="flex items-start justify-between mb-4">
          <span className="text-[11px] text-[#BFA46A] uppercase text-[11px] font-bold uppercase tracking-normal">
            {brand.tag}
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-[#0B1F33]/35 group-hover:text-[#BFA46A] group-hover:translate-x-0.5 transition-all" />
        </div>
        <h3 className="font-heading text-xl font-medium mb-1 group-hover:text-primary transition-colors duration-300">
          {brand.headline}
        </h3>
        <div className="text-[11px] text-muted-foreground/60 uppercase mb-3 text-[11px] font-bold uppercase tracking-normal">{brand.category}</div>
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
            <span className="text-[11px] text-primary/70 uppercase block mb-4 text-[11px] font-bold uppercase tracking-normal">
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
                  Each partner type gets its own expression of Downtown Perks: hotel guests, residents, venues, retail, brand experiences, and civic participation.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/downtown-perks/for-buildings"
                    className="inline-flex items-center gap-2 rounded-lg bg-[#0B1F33] px-5 py-2.5 text-[13px] font-medium text-[#FFFFFF] transition-all duration-300 hover:bg-[#0B1F33]/90"
                  >
                    Become a Partner <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    to="/map?mode=resident&tab=map"
                    className="inline-flex items-center gap-2 rounded-lg border border-[#BFA46A]/30 px-5 py-2.5 text-[13px] font-medium text-[#0B1F33]/75 transition-all duration-300 hover:border-[#BFA46A] hover:text-[#0B1F33]"
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
              { value: "8", label: "Partner types" },
              { value: "3,400+", label: "Downtown residents" },
              { value: "0.4 mi", label: "Avg walk distance" },
              { value: "Live", label: "Events and offers" },
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
            <span className="text-[11px] text-muted-foreground uppercase text-[11px] font-bold uppercase tracking-normal">
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
                If you operate downtown, serve downtown residents, or want to participate in the district, let's talk.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="mailto:partners@downtownperks.com"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#0B1F33] px-5 py-2.5 text-[13px] font-medium text-[#FFFFFF] transition-all duration-300 hover:bg-[#0B1F33]/90"
                >
                  Start the Conversation <ArrowRight className="w-3.5 h-3.5" />
                </a>
                <Link
                  to="/downtown-perks/for-buildings"
                  className="inline-flex items-center gap-2 rounded-lg border border-[#BFA46A]/30 px-5 py-2.5 text-[13px] font-medium text-[#0B1F33]/75 transition-all duration-300 hover:border-[#BFA46A] hover:text-[#0B1F33]"
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
