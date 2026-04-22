import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const payload = await req.json();
  const redemptionCode = `DP-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

  try {
    await base44.entities.UserAction.create({
      action_type: 'redeem',
      entity_id: payload.entity_id,
      entity_type: payload.entity_type,
      resident_id: payload.resident_id,
      metadata: {
        venue_id: payload.venue_id,
        title: payload.title,
        redemption_code: redemptionCode,
      },
    });
  } catch (error) {
    console.error('redemption action logging failed:', error);
  }

  return Response.json({
    success: true,
    redemption_code: redemptionCode,
    entity_id: payload.entity_id,
    generated_at: new Date().toISOString(),
  });
});
