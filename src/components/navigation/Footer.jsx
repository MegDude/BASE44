import { Link } from 'react-router-dom';
import { footerNav } from '@/lib/navigationRegistry';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer role="contentinfo" className="border-t mt-auto" style={{ backgroundColor: 'var(--dp-bg-soft)', borderColor: 'var(--dp-border)', color: 'var(--dp-ink)' }}>
      <div className="fluid-container py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {Object.entries(footerNav).map(([group, links]) => (
            <div key={group}>
              <p className="text-[11px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--dp-slate)' }}>{group}</p>
              <ul className="flex flex-col gap-2">
                {links.map(link => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-[13px] transition-colors hover:text-[var(--dp-navy)] focus:outline-none focus-visible:underline"
                      style={{ color: 'var(--dp-slate)' }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-6 border-t" style={{ borderColor: 'var(--dp-border)' }}>
          <span className="text-xs font-semibold" style={{ color: 'var(--dp-navy)' }}>Downtown Perks</span>
          <span className="text-xs" style={{ color: 'var(--dp-slate)' }}>© {year} Downtown Perks. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
