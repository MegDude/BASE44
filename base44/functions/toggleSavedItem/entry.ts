import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const payload = await req.json();

  await createAction(base44, {
    ...payload,
    action_type: 'save',
  });

  return Response.json({
    success: true,
    saved: true,
    entity_id: payload.entity_id,
    generated_at: new Date().toISOString(),
  });
});

async function createAction(base44, payload) {
  try {
    await base44.entities.UserAction.create({
      action_type: payload.action_type,
      entity_id: payload.entity_id,
      entity_type: payload.entity_type,
      resident_id: payload.resident_id,
      metadata: {
        title: payload.title,
      },
    });
  } catch (error) {
    console.error('toggleSavedItem action logging failed:', error);
  }
}
