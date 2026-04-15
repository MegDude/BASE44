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
    residential: 'from-[#f5f3ef] to-[#efeae0]',
    hospitality: 'from-[#f8f6f2] to-[#f0ede6]',
    venues: 'from-[#f5f3ef] to-[#efeae0]',
    brands: 'from-[#f8f6f2] to-[#f0ede6]',
    civic: 'from-[#f5f3ef] to-[#efeae0]',
    default: 'from-[#f5f3ef] to-[#efeae0]',
  }[type];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={`aspect-[4/3] rounded-2xl border border-[#e8e5df] bg-gradient-to-br ${bgColor} flex flex-col items-center justify-center p-8 text-center`}
    >
      {icon && <div className="text-4xl mb-4">{icon}</div>}
      {title && <p className="text-[13px] font-semibold text-[#4a463f] mb-1">{title}</p>}
      {description && <p className="text-[11px] text-[#8d887f]">{description}</p>}
      {children}
    </motion.div>
  );
}