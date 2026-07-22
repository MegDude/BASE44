export type ResidentAccount = {
  id?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  buildingName?: string;
  buildingDistrict?: string;
  unitNumber?: string;
  verificationStatus?: string;
  membershipSource?: string;
  membershipType?: string;
  renewalDate?: string;
  expiresAt?: string;
  moveInDate?: string;
  profileCompletion?: number;
  interests?: string[];
  notifications?: Record<string, unknown>;
  joinedAt?: string;
  personalizedMap?: boolean;
  savedCount?: number;
};

export type ResidentMembershipContext = {
  profile?: Record<string, unknown>;
  membership?: Record<string, unknown> | null;
  saved?: unknown[];
  preferences?: Record<string, unknown> | null;
  mapContext?: { path?: string; personalized?: boolean };
};

type AuthenticatedResident = {
  id?: string;
  email?: string;
  full_name?: string;
  name?: string;
};

function stringValue(...values: unknown[]) {
  const value = values.find((item) => typeof item === "string" && item.trim());
  return typeof value === "string" ? value.trim() : "";
}

function stringList(...values: unknown[]) {
  const value = values.find(Array.isArray);
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item).trim()).filter(Boolean);
}

export function residentAccountFromContext(
  context: ResidentMembershipContext | null | undefined,
  user: AuthenticatedResident | null | undefined,
  fallback: ResidentAccount | null = null,
): ResidentAccount | null {
  const profile = context?.profile || {};
  const membership = context?.membership || {};
  const preferences = context?.preferences || {};
  const building = (membership.resident_membership_buildings || {}) as Record<string, unknown>;
  const firstName = profile.first_name || profile.firstName || "";
  const lastName = profile.last_name || profile.lastName || "";
  const profileName = profile.full_name || profile.fullName || [firstName, lastName].filter(Boolean).join(" ");
  const fullName = stringValue(profileName, user?.full_name, user?.name, fallback?.fullName, user?.email);
  const id = stringValue(profile.id, profile.resident_id, user?.id, fallback?.id);

  if (!id && !fullName && !user?.email && !profile.email) return null;

  return {
    ...fallback,
    id,
    fullName,
    email: stringValue(profile.email, user?.email, fallback?.email),
    phone: stringValue(profile.phone, fallback?.phone),
    buildingName: stringValue(profile.building_name, membership.building_name, building.name, fallback?.buildingName),
    buildingDistrict: stringValue(profile.building_district, profile.district, membership.building_district, membership.district, building.district, fallback?.buildingDistrict),
    unitNumber: stringValue(profile.apartment, profile.unit_number, fallback?.unitNumber),
    verificationStatus: stringValue(membership.status, profile.verification_status, fallback?.verificationStatus, "active"),
    membershipSource: stringValue(membership.source, profile.membership_source, fallback?.membershipSource),
    membershipType: stringValue(membership.membership_type, profile.membership_type, fallback?.membershipType),
    renewalDate: stringValue(membership.renewal_date, membership.current_period_end, fallback?.renewalDate),
    expiresAt: stringValue(membership.expires_at, fallback?.expiresAt),
    moveInDate: stringValue(profile.move_in_date, profile.moveInDate, fallback?.moveInDate),
    profileCompletion: Number(profile.profile_completion ?? fallback?.profileCompletion ?? 0),
    interests: stringList(profile.interests, preferences.interests, preferences.categories, fallback?.interests),
    notifications: (profile.notification_preferences || preferences.notifications || preferences.notification_preferences || fallback?.notifications || {}) as Record<string, unknown>,
    joinedAt: stringValue(membership.created_at, profile.created_at, fallback?.joinedAt),
    personalizedMap: Boolean(context?.mapContext?.personalized ?? fallback?.personalizedMap),
    savedCount: Array.isArray(context?.saved) ? context.saved.length : fallback?.savedCount,
  };
}

export function residentAccountStatus(account: ResidentAccount | null | undefined) {
  const status = String(account?.verificationStatus || "").toLowerCase();
  if (status === "verified") return "Verified resident";
  if (status === "active") return "Active resident";
  if (status === "past_due") return "Payment needs attention";
  if (status === "canceling") return "Active until renewal";
  return status ? status.replace(/[_-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()) : "Resident account";
}
