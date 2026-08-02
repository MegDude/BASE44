import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const tokens = readFileSync("src/styles/platform-tokens.css", "utf8");
const main = readFileSync("src/main.jsx", "utf8");

const requiredTokenSnippets = [
  "--dp-color-surface: #FFFFFF",
  "--dp-color-navy: #0B1F33",
  "--dp-color-navy-secondary: #132238",
  "--dp-color-gold: #C8A96A",
  "--dp-color-text: #0B1F33",
  "--dp-color-text-muted: #24384D",
  "--dp-text-primary: #0B1F33",
  "--dp-text-secondary: #24384D",
  "--dp-text-tertiary: #385067",
  "--dp-text-disabled: #52697D",
  "--dp-border-default: rgba(11, 31, 51, 0.14)",
  "--dp-color-focus: #C8A96A",
  "--dp-space-1: 4px",
  "--dp-space-2: 8px",
  "--dp-space-3: 12px",
  "--dp-space-4: 16px",
  "--dp-space-5: 24px",
  "--dp-space-6: 32px",
  "--dp-space-7: 48px",
  "--dp-space-8: 64px",
  "--dp-control-min: 44px",
  "--dp-header-height: 56px",
  "--dp-bottom-nav-clearance: 12px",
  "--dp-gutter-mobile: 16px",
  "--dp-gutter-tablet: 24px",
  "--dp-gutter-desktop: 32px",
  "--dp-content-max: 1280px",
  "--dp-reading-max: 720px",
  "--dp-panel-max: 440px",
  "--dp-section-tight: 24px",
  "--dp-section-standard: 32px",
  "--dp-section-generous: 48px",
  "--dp-row-min-height: 56px",
  "--dp-motion-fast: 140ms",
  "--dp-motion-standard: 200ms",
  "--dp-motion-slow: 280ms",
  "--dp-ease-out: cubic-bezier(0.22, 1, 0.36, 1)",
  "--dp-glow-gold: 0 0 0 3px rgba(200, 169, 106, 0.18)",
  "--dp-glow-navy: 0 0 0 3px rgba(11, 31, 51, 0.08)",
];
for (const expected of requiredTokenSnippets) assert.ok(tokens.includes(expected), `${expected} missing`);

const requiredTypeTokens = [
  "--dp-type-display: 600 40px/44px",
  "--dp-type-h1: 600 32px/38px",
  "--dp-type-h2: 600 24px/30px",
  "--dp-type-h3: 600 18px/24px",
  "--dp-type-body: 400 16px/24px",
  "--dp-type-body-small: 400 14px/20px",
  "--dp-type-label: 600 12px/16px",
  "--dp-type-eyebrow: 600 11px/14px",
  "--dp-type-display: 600 32px/36px",
  "--dp-type-h1: 600 28px/34px",
  "--dp-type-h2: 600 22px/28px",
];
for (const expected of requiredTypeTokens) assert.ok(tokens.includes(expected), `${expected} missing`);

