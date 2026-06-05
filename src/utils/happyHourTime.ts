import type { HappyHourVenue } from "@/data/happyHourInventory";

type HappyHour = HappyHourVenue["happyHours"][number];

const dayMap: Record<string, number> = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
};

function chicagoDate(date: Date): Date {
  return new Date(date.toLocaleString("en-US", { timeZone: "America/Chicago" }));
}

function parseTime(value: string, fallbackHour?: number): number | null {
  const raw = String(value || "").trim();
  if (!raw || /variants/i.test(raw)) return null;
  if (/all night/i.test(raw)) return fallbackHour ?? 17 * 60;
  if (/close/i.test(raw)) return 24 * 60;
  const match = raw.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i);
  if (!match) return null;
  let hour = Number(match[1]);
  const minutes = Number(match[2] || 0);
  const meridiem = match[3].toUpperCase();
  if (meridiem === "PM" && hour !== 12) hour += 12;
  if (meridiem === "AM" && hour === 12) hour = 0;
  return hour * 60 + minutes;
}

function expandDayRange(start: number, end: number): number[] {
  const days: number[] = [];
  let current = start;
  while (true) {
    days.push(current);
    if (current === end) break;
    current = (current + 1) % 7;
  }
  return days;
}

function activeDays(days: string, current: Date): number[] | null {
  const text = days.toLowerCase();
  if (text.includes("daily") || text.includes("today") || text.includes("featured")) return [current.getDay()];
  const range = text.match(/(sun|mon|tue|wed|thu|fri|sat)\s*[-–]\s*(sun|mon|tue|wed|thu|fri|sat)/i);
  if (range) return expandDayRange(dayMap[range[1].slice(0, 3).toLowerCase()], dayMap[range[2].slice(0, 3).toLowerCase()]);
  const single = Object.keys(dayMap).filter((key) => text.includes(key));
  return single.length ? single.map((key) => dayMap[key]) : null;
}

function getWindow(happyHour: HappyHour, currentDate: Date) {
  const current = chicagoDate(currentDate);
  const days = activeDays(happyHour.days, current);
  const start = parseTime(happyHour.startTime, 17 * 60);
  const end = parseTime(happyHour.endTime, 18 * 60);
  if (!days || start === null || end === null) return null;
  return { days, start, end, now: current.getHours() * 60 + current.getMinutes(), today: current.getDay() };
}

export function getTodayHappyHours(happyHours: HappyHour[], currentDate = new Date()): HappyHour[] {
  return happyHours.filter((item) => {
    const window = getWindow(item, currentDate);
    return window ? window.days.includes(window.today) : false;
  });
}

export function isHappyHourLiveNow(happyHours: HappyHour[], currentDate = new Date()): boolean {
  return happyHours.some((item) => {
    const window = getWindow(item, currentDate);
    if (!window || !window.days.includes(window.today)) return false;
    return window.now >= window.start && window.now <= window.end;
  });
}

export function isHappyHourStartingSoon(happyHours: HappyHour[], currentDate = new Date()): boolean {
  return happyHours.some((item) => {
    const window = getWindow(item, currentDate);
    if (!window || !window.days.includes(window.today)) return false;
    return window.start > window.now && window.start - window.now <= 90;
  });
}

export function sortHappyHoursByRelevance(
  venues: HappyHourVenue[],
  currentDate = new Date(),
  options: { focusDistrict?: string; savedVenueIds?: Set<string> } = {},
): HappyHourVenue[] {
  const saved = options.savedVenueIds || new Set<string>();
  return [...venues].sort((a, b) => {
    const score = (venue: HappyHourVenue) =>
      (isHappyHourLiveNow(venue.happyHours, currentDate) ? 100 : 0) +
      (isHappyHourStartingSoon(venue.happyHours, currentDate) ? 80 : 0) +
      (venue.featured ? 60 : 0) +
      (options.focusDistrict && venue.district === options.focusDistrict ? 40 : 0) +
      (saved.has(venue.id) ? 20 : 0);
    return score(b) - score(a) || a.name.localeCompare(b.name);
  });
}
