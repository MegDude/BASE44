import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronLeft, MapPin, Menu, X } from "lucide-react";
import { ROUTES } from "@/lib/routes";

const TOP_LINKS = [
  { label: "Residents", to: ROUTES.residents },
  { label: "Map", to: ROUTES.explore },
  { label: "Events", to: ROUTES.events },
  { label: "Perks Card", to: ROUTES.card },
  { label: "About", to: ROUTES.about },
];

const PARTNER_TYPE_LINKS = [
  { label: "Overview", to: ROUTES.partners },
  { label: "Properties", to: ROUTES.partnerProperties },
  { label: "Hotels", to: ROUTES.partnerHospitality },
  { label: "Venues", to: ROUTES.partnerVenues },
  { label: "Brands", to: ROUTES.partnerBrands },
  { label: "Civic", to: ROUTES.partnerCivic },
  { label: "Dashboard", to: ROUTES.partnerDashboard },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [partnersOpen, setPartnersOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    setOpen(false);
    setPartnersOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setPartnersOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const isActive = (to) => {
    if (!to) return false;
    if (to === ROUTES.residents) return location.pathname === ROUTES.residents || location.pathname.startsWith("/resident-app");
    if (to === ROUTES.events) return location.pathname.startsWith("/downtown-perks/events") || location.pathname === "/events";
    if (to === ROUTES.explore) return location.pathname.startsWith("/downtown-perks/explore") || ["/map", "/explore", ROUTES.residentApp].includes(location.pathname);
    if (to === ROUTES.about) return location.pathname === ROUTES.about || location.pathname === "/downtown-perks/about";
    return location.pathname === to;
  };

  const showBackButton = location.pathname !== "/";
  const isPartnersActive =
    location.pathname.startsWith("/partners") || PARTNER_TYPE_LINKS.some((link) => location.pathname === link.to);

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/");
  };

  return (
    <nav
      ref={dropdownRef}
      className="fixed left-0 right-0 top-0 z-50 border-b border-[rgba(15,23,42,0.08)] bg-[rgba(248,250,252,0.82)] backdrop-blur-dp"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          {showBackButton ? (
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-[rgba(15,23,42,0.08)] bg-[rgba(255,255,255,0.72)] px-3 text-[13px] font-medium text-[var(--dp-navy)] shadow-[0_8px_18px_rgba(15,23,42,0.06)] backdrop-blur-dp transition hover:bg-white"
              aria-label="Go back"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </button>
          ) : null}

          <Link to="/" className="flex items-center gap-3" aria-label="Downtown Perks home">
            <div className="flex h-10 w-10 items-center justify-center rounded-[14px] border border-[rgba(15,23,42,0.08)] bg-[rgba(255,255,255,0.55)] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-dp">
              <MapPin className="h-4 w-4 text-[var(--dp-gold)]" />
            </div>
            <div className="leading-none">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[rgba(11,31,51,0.52)]">
                Downtown
              </div>
              <div className="font-display text-[28px] font-semibold leading-none tracking-[-0.045em] text-[var(--dp-navy)]">
                Perks
              </div>
            </div>
          </Link>
        </div>

        <div className="hidden items-center gap-1 md:flex">
          {TOP_LINKS.map((link) => {
            if (link.href) {
              return (
                <a
                  key={link.label}
                  href={link.href}
                  className="rounded-full px-3 py-2 text-[13px] font-medium text-[rgba(11,31,51,0.62)] transition-colors hover:bg-white/70 hover:text-[var(--dp-navy)]"
                >
                  {link.label}
                </a>
              );
            }

            return (
              <Link
                key={link.to}
                to={link.to}
                className={`rounded-full px-3 py-2 text-[13px] font-medium transition-colors ${
                  isActive(link.to)
                    ? "bg-white/70 text-[var(--dp-navy)]"
                    : "text-[rgba(11,31,51,0.62)] hover:bg-white/70 hover:text-[var(--dp-navy)]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="relative">
            <button
              type="button"
              onClick={() => setPartnersOpen((current) => !current)}
              className={`inline-flex items-center gap-1 rounded-full px-3 py-2 text-[13px] font-medium transition-colors ${
                isPartnersActive
                  ? "bg-white/70 text-[var(--dp-navy)]"
                  : "text-[rgba(11,31,51,0.62)] hover:bg-white/70 hover:text-[var(--dp-navy)]"
              }`}
              aria-expanded={partnersOpen}
              aria-haspopup="menu"
            >
              Partners
              <ChevronDown className={`h-4 w-4 transition-transform ${partnersOpen ? "rotate-180" : ""}`} />
            </button>

            {partnersOpen ? (
              <div className="absolute right-0 top-[calc(100%+10px)] z-30 w-56 rounded-[18px] border border-[rgba(15,23,42,0.08)] bg-[rgba(255,255,255,0.94)] p-2 shadow-[0_18px_40px_rgba(15,23,42,0.12)] backdrop-blur-dp">
                {PARTNER_TYPE_LINKS.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`block rounded-[14px] px-3 py-2.5 text-[13px] font-medium transition-colors ${
                      location.pathname === link.to
                        ? "bg-[rgba(11,31,51,0.06)] text-[var(--dp-navy)]"
                        : "text-[rgba(11,31,51,0.68)] hover:bg-[rgba(11,31,51,0.04)] hover:text-[var(--dp-navy)]"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
          <Link
            to={ROUTES.explore}
            className="ml-2 inline-flex min-h-10 items-center rounded-full bg-[var(--dp-navy)] px-4 text-[13px] font-semibold text-white transition hover:opacity-92"
          >
            Open Map
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="dp-control h-10 w-10 md:hidden"
          aria-label={open ? "Close navigation" : "Open navigation"}
        >
          {open ? <X className="h-4 w-4 text-[var(--dp-navy)]" /> : <Menu className="h-4 w-4 text-[var(--dp-navy)]" />}
        </button>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="border-t border-[rgba(15,23,42,0.08)] bg-[rgba(248,250,252,0.92)] px-4 py-4 backdrop-blur-dp md:hidden"
          >
            <div className="space-y-1">
              <div className="rounded-[18px] border border-[rgba(15,23,42,0.08)] bg-white/55 p-2">
                <div className="px-3 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[rgba(11,31,51,0.44)]">
                  Partners
                </div>
                {PARTNER_TYPE_LINKS.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setOpen(false)}
                    className="block rounded-[14px] px-3 py-2.5 text-[14px] font-medium text-[var(--dp-navy)] transition-colors hover:bg-white/80"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              {TOP_LINKS.map((link) =>
                link.href ? (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-[16px] px-3 py-2.5 text-[14px] font-medium text-[var(--dp-navy)] transition-colors hover:bg-white/80"
                  >
                    {link.label}
                  </a>
                ) : (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setOpen(false)}
                      className="block rounded-[16px] px-3 py-2.5 text-[14px] font-medium text-[var(--dp-navy)] transition-colors hover:bg-white/80"
                    >
                    {link.label}
                  </Link>
                )
              )}
              {showBackButton ? (
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    handleBack();
                  }}
                  className="block w-full rounded-[16px] px-3 py-2.5 text-left text-[14px] font-medium text-[var(--dp-navy)] transition-colors hover:bg-white/80"
                >
                  Back
                </button>
              ) : null}
              <Link
                to={ROUTES.explore}
                onClick={() => setOpen(false)}
                className="mt-2 block rounded-[16px] bg-[var(--dp-navy)] px-3 py-2.5 text-[14px] font-semibold text-white"
              >
                Open Map
              </Link>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </nav>
  );
}
