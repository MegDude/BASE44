import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, Compass, CreditCard, Info, MapPin, Menu, X } from "lucide-react";
import { ROUTES } from "@/lib/routes";

const MOBILE_NAV = [
  { to: ROUTES.explore, icon: Compass, label: "Map" },
  { to: ROUTES.events, icon: MapPin, label: "Events" },
  { to: ROUTES.card, icon: CreditCard, label: "Card" },
  { to: ROUTES.about, icon: Info, label: "More" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const showBackButton = location.pathname !== "/";

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate("/");
  };

  return (
    <>
      {/* TOP NAV (SLIM) */}
      <nav ref={dropdownRef} className="fixed left-0 right-0 top-0 z-50">
        <div className="mx-auto mt-2 flex h-12 w-[min(96%,1100px)] items-center justify-between rounded-full pearl-surface px-3">
          <div className="flex items-center gap-2">
            {showBackButton && (
              <button onClick={handleBack} className="h-8 w-8 rounded-full">
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}
            <Link to="/" className="text-sm font-semibold">
              Downtown Perks
            </Link>
          </div>

          <button
            onClick={() => setOpen((v) => !v)}
            className="h-9 w-9 rounded-full md:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-2 rounded-xl bg-white p-4 shadow-lg"
            >
              <div className="space-y-2">
                <Link to={ROUTES.explore}>Map</Link>
                <Link to={ROUTES.events}>Events</Link>
                <Link to={ROUTES.card}>Card</Link>
                <Link to={ROUTES.about}>About</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* BOTTOM NAV (MOBILE FIRST) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-around border-t bg-white/80 backdrop-blur-md md:hidden">
        {MOBILE_NAV.map(({ to, icon: Icon, label }) => (
          <Link key={to} to={to} className="flex flex-col items-center justify-center py-2 text-xs">
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </div>
    </>
  );
}
