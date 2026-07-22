import { MAP_INTENT_REGISTRY } from "../map/searchIntent/mapIntentRegistry";
import { DOWNTOWN_CORE_RESTAURANT_RECORDS } from "./downtownCoreRestaurantPerks";

const INKIND_PROGRAM_ID = "inkind";

function normalizeList(value: unknown): string[] {
  const values = Array.isArray(value) ? value : value ? [value] : [];
  return [...new Set(values.map((item) => String(item || "").trim().toLowerCase()).filter(Boolean))];
}

function reconcileSearchTerms(value: unknown, includeInKind: boolean): string[] {
  const values = Array.isArray(value) ? value : value ? [value] : [];
  const withoutInKind = values
    .map((item) => String(item || "").trim())
    .filter(Boolean)
    .filter((item) => !/^in[\s-]?kind$/i.test(item));
  return includeInKind ? [...new Set([...withoutInKind, "inKind"])] : [...new Set(withoutInKind)];
}

/**
 * Program membership must come from an explicit verification field.
 * Legacy partnerType / partnerNetwork defaults are intentionally not proof:
 * the downtown-core restaurant builder previously assigned them to every row.
 */
export function hasExplicitVerifiedInKindMembership(record: Record<string, any>): boolean {
  const verificationStatus = String(
    record.inKindVerificationStatus ||
      record.inkindVerificationStatus ||
      record.programVerificationStatus ||
      "",
  )
    .trim()
    .toLowerCase();

  return Boolean(
    record.isInKind === true ||
      record.inKindVerified === true ||
      record.inkindVerified === true ||
      verificationStatus === "verified" ||
      normalizeList(record.verifiedPrograms).includes(INKIND_PROGRAM_ID),
  );
}

function reconcileRestaurantProgramMembership(record: Record<string, any>): void {
  const isVerifiedInKind = hasExplicitVerifiedInKindMembership(record);
  const programs = normalizeList(record.programs);
  const applicableIntents = normalizeList(record.applicableIntents).filter(
    (intent) => intent !== INKIND_PROGRAM_ID,
  );

  // The primary place identity controls the glyph. Programs remain secondary metadata.
  record.entityType = "restaurant";
  record.kind = "venue";
  record.pinKey = "dining";
  record.isInKind = isVerifiedInKind;
  record.partnerType = isVerifiedInKind ? INKIND_PROGRAM_ID : "venues";
  record.programs = isVerifiedInKind
    ? [...new Set([...programs, INKIND_PROGRAM_ID])]
    : programs.filter((program) => program !== INKIND_PROGRAM_ID);
  record.applicableIntents = isVerifiedInKind
    ? [...new Set([...applicableIntents, INKIND_PROGRAM_ID])]
    : applicableIntents;
  record.tags = reconcileSearchTerms(record.tags, isVerifiedInKind);
  record.searchKeywords = reconcileSearchTerms(record.searchKeywords, isVerifiedInKind);

  if (isVerifiedInKind) {
    record.partnerNetwork = INKIND_PROGRAM_ID;
  } else {
    delete record.partnerNetwork;
  }
}

for (const restaurant of DOWNTOWN_CORE_RESTAURANT_RECORDS as Array<Record<string, any>>) {
  reconcileRestaurantProgramMembership(restaurant);
}

/**
 * The inKind rail is a program layer, not a synonym for every restaurant.
 * Keep its explicit brand / collection evidence and query vocabulary, while
 * removing the broad type/category clauses that previously matched all venues.
 */
const inKindIntent = MAP_INTENT_REGISTRY.find(
  (intent) => intent.id === INKIND_PROGRAM_ID && intent.mode === "resident",
);

if (inKindIntent) {
  inKindIntent.entityTypes = undefined;
  inKindIntent.categories = undefined;
  inKindIntent.brandIds = [INKIND_PROGRAM_ID];
  inKindIntent.collectionIds = ["inkind-dining-market"];
  inKindIntent.searchTerms = ["inkind", "in kind", "inkind restaurants"];
}
