import { useState } from "react";
import { motion } from "framer-motion";
import { QrCode, Copy, Check } from "lucide-react";

export default function ResidentCardTab({ user }) {
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);

  const cardCode = "DP-USER-" + (user?.id || "123456").slice(0, 8).toUpperCase();

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
          <h2 className="font-heading text-2xl font-medium mb-6">Your Card</h2>

          {/* QR Code Display */}
          <motion.div
            onClick={() => setShowQR(!showQR)}
            whileHover={{ scale: 1.02 }}
            className="p-8 rounded-2xl border-2 border-primary bg-gradient-to-br from-primary/10 to-primary/5 cursor-pointer transition-all mb-6"
          >
            <motion.div
              animate={{ rotate: showQR ? 0 : 360 }}
              transition={{ duration: 0.4 }}
            >
              <QrCode className="w-32 h-32 text-primary mx-auto" />
            </motion.div>
            <p className="text-center text-sm text-muted-foreground mt-4">
              {showQR ? "Tap to hide" : "Tap to show QR code"}
            </p>
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
                  <Check className="w-4 h-4 text-green-600" />
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
            { label: "Scans", value: "24" },
            { label: "Redeemed", value: "8" },
            { label: "Saved", value: "12" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}