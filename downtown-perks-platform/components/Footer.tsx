
import Link from 'next/link';
import { ecosystemHighlights } from '@/lib/ecosystem-data';

export function Footer() {
  return (
    <footer className="footer footer--site">
      <div className="container footer-grid footer-grid--site">
        <div>
          <div className="kicker">Downtown Perks</div>
          <h3 className="footer-title">One downtown operating layer, two real product surfaces.</h3>
          <p className="section-copy">
            Resident discovery, partner proof, stations, text links, checkout, and admin all point back to the same map-driven ecosystem.
          </p>
        </div>
        <div className="footer-links">
          <div className="small footer-links__group">
            <strong>Product</strong>
            {ecosystemHighlights.map((item) => (
              <Link href={item.href} key={item.href}>{item.title}</Link>
            ))}
          </div>
          <div className="small footer-links__group">
            <strong>Platform</strong>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/sign-in">Sign in</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
