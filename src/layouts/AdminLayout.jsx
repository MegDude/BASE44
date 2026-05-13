import { Outlet } from 'react-router-dom';

export default function AdminLayout() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--dp-bg)', color: 'var(--dp-ink)' }}>
      <header className="h-12 flex items-center px-6 border-b text-xs font-semibold" style={{ backgroundColor: 'var(--dp-navy)', color: '#fff', borderColor: 'rgba(255,255,255,0.1)' }}>
        Downtown Perks Admin
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
