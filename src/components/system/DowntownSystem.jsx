import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Building2, CalendarDays, CreditCard, Map, MapPin, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

export function SectionContainer({ children, className = "", id }) {
  return (
    <section id={id} className={cn("dp-section border-t border-[#0B1F33]/8", className)}>
      <div className="dp-container">{children}</div>
    </section>
  );
}

export function ContentContainer({ children, className = "" }) {
  return <div className={cn("max-w-3xl", className)}>{children}</div>;
}

export function SplitLayout({ children, className = "" }) {
  return <div className={cn("grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-10", className)}>{children}</div>;
}

export function RevealSection({ children, delay = 0, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function EditorialHero({ eyebrow, title, children, ctaLabel, ctaHref = "/map?mode=resident&tab=map", aside }) {
  const content = (
    <RevealSection>
      {eyebrow && <span className="dp-label mb-4 block">{eyebrow}</span>}
      <h1 className="font-heading text-4xl font-medium leading-[1.05] tracking-normal text-[#0B1F33] md:text-4xl">
        {title}
      </h1>
      <div className="mt-5 space-y-4 text-[15px] leading-[1.7] text-[#0B1F33]/70">
        {children}
      </div>
      {ctaLabel && (
        <Link to={ctaHref} className="dp-button-primary mt-7">
          {ctaLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </RevealSection>
  );

  return (
    <section className="relative overflow-hidden bg-[#F7F8FB] px-5 pb-14 pt-28 md:pb-20 md:pt-32">
      <div className="dp-container">
        {aside ? (
          <SplitLayout className="items-end">
            {content}
            {aside}
          </SplitLayout>
        ) : (
          <div className="max-w-3xl">{content}</div>
        )}
      </div>
    </section>
  );
}

export function InsightCard({ eyebrow, title, children, icon: Icon = MapPin, className = "" }) {
  return (
    <div className={cn("dp-card dp-card-hover p-5", className)}>
      <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-[6px] border border-[#0B1F33]/8 bg-[#F7F8FB]">
        <Icon className="h-4 w-4 text-[#B38F4F]" />
      </div>
      {eyebrow && <div className="dp-label mb-2 text-[10px]">{eyebrow}</div>}
      <h3 className="font-heading text-lg font-medium leading-tight text-[#0B1F33]">{title}</h3>
      <div className="mt-3 text-[13px] leading-[1.65] text-[#0B1F33]/62">{children}</div>
    </div>
  );
}

export const ResidentCard = InsightCard;
export const EventCard = InsightCard;
export const PropertyCard = InsightCard;
export const VenueCard = InsightCard;
export const OfferCard = InsightCard;

export function HorizontalSnapCarousel({ children, className = "" }) {
  return (
    <div className={cn("flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2", className)}>
      {children}
    </div>
  );
}

export function ResidentCarousel({ items }) {
  return (
    <HorizontalSnapCarousel>
      {items.map((item) => (
        <div key={item.title} className="min-w-[82%] snap-start sm:min-w-[45%] lg:min-w-[31%]">
          <InsightCard title={item.title} eyebrow={item.eyebrow} icon={item.icon}>
            {item.body}
          </InsightCard>
        </div>
      ))}
    </HorizontalSnapCarousel>
  );
}

export function ProgressLoopCards({ steps, activeIndex = 0 }) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {steps.map((step, index) => {
        const active = index === activeIndex;
        return (
          <div
            key={step.step}
            className={cn(
              "dp-card p-5",
              active ? "border-[#B38F4F]/50 shadow-[0_18px_46px_rgba(11,31,51,0.18)]" : "border-[#0B1F33]/8"
            )}
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="dp-label">{step.step}</span>
              <span className={cn("h-1.5 w-10 rounded-sm", active ? "bg-[#B38F4F]" : "bg-[#0B1F33]/10")} />
            </div>
            <h3 className="font-heading text-lg font-medium text-[#0B1F33]">{step.title}</h3>
          </div>
        );
      })}
    </div>
  );
}

export function PerksCardCTA({ title = "Get Your Perks Card Now", body, href = "/downtown-perks/card" }) {
  return (
    <div className="dp-card p-5 md:p-6">
      <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <span className="dp-label mb-3 block">Resident Access</span>
          <h3 className="font-heading text-2xl font-medium text-[#0B1F33]">{title}</h3>
          {body && <p className="dp-copy mt-3">{body}</p>}
        </div>
        <Link to={href} className="dp-button-primary">
          Open card
          <CreditCard className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

export function WalkabilityModule({ title = "What’s Around the Corner", children }) {
  return (
    <div className="dp-card overflow-hidden">
      <div className="grid gap-0 md:grid-cols-[1fr_1.1fr]">
        <div className="p-5 md:p-6">
          <span className="dp-label mb-3 block">Nearby</span>
          <h3 className="font-heading text-2xl font-medium text-[#0B1F33]">{title}</h3>
          <p className="dp-copy mt-3">{children}</p>
        </div>
        <MapPreviewPanel />
      </div>
    </div>
  );
}

export function MapPreviewPanel() {
  return (
    <div className="relative min-h-[260px] overflow-hidden bg-[#0B1F33]">
      <div className="absolute inset-0 opacity-45 [background-image:linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:44px_44px]" />
      {[
        ["left-[18%] top-[28%]", "Places"],
        ["left-[58%] top-[22%]", "Events"],
        ["left-[42%] top-[62%]", "Perks"],
        ["left-[76%] top-[58%]", "Homes"],
      ].map(([position, label]) => (
        <div key={label} className={cn("absolute", position)}>
          <div className="flex items-center gap-2 rounded-[6px] border border-white/12 bg-white/92 px-2.5 py-2 text-[11px] font-medium text-[#0B1F33] shadow-[0_18px_46px_rgba(11,31,51,0.18)]">
            <span className="h-2.5 w-2.5 rounded-[999px] bg-[#B38F4F]" />
            {label}
          </div>
        </div>
      ))}
      <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-[6px] border border-white/12 bg-white/92 px-3 py-2 text-[12px] font-medium text-[#0B1F33]">
        <SlidersHorizontal className="h-3.5 w-3.5" />
        Live downtown layer
      </div>
    </div>
  );
}

export function MapShell({ children }) {
  return <div className="relative overflow-hidden rounded-[10px] border border-[#0B1F33]/8 bg-[#0B1F33]">{children}</div>;
}

export function FloatingMapControls({ children }) {
  return <div className="absolute left-4 top-4 flex gap-2">{children}</div>;
}

export function FloatingMapFilters({ filters }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {filters.map((filter, index) => (
        <span
          key={filter}
          className={cn(
            "shrink-0 rounded-[6px] border px-3 py-2 text-[12px] font-medium",
            index === 0 ? "border-[#B38F4F]/50 bg-[#0B1F33]/10 text-[#0B1F33]" : "border-[#0B1F33]/8 bg-white text-[#0B1F33]/65"
          )}
        >
          {filter}
        </span>
      ))}
    </div>
  );
}

export const MapResultsPanel = ({ children }) => <div className="dp-card p-5">{children}</div>;
export const MapBottomSheet = ({ children }) => <div className="dp-card rounded-b-none p-5">{children}</div>;
export const MapDetailDrawer = ({ children }) => <aside className="dp-card p-5">{children}</aside>;
export const FloatingInput = ({ className = "", ...props }) => <input className={cn("h-10 rounded-[6px] border border-[#0B1F33]/10 bg-white px-4 text-[13px] outline-none focus:border-[#B38F4F]/60", className)} {...props} />;
export const StructuredFormPanel = ({ children }) => <div className="dp-card p-5">{children}</div>;
export const QRSignupModule = PerksCardCTA;
export const ResidentHowItWorks = ProgressLoopCards;
export const PartnerHero = EditorialHero;
export const AnalyticsPreview = InsightCard;
export const EngagementStats = InsightCard;
export const PilotSignupPanel = StructuredFormPanel;
export const DashboardPreview = InsightCard;
export const GlobalTopNav = () => null;
export const MobileNavDrawer = () => null;

export const SYSTEM_ICONS = { Building2, CalendarDays, CreditCard, Map };
