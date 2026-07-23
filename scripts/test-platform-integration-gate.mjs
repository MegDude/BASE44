import fs from 'node:fs';

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const failures = [];
const requireMatch = (name, source, pattern, message) => {
  if (!pattern.test(source)) failures.push(`${name}: ${message}`);
};

const app = read('src/App.jsx');
const auth = read('src/lib/AuthContext.jsx');
const access = read('src/pages/partners/Access.jsx');
const main = read('src/main.jsx');
const panel = read('src/components/map/CanonicalDetailPanel.jsx');
const fixedActions = read('src/styles/detail-panel-fixed-actions-final.css');
const drawerGeometry = read('src/styles/native-drawer-geometry-final.css');
const savedApi = read('api/resident/saved.js');

requireMatch('routes', app, /partners\/sign-in/, 'partner sign-in route is missing');
requireMatch('routes', app, /partner-workspace/, 'partner workspace route is missing');
requireMatch('routes', app, /auth\/callback/, 'authentication callback route is missing');
requireMatch('routes', app, /map/, 'map route is missing');

requireMatch('auth', auth, /signInWithOtp/, 'partner magic-link sign-in is missing');
requireMatch('auth', auth, /signInWithPassword/, 'password sign-in is missing');
requireMatch('auth', auth, /super_admin/, 'super-admin role hydration is missing');
requireMatch('auth', auth, /platform_admin/, 'platform-admin role hydration is missing');
requireMatch('auth', auth, /partner_type/, 'partner type hydration is missing');

requireMatch('access', access, /getSuperAdminEmails/, 'super-admin email allowlist is not connected');
requireMatch('access', access, /isSuperAdminSession/, 'super-admin session detection is not connected');
requireMatch('access', access, /Request team access/, 'team-access recovery path is missing');
requireMatch('access', access, /Send sign-in link/, 'secure sign-in action is missing');

requireMatch('resident saved API', savedApi, /requireResidentProfile\(req\)/, 'resident identity is not derived from authentication');
requireMatch('resident saved API', savedApi, /dp_set_resident_saved_entity/, 'deployed saved-entity RPC compatibility is missing');
requireMatch('resident saved API', savedApi, /set_resident_saved_entity/, 'migration saved-entity RPC compatibility is missing');
requireMatch('resident saved API', savedApi, /PGRST202/, 'missing-RPC fallback is not constrained to PostgREST schema errors');

requireMatch('detail panel', panel, /dp-native-detail-panel__actions/, 'canonical action footer is missing');
requireMatch('detail panel', panel, /aria-pressed=\{saved\}/, 'save state is not accessible');
requireMatch('detail panel', fixedActions, /position:\s*fixed\s*!important/, 'actions are not anchored to the drawer viewport');
requireMatch('detail panel', fixedActions, /overflow-y:\s*auto\s*!important/, 'drawer content does not retain its own scroll viewport');
requireMatch('detail panel', fixedActions, /padding-bottom:\s*84px\s*!important/, 'scroll content does not reserve space for fixed actions');
requireMatch('detail panel', drawerGeometry, /grid-template-rows:\s*auto minmax\(0, 1fr\) auto/, 'drawer geometry contract is missing');

const actionsImport = main.indexOf('detail-panel-fixed-actions-final.css');
const geometryImport = main.indexOf('native-drawer-geometry-final.css');
if (actionsImport < 0) failures.push('styles: fixed action footer lock is not imported');
if (geometryImport < 0) failures.push('styles: native drawer geometry is not imported');
if (actionsImport >= 0 && geometryImport >= 0 && actionsImport < geometryImport) {
  failures.push('styles: fixed action footer lock must load after native drawer geometry');
}

if (failures.length) {
  console.error('\nPlatform integration gate failed:\n');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Platform integration gate passed: routes, auth, super-admin access, resident save transactions, drawer geometry, and fixed action footer are connected.');
