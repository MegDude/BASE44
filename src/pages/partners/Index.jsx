import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Building2, Users, Utensils, Sparkles, MapPin } from 'lucide-react';
import PartnerHero from '@/components/partner/PartnerHero';
import SelectorCards from '@/components/partner/SelectorCards';
import PartnerCTASection from '@/components/partner/PartnerCTASection';

const PARTNER_TYPES = [
  {
    id: 'residential',
    label: 'Residential',
    description: 'Connect residents to local venues, events, and perks',
    icon: Building2,
    href: '/partners/residential',
    stats: { scans: '12k+', repeat: '73%' },
  },
  {
    id: 'hospitality',
    label: 'Hospitality',
    description: 'Drive guest discovery and foot traffic from hotels',
    icon: Users,
    href: '/partners/hotels',
    stats: { guests: '8k+', conversion: '34%' },
  },
  {
    id: 'venues',
    label: 'Venues',
    description: 'Increase visits and repeat engagement',
    icon: Utensils,
    href: '/partners/venues',
    stats: { visits: '24k+', repeat: '41%' },
  },
  {
    id: 'brands',
    label: 'Brands',
    description: 'Launch campaigns with precise placement and attribution',
    icon: Sparkles,
    href: '/partners/brands',
    stats: { campaigns: '15+', roi: '3.2x' },
  },
  {
    id: 'civic',
    label: 'Civic',
    description: 'Mobilize communities around events and initiatives',
    icon: MapPin,
    href: '/partners/civic',
    stats: { events: '40+', reach: '18k+' },
  },
];

