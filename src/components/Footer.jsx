import { Link } from "react-router-dom";

const FOOTER_LINKS = {
  Residents: [
    { to: "/map?mode=resident&tab=map", label: "Map" },
    { to: "/events", label: "Events" },
    { to: "/card", label: "Perks Card" },
    { to: "/residents", label: "Resident Access" },
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
    <footer className="bg-[#0B1F33] px-5 py-9 font-sans text-[#FFFFFF] sm:px-6 sm:py-10 lg:px-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 grid grid-cols-1 gap-6 md:grid-cols-[0.88fr_2.12fr] md:gap-8 lg:mb-8 lg:gap-10">
          <div>
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-[#C8A96A] text-lg font-bold leading-none text-[#0B1F33]">
                D
              </div>
              <span className="font-sans text-[18px] font-semibold tracking-tight md:text-lg">
                Downtown Perks
              </span>
            </div>
            <p className="mb-4 max-w-sm text-[14px] font-light leading-6 text-[#FFFFFF]/72 sm:text-[15px] md:text-sm md:leading-6">
              Built for the people who actually live downtown — helping residents find what’s nearby and helping local businesses get noticed.
            </p>
          </div>

          <div className="grid min-w-0 grid-cols-[0.82fr_0.9fr_1.28fr] gap-2 sm:gap-4 lg:gap-6">
            {Object.entries(FOOTER_LINKS).map(([group, links]) => (
              <nav key={group} aria-label={group}>
                <h4 className="mb-2.5 font-sans text-[10px] font-semibold uppercase tracking-normal text-[#BFA46A] sm:mb-3 sm:text-[11px]">
                  {group}
                </h4>
                <ul className="space-y-1.5 text-[13px] font-light leading-5 text-[#FFFFFF]/72 sm:space-y-2 sm:text-[14px]">
                  {links.map((link) => (
                    <li key={link.to + link.label}>
                      <Link
                        to={link.to}
                        className="transition-colors hover:text-[#FFFFFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96A]"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                  {group === "Directory" && (
                    <li className="min-w-0 pt-1">
                      <a
                        href="mailto:partners@downtownperks.com"
                        className="inline-block max-w-full whitespace-nowrap text-[11px] leading-relaxed text-[#BFA46A] transition-colors hover:text-[#FFFFFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BFA46A] sm:text-[12px] md:text-[11px] lg:text-[12px]"
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

        <div className="flex flex-col items-center justify-center gap-2 pt-4 text-center font-sans text-[11px] font-medium normal-case tracking-normal text-[#FFFFFF]/46 sm:flex-row sm:gap-4 sm:text-[12px]">
          <div>© {new Date().getFullYear()} Downtown Perks</div>
          <div className="text-[#BFA46A]">Where downtown meets you.</div>
        </div>
      </div>
    </footer>
  );
}
