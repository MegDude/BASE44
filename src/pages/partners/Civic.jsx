import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, CheckCircle2 } from 'lucide-react';
import PartnerHero from '@/components/partner/PartnerHero';
import ProofGrid from '@/components/partner/ProofGrid';
import LiveActivityFeed from '@/components/partner/LiveActivityFeed';
import PlanningForm from '@/components/partner/PlanningForm';
import PartnerCTASection from '@/components/partner/PartnerCTASection';
import PreviewModule from '@/components/partner/PreviewModule';
import { MapPin as MapPinIcon } from 'lucide-react';
import { PARTNER_SPACING, PARTNER_GRIDS } from '@/lib/partner-system';
import FAQAccordionBlock from '@/components/ui/FAQAccordionBlock';
import { FAQ_CIVIC } from '@/lib/faq-partner-data';

const CIVIC_FORMATS = [
  {
    id: 'district-visibility',
    label: 'District visibility layer',
    description: 'Always-on civic presence across a neighborhood, district, or downtown corridor.',
    bestFor: 'Always-on civic presence',
    placements: 'Map layer, district pins, recurring civic highlights, partner adjacency',
    activation: 'Always-on district visibility, civic information, or neighborhood utility layer',
    kpi: 'Map opens, district engagement, repeat discovery, attributed visits',
    body: 'Use this format when the goal is to make a district, organization, or public-serving layer easier to see and navigate every day. This works best for groups that need a steady downtown presence instead of a one-time campaign.',
  },
  {
    id: 'event-activation',
    label: 'Event-led civic activation',
    description: 'Festivals, downtown programs, public events, cultural moments, and RSVP-driven participation.',
    bestFor: 'Event-driven participation',
    placements: 'Live event markers, RSVP layer, timed offers or prompts, event detail pages',
    activation: 'Event-linked civic promotion or public participation flow',
    kpi: 'Event opens, RSVPs, attendance, participation actions, downstream visits',
    body: 'Use this format when the goal is to drive turnout or make a public moment easier to join. This works well for civic organizers, cultural districts, and downtown partners activating around specific events or programming windows.',
  },
  {
    id: 'utility-campaign',
    label: 'Neighborhood utility campaign',
    description: 'Public-service information, wayfinding, recurring neighborhood tools, and useful downtown guidance.',
    bestFor: 'Useful public guidance',
    placements: 'Map utility placement, building adjacency, QR surfaces, service-led CTA, helpful neighborhood prompts',
    activation: 'Useful civic action, service visibility, or public information layer',
    kpi: 'Saves, scans, visit intent, repeat engagement, utility use',
    body: 'Use this format when the experience should feel helpful first. This is ideal for civic groups offering guidance, wayfinding, service information, neighborhood discovery, or practical local resources.',
  },
  {
    id: 'building-outreach',
    label: 'Building and resident outreach layer',
    description: 'Move-ins, resident welcome flows, district education, local discovery, and recurring neighborhood participation.',
    bestFor: 'Resident and building outreach',
    placements: 'Lobby QR, welcome insert, building signage, resident flows, district prompts',
    activation: 'Resident-facing civic onboarding or district participation layer',
    kpi: 'Building response, scans, opt-ins, resident interaction, repeat local engagement',
    body: 'Use this format when the opportunity starts where people live. This works best for civic organizations that want to connect residents to neighborhood resources, public programming, district events, or useful local activity through residential buildings.',
  },
  {
    id: 'sponsored-moment',
    label: 'Sponsored public moment',
    description: 'Special downtown initiatives, seasonal programming, sponsored activations, and collaborative civic moments.',
    bestFor: 'Sponsored activation',
    placements: 'Feature placement, timed marker priority, sponsor recognition, event-linked context',
    activation: 'Timed civic spotlight or co-branded participation moment',
    kpi: 'Opens, engagement rate, attendance, sponsor visibility, repeat action',
    body: 'Use this format when a public moment needs more people to notice it, understand it, and show up. This is best for limited-time civic moments that should feel easy to find and useful in everyday downtown life.',
  },
];

const FORMAT_SELECTOR = [
  {
    id: 'always-on',
    label: 'Always-on district presence',
    matches: ['district-visibility'],
  },
  {
    id: 'event-driven',
    label: 'Event-driven participation',
    matches: ['event-activation', 'sponsored-moment'],
  },
  {
    id: 'resident-outreach',
    label: 'Resident and building outreach',
    matches: ['building-outreach'],
  },
  {
    id: 'public-guidance',
    label: 'Useful public guidance',
    matches: ['utility-campaign'],
  },
];

