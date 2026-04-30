import PageShell from "@/components/layout/PageShell";
import MapShell from "@/components/map/MapShell";

export default function Residents() {
  return (
    <PageShell>
      <div className="min-h-screen pt-[68px]">
        <MapShell mode="resident" className="min-h-[calc(100vh-68px)]" />
      </div>
    </PageShell>
  );
}
