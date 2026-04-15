import { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, MapPin, Users, TrendingUp, ArrowRight } from 'lucide-react';
import PartnerHero from '@/components/partner/PartnerHero';
import HowItWorksRail from '@/components/partner/HowItWorksRail';
import SelectorCards from '@/components/partner/SelectorCards';
import ProofGrid from '@/components/partner/ProofGrid';
import LiveActivityFeed from '@/components/partner/LiveActivityFeed';
import PlanningForm from '@/components/partner/PlanningForm';
import PartnerCTASection from '@/components/partner/PartnerCTASection';
import { PARTNER_SPACING, PARTNER_GRIDS } from '@/lib/partner-system';
import FAQAccordionBlock from '@/components/ui/FAQAccordionBlock';
import { FAQ_RESIDENTIAL } from '@/lib/faq-partner-data';

const RESIDENTIAL_FEATURES = [
  {
    id: 'resident-activation',
    label: 'Resident Activation',
    description: 'Residents discover venues, events, and perks directly from your building app or onboarding',
    stats: [
      { label: 'Avg engagement', value: '73%' },
      { label: 'Repeat usage', value: '52%' },
    ],
  },
  {
    id: 'venue-partnership',
    label: 'Venue Partnerships',
    description: 'Negotiate exclusive perks for residents at nearby restaurants, fitness, wellness',
    stats: [
      { label: 'Partner venues', value: '12+' },
      { label: 'Active perks', value: '28' },
    ],
  },
  {
    id: 'qr-entry',
    label: 'QR Entry Integration',
    description: 'Residents tap a QR code to unlock their resident status and perks at each venue',
    stats: [
      { label: 'Scans per week', value: '2k+' },
      { label: 'Redemption rate', value: '34%' },
    ],
  },
];

const HOW_IT_WORKS = [
  { icon: '🏢', title: 'Building setup', description: 'Configure your property and resident details' },
  { icon: '📍', title: 'Map placement', description: 'Your building appears with resident layer on the map' },
  { icon: '👥', title: 'Resident access', description: 'Residents get exclusive perks at partner venues' },
  { icon: '📊', title: 'Live dashboard', description: 'Track engagement and venue partnerships in real time' },
  { icon: '🎁', title: 'Negotiation', description: 'We help arrange new venue partnerships' },
];

const METRICS = [
  { label: 'Resident activation', value: '73%', change: '+12% MoM' },
  { label: 'Avg repeat usage', value: '52%', change: '+8% MoM', positive: true },
  { label: 'Venue partnerships', value: '12+', change: 'Growing' },
  { label: 'Monthly scans', value: '2k+', change: '+34% MoM', positive: true },
];

const ACTIVITIES = [
  { action: 'Resident scanned perk at Banger\'s', source: 'Venue QR', time: '2 min ago' },
  { action: 'New venue partnership: Equinox', source: 'Admin', time: '15 min ago' },
  { action: 'Resident saved event at Rainey St', source: 'Map', time: '34 min ago' },
  { action: 'Redemption: 20% off at The Paseo', source: 'Venue', time: '1 hr ago' },
  { action: 'New building onboarded: Four Seasons Residences', source: 'Admin', time: '3 hrs ago' },
  { action: 'Resident engagement: +180% this month', source: 'Analytics', time: '4 hrs ago' },
];

