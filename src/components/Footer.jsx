import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";

const FOOTER_LINKS = {
  Explore: [
    { to: "/explore", label: "Live Map" },
    { to: "/events", label: "Events" },
    { to: "/perks", label: "Perks" },
    { to: "/card", label: "Perks Card" },
    { to: "/about", label: "About" },
  ],
  Partners: [
    { to: "/partners/residential", label: "Residential" },
    { to: "/partners/hotels", label: "Hospitality" },
    { to: "/partners/venues", label: "Venues" },
    { to: "/partners/brands", label: "Brands" },
    { to: "/partners/civic", label: "Civic" },
  ],
  Platform: [
    { to: "/partners", label: "Partner Overview" },
    { to: "/partner-workspace", label: "Partner Workspace" },
    { to: "/dashboard", label: "Dashboard" },
    { to: "/partners", label: "Pricing" },
    { to: "/brands", label: "Brand Directory" },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">

          {/* Brand */}
          <div className="md:col-span-4">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-7 h-7 rounded-full border border-primary/40 flex items-center justify-center">
                <MapPin className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="font-heading font-medium text-[15px] text-foreground">
                Downtown<span className="text-primary"> Perks</span>
              </span>
            </div>
            <p className="text-muted-foreground text-[13px] leading-relaxed max-w-xs mb-6">
              A live neighborhood layer for downtown Austin — connecting residents, buildings, and local businesses through a shared map, a simple card, and real-time district intelligence.
            </p>
            <Link
              to="/card"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-[13px] font-medium hover:bg-primary/90 transition-all"
            >
              Get Your Card
            </Link>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([group, links]) => (
            <div key={group} className="md:col-span-2-and-half">
              <h4 className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.12em] mb-5">
                {group}
              </h4>
              <div className="space-y-3">
                {links.map((link) => (
                  <Link
                    key={link.to + link.label}
                    to={link.to}
                    className="block text-[13px] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 pt-8 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[12px] text-muted-foreground/70">
            © {new Date().getFullYear()} Downtown Perks · Austin, TX · 78701
          </p>
          <p className="text-[12px] text-muted-foreground/50 italic font-heading">
            Where downtown works like a system.
          </p>
        </div>
      </div>
    </footer>
  );
}