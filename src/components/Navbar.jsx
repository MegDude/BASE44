/**
 * Navbar — Global navigation
 * Glass effect, responsive dropdowns, back button support
 * Compact on mobile, full on desktop
 */

import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, MapPin, ChevronDown, ChevronLeft, Hotel, Star, Landmark, Building2, LayoutDashboard, Map, Calendar, CreditCard, Utensils } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const RESIDENT_LINKS = [
  { to: '/map', label: 'Live Map', desc: 'Explore downtown', icon: Map },
  { to: '/events', label: 'Events', desc: 'What\'s happening', icon: Calendar },
  { to: '/perks', label: 'Perks', desc: 'Member offers', icon: Star },
  { to: '/card', label: 'Perks Card', desc: 'Your credential', icon: CreditCard },
];

const PARTNER_LINKS = [
  { to: '/partners', label: 'Overview', desc: 'Partner system', icon: LayoutDashboard },
  { to: '/partners/properties', label: 'Properties', desc: 'Buildings & amenities', icon: Building2 },
  { to: '/partners/hospitality', label: 'Hotels', desc: 'Guest intelligence', icon: Hotel },
  { to: '/partners/venues', label: 'Venues', desc: 'Restaurants & bars', icon: Utensils },
  { to: '/partners/brands', label: 'Brands', desc: 'Campaigns', icon: Star },
  { to: '/partners/civic', label: 'Civic', desc: 'District programs', icon: Landmark },
];

const PAGES_WITH_BACK = [
  '/partners/properties',
  '/partners/hospitality',
  '/partners/venues',
  '/partners/brands',
  '/partners/civic',
  '/about',
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdown, setDropdown] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const isMapPage = location.pathname === '/' || location.pathname === '/map' || location.pathname === '/explore';
  const showBack = PAGES_WITH_BACK.some(p => location.pathname.startsWith(p));
  const isHomeHero = location.pathname === '/' && !scrolled;

  // Scroll listener
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close on route change
  useEffect(() => {
    setDropdown(null);
    setMobileOpen(false);
  }, [location.pathname]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const isActive = (to) => {
    if (!to) return false;
    if (to === '/partners') return location.pathname.startsWith('/partners');
    return location.pathname === to;
  };

  const handleBack = () => {
    if (location.pathname.startsWith('/partners/')) {
      navigate('/partners');
    } else {
      navigate(-1);
    }
  };

  // Hide navbar on map pages (it's integrated into the map UI)
  if (isMapPage) return null;

  return (
    <nav
      ref={dropdownRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 safe-top ${
        isHomeHero
          ? 'dp-glass-dark border-b border-white/10'
          : 'dp-glass border-b border-[var(--dp-divider)]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Left: Back or Logo */}
        <div className="flex items-center gap-3 shrink-0">
          {showBack ? (
            <button onClick={handleBack} className="dp-back dp-touch">
              <ChevronLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back</span>
            </button>
          ) : (
            <Link to="/" className="flex items-center gap-2 group" aria-label="Downtown Perks home">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isHomeHero ? 'bg-white/10 border border-white/20' : 'bg-[var(--dp-gold-soft)]'
              }`}>
                <MapPin className={`w-4 h-4 ${isHomeHero ? 'text-gold' : 'text-[var(--dp-gold)]'}`} />
              </div>
              <span className={`font-semibold text-sm ${isHomeHero ? 'text-on-dark' : 'text-navy'}`}>
                Downtown Perks
              </span>
            </Link>
          )}
        </div>

        {/* Center: Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {/* Residents dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdown(dropdown === 'residents' ? null : 'residents')}
              className={`dp-touch flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isHomeHero
                  ? 'text-on-dark hover:bg-white/10'
                  : 'text-navy hover:bg-surface-subtle'
              }`}
            >
              <span>Residents</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${dropdown === 'residents' ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {dropdown === 'residents' && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute top-full left-0 mt-2 w-56 dp-glass dp-shadow-lg rounded-xl overflow-hidden py-2"
                >
                  {RESIDENT_LINKS.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.to}
                        to={link.to}
                        className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${
                          isActive(link.to) ? 'bg-gold-soft' : 'hover:bg-surface-subtle'
                        }`}
                      >
                        <Icon className="w-4 h-4 text-gold" />
                        <div>
                          <p className="text-sm font-medium text-navy">{link.label}</p>
                          <p className="text-xs text-navy-muted">{link.desc}</p>
                        </div>
                      </Link>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Partners dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdown(dropdown === 'partners' ? null : 'partners')}
              className={`dp-touch flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isHomeHero
                  ? 'text-on-dark hover:bg-white/10'
                  : 'text-navy hover:bg-surface-subtle'
              }`}
            >
              <span>Partners</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${dropdown === 'partners' ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {dropdown === 'partners' && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute top-full left-0 mt-2 w-56 dp-glass dp-shadow-lg rounded-xl overflow-hidden py-2"
                >
                  {PARTNER_LINKS.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.to}
                        to={link.to}
                        className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${
                          isActive(link.to) ? 'bg-gold-soft' : 'hover:bg-surface-subtle'
                        }`}
                      >
                        <Icon className="w-4 h-4 text-gold" />
                        <div>
                          <p className="text-sm font-medium text-navy">{link.label}</p>
                          <p className="text-xs text-navy-muted">{link.desc}</p>
                        </div>
                      </Link>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* About link */}
          <Link
            to="/about"
            className={`dp-touch px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isHomeHero
                ? 'text-on-dark hover:bg-white/10'
                : 'text-navy hover:bg-surface-subtle'
            }`}
          >
            About
          </Link>
        </div>

        {/* Right: CTA + Mobile menu */}
        <div className="flex items-center gap-2">
          <Link
            to="/map"
            className={`hidden sm:flex dp-btn-gold dp-touch text-sm`}
          >
            <Map className="w-4 h-4" />
            <span>Open Map</span>
          </Link>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`md:hidden dp-touch flex items-center justify-center w-10 h-10 rounded-lg ${
              isHomeHero ? 'text-on-dark' : 'text-navy'
            }`}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden dp-glass border-t border-[var(--dp-divider)]"
          >
            <div className="px-4 py-4 space-y-4">
              {/* Residents section */}
              <div>
                <p className="text-xs uppercase tracking-wide text-navy-muted mb-2 px-2">Residents</p>
                <div className="space-y-1">
                  {RESIDENT_LINKS.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.to}
                        to={link.to}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-subtle"
                      >
                        <Icon className="w-5 h-5 text-gold" />
                        <span className="text-sm font-medium text-navy">{link.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Partners section */}
              <div>
                <p className="text-xs uppercase tracking-wide text-navy-muted mb-2 px-2">Partners</p>
                <div className="space-y-1">
                  {PARTNER_LINKS.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.to}
                        to={link.to}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-subtle"
                      >
                        <Icon className="w-5 h-5 text-gold" />
                        <span className="text-sm font-medium text-navy">{link.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* CTA */}
              <Link
                to="/map"
                className="dp-btn-gold w-full justify-center dp-touch"
              >
                <Map className="w-4 h-4" />
                <span>Open Map</span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
