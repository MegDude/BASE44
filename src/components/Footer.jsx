import { Link } from "react-router-dom";
import { MapPin, Instagram, ArrowUpRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <MapPin className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-heading font-bold text-lg text-foreground">
                Downtown<span className="text-primary">Perks</span>
              </span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
              The real-time neighborhood system for downtown Austin. Connecting
              where you live to what you do — through a live map, a simple
              membership, and a shared layer of local activity.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-heading font-semibold text-sm text-foreground mb-4 uppercase tracking-wider">
              Explore
            </h4>
            <div className="space-y-3">
              {[
                { to: "/downtown-perks/explore", label: "Map" },
                { to: "/downtown-perks/events", label: "Events" },
                { to: "/downtown-perks/perks", label: "Perks" },
                { to: "/downtown-perks/about", label: "About" },
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-sm text-foreground mb-4 uppercase tracking-wider">
              Partners
            </h4>
            <div className="space-y-3">
              {[
                { to: "/brands", label: "Brand Partners" },
                { to: "/downtown-perks/for-buildings", label: "For Buildings" },
                { to: "/downtown-perks/for-buildings", label: "For Businesses" },
                { to: "/downtown-perks/for-buildings", label: "For Real Estate" },
              ].map((link, i) => (
                <Link
                  key={i}
                  to={link.to}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Downtown Perks. Austin, TX.
          </p>
          <p className="text-xs text-muted-foreground">
            Where downtown stops being a place — and starts working like a system.
          </p>
        </div>
      </div>
    </footer>
  );
}