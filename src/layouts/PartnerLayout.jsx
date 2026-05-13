import { Outlet, NavLink } from 'react-router-dom';
import { BarChart2, Map, Users, Settings } from 'lucide-react';
import { ROUTES } from '@/lib/routes';

const partnerNav = [
  { label: 'Overview', to: ROUTES.partnerDashboard, icon: BarChart2 },
  { label: 'Map', to: '/partner-dashboard/map', icon: Map },
  { label: 'Residents', to: '/partner-dashboard/residents', icon: Users },
  { label: 'Settings', to: '/partner-dashboard/settings', icon: Settings },
];

export default function PartnerLayout() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--dp-bg)', color: 'var(--dp-ink)' }}>
      <header className="sticky top-0 z-40 flex items-center justify-between px-6 h-14 border-b" style={{ backgroundColor: 'var(--dp-card)', borderColor: 'var(--dp-border)' }}>
        <span className="text-sm font-semibold tracking-tight" style={{ color: 'var(--dp-navy)' }}>Downtown Perks Partners</span>
        <nav className="hidden md:flex items-center gap-6" aria-label="Partner navigation">
          {partnerNav.map(item => (
            <NavLink key={item.label} to={item.to} className={({ isActive }) => `text-xs font-medium transition-colors ${isActive ? 'text-[var(--dp-navy)]' : 'text-[var(--dp-slate)]'}`}>{item.label}</NavLink>
          ))}
        </nav>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
