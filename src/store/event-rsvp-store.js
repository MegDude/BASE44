import { create } from "zustand";
import { persist } from "zustand/middleware";

function normalizeEvent(event, source = "resident") {
  const date = event?.date instanceof Date ? event.date : new Date(event?.dateISO || event?.date || Date.now());
  return {
    id: event.id,
    title: event.title,
    dateISO: date.toISOString(),
    time: event.time,
    venue: event.venue,
    category: event.category,
    going: event.going,
    image: event.image,
    imageAlt: event.imageAlt,
    description: event.description,
    source,
    rsvpedAt: new Date().toISOString(),
  };
}

export const useEventRsvpStore = create(
  persist(
    (set, get) => ({
      rsvps: [],

      addRsvp: (event, source = "resident") =>
        set((state) => {
          const rsvp = normalizeEvent(event, source);
          const existing = state.rsvps.filter((item) => item.id !== rsvp.id);
          return { rsvps: [rsvp, ...existing].slice(0, 50) };
        }),

      removeRsvp: (eventId) =>
        set((state) => ({
          rsvps: state.rsvps.filter((item) => item.id !== eventId),
        })),

      isRsvped: (eventId) => get().rsvps.some((item) => item.id === eventId),
    }),
    {
      name: "downtown-perks-event-rsvps",
    }
  )
);
