import {
  requirePartnerMembership,
  requireTransactionDatabase,
  sendTransactionError,
  TransactionApiError,
} from "../../../../src/lib/api/transactionAuth.js";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const database = requireTransactionDatabase();
    const { membership } = await requirePartnerMembership(req);
    const redemptionId = String(req.query?.id || "").trim();
    const reason = String(req.body?.reason || "Not completed by staff").trim().slice(0, 240);
    if (!UUID.test(redemptionId)) throw new TransactionApiError(400, "REDEMPTION_INVALID", "Choose a valid redemption.");
    const { data, error } = await database.rpc("reject_partner_redemption", {
      p_partner_user_id: membership.id,
      p_redemption_id: redemptionId,
      p_reason: reason,
    });
    if (error) throw error;
    return res.status(200).json({ ok: true, ...data });
  } catch (error) {
    return sendTransactionError(res, error);
  }
}
