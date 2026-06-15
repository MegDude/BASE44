import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp, MapPin, Menu, Search, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import QuickSearchModal from "@/components/navigation/QuickSearchModal";

const RESIDENT_LINKS = [
  { to: "/map?mode=resident&tab=map", label: "Resident Map", description: "Open the live resident map" },
  { to: "/map?mode=resident&tab=map&filter=Events", label: "Events", description: "See downtown events on the map" },
  { to: "/map?mode=resident&tab=map&filter=Perks", label: "Perks", description: "Find resident perks nearby" },
  { to: "/map?mode=resident&tab=pass", label: "Perks Card", description: "Open the resident card view" },
];

const PARTNER_LINKS = [
  { to: "/map?mode=partner&tab=map&filter=All", label: "Partner Map", description: "Open the partner map layer" },
  { to: "/partners/dashboard", label: "Dashboard", description: "Operational district intelligence" },
  { to: "/partners/campaigns", label: "Campaigns", description: "Open Downtown Campaign Builder" },
  { to: "/partner-workspace/overview", label: "Workspace", description: "Partner reports, campaigns, and activity" },
  { to: "/partner-workspace/reports", label: "Reports", description: "Open connected reporting" },
  { to: "/marketing/pricing", label: "Pricing", description: "Partner plans by category" },
];

const HAMBURGER_RESIDENT_LINKS = [
  { to: "/map?mode=resident&tab=map", label: "Resident Map" },
  { to: "/map?mode=resident&tab=map&filter=Events", label: "Events" },
  { to: "/map?mode=resident&tab=map&filter=Perks", label: "Perks" },
  { to: "/map?mode=resident&tab=pass", label: "Perks Card" },
];

