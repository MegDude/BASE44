import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { ROUTES } from "@/lib/routes";

const FOOTER_LINKS = {
  Explore: [
    { to: ROUTES.explore, label: "Live Map" },
    { to: ROUTES.events, label: "Events" },
    { to: ROUTES.perks, label: "Perks" },
    { to: ROUTES.card, label: "Perks Card" },
    { to: ROUTES.about, label: "About" },
  ],
  Partners: [
    { to: ROUTES.partnerProperties, label: "Properties" },
    { to: ROUTES.partnerHospitality, label: "Hospitality" },
    { to: ROUTES.partnerVenues, label: "Venues" },
    { to: ROUTES.partnerBrands, label: "Brands" },
    { to: ROUTES.partnerCivic, label: "Civic" },
  ],
  Platform: [
    { to: ROUTES.partners, label: "Partner Overview" },
    { to: ROUTES.partnerWorkspace, label: "Partner Workspace" },
    { to: ROUTES.partnerDashboard, label: "Dashboard" },
    { to: ROUTES.partners, label: "Start Here" },
    { to: ROUTES.brands, label: "Brand Directory" },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <div className="mb-5 flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full border border-primary/40">
                <MapPin className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="dp-brand-wordmark text-[15px] text-foreground">
                Downtown<span className="text-primary"> Perks</span>
              </span>
            </div>
            <p className="mb-6 max-w-xs text-[13px] leading-relaxed text-muted-foreground">
              A live neighborhood layer for downtown Austin — connecting residents, buildings, and local businesses through a shared map, a simple card, and real-time district intelligence.
            </p>
            <a
              href="mailto:hello@downtownperks.com"
              className="text-[13px] text-muted-foreground transition-colors hover:text-foreground"
            >
              hello@downtownperks.com
            </a>
          </div>

          {Object.entries(FOOTER_LINKS).map(([group, links]) => (
            <div key={group} className="md:col-span-2">
              <h4 className="mb-5 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                {group}
              </h4>
              <div className="space-y-3">
                {links.map((link, index) => (
                  <Link
                    key={`${link.to}-${link.label}-${index}`}
                    to={link.to}
                    className="block text-[13px] text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-start gap-2 border-t border-border/40 pt-8">
          <p className="text-[12px] text-muted-foreground/70">© 2026 Downtown Perks · Austin, TX · 78701</p>
          <p className="text-[12px] text-muted-foreground/50">The Neighborhood, Unlocked.</p>
        </div>
      </div>
    </footer>
  );
}
