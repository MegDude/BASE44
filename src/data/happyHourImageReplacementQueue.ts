import { happyHourInventory } from "./happyHourInventory";

export const happyHourImageReplacementQueue = happyHourInventory
  .filter((venue) => venue.images.imageStatus !== "verified")
  .map((venue) => ({
    venueName: venue.name,
    reason: venue.images.imageStatus === "fallback" ? "fallback" : "missing",
    preferredImageType: venue.category.toLowerCase().includes("rooftop")
      ? "patio"
      : venue.category.toLowerCase().includes("bar") || venue.category.toLowerCase().includes("cocktail")
        ? "bar scene"
        : "food and drink",
    notes: venue.images.imageStatus === "fallback"
      ? "Happy Hour Austin provided a fallback image. Replace with a venue-specific image before approval."
      : "No venue-specific image is attached. Source exterior, interior, food and drink, patio, or bar scene imagery.",
  })) as Array<{
    venueName: string;
    reason: "missing" | "fallback" | "generic-editorial";
    preferredImageType: "venue exterior" | "interior" | "food and drink" | "patio" | "bar scene";
    notes: string;
  }>;
