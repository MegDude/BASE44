import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";

export default function HomeFooter() {
  return (
    <footer className="border-t border-[hsl(218,20%,88%)] bg-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">

          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-full border border-primary/40 flex items-center justify-center">
                <MapPin className="w-3 h-3 text-primary" />
              </div>
              <span className="dp-brand-wordmark text-sm text-foreground">
                Downtown <span className="text-primary">Perks</span>
              </span>
            </div>
            <p className="text-[12px] text-foreground/50 leading-relaxed">
              Downtown Austin's live neighborhood layer.
            </p>
          </div>

          {/* Resident */}
          <div>
            <h4 className="text-[10px] font-semibold text-foreground/40 uppercase tracking-[0.14em] mb-3">Residents</h4>
            <div className="space-y-2">
              {[
                { to: "/downtown-perks/explore", label: "Explore Map" },
                { to: "/downtown-perks/events", label: "Events" },
                { to: "/downtown-perks/perks", label: "Perks" },
                { to: "/downtown-perks/card", label: "Get Your Card" },
              ].map(l => (
                <Link key={l.to} to={l.to} className="block text-[13px] text-foreground/60 hover:text-foreground transition-colors">{l.label}</Link>
              ))}
            </div>
          </div>

          {/* Partners */}
          <div>
            <h4 className="text-[10px] font-semibold text-foreground/40 uppercase tracking-[0.14em] mb-3">Partners</h4>
            <div className="space-y-2">
              {[
                { to: "/partners/properties", label: "Properties" },
                { to: "/partners/hotels", label: "Hospitality" },
                { to: "/partners/venues", label: "Venues" },
                { to: "/partners/brands", label: "Brands" },
                { to: "/partners/civic", label: "Civic" },
              ].map(l => (
                <Link key={l.to} to={l.to} className="block text-[13px] text-foreground/60 hover:text-foreground transition-colors">{l.label}</Link>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-[10px] font-semibold text-foreground/40 uppercase tracking-[0.14em] mb-3">Platform</h4>
            <div className="space-y-2">
              {[
                { to: "/partners", label: "Partner Overview" },
                { to: "/#start-here", label: "Start Here" },
                { to: "/partners/dashboard", label: "Dashboard" },
                { to: "/downtown-perks/about", label: "About" },
              ].map(l => (
                <Link key={l.to} to={l.to} className="block text-[13px] text-foreground/60 hover:text-foreground transition-colors">{l.label}</Link>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-[hsl(218,20%,90%)] flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-[12px] text-foreground/40">
            © {new Date().getFullYear()} Downtown Perks · Austin, TX
          </p>
          <p className="text-[12px] text-foreground/30">
            Where downtown works like a system.
          </p>
        </div>
      </div>
    </footer>
  );
}
