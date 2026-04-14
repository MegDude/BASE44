import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { to: "/downtown-perks/explore", label: "Map" },
  { to: "/downtown-perks/events", label: "Events" },
  { to: "/downtown-perks/card", label: "Perks Card" },
  { to: "/brands", label: "Partners" },
  { to: "/downtown-perks/for-buildings", label: "Pricing" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (link) =>
    location.pathname === link.to ||
    (link.to === "/brands" && location.pathname.startsWith("/brands"));

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "bg-background/95 backdrop-blur-md border-b border-border/60" : "bg-transparent"}`}>
      <div className="max-w-7xl mx-auto px-6 h-[68px] flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-full border border-primary/40 flex items-center justify-center">
            <MapPin className="w-3.5 h-3.5 text-primary" />
          </div>
          <span className="font-heading font-medium text-[15px] tracking-tight text-foreground">
            Downtown<span className="text-primary"> Perks</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-0.5">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-4 py-2 text-[13px] font-medium tracking-wide transition-colors duration-200 ${
                isActive(link)
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/downtown-perks/card"
            className="px-5 py-2 rounded-full border border-primary/50 text-primary text-[13px] font-medium hover:bg-primary hover:text-primary-foreground transition-all duration-300"
          >
            Get Your Card
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button onClick={() => setOpen(!open)} className="md:hidden text-muted-foreground hover:text-foreground p-2 transition-colors">
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
            className="md:hidden absolute top-[68px] left-0 right-0 bg-background/98 backdrop-blur-xl border-b border-border"
          >
            <div className="px-6 py-6 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className={`block px-3 py-3 text-sm font-medium transition-colors ${
                    isActive(link) ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4">
                <Link
                  to="/downtown-perks/card"
                  onClick={() => setOpen(false)}
                  className="block px-5 py-3 rounded-full border border-primary/50 text-primary text-sm font-medium text-center hover:bg-primary hover:text-primary-foreground transition-all"
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