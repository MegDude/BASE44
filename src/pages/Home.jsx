import { Link } from "react-router-dom";
import { ArrowRight, Building2, MapPin, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import HomeFooter from "../components/HomeFooter";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary to-background" />
        
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-secondary mb-8">
              <Building2 className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Property Management Platform
              </span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-heading text-5xl md:text-7xl font-bold leading-tight mb-6"
          >
            Welcome to Your
            <br />
            <span className="text-primary">App</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-muted-foreground text-xl max-w-2xl mx-auto mb-12"
          >
            Manage properties, track operations, and connect with your community.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/downtown-perks"
              className="group px-8 py-4 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all shadow-2xl shadow-primary/30 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Explore Downtown Perks
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features preview */}
      <section className="py-24 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: MapPin,
                title: "Location Management",
                description: "Track and manage multiple properties and locations from one dashboard."
              },
              {
                icon: Building2,
                title: "Building Operations",
                description: "Streamline maintenance, amenities, and resident services."
              },
              {
                icon: Sparkles,
                title: "Community Features",
                description: "Connect residents with local perks, events, and neighborhood experiences."
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + i * 0.1 }}
                className="p-6 rounded-2xl border border-border bg-card hover:border-primary/30 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-heading text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <HomeFooter />
    </div>
  );
}