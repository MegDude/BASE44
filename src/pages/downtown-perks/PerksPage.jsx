/**
 * Perks Page - Compact list view, no card grids
 * Redirects to map for location context
 */

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { MapPin, ArrowRight, Gift, Clock } from "lucide-react";
import { motion } from "framer-motion";

export default function PerksPage() {
  const [perks, setPerks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await base44.entities.Perk.list("-created_date");
      setPerks(data);
      setLoading(false);
    }
    load();
  }, []);

  const active = perks.filter((p) => p.status === "active");

  return (
    <div className="pt-20 pb-16 px-6 min-h-screen bg-background">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h1 className="font-heading text-2xl font-bold">Your Perks</h1>
            <Link
              to="/downtown-perks/explore"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <MapPin className="w-4 h-4" />
              See on map
            </Link>
          </div>
          <p className="text-muted-foreground text-sm">
            Flash your card to redeem at any partner location.
          </p>
        </motion.div>

        {/* Perks List - Compact Rows */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-muted border-t-primary rounded-full animate-spin" />
          </div>
        ) : active.length > 0 ? (
          <div className="divide-y divide-border/50">
            {active.map((perk, i) => (
              <motion.div
                key={perk.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="py-4 flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Gift className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm truncate">{perk.title}</span>
                    <span className="text-primary font-semibold text-sm shrink-0">
                      {perk.value}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{perk.venue_name}</span>
                    {perk.category && (
                      <>
                        <span className="text-border">|</span>
                        <span className="capitalize">{perk.category.replace("_", " ")}</span>
                      </>
                    )}
                  </div>
                </div>
                <Link
                  to={`/downtown-perks/explore?perk=${perk.id}`}
                  className="shrink-0 p-2 rounded-full hover:bg-muted/50 transition-colors"
                >
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Gift className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-heading text-lg font-semibold mb-2">Perks Coming Soon</h3>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              We are partnering with local businesses to bring you exclusive offers.
            </p>
          </div>
        )}

        {/* Map CTA */}
        {active.length > 0 && (
          <div className="mt-8 pt-6 border-t border-border/40 text-center">
            <Link
              to="/downtown-perks/explore"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <MapPin className="w-4 h-4" />
              Find perks near you
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
