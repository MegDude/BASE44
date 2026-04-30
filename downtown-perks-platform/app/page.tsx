import { DowntownPerksExplorer } from '@/components/DowntownPerksExplorer';
import { Footer } from '@/components/Footer';

export default function Page() {
  return (
    <main className="ecosystem-main">
      <DowntownPerksExplorer initialMode="resident" />
      <Footer />
    </main>
  );
}
