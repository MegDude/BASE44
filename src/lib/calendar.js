const EVENT_DURATION_MS = 2 * 60 * 60 * 1000;
const PERK_DURATION_MS = 60 * 60 * 1000;

export function downloadCalendarEntry(item) {
  const details = buildCalendarDetails(item);
  const ics = buildICS(details);
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${slugify(details.title || 'calendar-entry')}.ics`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(url);
}

function buildCalendarDetails(item) {
  const type = inferType(item);
  const titleSource = item?.title || item?.name || item?.venue_name || 'Calendar entry';
  const title = type === 'perk' ? `Use perk: ${titleSource}` : titleSource;
  const startSource = item?.date || item?.valid_from || item?.metadata?.date || item?.metadata?.valid_from || item?.eventTiming?.startTime;
  const endSource = item?.end_date || item?.valid_until || item?.metadata?.end_date || item?.metadata?.valid_until;

  const start = parseDate(startSource) || new Date();
  const fallbackDuration = type === 'event' ? EVENT_DURATION_MS : PERK_DURATION_MS;
  let end = parseDate(endSource) || new Date(start.getTime() + fallbackDuration);
  if (end <= start) end = new Date(start.getTime() + fallbackDuration);

  const location = [item?.venue_name, item?.address].filter(Boolean).join(' — ') || item?.address || item?.venue_name || '';
  const description = [
    item?.description,
    item?.perk_description,
    item?.perk?.value ? `Perk: ${item.perk.value}` : '',
    item?.perk_value ? `Perk: ${item.perk_value}` : '',
    item?.is_members_only ? 'Members only access.' : '',
  ]
    .filter(Boolean)
    .join('\n\n');

  return { title, start, end, location, description };
}

function buildICS({ title, start, end, location, description }) {
  const stamp = formatICSDate(new Date());
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Base44//Personal Calendar//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${crypto.randomUUID()}`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${formatICSDate(start)}`,
    `DTEND:${formatICSDate(end)}`,
    `SUMMARY:${escapeICS(title)}`,
    `LOCATION:${escapeICS(location)}`,
    `DESCRIPTION:${escapeICS(description)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

function inferType(item) {
  if (item?.type === 'event' || item?.event_id) return 'event';
  if (item?.type === 'perk' || item?.perk?.value || item?.perk_value || item?.perk_description) return 'perk';
  return 'item';
}

function parseDate(value) {
  const date = new Date(value || '');
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatICSDate(date) {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

function escapeICS(value) {
  return String(value || '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

function slugify(value) {
  return String(value || 'calendar-entry')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'calendar-entry';
}