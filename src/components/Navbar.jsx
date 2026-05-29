import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, ChevronUp, MapPin, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const RESIDENT_LINKS = [
  { to: "/residents", label: "Resident home", description: "Discovery, perks, events, and local life" },
  { to: "/residents/map", label: "Live map", description: "Open the resident map layer" },
  { to: "/residents/discover", label: "Discover", description: "Find places nearby" },
  { to: "/residents/events", label: "Events", description: "See what is happening downtown" },
  { to: "/residents/perks", label: "Perks", description: "Open the resident pass" },
  { to: "/residents/card", label: "Perks card", description: "Show or manage your card" },
  { to: "/residents/ask", label: "Ask the map", description: "Search by intent or need" },
  { to: "/residents/about", label: "About", description: "How Downtown Perks works" },
];

const PARTNER_LINKS = [
  { to: "/partners", label: "Partner home", description: "Overview for properties, hotels, venues, brands, and civic teams" },
  { to: "/partners/properties", label: "Properties", description: "Residential visibility and building engagement" },
  { to: "/partners/hospitality", label: "Hotels", description: "Guest and resident activation" },
  { to: "/partners/venues", label: "Venues", description: "Local discovery, events, and redemptions" },
  { to: "/partners/brands", label: "Brands", description: "Campaigns and neighborhood placement" },
  { to: "/partners/civic", label: "Civic", description: "District participation and event intelligence" },
  { to: "/partners/dashboard", label: "Dashboard", description: "Operational district intelligence" },
  { to: "/partners/workspace/overview", label: "Workspace", description: "Partner reports, campaigns, and activity" },
  { to: "/partners/map", label: "Partner map", description: "Open the partner intelligence map" },
  { to: "/partners/pricing", label: "Pricing", description: "Partner plans by category" },
];

const HAMBURGER_RESIDENT_LINKS = [
  { to: "/residents/map", label: "Map" },
  { to: "/residents/events", label: "Events" },
  { to: "/residents/card", label: "Perks Card" },
];

const HAMBURGER_PARTNER_LINKS = [
  { to: "/partners/pricing", label: "Pricing" },
  { to: "/partners#contact", label: "Contact" },
];

function NavLinkItem({ link, className, onClick, children }) {
  const isHashLink = link.to.includes("#");

  if (isHashLink) {
    return (
      <a href={link.to} onClick={onClick} className={className}>
        {children || link.label}
      </a>
    );
  }

  return (
    <Link to={link.to} onClick={onClick} className={className}>
      {children || link.label}
    </Link>
  );
}

