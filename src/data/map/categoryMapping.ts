import type { MapEntityKind } from "./mapEntitySchema";

const CATEGORY_KIND_RULES: Array<[RegExp, MapEntityKind]> = [
  [/coffee|cafe|bakery|bagel|tea/i, "cafe"],
  [/restaurant|dining|food|pizza|burger|sushi|mexican|mediterranean|steak|taco/i, "restaurant"],
  [/bar|cocktail|brewery|beer|wine|nightlife|lounge/i, "bar"],
  [/hotel|hospitality|resort/i, "hotel"],
  [/apartment|condo|residential|property|tower|leasing/i, "property"],
  [/shop|retail|store|market|grocery|fashion|eyewear|jewelry/i, "retail"],
  [/fitness|wellness|spa|yoga|pilates|health|salon/i, "wellness"],
  [/park|library|museum|trail|lake|bridge|civic|public|government/i, "civic"],
  [/parking|garage|ev|mobility|transit|station/i, "mobility"],
  [/music|venue|theater|theatre|club|event|entertainment|gallery/i, "venue"],
  [/tour|experience|activity|class|studio/i, "experience"],
  [/service|bank|office|coworking/i, "service"],
];

export function inferMapEntityKind(input = ""): MapEntityKind {
  const match = CATEGORY_KIND_RULES.find(([pattern]) => pattern.test(input));
  return match?.[1] || "venue";
}

export function normalizeCategory(input = "", fallback = "Downtown Place"): string {
  const value = String(input || "").trim();
  return value || fallback;
}