for (const className of ["dp-surface--white", "dp-surface--navy", "dp-surface--gold"]) {
  assert.match(tokens, new RegExp(`\\.${className}\\s*\\{[\\s\\S]*?background:`), `${className} must define a background`);
  assert.match(tokens, new RegExp(`\\.${className}\\s*\\{[\\s\\S]*?color:`), `${className} must define foreground color`);
}
assert.match(tokens, /\.dp-surface--white\s*\{[\s\S]*?background:\s*#FFFFFF;[\s\S]*?color:\s*#0B1F33;/, "White surfaces must use navy foreground");
assert.match(tokens, /\.dp-surface--navy\s*\{[\s\S]*?background:\s*#0B1F33;[\s\S]*?color:\s*#FFFFFF;/, "Navy surfaces must use white foreground");
assert.match(tokens, /\.dp-surface--gold\s*\{[\s\S]*?background:\s*#C8A96A;[\s\S]*?color:\s*#0B1F33;/, "Gold surfaces must use navy foreground");
assert.match(tokens, /\.dp-surface--image::before[\s\S]*background:\s*rgba\(11, 31, 51, 0\.72\)/, "Image surfaces must use a controlled navy overlay before text");
assert.match(tokens, /\[disabled\][\s\S]*color:\s*var\(--dp-text-disabled\);[\s\S]*opacity:\s*1;/, "Disabled controls must stay legible and not rely on opacity fading");
assert.match(tokens, /focus-visible[\s\S]*outline:\s*2px solid #C8A96A[\s\S]*box-shadow:\s*var\(--dp-glow-gold\)/, "Focus treatment must use gold ring plus soft glow");
assert.match(tokens, /\.dp-button:hover,[\s\S]*\.dp-action-row:hover[\s\S]*transform:\s*translateY\(-1px\);[\s\S]*box-shadow:\s*var\(--dp-glow-navy\)/, "Buttons and action rows need restrained hover lift/glow");
assert.match(tokens, /\.dp-button:active,[\s\S]*\.dp-action-row:active[\s\S]*transform:\s*translateY\(1px\) scale\(0\.985\);[\s\S]*transition-duration:\s*80ms;/, "Buttons and action rows need tactile press feedback under 300ms");
assert.match(tokens, /\.dp-text-link:hover,[\s\S]*\.dp-text-link:focus-visible[\s\S]*text-decoration-line:\s*underline;/, "Text CTAs need underline feedback");
assert.match(tokens, /\.dp-action-row:hover svg:last-child[\s\S]*transform:\s*translateX\(3px\);/, "Action row chevrons need subtle forward motion");
assert.match(tokens, /@media \(prefers-reduced-motion: reduce\)[\s\S]*animation-duration:\s*1ms !important;[\s\S]*transition-duration:\s*1ms !important;/, "Reduced-motion mode must clamp animation and transition duration");
assert.match(tokens, /\.dp-layout-grid[\s\S]*width:\s*min\(100%, var\(--dp-content-max\)\);[\s\S]*padding-inline:\s*var\(--dp-gutter-mobile\);/, "Layout grid must use content max and mobile gutter tokens");
assert.doesNotMatch(tokens, /\.dp-surface--white\s*\{[^}]*color:\s*#FFFFFF/i, "White surface cannot use white foreground");
assert.doesNotMatch(tokens, /\.dp-surface--navy\s*\{[^}]*color:\s*#0B1F33/i, "Navy surface cannot use navy foreground");
assert.doesNotMatch(tokens, /animation-iteration-count:\s*infinite/i, "Platform foundation must not introduce looping decorative animations");
assert.doesNotMatch(tokens, /(?:margin|padding|gap):[^;]*(?:13px|19px|27px)/, "Platform foundation must not use explicitly banned arbitrary spacing values");
assert.ok(
  main.indexOf('import "@/styles/platform-tokens.css"') > main.indexOf('import "@/styles/canonical-surface-system.css"'),
  "Platform tokens must load after canonical surface system styles",
);
assert.ok(
  main.indexOf('import "@/styles/search-console-readable-rail-final.css"') > main.indexOf('import "@/styles/platform-tokens.css"'),
  "Search rail readability lock must still load after platform tokens",
);

function hexToRgb(hex) {
  const value = hex.replace("#", "");
  return [0, 2, 4].map((offset) => Number.parseInt(value.slice(offset, offset + 2), 16) / 255);
}
function channel(value) {
  return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}
function luminance(hex) {
  const [r, g, b] = hexToRgb(hex).map(channel);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a, b) {
  const lighter = Math.max(luminance(a), luminance(b));
  const darker = Math.min(luminance(a), luminance(b));
  return (lighter + 0.05) / (darker + 0.05);
}
assert.ok(contrast("#FFFFFF", "#0B1F33") >= 4.5, "White/primary text contrast must pass WCAG AA");
assert.ok(contrast("#FFFFFF", "#24384D") >= 4.5, "White/secondary text contrast must pass WCAG AA");
assert.ok(contrast("#FFFFFF", "#385067") >= 4.5, "White/tertiary text contrast must pass WCAG AA");
assert.ok(contrast("#FFFFFF", "#52697D") >= 4.5, "White/disabled text contrast must pass WCAG AA");
assert.ok(contrast("#C8A96A", "#0B1F33") >= 4.5, "Gold/navy standard text contrast must pass WCAG AA");

console.log("Platform design-system contrast contract: PASS");
