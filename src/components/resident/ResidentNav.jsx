import { useState } from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Compass,
  Map,
  Bookmark,
  CreditCard,
  Menu,
  X,
} from "lucide-react";

const TABS = [
  {
    id: "now",
    label: "Now",
    icon: Compass,
    path: "/resident-app",
    tooltip: "What matters nearby right now",
  },
  {
    id: "map",
    label: "Map",
    icon: Map,
    path: "/resident-app/map",
    tooltip: "Explore the live downtown layer",
  },
  {
    id: "saved",
    label: "Saved",
    icon: Bookmark,
    path: "/resident-app/saved",
    tooltip: "Places, perks, events, and buildings you saved",
  },
  {
    id: "card",
    label: "Card",
    icon: CreditCard,
    path: "/resident-app/card",
    tooltip: "Your perks card and redemptions",
  },
];

function tabButtonClass(isActive) {
  return `relative flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
    isActive
      ? "bg-primary/10 text-foreground"
      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
  }`;
}

export default function ResidentNav({ user }) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <>
      <nav className="hidden items-center gap-1 border-b border-border/20 bg-background px-4 py-3 md:flex">
        <div className="flex flex-1 items-center gap-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;

            return (
              <NavLink
                key={tab.id}
                to={tab.path}
                end={tab.path === "/resident-app"}
                title={tab.tooltip}
                className={({ isActive }) => tabButtonClass(isActive)}
              >
                {({ isActive }) => (
                  <>
                    <motion.span whileTap={{ scale: 0.98 }} className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </motion.span>
                    {isActive && (
                      <motion.div
                        layoutId="residentActiveIndicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                        transition={{ duration: 0.24 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
        {user && (
          <div className="text-right text-xs text-muted-foreground">
            <p className="font-medium">{user.full_name}</p>
          </div>
        )}
      </nav>

      <div className="border-b border-border/20 bg-background md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            type="button"
            onClick={() => setShowMobileMenu((prev) => !prev)}
            className="rounded-lg p-2 hover:bg-muted"
            aria-label={showMobileMenu ? "Close resident navigation" : "Open resident navigation"}
          >
            {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          {user ? (
            <div className="flex-1 text-center text-xs text-muted-foreground">
              <p className="font-medium">{user.full_name.split(" ")[0]}</p>
            </div>
          ) : (
            <div className="flex-1 text-center text-xs text-muted-foreground">Resident App</div>
          )}
          <div className="w-10" />
        </div>
        <AnimatePresence initial={false}>
          {showMobileMenu && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-border/20 bg-muted/30"
            >
              <div className="space-y-1 px-2 py-2">
                {TABS.map((tab) => {
                  const Icon = tab.icon;

                  return (
                    <NavLink
                      key={tab.id}
                      to={tab.path}
                      end={tab.path === "/resident-app"}
                      onClick={() => setShowMobileMenu(false)}
                      className={({ isActive }) =>
                        `flex w-full items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-primary/10 text-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-background/70"
                        }`
                      }
                    >
                      <Icon className="h-4 w-4" />
                      <span>{tab.label}</span>
                    </NavLink>
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
