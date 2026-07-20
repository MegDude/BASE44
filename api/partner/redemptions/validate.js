import {
  hashOpaqueToken,
  readOpaqueToken,
  requirePartnerMembership,
  requireTransactionDatabase,
  sendTransactionError,
  TransactionApiError,
} from "../../../src/lib/api/transactionAuth.js";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function publicError(error) {
  const message = String(error?.message || "");
  if (message.includes("QR_INVALID_OR_EXPIRED")) return new TransactionApiError(410, "QR_EXPIRED", "This resident code has expired. Ask the resident to refresh their pass.");
  if (message.includes("PERK_NOT_APPLICABLE")) return new TransactionApiError(409, "PERK_NOT_APPLICABLE", "This perk is not available at this location.");
  if (message.includes("USAGE_LIMIT_REACHED")) return new TransactionApiError(409, "USAGE_LIMIT_REACHED", "This resident has already used this perk.");
  return error;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const database = requireTransactionDatabase();
    const { membership } = await requirePartnerMembership(req);
    const token = readOpaqueToken(req.body?.token);
    const idempotencyKey = String(req.body?.idempotencyKey || "").trim().slice(0, 180);
    const locationId = String(req.body?.locationId || "").trim();
    if (token.length < 32) throw new TransactionApiError(400, "TOKEN_REQUIRED", "Scan a valid resident pass.");
    if (idempotencyKey.length < 8) throw new TransactionApiError(400, "IDEMPOTENCY_KEY_REQUIRED", "Start a new scan and try again.");
    if (locationId && !UUID.test(locationId)) throw new TransactionApiError(400, "LOCATION_INVALID", "Choose a valid partner location.");

    const { data: result, error } = await database.rpc("validate_partner_redemption", {
      p_partner_user_id: membership.id,
      p_token_hash: hashOpaqueToken(token),
      p_location_id: locationId || null,
      p_idempotency_key: idempotencyKey,
    });
    if (error) throw publicError(error);

    const redemptionId = result?.redemption_id;
    const { data: redemption, error: redemptionError } = await database
      .from("perk_redemptions")
      .select("id,status,perk:perks(id,title,discount_type,discount_value,complimentary_item,terms),resident:resident_profiles(first_name,last_name,building_id)")
      .eq("id", redemptionId)
      .eq("partner_id", membership.partner_id)
      .single();
    if (redemptionError || !redemption) throw redemptionError || new Error("redemption_not_found");

    const resident = Array.isArray(redemption.resident) ? redemption.resident[0] : redemption.resident;
    const perk = Array.isArray(redemption.perk) ? redemption.perk[0] : redemption.perk;
    const displayName = [resident?.first_name, resident?.last_name?.slice(0, 1) ? `${resident.last_name.slice(0, 1)}.` : ""].filter(Boolean).join(" ") || "Verified resident";
    return res.status(200).json({
      ok: true,
      redemptionId,
      status: result?.status || redemption.status,
      idempotentReplay: Boolean(result?.idempotent_replay),
      resident: { displayName, buildingName: null, eligibilityStatus: "eligible" },
      perk: {
        id: perk?.id,
        title: perk?.title || "Resident perk",
        discountType: perk?.discount_type || result?.discount_type || "custom",
        discountValue: perk?.discount_value ?? result?.discount_value,
        complimentaryItem: perk?.complimentary_item || result?.complimentary_item,
        terms: perk?.terms || null,
      },
      expiresAt: result?.expires_at,
    });
  } catch (error) {
    return sendTransactionError(res, error);
  }
}
