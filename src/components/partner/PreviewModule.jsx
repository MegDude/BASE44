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
    residential: 'from-[#FFFFFF] to-[#F7F8FB]',
    hospitality: 'from-[#FFFFFF] to-[#F7F8FB]',
    venues: 'from-[#FFFFFF] to-[#F7F8FB]',
    brands: 'from-[#FFFFFF] to-[#F7F8FB]',
    civic: 'from-[#FFFFFF] to-[#F7F8FB]',
    default: 'from-[#FFFFFF] to-[#F7F8FB]',
  }[type];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={`aspect-[4/3] rounded-lg border border-[#0B1F33]/8 bg-gradient-to-br ${bgColor} flex flex-col items-center justify-center p-8 text-center`}
    >
      {icon && <div className="text-4xl mb-4">{icon}</div>}
      {title && <p className="text-[13px] font-semibold text-[#0B1F33]/70 mb-1">{title}</p>}
      {description && <p className="text-[11px] text-[#0B1F33]/50">{description}</p>}
      {children}
    </motion.div>
  );
}
