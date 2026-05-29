import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, MapPin, Gift, CreditCard, Bookmark, Building2, Menu, X } from "lucide-react";

const TABS = [
  { id: "now", label: "Residents", icon: MapPin, tooltip: "Live map & nearby" },
  { id: "plan", label: "Plan", icon: CalendarDays, tooltip: "Events and RSVPs" },
  { id: "perks", label: "Perks", icon: Gift, tooltip: "Active offers" },
  { id: "card", label: "Card", icon: CreditCard, tooltip: "Your card & QR" },
  { id: "saved", label: "Saved", icon: Bookmark, tooltip: "Your saves" },
  { id: "buildings", label: "Buildings", icon: Building2, tooltip: "Where to live" },
];

export default function ResidentNav({ activeTab, onTabChange, user }) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <>
      {/* Desktop Nav */}
      <nav className="hidden md:flex items-center gap-1 px-4 py-2.5 border-b border-border/20 bg-background">
        <div className="flex-1 flex items-center gap-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <motion.button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                whileHover={{ bg: "rgba(0,0,0,0.02)" }}
                whileTap={{ scale: 0.98 }}
                className={`relative px-4 py-2 rounded-lg font-medium text-[13px] transition-colors flex items-center gap-2 ${
                  isActive
                    ? "text-foreground bg-primary/10"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title={tab.tooltip}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                    transition={{ duration: 0.3 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* User greeting (desktop) */}
        {user && (
          <div className="text-right text-xs text-muted-foreground">
            <p className="font-medium">{user.full_name}</p>
          </div>
        )}
      </nav>

      {/* Mobile Nav */}
      <div className="md:hidden border-b border-border/20 bg-background">
        <div className="flex items-center justify-between px-4 py-2.5">
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="p-2 hover:bg-muted rounded-lg"
          >
            {showMobileMenu ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>

          {user && (
            <div className="text-xs text-muted-foreground text-center flex-1">
              <p className="font-medium">{user.full_name.split(" ")[0]}</p>
            </div>
          )}

          <div className="w-10" /> {/* Spacer for alignment */}
        </div>

        {/* Mobile menu */}
        <AnimatePresence mode="wait" initial={false}>
          {showMobileMenu && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-border/20 bg-muted/30"
            >
              <div className="px-2 py-2 space-y-1">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        onTabChange(tab.id);
                        setShowMobileMenu(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                        isActive
                          ? "text-foreground bg-primary/10"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