function DropdownGroup({ id, label, links, openMenu, setOpenMenu, isActiveGroup }) {
  const isOpen = openMenu === id;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpenMenu(isOpen ? null : id)}
        aria-expanded={isOpen}
        aria-controls={`${id}-navigation`}
        className={`relative inline-flex h-9 items-center gap-1.5 px-1 text-[12px] font-semibold uppercase tracking-[0.14em] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F] ${
          isActiveGroup
            ? "text-[#0B1F33] after:absolute after:bottom-0 after:left-1 after:h-px after:w-[calc(100%-0.5rem)] after:bg-[#B38F4F]"
            : "text-[#0B1F33]/56 hover:text-[#0B1F33]"
        }`}
      >
        {label}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id={`${id}-navigation`}
            initial={{ opacity: 0, y: 6, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.99 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-0 top-11 w-[340px] overflow-hidden rounded-md border border-[#0B1F33]/8 bg-[#FAFAFC] p-2 shadow-[0_18px_58px_rgba(11,31,51,0.13)]"
          >
            <div className="px-2 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#B38F4F]">
              {label} paths
            </div>
            <div className="grid max-h-[min(62vh,460px)] gap-1 overflow-y-auto pr-1">
              {links.map((link) => (
                <NavLinkItem
                  key={link.to}
                  link={link}
                  onClick={() => setOpenMenu(null)}
                  className="group rounded-md px-3 py-2.5 text-left transition-all hover:-translate-y-0.5 hover:bg-[#F7F8FB] hover:shadow-[0_12px_40px_rgba(11,31,51,0.05)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F]"
                >
                  <span className="block text-[13px] font-semibold text-[#0B1F33]">{link.label}</span>
                  <span className="mt-0.5 block text-[11px] leading-4 text-[#B38F4F]/80">{link.description}</span>
                </NavLinkItem>
              ))}
              <button
                type="button"
                onClick={() => setOpenMenu(null)}
                className="mt-1 inline-flex items-center justify-center gap-1.5 rounded-md bg-[#F7F8FB] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#425466] shadow-[0_12px_40px_rgba(11,31,51,0.04)] transition hover:-translate-y-0.5 hover:text-[#0B1F33] hover:shadow-[0_12px_40px_rgba(11,31,51,0.05)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F]"
              >
                <ChevronUp className="h-3.5 w-3.5" />
                Roll up
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [mobileAudience, setMobileAudience] = useState("residents");
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setOpenMenu(null);
    setMobileAudience(location.pathname.startsWith("/partners") || location.search.includes("mode=partner") ? "partners" : "residents");
  }, [location.pathname, location.search, location.hash]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        setOpenMenu(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!openMenu) return undefined;

    const onPointerDown = (event) => {
      if (!event.target.closest("[data-dp-nav-root]")) {
        setOpenMenu(null);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [openMenu]);

  useEffect(() => {
    document.documentElement.toggleAttribute("data-dp-nav-open", open);
    return () => document.documentElement.removeAttribute("data-dp-nav-open");
  }, [open]);

  const isActive = (to) => {
    if (!to) return false;
    if (to === "/partners/dashboard") return location.pathname === "/partners/dashboard";
    if (to === "/residents/card") return location.pathname === "/card" || location.pathname === "/residents/card";
    return location.pathname === to;
  };

  const residentActive =
    location.pathname === "/" ||
    location.pathname.startsWith("/residents") ||
    location.pathname === "/explore" ||
    location.pathname === "/events" ||
    location.pathname === "/card" ||
    location.pathname === "/ask-map" ||
    location.pathname === "/about" ||
    (location.pathname === "/map" && !location.search.includes("mode=partner"));

  const partnerActive =
    location.pathname.startsWith("/partners") ||
    location.pathname.startsWith("/partner-workspace") ||
    location.pathname.startsWith("/brands") ||
    location.pathname === "/reports" ||
    location.pathname === "/dashboard/partner" ||
    location.pathname === "/partner-dashboard" ||
    (location.pathname === "/map" && location.search.includes("mode=partner"));

  return (
    <nav
      data-dp-nav-root
      className={`fixed left-0 right-0 top-0 z-[1200] pointer-events-auto isolate transition-all duration-300 backdrop-blur-[16px] ${
        scrolled
          ? "bg-[#FAFAFC]/96 text-[#0B1F33] shadow-[0_12px_40px_rgba(11,31,51,0.08)]"
          : "bg-[#FAFAFC]/92 text-[#0B1F33] shadow-[0_10px_34px_rgba(11,31,51,0.06)]"
      }`}
    >
      <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-5">
        <Link to="/" className="group flex shrink-0 items-center gap-2.5" aria-label="Downtown Perks home">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white/68 text-[#B38F4F] shadow-[0_8px_24px_rgba(11,31,51,0.05)]">
            <MapPin className="h-3.5 w-3.5" />
          </div>
          <span className="font-heading text-[15px] font-medium tracking-normal text-[#0B1F33]">
            Downtown Perks
          </span>
        </Link>

        {!open && (
          <div className="hidden items-center gap-1 transition-all duration-200 md:flex">
            <DropdownGroup
              id="residents"
              label="Residents"
              links={RESIDENT_LINKS}
              openMenu={openMenu}
              setOpenMenu={setOpenMenu}
              isActiveGroup={residentActive}
            />
            <DropdownGroup
              id="partners"
              label="Partners"
              links={PARTNER_LINKS}
              openMenu={openMenu}
              setOpenMenu={setOpenMenu}
              isActiveGroup={partnerActive}
            />
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-white/68 text-[#0B1F33] shadow-[0_10px_30px_rgba(11,31,51,0.05)] transition-all hover:-translate-y-px hover:bg-white hover:text-[#B38F4F] hover:shadow-[0_12px_40px_rgba(11,31,51,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F]"
          >
            {open ? <X className="h-[18px] w-[18px]" /> : <Menu className="h-[18px] w-[18px]" />}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {open && (
          <motion.div
            data-dp-nav-menu
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="fixed left-0 right-0 top-[68px] z-[1400] pointer-events-auto border-t border-[#0B1F33]/8 shadow-[0_24px_80px_rgba(11,31,51,0.12),inset_0_1px_0_rgba(255,255,255,0.86)]"
            style={{
              backgroundColor: "rgba(250, 250, 252, 0.94)",
              backdropFilter: "blur(18px) saturate(1.08)",
              WebkitBackdropFilter: "blur(18px) saturate(1.08)",
            }}
          >
            <div className="mx-auto max-h-[calc(100vh-68px)] max-w-4xl overflow-y-auto px-5 py-5 text-[#0B1F33]">
              <div className="flex items-center justify-between gap-4">
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#425466]">
                  Navigation
                </div>
                <div className="flex shrink-0 items-center gap-5" role="tablist" aria-label="Navigation audience">
                  {[
                    ["residents", "Residents"],
                    ["partners", "Partners"],
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      role="tab"
                      aria-selected={mobileAudience === value}
                      onClick={() => setMobileAudience(value)}
                      className={`relative h-8 px-0 text-[11px] font-semibold uppercase tracking-[0.14em] transition focus-visible:outline-none ${
                        mobileAudience === value
                          ? "text-[#0B1F33] after:absolute after:bottom-1 after:left-0 after:h-px after:w-full after:bg-[#B38F4F]"
                          : "text-[#425466] hover:text-[#0B1F33]"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5 h-px bg-[linear-gradient(90deg,rgba(11,31,51,0.04),rgba(11,31,51,0.07),rgba(11,31,51,0.03))]" />

	              <div className="pt-5">
	                <NavSection
	                  links={mobileAudience === "residents" ? HAMBURGER_RESIDENT_LINKS : HAMBURGER_PARTNER_LINKS}
	                  close={() => setOpen(false)}
	                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </nav>
  );
}

function NavSection({ links, close }) {
  return (
    <div>
      <div className="grid gap-1">
        {links.map((link) => (
          <NavLinkItem
            key={link.to}
            link={link}
            onClick={close}
            className="group flex items-center justify-between px-0 py-2 text-[15px] font-medium text-[#0B1F33] transition-all hover:translate-x-0.5 hover:text-[#0B1F33] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F]"
          >
            <span>{link.label}</span>
            <span className="text-[#B38F4F]/70 transition group-hover:translate-x-0.5 group-hover:text-[#B38F4F]">→</span>
          </NavLinkItem>
        ))}
      </div>
    </div>
  );
}
