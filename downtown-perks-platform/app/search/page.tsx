import { DowntownPerksExplorer } from '@/components/DowntownPerksExplorer';

export default function Page() {
  return (
    <main>
      <DowntownPerksExplorer initialMode="resident" initialQuery="best building for walkable errands" />
    </main>
  );
}
