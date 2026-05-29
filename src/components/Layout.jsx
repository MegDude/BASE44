import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import HomeFooter from "./HomeFooter";

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
    pathname === "/map" ||
    pathname === "/explore" ||
    pathname === "/downtown-perks/explore" ||
    pathname === "/residents/map" ||
    pathname === "/residents/discover" ||
    pathname === "/residents/perks" ||
    pathname === "/partners/map" ||
    pathname === "/downtown-perks/events";

  const showBackButton = pathname !== "/";

  function getBackFallbackPath() {
    const params = new URLSearchParams(search);
    const mode = params.get("mode");
    const filter = params.get("filter");

    if (pathname === "/map" || pathname === "/explore" || pathname === "/residents/map" || pathname === "/residents/discover") {
      if (mode === "partner") {
        if (filter === "Properties") return "/partners/properties";
        if (filter === "Hotels") return "/partners/hotels";
        if (filter === "Brands") return "/partners/brands";
        if (filter === "Venues") return "/partners/venues";
        if (filter === "Happy Hours") return "/partners/happy-hours";
        if (filter === "Events") return "/partners/campaigns";
        return "/partners";
      }
      return "/residents";
    }

    if (pathname.startsWith("/partners/")) return "/partners";
    if (pathname.startsWith("/partner-workspace")) return "/partners/dashboard";
    if (pathname.startsWith("/buildings/") || pathname.startsWith("/properties/") || pathname.startsWith("/building-intelligence/")) {
      return "/partners/properties";
    }
    if (pathname.startsWith("/residents/")) return "/residents";
    if (pathname.startsWith("/brands/")) return "/brands";
    if (pathname.startsWith("/downtown-perks/")) return "/downtown-perks";
    if (pathname === "/events") return "/residents";
    if (pathname === "/about" || pathname === "/card" || pathname === "/perks") return "/residents";

    return "/";
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
    <div className="min-h-screen bg-background font-body">
      <ScrollToTop />
      <InteractionFeedback />
      <Navbar />
      {showBackButton && (
        <button
          type="button"
          onClick={goBack}
          className="dp-layout-back fixed left-3 top-[78px] z-[720] inline-flex h-6 items-center gap-1.5 bg-transparent px-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#0B1F33]/58 shadow-none transition-all hover:-translate-y-px hover:text-[#0B1F33] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F]"
          aria-label="Go back"
        >
          <ArrowLeft className="h-3 w-3 text-[#B38F4F]" />
          Back
        </button>
      )}
      <main>
        <Outlet />
      </main>
      {!noFooter && (usesEditorialFooter ? <Footer /> : <HomeFooter />)}
    </div>
  );
}
