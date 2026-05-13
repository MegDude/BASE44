import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { primaryNav } from '@/lib/navigationRegistry';
import MobileMenu from './MobileMenu';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <>
      <header
        role="banner"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'shadow-[0_2px_24px_rgba(17,31,61,0.08)]' : ''}`}
        style={{ backgroundColor: scrolled ? 'rgba(246,247,251,0.96)' : 'rgba(246,247,251,0.82)', backdropFilter: 'blur(18px)', borderBottom: scrolled ? '1px solid rgba(17,31,61,0.07)' : 'none' }}
      >
        <div className="fluid-container flex items-center justify-between h-14">
          <Link to="/" className="flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dp-gold)] rounded" aria-label="Downtown Perks home">
            <span className="text-sm font-semibold tracking-tight" style={{ color: 'var(--dp-navy)' }}>Downtown Perks</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6" aria-label="Primary navigation">
            {primaryNav.map(item => (
              <NavLink
                key={item.id}
                to={item.to}
                className={({ isActive }) =>
                  `text-[13px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dp-gold)] rounded px-1 py-0.5 ${isActive ? 'text-[var(--dp-navy)] font-semibold' : 'text-[var(--dp-slate)] hover:text-[var(--dp-navy)]'}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <button
            className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dp-gold)]"
            style={{ color: 'var(--dp-navy)', borderColor: 'var(--dp-border)', backgroundColor: 'var(--dp-card)' }}
            onClick={() => setMenuOpen(v => !v)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            <span>Menu</span>
          </button>
        </div>
      </header>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
