import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border/60">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">

          {/* Brand */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-7 h-7 rounded-full border border-primary/40 flex items-center justify-center">
                <MapPin className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="font-heading font-medium text-[15px] text-foreground">
                Downtown<span className="text-primary"> Perks</span>
              </span>
            </div>
            <p className="text-muted-foreground text-[13px] leading-relaxed max-w-xs">
              A live neighborhood layer for downtown Austin — connecting residents, buildings, and local businesses through a shared map, a simple card, and real-time district intelligence.
            </p>
          </div>

          {/* Explore */}
          <div className="md:col-span-3">
            <h4 className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.12em] mb-5">
              Explore
            </h4>
            <div className="space-y-3">
              {[
                { to: "/downtown-perks/explore", label: "Map" },
                { to: "/downtown-perks/events", label: "Events" },
                { to: "/downtown-perks/perks", label: "Perks" },
                { to: "/downtown-perks/about", label: "About" },
                { to: "/downtown-perks/card", label: "Get Your Card" },
              ].map((link) => (
                <Link key={link.to} to={link.to} className="block text-[13px] text-muted-foreground hover:text-foreground transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Partners */}
          <div className="md:col-span-4">
            <h4 className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.12em] mb-5">
              Partners
            </h4>
            <div className="space-y-3">
              {[
                { to: "/brands", label: "Brand Partners" },
                { to: "/downtown-perks/for-buildings", label: "For Buildings" },
                { to: "/downtown-perks/for-buildings", label: "For Businesses" },
                { to: "/downtown-perks/for-buildings", label: "Real Estate" },
              ].map((link, i) => (
                <Link key={i} to={link.to} className="block text-[13px] text-muted-foreground hover:text-foreground transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[12px] text-muted-foreground/70">
            © {new Date().getFullYear()} Downtown Perks. Austin, TX.
          </p>
          <p className="text-[12px] text-muted-foreground/50 italic font-heading">
            Where downtown works like a system.
          </p>
        </div>
      </div>
    </footer>
  );
}