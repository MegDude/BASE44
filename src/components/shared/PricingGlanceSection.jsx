import { Link } from "react-router-dom";
import { ArrowRight, Building2, Hotel, Landmark, Megaphone, Ticket, UtensilsCrossed } from "lucide-react";
import { APPROVED_HOME_COPY } from "@/lib/approvedCopy";
import { useCTAFlow } from "@/components/cta/CTAFlowProvider";
import { ROUTES } from "@/lib/routes";

const ICONS = {
  properties: Building2,
  hotels: Hotel,
  venues: UtensilsCrossed,
  brands: Megaphone,
  civic: Landmark,
  residents: Ticket,
};

function getFlowConfig(cardId) {
  switch (cardId) {
    case "properties":
      return {
        type: "residential_onboarding",
        partnerType: "properties",
        label: "Apply to be a partner",
      };
    case "hotels":
      return {
        type: "hospitality_onboarding",
        partnerType: "hospitality",
        label: "Apply to be a partner",
      };
    case "venues":
      return {
        type: "venue_onboarding",
        partnerType: "venues",
        label: "Submit your perk",
      };
    case "brands":
      return {
        type: "brand_campaign",
        partnerType: "brands",
        label: "Apply to be a partner",
      };
    case "civic":
      return {
        type: "civic_onboarding",
        partnerType: "civic",
        label: "Apply to be a partner",
      };
    case "residents":
      return {
        type: "resident_card",
        partnerType: "resident",
        label: "Request resident access",
      };
    default:
      return {
        type: "start_here",
        partnerType: "other",
        label: "Apply to be a partner",
      };
  }
}

export default function PricingGlanceSection({
  eyebrow = APPROVED_HOME_COPY.pricing.title,
  title = APPROVED_HOME_COPY.pricing.title,
  intro = APPROVED_HOME_COPY.pricing.intro,
  includeResident = false,
  source = "pricing_glance_section",
  className = "",
}) {
  const { openFlow } = useCTAFlow();

  const cards = [
    ...APPROVED_HOME_COPY.pricing.cards,
    ...(includeResident
      ? [
          {
            id: "residents",
            label: "Residents",
            audience: "Resident access to the live map, card, perks, and events.",
            price: "$25 / year",
            detail: "Refundable if your building signs up later.",
            proof: "Open the map first. Add the card when access matters.",
            href: ROUTES.residentAppCard,
          },
        ]
      : []),
  ];

  return (
    <section className={`px-4 py-8 md:px-6 md:py-10 ${className}`}>
      <div className="dp-page-shell">
        <div className="mb-6 border-t border-[rgba(11,31,51,0.08)] pt-8">
          <div className="dp-micro-label">{eyebrow}</div>
          <div className="mt-3 grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
            <div>
              <h2 className="dp-heading-modern text-[2rem] md:text-[2.8rem]">{title}</h2>
              <p className="mt-3 text-[14px] leading-6 text-muted-foreground">{intro}</p>
            </div>
            <div className="text-[12px] leading-5 text-[rgba(11,31,51,0.64)]">
              Final pricing reflects footprint, visibility, and activation.
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((card) => {
            const Icon = ICONS[card.id] || Building2;
            const flow = getFlowConfig(card.id);
            return (
              <div
                key={card.id}
                className="rounded-[22px] border border-[rgba(11,31,51,0.08)] bg-white p-5 shadow-[0_16px_36px_rgba(11,31,51,0.05)]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[rgba(11,31,51,0.05)] text-[var(--dp-navy)]">
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <div className="mt-4 text-[1.15rem] font-semibold tracking-[-0.03em] text-foreground">
                  {card.label}
                </div>
                <div className="mt-2 text-[13px] leading-6 text-muted-foreground">{card.audience}</div>
                <div className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(11,31,51,0.48)]">
                  {card.price}
                </div>
                <div className="mt-3 text-[13px] font-semibold text-foreground">{card.detail}</div>
                <div className="mt-2 text-[13px] leading-6 text-[rgba(11,31,51,0.72)]">{card.proof}</div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      openFlow({
                        type: flow.type,
                        source: `${source}_${card.id}`,
                        sourceComponent: "PricingGlanceSection",
                        partnerType: flow.partnerType,
                        successRoute: card.href,
                        pageContext: {
                          partnerType: flow.partnerType,
                          pilotWindow: card.id === "venues" ? "12-month free venue launch" : "Free 90-day pilot",
                        },
                      })
                    }
                    className="dp-cta-primary"
                  >
                    {flow.label}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <Link to={card.href} className="dp-cta-secondary">
                    Learn more
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-[rgba(11,31,51,0.08)] pt-5">
          <div className="text-[13px] leading-6 text-muted-foreground">
            {APPROVED_HOME_COPY.pricing.footer}
          </div>
        </div>
      </div>
    </section>
  );
}
