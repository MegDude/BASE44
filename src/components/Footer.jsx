import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";

const FOOTER_LINKS = {
  Residents: [
    { to: "/map?mode=resident&tab=map", label: "Open App" },
    { to: "/card", label: "Perks Card" },
  ],
  Partners: [
    { to: "/partners/sign-up", label: "Partner Signup" },
    { to: "/app?mode=partner&tab=map&filter=All", label: "Partner Map" },
  ],
  Platform: [
    { to: "/pricing", label: "Pricing" },
    { to: "/partners/sign-up", label: "Contact" },
  ],
};

export default function Footer() {
  return (
    <footer className="dp-site-footer border-t border-white/[0.08] bg-[#0B1F33] px-5 py-9 font-sans text-white sm:px-6 sm:py-10 lg:px-20">
      <div className="mx-auto max-w-7xl">
        <div className="dp-site-footer-layout mb-7 grid grid-cols-1 gap-6 md:grid-cols-[0.88fr_2.12fr] md:gap-8 lg:mb-8 lg:gap-10">
          <div>
            <Link to="/map?mode=resident&tab=map" className="mb-5 inline-flex items-center gap-2.5 whitespace-nowrap leading-none text-white transition-colors hover:text-[#BFA46A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BFA46A]" aria-label="Downtown Perks app">
              <MapPin className="h-[15px] w-[15px] shrink-0 text-[#BFA46A]" aria-hidden="true" />
              <span className="inline-flex items-center whitespace-nowrap font-sans text-[14.5px] font-semibold leading-none tracking-normal">
                Downtown Perks
              </span>
            </Link>
            <p className="mb-4 max-w-sm text-[14px] font-light leading-6 text-white/62 sm:text-[15px] md:text-sm md:leading-6">
              Helping people discover more of downtown while helping local businesses, properties and organizations reach them at the right moment.
            </p>
          </div>

          <div className="dp-site-footer-link-grid grid min-w-0 grid-cols-[0.82fr_0.9fr_1.28fr] gap-2 sm:gap-4 lg:gap-6">
            {Object.entries(FOOTER_LINKS).map(([group, links]) => (
              <nav key={group} aria-label={group}>
                <h4 className="mb-2.5 font-sans text-[10px] font-semibold uppercase tracking-[0.14em] text-[#BFA46A] sm:mb-3 sm:text-[11px]">
                  {group}
                </h4>
                <ul className="space-y-1.5 text-[13px] font-light leading-5 text-white/68 sm:space-y-2 sm:text-[14px]">
                  {links.map((link) => (
                    <li key={link.to + link.label}>
                      <Link
                        to={link.to}
                        className="transition-colors hover:text-[#BFA46A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BFA46A]"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-2 border-t border-white/[0.08] pt-4 text-center font-sans text-[11px] font-medium normal-case tracking-normal text-white/48 sm:flex-row sm:gap-4 sm:text-[12px]">
          <div>© {new Date().getFullYear()} Downtown Perks</div>
          <a
            href="mailto:partners@downtownperks.com"
            className="text-[#BFA46A] transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BFA46A]"
          >
            partners@downtownperks.com
          </a>
        </div>
      </div>
    </footer>
  );
}
