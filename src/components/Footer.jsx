import { Link } from "react-router-dom";

const FOOTER_LINKS = {
  Residents: [
    { to: "/map?mode=resident&tab=map", label: "Map" },
    { to: "/events", label: "Events" },
    { to: "/card", label: "Perks Card" },
    { to: "/residents", label: "Get Started" },
  ],
  Partners: [
    { to: "/partners/properties", label: "Properties" },
    { to: "/partners/hotels", label: "Hotels" },
    { to: "/partners/venues", label: "Venues" },
    { to: "/partners/brands", label: "Brands" },
    { to: "/partners/civic", label: "Civic" },
  ],
  Directory: [
    { to: "/contact", label: "Contact" },
    { to: "/partners", label: "Partner Mode" },
    { to: "/brands", label: "Brand Directory" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-[#0B1F33] px-5 py-9 text-[#F7F8FB] sm:px-6 sm:py-10 lg:px-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-[0.9fr_2.1fr] md:gap-10 lg:mb-10 lg:gap-12">
          <div>
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-[#B38F4F] text-lg font-bold leading-none text-[#0B1F33]">
                D
              </div>
              <span className="font-sans text-xl font-bold tracking-tight md:text-lg">
                Downtown Perks
              </span>
            </div>
            <p className="mb-5 max-w-sm text-[15px] font-light leading-7 text-[#F7F8FB]/72 md:text-sm md:leading-6">
              Built for the people who actually live downtown — helping residents find what’s nearby and helping local businesses get noticed.
            </p>
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#B38F4F]">
              Austin, TX
            </div>
          </div>

          <div className="grid min-w-0 grid-cols-3 gap-4 sm:gap-6 lg:gap-10">
            {Object.entries(FOOTER_LINKS).map(([group, links]) => (
              <nav key={group} aria-label={group}>
                <h4 className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#B38F4F] sm:mb-4 sm:text-[11px]">
                  {group}
                </h4>
                <ul className="space-y-2 text-[13px] font-light leading-5 text-[#F7F8FB]/72 sm:space-y-2.5 sm:text-[15px]">
                  {links.map((link) => (
                    <li key={link.to + link.label}>
                      <Link
                        to={link.to}
                        className="transition-colors hover:text-[#F7F8FB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F]"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                  {group === "Directory" && (
                    <li className="min-w-0 pt-2">
                      <a
                        href="mailto:partners@downtownperks.com"
                        className="inline-block max-w-full break-all text-[12px] leading-relaxed text-[#B38F4F] transition-colors hover:text-[#F7F8FB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F] sm:text-[13px]"
                      >
                        partners@downtownperks.com
                      </a>
                    </li>
                  )}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-2 pt-5 text-center text-[11px] font-bold uppercase tracking-[0.18em] text-[#F7F8FB]/46 sm:flex-row sm:gap-4">
          <div>© {new Date().getFullYear()} Downtown Perks · Austin, TX · 78701</div>
          <div className="text-[#B38F4F]">Where downtown meets you.</div>
        </div>
      </div>
    </footer>
  );
}
