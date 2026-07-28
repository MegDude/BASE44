import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(path, "utf8");

const mapSource = read("src/pages/Map.jsx");
const iconRegistry = read("src/lib/map/mapIconRegistry.ts");
const authContext = read("src/lib/AuthContext.jsx");
const accessPage = read("src/pages/partners/Access.jsx");
const callbackPage = read("src/pages/AuthCallbackPage.jsx");
const returnPath = read("src/lib/authReturnPath.ts");
const session = read("src/lib/auth/session.ts");
const panelCss = read("src/styles/platform-panel-mobile-cohesion-final.css");
const app = read("src/App.jsx");

assert.match(mapSource, /resolveCanonicalLegendsDirectoryPlaces/);
assert.doesNotMatch(mapSource, /legendsDirectoryPlaces\.length \|\| discoverDisplayPlaces\.length/);
assert.match(mapSource, /\{legendsDirectoryPlaces\.length\} active/);
assert.match(iconRegistry, /legends-logo-gold\.svg/);
assert.match(mapSource, /LEGENDS_PIN_LOGO = LEGENDS_PIN_ASSET/);
assert.match(panelCss, /aside\.dp-legends-directory-sheet[\s\S]*width:\s*100%\s*!important/);
assert.match(panelCss, /bottom:\s*calc\(var\(--dp-bottom-nav-total-height[\s\S]*- 10px\)\s*!important/);
assert.match(panelCss, /padding-bottom:\s*0\s*!important/);

assert.match(authContext, /shouldCreateUser:\s*false/);
assert.match(authContext, /type:\s*"link_sent"/);
assert.match(authContext, /type:\s*rateLimited \? "rate_limited" : "delivery_failed"/);
assert.match(accessPage, /audience=partner&returnTo/);
assert.match(accessPage, /submissionState\(session\?\.type === "link_sent" \? "success" : "error"\)/);
assert.match(callbackPage, /audience === "partner"/);
assert.match(callbackPage, /partner_access_required/);
assert.match(returnPath, /normalizeAuthReturnPath/);
assert.match(returnPath, /isSafeFirstPartyPath/);
assert.match(session, /never grant browser access/);
assert.match(app, /partners\/sign-in\?returnTo=/);

console.log("PR #100 Legends directory, panel geometry, returnTo, callback, failure-state, and authorization contracts: PASS");
