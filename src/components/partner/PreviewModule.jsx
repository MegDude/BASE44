import { motion } from 'framer-motion';

/**
 * PreviewModule — Context-specific live preview (building, guest flow, campaign, etc.)
 */
export default function PreviewModule({
  type = 'default', // residential | hospitality | venues | brands | civic
  title,
  description,
  icon,
  children,
}) {
  const bgColor = {
    residential: 'from-[#f8fbff] to-[#eef4fa]',
    hospitality: 'from-[#f8fbff] to-[#eff5fb]',
    venues: 'from-[#f8fbff] to-[#eef4fa]',
    brands: 'from-[#f8fbff] to-[#eff5fb]',
    civic: 'from-[#f8fbff] to-[#eef4fa]',
    default: 'from-[#f8fbff] to-[#eef4fa]',
  }[type];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={`aspect-[4/3] rounded-2xl border border-[rgba(11,31,51,0.08)] bg-gradient-to-br ${bgColor} flex flex-col items-start justify-center p-8 text-left shadow-[0_14px_28px_rgba(11,31,51,0.04)]`}
    >
      {icon && <div className="text-4xl mb-4">{icon}</div>}
      {title && <p className="mb-1 text-[13px] font-semibold text-foreground">{title}</p>}
      {description && <p className="text-[11px] text-muted-foreground">{description}</p>}
      {children}
    </motion.div>
  );
}
