import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";

export default function HomeFooter() {
  return (
    <footer className="border-t border-[hsl(218,20%,88%)] bg-white">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full border border-primary/40 flex items-center justify-center">
              <MapPin className="w-3 h-3 text-primary" />
            </div>
            <span className="font-heading text-sm text-foreground/70">
              Downtown Perks
            </span>
          </div>
          <p className="text-[12px] text-foreground/40">
            © {new Date().getFullYear()} All rights reserved.
          </p>
          <Link to="/downtown-perks" className="text-[13px] text-foreground/60 hover:text-primary transition-colors">
            Downtown Perks →
          </Link>
        </div>
      </div>
    </footer>
  );
}