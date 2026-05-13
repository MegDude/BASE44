import CTAButton from '@/components/ui/CTAButton';
import PerksCard from '@/components/card/PerksCard';
import CardActivationFlow from '@/components/card/CardActivationFlow';
import { useState } from 'react';

export default function Card() {
  const [activating, setActivating] = useState(false);

  return (
    <div className="pt-14" style={{ backgroundColor: 'var(--dp-bg)', color: 'var(--dp-ink)', minHeight: '100vh' }}>
      <div className="fluid-container py-12 max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] mb-3" style={{ color: 'var(--dp-gold)' }}>Resident Access</p>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3" style={{ color: 'var(--dp-navy)', fontFamily: 'var(--dp-font-display)' }}>Your downtown access layer.</h1>
          <p className="text-base max-w-md mx-auto leading-relaxed" style={{ color: 'var(--dp-slate)' }}>
            Show your card at participating places to unlock resident perks.
          </p>
        </div>

        <PerksCard />

        {!activating ? (
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <CTAButton ctaId="getCard" onClick={() => setActivating(true)} to={undefined} />
            <CTAButton ctaId="openMap" variant="secondary" />
          </div>
        ) : (
          <CardActivationFlow onComplete={() => setActivating(false)} />
        )}
      </div>
    </div>
  );
}
