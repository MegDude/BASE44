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
    const idempotencyKey = String(req.body?.idempotencyKey || "").trim().slice(0, 180);
    const originalAmount = req.body?.originalAmount === undefined || req.body?.originalAmount === null || req.body?.originalAmount === ""
      ? null
      : Number(req.body.originalAmount);
    if (!UUID.test(redemptionId)) throw new TransactionApiError(400, "REDEMPTION_INVALID", "Choose a valid redemption.");
    if (idempotencyKey.length < 8) throw new TransactionApiError(400, "IDEMPOTENCY_KEY_REQUIRED", "Start the completion step again.");
    if (originalAmount !== null && (!Number.isFinite(originalAmount) || originalAmount < 0)) {
      throw new TransactionApiError(400, "AMOUNT_INVALID", "Enter a valid transaction amount.");
    }

    const { data, error } = await database.rpc("complete_partner_redemption", {
      p_partner_user_id: membership.id,
      p_redemption_id: redemptionId,
      p_idempotency_key: idempotencyKey,
      p_original_amount: originalAmount,
    });
    if (error) {
      const message = String(error.message || "");
      if (message.includes("ORIGINAL_AMOUNT_REQUIRED")) throw new TransactionApiError(400, "AMOUNT_REQUIRED", "Enter the original transaction amount.");
      if (message.includes("REDEMPTION_NOT_FOUND")) throw new TransactionApiError(404, "REDEMPTION_NOT_FOUND", "This redemption could not be found.");
      if (message.includes("REDEMPTION_NOT_VALIDATED")) throw new TransactionApiError(409, "REDEMPTION_NOT_VALIDATED", "Validate the resident pass before completing the perk.");
      if (message.includes("REDEMPTION_EXPIRED")) throw new TransactionApiError(410, "REDEMPTION_EXPIRED", "This confirmation expired. Ask the resident to refresh the perk code.");
      throw error;
    }

    return res.status(200).json({ ok: true, ...data });
  } catch (error) {
    return sendTransactionError(res, error);
  }
}
