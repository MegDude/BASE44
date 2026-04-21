import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  Building2,
  Calendar,
  Hotel,
  Landmark,
  MapPin,
  Megaphone,
  MessageSquare,
  Sparkles,
  Ticket,
  Users,
  Utensils,
  Wrench,
} from 'lucide-react';
import PartnerCTASection from '@/components/partner/PartnerCTASection';
import { PARTNER_SPACING, PARTNER_CATEGORIES, PARTNER_ROUTES } from '@/lib/partner-system';
import FAQAccordionBlock from '@/components/ui/FAQAccordionBlock';
import { FAQ_PARTNERS } from '@/lib/faq-partner-data';

const PARTNER_TYPES = [
  {
    id: 'residential',
    label: 'Residential',
    description: 'Connect buildings, residents, access, amenities, and nearby offers through one property layer.',
    icon: Building2,
    href: '/partners/residential',
    proof: ['Resident CRM', 'Building QR', 'Perk adoption'],
  },
  {
    id: 'hospitality',
    label: 'Hospitality',
    description: 'Give guests a curated downtown layer while tracking what drives local movement.',
    icon: Hotel,
    href: '/partners/hotels',
    proof: ['Guest QR', 'Local guide', 'Visit attribution'],
  },
  {
    id: 'venues',
    label: 'Venues',
    description: 'Show up in map intent, publish offers, and understand repeat behavior.',
    icon: Utensils,
    href: '/partners/venues',
    proof: ['Offers', 'Redemptions', 'Repeat guests'],
  },
  {
    id: 'brands',
    label: 'Brands',
    description: 'Launch targeted downtown campaigns with source, segment, and conversion reporting.',
    icon: Sparkles,
    href: '/partners/brands',
    proof: ['Campaigns', 'Segments', 'ROI'],
  },
  {
    id: 'civic',
    label: 'Civic',
    description: 'Coordinate district activity, events, partner coverage, and public-facing engagement.',
    icon: Landmark,
    href: '/partners/civic',
    proof: ['Events', 'Reach', 'District health'],
  },
];

const OPERATING_SURFACES = [
  {
    label: 'Resident CRM',
    body: 'Profiles, building source, card status, saved behavior, segments, and resident access.',
    icon: Users,
  },
  {
    label: 'Campaigns',
    body: 'Announcements, reminders, SMS/email pushes, open rate, click rate, and conversion.',
    icon: Megaphone,
  },
  {
    label: 'Amenities',
    body: 'Reservations, QR entry points, building events, and neighborhood amenity extensions.',
    icon: Calendar,
  },
  {
    label: 'Maintenance',
    body: 'Requests, priority, status, response time, and resident follow-up loops.',
    icon: Wrench,
  },
  {
    label: 'Reports',
    body: 'Redemption trends, partner health, building attribution, category mix, and recommendations.',
    icon: BarChart3,
  },
  {
    label: 'Partner portal',
    body: 'Venue content, perks, messages, campaign eligibility, and map visibility controls.',
    icon: MessageSquare,
  },
];

const PROOF_ROWS = [
  ['Building attribution', 'Which properties drive scans, saves, RSVPs, and redemptions.'],
  ['Resident segments', 'Who responds to coffee, dining, wellness, events, amenities, and offers.'],
  ['Partner health', 'Which venues perform, which need attention, and what action to take next.'],
  ['Operational queue', 'What requires review: requests, campaigns, stale content, or underperforming offers.'],
];

const EXAMPLES = [
  {
    type: 'Residential',
    example: 'The Paseo',
    desc: 'Resident onboarding, amenities, nearby offers, and partner performance connected to one building surface.',
    stat: '3x local discovery',
    link: '/brands/the-paseo',
  },
  {
    type: 'Hospitality',
    example: 'Hotel Van Zandt',
    desc: 'Guest QR entry creates a live guide while attributing visits to nearby venues and events.',
    stat: '2.1x venue movement',
    link: '/brands/hotel-van-zandt',
  },
  {
    type: 'Venue',
    example: "Banger's",
    desc: 'Map placement, perks, and campaign timing turn discovery into repeat visits.',
    stat: '41% return rate',
    link: '/partners/venues',
  },
];

function SectionLabel({ children }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(40,62%,42%)]">
      {children}
    </p>
  );
}

