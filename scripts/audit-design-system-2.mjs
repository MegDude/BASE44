#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { extname, relative, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const scanAll = process.argv.includes('--all');
const supported = new Set(['.css', '.js', '.jsx', '.ts', '.tsx']);
const exempt = new Set([
  'src/styles/design-system-2.css',
  'src/data/mapStyle.ts',
]);

const rules = [
  { id: 'hardcoded-color', message: 'Use a --dp-* color token', pattern: /(?:#[\da-f]{3,8}\b|\b(?:rgb|hsl)a?\s*\()/i },
  { id: 'pill-radius', message: 'Pill/capsule controls are prohibited', pattern: /(?:rounded-full|border-radius\s*:\s*(?:999|9999)px)/i },
  { id: 'arbitrary-radius', message: 'Use the approved --dp-radius-* scale', pattern: /border-radius\s*:\s*(?!var\(--dp-radius-)(?:\d+(?:\.\d+)?)(?:px|rem)/i },
  { id: 'heavy-shadow', message: 'Use --dp-shadow-* restrained elevation', pattern: /(?:drop-shadow-(?:xl|2xl)|shadow-(?:xl|2xl)|box-shadow\s*:(?!\s*var\(--dp-shadow-))/i },
  { id: 'glassmorphism', message: 'Glassmorphism and heavy blur are prohibited', pattern: /(?:backdrop-filter\s*:\s*blur|backdrop-blur-(?:md|lg|xl|2xl|3xl))/i },
  { id: 'decorative-gradient', message: 'Gradients require an approved hero/media exception', pattern: /(?:bg-gradient-to-|(?:linear|radial)-gradient\s*\()/i },
  { id: 'tailwind-default-palette', message: 'Map Tailwind colors to Downtown Perks tokens', pattern: /\b(?:bg|text|border|ring|from|to|via)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/ },
];

function git(args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8' });
}

function changedLines() {
  const output = git(['diff', '--unified=0', '--no-color', 'HEAD', '--', 'src', 'tailwind.config.js']);
  const entries = [];
  let file = null;
  let line = 0;
  for (const raw of output.split('\n')) {
    if (raw.startsWith('+++ b/')) file = raw.slice(6);
    else if (raw.startsWith('@@')) {
      const match = raw.match(/\+(\d+)/);
      line = match ? Number(match[1]) : 0;
    } else if (raw.startsWith('+') && !raw.startsWith('+++')) {
      entries.push({ file, line, text: raw.slice(1) });
      line += 1;
    } else if (!raw.startsWith('-')) line += 1;
  }
  return entries.filter((entry) => entry.file && supported.has(extname(entry.file)));
}

function allLines() {
  const files = git(['ls-files', 'src', 'tailwind.config.js'])
    .trim()
    .split('\n')
    .filter((file) => file && supported.has(extname(file)));
  return files.flatMap((file) => readFileSync(resolve(root, file), 'utf8')
    .split('\n')
    .map((text, index) => ({ file, line: index + 1, text })));
}

const findings = [];
for (const entry of scanAll ? allLines() : changedLines()) {
  if (exempt.has(entry.file) || entry.text.trim().startsWith('//')) continue;
  for (const rule of rules) {
    if (rule.pattern.test(entry.text)) findings.push({ ...entry, ...rule });
  }
}

const mode = scanAll ? 'full inventory' : 'changed code gate';
if (!findings.length) {
  console.log(`Design System 2.0 ${mode}: PASS`);
  process.exit(0);
}

console.error(`Design System 2.0 ${mode}: ${findings.length} violation(s)`);
for (const finding of findings.slice(0, 120)) {
  console.error(`${relative(root, resolve(root, finding.file))}:${finding.line} [${finding.id}] ${finding.message}`);
}
if (findings.length > 120) console.error(`…and ${findings.length - 120} more`);

// The full inventory documents inherited debt. The changed-code mode is the merge gate.
process.exit(scanAll ? 0 : 1);
