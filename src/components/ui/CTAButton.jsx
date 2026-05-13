import { Link } from 'react-router-dom';
import { getCTA } from '@/lib/ctaRegistry';

export default function CTAButton({ ctaId, label, to, variant = 'primary', className = '', disabled = false, onClick, children }) {
  const cta = ctaId ? getCTA(ctaId) : null;
  const resolvedLabel = label ?? cta?.label ?? 'Learn More';
  const resolvedTo = to ?? cta?.to;
  const resolvedVariant = variant ?? cta?.variant ?? 'primary';

  const base = 'inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--dp-gold)] active:scale-[0.97] select-none';

  const variants = {
    primary: 'bg-[var(--dp-navy)] text-white shadow-[0_8px_32px_rgba(17,31,61,0.18)] hover:bg-[var(--dp-navy-rich)] disabled:opacity-50',
    secondary: 'border bg-[var(--dp-card)] text-[var(--dp-navy)] hover:bg-[var(--dp-bg)] disabled:opacity-50',
    gold: 'bg-[var(--dp-gold)] text-[var(--dp-navy)] font-semibold hover:brightness-105 disabled:opacity-50',
    ghost: 'text-[var(--dp-navy)] hover:bg-[var(--dp-border)] disabled:opacity-50',
  };

  const cls = `${base} ${variants[resolvedVariant] ?? variants.primary} ${className}`;

  if (disabled) {
    return <button type="button" className={cls} disabled aria-disabled="true">{children ?? resolvedLabel}</button>;
  }

  if (onClick && !resolvedTo) {
    return <button type="button" className={cls} onClick={onClick}>{children ?? resolvedLabel}</button>;
  }

  if (resolvedTo?.startsWith('http') || resolvedTo?.startsWith('//')) {
    return <a href={resolvedTo} className={cls} rel="noopener noreferrer">{children ?? resolvedLabel}</a>;
  }

  return <Link to={resolvedTo ?? '/'} className={cls}>{children ?? resolvedLabel}</Link>;
}
