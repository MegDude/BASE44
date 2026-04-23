import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, ShieldCheck } from "lucide-react";

export default function ResidentCardTab({ user }) {
  const [copied, setCopied] = useState(false);

  const cardCode = "DP-USER-" + (user?.id || "123456").slice(0, 8).toUpperCase();
  const qrValue = JSON.stringify({
    type: "downtown_perks_member_card",
    memberId: cardCode,
    name: user?.full_name || "DowntownPerks Member",
    status: "active",
    source: "resident_app",
  });
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${encodeURIComponent(qrValue)}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(cardCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const recentRedemptions = [
    { date: "Yesterday", place: "Café Noir", offer: "15% off coffee" },
    { date: "2 days ago", place: "Rainey Rooftop", offer: "Free appetizer" },
    { date: "1 week ago", place: "Yoga Haven", offer: "Class credit" },
  ];

  return (
    <div className="h-full flex flex-col overflow-y-auto bg-background">
      <div className="p-6 space-y-8">
        {/* Identity Section */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary/80 mb-2">
            Your Membership
          </p>
          <h2 className="font-heading text-3xl font-semibold tracking-[-0.05em] mb-6">Perks Card</h2>

          {/* QR Code Display */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="rounded-[28px] bg-white/42 p-6 shadow-[0_18px_52px_rgba(11,31,51,0.08)] backdrop-blur-xl transition-all mb-6"
          >
            <div className="mx-auto w-fit rounded-[24px] bg-white p-4 shadow-[0_12px_32px_rgba(11,31,51,0.10)]">
              <img src={qrUrl} alt="Downtown Perks resident QR code" className="h-52 w-52 rounded-[16px]" />
            </div>
            <div className="mt-5 text-center">
              <h3 className="text-xl font-semibold tracking-[-0.04em]">
                {user?.full_name || "DowntownPerks Member"}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">Active Member</p>
              <p className="mt-3 text-xs leading-5 text-muted-foreground">
                Scan or show this code at partner venues to redeem perks and verify membership.
              </p>
            </div>
          </motion.div>

          {/* Card Code */}
          <div className="p-4 rounded-xl border border-border/40 bg-muted/30">
            <p className="text-xs text-muted-foreground mb-2">Card Code</p>
            <div className="flex items-center justify-between">
              <code className="font-mono font-bold text-foreground">{cardCode}</code>
              <button
                onClick={handleCopyCode}
                className="p-2 hover:bg-white rounded-lg transition-colors"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-primary" />
                ) : (
                  <Copy className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Redemption History */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="font-semibold text-foreground mb-4">Recent Redemptions</h3>
          <div className="space-y-2">
            {recentRedemptions.map((item, i) => (
              <div
                key={i}
                className="p-3 rounded-lg border border-border/20 bg-white/50"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">{item.date}</p>
                    <p className="font-medium text-sm text-foreground">{item.place}</p>
                    <p className="text-xs text-muted-foreground">{item.offer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Card Stats */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-3 py-6 border-t border-border/20"
        >
          {[
            { label: "Verified", value: <ShieldCheck className="mx-auto h-6 w-6" /> },
            { label: "Scans", value: "24" },
            { label: "Redeemed", value: "8" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
