import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);

    if (!user?.email) {
      return Response.json({ error: 'Please sign in to manage your bookings.' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const action = String(body.action || 'list').trim().toLowerCase();

    if (action === 'list') {
      const bookings = await listBookings(base44, user.email, Boolean(body.include_cancelled));
      const events = await listEvents(base44);
      const eventMap = new Map(events.map((event) => [event.id, event]));

      return Response.json({
        success: true,
        action,
        count: bookings.length,
        items: bookings.map((booking) => formatBooking(booking, eventMap.get(booking.event_id))),
        generated_at: new Date().toISOString(),
      });
    }

    if (action === 'create') {
      const eventId = String(body.event_id || '').trim();
      if (!eventId) {
        return Response.json({ error: 'event_id is required to create a booking.' }, { status: 400 });
      }

      const event = await findEvent(base44, eventId);
      if (!event) {
        return Response.json({ error: 'Event not found.' }, { status: 404 });
      }

      const existingBookings = await listBookings(base44, user.email, true);
      const existing = existingBookings.find((booking) => booking.event_id === eventId && booking.status !== 'cancelled');
      if (existing) {
        return Response.json({
          success: true,
          action,
          message: 'You already have a booking for this event.',
          booking: formatBooking(existing, event),
          generated_at: new Date().toISOString(),
        });
      }

      const booking = await base44.asServiceRole.entities.Booking.create({
        type: 'event_rsvp',
        user_email: user.email,
        event_id: event.id,
        venue_id: String(body.venue_id || ''),
        party_size: clampPartySize(body.party_size),
        booking_date: event.date || new Date().toISOString(),
        booking_time: toTimeString(event.date),
        duration_minutes: toDurationMinutes(event.date, event.end_date),
        special_requests: String(body.special_requests || '').trim(),
        status: 'confirmed',
        confirmation_code: createConfirmationCode(),
      });

      return Response.json({
        success: true,
        action,
        message: 'Booking confirmed.',
        booking: formatBooking(booking, event),
        generated_at: new Date().toISOString(),
      });
    }

    if (action === 'cancel') {
      const bookingId = String(body.booking_id || '').trim();
      if (!bookingId) {
        return Response.json({ error: 'booking_id is required to cancel a booking.' }, { status: 400 });
      }

      const bookings = await listBookings(base44, user.email, true);
      const booking = bookings.find((item) => item.id === bookingId);
      if (!booking) {
        return Response.json({ error: 'Booking not found.' }, { status: 404 });
      }

      const updated = await base44.asServiceRole.entities.Booking.update(booking.id, {
        status: 'cancelled',
      });

      const event = booking.event_id ? await findEvent(base44, booking.event_id) : null;

      return Response.json({
        success: true,
        action,
        message: 'Booking cancelled.',
        booking: formatBooking(updated, event),
        generated_at: new Date().toISOString(),
      });
    }

    return Response.json({ error: 'Unsupported action. Use list, create, or cancel.' }, { status: 400 });
  } catch (error) {
    console.error('manageMemberBookings error:', error);
    return Response.json({ error: error.message || 'Unable to manage member bookings.' }, { status: 500 });
  }
});

async function listBookings(base44, userEmail, includeCancelled) {
  const rows = await base44.asServiceRole.entities.Booking.filter({
    user_email: userEmail,
    type: 'event_rsvp',
  }, '-booking_date', 100).catch(() => []);

  const bookings = Array.isArray(rows) ? rows : [];
  return includeCancelled ? bookings : bookings.filter((booking) => booking.status !== 'cancelled');
}

async function listEvents(base44) {
  const rows = await base44.asServiceRole.entities.Event.list('-date', 300).catch(() => []);
  return Array.isArray(rows) ? rows : [];
}

async function findEvent(base44, eventId) {
  const rows = await base44.asServiceRole.entities.Event.filter({ id: eventId }, '-updated_date', 1).catch(() => []);
  return Array.isArray(rows) ? rows[0] || null : null;
}

function formatBooking(booking, event) {
  return {
    id: booking.id,
    type: booking.type,
    status: booking.status,
    event_id: booking.event_id,
    event_title: event?.title || null,
    event_date: event?.date || booking.booking_date,
    venue_name: event?.venue_name || null,
    address: event?.address || null,
    party_size: booking.party_size || 1,
    confirmation_code: booking.confirmation_code || null,
    special_requests: booking.special_requests || '',
  };
}

function clampPartySize(value) {
  const partySize = Number(value);
  if (!Number.isFinite(partySize) || partySize < 1) return 1;
  return Math.min(Math.round(partySize), 10);
}

function toTimeString(dateValue) {
  const date = new Date(dateValue || Date.now());
  if (Number.isNaN(date.getTime())) return '18:00';
  return `${String(date.getUTCHours()).padStart(2, '0')}:${String(date.getUTCMinutes()).padStart(2, '0')}`;
}

function toDurationMinutes(startValue, endValue) {
  const start = Date.parse(startValue || '');
  const end = Date.parse(endValue || '');
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return 60;
  return Math.max(30, Math.round((end - start) / 60000));
}

function createConfirmationCode() {
  return crypto.randomUUID().split('-')[0].toUpperCase();
}