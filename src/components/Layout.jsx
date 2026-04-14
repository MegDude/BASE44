import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import HomeFooter from "./HomeFooter";

export default function Layout() {
  const location = useLocation();
  const isDowntownPerks = location.pathname.startsWith("/downtown-perks") || location.pathname.startsWith("/brands");

  return (
    <div className="min-h-screen bg-background font-body">
      <Navbar />
      <main>
        <Outlet />
      </main>
      {isDowntownPerks ? <Footer /> : <HomeFooter />}
    </div>
  );
}