export default function PartnersIndex() {
  const [selectedType, setSelectedType] = useState(null);

  return (
    <div className="pt-[68px] min-h-screen bg-background">
      {/* Hero */}
      <PartnerHero
        eyebrow="Partner Program"
        headline="Build with Downtown Perks"
        description="Five ways to grow your business: residential buildings, hotels, venues, brands, and civic organizations. Each with a live map, proven metrics, and a direct path to implementation."
        primaryCTA="Explore your role"
        primaryCTAHref="#partners"
        stats={[
          { label: 'Partners active', value: '40+' },
          { label: 'Monthly scans', value: '180k' },
          { label: 'Avg repeat rate', value: '52%' },
        ]}
      />

      {/* Partner selection */}
      <section className="py-16 md:py-24 border-b border-[#e8e5df]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12">
            <h2 className="text-[32px] md:text-[40px] font-bold text-[#111] leading-tight tracking-tight">
              Your role
            </h2>
            <p className="text-[15px] text-[#6f6b65] mt-3">
              Choose how you want to participate in the Downtown Perks ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {PARTNER_TYPES.map((type) => {
              const Icon = type.icon;
              return (
                <Link
                  key={type.id}
                  to={type.href}
                  className="group"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4 }}
                    className="h-full p-6 rounded-2xl border border-[#e8e5df] bg-white hover:border-[#111] hover:shadow-lg transition-all duration-300 cursor-pointer"
                  >
                    <Icon className="w-8 h-8 text-[#111] mb-3" />
                    <h3 className="text-[16px] font-bold text-[#111] mb-1.5">{type.label}</h3>
                    <p className="text-[13px] text-[#7a746b] leading-relaxed mb-4">
                      {type.description}
                    </p>

                    {type.stats && (
                      <div className="flex gap-3 text-[11px]">
                        {Object.entries(type.stats).slice(0, 2).map(([key, val]) => (
                          <div key={key}>
                            <div className="font-bold text-[#111]">{val}</div>
                            <div className="text-[#8d887f] capitalize">{key}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-4 flex items-center gap-1 text-[12px] font-semibold text-[#111] group-hover:gap-2 transition-all">
                      Learn more
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works unified */}
      <section className="py-16 md:py-24 border-b border-[#e8e5df]">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-[32px] md:text-[40px] font-bold text-[#111] leading-tight tracking-tight mb-12">
            One system, five roles
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Left: System explanation */}
            <div>
              <div className="space-y-6">
                {[
                  {
                    title: 'Map-native discovery',
                    desc: 'Residents, guests, and neighbors explore venues, events, and brands on a live map of downtown.',
                  },
                  {
                    title: 'Precise placement',
                    desc: 'Your location, offer, or event appears contextually based on user intent and proximity.',
                  },
                  {
                    title: 'Real-time engagement',
                    desc: 'Every interaction—scan, save, visit, redemption—is tracked and attributed.',
                  },
                  {
                    title: 'Flexible models',
                    desc: 'Launch campaigns, activate venues, connect residents, or drive foot traffic. Your choice.',
                  },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                  >
                    <h3 className="text-[16px] font-bold text-[#111] mb-1.5">{item.title}</h3>
                    <p className="text-[14px] text-[#6f6b65] leading-relaxed">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right: Key stats / proof */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Active partners', value: '40+' },
                { label: 'Monthly scans', value: '180k' },
                { label: 'Avg retention', value: '52%' },
                { label: 'Campaign ROI', value: '3.2x' },
                { label: 'Total reach', value: '120k' },
                { label: 'Redemption rate', value: '28%' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="p-5 rounded-2xl border border-[#e8e5df] bg-white"
                >
                  <div className="text-[20px] font-bold text-[#111]">{stat.value}</div>
                  <div className="text-[11px] text-[#8d887f] mt-1.5">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Examples / use cases */}
      <section className="py-16 md:py-24 border-b border-[#e8e5df]">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-[32px] md:text-[40px] font-bold text-[#111] leading-tight tracking-tight mb-12">
            See it in action
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                type: 'Residential',
                example: 'The Paseo',
                desc: 'Residents discovered local venues 3x more after launch',
                stat: '↑ 180% engagement',
                link: '/brands/the-paseo',
              },
              {
                type: 'Hospitality',
                example: 'Hotel Van Zandt',
                desc: 'Guest foot traffic to nearby venues increased 2.1x',
                stat: '↑ 84 visits/week',
                link: '/brands/hotel-van-zandt',
              },
              {
                type: 'Venues',
                example: "Banger's",
                desc: 'Consistent foot traffic and repeat visits from map discovery',
                stat: '↑ 41% return rate',
                link: '#',
              },
            ].map((example, i) => (
              <motion.a
                key={i}
                href={example.link}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="p-6 rounded-2xl border border-[#e8e5df] bg-white hover:border-[#111] hover:shadow-lg transition-all"
              >
                <div className="text-[11px] font-bold uppercase tracking-[.12em] text-[#8d887f] mb-1.5">
                  {example.type}
                </div>
                <h3 className="text-[18px] font-bold text-[#111] mb-2">{example.example}</h3>
                <p className="text-[13px] text-[#6f6b65] leading-relaxed mb-4">{example.desc}</p>
                <div className="flex items-center gap-2">
                  <div className="text-[14px] font-bold text-[#111]">{example.stat}</div>
                  <ArrowRight className="w-4 h-4 text-[#7a746b]" />
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <PartnerCTASection
        headline="Join 40+ partners"
        description="Let's talk about how Downtown Perks can work for you."
        primaryCTA="Get started"
        primaryHref="#partners"
        secondaryLink={{ label: 'View pricing', href: '#' }}
      />

      {/* Footer nav */}
      <section className="py-12 border-t border-[#e8e5df]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap gap-6 text-[13px]">
            <a href="/partners/residential" className="text-[#111] hover:text-[#7a746b]">
              Residential
            </a>
            <a href="/partners/hotels" className="text-[#111] hover:text-[#7a746b]">
              Hospitality
            </a>
            <a href="/partners/venues" className="text-[#111] hover:text-[#7a746b]">
              Venues
            </a>
            <a href="/partners/brands" className="text-[#111] hover:text-[#7a746b]">
              Brands
            </a>
            <a href="/partners/civic" className="text-[#111] hover:text-[#7a746b]">
              Civic
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}