export default function ResidentialPartner() {
  const [selectedFeature, setSelectedFeature] = useState('resident-activation');

  return (
    <div className="pt-[68px] min-h-screen bg-background">
      {/* Hero */}
      <PartnerHero
        eyebrow="Residential Partner"
        headline="Activate your residents with local discovery"
        description="Connect your building's residents to downtown venues, events, and exclusive perks. Drive engagement, retention, and neighborhood integration."
        primaryCTA="View system"
        primaryCTAHref="#map"
        secondaryCTA="See examples"
        secondaryCTAHref="#examples"
        stats={[
          { label: 'Resident engagement', value: '73%' },
          { label: 'Active properties', value: '28+' },
          { label: 'Partner venues', value: '120+' },
        ]}
        preview={
          <div className="aspect-[4/3] rounded-2xl border border-[#e8e5df] bg-gradient-to-br from-[#f5f3ef] to-[#efeae0] flex items-center justify-center">
            <div className="text-center">
              <Building2 className="w-12 h-12 text-[#8d887f] mx-auto mb-3" />
              <p className="text-[13px] font-semibold text-[#4a463f]">Building + Resident Layer Preview</p>
              <p className="text-[11px] text-[#8d887f] mt-1">Map integration coming in next section</p>
            </div>
          </div>
        }
      />

      {/* Partner model */}
      <section className={`${PARTNER_SPACING.sectionVertical} border-b border-[#e8e5df]`}>
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-[32px] md:text-[40px] font-bold text-[#111] leading-tight tracking-tight mb-12">
            How it works for residents
          </h2>

          <SelectorCards
            items={RESIDENTIAL_FEATURES}
            selectedId={selectedFeature}
            onSelect={(item) => setSelectedFeature(item.id)}
            columns={3}
          />

          {/* Expanded detail for selected feature */}
          {selectedFeature && (
            <motion.div
              key={selectedFeature}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-12 p-8 rounded-2xl border border-[#e8e5df] bg-white"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-[20px] font-bold text-[#111] mb-3">
                    {RESIDENTIAL_FEATURES.find((f) => f.id === selectedFeature)?.label}
                  </h3>
                  <p className="text-[14px] text-[#6f6b65] leading-relaxed">
                    {RESIDENTIAL_FEATURES.find((f) => f.id === selectedFeature)?.description}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {RESIDENTIAL_FEATURES.find((f) => f.id === selectedFeature)?.stats.map((stat, i) => (
                    <div key={i} className="p-4 rounded-xl bg-[#f5f3ef]">
                      <div className="text-[16px] font-bold text-[#111]">{stat.value}</div>
                      <div className="text-[11px] text-[#8d887f] mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Map placement */}
      <section id="map" className={`${PARTNER_SPACING.sectionVertical} border-b border-[#e8e5df]`}>
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-[32px] md:text-[40px] font-bold text-[#111] leading-tight tracking-tight mb-8">
            Map visibility
          </h2>
          <p className="text-[15px] text-[#6f6b65] mb-12 max-w-2xl">
            Your building appears on the map with a resident layer. Residents can tap to view exclusive perks at nearby venues and save favorites.
          </p>

          <div className="aspect-[16/9] rounded-2xl border border-[#e8e5df] bg-gradient-to-br from-[#f5f3ef] to-[#efeae0] flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-[#8d887f] mx-auto mb-3" />
              <p className="text-[13px] font-semibold text-[#4a463f]">Interactive Map Placement</p>
              <p className="text-[11px] text-[#8d887f] mt-1">Your building + resident discovery layer</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <HowItWorksRail steps={HOW_IT_WORKS} />

      {/* Use cases */}
      <section className={`${PARTNER_SPACING.sectionVertical} border-b border-[#e8e5df]`}>
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-[32px] md:text-[40px] font-bold text-[#111] leading-tight tracking-tight mb-12">
            Use cases
          </h2>

          <div className={PARTNER_GRIDS.gridUseCaseTwoCol}>
            {[
              {
                title: 'Resident onboarding',
                desc: 'New residents explore neighborhoods on day one and discover 12+ exclusive perks immediately.',
                metric: '73% engagement',
              },
              {
                title: 'Retention & community',
                desc: 'Residents stay engaged with weekly venue partnerships, events, and exclusive offers.',
                metric: '52% repeat usage',
              },
              {
                title: 'Venue partnerships',
                desc: 'Negotiate exclusive resident perks at nearby restaurants, fitness, and wellness venues.',
                metric: '120+ venues',
              },
              {
                title: 'Event activation',
                desc: 'Promote resident-exclusive events and experiences across your community.',
                metric: '28+ active perks',
              },
            ].map((use, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="p-6 rounded-2xl border border-[#e8e5df] bg-white hover:border-[#111] transition-colors"
              >
                <h3 className="text-[16px] font-bold text-[#111] mb-2">{use.title}</h3>
                <p className="text-[13px] text-[#6f6b65] leading-relaxed mb-4">{use.desc}</p>
                <div className="flex items-center gap-2 text-[12px] font-bold text-[#111]">
                  <TrendingUp className="w-3.5 h-3.5" />
                  {use.metric}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Proof */}
      <ProofGrid metrics={METRICS} />

      {/* Live activity */}
      <LiveActivityFeed activities={ACTIVITIES} />

      {/* Planning */}
      <PlanningForm partnerType="Residential Property" />

      {/* FAQ */}
      <FAQAccordionBlock
        sectionEyebrow="Residential FAQs"
        sectionTitle="Questions about residential use"
        sectionIntro="Residential is how buildings connect residents to the downtown layer in a way that feels useful every day."
        items={FAQ_RESIDENTIAL}
        styleVariant="default"
        showNumbers={false}
        allowMultipleOpen={false}
        defaultOpenIndex={0}
        pageType="residential"
        backgroundVariant="light"
      />

      {/* Closing CTA */}
      <PartnerCTASection
        headline="Ready to activate your residents?"
        description="Let's connect your building to the Downtown Perks ecosystem."
        primaryCTA="Get started"
        primaryHref="#form"
        secondaryLink={{ label: 'View other partners', href: '/partners' }}
      />
    </div>
  );
}