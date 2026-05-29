export type PinVariant =
  | "coffee"
  | "dining"
  | "nightlife"
  | "wellness"
  | "property"
  | "residential"
  | "hotel"
  | "event"
  | "happy-hour"
  | "civic"
  | "retail"
  | "mobility"
  | "park"
  | "culture"
  | "brand"
  | "campaign"
  | "analytics"
  | "offer"
  | "service"
  | "guide"
  | "journal"
  | "legends"
  | "default";

function icon(paths: string) {
  return `<svg class="dp-pin-svg" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
}

function logo(src: string, alt: string) {
  return `<img class="dp-pin-logo" src="${src}" alt="${alt}" />`;
}

export const pinAssetRegistry: Record<PinVariant, { label: string; glyph: string; asset?: string }> = {
  coffee: { label: "Coffee", glyph: icon('<path d="M5 8h10v5a5 5 0 0 1-10 0V8Z"/><path d="M15 9h2a3 3 0 0 1 0 6h-2"/><path d="M4 20h13"/><path d="M8 4v1M12 4v1"/>') },
  dining: { label: "Dining", glyph: icon('<path d="M7 3v8"/><path d="M4 3v5a3 3 0 0 0 6 0V3"/><path d="M7 11v10"/><path d="M17 3v18"/><path d="M14 3h3a3 3 0 0 1 3 3v5h-6"/>') },
  nightlife: { label: "Nightlife", glyph: icon('<path d="M6 3h12l-5 7v8"/><path d="M9 21h6"/><path d="M8 8h8"/><path d="M18 4l-3 4"/>') },
  wellness: { label: "Wellness", glyph: icon('<path d="M12 21s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.6-7 10-7 10Z"/><path d="M8 12h2l1.5-3 2 6 1.5-3h2"/>') },
  property: { label: "Property", glyph: icon('<path d="M4 21h16"/><path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"/><path d="M9 7h1M14 7h1M9 11h1M14 11h1M9 15h1M14 15h1"/>') },
  residential: { label: "Residential", glyph: icon('<path d="M3 11 12 4l9 7"/><path d="M5 10v11h14V10"/><path d="M9 21v-6h6v6"/>') },
  hotel: { label: "Hotel", glyph: icon('<path d="M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16"/><path d="M7 10h10"/><path d="M7 15h10"/><path d="M9 7h.01M15 7h.01"/>') },
  event: { label: "Event", glyph: icon('<path d="M7 5h10a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V7a2 2 0 0 1 2-2Z"/><path d="M9 9h6"/><path d="M9 13h4"/><path d="M16.5 3.5l1 1.8 2 .4-1.4 1.4.2 2-1.8-.9-1.8.9.3-2-1.5-1.4 2-.4 1-1.8Z"/>') },
  "happy-hour": { label: "Happy Hour", glyph: icon('<path d="M6 3h12l-5 7v8"/><path d="M9 21h6"/><path d="M8 8h8"/><path d="M18 4l-3 4"/><path d="M4 5l1 2 2 .3-1.5 1.4.4 2.1L4 9.8l-1.9 1 .4-2.1L1 7.3 3 7l1-2Z"/>') },
  civic: { label: "Civic", glyph: icon('<path d="M3 10h18"/><path d="M5 10l7-6 7 6"/><path d="M6 10v9M10 10v9M14 10v9M18 10v9"/><path d="M4 21h16"/>') },
  retail: { label: "Retail", glyph: icon('<path d="M6 8h12l-1 13H7L6 8Z"/><path d="M9 8a3 3 0 0 1 6 0"/><path d="M8 13h8"/>') },
  mobility: { label: "Mobility", glyph: icon('<path d="M5 16h14"/><path d="M7 16l2-8h6l2 8"/><circle cx="8" cy="18" r="2"/><circle cx="16" cy="18" r="2"/><path d="M10 11h4"/>') },
  park: { label: "Park", glyph: icon('<path d="M12 21v-8"/><path d="M8 13h8"/><path d="M7 13a5 5 0 1 1 10 0"/><path d="M5 21h14"/>') },
  culture: { label: "Art & Culture", glyph: icon('<path d="M4 20h16"/><path d="M6 20V9l6-5 6 5v11"/><path d="M9 20v-6h6v6"/><path d="M9 10h6"/>') },
  brand: { label: "Brand", glyph: icon('<path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2 7.5 14 3 9.6l6.2-.9L12 3Z"/>') },
  campaign: { label: "Campaign", glyph: icon('<path d="M4 13V7l11-3v12L4 13Z"/><path d="M4 13l2 7h4l-2-6"/><path d="M18 8v4"/>') },
  analytics: { label: "Insights", glyph: icon('<path d="M4 19V5"/><path d="M4 19h16"/><path d="M8 16v-5"/><path d="M12 16V8"/><path d="M16 16v-3"/>') },
  offer: { label: "Perk", glyph: icon('<path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7"/><path d="M2 7h20v5H2z"/><path d="M12 22V7"/><path d="M12 7H8.5A2.5 2.5 0 1 1 11 4.5c0 1.5 1 2.5 1 2.5Z"/><path d="M12 7h3.5A2.5 2.5 0 1 0 13 4.5c0 1.5-1 2.5-1 2.5Z"/>') },
  service: { label: "Service", glyph: icon('<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.9 4.9 7 7M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1"/>') },
  guide: { label: "Local Guide", glyph: icon('<path d="M9 18l-6 3V6l6-3 6 3 6-3v15l-6 3-6-3Z"/><path d="M9 3v15M15 6v15"/>') },
  journal: { label: "Journal", glyph: icon('<path d="M6 4h11a2 2 0 0 1 2 2v14H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"/><path d="M8 8h7M8 12h7M8 16h5"/>') },
  legends: { label: "Legends", glyph: logo("/pins/downtown-perks/legends-logo.avif", "Legends Real Estate") },
  default: { label: "Downtown", glyph: icon('<path d="M12 21s7-5.2 7-11a7 7 0 0 0-14 0c0 5.8 7 11 7 11Z"/><circle cx="12" cy="10" r="2.5"/>') },
};

export function getPinAsset(pinKey: string | undefined) {
  const rawKey = String(pinKey || "default");
  const normalizedKey = rawKey.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const direct = pinAssetRegistry[rawKey as PinVariant] || pinAssetRegistry[normalizedKey as PinVariant];
  const labelMatch = Object.values(pinAssetRegistry).find((item) => {
    const normalizedLabel = item.label.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    return normalizedLabel === normalizedKey;
  });

  if (!direct && !labelMatch && import.meta.env.DEV) {
    console.warn("[PinResolver] Missing mapping", pinKey);
  }

  return direct || labelMatch || pinAssetRegistry.default;
}
