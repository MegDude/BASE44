import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, Search } from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import HomeFooter from "./HomeFooter";
import QuickSearchModal from "@/components/navigation/QuickSearchModal";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function InteractionFeedback() {
  useEffect(() => {
    const interactiveSelector = [
      "button:not(:disabled)",
      "a[href]",
      "[role='button']",
      "summary",
      "input[type='checkbox']",
      "input[type='radio']",
    ].join(",");

    function markInteraction(event) {
      const target = event.target instanceof Element ? event.target.closest(interactiveSelector) : null;
      if (!target || target.classList.contains("dp-action-activated")) return;
      target.classList.add("dp-action-activated");
      window.setTimeout(() => target.classList.remove("dp-action-activated"), 430);
    }

    function markKeyboardInteraction(event) {
      if (event.key === "Enter" || event.key === " ") markInteraction(event);
    }

    document.addEventListener("pointerdown", markInteraction, { passive: true });
    document.addEventListener("keydown", markKeyboardInteraction);

    return () => {
      document.removeEventListener("pointerdown", markInteraction);
      document.removeEventListener("keydown", markKeyboardInteraction);
    };
  }, []);

  return null;
}

export default function Layout() {
  const location = useLocation();
  const { pathname, search } = location;
  const navigate = useNavigate();
  const [quickSearchOpen, setQuickSearchOpen] = useState(false);
  const isEmbeddedMap = pathname === "/map" && new URLSearchParams(search).get("embed") === "true";
  const isResidentAccessRoute = pathname === "/card" || pathname === "/resident-sign-up";
  const isPublicPartnerRoute = pathname === "/partners" || pathname.startsWith("/partners/");

  useEffect(() => {
    function handleOpenQuickSearch() {
      setQuickSearchOpen(true);
    }

    window.addEventListener("dp-open-quick-search", handleOpenQuickSearch);
    return () => window.removeEventListener("dp-open-quick-search", handleOpenQuickSearch);
  }, []);

  const isProductRoute =
    pathname === "/app" ||
    pathname === "/app/map" ||
    pathname === "/resident/home" ||
    isResidentAccessRoute ||
    pathname === "/about" ||
    pathname === "/map" ||
    pathname === "/resident/home" ||
    pathname === "/partner-map" ||
    pathname.startsWith("/partner-workspace") ||
    pathname.startsWith("/partners") ||
    pathname.startsWith("/dashboard") ||
    pathname === "/reports" ||
    pathname === "/analytics";

  // Pages that use the full Downtown Perks editorial footer
  const usesEditorialFooter =
    pathname.startsWith("/downtown-perks") ||
    pathname.startsWith("/brands") ||
    pathname.startsWith("/partners") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/partner-workspace") ||
    pathname.startsWith("/ask-map") ||
    pathname.startsWith("/happy-hour-walking-map") ||
    pathname === "/explore" ||
    pathname === "/events" ||
    pathname === "/perks" ||
    pathname === "/card" ||
    pathname === "/about" ||
    pathname === "/";

  // Pages that suppress the footer entirely (full-screen map/app views)
  const noFooter =
    pathname === "/" ||
    isProductRoute ||
    pathname === "/app" ||
    pathname === "/app/map" ||
    pathname === "/map" ||
    isResidentAccessRoute ||
    pathname === "/explore" ||
    pathname === "/downtown-perks/explore" ||
    pathname === "/residents/map" ||
    pathname === "/residents/discover" ||
    pathname === "/residents/perks" ||
    pathname === "/partners/map" ||
    pathname === "/downtown-perks/events";

  const showBackButton =
    pathname !== "/" &&
    pathname !== "/app" &&
    pathname !== "/app/map" &&
    pathname !== "/map" &&
    pathname !== "/resident/home" &&
    pathname !== "/sign-in" &&
    !isEmbeddedMap &&
    !isResidentAccessRoute &&
    !isPublicPartnerRoute &&
    !pathname.startsWith("/partner-workspace");
  const showNavbar =
    pathname !== "/" &&
    pathname !== "/app" &&
    pathname !== "/app/map" &&
    pathname !== "/map" &&
    pathname !== "/resident/home" &&
    !isEmbeddedMap &&
    !isResidentAccessRoute;
  const showProductSearchButton = !isEmbeddedMap && !isResidentAccessRoute && !showNavbar && pathname !== "/" && pathname !== "/app" && pathname !== "/app/map" && pathname !== "/map" && pathname !== "/resident/home";

  function handleQuickSearchSelect(result) {
    if (typeof window !== "undefined") {
      window.sessionStorage?.setItem("dp-opening-story-seen", "true");
    }
    navigate(result.route || `/map?mode=resident&tab=map&entityId=${encodeURIComponent(result.id)}`);
  }

  function getBackFallbackPath() {
    const params = new URLSearchParams(search);
    const mode = params.get("mode");
    const filter = params.get("filter");

    if (pathname === "/app" || pathname === "/app/map" || pathname === "/map" || pathname === "/explore" || pathname === "/residents/map" || pathname === "/residents/discover" || pathname === "/partners/map") {
      if (mode === "partner" && filter === "Events") return "/partners/campaigns";
      if (mode === "partner" || pathname === "/partners/map") return "/partners";
      return "/resident/home";
    }

    if (pathname === "/resident/home") return "/map?mode=resident&tab=map&filter=All";
    if (pathname === "/pricing" || pathname === "/contact") return "/partners";
    if (pathname.startsWith("/ask-map")) return "/map?mode=resident&tab=map&filter=All";
    if (pathname.startsWith("/admin-studio")) return "/partner-workspace/overview";
    if (pathname.startsWith("/partners/")) return "/partners";
    if (pathname === "/partner-workspace/overview") return "/partners";
    if (pathname.startsWith("/partner-workspace")) return "/partner-workspace/overview";
    if (pathname.startsWith("/buildings/") || pathname.startsWith("/properties/") || pathname.startsWith("/building-intelligence/")) {
      return "/partners/properties";
    }
    if (pathname.startsWith("/residents/")) return "/residents";
    if (pathname.startsWith("/brands/")) return "/brands";
    if (pathname.startsWith("/downtown-perks/")) return "/downtown-perks";
    if (pathname === "/events") return "/residents";
    if (pathname === "/about" || pathname === "/card" || pathname === "/perks" || pathname === "/sign-in") return "/resident/home";

    return "/resident/home";
  }

  function goBack() {
    const routerHistoryIndex = window.history.state?.idx;
    if (Number.isInteger(routerHistoryIndex) && routerHistoryIndex > 0) {
      navigate(-1);
      return;
    }
    navigate(getBackFallbackPath());
  }

  return (
    <div className="min-h-screen bg-background font-body" data-platform-layout="downtown-perks">
      <ScrollToTop />
      <InteractionFeedback />
      {showNavbar && <Navbar />}
      {showProductSearchButton && (
        <button
          type="button"
          className="dp-product-shell-search-button"
          onClick={() => setQuickSearchOpen(true)}
          aria-label="Search Downtown Perks"
        >
          <Search className="h-4 w-4" aria-hidden="true" />
          <span>Search</span>
        </button>
      )}
      {showBackButton && (
        <div className={`dp-layout-back-row${showNavbar ? "" : " is-product"}`}>
          <button
            type="button"
            onClick={goBack}
            className="dp-layout-back"
            aria-label="Go back"
          >
            <ArrowLeft aria-hidden="true" />
            Back
          </button>
        </div>
      )}
      <div className="dp-route-outlet">
        <Outlet />
      </div>
      {!noFooter && (usesEditorialFooter ? <Footer /> : <HomeFooter />)}
      <QuickSearchModal
        isOpen={quickSearchOpen}
        onClose={() => setQuickSearchOpen(false)}
        onSelectResult={handleQuickSearchSelect}
      />
    </div>
  );
}
