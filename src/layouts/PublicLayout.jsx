import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from '@/components/navigation/Navbar';
import Footer from '@/components/navigation/Footer';

const NO_FOOTER_PATHS = ['/map', '/explore', '/events'];

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

export default function PublicLayout() {
  const { pathname } = useLocation();
  const hideFooter = NO_FOOTER_PATHS.includes(pathname);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--dp-bg)', color: 'var(--dp-ink)', fontFamily: 'var(--dp-font-body)' }}>
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
}
