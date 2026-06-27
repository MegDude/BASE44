import { useState } from 'react';
import { motion } from 'framer-motion';
import PartnerHero from '@/components/partner/PartnerHero';
import PlanningForm from '@/components/partner/PlanningForm';
import PartnerCTASection from '@/components/partner/PartnerCTASection';
import PartnerMapIntelligenceLayer from '@/components/partner/PartnerMapIntelligenceLayer';
import { PARTNER_SPACING } from '@/lib/partner-system';
import FAQAccordionBlock from '@/components/ui/FAQAccordionBlock';
import { FAQ_CIVIC } from '@/lib/faq-partner-data';

const CIVIC_FORMATS = [
  {
    id: 'district-visibility',
    eyebrow: 'Always-on',
    label: 'District visibility layer',
    description: 'Always-on civic presence across a neighborhood, district, or downtown corridor.',
    bestFor: 'Always-on civic presence',
    placements: 'Map layer, district pins, recurring civic highlights, partner adjacency',
    activation: 'Always-on district visibility, civic information, or useful neighborhood guide',
    kpi: 'Map opens, saved places, repeat use, visits',
    body: 'Use this format when the goal is to make a district, organization, or public-serving guide easier to see and navigate every day. This works best for groups that need a steady downtown presence instead of a one-time push.',
  },
  {
    id: 'event-moment',
    eyebrow: 'Event-driven',
    label: 'Event-led civic moment',
    description: 'Festivals, downtown programs, public events, cultural moments, and RSVP-driven participation.',
    bestFor: 'Event-driven participation',
    placements: 'Live event markers, RSVP layer, timed offers or prompts, event detail pages',
    activation: 'Event-linked public information and participation flow',
    kpi: 'Event opens, RSVPs, attendance, participation actions, downstream visits',
    body: 'Use this format when the goal is to drive turnout or make a public moment easier to join. This works well for civic organizers, cultural districts, and downtown partners activating around specific events or programming windows.',
  },
  {
    id: 'utility-guide',
    eyebrow: 'Public guidance',
    label: 'Neighborhood utility guide',
    description: 'Public-service information, wayfinding, recurring neighborhood tools, and useful downtown guidance.',
    bestFor: 'Useful public guidance',
    placements: 'Map utility placement, building adjacency, QR surfaces, service-led CTA, helpful neighborhood prompts',
    activation: 'Useful civic action, service visibility, or public information guide',
    kpi: 'Saves, scans, planned visits, return use, guide use',
    body: 'Use this format when the experience should feel helpful first. This is ideal for civic groups offering guidance, wayfinding, service information, neighborhood discovery, or practical local resources.',
  },
  {
    id: 'building-outreach',
    eyebrow: 'Resident outreach',
    label: 'Building and resident outreach layer',
    description: 'Move-ins, resident welcome flows, district education, local discovery, and recurring neighborhood participation.',
    bestFor: 'Resident and building outreach',
    placements: 'Lobby QR, welcome insert, building signage, resident flows, district prompts',
    activation: 'Resident-facing civic welcome or district participation guide',
    kpi: 'Building response, scans, opt-ins, resident use, repeat local use',
    body: 'Use this format when the opportunity starts where people live. This works best for civic organizations that want to connect residents to neighborhood resources, public programming, district events, or useful local activity through residential buildings.',
  },
  {
    id: 'sponsored-moment',
    eyebrow: 'Sponsored',
    label: 'Sponsored public moment',
    description: 'Special downtown initiatives, seasonal programming, sponsored moments, and collaborative civic moments.',
    bestFor: 'Sponsored moment',
    placements: 'Feature placement, timed marker priority, sponsor recognition, event-linked context',
    activation: 'Timed civic spotlight or co-branded public moment',
    kpi: 'Opens, attendance, sponsor visibility, repeat action',
    body: 'Use this format when a public moment needs more people to notice it, understand it, and show up. This is best for limited-time civic moments that should feel easy to find and useful in everyday downtown life.',
  },
];

