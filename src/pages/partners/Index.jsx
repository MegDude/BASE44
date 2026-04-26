/**
 * Partners Index — Entry point for all partner types
 * Map-first showcase with storytelling unfold
 * No card grids, no bordered sections
 */

import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Hotel, Utensils, Star, Landmark, ArrowRight, ChevronDown, MapPin, Users, TrendingUp, Check, Play, X } from 'lucide-react';

const PARTNER_TYPES = [
  {
    id: 'properties',
    title: 'Properties',
    subtitle: 'Buildings & Residential',
    description: "You're not selling square footage. You're selling everything around it.",
    icon: Building2,
    color: 'var(--dp-navy)',
    stats: { label: 'Avg engagement', value: '3.8%' },
    includes: ['QR access across lobby & leasing', 'Live map of nearby places', 'Real engagement tracking'],
    pricing: 'Free · $39 · $99/year',
    href: '/partners/properties',
  },
  {
    id: 'hospitality',
    title: 'Hotels',
    subtitle: 'Hospitality & Extended Stay',
    description: 'Stop handing guests a photocopied restaurant list. Give them orientation.',
    icon: Hotel,
    color: 'var(--dp-gold)',
    stats: { label: 'Guest discovery', value: '+42%' },
    includes: ['QR in rooms & lobby', 'Live venue map', 'Zero friction experience'],
    pricing: '$99–$149/year',
    href: '/partners/hospitality',
  },
  {
    id: 'venues',
    title: 'Venues',
    subtitle: 'Restaurants, Bars & Fitness',
    description: "People don't remember ads. They remember what's nearby when they're hungry.",
    icon: Utensils,
    color: '#22c55e',
    stats: { label: 'Walk-in lift', value: '+28%' },
    includes: ['Map placement by proximity', 'Perks that get used', 'Clear 30/60/90 engagement'],
    pricing: 'Free 12mo · $49/year after',
    href: '/partners/venues',
  },
  {
    id: 'brands',
    title: 'Brands',
    subtitle: 'Sponsors & Activations',
    description: 'The best advertising appears inside a decision already happening.',
    icon: Star,
    color: '#8b5cf6',
    stats: { label: 'Intent capture', value: '4.2%' },
    includes: ['Corridor-based visibility', 'Event integration', 'Trackable actions'],
    pricing: '$149/year',
    href: '/partners/brands',
  },
  {
    id: 'civic',
    title: 'Civic',
    subtitle: 'Districts & Community',
    description: 'Cities work better when people know what\'s happening.',
    icon: Landmark,
    color: '#0ea5e9',
    stats: { label: 'Event turnout', value: '+35%' },
    includes: ['Community events layer', 'District discovery', 'Participation tracking'],
    pricing: '$49–$79/year',
    href: '/partners/civic',
  },
];

const PROOF_POINTS = [
  { label: 'Downtown Residents', value: '7,000+' },
  { label: 'Active Venues', value: '50+' },
  { label: 'Corridor Engagement', value: '3.8%' },
  { label: 'Monthly Actions', value: '12K+' },
];

