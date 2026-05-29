import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ArrowRight, MapPin, ArrowLeft, TrendingUp, Users, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import AnalyticsKPICard from '@/components/analytics/AnalyticsKPICard';
import AnalyticsFiltersPanel from '@/components/analytics/AnalyticsFiltersPanel';
import AnalyticsFunnel from '@/components/analytics/AnalyticsFunnel';
import AnalyticsAttributionTable from '@/components/analytics/AnalyticsAttributionTable';

const CAMPAIGN_FORMATS = [
  { id: 'founding', label: 'Founding Partner', icon: '🏆', color: 'from-[#0B1F33] to-[#0B1F33]' },
  { id: 'launch', label: 'Launch Campaign', icon: '🚀', color: 'from-[#0B1F33] to-[#0B1F33]' },
  { id: 'resident', label: 'Resident Activation', icon: '👥', color: 'from-[#081521] to-[#0B1F33]' },
  { id: 'event', label: 'Event-Led Campaign', icon: '📍', color: 'from-[#0B1F33] to-[#0B1F33]' },
  { id: 'utility', label: 'Utility Campaign', icon: '✨', color: 'from-indigo-500 to-violet-500' }
];

const VENUE_PERFORMANCE = [
  { name: 'Legends Real Estate', district: 'Rainey', traffic: 1240, peakTime: '6–8pm', trend: 'up' },
  { name: 'Hotel Van Zandt', district: 'Rainey', traffic: 840, peakTime: '7–9am', trend: 'up' },
  { name: 'The Quincy', district: 'Congress', traffic: 620, peakTime: '5–7pm', trend: 'stable' },
  { name: 'Waterloo Greenway', district: 'Seaholm', traffic: 560, peakTime: '10am–12pm', trend: 'up' }
];

const EVENT_PERFORMANCE = [
  { name: 'Downtown Style Weekend', type: 'Launch', rsvps: 184, attendance: 156, lift: '+18%' },
  { name: 'Rainey Clean Corridor', type: 'Utility', rsvps: 47, attendance: 42, lift: '+12%' },
  { name: 'Waterloo Sunset Series', type: 'Event', rsvps: 71, attendance: 68, lift: '+22%' }
];

function generateSampleAnalytics(seed = 1, format = 'all') {
  const baseMultiplier = seed;
  return {
    reach: Math.round(12400 * baseMultiplier),
    scans: Math.round(2840 * baseMultiplier),
    unlocks: Math.round(1920 * baseMultiplier),
    optIns: Math.round(560 * baseMultiplier),
    visits: Math.round(1240 * baseMultiplier),
    redemptions: Math.round(620 * baseMultiplier),
    repeatEngagement: Math.round(280 * baseMultiplier),
    conversionRate: 5.2,
    funnel: {
      impression: Math.round(12400 * baseMultiplier),
      open: Math.round(5680 * baseMultiplier),
      unlock: Math.round(2840 * baseMultiplier),
      save: Math.round(1920 * baseMultiplier),
      visit_intent: Math.round(1560 * baseMultiplier),
      visit: Math.round(1240 * baseMultiplier),
      redemption: Math.round(620 * baseMultiplier)
    },
    attribution: {
      building_qr: { actions: 3840, visits: 680, redemptions: 320, trend: 'up' },
      map_discovery: { actions: 2960, visits: 520, redemptions: 240, trend: 'stable' },
      event_marker: { actions: 2400, visits: 480, redemptions: 200, trend: 'up' },
      sms: { actions: 1280, visits: 400, redemptions: 160, trend: 'down' },
      resident_card: { actions: 960, visits: 120, redemptions: 80, trend: 'stable' },
      direct_link: { actions: 560, visits: 40, redemptions: 20, trend: 'down' }
    }
  };
}

