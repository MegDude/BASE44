/**
 * Properties Partner Page
 * Storytelling unfold for residential buildings
 * No card grids, no bordered sections
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, MapPin, Users, TrendingUp, Check, ArrowRight, ChevronDown, QrCode, BarChart3, Zap, Play, X } from 'lucide-react';

const WHAT_YOU_GET = [
  { icon: QrCode, title: 'QR Entry Points', desc: 'Lobby, leasing office, welcome packets, and resident portal.' },
  { icon: MapPin, title: 'Live Downtown Map', desc: 'Nearby places, events, and perks—all in one view.' },
  { icon: BarChart3, title: 'Real Engagement Data', desc: 'See what residents actually use, not just what they say.' },
  { icon: Zap, title: 'Instant Activation', desc: 'Go live in 7-10 days. We handle the setup.' },
];

const PRICING_TIERS = [
  { name: 'Free', price: '$0', period: '/forever', features: ['Basic map access', 'QR entry points', 'Simple reporting'], highlight: false },
  { name: 'Analytics', price: '$39', period: '/year', features: ['Full engagement data', '30/60/90 day reports', 'Perk redemption tracking'], highlight: false },
  { name: 'Full Stack', price: '$99', period: '/year', features: ['Everything in Analytics', 'Custom branding', 'Priority support', 'API access'], highlight: true },
];

const PROOF_METRICS = [
  { label: 'Average corridor engagement', value: '3.8%' },
  { label: 'Resident activation rate', value: '42%' },
  { label: 'Monthly map interactions', value: '2.4K' },
];

export default function PropertiesPartner() {
  const [showDemo, setShowDemo] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);

  return (
    <div className="min-h-screen bg-surface pt-16">
      {/* Hero */}
      <section className="bg-navy text-on-dark dp-section pt-12 pb-16">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-gold text-sm mb-6">
              <Building2 className="w-4 h-4" />
              <span>For Properties</span>
            </div>
            
            <h1 className="dp-h1 text-on-dark mb-4">
              You&apos;re not selling square footage
            </h1>
            <p className="dp-h3 text-on-dark-muted font-normal mb-6">
              You&apos;re selling everything around it.
            </p>
            <p className="dp-body text-on-dark-muted max-w-2xl mx-auto mb-8">
              The coffee shop where the barista knows your order. The bar that feels like your living room.
              The Thai place that&apos;s open late. That&apos;s what people pay for. That&apos;s the real value.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setShowDemo(true)}
                className="dp-btn-gold dp-touch"
              >
                <Play className="w-4 h-4" />
                <span>See How It Works</span>
              </button>
              <a href="#pricing" className="dp-btn-ghost text-on-dark-muted dp-touch">
                View Pricing
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Proof metrics */}
      <section className="bg-navy-soft py-6">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-3 gap-4">
            {PROOF_METRICS.map((metric) => (
              <div key={metric.label} className="text-center">
                <p className="text-xl sm:text-2xl font-semibold text-gold">{metric.value}</p>
                <p className="text-xs sm:text-sm text-on-dark-muted">{metric.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="dp-section">
        <div className="max-w-3xl mx-auto">
          <h2 className="dp-h2 text-navy text-center mb-2">
            What&apos;s included
          </h2>
          <p className="dp-body text-center mb-8">
            Everything you need to activate your property in under 10 days.
          </p>

          <div className="space-y-4">
            {WHAT_YOU_GET.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-4 p-4 bg-white rounded-xl dp-shadow"
                >
                  <div className="w-12 h-12 rounded-xl bg-gold-soft flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6 text-gold" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy mb-0.5">{item.title}</h3>
                    <p className="dp-body-sm">{item.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="dp-section bg-surface-subtle">
        <div className="max-w-4xl mx-auto">
          <h2 className="dp-h2 text-navy text-center mb-2">
            Simple pricing
          </h2>
          <p className="dp-body text-center mb-8">
            Start with a 90-day free pilot. Then choose your level.
          </p>

          <div className="grid sm:grid-cols-3 gap-4">
            {PRICING_TIERS.map((tier) => (
              <div
                key={tier.name}
                className={`p-5 rounded-2xl ${
                  tier.highlight
                    ? 'bg-navy text-on-dark dp-shadow-lg'
                    : 'bg-white dp-shadow'
                }`}
              >
                <h3 className={`font-semibold mb-1 ${tier.highlight ? 'text-gold' : 'text-navy'}`}>
                  {tier.name}
                </h3>
                <div className="mb-4">
                  <span className={`text-3xl font-bold ${tier.highlight ? 'text-on-dark' : 'text-navy'}`}>
                    {tier.price}
                  </span>
                  <span className={tier.highlight ? 'text-on-dark-muted' : 'text-navy-muted'}>
                    {tier.period}
                  </span>
                </div>
                <ul className="space-y-2 mb-5">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className={`w-4 h-4 shrink-0 ${tier.highlight ? 'text-gold' : 'text-gold'}`} />
                      <span className={tier.highlight ? 'text-on-dark-muted' : 'text-navy-muted'}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <a
                  href="#contact"
                  className={`dp-btn w-full justify-center dp-touch ${
                    tier.highlight ? 'dp-btn-gold' : 'bg-surface-subtle text-navy'
                  }`}
                >
                  Get Started
                </a>
              </div>
            ))}
          </div>

          <p className="text-center text-navy-muted text-sm mt-6">
            Management pays. Residents stay.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="dp-section bg-navy text-on-dark">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="dp-h2 text-on-dark mb-4">
            Bring this to your property
          </h2>
          <p className="dp-body text-on-dark-muted mb-6">
            Stop handing prospects a laminated list from 2019.
            Give them a live map of what makes your building worth it.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="mailto:properties@downtownperks.com"
              className="dp-btn-gold dp-touch"
            >
              <span>Start a Conversation</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <Link to="/partners" className="dp-btn-ghost text-on-dark-muted dp-touch">
              Back to Partners
            </Link>
          </div>
        </div>
      </section>

      {/* Demo Modal */}
      <AnimatePresence>
        {showDemo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setShowDemo(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative w-full max-w-3xl aspect-video bg-navy rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowDemo(false)}
                className="absolute top-4 right-4 dp-close bg-white/10 hover:bg-white/20"
              >
                <X className="w-5 h-5 text-white" />
              </button>
              <div className="w-full h-full flex items-center justify-center text-on-dark-muted">
                <p>Demo video placeholder</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