const CIVIC_EXAMPLES = [
  {
    name: 'Downtown Austin Alliance',
    type: 'District coordination',
    desc: 'Rainey Street visibility layer showing events, venues, and district happenings',
    proof: '↑ 340% district opens',
  },
  {
    name: 'Visit Austin',
    type: 'Visitor guidance',
    desc: 'Downtown attraction discovery and helpful wayfinding for visitors',
    proof: '↑ 2.1k attributed visits',
  },
  {
    name: 'Waterloo Greenway',
    type: 'Public space activation',
    desc: 'Event-led civic participation and programming visibility',
    proof: '↑ 920 event RSVPs',
  },
  {
    name: 'Rainey Street Group',
    type: 'Venue coordination',
    desc: 'District-wide venue partnership and event layer',
    proof: '↑ 48% repeat discovery',
  },
  {
    name: 'Red River',
    type: 'Music district activation',
    desc: 'Live event and venue discovery across the music district',
    proof: '↑ 1.8k monthly scans',
  },
  {
    name: 'Wellness Loop',
    type: 'Wellness coordination',
    desc: 'Connected wellness and fitness experience across downtown',
    proof: '↑ 340 attributed visits',
  },
];

const CIVIC_METRICS = [
  { label: 'Map opens', value: '28k+', change: '+45% MoM', positive: true },
  { label: 'District engagement', value: '14k+', change: '+23% MoM', positive: true },
  { label: 'Event RSVPs', value: '3.2k', change: '+67% MoM', positive: true },
  { label: 'Attributed visits', value: '8.4k', change: '+31% MoM', positive: true },
];

const CIVIC_ACTIVITIES = [
  { action: 'Resident RSVP\'d for Waterloo Greenway event', source: 'Event Marker', time: '5 min ago' },
  { action: 'Downtown Austin Alliance district visibility updated', source: 'Admin', time: '34 min ago' },
  { action: 'Visitor scanned Rainey Street wayfinding QR', source: 'District Utility', time: '1 hr ago' },
  { action: 'Red River live event: 8 venues now showing', source: 'District', time: '3 hrs ago' },
  { action: 'Wellness Loop: +12 new resident enrollments', source: 'Building Outreach', time: '4 hrs ago' },
  { action: 'Visit Austin: +340 attributed downtown visits', source: 'Analytics', time: '6 hrs ago' },
];

