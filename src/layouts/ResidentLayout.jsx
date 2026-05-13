import { Outlet, useLocation, NavLink } from 'react-router-dom';
import { Map, Calendar, Bookmark, CreditCard } from 'lucide-react';
import { mobileNav } from '@/lib/navigationRegistry';

const ICONS = { map: Map, events: Calendar, saved: Bookmark, card: CreditCard };

export default function ResidentLayout() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--dp-bg)', color: 'var(--dp-ink)' }}>
      <main className="flex-1 pb-16">
        <Outlet />
      </main>
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center h-16 border-t" style={{ backgroundColor: 'var(--dp-card)', borderColor: 'var(--dp-border)' }} aria-label="Resident navigation">
        {mobileNav.map(item => {
          const Icon = ICONS[item.id] ?? Map;
          return (
            <NavLink key={item.id} to={item.to} className={({ isActive }) => `flex flex-col items-center gap-0.5 px-3 py-1.5 text-xs font-medium transition-colors ${isActive ? 'text-[var(--dp-navy)]' : 'text-[var(--dp-slate)]'}`}>
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
