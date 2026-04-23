import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const payload = await req.json();

  try {
    await base44.entities.UserAction.create({
      action_type: payload.action,
      entity_id: payload.entity_id,
      entity_type: payload.entity_type,
      resident_id: payload.resident_id,
      metadata: {
        query: payload.query,
        ...(payload.metadata || {}),
      },
    });
  } catch (error) {
    console.error('interaction logging failed:', error);
  }

  return Response.json({
    success: true,
    action: payload.action,
    entity_id: payload.entity_id,
    generated_at: new Date().toISOString(),
  });
});
