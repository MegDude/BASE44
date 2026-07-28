import { supabaseServer } from "../../src/lib/supabaseServer.js";
import {
  requireAuthenticatedUser,
  sendTransactionError,
  TransactionApiError,
} from "../../src/lib/api/transactionAuth.js";

const ADMIN_ROLES = new Set(["admin", "platform_admin", "super_admin"]);

async function requirePlatformAdmin(req) {
  const user = await requireAuthenticatedUser(req);
  const appRole = String(
    user.app_metadata?.platform_role ||
    user.app_metadata?.role ||
    "",
  ).toLowerCase();

  const { data: profile, error } = await supabaseServer
    .from("platform_profiles")
    .select("platform_role,is_active,is_super_admin")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    throw new TransactionApiError(500, "ADMIN_PROFILE_LOOKUP_FAILED", "Administrator access could not be verified.");
  }

  const profileRole = String(profile?.platform_role || "").toLowerCase();
  const isAdmin =
    profile?.is_active !== false &&
    (profile?.is_super_admin === true || ADMIN_ROLES.has(profileRole) || ADMIN_ROLES.has(appRole));
  if (!isAdmin) {
    throw new TransactionApiError(403, "ADMIN_ACCESS_REQUIRED", "Administrator access is required.");
  }
  return user;
}

function indexBy(rows, field) {
  return new Map((rows || []).map((row) => [row[field], row]));
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method not allowed." });
  }

  try {
    await requirePlatformAdmin(req);

    const [
      authResult,
      platformResult,
      residentResult,
      onboardingResult,
      membershipResult,
      signupResult,
      partnerRegistrationResult,
      partnerUserResult,
      organizationResult,
      portfolioResult,
      listingResult,
      listingAccessResult,
    ] = await Promise.all([
      supabaseServer.auth.admin.listUsers({ page: 1, perPage: 1000 }),
      supabaseServer.from("platform_profiles").select("user_id,email,platform_role,is_active,is_super_admin,protected_account,created_at"),
      supabaseServer.from("resident_profiles").select("id,auth_user_id,user_id,email,first_name,last_name,resident_status,building_id,profile_completion,created_at"),
      supabaseServer.from("resident_onboarding_profiles").select("user_id,completed,residence,created_at"),
      supabaseServer.from("resident_memberships").select("id,resident_id,membership_type,status,building_id,renewal_date,expires_at,created_at"),
      supabaseServer.from("resident_signup_events").select("auth_user_id,event_type,status,error_message,created_at").order("created_at", { ascending: false }),
      supabaseServer.from("partner_registrations").select("id,organization_name,partner_type,contact_name,contact_email,status,selected_plan,created_at"),
      supabaseServer.from("partner_users").select("id,partner_id,auth_user_id,role,active,created_at"),
      supabaseServer.from("partner_organizations").select("id,legacy_partner_id,name,organization_type,status,created_at"),
      supabaseServer.from("partner_portfolios").select("id,organization_id,name,status,created_at"),
      supabaseServer.from("partner_listings").select("id,organization_id,portfolio_id,entity_id,name,listing_type,status,created_at"),
      supabaseServer.from("partner_user_listing_access").select("partner_user_id,listing_id,can_view,can_publish,can_manage_redemptions"),
    ]);

    const queryErrors = [
      authResult.error,
      platformResult.error,
      residentResult.error,
      onboardingResult.error,
      membershipResult.error,
      signupResult.error,
      partnerRegistrationResult.error,
      partnerUserResult.error,
      organizationResult.error,
      portfolioResult.error,
      listingResult.error,
      listingAccessResult.error,
    ].filter(Boolean);
    if (queryErrors.length) {
      throw new TransactionApiError(500, "ACCOUNT_SUMMARY_FAILED", "Account records could not be loaded.");
    }

    const platformByUser = indexBy(platformResult.data, "user_id");
    const residentByUser = new Map(
      (residentResult.data || []).map((row) => [row.auth_user_id || row.user_id, row]),
    );
    const onboardingByUser = indexBy(onboardingResult.data, "user_id");
    const partnerByUser = indexBy(partnerUserResult.data, "auth_user_id");
    const latestSignupByUser = new Map();
    for (const event of signupResult.data || []) {
      if (!latestSignupByUser.has(event.auth_user_id)) latestSignupByUser.set(event.auth_user_id, event);
    }

    const accounts = (authResult.data?.users || []).map((user) => {
      const platform = platformByUser.get(user.id) || null;
      const resident = residentByUser.get(user.id) || null;
      const partner = partnerByUser.get(user.id) || null;
      const onboarding = onboardingByUser.get(user.id) || null;
      const signup = latestSignupByUser.get(user.id) || null;
      return {
        id: user.id,
        email: user.email || platform?.email || resident?.email || "",
        fullName: user.user_metadata?.full_name || [resident?.first_name, resident?.last_name].filter(Boolean).join(" ") || "",
        emailConfirmed: Boolean(user.email_confirmed_at),
        lastSignInAt: user.last_sign_in_at || null,
        createdAt: user.created_at,
        platformRole: platform?.platform_role || user.app_metadata?.role || "resident",
        active: platform?.is_active !== false,
        superAdmin: platform?.is_super_admin === true || user.app_metadata?.is_super_admin === true,
        protectedAccount: platform?.protected_account === true,
        resident: resident ? {
          id: resident.id,
          status: resident.resident_status,
          buildingId: resident.building_id,
          profileCompletion: resident.profile_completion,
          onboardingComplete: onboarding?.completed === true,
          residence: onboarding?.residence || "",
        } : null,
        partner: partner ? {
          id: partner.id,
          partnerId: partner.partner_id,
          role: partner.role,
          active: partner.active,
        } : null,
        latestSignupEvent: signup ? {
          type: signup.event_type,
          status: signup.status,
          error: signup.error_message,
          createdAt: signup.created_at,
        } : null,
      };
    });

    const payload = {
      ok: true,
      generatedAt: new Date().toISOString(),
      summary: {
        accounts: accounts.length,
        confirmedAccounts: accounts.filter((account) => account.emailConfirmed).length,
        activeAccounts: accounts.filter((account) => account.active).length,
        residents: residentResult.data?.length || 0,
        completedResidentOnboarding: (onboardingResult.data || []).filter((row) => row.completed).length,
        activeResidentMemberships: (membershipResult.data || []).filter((row) => row.status === "active").length,
        partnerRegistrations: partnerRegistrationResult.data?.length || 0,
        activePartnerUsers: (partnerUserResult.data || []).filter((row) => row.active).length,
        partnerOrganizations: organizationResult.data?.length || 0,
        partnerPortfolios: portfolioResult.data?.length || 0,
        partnerListings: listingResult.data?.length || 0,
        partnerListingAccessGrants: (listingAccessResult.data || []).filter((row) => row.can_view).length,
      },
      accounts,
      partnerRegistrations: partnerRegistrationResult.data || [],
      partnerOrganizations: organizationResult.data || [],
      partnerPortfolios: portfolioResult.data || [],
      partnerListings: listingResult.data || [],
    };

    res.setHeader("Cache-Control", "private, no-store");
    return res.status(200).json(payload);
  } catch (error) {
    return sendTransactionError(res, error);
  }
}