const HAMBURGER_PARTNER_LINKS = [
  { to: "/map?mode=partner&tab=map&filter=All", label: "Partner Map" },
  { to: "/partners/dashboard", label: "Dashboard" },
  { to: "/partners/campaigns", label: "Campaigns" },
  { to: "/partner-workspace/overview", label: "Workspace" },
  { to: "/partner-workspace/reports", label: "Reports" },
  { to: "/marketing/pricing", label: "Pricing" },
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
        className={`relative inline-flex h-9 items-center gap-1.5 px-1 text-[12px] font-semibold uppercase tracking-[0.14em] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96A] ${
          isActiveGroup
            ? "text-[#0B1F33] after:absolute after:bottom-0 after:left-1 after:h-px after:w-[calc(100%-0.5rem)] after:bg-[#C8A96A]"
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
            className="absolute left-0 top-11 w-[340px] overflow-hidden rounded-md border border-[#0B1F33]/8 bg-white p-2 shadow-[0_18px_58px_rgba(11,31,51,0.13)]"
          >
            <div className="flex items-center justify-between gap-3 px-2 pb-2 pt-1">
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#C8A96A]">
                {label} paths
              </div>
              <button
                type="button"
                onClick={() => setOpenMenu(null)}
                className="inline-flex h-7 w-7 items-center justify-center rounded-[2px] border border-[#0B1F33]/8 bg-white text-[#0B1F33]/58 transition hover:text-[#0B1F33] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96A]"
                aria-label={`Close ${label} navigation`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="grid max-h-[min(62vh,460px)] gap-1 overflow-y-auto pr-1">
              {links.map((link) => (
                <NavLinkItem
                  key={link.to}
                  link={link}
                  onClick={() => setOpenMenu(null)}
                  className="group rounded-md px-3 py-2.5 text-left transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_12px_40px_rgba(11,31,51,0.05)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96A]"
                >
                  <span className="block text-[13px] font-semibold text-[#0B1F33]">{link.label}</span>
                  <span className="mt-0.5 block text-[11px] leading-4 text-[#C8A96A]/80">{link.description}</span>
                </NavLinkItem>
              ))}
              <button
                type="button"
                onClick={() => setOpenMenu(null)}
                className="mt-1 inline-flex items-center justify-center gap-1.5 rounded-md bg-white px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#425466] shadow-[0_12px_40px_rgba(11,31,51,0.04)] transition hover:-translate-y-0.5 hover:text-[#0B1F33] hover:shadow-[0_12px_40px_rgba(11,31,51,0.05)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96A]"
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
  const [quickSearchOpen, setQuickSearchOpen] = useState(false);
  const [mobileAudience, setMobileAudience] = useState("residents");
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

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
        setQuickSearchOpen(false);
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
    if (to.startsWith("/map?")) return `${location.pathname}${location.search}` === to;
    if (to === "/partners/dashboard") return location.pathname === "/partners/dashboard";
    return location.pathname === to;
  };

  const residentActive =
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

  const residentMapActive = location.pathname === "/map" && !location.search.includes("mode=partner");
  const partnerMapActive = location.pathname === "/map" && location.search.includes("mode=partner");

  function openQuickSearch() {
    setOpen(false);
    setOpenMenu(null);
    setQuickSearchOpen(true);
  }

  function handleQuickSearchSelect(result) {
    navigate(result.route || `/map?mode=resident&tab=map&entityId=${encodeURIComponent(result.id)}`);
  }

  return (
    <nav
      data-dp-nav-root
      className={`fixed left-0 right-0 top-0 z-[1200] pointer-events-auto isolate transition-all duration-300 backdrop-blur-[18px] ${
        scrolled
          ? "bg-white/97 text-[#0B1F33] shadow-[0_1px_0_rgba(11,31,51,0.06),0_4px_20px_rgba(11,31,51,0.07)]"
          : "bg-white/94 text-[#0B1F33] shadow-[0_1px_0_rgba(11,31,51,0.04),0_2px_12px_rgba(11,31,51,0.04)]"
      }`}
    >
      <div className="mx-auto flex h-[64px] max-w-7xl items-center justify-between px-5 md:px-6">
        <Link to="/map?mode=resident&tab=map" className="group flex shrink-0 items-center gap-2" aria-label="Downtown Perks home">
          <MapPin className="h-[15px] w-[15px] shrink-0 text-[#C8A96A] transition-colors duration-150 group-hover:text-[#B38F4F]" />
          <span className="text-[14.5px] font-semibold tracking-[-0.015em] text-[#0B1F33]">
            Downtown Perks
          </span>
        </Link>

        {!open && (
          <div className="hidden items-center gap-4 transition-all duration-200 md:flex">
            <Link
              to="/map?mode=resident&tab=map"
              className={`relative inline-flex h-9 items-center px-0 text-[12px] font-semibold uppercase tracking-[0.12em] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96A] ${
                residentMapActive
                  ? "text-[#0B1F33] after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:bg-[#C8A96A]"
                  : "text-[#0B1F33]/56 hover:text-[#0B1F33]"
              }`}
            >
              Resident Map
            </Link>
            <Link
              to="/map?mode=partner&tab=map&filter=All"
              className={`relative inline-flex h-9 items-center px-0 text-[12px] font-semibold uppercase tracking-[0.12em] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96A] ${
                partnerMapActive
                  ? "text-[#0B1F33] after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:bg-[#C8A96A]"
                  : "text-[#0B1F33]/56 hover:text-[#0B1F33]"
              }`}
            >
              Partner Map
            </Link>
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
            <button
              type="button"
              onClick={openQuickSearch}
              className="dp-global-search-trigger"
              aria-label="Search Downtown Perks"
            >
              <Search className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Search</span>
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openQuickSearch}
            className="dp-global-search-icon-button"
            aria-label="Search Downtown Perks"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-[6px] border border-[rgba(11,31,51,0.08)] bg-white/80 text-[#0B1F33] shadow-[0_1px_3px_rgba(11,31,51,0.05)] transition-all duration-150 hover:-translate-y-px hover:border-[#C8A96A]/40 hover:bg-white hover:text-[#C8A96A] hover:shadow-[0_2px_8px_rgba(11,31,51,0.07)] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96A]/50"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {open && (
          <motion.div
            data-dp-nav-menu
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="fixed left-0 right-0 top-[64px] z-[1400] pointer-events-auto border-b border-[rgba(11,31,51,0.06)] shadow-[0_16px_60px_rgba(11,31,51,0.09)]"
            style={{
              backgroundColor: "rgba(250, 250, 252, 0.96)",
              backdropFilter: "blur(24px) saturate(1.12)",
              WebkitBackdropFilter: "blur(24px) saturate(1.12)",
            }}
          >
            <div className="mx-auto max-h-[calc(100vh-64px)] max-w-4xl overflow-y-auto px-5 py-5 text-[#0B1F33]">
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
                      className={`relative h-7 border-0 bg-transparent px-0 text-[11px] font-semibold uppercase tracking-[0.14em] shadow-none outline-none transition focus-visible:outline-none focus-visible:ring-0 ${
                        mobileAudience === value
                          ? "text-[#0B1F33] after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:bg-[#C8A96A]"
                          : "text-[#425466] hover:text-[#0B1F33]"
                      }`}
                      style={{ border: 0, boxShadow: "none", background: "transparent" }}
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

      <QuickSearchModal
        isOpen={quickSearchOpen}
        onClose={() => setQuickSearchOpen(false)}
        onSelectResult={handleQuickSearchSelect}
      />
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
            className="group flex items-center justify-between px-0 py-2 text-[15px] font-medium text-[#0B1F33] transition-all hover:translate-x-0.5 hover:text-[#0B1F33] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96A]"
          >
            <span>{link.label}</span>
            <span className="text-[#C8A96A]/70 transition group-hover:translate-x-0.5 group-hover:text-[#C8A96A]">→</span>
          </NavLinkItem>
        ))}
      </div>
    </div>
  );
}
