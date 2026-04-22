import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import HomeFooter from "./HomeFooter";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

export default function Layout() {
  const { pathname } = useLocation();

  // Pages that use the full Downtown Perks editorial footer
  const usesEditorialFooter =
    pathname.startsWith("/downtown-perks") ||
    pathname.startsWith("/brands") ||
    pathname.startsWith("/partners") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/partner-workspace") ||
    pathname.startsWith("/residents") ||
    ["/", "/map", "/explore", "/events", "/perks", "/card", "/about"].includes(pathname);

  // Pages that suppress the footer entirely (full-screen map/app views)
  const noFooter =
    pathname === "/downtown-perks/explore" ||
    pathname === "/downtown-perks/events" ||
    pathname.startsWith("/resident-dashboard") ||
    pathname.startsWith("/resident-app") ||
    pathname === "/map" ||
    pathname === "/explore" ||
    pathname === "/events";

  return (
    <div className="min-h-screen bg-background font-body">
      <ScrollToTop />
      <Navbar />
      <main>
        <Outlet />
      </main>
      {!noFooter && (usesEditorialFooter ? <Footer /> : <HomeFooter />)}
    </div>
  );
}
