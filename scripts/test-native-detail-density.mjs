import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync("src/styles/interface-density-regression-lock.css", "utf8");
const start = css.indexOf("Native map detail density authority");
const end = css.indexOf("html body #root#root#root#root#root#root#root#root", start);
const contract = css.slice(start, end);

assert.ok(start >= 0, "native map detail density authority is missing");
assert.ok(end > start, "native map detail density authority boundary is missing");
assert.match(contract, /grid-template-rows: 56px minmax\(0, 1fr\) !important/);
assert.match(contract, /grid-template-rows: 12px 44px !important/);
assert.match(contract, /min-height: 44px !important/);
assert.match(contract, /aspect-ratio: 16 \/ 9 !important/);
assert.match(contract, /max-height: 210px !important/);
assert.match(contract, /font-size: clamp\(21px, 5\.7vw, 25px\) !important/);
assert.match(contract, /padding: 16px 16px 14px !important/);
assert.match(contract, /padding: 16px 0 !important/);
assert.match(contract, /font-size: 15px !important/);
assert.match(contract, /grid-template-columns: 48px minmax\(0, 1fr\) 16px !important/);
assert.match(contract, /padding: 6px 16px calc\(6px \+ env\(safe-area-inset-bottom, 0px\)\) !important/);
assert.match(contract, /max-height: calc\(100dvh - var\(--dp-native-detail-bottom, 64px\)\) !important/);
assert.doesNotMatch(contract, /font-size: clamp\((?:2[7-9]|3\d)px/);

console.log("Compact native map detail header, media, content, rail, and actions: PASS");
