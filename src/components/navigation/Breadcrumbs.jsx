import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const LABELS = {
  '': 'Home',
  map: 'Map',
  events: 'Events',
  card: 'Card',
  partners: 'Partners',
  about: 'About',
  perks: 'Perks',
  'partner-dashboard': 'Dashboard',
};

export default function Breadcrumbs() {
  const { pathname } = useLocation();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) return null;

  const crumbs = [
    { label: 'Home', to: '/' },
    ...segments.map((seg, i) => ({
      label: LABELS[seg] ?? seg.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      to: '/' + segments.slice(0, i + 1).join('/'),
    })),
  ];

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs py-2">
      {crumbs.map((crumb, i) => (
        <span key={crumb.to} className="flex items-center gap-1">
          {i < crumbs.length - 1 ? (
            <>
              <Link to={crumb.to} className="hover:underline focus:outline-none focus-visible:underline" style={{ color: 'var(--dp-slate)' }}>{crumb.label}</Link>
              <ChevronRight className="h-3 w-3" style={{ color: 'var(--dp-slate)' }} aria-hidden="true" />
            </>
          ) : (
            <span aria-current="page" style={{ color: 'var(--dp-navy)', fontWeight: 500 }}>{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
