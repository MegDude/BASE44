import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Sparkles, Gift } from "lucide-react";
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
    <div className="pt-24 pb-20 px-5 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <span className="text-primary text-[13px] font-medium uppercase tracking-widest">
            Members Only
          </span>
          <h1 className="font-heading text-4xl md:text-4xl font-bold mt-2 mb-4">
            Your Perks
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl">
            Exclusive offers from local businesses — just for Downtown Perks
            members. Flash your card to redeem.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
          </div>
        ) : active.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {active.map((perk, i) => (
              <motion.div
                key={perk.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="group rounded-lg border border-border bg-card p-6 hover:border-primary/30 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium capitalize">
                    {perk.category?.replace("_", " ")}
                  </span>
                  <Gift className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                </div>

                <h3 className="font-heading text-lg font-bold mb-1">{perk.title}</h3>
                <p className="text-muted-foreground text-[13px] mb-1">{perk.venue_name}</p>

                <div className="mt-4 p-3 rounded-xl bg-primary/5 border border-primary/10">
                  <span className="text-primary font-heading font-bold text-xl">
                    {perk.value}
                  </span>
                </div>

                {perk.description && (
                  <p className="text-muted-foreground text-xs mt-4 leading-relaxed">
                    {perk.description}
                  </p>
                )}

                {perk.terms && (
                  <p className="text-muted-foreground/60 text-xs mt-2 italic">
                    {perk.terms}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Sparkles className="w-12 h-10 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-heading text-xl font-bold mb-2">Perks Coming Soon</h3>
            <p className="text-muted-foreground text-[13px] max-w-sm mx-auto">
              We're partnering with the best local businesses to bring you
              exclusive member offers. Stay tuned.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}