export default function PartnersIndex() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_18%_0%,rgba(207,175,90,0.10),transparent_28%),linear-gradient(180deg,#F8F7F3_0%,#F1F0EA_100%)] pt-[68px] text-[var(--dp-navy,#0B1F33)]">
      <section className="px-6 py-20 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.98fr_1.02fr] lg:items-end">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
            <SectionLabel>Partner Program</SectionLabel>
            <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[0.94] tracking-[-0.065em] md:text-7xl">
              Build on the downtown operating layer.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-[rgba(11,31,51,0.66)]">
              Residential buildings, hotels, venues, brands, and civic teams use the same live map, resident access layer, partner tools, and backend intelligence hub.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#roles"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[12px] bg-[var(--dp-navy,#0B1F33)] px-5 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[rgba(11,31,51,0.9)]"
              >
                Explore your role
                <ArrowRight className="h-4 w-4" />
              </a>
              <Link
                to="/dashboard"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[12px] bg-white/38 px-5 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--dp-navy,#0B1F33)] transition hover:bg-white/62"
              >
                Open dashboard
              </Link>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} className="rounded-[32px] bg-white/30 p-5 backdrop-blur-xl">
            <div className="rounded-[24px] bg-[var(--dp-navy,#0B1F33)] p-6 text-white">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[hsl(40,62%,62%)]">
                    Intelligence hub
                  </p>
                  <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em]">Not just a partner page.</h2>
                </div>
                <MapPin className="h-6 w-6 text-[hsl(40,62%,62%)]" strokeWidth={1.75} />
              </div>
              <div className="mt-7 grid grid-cols-2 gap-3">
                {[
                  ['40+', 'Active partners'],
                  ['180k', 'Monthly scans'],
                  ['52%', 'Avg retention'],
                  ['28%', 'Redemption rate'],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-[18px] bg-white/8 p-4">
                    <div className="font-heading text-3xl font-semibold tracking-[-0.06em]">{value}</div>
                    <div className="mt-1 text-[11px] text-white/54">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="roles" className="border-y border-[rgba(11,31,51,0.08)] px-6 py-16 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-2xl">
            <SectionLabel>Your role</SectionLabel>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.055em] md:text-5xl">
              Five entry points. One operating system.
            </h2>
          </div>

          <div className="divide-y divide-[rgba(11,31,51,0.08)] border-y border-[rgba(11,31,51,0.08)]">
            {PARTNER_TYPES.map((type) => {
              const Icon = type.icon;
              return (
                <Link key={type.id} to={type.href} className="group grid gap-5 py-6 transition hover:bg-white/26 md:grid-cols-[80px_1fr_auto] md:items-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[rgba(11,31,51,0.06)]">
                    <Icon className="h-5 w-5 text-[var(--dp-navy,#0B1F33)]" strokeWidth={1.75} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold tracking-[-0.04em]">{type.label}</h3>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-[rgba(11,31,51,0.62)]">{type.description}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {type.proof.map((item) => (
                        <span key={item} className="rounded-full bg-white/34 px-3 py-1 text-[11px] font-medium text-[rgba(11,31,51,0.62)]">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[rgba(11,31,51,0.62)] group-hover:text-[var(--dp-navy,#0B1F33)]">
                    Learn more
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-b border-[rgba(11,31,51,0.08)] px-6 py-16 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.78fr_1.22fr]">
          <div>
            <SectionLabel>Backend capability</SectionLabel>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.055em] md:text-5xl">
              The Harmony Homes operating depth, rebuilt for Downtown Perks.
            </h2>
            <p className="mt-5 text-sm leading-6 text-[rgba(11,31,51,0.62)]">
              The partner surface now references the full backend capability model: building data, residents, announcements, surveys, amenities, maintenance, campaigns, reports, partners, and perk analytics.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {OPERATING_SURFACES.map((surface) => {
              const Icon = surface.icon;
              return (
                <div key={surface.label} className="rounded-[22px] bg-white/30 p-5 backdrop-blur-md">
                  <Icon className="mb-6 h-5 w-5 text-[hsl(40,62%,42%)]" strokeWidth={1.75} />
                  <h3 className="text-base font-semibold tracking-[-0.025em]">{surface.label}</h3>
                  <p className="mt-2 text-[12px] leading-5 text-[rgba(11,31,51,0.58)]">{surface.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-b border-[rgba(11,31,51,0.08)] px-6 py-16 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_1fr] lg:items-start">
          <div>
            <SectionLabel>How it works</SectionLabel>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.055em] md:text-5xl">
              Every role connects to the same live map and proof layer.
            </h2>
          </div>
          <div className="space-y-5">
            {[
              ['Map-native placement', 'A building, venue, event, offer, or campaign appears based on user intent, proximity, and access context.'],
              ['Progressive resident access', 'People browse first, then unlock cards, saves, RSVP, SMS access, or redemption when intent is clear.'],
              ['Operational intelligence', 'Scans, saves, RSVPs, redemptions, segments, maintenance, amenities, and campaigns roll into one dashboard.'],
              ['Actionable reporting', 'The system should recommend the next operational move, not just show vanity numbers.'],
            ].map(([title, desc]) => (
              <div key={title} className="border-b border-[rgba(11,31,51,0.08)] pb-5">
                <h3 className="text-lg font-semibold tracking-[-0.035em]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[rgba(11,31,51,0.62)]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-[rgba(11,31,51,0.08)] px-6 py-16 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-2xl">
            <SectionLabel>Proof model</SectionLabel>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.055em] md:text-5xl">
              What the dashboard should prove.
            </h2>
          </div>
          <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[26px] bg-[var(--dp-navy,#0B1F33)] p-6 text-white">
              <Ticket className="h-5 w-5 text-[hsl(40,62%,62%)]" strokeWidth={1.75} />
              <h3 className="mt-5 text-3xl font-semibold tracking-[-0.05em]">
                From scan to action.
              </h3>
              <p className="mt-4 text-sm leading-6 text-white/64">
                Downtown Perks should connect public discovery, QR access, resident identity, partner content, and property operations into a traceable path.
              </p>
            </div>

            <div className="divide-y divide-[rgba(11,31,51,0.08)] rounded-[26px] bg-white/30 backdrop-blur-md">
              {PROOF_ROWS.map(([title, body]) => (
                <div key={title} className="grid gap-3 p-5 sm:grid-cols-[180px_1fr]">
                  <h3 className="text-sm font-semibold tracking-[-0.02em]">{title}</h3>
                  <p className="text-sm leading-6 text-[rgba(11,31,51,0.62)]">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[rgba(11,31,51,0.08)] px-6 py-16 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-2xl">
            <SectionLabel>See it in action</SectionLabel>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.055em] md:text-5xl">
              Use cases that connect place, access, and measurement.
            </h2>
          </div>

          <div className="grid gap-3 lg:grid-cols-3">
            {EXAMPLES.map((example) => (
              <Link key={example.example} to={example.link} className="group rounded-[24px] bg-white/30 p-6 backdrop-blur-md transition hover:bg-white/52">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[rgba(11,31,51,0.46)]">
                  {example.type}
                </div>
                <h3 className="mt-3 text-2xl font-semibold tracking-[-0.045em]">{example.example}</h3>
                <p className="mt-3 text-sm leading-6 text-[rgba(11,31,51,0.62)]">{example.desc}</p>
                <div className="mt-5 flex items-center justify-between">
                  <span className="text-sm font-semibold text-[hsl(40,62%,42%)]">{example.stat}</span>
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <FAQAccordionBlock
        sectionEyebrow="Partner FAQs"
        sectionTitle="How the partner system works"
        sectionIntro="Downtown Perks gives each partner type a different way into the same downtown product. The backend operating layer makes those roles measurable and manageable."
        items={FAQ_PARTNERS}
        styleVariant="default"
        showNumbers={false}
        allowMultipleOpen={false}
        defaultOpenIndex={0}
        pageType="partners"
        backgroundVariant="light"
      />

      <PartnerCTASection
        headline="Build the downtown layer with us."
        description="Connect your building, hotel, venue, brand, or district to the live map, resident card, and intelligence hub."
        primaryCTA="Get started"
        primaryHref="#roles"
        secondaryLink={{ label: 'View pricing', href: '/pricing' }}
      />

      <section className={`${PARTNER_SPACING.subsectionVertical} border-t border-[rgba(11,31,51,0.08)]`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap gap-6 text-[13px]">
            {[
              { label: 'Residential', href: PARTNER_ROUTES[PARTNER_CATEGORIES.RESIDENTIAL] },
              { label: 'Hospitality', href: PARTNER_ROUTES[PARTNER_CATEGORIES.HOSPITALITY] },
              { label: 'Venues', href: PARTNER_ROUTES[PARTNER_CATEGORIES.VENUES] },
              { label: 'Brands', href: PARTNER_ROUTES[PARTNER_CATEGORIES.BRANDS] },
              { label: 'Civic', href: PARTNER_ROUTES[PARTNER_CATEGORIES.CIVIC] },
            ].map((link) => (
              <a key={link.href} href={link.href} className="text-[rgba(11,31,51,0.72)] transition-colors hover:text-[var(--dp-navy,#0B1F33)]">
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
