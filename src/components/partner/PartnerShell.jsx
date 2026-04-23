/**
 * PartnerShell — Wraps all partner pages with unified layout, navigation, and footer
 */
import { Link } from 'react-router-dom';
import { ROUTES } from '@/lib/routes';

const PARTNER_NAV = [
  { label: 'Overview', href: ROUTES.partners },
  { label: 'Properties', href: ROUTES.partnerProperties },
  { label: 'Hotels', href: ROUTES.partnerHotels },
  { label: 'Venues', href: ROUTES.partnerVenues },
  { label: 'Brands', href: ROUTES.partnerBrands },
  { label: 'Civic', href: ROUTES.partnerCivic },
];

export default function PartnerShell({ children }) {
  return (
    <div className="min-h-screen bg-[var(--dp-surface-base)]">
      {/* Top navigation bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-[68px] bg-white/78 backdrop-blur-xl flex items-center px-6 shadow-[0_6px_24px_rgba(11,26,43,0.05)]">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <Link to="/partners" className="dp-brand-wordmark text-[14px] text-[var(--dp-navy)]">
            Downtown Perks
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {PARTNER_NAV.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="text-[13px] font-medium text-muted-foreground hover:text-[var(--dp-navy)] transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="pt-[68px]">{children}</main>

      {/* Footer */}
      <footer className="bg-[var(--dp-surface-base)] py-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="dp-band p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-[12px] font-bold uppercase tracking-[.12em] text-muted-foreground mb-4">
                Partners
              </h4>
              <div className="space-y-2 text-[13px]">
                {PARTNER_NAV.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="block text-muted-foreground hover:text-[var(--dp-navy)] transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-[12px] font-bold uppercase tracking-[.12em] text-muted-foreground mb-4">
                Product
              </h4>
              <div className="space-y-2 text-[13px]">
                <a href={ROUTES.explore} className="block text-muted-foreground hover:text-[var(--dp-navy)]">
                  Explore
                </a>
                <a href={ROUTES.events} className="block text-muted-foreground hover:text-[var(--dp-navy)]">
                  Events
                </a>
                <a href={ROUTES.perks} className="block text-muted-foreground hover:text-[var(--dp-navy)]">
                  Perks
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-[12px] font-bold uppercase tracking-[.12em] text-muted-foreground mb-4">
                Company
              </h4>
              <div className="space-y-2 text-[13px]">
                <a href={ROUTES.about} className="block text-muted-foreground hover:text-[var(--dp-navy)]">
                  About
                </a>
                <a href="#" className="block text-muted-foreground hover:text-[var(--dp-navy)]">
                  Contact
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-[12px] font-bold uppercase tracking-[.12em] text-muted-foreground mb-4">
                Legal
              </h4>
              <div className="space-y-2 text-[13px]">
                <a href="#" className="block text-muted-foreground hover:text-[var(--dp-navy)]">
                  Privacy
                </a>
                <a href="#" className="block text-muted-foreground hover:text-[var(--dp-navy)]">
                  Terms
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-[rgba(10,20,40,0.08)] pt-8 text-[12px] text-muted-foreground">
            <p>&copy; 2026 Downtown Perks. All rights reserved.</p>
          </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