export default function CivicPartner() {
  const [selectedFormat, setSelectedFormat] = useState('district-visibility');
  const [selectedSelector, setSelectedSelector] = useState(null);

  const matchingFormats = selectedSelector
    ? FORMAT_SELECTOR.find((s) => s.id === selectedSelector)?.matches || []
    : [];

  return (
    <div className="pt-[68px] min-h-screen bg-background">
      {/* Hero */}
      <PartnerHero
        eyebrow="Civic"
        headline="A civic layer built for how downtown actually works."
        description="Downtown Perks helps civic organizations surface events, districts, public moments, and local participation across one live downtown map. Make what is happening easier to find, easier to join, and easier to measure."
        primaryCTA="Explore civic formats"
        primaryCTAHref="#formats"
        secondaryCTA="View civic analytics"
        secondaryCTAHref="#proof"
        stats={[
          { label: 'Monthly opens', value: '28k+' },
          { label: 'Active civic orgs', value: '8+' },
          { label: 'RSVPs / month', value: '3.2k+' },
        ]}
        preview={
          <PreviewModule type="civic" icon="📍" title="Civic Layer Preview" description="Districts, events, and public participation" />
        }
      />

      {/* Intro section */}
      <section className={`${PARTNER_SPACING.sectionVertical} border-b border-[#0B1F33]/8`}>
        <div className="max-w-7xl mx-auto px-5">
          <h2 className="text-[32px] md:text-[40px] font-bold text-[#0B1F33] leading-tight tracking-normal mb-4">
            Civic formats for downtown participation
          </h2>
          <p className="text-[16px] text-[#6f6b65] leading-relaxed max-w-2xl">
            Choose the civic format that fits the district, moment, initiative, or public objective. Every format shows up on the map where people are already looking.
          </p>
        </div>
      </section>

      {/* Civic formats */}
      <section id="formats" className={`${PARTNER_SPACING.sectionVertical} border-b border-[#0B1F33]/8`}>
        <div className="max-w-7xl mx-auto px-5">
          <div className="space-y-6">
            {CIVIC_FORMATS.map((format, i) => (
              <motion.button
                key={format.id}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                onClick={() => setSelectedFormat(format.id)}
                className={`w-full text-left p-6 rounded-lg border transition-all duration-200 ${
                  selectedFormat === format.id
                    ? 'border-[#0B1F33] bg-[#0B1F33] text-white shadow-lg'
                    : 'border-[#0B1F33]/8 bg-white hover:border-[#B38F4F]/45'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="text-[18px] font-bold leading-snug">{format.label}</h3>
                  <div className={`text-[12px] font-medium px-3 py-1 rounded-full ${
                    selectedFormat === format.id
                      ? 'bg-white/20 text-white'
                      : 'bg-[#F7F8FB] text-[#0B1F33]/50'
                  }`}>
                    {format.bestFor}
                  </div>
                </div>

                <p className={`text-[14px] leading-relaxed mb-4 ${
                  selectedFormat === format.id ? 'text-white/80' : 'text-[#6f6b65]'
                }`}>
                  {format.description}
                </p>

                {/* Expanded details */}
                {selectedFormat === format.id && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 pt-6 border-t border-current border-opacity-20 space-y-4"
                  >
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-[.12em] text-current text-opacity-60 mb-2">
                        Core placements
                      </div>
                      <p className="text-[13px] text-current text-opacity-80">{format.placements}</p>
                    </div>

                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-[.12em] text-current text-opacity-60 mb-2">
                        Key metrics
                      </div>
                      <p className="text-[13px] text-current text-opacity-80">{format.kpi}</p>
                    </div>

                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-[.12em] text-current text-opacity-60 mb-2">
                        How it works
                      </div>
                      <p className="text-[13px] text-current text-opacity-80 leading-relaxed">{format.body}</p>
                    </div>
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Format selector helper */}
      <section className={`${PARTNER_SPACING.sectionVertical} border-b border-[#0B1F33]/8`}>
        <div className="max-w-7xl mx-auto px-5">
          <h3 className="text-[24px] md:text-[28px] font-bold text-[#0B1F33] leading-tight tracking-normal mb-8">
            Which civic format is right?
          </h3>
          <p className="text-[15px] text-[#6f6b65] mb-8 max-w-2xl">
            Select the format that matches your goal. We'll highlight the best fit.
          </p>

          <div className={PARTNER_GRIDS.gridCardCompact}>
            {FORMAT_SELECTOR.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedSelector(selectedSelector === item.id ? null : item.id)}
                className={`p-4 rounded-lg border text-[12px] font-medium text-center transition-all ${
                  selectedSelector === item.id
                    ? 'border-[#0B1F33] bg-[#0B1F33] text-white'
                    : 'border-[#0B1F33]/8 bg-white text-[#0B1F33]/70 hover:border-[#B38F4F]/45'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {selectedSelector && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 p-6 rounded-lg bg-[#F7F8FB] border border-[#0B1F33]/8"
            >
              <p className="text-[13px] text-[#0B1F33]/70">
                You selected <strong>{FORMAT_SELECTOR.find((s) => s.id === selectedSelector)?.label}</strong>. This matches:
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                {matchingFormats.map((formatId) => {
                  const format = CIVIC_FORMATS.find((f) => f.id === formatId);
                  return (
                    <button
                      key={formatId}
                      onClick={() => setSelectedFormat(formatId)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#0B1F33]/8 text-[11px] font-medium text-[#0B1F33] hover:border-[#0B1F33] transition-colors"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      {format?.label}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Civic examples */}
      <section className={`${PARTNER_SPACING.sectionVertical} border-b border-[#0B1F33]/8`}>
        <div className="max-w-7xl mx-auto px-5">
          <h2 className="text-[32px] md:text-[40px] font-bold text-[#0B1F33] leading-tight tracking-normal mb-4">
            See how civic participation comes to life on the map
          </h2>
          <p className="text-[15px] text-[#6f6b65] mb-12 max-w-2xl">
            Civic partnerships in Downtown Perks should feel useful, timely, and easy to act on. These examples show how events, districts, neighborhood guidance, and public participation appear across the map, buildings, and live downtown flow.
          </p>

          <div className={PARTNER_GRIDS.gridCardThreeCol}>
            {CIVIC_EXAMPLES.map((example, i) => (
              <motion.a
                key={i}
                href="/map?mode=partner&tab=map&filter=Events"
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="p-6 rounded-lg border border-[#0B1F33]/8 bg-white hover:border-[#0B1F33] hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-[16px] font-bold text-[#0B1F33] mb-0.5">{example.name}</h3>
                    <div className="text-[11px] font-bold uppercase tracking-[.12em] text-[#0B1F33]/50">
                      {example.type}
                    </div>
                  </div>
                  <MapPinIcon className="w-5 h-5 text-[#B38F4F]" />
                </div>

                <p className="text-[13px] text-[#6f6b65] leading-relaxed mb-4">{example.desc}</p>

                <div className="flex items-center gap-1.5 text-[12px] font-bold text-[#0B1F33]">
                  <TrendingUp className="w-3.5 h-3.5" />
                  {example.proof}
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Proof */}
      <ProofGrid id="proof" metrics={CIVIC_METRICS} />

      {/* Live activity */}
      <LiveActivityFeed activities={CIVIC_ACTIVITIES} />

      {/* Planning */}
      <PlanningForm partnerType="Civic Organization" />

      {/* FAQ */}
      <FAQAccordionBlock
        sectionEyebrow="Civic FAQs"
        sectionTitle="Questions about civic participation and visibility"
        sectionIntro="Civic partners use Downtown Perks to make what is happening downtown easier to find, easier to join, and easier to measure."
        items={FAQ_CIVIC}
        styleVariant="default"
        showNumbers={false}
        allowMultipleOpen={false}
        defaultOpenIndex={0}
        pageType="civic"
        backgroundVariant="light"
      />

      {/* Closing CTA */}
      <PartnerCTASection
        headline="Build civic participation into the downtown moment."
        description="Downtown Perks helps civic organizations meet people while they are already downtown and deciding what to do. Start with the format that fits the initiative, then make it easy to find, easy to join, and easy to understand what worked."
        primaryCTA="Check availability"
        primaryHref="#form"
        secondaryLink={{ label: 'Become a civic partner', href: '#form' }}
      />
    </div>
  );
}
