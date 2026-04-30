import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { FOOTER_NAV_GROUPS } from "@/config/navItems";
import { SITE_COPY } from "@/config/siteCopy";

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
              {SITE_COPY.footerMission}
            </p>
            <a
              href="mailto:hello@downtownperks.com"
              className="text-[13px] text-muted-foreground transition-colors hover:text-foreground"
            >
              hello@downtownperks.com
            </a>
          </div>

          {Object.entries(FOOTER_NAV_GROUPS).map(([group, links]) => (
            <div key={group} className="md:col-span-2">
              <h4 className="mb-5 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                {group}
              </h4>
              <div className="space-y-3">
                {links.map((link, index) =>
                  link.to.startsWith("mailto:") ? (
                    <a
                      key={`${link.to}-${link.label}-${index}`}
                      href={link.to}
                      className="block text-[13px] text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      key={`${link.to}-${link.label}-${index}`}
                      to={link.to}
                      className="block text-[13px] text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  )
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-start gap-2 border-t border-border/40 pt-8">
          <p className="text-[12px] text-muted-foreground/70">© 2026 Downtown Perks · Austin, TX · 78701</p>
          <p className="text-[12px] text-muted-foreground/50">Where downtown works like a system.</p>
        </div>
      </div>
    </footer>
  );
}
