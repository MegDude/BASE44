import { useEffect, useMemo, useState } from "react";
import { mapRepository } from "@/lib/repositories/mapRepository";
import { supabase } from "@/lib/supabaseClient";
import { rankPartners } from "@/lib/scoringEngine";
import { trackEvent } from "@/lib/trackEvent";

const ROLE_CONFIG = {
  properties: {
    types: ["building", "property"],
    categories: [],
    title: "Properties that shape the neighborhood.",
    description: "Buildings and residential anchors with a live downtown connection.",
  },
  hospitality: {
    types: ["hotel"],
    categories: [],
    title: "Hospitality groups active nearby.",
    description: "Hotels and guest-facing partners tied into the same district map.",
  },
  venues: {
    types: ["venue"],
    categories: [],
    title: "Venues that belong downtown.",
    description: "Everyone here is active, on the map, and in the neighborhood.",
  },
  brands: {
    types: [],
    categories: ["brand"],
    title: "Brands connected to downtown behavior.",
    description: "Campaigns, activations, and branded moments tied to real-world activity.",
  },
  civic: {
    types: ["civic", "event"],
    categories: [],
    title: "Civic and district activity in one layer.",
    description: "Public-facing partners, district moments, and useful local programming.",
  },
};

function normalizeSupabasePartner(record = {}) {
  const lat = Number(record.lat ?? record.latitude ?? record.location?.lat);
  const lng = Number(record.lng ?? record.longitude ?? record.location?.lng);
  const category = String(record.category || "").toLowerCase();
  const partnerType =
    category === "property"
      ? "building"
      : category === "hospitality"
        ? "hotel"
        : category === "brand"
          ? "brand"
          : category || "venue";

  return {
    id: record.partner_id || record.id || record.slug || record.partner_name,
    entity_id: record.partner_id || record.id || record.slug || record.partner_name,
    partner_id: record.partner_id || record.id || record.slug || record.partner_name,
    name: record.partner_name || record.name || "Partner",
    title: record.partner_name || record.name || "Partner",
    type: partnerType,
    entity_type: partnerType,
    category,
    district: record.district || "Downtown",
    address: record.address || "",
    description: record.short_description || record.description || "",
    short_description: record.short_description || record.description || "",
    interactions: Number(record.interactions || 0),
    last_active: record.last_active || record.updated_at || null,
    distance: Number(record.distance || 0) || undefined,
    location: Number.isFinite(lat) && Number.isFinite(lng) ? { latitude: lat, longitude: lng, valid: true } : undefined,
    latitude: lat,
    longitude: lng,
    metadata: {
      popularity: Number(record.interactions || 0),
      activityScore: Number(record.interactions || 0),
      partnerCategory: category,
    },
  };
}

async function fetchSupabasePartners(activeRole) {
  if (!supabase) return [];

  const { data, error } = await supabase.from("partners").select("*");
  if (error) throw error;

  const normalized = (data || []).map(normalizeSupabasePartner).filter((item) => item?.id);
  if (activeRole === "brands") return normalized.filter((item) => item.category === "brand" || item.type === "brand");
  if (activeRole === "properties") return normalized.filter((item) => ["building", "property"].includes(item.type));
  if (activeRole === "hospitality") return normalized.filter((item) => item.type === "hotel");
  if (activeRole === "venues") return normalized.filter((item) => item.type === "venue");
  if (activeRole === "civic") return normalized.filter((item) => ["civic", "event"].includes(item.type));
  return normalized;
}

async function fetchFallbackPartners(activeRole) {
  const role = ROLE_CONFIG[activeRole] || ROLE_CONFIG.venues;
  const items = await mapRepository.getMapFeed({
    query: activeRole === "brands" ? "brands downtown activation" : `${activeRole} downtown`,
    types: role.types,
    categories: role.categories,
    limit: 60,
  });

  return (items || []).map((item) => ({
    ...item,
    partner_id: item.partner_id || item.entity_id || item.id,
    partner_name: item.name || item.title,
    short_description: item.short_description || item.description || item.metadata?.shortDescription || "",
    interactions: Number(item.metadata?.popularity ?? 0),
    last_active: item.last_active || item.updated_at || item.created_at || null,
    distance: Number(item.metadata?.walkMinutes ?? 0) || undefined,
  }));
}

export default function PartnerDirectory({
  activeRole = "venues",
  onSelect,
  onItemsChange,
}) {
  const [partners, setPartners] = useState([]);

  const roleConfig = useMemo(
    () => ROLE_CONFIG[activeRole] || ROLE_CONFIG.venues,
    [activeRole]
  );

  useEffect(() => {
    let alive = true;

    (async () => {
      let nextPartners = [];

      try {
        nextPartners = await fetchSupabasePartners(activeRole);
      } catch (_error) {
        nextPartners = [];
      }

      if (nextPartners.length === 0) {
        nextPartners = await fetchFallbackPartners(activeRole);
      }

      const ranked = rankPartners(nextPartners).slice(0, 18);

      if (!alive) return;
      setPartners(ranked);
      onItemsChange?.(ranked);
    })();

    return () => {
      alive = false;
    };
  }, [activeRole, onItemsChange]);

  return (
    <section className="px-4 py-8 md:px-6 md:py-10">
      <div className="dp-page-shell max-w-4xl">
        <div className="mb-8">
          <div className="dp-micro-label">Partner directory</div>
          <h2 className="dp-heading-modern mt-4 text-[2rem] md:text-[2.8rem]">
            {roleConfig.title}
          </h2>
          <p className="mt-3 text-[14px] leading-7 text-muted-foreground">
            {roleConfig.description}
          </p>
        </div>

        <div className="flex flex-col divide-y divide-[rgba(11,31,51,0.08)]">
          {partners.map((partner) => {
            const isLive = partner.last_active
              ? Date.now() - new Date(partner.last_active).getTime() < 1000 * 60 * 10
              : false;
            const isTrending = Number(partner.score || 0) > 1.4;

            return (
              <button
                key={partner.partner_id || partner.entity_id || partner.id}
                type="button"
                onClick={() => {
                  trackEvent("partner_click", {
                    source: "partner_directory",
                    partner_id: partner.partner_id || partner.entity_id || partner.id,
                    partner_type: activeRole,
                  });
                  onSelect?.(partner);
                }}
                className="py-5 text-left transition hover:opacity-70"
              >
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgba(11,31,51,0.48)]">
                  <span>{partner.category || partner.type || activeRole}</span>
                  {isLive ? <span className="text-[var(--dp-gold-deep,#A97816)]">Live now</span> : null}
                  {isTrending ? <span className="text-[var(--dp-gold-deep,#A97816)]">Trending</span> : null}
                </div>
                <div className="mt-1 text-[1.08rem] font-semibold text-[var(--dp-navy,#0B1F33)]">
                  {partner.partner_name || partner.name || partner.title}
                </div>
                <div className="mt-1 max-w-3xl text-[13px] leading-6 text-[rgba(11,31,51,0.62)]">
                  {partner.short_description || partner.description || partner.address || "Active downtown partner."}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
