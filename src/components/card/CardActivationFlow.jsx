import { useState } from 'react';
import { CheckCircle, ChevronRight } from 'lucide-react';
import CTAButton from '@/components/ui/CTAButton';

const STEPS = [
  { id: 'info', title: 'Your Info', description: 'Quick, just your name and address.' },
  { id: 'verify', title: 'Verify', description: 'Confirm your downtown address.' },
  { id: 'done', title: "You're In", description: 'Your card is active and ready.' },
];

export default function CardActivationFlow({ onComplete }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');

  const current = STEPS[step];

  return (
    <div
      className="mt-8 p-6 rounded-2xl border"
      style={{ backgroundColor: 'var(--dp-card)', borderColor: 'var(--dp-border)' }}
      role="region"
      aria-label="Card activation"
    >
      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-6" role="list" aria-label="Activation steps">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2" role="listitem">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold transition-colors"
              style={{
                backgroundColor: i < step ? 'var(--dp-gold)' : i === step ? 'var(--dp-navy)' : 'var(--dp-border)',
                color: i <= step ? (i < step ? 'var(--dp-navy)' : 'white') : 'var(--dp-slate)',
              }}
              aria-current={i === step ? 'step' : undefined}
            >
              {i < step ? <CheckCircle className="h-3.5 w-3.5" aria-hidden="true" /> : i + 1}
            </div>
            {i < STEPS.length - 1 && <div className="h-px w-6 flex-shrink-0" style={{ backgroundColor: i < step ? 'var(--dp-gold)' : 'var(--dp-border)' }} aria-hidden="true" />}
          </div>
        ))}
      </div>

      <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--dp-navy)' }}>{current.title}</h2>
      <p className="text-sm mb-6" style={{ color: 'var(--dp-slate)' }}>{current.description}</p>

      {step === 0 && (
        <div className="space-y-4">
          <div>
            <label htmlFor="activation-name" className="block text-xs font-medium mb-1.5" style={{ color: 'var(--dp-navy)' }}>Your name</label>
            <input
              id="activation-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Jane Smith"
              className="w-full h-10 px-3 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-[var(--dp-gold)]"
              style={{ backgroundColor: 'var(--dp-bg)', borderColor: 'var(--dp-border)', color: 'var(--dp-navy)' }}
              autoComplete="name"
            />
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="p-4 rounded-xl text-sm" style={{ backgroundColor: 'var(--dp-bg)', color: 'var(--dp-slate)' }}>
          <p>Downtown Austin address confirmed.</p>
        </div>
      )}

      {step === 2 && (
        <div className="flex items-center gap-3 p-4 rounded-xl" style={{ backgroundColor: 'rgba(52,199,89,0.08)' }}>
          <CheckCircle className="h-5 w-5 flex-shrink-0" style={{ color: '#16a34a' }} aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--dp-navy)' }}>Card activated</p>
            <p className="text-xs" style={{ color: 'var(--dp-slate)' }}>Show it at any participating partner.</p>
          </div>
        </div>
      )}

      <div className="flex gap-3 mt-6">
        {step < STEPS.length - 1 ? (
          <button
            type="button"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dp-gold)]"
            style={{ backgroundColor: 'var(--dp-navy)', color: 'white' }}
            onClick={() => setStep(s => s + 1)}
          >
            Continue <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : (
          <CTAButton ctaId="openMap" onClick={onComplete} to={undefined} />
        )}
        <button
          type="button"
          onClick={onComplete}
          className="text-xs px-3 py-2 rounded-xl transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dp-gold)]"
          style={{ color: 'var(--dp-slate)', backgroundColor: 'var(--dp-bg)' }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
