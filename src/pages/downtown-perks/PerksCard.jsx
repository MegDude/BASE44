import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, QrCode, Shield, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function PerksCard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock user for demo purposes
    setUser({ name: "Demo User", email: "demo@user.com" });
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 px-6 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <span className="text-primary text-sm font-medium uppercase tracking-widest">
            Your Membership
          </span>
          <h1 className="font-heading text-4xl md:text-5xl font-bold mt-2 mb-4">
            Perks Card
          </h1>
          <p className="text-muted-foreground text-lg">
            Your key to the downtown neighborhood system.
          </p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 30, rotateX: 10 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative mx-auto max-w-md"
        >
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-card via-secondary to-card border border-border p-8 shadow-2xl">
            {/* Gold accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />

            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="font-heading font-bold text-sm">
                  Downtown<span className="text-primary">Perks</span>
                </span>
              </div>
              <Shield className="w-5 h-5 text-primary/50" />
            </div>

            {/* QR placeholder */}
            <div className="flex items-center justify-center mb-8">
              <div className="w-40 h-40 rounded-2xl bg-foreground/5 border border-border flex items-center justify-center">
                {user ? (
                  <QrCode className="w-20 h-20 text-primary/40" />
                ) : (
                  <div className="text-center">
                    <QrCode className="w-12 h-12 text-muted-foreground/30 mx-auto mb-2" />
                    <span className="text-muted-foreground text-xs">Sign in to activate</span>
                  </div>
                )}
              </div>
            </div>

            {/* Member info */}
            <div className="text-center mb-4">
              <h3 className="font-heading text-xl font-bold">
                {user ? user.full_name || "Member" : "Your Name Here"}
              </h3>
              <p className="text-muted-foreground text-sm mt-1">
                {user ? "Active Member" : "Become a Member"}
              </p>
            </div>

            <div className="text-center">
              <span className="text-xs text-muted-foreground uppercase tracking-widest">
                Austin, TX · Downtown Core
              </span>
            </div>

            {/* Bottom accent */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 space-y-4 max-w-md mx-auto"
        >
          <Link
            to="/downtown-perks/explore"
            className="w-full px-6 py-4 rounded-2xl border border-border text-foreground font-semibold text-sm hover:bg-secondary transition-all flex items-center justify-center gap-2"
          >
            Explore the Map
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-lg mx-auto"
        >
          {[
            { label: "No App Download", detail: "Works on your phone instantly" },
            { label: "QR to Redeem", detail: "Flash at any partner venue" },
            { label: "Members Only", detail: "Exclusive downtown access" },
          ].map((f, i) => (
            <div key={i} className="text-center">
              <h4 className="font-heading font-semibold text-sm mb-1">{f.label}</h4>
              <p className="text-muted-foreground text-xs">{f.detail}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}