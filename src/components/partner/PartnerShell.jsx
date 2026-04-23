/**
 * PartnerShell — Wraps all partner pages with unified layout, navigation, and footer
 */
import { Link } from 'react-router-dom';

const PARTNER_NAV = [
  { label: 'Overview', href: '/partners' },
  { label: 'Properties', href: '/partners/properties' },
  { label: 'Hotels', href: '/partners/hotels' },
  { label: 'Venues', href: '/partners/venues' },
  { label: 'Brands', href: '/partners/brands' },
  { label: 'Civic', href: '/partners/civic' },
];

export default function PartnerShell({ children }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Top navigation bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-[68px] border-b border-[rgba(10,20,40,0.08)] bg-white/92 backdrop-blur flex items-center px-6">
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
      <footer className="border-t border-[rgba(10,20,40,0.08)] bg-white py-10">
        <div className="max-w-7xl mx-auto px-6">
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
                <a href="/downtown-perks/explore" className="block text-muted-foreground hover:text-[var(--dp-navy)]">
                  Explore
                </a>
                <a href="/downtown-perks/events" className="block text-muted-foreground hover:text-[var(--dp-navy)]">
                  Events
                </a>
                <a href="/downtown-perks/perks" className="block text-muted-foreground hover:text-[var(--dp-navy)]">
                  Perks
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-[12px] font-bold uppercase tracking-[.12em] text-muted-foreground mb-4">
                Company
              </h4>
              <div className="space-y-2 text-[13px]">
                <a href="/downtown-perks/about" className="block text-muted-foreground hover:text-[var(--dp-navy)]">
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
      </footer>
    </div>
  );
}
