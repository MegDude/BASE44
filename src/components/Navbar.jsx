import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, MapPin, ChevronDown, Hotel, MapIcon, Star, Landmark, Building2, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const RESIDENT_LINKS = [
  { to: "/resident-app", label: "Resident App", desc: "Map, card, saved, and plan" },
  { to: "/explore", label: "Live Map", desc: "Browse places, events & perks" },
  { to: "/events", label: "Events", desc: "What's happening downtown" },
  { to: "/perks", label: "Perks", desc: "Member offers & benefits" },
  { to: "/card", label: "Perks Card", desc: "Your resident credential" },
];

const PARTNER_LINKS = [
  { to: "/partners", label: "Overview", desc: "Partner system entry point", icon: LayoutDashboard },
  { to: "/partners/properties", label: "Properties", desc: "Buildings & amenity layers", icon: Building2 },
  { to: "/partners/hospitality", label: "Hospitality", desc: "Hotels & guest intelligence", icon: Hotel },
  { to: "/partners/venues", label: "Venues", desc: "Restaurants, bars & fitness", icon: MapIcon },
  { to: "/partners/brands", label: "Brands", desc: "Campaigns & activations", icon: Star },
  { to: "/partners/civic", label: "Civic", desc: "District programs & events", icon: Landmark },
  { to: "/partners/dashboard", label: "Dashboard", desc: "Business insight hub", icon: LayoutDashboard },
];

