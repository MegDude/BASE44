import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";

export default function HomeFooter() {
  return (
    <footer className="border-t border-border/40">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full border border-primary/30 flex items-center justify-center">
              <MapPin className="w-3 h-3 text-primary" />
            </div>
            <span className="font-heading text-sm text-muted-foreground">
              Downtown Perks
            </span>
          </div>
          <p className="text-[12px] text-muted-foreground/60">
            © {new Date().getFullYear()} All rights reserved.
          </p>
          <Link to="/downtown-perks" className="text-[13px] text-muted-foreground hover:text-primary transition-colors">
            Downtown Perks →
          </Link>
        </div>
      </div>
    </footer>
  );
}