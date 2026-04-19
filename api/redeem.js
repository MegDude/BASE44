import { supabaseServer } from '../src/lib/supabaseServer.js';
import { z } from 'zod';

const redeemSchema = z.object({
  cardCode: z.string().trim().min(1),
  venueOfferId: z.string().trim().min(1),
  venueId: z.string().trim().min(1)
});

const getValidationMessage = (issues) => issues.map((issue) => issue.message).join(', ');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!supabaseServer) {
    return res.status(500).json({ error: 'Missing Supabase server environment variables' });
  }

  const parsedBody = redeemSchema.safeParse(req.body ?? {});
  if (!parsedBody.success) {
    return res.status(400).json({ error: getValidationMessage(parsedBody.error.issues) || 'Invalid request body' });
  }

  const { cardCode, venueOfferId, venueId } = parsedBody.data;

  const { data: card, error: cardError } = await supabaseServer
    .from('perk_cards')
    .select('id')
    .eq('card_code', cardCode)
    .maybeSingle();

  if (cardError) {
    return res.status(500).json({ error: cardError.message });
  }

  if (!card) {
    return res.status(400).json({ error: 'Card not found' });
  }

  const { error: redemptionError } = await supabaseServer.from('redemptions').insert({
    perk_card_id: card.id,
    venue_offer_id: venueOfferId,
    venue_id: venueId
  });

  if (redemptionError) {
    return res.status(500).json({ error: redemptionError.message });
  }

  return res.status(200).json({ ok: true });
}
