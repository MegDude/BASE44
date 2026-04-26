import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, List, X } from 'lucide-react';
import { useMapStateStore, selectSelectedEntity } from '@/store/mapStateStore';
import UnifiedMapShell from '@/components/map/unified/UnifiedMapShell';
import UnifiedDrawer from '@/components/map/unified/UnifiedDrawer';
import UnifiedResultsPanel from '@/components/map/unified/UnifiedResultsPanel';
import { filterValidEntities } from '@/lib/mapValidation';
import { mapRepository } from '@/lib/repositories/mapRepository';
import { useRankedResults } from '@/hooks/useRankedResults';
import { rankMapEntities } from '@/lib/map/rankMapEntities';

export default function ExploreRebuilt() {
  const selected = useMapStateStore(selectSelectedEntity);
  const mapCenter = useMapStateStore((s) => s.mapCenter);
  const mapZoom = useMapStateStore((s) => s.mapZoom);
  const setMapCenter = useMapStateStore((s) => s.setMapCenter);
  const setMapZoom = useMapStateStore((s) => s.setMapZoom);
  const selectEntity = useMapStateStore((s) => s.selectEntity);

  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const feed = await mapRepository.getMapFeed({ limit: 1000 });
        const safe = filterValidEntities(feed).filter((i) => i.isPlotted !== false);
        if (mounted) setEntities(safe);
      } catch (_) {
        if (mounted) setEntities([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const ranked = useRankedResults(entities);
  const display = useMemo(() => rankMapEntities(ranked, { maxResults: 30 }), [ranked]);

  return (
    <div className="fixed inset-0 bg-[#f7f7fb]">
      <div className="absolute inset-0">
        <UnifiedMapShell
          items={display}
          selectedId={selected?.id}
          onMarkerSelect={selectEntity}
          mapCenter={mapCenter}
          mapZoom={mapZoom}
          onMapCenterChange={setMapCenter}
          onMapZoomChange={setMapZoom}
          className="w-full h-full"
        />
      </div>

      <div className="absolute left-4 top-4 z-30">
        <Link to="/" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 border border-slate-200 text-slate-700">
          <ChevronLeft className="h-5 w-5" />
        </Link>
      </div>

      <div className="absolute right-4 top-4 z-30">
        <button onClick={() => setShowResults(!showResults)} className="flex items-center gap-2 rounded-full bg-white/90 border border-slate-200 px-3 py-2 text-sm">
          {showResults ? <X className="h-4 w-4" /> : <List className="h-4 w-4" />}
          {showResults ? 'Close' : `Results (${display.length})`}
        </button>
      </div>

      {showResults && (
        <div className="absolute right-0 top-0 z-40 h-full w-full max-w-sm">
          <UnifiedResultsPanel items={display} onClose={() => setShowResults(false)} />
        </div>
      )}

      <UnifiedDrawer selected={selected} />

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-sm text-slate-500">Loading…</div>
        </div>
      )}
    </div>
  );
}
