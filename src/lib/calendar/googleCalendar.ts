type CalendarEntity = {
  name?: string;
  title?: string;
  description?: string;
  summary?: string;
  address?: string;
  location?: string;
  venue?: string;
  start?: string | Date;
  start_time?: string | Date;
  end?: string | Date;
  end_time?: string | Date;
};

function validDate(value?: string | Date) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function googleDate(value: Date) {
  return value.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

export function buildGoogleCalendarUrl(entity: CalendarEntity, sourceUrl = "") {
  const start = validDate(entity.start || entity.start_time);
  if (!start) return "";
  const end = validDate(entity.end || entity.end_time) || new Date(start.getTime() + 60 * 60 * 1000);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: entity.title || entity.name || "Downtown Perks",
    dates: `${googleDate(start)}/${googleDate(end)}`,
    details: [entity.description || entity.summary, sourceUrl].filter(Boolean).join("\n\n"),
    location: entity.address || entity.location || entity.venue || "",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function calendarEntityFromMapEntity(entity: any, profile: any = {}) {
  const raw = entity?.raw || {};
  return {
    title: profile?.title || entity?.title || entity?.name,
    description: profile?.oneSentence || entity?.description || raw.description,
    address: profile?.address || entity?.address || raw.address || profile?.room || entity?.venue,
    start: profile?.start || entity?.start || entity?.start_time || raw.start || raw.start_time,
    end: profile?.end || entity?.end || entity?.end_time || raw.end || raw.end_time,
  };
}
