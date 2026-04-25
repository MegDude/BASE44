import { partnerTypes, type PartnerTypeKey } from "@/content/partnerTypes";
import { PartnerTypeCard } from "./PartnerTypeCard";

interface PartnerTypesSectionProps {
  title?: string;
  body?: string;
  showIntro?: boolean;
  keys?: PartnerTypeKey[];
  cardVariant?: "overview" | "compact" | "featured";
  className?: string;
}

export function PartnerTypesSection({
  title = "Choose the layer that matches the business problem.",
  body,
  showIntro = true,
  keys,
  cardVariant = "overview",
  className = "",
}: PartnerTypesSectionProps) {
  const displayed = keys
    ? partnerTypes.filter((p) => keys.includes(p.key))
    : partnerTypes;

  return (
    <section className={`w-full ${className}`}>
      {showIntro && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {title}
          </h2>
          {body && (
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
              {body}
            </p>
          )}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayed.map((partner) => (
          <PartnerTypeCard key={partner.key} partner={partner} variant={cardVariant} />
        ))}
      </div>
    </section>
  );
}