export default function PartnersIndex() {
  const navigate = useNavigate();
  const [expandedType, setExpandedType] = useState(null);
  const [showVideo, setShowVideo] = useState(false);

  const toggleExpand = (id) => {
    setExpandedType(expandedType === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* Hero - Navy background */}
      <section className="bg-navy text-on-dark dp-section pt-20 pb-12 md:pt-28 md:pb-16">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-gold text-sm font-medium tracking-wide uppercase mb-4">
              Downtown Perks for Partners
            </p>
            <h1 className="dp-h1 text-on-dark mb-4">
              Turn residents into regulars
            </h1>
            <p className="dp-body text-on-dark-muted max-w-2xl mx-auto mb-8">
              People are already downtown. Already walking. Already deciding. 
              You don&apos;t need more attention—you need better timing.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setShowVideo(true)}
                className="dp-btn-gold dp-touch"
              >
                <Play className="w-4 h-4" />
                <span>See How It Works</span>
              </button>
              <Link to="#partner-types" className="dp-btn-ghost text-on-dark-muted dp-touch">
                <span>Explore Partner Types</span>
                <ChevronDown className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Proof strip */}
      <section className="bg-navy-soft py-6 overflow-x-auto">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex justify-between gap-8 min-w-max">
            {PROOF_POINTS.map((point) => (
              <div key={point.label} className="text-center">
                <p className="text-2xl font-semibold text-gold">{point.value}</p>
                <p className="text-sm text-on-dark-muted">{point.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Types - Interactive unfold */}
      <section id="partner-types" className="dp-section">
        <div className="max-w-3xl mx-auto">
          <h2 className="dp-h2 text-navy text-center mb-2">
            Choose your path
          </h2>
          <p className="dp-body text-center mb-8">
            Each partner type unlocks different capabilities. Tap to explore.
          </p>

          <div className="space-y-3">
            {PARTNER_TYPES.map((type, index) => {
              const Icon = type.icon;
              const isExpanded = expandedType === type.id;

              return (
                <motion.div
                  key={type.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="bg-white rounded-2xl dp-shadow overflow-hidden"
                >
                  {/* Header - Always visible */}
                  <button
                    onClick={() => toggleExpand(type.id)}
                    className="w-full flex items-center gap-4 p-4 text-left dp-interactive"
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${type.color}15` }}
                    >
                      <Icon className="w-6 h-6" style={{ color: type.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-navy">{type.title}</h3>
                        <span className="text-xs text-navy-muted">·</span>
                        <span className="text-sm text-navy-muted">{type.subtitle}</span>
                      </div>
                      <p className="text-sm text-navy-muted line-clamp-1">{type.description}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="hidden sm:block text-right">
                        <p className="text-sm font-medium" style={{ color: type.color }}>{type.stats.value}</p>
                        <p className="text-xs text-navy-muted">{type.stats.label}</p>
                      </div>
                      <ChevronDown className={`w-5 h-5 text-navy-muted transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  {/* Expanded content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 pt-0">
                          <div className="border-t border-[var(--dp-divider)] pt-4">
                            {/* Description */}
                            <p className="dp-body mb-4">{type.description}</p>

                            {/* What's included */}
                            <div className="mb-4">
                              <p className="text-xs uppercase tracking-wide text-navy-muted mb-2">What&apos;s included</p>
                              <div className="space-y-2">
                                {type.includes.map((item, i) => (
                                  <div key={i} className="flex items-center gap-2 text-sm text-navy">
                                    <Check className="w-4 h-4 text-gold shrink-0" />
                                    <span>{item}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Pricing + CTA */}
                            <div className="flex items-center justify-between gap-4">
                              <div>
                                <p className="text-xs text-navy-muted mb-0.5">Pricing</p>
                                <p className="font-medium text-navy">{type.pricing}</p>
                              </div>
                              <Link
                                to={type.href}
                                className="dp-btn-primary"
                              >
                                <span>Learn More</span>
                                <ArrowRight className="w-4 h-4" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works - Simple steps */}
      <section className="dp-section bg-surface-subtle">
        <div className="max-w-3xl mx-auto">
          <h2 className="dp-h2 text-navy text-center mb-8">
            A smarter way to activate downtown
          </h2>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { step: '01', title: 'Launch', desc: 'Set up QR entry points and map visibility so people find you immediately.' },
              { step: '02', title: 'Measure', desc: 'Track scans, saves, RSVPs, and redemptions—real behavior, not assumptions.' },
              { step: '03', title: 'Decide', desc: 'Keep it, scale it, or adjust based on what actually works.' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-10 h-10 rounded-full bg-gold-soft text-gold font-semibold text-sm flex items-center justify-center mx-auto mb-3">
                  {item.step}
                </div>
                <h3 className="font-semibold text-navy mb-1">{item.title}</h3>
                <p className="dp-body-sm">{item.desc}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-navy-muted text-sm mt-8">
            Spend less. Do more. Start small. Prove it fast. Keep it if it works.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="dp-section bg-navy text-on-dark">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="dp-h2 text-on-dark mb-4">
            Ready when you are
          </h2>
          <p className="dp-body text-on-dark-muted mb-6">
            People don&apos;t choose the best option. They choose the one they notice.
            What&apos;s close. What&apos;s clear. What&apos;s easy.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/partners/properties" className="dp-btn-gold dp-touch">
              <Building2 className="w-4 h-4" />
              <span>Start with Properties</span>
            </Link>
            <a href="mailto:partners@downtownperks.com" className="dp-btn-ghost text-on-dark-muted dp-touch">
              Contact Us
            </a>
          </div>
        </div>
      </section>

      {/* Video Modal */}
      <AnimatePresence>
        {showVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setShowVideo(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative w-full max-w-3xl aspect-video bg-navy rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowVideo(false)}
                className="absolute top-4 right-4 dp-close bg-white/10 hover:bg-white/20"
              >
                <X className="w-5 h-5 text-white" />
              </button>
              <div className="w-full h-full flex items-center justify-center text-on-dark-muted">
                <p>Video placeholder</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
