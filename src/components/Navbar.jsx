import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, MapPin, ChevronDown, Hotel, MapIcon, Star, Landmark, Home, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const RESIDENT_LINKS = [
  { to: "/explore", label: "Live Map", desc: "Browse places, events & perks" },
  { to: "/events", label: "Events", desc: "What's happening downtown" },
  { to: "/perks", label: "Perks", desc: "Member offers & benefits" },
  { to: "/card", label: "Perks Card", desc: "Your resident credential" },
];

const PARTNER_LINKS = [
  { to: "/partners/residential", label: "Residential", desc: "Buildings & amenity layers", icon: Home },
  { to: "/partners/hotels", label: "Hospitality", desc: "Hotels & guest experience", icon: Hotel },
  { to: "/partners/venues", label: "Venues", desc: "Restaurants, bars & fitness", icon: MapIcon },
  { to: "/partners/brands", label: "Brands", desc: "Campaigns & activations", icon: Star },
  { to: "/partners/civic", label: "Civic", desc: "District programs & events", icon: Landmark },
];

const TOP_LINKS = [
  
  
  { label: "Residents", dropdown: "residents" },
  { label: "Partners", dropdown: "partners" },
  { to: "/pricing", label: "Pricing" },
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
    <nav ref={dropdownRef} className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled
        ? "border-b border-[rgba(11,31,51,0.08)] bg-[rgba(247,246,242,0.74)] backdrop-blur-xl"
        : "border-b border-transparent bg-[rgba(247,246,242,0.42)] backdrop-blur-md"
    }`}>
      <div className="max-w-7xl mx-auto px-6 h-[68px] flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group shrink-0" aria-label="Downtown Perks home">
          <div className="flex h-8 w-8 items-center justify-center rounded-[11px] bg-[rgba(11,31,51,0.06)]">
            <MapPin className="h-4 w-4 text-[var(--dp-navy,#0B1F33)]" strokeWidth={1.8} />
          </div>
          <span className="font-heading text-[16px] font-semibold tracking-[-0.035em] text-[var(--dp-navy,#0B1F33)]">
            Downtown Perks
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
                    className={`flex items-center gap-1 rounded-[10px] px-4 py-2 text-[13px] font-medium tracking-[0.01em] transition-colors duration-200 ${
                      active || dropdown === link.dropdown ? "bg-[rgba(11,31,51,0.06)] text-[var(--dp-navy,#0B1F33)]" : "text-foreground/62 hover:bg-white/38 hover:text-foreground"
                    }`}
                  >
                    {link.label}
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${dropdown === link.dropdown ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {dropdown === link.dropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.2 }}
                        className="absolute left-1/2 top-full mt-2 w-[320px] -translate-x-1/2 overflow-hidden rounded-[18px] border border-[rgba(11,31,51,0.08)] bg-[rgba(255,255,255,0.74)] shadow-[0_20px_48px_rgba(11,31,51,0.10)] backdrop-blur-xl"
                      >
                        <div className="p-2">
                          {(link.dropdown === "residents" ? RESIDENT_LINKS : PARTNER_LINKS).map((item) => {
                            const Icon = item.icon;
                            return (
                              <Link
                                key={item.to}
                                to={item.to}
                                  className="flex items-center gap-3 rounded-[14px] px-3 py-3 transition-colors hover:bg-[rgba(11,31,51,0.05)] group"
                              >
                                {Icon ? (
                                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[rgba(11,31,51,0.06)]">
                                    <Icon className="h-3.5 w-3.5 text-[var(--dp-navy,#0B1F33)]" strokeWidth={1.8} />
                                  </div>
                                ) : (
                                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[rgba(11,31,51,0.04)]">
                                    <MapPin className="h-3.5 w-3.5 text-foreground/56" strokeWidth={1.8} />
                                  </div>
                                )}
                                <div>
                                  <div className="text-[13px] font-medium text-foreground group-hover:text-primary transition-colors">{item.label}</div>
                                  <div className="text-[11px] text-muted-foreground/60 mt-0.5">{item.desc}</div>
                                </div>
                              </Link>
                            );
                          })}
                          {link.dropdown === "partners" && (
                            <div className="mx-3 mt-1 pt-2 border-t border-border/40">
                              <Link to="/partners" className="flex items-center gap-2 px-0 py-2 text-[12px] font-medium text-primary/70 hover:text-primary transition-colors">
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
                className={`rounded-[10px] px-4 py-2 text-[13px] font-medium tracking-[0.01em] transition-colors duration-200 ${
                  isActive(link.to) ? "bg-[rgba(11,31,51,0.06)] text-[var(--dp-navy,#0B1F33)]" : "text-foreground/62 hover:bg-white/38 hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* CTA row */}
        <div className="hidden md:flex items-center gap-2.5">
          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 rounded-[10px] px-4 py-2 text-[13px] font-medium text-foreground/62 transition-colors hover:bg-white/38 hover:text-foreground"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Dashboard
          </Link>
          <Link
            to="/card"
            className="rounded-[12px] bg-[var(--dp-navy,#0B1F33)] px-5 py-2.5 text-[13px] font-semibold text-white transition-colors duration-300 hover:bg-[rgba(11,31,51,0.9)]"
          >
            Get Your Card
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button onClick={() => setOpen(!open)} className="md:hidden text-foreground/60 hover:text-foreground p-2 transition-colors">
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
            className="absolute left-0 right-0 top-[68px] max-h-[80vh] overflow-y-auto border-b border-[rgba(11,31,51,0.08)] bg-[rgba(247,246,242,0.88)] backdrop-blur-xl md:hidden"
          >
            <div className="px-5 py-5 space-y-1">

              {/* Resident links */}
              <div className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-[0.14em] px-3 mb-2">Explore</div>
              {RESIDENT_LINKS.map((link) => (
                <Link key={link.to} to={link.to} onClick={() => setOpen(false)}
                  className={`block px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors ${
                    isActive(link.to) ? "text-primary bg-primary/5" : "text-foreground/70 hover:text-foreground"
                  }`}>
                  {link.label}
                </Link>
              ))}

              {/* Partner links */}
              <div className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-[0.14em] px-3 mt-4 mb-2">Partners</div>
              {PARTNER_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <Link key={link.to} to={link.to} onClick={() => setOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors ${
                      isActive(link.to) ? "text-primary bg-primary/5" : "text-foreground/70 hover:text-foreground"
                    }`}>
                    {Icon && <Icon className="w-3.5 h-3.5 text-primary/50 shrink-0" />}
                    {link.label}
                  </Link>
                );
              })}

              {/* Other */}
              <div className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-[0.14em] px-3 mt-4 mb-2">More</div>
              <Link to="/partners" onClick={() => setOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-[13px] font-medium text-foreground/70 hover:text-foreground transition-colors">
                Pricing
              </Link>
              <Link to="/dashboard" onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-[13px] font-medium text-foreground/70 hover:text-foreground transition-colors">
                <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
              </Link>

              <div className="pt-4 pb-2">
                <Link to="/card" onClick={() => setOpen(false)}
                  className="block rounded-[12px] bg-[var(--dp-navy,#0B1F33)] px-5 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-[rgba(11,31,51,0.9)]">
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
