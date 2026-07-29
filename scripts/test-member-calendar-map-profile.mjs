import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const map = readFileSync(new URL("../src/pages/Map.jsx", import.meta.url), "utf8");
const panel = readFileSync(new URL("../src/components/map/CanonicalDetailPanel.jsx", import.meta.url), "utf8");
const home = readFileSync(new URL("../src/pages/ResidentHome.tsx", import.meta.url), "utf8");
const api = readFileSync(new URL("../api/resident/member-hub.js", import.meta.url), "utf8");
const calendar = readFileSync(new URL("../src/lib/calendar/googleCalendar.ts", import.meta.url), "utf8");

assert.match(calendar, /calendar\.google\.com\/calendar\/render/);
assert.match(calendar, /dates:/);
assert.match(calendar, /location:/);
assert.equal((map.match(/calendarAction: calendarActionHref/g) || []).length, 2);
assert.match(panel, /calendar_add_started/);
assert.match(map, /\{ label: "Dining", filter: "Dining" \},\s*\{ label: "Fitness", filter: "Fitness" \},\s*\{ label: "Wellness", filter: "Wellness" \}/);
assert.match(api, /requireResidentProfile/);
assert.match(api, /resident_saved_entities/);
assert.match(api, /event_rsvps/);
assert.match(api, /perk_redemptions/);
assert.match(api, /private, no-store/);
assert.match(home, /Saved events and places/);
assert.match(home, /Active perks/);
assert.match(home, /Upcoming bookings/);

console.log("Member calendar, category filters, and profile hub contract: PASS");
