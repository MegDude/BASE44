import { NavLink } from 'react-router-dom';
import { primaryNav } from '@/lib/navigationRegistry';

export default function MobileMenu({ open, onClose }) {
  if (!open) return null;

  return (
    <div
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile navigation menu"
      className="fixed inset-0 z-40 flex flex-col pt-14"
      style={{ backgroundColor: 'rgba(246,247,251,0.97)', backdropFilter: 'blur(20px)' }}
    >
      <nav className="flex flex-col gap-1 px-5 pt-6" aria-label="Mobile navigation">
        {primaryNav.map(item => (
          <NavLink
            key={item.id}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) =>
              `py-4 px-4 text-lg font-medium rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dp-gold)] ${isActive ? 'bg-[var(--dp-navy)] text-white' : 'text-[var(--dp-navy)] hover:bg-[var(--dp-border)]'}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
