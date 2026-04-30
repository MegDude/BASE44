
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { crossAppLinks } from '@/lib/ecosystem-data';

export function Header() {
  const pathname = usePathname();
  return (
    <header className="dp-cross-nav">
      <div className="container dp-cross-nav__inner">
        <Link href="/" className="brand brand--cross">
          <span className="brand-badge brand-badge--square">DP</span>
          <span className="brand-copy">
            <strong>Downtown Perks</strong>
            <small>Resident App + Partner Dashboard</small>
          </span>
        </Link>
        <nav className="dp-cross-nav__links" aria-label="Cross app navigation">
          {crossAppLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={pathname === item.href ? 'nav-active' : ''}
            >
              {item.label}
              <small>{item.description}</small>
            </Link>
          ))}
        </nav>
        <div className="header-cta">
          <Link href="/partner-dashboard/about?type=properties" className="btn-ghost">Pilot deck</Link>
          <Link href="/resident-app" className="btn">Open resident app</Link>
        </div>
      </div>
      <div className="dp-cross-nav__mobile">
        <div className="container dp-cross-nav__mobile-scroll">
          {crossAppLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`chip ${pathname === item.href ? 'chip--active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