export default function BrandAnalytics() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [brand, setBrand] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedFormat, setSelectedFormat] = useState(searchParams.get('format') || 'all');
  const [filters, setFilters] = useState({
    timeRange: [searchParams.get('timeRange') || 'month'],
    campaignFormat: [selectedFormat],
    campaign: searchParams.getAll('campaign') || [],
    district: searchParams.getAll('district') || [],
    venue: searchParams.getAll('venue') || [],
    building: searchParams.getAll('building') || [],
    event: searchParams.getAll('event') || [],
    placementType: searchParams.getAll('placement') || [],
    source: searchParams.getAll('source') || []
  });

  useEffect(() => {
    // Load sample data
    const sampleData = generateSampleAnalytics();
    setAnalytics(sampleData);
    
    // Set default brand (can be customized via params)
    const brandSlug = searchParams.get('brand');
    if (brandSlug) {
      setBrand({ slug: brandSlug, name: 'Legends Real Estate' });
    } else {
      setBrand({ slug: 'all-brands', name: 'All Brands' });
    }
    
    setLoading(false);
  }, [searchParams]);

  const handleFilterChange = (filterType, values) => {
    setFilters(prev => ({ ...prev, [filterType]: values }));
    // Update URL params
    const params = new URLSearchParams();
    if (brand?.slug && brand.slug !== 'all-brands') {
      params.set('brand', brand.slug);
    }
    values.forEach(v => params.append(filterType, v));
    setSearchParams(params);
  };

  const handleClearFilters = () => {
    setFilters({ timeRange: ['month'], district: [], source: [] });
    const params = new URLSearchParams();
    if (brand?.slug && brand.slug !== 'all-brands') {
      params.set('brand', brand.slug);
    }
    setSearchParams(params);
  };

  if (loading || !analytics) {
    return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ── HERO SECTION (Campaign Intelligence Layer) ──────────────────────── */}
      <section className="border-b border-border/40 bg-gradient-to-br from-background to-muted/20 py-12 px-5">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Link to="/partners/brands" className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-primary transition-colors mb-6 group">
              <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
              Campaign Formats
            </Link>
            <span className="text-[11px] font-medium text-primary/70 uppercase tracking-[0.16em] block mb-3">Campaign Proof Layer</span>
            <h1 className="font-heading text-3xl md:text-4xl font-medium leading-[1.15] tracking-normal mb-3">
              See what downtown campaign behavior is actually converting.
            </h1>
            <p className="text-muted-foreground text-[15px] max-w-2xl leading-relaxed mb-6">
              Track how campaigns perform across buildings, venues, districts, QR touchpoints, map discovery, event response, and follow-through actions like visits, redemptions, and repeat engagement.
            </p>

            {/* Hero metadata strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30 border border-border/40">
                <span className="text-[12px] font-medium text-foreground">5</span>
                <span className="text-[11px] text-muted-foreground">Campaigns live</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30 border border-border/40">
                <span className="text-[12px] font-medium text-foreground">4</span>
                <span className="text-[11px] text-muted-foreground">Districts active</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30 border border-border/40">
                <span className="text-[12px] font-medium text-foreground">6</span>
                <span className="text-[11px] text-muted-foreground">Placement types</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30 border border-border/40">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B38F4F]" />
                <span className="text-[11px] text-muted-foreground">Live now</span>
              </div>
            </div>

            {/* CTA row */}
            <div className="flex flex-wrap gap-3">
              <Link to="/partners/brands" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-medium text-[13px] hover:bg-primary/90 transition-all">
                View campaign formats <ArrowRight className="w-4 h-4" />
              </Link>
              <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border/70 text-foreground font-medium text-[13px] hover:bg-muted/30 transition-all">
                Plan a campaign
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CAMPAIGN FORMAT FILTER RAIL ────────────────────────────────────── */}
      <section className="border-b border-border/40 bg-muted/10 px-5 py-6 sticky top-[68px] z-30">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
            {CAMPAIGN_FORMATS.map(fmt => (
              <motion.button
                key={fmt.id}
                onClick={() => {
                  setSelectedFormat(fmt.id);
                  setFilters(prev => ({ ...prev, campaignFormat: [fmt.id] }));
                  setSearchParams(new URLSearchParams({ ...Object.fromEntries(searchParams), format: fmt.id }));
                }}
                whileHover={{ scale: 1.02 }}
                className={`px-4 py-2.5 rounded-full text-[12px] font-medium whitespace-nowrap border transition-all flex items-center gap-2 shrink-0 ${
                  selectedFormat === fmt.id
                    ? 'border-primary/50 bg-primary/10 text-primary'
                    : 'border-border/40 text-muted-foreground hover:text-foreground'
                }`}
              >
                <span>{fmt.icon}</span>
                {fmt.label}
              </motion.button>
            ))}
            <button
              onClick={() => {
                setSelectedFormat('all');
                setFilters(prev => ({ ...prev, campaignFormat: ['all'] }));
                setSearchParams(new URLSearchParams());
              }}
              className={`px-4 py-2.5 rounded-full text-[12px] font-medium whitespace-nowrap border transition-all shrink-0 ml-2 ${
                selectedFormat === 'all'
                  ? 'border-primary/50 bg-primary/10 text-primary'
                  : 'border-border/40 text-muted-foreground hover:text-foreground'
              }`}
            >
              All formats
            </button>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT ───────────────────────────────────────────────────── */}
      <section className="py-12 px-5">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* ── SIDEBAR: FILTERS ──────────────────────────────────────── */}
            <div className="lg:col-span-1">
              <AnalyticsFiltersPanel
                activeFilters={filters}
                onFilterChange={handleFilterChange}
                onClearAll={handleClearFilters}
              />
            </div>

            {/* ── MAIN CONTENT ────────────────────────────────────────── */}
            <div className="lg:col-span-3 space-y-8">
              {/* KPI Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <AnalyticsKPICard label="Reach" value={analytics.reach} delta="+12%" deltaType="positive" />
                <AnalyticsKPICard label="Scans" value={analytics.scans} delta="+8%" deltaType="positive" />
                <AnalyticsKPICard label="Unlocks" value={analytics.unlocks} delta="+5%" deltaType="positive" />
                <AnalyticsKPICard label="Visits" value={analytics.visits} delta="-3%" deltaType="negative" />
              </div>

              {/* Secondary KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <AnalyticsKPICard label="Redemptions" value={analytics.redemptions} delta="+14%" deltaType="positive" />
                <AnalyticsKPICard label="Repeat Engagement" value={analytics.repeatEngagement} delta="+22%" deltaType="positive" />
                <AnalyticsKPICard label="Conversion Rate" value={`${analytics.conversionRate}%`} delta="+1.2%" deltaType="positive" />
              </div>

              {/* Funnel */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-lg border border-border/50 bg-card/40 p-6 md:p-8"
              >
                <AnalyticsFunnel data={analytics.funnel} />
              </motion.div>

              {/* Placement Intelligence (Heatmap) */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-lg border border-border/50 bg-card/40 p-6 md:p-8"
              >
                <div>
                  <h3 className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.1em] mb-1">
                    Placement Intelligence
                  </h3>
                  <p className="text-[13px] text-muted-foreground mb-6">
                    Campaign performance by placement type and district.
                  </p>
                </div>

                <div className="space-y-4">
                  {[
                    { name: 'Building QR', intensity: 92, type: 'QR touchpoint', trend: 'up' },
                    { name: 'Rainey District', intensity: 78, type: 'District activation', trend: 'up' },
                    { name: 'Venue Placement', intensity: 65, type: 'Venue partner', trend: 'stable' },
                    { name: 'Event Touchpoint', intensity: 52, type: 'Event marker', trend: 'up' }
                  ].map((p, idx) => (
                    <motion.div
                      key={p.name}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.35 + idx * 0.05 }}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div>
                          <span className="text-[13px] font-medium text-foreground">{p.name}</span>
                          <span className="text-[11px] text-muted-foreground ml-2">{p.type}</span>
                        </div>
                        <span className={`text-[11px] font-medium ${p.trend === 'up' ? 'text-[#B38F4F]' : 'text-muted-foreground'}`}>
                          {p.trend === 'up' ? '+12%' : 'Stable'}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-border/30 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${p.intensity}%` }}
                          transition={{ duration: 0.8, delay: 0.35 + idx * 0.05 }}
                          className="h-full rounded-full bg-gradient-to-r from-[#0B1F33] to-[#0B1F33]"
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-2">
                  <div className="text-[12px] text-muted-foreground">
                    <span className="font-medium text-foreground">Strongest placement:</span> Building QR in Rainey, 6–8pm
                  </div>
                  <div className="text-[12px] text-muted-foreground">
                    <span className="font-medium text-foreground">Emerging opportunity:</span> Event touchpoints converting 22% higher this week
                  </div>
                </div>
              </motion.div>

              {/* Per-Venue Performance */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="rounded-lg border border-border/50 bg-card/40 p-6 md:p-8"
              >
                <div className="mb-6">
                  <h3 className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.1em] mb-1">
                    Venue Performance
                  </h3>
                  <p className="text-[13px] text-muted-foreground">
                    Attributed foot traffic and peak engagement windows.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {VENUE_PERFORMANCE.map((v, idx) => (
                    <motion.div
                      key={v.name}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35 + idx * 0.04 }}
                      className="rounded-xl border border-border/30 bg-card/20 p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="font-medium text-foreground text-[13px]">{v.name}</div>
                          <div className="text-[11px] text-muted-foreground">{v.district}</div>
                        </div>
                        <span className={`text-[11px] font-medium px-2 py-1 rounded-full ${
                          v.trend === 'up' ? 'bg-[#0B1F33]/10 text-[#B38F4F]' : 'bg-muted/50 text-muted-foreground'
                        }`}>
                          {v.trend === 'up' ? '+18%' : 'Stable'}
                        </span>
                      </div>
                      <div className="space-y-2 text-[12px]">
                        <div className="flex justify-between text-muted-foreground">
                          <span>Attributed traffic</span>
                          <span className="font-medium text-foreground">{v.traffic}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>Peak window</span>
                          <span className="font-medium text-foreground">{v.peakTime}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Event Performance */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.38 }}
                className="rounded-lg border border-border/50 bg-card/40 p-6 md:p-8"
              >
                <div className="mb-6">
                  <h3 className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.1em] mb-1">
                    Event Campaign Performance
                  </h3>
                  <p className="text-[13px] text-muted-foreground">
                    Event-led campaigns: RSVPs, attendance, and downstream conversions.
                  </p>
                </div>

                <div className="space-y-3">
                  {EVENT_PERFORMANCE.map((e, idx) => (
                    <motion.div
                      key={e.name}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.38 + idx * 0.04 }}
                      className="rounded-xl border border-border/30 bg-card/20 p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="font-medium text-foreground text-[13px]">{e.name}</div>
                          <div className="text-[11px] text-muted-foreground">{e.type} Campaign</div>
                        </div>
                        <span className="text-[12px] font-semibold text-[#B38F4F]">{e.lift}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-[12px]">
                        <div className="space-y-0.5">
                          <div className="text-muted-foreground">RSVPs</div>
                          <div className="font-semibold text-foreground">{e.rsvps}</div>
                        </div>
                        <div className="space-y-0.5">
                          <div className="text-muted-foreground">Attended</div>
                          <div className="font-semibold text-foreground">{e.attendance}</div>
                        </div>
                        <div className="space-y-0.5">
                          <div className="text-muted-foreground">Rate</div>
                          <div className="font-semibold text-foreground">{Math.round((e.attendance / e.rsvps) * 100)}%</div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Source Attribution Table */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.41 }}
                className="rounded-lg border border-border/50 bg-card/40 p-6 md:p-8"
              >
                <AnalyticsAttributionTable data={analytics.attribution} />
              </motion.div>

              {/* Campaign Planning Insights */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.44 }}
                className="space-y-3"
              >
                <h3 className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.1em]">
                  Campaign Planning Insights
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
                    <div className="flex items-start gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <span className="text-[11px] font-semibold text-primary">Strong placement</span>
                    </div>
                    <p className="text-[13px] text-foreground leading-relaxed">
                      Building QR is outperforming map discovery for confirmed visits. Consider increasing QR placement across new buildings.
                    </p>
                  </div>
                  <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
                    <div className="flex items-start gap-2 mb-2">
                      <Zap className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <span className="text-[11px] font-semibold text-primary">Format opportunity</span>
                    </div>
                    <p className="text-[13px] text-foreground leading-relaxed">
                      Resident activation campaigns are converting better in Seaholm. Event-led campaigns show strongest repeat engagement.
                    </p>
                  </div>
                  <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
                    <div className="flex items-start gap-2 mb-2">
                      <Users className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <span className="text-[11px] font-semibold text-primary">District performance</span>
                    </div>
                    <p className="text-[13px] text-foreground leading-relaxed">
                      Rainey district generates 40% more scans but Seaholm shows the strongest redemption and repeat visit rate.
                    </p>
                  </div>
                  <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
                    <div className="flex items-start gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <span className="text-[11px] font-semibold text-primary">Next step</span>
                    </div>
                    <p className="text-[13px] text-foreground leading-relaxed">
                      Legends Real Estate and Hotel Van Zandt are your strongest partners. Consider expanding utility-led support in Congress district.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA SECTION (Campaign Planning) ────────────────────────────────── */}
      <section className="border-t border-border/40 py-12 px-5 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <span className="text-[11px] font-medium text-primary/70 uppercase tracking-[0.16em] block mb-3">Ready to Invest</span>
              <h2 className="font-heading text-2xl md:text-3xl font-medium leading-[1.2] tracking-normal mb-3">
                Plan your next campaign.
              </h2>
              <p className="text-muted-foreground text-[14px] leading-relaxed">
                Use these insights to choose the right campaign format, placements, and measurement approach for your next activation.
              </p>
            </div>
            <div className="flex flex-col md:flex-row gap-3">
              <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-medium text-[13px] hover:bg-primary/90 transition-all">
                Plan a campaign <ArrowRight className="w-4 h-4" />
              </button>
              <Link to="/partners/brands" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border/70 text-foreground font-medium text-[13px] hover:bg-muted/30 transition-all">
                View campaign formats
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
