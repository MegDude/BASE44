import CardQRCode from './CardQRCode';

export default function PerksCard({ userId = 'demo', name = 'Downtown Resident' }) {
  return (
    <div
      className="relative w-full max-w-sm mx-auto rounded-2xl overflow-hidden p-6"
      style={{
        background: 'linear-gradient(135deg, var(--dp-navy) 0%, var(--dp-navy-rich) 100%)',
        boxShadow: '0 24px 64px rgba(17,31,61,0.22)',
        minHeight: '200px',
      }}
      role="img"
      aria-label={`Downtown Perks card for ${name}`}
    >
      {/* Card header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] mb-1" style={{ color: 'var(--dp-gold)' }}>Downtown Perks</p>
          <p className="text-white text-lg font-semibold">{name}</p>
        </div>
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(207,175,90,0.15)' }}>
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ color: 'var(--dp-gold)' }} aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="3"/><path d="M2 10h20"/></svg>
        </div>
      </div>

      {/* QR area */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium mb-1" style={{ color: 'rgba(246,247,251,0.5)' }}>Resident ID</p>
          <p className="font-mono text-sm text-white/80">{userId.slice(0, 8).toUpperCase()}</p>
        </div>
        <CardQRCode value={`dp:${userId}`} size={64} />
      </div>

      {/* Decorative element */}
      <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-5" style={{ background: 'radial-gradient(circle, white, transparent)', transform: 'translate(30%, -30%)' }} aria-hidden="true" />
    </div>
  );
}
