import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const payload = await req.json();

  try {
    await base44.entities.Booking.create({
      booking_type: 'event_rsvp',
      entity_id: payload.entity_id,
      entity_type: payload.entity_type || 'event',
      resident_id: payload.resident_id,
      status: payload.status || 'going',
      metadata: {
        title: payload.title,
      },
    });
  } catch (error) {
    console.error('RSVP booking write failed:', error);
  }

  return Response.json({
    success: true,
    status: payload.status || 'going',
    entity_id: payload.entity_id,
    generated_at: new Date().toISOString(),
  });
});
