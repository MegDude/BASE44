import { motion } from "framer-motion";
import { ArrowRight, Building2, Hotel, Landmark, Megaphone, Store, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { PARTNER_TYPE_CONTENT, PARTNER_TYPE_ORDER } from "@/lib/partnerContent";
import { ROUTES } from "@/lib/routes";

const RESIDENT_CARD = {
  id: "residents",
  label: "Residents",
  description: "Find places, events, and perks nearby without jumping between apps.",
  route: ROUTES.residents,
  icon: Users,
  stats: [
    { value: "1 map", label: "entry" },
    { value: "3 taps", label: "to act" },
  ],
};

function toCard(partnerKey) {
  const item = PARTNER_TYPE_CONTENT[partnerKey];
  return {
    id: item.id,
    label: item.label,
    description: item.description,
    route: item.route,
    icon: item.icon,
    stats: (item.metrics || []).slice(0, 2).map((metric) => ({
      value: metric.value,
      label: metric.label.toLowerCase(),
    })),
  };
}

const DEFAULT_PARTNER_CARDS = PARTNER_TYPE_ORDER.map(toCard);

export default function PartnerRoleGrid({
  includeResidents = false,
  cards = null,
  className = "",
}) {
  const resolvedCards = cards || (includeResidents ? [RESIDENT_CARD, ...DEFAULT_PARTNER_CARDS] : DEFAULT_PARTNER_CARDS);

  return (
    <div className={`grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5 ${className}`}>
      {resolvedCards.map((card, index) => {
        const Icon = card.icon || Building2;
        return (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: index * 0.04 }}
          >
            <Link to={card.route} className="group block h-full">
              <div className="flex h-full flex-col rounded-[22px] border border-[rgba(16,24,39,0.10)] bg-white px-5 py-5 shadow-[0_10px_24px_rgba(16,24,39,0.04)] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-[rgba(16,24,39,0.72)] group-hover:shadow-[0_18px_40px_rgba(16,24,39,0.10)]">
                <Icon className="mb-3 h-8 w-8 text-[#111]" />
                <h3 className="mb-1.5 text-[16px] font-bold text-[#111]">{card.label}</h3>
                <p className="mb-4 text-[13px] leading-relaxed text-[#6B7280]">{card.description}</p>

                <div className="mt-auto flex gap-4 text-[11px]">
                  {(card.stats || []).map((stat) => (
                    <div key={`${card.id}-${stat.label}`}>
                      <div className="font-bold text-[#111]">{stat.value}</div>
                      <div className="capitalize text-[#8B8B8B]">{stat.label}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-center gap-1 text-[12px] font-semibold text-[#111] transition-all group-hover:gap-2">
                  {card.ctaLabel || "Learn more"}
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
