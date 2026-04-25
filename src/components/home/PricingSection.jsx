import { Link } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  Hotel,
  Landmark,
  Megaphone,
  UtensilsCrossed,
} from "lucide-react";
import ExpandableShowcase from "@/components/shared/ExpandableShowcase";
import { useCTAFlow } from "@/components/cta/CTAFlowProvider";
import { APPROVED_HOME_COPY } from "@/lib/approvedCopy";

const iconMap = {
  properties: Building2,
  hotels: Hotel,
  venues: UtensilsCrossed,
  brands: Megaphone,
  civic: Landmark,
};

const partnerCards = APPROVED_HOME_COPY.pricing.cards.map((card) => ({
  ...card,
  shortLabel: card.id === "brands" ? "Brands" : card.label,
  valueProp:
    card.id === "properties"
      ? "Turn the neighborhood into a measurable resident amenity."
      : card.id === "hotels"
        ? "Give guests one live downtown layer beyond the lobby."
        : card.id === "venues"
          ? "Show up when nearby intent is already forming."
          : card.id === "brands"
            ? "Activate the right corridor at the right time."
            : "Make district participation easier to see and measure.",
  icon: iconMap[card.id],
  cta:
    card.id === "properties"
      ? "View Properties"
      : card.id === "hotels"
        ? "View Hospitality"
        : card.id === "venues"
          ? "View Venues"
          : card.id === "brands"
            ? "View Brands"
            : "View Civic",
}));

export default function PricingSection() {
  const { openFlow } = useCTAFlow();

  return (
    <section id="start-here" className="bg-[var(--dp-surface-base)] px-4 py-8 md:px-6 md:py-10">
      <div className="dp-page-shell">
        <div className="mb-6 grid grid-cols-1 gap-5 border-t border-[rgba(11,31,51,0.08)] pt-8 md:grid-cols-[1.05fr_0.95fr] md:items-end md:gap-8">
          <div>
            <span className="dp-micro-label mb-3 block">{APPROVED_HOME_COPY.rollout.title}</span>
            <h2 className="dp-display-section max-w-3xl text-[2.15rem] text-foreground md:text-[3rem]">
              {APPROVED_HOME_COPY.rollout.closeTitle}
            </h2>
            <p className="mt-3 max-w-2xl text-[14px] leading-6 text-muted-foreground">
              {APPROVED_HOME_COPY.rollout.closeBody}
            </p>
          </div>

          <div className="border-t border-[rgba(11,31,51,0.08)] pt-4 text-[13px] leading-6 text-foreground/70 md:border-t-0 md:pt-0">
            {APPROVED_HOME_COPY.rollout.note}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[28px] border border-[rgba(11,31,51,0.08)] bg-white p-4 md:p-5">
            <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Partner fit
            </div>
            <ExpandableShowcase
              items={partnerCards}
              initialIndex={2}
              getKey={(item) => item.id}
              renderMenuMeta={(card) => {
                const Icon = card.icon;
                return (
                  <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[rgba(11,31,51,0.05)] text-primary">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                );
              }}
              renderMenuBody={(card) => (
                <>
                  <div className="text-[13px] font-semibold text-foreground">{card.shortLabel}</div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">{card.valueProp}</div>
                </>
              )}
              renderDetail={(card, index) => {
                const Icon = card.icon;
                return (
                  <div className="grid gap-5 md:grid-cols-[0.9fr_1.1fr]">
                    <div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-[rgba(11,31,51,0.05)] text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="mt-4 text-[10px] font-semibold uppercase tracking-[0.08em] text-foreground/54">
                        {card.price}
                      </div>
                      <h3 className="mt-4 text-[1.5rem] font-semibold tracking-[-0.04em] text-foreground">
                        {card.shortLabel}
                      </h3>
                      <p className="mt-3 text-[14px] leading-7 text-muted-foreground">{card.valueProp}</p>
                      <Link to={card.href} className="dp-link-action mt-6">
                        {card.cta}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>

                    <div className="border-t border-[rgba(11,31,51,0.08)] pt-5">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[rgba(11,31,51,0.48)]">
                        At a glance
                      </div>
                      <div className="mt-4 grid gap-2">
                        <div className="border-b border-[rgba(11,31,51,0.06)] pb-3">
                          <div className="text-[12px] font-semibold text-foreground">{card.detail}</div>
                          <div className="mt-1 text-[12px] leading-5 text-muted-foreground">{card.proof}</div>
                        </div>
                        <div className="text-[12px] leading-5 text-[rgba(11,31,51,0.72)]">
                          {card.audience}
                        </div>
                        {card.id === "venues" ? (
                          <div className="pt-1 text-[12px] leading-5 text-[rgba(11,31,51,0.72)]">
                            Free 90-day pilot first. If it works, move into the ongoing venue layer after review and invoicing.
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              }}
            />
          </div>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-3 border-t border-[rgba(11,31,51,0.08)] pt-5">
          <Link to="/partners" className="dp-cta-primary">
            {APPROVED_HOME_COPY.pricing.cta}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            to="/partner-workspace"
            onClick={(event) => {
              event.preventDefault();
              openFlow({
                type: "pilot_request",
                source: "pricing_section_start_pilot",
                sourceComponent: "PricingSection",
                successRoute: "/partners",
              });
            }}
            className="dp-cta-secondary"
          >
            Start the Pilot
          </Link>
          <div className="text-[12px] leading-5 text-muted-foreground">
            Partner pricing is finalized after fit review. Resident direct access is $25 per year until a building joins, then that fee is refunded.
          </div>
        </div>
      </div>
    </section>
  );
}
