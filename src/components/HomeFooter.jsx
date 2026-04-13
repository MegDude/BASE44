import { Link } from "react-router-dom";
import { Building2 } from "lucide-react";

export default function HomeFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
              <Building2 className="w-4 h-4 text-primary" />
            </div>
            <span className="font-heading font-bold text-sm text-foreground">
              Property Platform
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/downtown-perks" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              Downtown Perks
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}