import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

/**
 * PartnerTypeCard — Selector card for partner roles (Residential, Hospitality, etc.)
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
        <div className="h-full p-6 rounded-2xl border border-[#e8e5df] bg-white hover:border-[#111] hover:shadow-lg transition-all duration-300">
          {Icon && <Icon className="w-8 h-8 text-[#111] mb-3" />}

          <div className="text-[11px] font-bold uppercase tracking-[.12em] text-[#8d887f] mb-2">
            {type}
          </div>

          <h3 className="text-[18px] font-bold text-[#111] mb-3 leading-snug group-hover:text-[#111] transition-colors">
            {label}
          </h3>

          <p className="text-[13px] text-[#6f6b65] leading-relaxed mb-4">{description}</p>

          {headline && (
            <div className="mb-3 p-3 rounded-lg bg-[#f5f3ef] border border-[#e8e5df]">
              <div className="text-[12px] font-semibold text-[#111]">{headline}</div>
            </div>
          )}

          {proofLine && (
            <div className="flex items-center gap-1.5 text-[12px] font-bold text-[#111] group-hover:gap-2 transition-all">
              {proofLine}
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}