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

  const usesEditorialFooter =
    pathname.startsWith("/brands") ||
    pathname.startsWith("/partners") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/partner-workspace") ||
    pathname.startsWith("/admin") ||
    ["/", "/map", "/explore", "/events", "/perks", "/card", "/about", "/build-pack", "/implementation-spec", "/residents"].includes(pathname);

  const noFooter =
    pathname === "/map" ||
    pathname === "/explore" ||
    pathname.startsWith("/resident-app") ||
    pathname === "/events";

  return (
    <div className="min-h-screen bg-[var(--dp-bg)] font-body text-[var(--dp-text)]">
      <ScrollToTop />
      <Navbar />
      <main>
        <Outlet />
      </main>
      {!noFooter && (usesEditorialFooter ? <Footer /> : <HomeFooter />)}
    </div>
  );
}
