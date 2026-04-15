import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, MapPin, ChevronDown, Building2, Hotel, MapIcon, Users, Star, Landmark, Home, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const RESIDENT_LINKS = [
  { to: "/downtown-perks/explore", label: "Live Map", desc: "Browse places, events & perks" },
  { to: "/downtown-perks/events", label: "Events", desc: "What's happening downtown" },
  { to: "/downtown-perks/perks", label: "Perks", desc: "Member offers & benefits" },
  { to: "/downtown-perks/card", label: "Perks Card", desc: "Your resident credential" },
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
    if (which === "residents") return location.pathname.startsWith("/downtown-perks");
    if (which === "partners") return location.pathname.startsWith("/partners") || location.pathname.startsWith("/brands");
    return false;
  };

  return (
    <nav ref={dropdownRef} className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled
        ? "bg-white/95 backdrop-blur-lg border-b border-border/40 shadow-sm shadow-black/5"
        : "bg-white/90 backdrop-blur-sm border-b border-border/20"
    }`}>
      <div className="max-w-7xl mx-auto px-6 h-[68px] flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-7 h-7 rounded-full border border-primary/40 flex items-center justify-center">
            <MapPin className="w-3.5 h-3.5 text-primary" />
          </div>
          <span className="font-heading font-medium text-[15px] tracking-tight text-foreground">
            Downtown<span className="text-primary"> Perks</span>
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
                      active || dropdown === link.dropdown ? "text-primary" : "text-foreground/60 hover:text-foreground"
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
                        className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[320px] bg-white rounded-2xl border border-border/40 shadow-lg shadow-black/8 overflow-hidden"
                      >
                        <div className="p-2">
                          {(link.dropdown === "residents" ? RESIDENT_LINKS : PARTNER_LINKS).map((item) => {
                            const Icon = item.icon;
                            return (
                              <Link
                                key={item.to}
                                to={item.to}
                                className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[hsl(218,30%,97%)] transition-colors group"
                              >
                                {Icon ? (
                                  <div className="w-8 h-8 rounded-lg bg-primary/8 border border-primary/12 flex items-center justify-center shrink-0">
                                    <Icon className="w-3.5 h-3.5 text-primary/70" />
                                  </div>
                                ) : (
                                  <div className="w-8 h-8 rounded-lg bg-muted/60 border border-border/40 flex items-center justify-center shrink-0">
                                    <MapPin className="w-3.5 h-3.5 text-muted-foreground/60" />
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
                className={`px-4 py-2 text-[13px] font-medium tracking-wide transition-colors duration-200 ${
                  isActive(link.to) ? "text-primary" : "text-foreground/60 hover:text-foreground"
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
            className="flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium text-foreground/60 hover:text-foreground transition-colors"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Dashboard
          </Link>
          <Link
            to="/downtown-perks/card"
            className="px-5 py-2 rounded-full bg-primary text-primary-foreground text-[13px] font-medium hover:bg-primary/90 transition-all duration-300 shadow-sm shadow-primary/20"
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
            className="md:hidden absolute top-[68px] left-0 right-0 bg-white border-b border-border/40 shadow-sm max-h-[80vh] overflow-y-auto"
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
              <Link to="/downtown-perks/for-buildings" onClick={() => setOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-[13px] font-medium text-foreground/70 hover:text-foreground transition-colors">
                Pricing
              </Link>
              <Link to="/dashboard" onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-[13px] font-medium text-foreground/70 hover:text-foreground transition-colors">
                <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
              </Link>

              <div className="pt-4 pb-2">
                <Link to="/downtown-perks/card" onClick={() => setOpen(false)}
                  className="block px-5 py-3 rounded-full bg-primary text-primary-foreground text-sm font-medium text-center hover:bg-primary/90 transition-all">
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