const TOP_LINKS = [
  { label: "Residents", dropdown: "residents" },
  { label: "Partners", dropdown: "partners" },
  { to: "/downtown-perks/for-buildings", label: "Pricing" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [dropdown, setDropdown] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setDropdown(null);
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const isActive = (to) => {
    if (!to) return false;
    if (to === "/brands") return location.pathname.startsWith("/brands");
    if (to === "/partners") return location.pathname.startsWith("/partners");
    return location.pathname === to;
  };

  const isDropdownActive = (which) => {
    if (which === "residents") {
      return (
        location.pathname.startsWith("/downtown-perks") ||
        ["/explore", "/map", "/events", "/perks", "/card", "/about"].includes(location.pathname)
      );
    }
    if (which === "partners") return location.pathname.startsWith("/partners") || location.pathname.startsWith("/brands");
    return false;
  };

  return (
    <nav
      ref={dropdownRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-[rgba(11,31,51,0.08)] backdrop-blur-xl ${
        scrolled ? "bg-[rgba(255,255,255,0.97)]" : "bg-[rgba(255,255,255,0.92)]"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-[68px] flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0" aria-label="Downtown Perks home">
          <div className="w-7 h-7 rounded-full border border-[rgba(11,31,51,0.10)] flex items-center justify-center bg-[rgba(198,162,105,0.10)]">
            <MapPin className="w-3.5 h-3.5 text-[#C6A269]" />
          </div>
          <span className="dp-brand-wordmark text-[15px] text-[#0B1F33]">
            Downtown<span className="text-[#C6A269]"> Perks</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-0.5">
          {TOP_LINKS.map((link, i) => {
            if (link.dropdown) {
              const active = isDropdownActive(link.dropdown);
              return (
                <div key={i} className="relative">
                  <button
                    onClick={() => setDropdown(dropdown === link.dropdown ? null : link.dropdown)}
                    className={`flex items-center gap-1 px-4 py-2 text-[13px] font-medium tracking-wide transition-colors duration-200 ${
                      active || dropdown === link.dropdown ? "text-[#0B1F33]" : "text-[rgba(11,31,51,0.70)] hover:text-[#0B1F33]"
                    }`}
                  >
                    {link.label}
                    <ChevronDown className={`w-3.5 h-3.5 text-[rgba(11,31,51,0.48)] transition-transform duration-200 ${dropdown === link.dropdown ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {dropdown === link.dropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.2 }}
                        className="absolute left-1/2 top-full mt-2 w-[320px] -translate-x-1/2 overflow-hidden rounded-[18px] border border-[rgba(11,31,51,0.10)] bg-[rgba(255,255,255,0.98)] shadow-[0_20px_48px_rgba(11,31,51,0.16)] backdrop-blur-xl"
                      >
                        <div className="p-2">
                          {(link.dropdown === "residents" ? RESIDENT_LINKS : PARTNER_LINKS).map((item) => {
                            const Icon = item.icon;
                            return (
                              <Link
                                key={item.to}
                                to={item.to}
                                className="flex items-center gap-3 rounded-[14px] px-3 py-3 transition-colors hover:bg-[rgba(11,31,51,0.04)] group"
                              >
                                {Icon ? (
                                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[rgba(11,31,51,0.05)] text-[rgba(11,31,51,0.68)]">
                                    <Icon className="h-3.5 w-3.5" strokeWidth={1.8} />
                                  </div>
                                ) : (
                                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[rgba(11,31,51,0.05)] text-[rgba(11,31,51,0.68)]">
                                    <MapPin className="h-3.5 w-3.5" strokeWidth={1.8} />
                                  </div>
                                )}
                                <div>
                                  <div className="text-[13px] font-medium text-[#0B1F33] transition-colors">{item.label}</div>
                                  <div className="text-[11px] text-[rgba(11,31,51,0.55)] mt-0.5">{item.desc}</div>
                                </div>
                              </Link>
                            );
                          })}
                          {link.dropdown === "partners" && (
                            <div className="mx-3 mt-1 pt-2 border-t border-border/50">
                              <Link to="/partners" className="flex items-center gap-2 px-0 py-2 text-[12px] font-medium text-[rgba(11,31,51,0.70)] hover:text-[#0B1F33] transition-colors">
                                View all partner types →
                              </Link>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }

            return (
              <Link
                key={link.to}
                to={link.to}
                className="px-4 py-2 text-[13px] font-medium tracking-wide transition-colors duration-200 text-[rgba(11,31,51,0.70)] hover:text-[#0B1F33]"
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* CTA row */}
        <div className="hidden md:flex items-center gap-2.5">
          <Link
            to="/partners/dashboard"
            className="flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium text-[rgba(11,31,51,0.70)] hover:text-[#0B1F33] transition-colors"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Dashboard
          </Link>
          <Link
            to="/card"
            className="px-5 py-2 rounded-full bg-[#0B1A2B] text-white text-[13px] font-semibold hover:bg-[#14263B] transition-all duration-300 shadow-sm shadow-black/10"
          >
            Get Your Card
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button onClick={() => setOpen(!open)} className="relative z-[60] md:hidden text-[rgba(11,31,51,0.70)] hover:text-[#0B1F33] p-2 transition-colors">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 right-0 top-[68px] max-h-[80vh] overflow-y-auto border-b border-[rgba(11,31,51,0.08)] bg-[rgba(255,255,255,0.98)] backdrop-blur-xl md:hidden"
          >
            <div className="px-5 py-5 space-y-1">

              {/* Resident links */}
              <div className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-[0.14em] px-3 mb-2">Explore</div>
              {RESIDENT_LINKS.map((link) => (
                <Link key={link.to} to={link.to} onClick={() => setOpen(false)}
                  className={`block px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors ${
                    isActive(link.to) ? "text-[#0B1F33] bg-[rgba(11,31,51,0.06)]" : "text-[rgba(11,31,51,0.72)] hover:text-[#0B1F33]"
                  }`}>
                  {link.label}
                </Link>
              ))}

              {/* Partner links */}
              <div className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-[0.14em] px-3 mt-4 mb-2">Partners</div>
              {PARTNER_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <Link key={link.to} to={link.to} onClick={() => setOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors ${
                      isActive(link.to) ? "text-[#0B1F33] bg-[rgba(11,31,51,0.06)]" : "text-[rgba(11,31,51,0.72)] hover:text-[#0B1F33]"
                    }`}>
                    {Icon && <Icon className="w-3.5 h-3.5 text-[rgba(11,31,51,0.55)] shrink-0" />}
                    {link.label}
                  </Link>
                );
              })}

              {/* Other */}
              <div className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-[0.14em] px-3 mt-4 mb-2">More</div>
              <Link to="/downtown-perks/for-buildings" onClick={() => setOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-[13px] font-medium text-[rgba(11,31,51,0.72)] hover:text-[#0B1F33] transition-colors">
                Pricing
              </Link>
              <Link to="/partners/dashboard" onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-[13px] font-medium text-[rgba(11,31,51,0.72)] hover:text-[#0B1F33] transition-colors">
                <LayoutDashboard className="w-3.5 h-3.5 text-[rgba(11,31,51,0.55)]" /> Dashboard
              </Link>

              <div className="pt-4 pb-2">
                <Link to="/card" onClick={() => setOpen(false)}
                  className="block rounded-full bg-[#0B1A2B] px-5 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-[#14263B]"
                >
                  Get Your Card
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
