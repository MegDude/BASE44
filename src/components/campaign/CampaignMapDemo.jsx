import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import MapShell from '@/components/map/MapShell';

/**
 * CampaignMapDemo — Interactive map module for campaign pages
 * Receives campaign placements + renders in MapShell campaign mode
 */
export default function CampaignMapDemo({
  campaignId,
  placements,
  mapCenter,
  mapZoom,
  sourceContext,
  placementTypes,
  markerIcon,
  renderDrawer,
  selected,
  onSelect,
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section ref={ref} className="py-10 px-5 border-t border-border/40">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }} className="mb-8">
          <span className="text-[11px] font-medium text-primary/70 uppercase tracking-[0.16em] block mb-3">Live demo</span>
          <h2 className="font-heading text-2xl md:text-3xl font-medium leading-[1.2] tracking-normal">How it appears on the map</h2>
        </motion.div>

        {/* Map container */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.1 }}>
          <div className="rounded-xl border border-border/50 overflow-hidden" style={{ height: 480 }}>
            <MapShell
              mode="campaign-preview"
              campaignId={campaignId}
              items={placements}
              selected={selected}
              onSelect={onSelect}
              center={mapCenter}
              zoom={mapZoom}
              markerIcon={markerIcon}
              renderDetailDrawer={renderDrawer}
              className="w-full h-full"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}