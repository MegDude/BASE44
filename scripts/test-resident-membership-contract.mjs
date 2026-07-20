import fs from "node:fs";
import assert from "node:assert/strict";

const app = fs.readFileSync("src/App.jsx", "utf8");
const nav = fs.readFileSync("src/components/Navbar.jsx", "utf8");
const page = fs.readFileSync("src/pages/ResidentMembership.tsx", "utf8");
const welcome = fs.readFileSync("src/pages/ResidentWelcome.tsx", "utf8");
const client = fs.readFileSync("src/lib/residentMembership/residentMembershipClient.ts", "utf8");
const pricing = fs.readFileSync("src/pages/Pricing.jsx", "utf8");

assert.match(app, /path="\/residents\/membership"/);
assert.match(app, /path="\/residents\/login"/);
assert.match(app, /path="\/residents\/welcome"/);
assert.match(nav, /\/residents\/membership/);
assert.match(page, /\$25/);
assert.match(client, /resident_membership_included/);
assert.match(client, /\/api\/residents\/membership\/start/);
assert.match(welcome, /getResidentMembership/);
assert.match(welcome, /mapContext/);
assert.doesNotMatch(pricing, /ResidentMembership/);
assert.doesNotMatch(pricing, /residents\/membership/);
console.log("resident membership contract: pass");