const CIVIC_EXAMPLES = [
  {
    name: 'Downtown Austin Alliance',
    type: 'District coordination',
    desc: 'Rainey Street layer showing events, venues, and district happenings',
    proof: 'More district opens',
  },
  {
    name: 'Visit Austin',
    type: 'Visitor guidance',
    desc: 'Downtown attraction discovery and helpful wayfinding for visitors',
    proof: 'More visits from nearby discovery',
  },
  {
    name: 'Waterloo Greenway',
    type: 'Public space programming',
    desc: 'Event-led civic participation and programming visibility',
    proof: 'More event RSVPs',
  },
  {
    name: 'Rainey Street Group',
    type: 'Venue coordination',
    desc: 'District-wide venue partnership and event layer',
    proof: 'More repeat use',
  },
  {
    name: 'Red River',
    type: 'Music district guide',
    desc: 'Live event and venue discovery across the music district',
    proof: 'More monthly scans',
  },
  {
    name: 'Wellness Loop',
    type: 'Wellness coordination',
    desc: 'Connected wellness and fitness experience across downtown',
    proof: 'More visits after class',
  },
];

const CIVIC_PLANNING_METRICS = [
  {
    label: 'Map opens',
    value: 'Monthly',
    detail: 'What people open once resident buildings, public QR surfaces, and event markers are live.',
  },
  {
    label: 'District use',
    value: 'By district',
    detail: 'Saves, taps, and repeat guide use from residents and visitors already browsing downtown.',
  },
  {
    label: 'Event RSVPs',
    value: 'Events',
    detail: 'RSVPs for civic programming with map placement, useful prompts, and building outreach.',
  },
  {
    label: 'Attributed visits',
    value: 'Visits',
    detail: 'Visits when wayfinding, nearby places, and event context are connected in one flow.',
  },
];

const CIVIC_ROLLOUT_NOTES = [
  {
    action: 'Waterloo Greenway event interest appears from residents already using the map.',
    source: 'Event marker',
    window: 'First 30 days',
  },
  {
    action: 'Downtown Austin Alliance district updates become easier to find from public and residential entry points.',
    source: 'District layer',
    window: 'First 60 days',
  },
  {
    action: 'Rainey Street wayfinding QR scans create repeat utility use instead of one-time awareness.',
    source: 'Public guidance',
    window: 'Ongoing',
  },
  {
    action: 'Red River programming can be grouped by venue, time, and resident proximity.',
    source: 'Event-led moment',
    window: 'Event windows',
  },
  {
    action: 'Building outreach connects move-ins, welcome flows, and neighborhood resources.',
    source: 'Resident outreach',
    window: 'Rollout phase',
  },
  {
    action: 'Visit Austin and civic partners can compare which public moments earn attention and action.',
    source: 'Monthly review',
    window: 'Monthly review',
  },
];

const CIVIC_MAP_POINTS = [
  {
    id: 'waterloo-greenway',
    name: 'Waterloo Greenway',
    type: 'Public programming',
    district: 'Red River',
    lat: 30.2701,
    lng: -97.7361,
    scans: 920,
    saves: 268,
    redemptions: 134,
    signal: 'Event discovery and RSVP interest across nearby residents.',
  },
  {
    id: 'downtown-austin-alliance',
    name: 'Downtown Austin Alliance',
    type: 'District layer',
    district: 'Congress',
    lat: 30.2672,
    lng: -97.7431,
    scans: 1280,
    saves: 344,
    redemptions: 186,
    signal: 'District visibility for events, services, and public-facing moments.',
  },
  {
    id: 'red-river-cultural-district',
    name: 'Red River Cultural District',
    type: 'Music district',
    district: 'Red River',
    lat: 30.2678,
    lng: -97.7364,
    scans: 760,
    saves: 211,
    redemptions: 92,
    signal: 'Live music, venue activity, and walkable plans nearby.',
  },
];

const CIVIC_NEARBY_POINTS = [
  { name: 'Rainey Street', lat: 30.2588, lng: -97.7385 },
  { name: 'Republic Square', lat: 30.2673, lng: -97.7464 },
  { name: 'Congress Avenue', lat: 30.2645, lng: -97.7432 },
  { name: 'Lady Bird Lake', lat: 30.2615, lng: -97.7458 },
];

