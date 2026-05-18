import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

/**
 * PartnerTypeCard — Selector card for partner roles
 */
export default function PartnerTypeCard({
  type,
  label,
  description,
  headline,
  proofLine,
  icon: Icon,
  href,
  delay = 0,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
    >
      <Link to={href} className="block h-full group">
        <div className="h-full rounded-[26px] bg-white/88 p-6 shadow-[0_16px_34px_rgba(11,26,43,0.05)] backdrop-blur-md transition-all duration-300 group-hover:-translate-y-0.5">
          {Icon && (
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-[16px] bg-[rgba(11,26,43,0.06)] text-[#111]">
              <Icon className="h-5 w-5" />
            </div>
          )}

          <div className="mb-2 text-[11px] font-bold uppercase tracking-[.12em] text-[var(--dp-gold-muted)]">
            {type}
          </div>

          <h3 className="text-[18px] font-bold text-[#111] mb-3 leading-snug group-hover:text-[#111] transition-colors">
            {label}
          </h3>

          <p className="mb-4 text-[13px] leading-relaxed text-muted-foreground">{description}</p>

          {headline && (
            <div className="mb-3 rounded-[16px] bg-[rgba(11,26,43,0.04)] p-3">
              <div className="text-[12px] font-semibold text-[#111]">{headline}</div>
            </div>
          )}

          {proofLine && (
            <div className="dp-link-action">
              {proofLine}
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