export default function CivicPartner() {
  const [selectedCivicPoint, setSelectedCivicPoint] = useState(CIVIC_MAP_POINTS[0]);
  const [activeFormatIndex, setActiveFormatIndex] = useState(0);
  const activeFormat = CIVIC_FORMATS[activeFormatIndex];

  return (
    <div className="dp-partner-page min-h-screen bg-white pt-[68px] text-[#0B1F33]">
      {/* Hero */}
      <PartnerHero
        eyebrow="Civic"
        headline="A civic layer built for how downtown actually works."
        description="Downtown Perks helps civic organizations surface events, districts, public moments, and local participation across one live downtown map. Make what is happening easier to find, easier to join, and easier to review."
        primaryCTA="Explore civic formats"
        primaryCTAHref="#formats"
        secondaryCTA="View civic results"
        secondaryCTAHref="#proof"
      />

      <section id="civic-map" className={`${PARTNER_SPACING.sectionVertical} border-b border-[#0B1F33]/8`}>
        <div className="mx-auto max-w-7xl px-5">
          <div className="mb-8 max-w-3xl">
            <span className="dp-label mb-3 block">Civic map layer</span>
            <h2>Help more people discover what is happening downtown.</h2>
            <p className="mt-4 max-w-2xl text-[16px] leading-[1.6] text-[#425466]">
              Civic moments work best when they appear where people are already deciding what to do, where to go, and what is worth joining nearby.
            </p>
          </div>
          <PartnerMapIntelligenceLayer
            activeId={selectedCivicPoint.id}
            caption="Public participation"
            insight="Districts, events, public spaces, and cultural moments appear inside the same live downtown map residents already use."
            kind="brand"
            nearby={CIVIC_NEARBY_POINTS}
            points={CIVIC_MAP_POINTS}
            onSelect={setSelectedCivicPoint}
          />
        </div>
      </section>

      <section id="formats" className={`${PARTNER_SPACING.sectionVertical} border-b border-[#0B1F33]/8`}>
        <div className="max-w-7xl mx-auto px-5">
          <div className="mb-10 max-w-3xl">
            <span className="dp-label mb-3 block">Civic formats</span>
            <h2>Civic formats for downtown participation.</h2>
            <p className="mt-4 max-w-2xl text-[16px] leading-[1.6] text-[#425466]">
              Choose the civic format that fits the district, moment, initiative, or public objective. Every format shows up on the map where people are already looking.
            </p>
          </div>

          <div className="sticky top-[76px] z-20 -mx-5 mb-5 overflow-x-auto border-y border-[#0B1F33]/8 bg-white/88 px-5 py-3 backdrop-blur-[18px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex min-w-max items-center gap-5">
              {CIVIC_FORMATS.map((format, index) => (
                <button
                  key={format.id}
                  type="button"
                  onClick={() => setActiveFormatIndex(index)}
                  className={`font-body text-[11px] font-medium uppercase tracking-normal transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BFA46A] ${
                    index === activeFormatIndex ? 'text-[#0B1F33]' : 'text-[#BFA46A] hover:text-[#0B1F33]'
                  }`}
                  aria-controls="active-civic-format"
                  aria-pressed={index === activeFormatIndex}
                >
                  {format.eyebrow}
                </button>
              ))}
            </div>
          </div>

          <motion.article
            id="active-civic-format"
            key={activeFormat.id}
            initial={{ opacity: 0, y: 12, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="border-y border-[#0B1F33]/8 bg-white/84 p-5 text-[#0B1F33] backdrop-blur-[18px] md:p-6"
          >
            <div className="grid gap-7 md:grid-cols-[0.82fr_1.18fr]">
              <div>
                <div className="font-body text-[11px] font-medium uppercase tracking-normal text-[#BFA46A]">
                  {activeFormat.bestFor}
                </div>
                <h3 className="mt-3 font-heading text-[34px] font-medium leading-[0.98] tracking-[-0.03em] text-[#0B1F33] md:text-[50px]">
                  {activeFormat.label}
                </h3>
                <p className="mt-4 text-[15px] leading-[1.62] text-[#425466] md:text-[16px]">
                  {activeFormat.description}
                </p>
              </div>

              <div className="grid content-start gap-5 md:grid-cols-3">
                {[
                  ['Core placements', activeFormat.placements],
                  ['Key metrics', activeFormat.kpi],
                  ['How it works', activeFormat.body],
                ].map(([label, value]) => (
                  <div key={label}>
                    <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-normal text-[#0B1F33]">{label}</div>
                    <p className="text-[13px] leading-[1.58] text-[#425466] md:text-[14px]">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.article>
        </div>
      </section>

      {/* Civic examples */}
      <section className={`${PARTNER_SPACING.sectionVertical} border-b border-[#0B1F33]/8`}>
        <div className="max-w-7xl mx-auto px-5">
          <h2 className="font-heading text-[36px] font-medium text-[#0B1F33] leading-tight tracking-normal mb-4 md:text-[48px]">
            See how civic participation comes to life on the map
          </h2>
          <p className="text-[15px] text-[#425466] mb-12 max-w-2xl">
            Civic partnerships in Downtown Perks should feel useful, timely, and easy to act on. These examples show how events, districts, neighborhood guidance, and public participation appear across the map, buildings, and live downtown flow.
          </p>

          <div className="-mx-5 overflow-x-auto px-5 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex w-max gap-4 md:grid md:w-full md:grid-cols-3 md:gap-x-7 md:gap-y-7">
            {CIVIC_EXAMPLES.map((example, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="w-[min(78vw,300px)] shrink-0 border-t border-[#0B1F33]/10 pt-4 md:w-auto"
              >
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-normal text-[#BFA46A]">
                  {example.type}
                </div>
                <h3 className="text-[17px] font-medium leading-snug text-[#0B1F33]">{example.name}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-[#425466]">{example.desc}</p>
                <div className="mt-3 flex items-center gap-1.5 text-[12px] font-medium text-[#0B1F33]">
                  <TrendingUp className="w-3.5 h-3.5 text-[#BFA46A]" />
                  {example.proof}
                </div>
              </motion.div>
            ))}
            </div>
          </div>
        </div>
      </section>

      <section id="proof" className={`${PARTNER_SPACING.sectionVertical} border-b border-[#0B1F33]/8`}>
        <div className="mx-auto max-w-7xl px-5">
          <div className="mb-10 max-w-3xl">
            <span className="dp-label mb-3 block">Launch planning</span>
            <h2>What civic participation is likely to produce.</h2>
            <p className="mt-4 max-w-2xl text-[16px] leading-[1.6] text-[#425466]">
              These are planning ranges based on typical civic programs, residential entry points, partner onboarding pace, and the current Downtown Perks rollout model. They are meant to guide launch planning, not report live results.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
              {CIVIC_PLANNING_METRICS.map((metric, index) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.35, delay: index * 0.05 }}
                  className="min-w-0"
                >
                  <div className="text-[11px] font-semibold uppercase tracking-normal text-[#BFA46A]">{metric.label}</div>
                  <div className="mt-2 font-heading text-[36px] font-medium leading-none tracking-[-0.03em] text-[#0B1F33] md:text-[48px]">
                    {metric.value}
                  </div>
                  <p className="mt-3 text-[13px] leading-[1.58] text-[#425466]">{metric.detail}</p>
                </motion.div>
              ))}
            </div>

            <div className="border-y border-[#0B1F33]/8 bg-white/84 p-5 backdrop-blur-[18px] md:p-6">
              <div className="mb-5">
                <div className="text-[11px] font-semibold uppercase tracking-normal text-[#BFA46A]">Rollout notes</div>
                <h3 className="mt-2 font-heading text-[32px] font-medium leading-[1] tracking-[-0.03em] text-[#0B1F33] md:text-[42px]">
                  What to watch during rollout.
                </h3>
              </div>

              <div className="grid gap-4">
                {CIVIC_ROLLOUT_NOTES.map((note, index) => (
                  <motion.div
                    key={note.action}
                    initial={{ opacity: 0, x: -8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.3, delay: index * 0.04 }}
                    className="grid gap-1.5 border-t border-[#0B1F33]/8 pt-4 first:border-t-0 first:pt-0"
                  >
                    <p className="text-[14px] font-medium leading-[1.5] text-[#0B1F33]">{note.action}</p>
                    <div className="flex flex-wrap gap-x-2 gap-y-1 text-[11px] font-medium uppercase tracking-normal text-[#425466]">
                      <span>{note.source}</span>
                      <span className="text-[#BFA46A]">/</span>
                      <span>{note.window}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

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
