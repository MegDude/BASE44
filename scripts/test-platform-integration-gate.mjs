import fs from 'node:fs';

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const failures = [];
const requireMatch = (name, source, pattern, message) => {
  if (!pattern.test(source)) failures.push(`${name}: ${message}`);
};

const app = read('src/App.jsx');
const auth = read('src/lib/AuthContext.jsx');
const access = read('src/pages/partners/Access.jsx');
const adminStudio = read('src/pages/AdminMarketingStudio.jsx');
const main = read('src/main.jsx');
const panel = read('src/components/map/CanonicalDetailPanel.jsx');
const fixedActions = read('src/styles/detail-panel-fixed-actions-final.css');
const drawerGeometry = read('src/styles/native-drawer-geometry-final.css');
const panelCohesion = read('src/styles/platform-panel-cohesion-final.css');
const savedApi = read('api/resident/saved.js');

requireMatch('routes', app, /partners\/sign-in/, 'partner sign-in route is missing');
requireMatch('routes', app, /partners\/campaigns/, 'partner campaigns route is missing');
requireMatch('routes', app, /partner-workspace\/overview/, 'partner workspace overview route is missing');
requireMatch('routes', app, /admin-studio\/approval-queue/, 'admin approval queue route is missing');
requireMatch('routes', app, /auth\/callback/, 'authentication callback route is missing');
requireMatch('routes', app, /map/, 'map route is missing');
requireMatch('routes', app, /pricing/, 'pricing route is missing');
requireMatch('routes', app, /partners\/sign-up/, 'partner signup route is missing');

requireMatch('auth', auth, /signInWithOtp/, 'partner magic-link sign-in is missing');
requireMatch('auth', auth, /signInWithPassword/, 'password sign-in is missing');
requireMatch('auth', auth, /signUp\(/, 'resident account registration is missing');
requireMatch('auth', auth, /provider:\s*["']google["']/, 'Google sign-in is missing');
requireMatch('auth', auth, /provider:\s*["']apple["']/, 'Apple sign-in is missing');
requireMatch('auth', auth, /super_admin/, 'super-admin role hydration is missing');
requireMatch('auth', auth, /platform_admin/, 'platform-admin role hydration is missing');
requireMatch('auth', auth, /partner_type/, 'partner type hydration is missing');

requireMatch('access', access, /getSuperAdminEmails/, 'super-admin email allowlist is not connected');
requireMatch('access', access, /isSuperAdminSession/, 'super-admin session detection is not connected');
requireMatch('access', access, /Request team access/, 'team-access recovery path is missing');
requireMatch('access', access, /Send sign-in link/, 'secure sign-in action is missing');

requireMatch('admin studio', adminStudio, /useAuth\(\)/, 'admin studio does not derive its session from the shared auth context');
requireMatch('admin studio', adminStudio, /!isAuthenticated/, 'anonymous admin access is not rejected');
requireMatch('admin studio', adminStudio, /admin["'],\s*["']platform_admin["'],\s*["']super_admin/, 'admin role allowlist is missing');
requireMatch('admin studio', adminStudio, /to="\/partners\/sign-in"/, 'anonymous admin users are not routed to secure sign-in');
requireMatch('admin studio', adminStudio, /to="\/partner-workspace\/overview"/, 'non-admin users are not returned to the partner workspace');

requireMatch('resident saved API', savedApi, /requireResidentProfile\(req\)/, 'resident identity is not derived from authentication');
requireMatch('resident saved API', savedApi, /dp_set_resident_saved_entity/, 'deployed saved-entity RPC compatibility is missing');
requireMatch('resident saved API', savedApi, /set_resident_saved_entity/, 'migration saved-entity RPC compatibility is missing');
requireMatch('resident saved API', savedApi, /PGRST202/, 'missing-RPC fallback is not constrained to PostgREST schema errors');

requireMatch('detail panel', panel, /createPortal\(actions,\s*drawerHost\)/, 'canonical actions are not mounted in the drawer shell footer');
requireMatch('detail panel', panel, /aria-pressed=\{saved\}/, 'save state is not accessible');
requireMatch('detail panel', fixedActions, />\s*\.dp-canonical-detail-actions/, 'actions are not direct children of the drawer shell');
requireMatch('detail panel', fixedActions, /position:\s*relative\s*!important/, 'shell footer is not anchored in its dedicated drawer grid row');
requireMatch('detail panel', fixedActions, /overflow-y:\s*auto\s*!important/, 'drawer content does not retain its own scroll viewport');
requireMatch('detail panel', fixedActions, /grid-template-rows:\s*auto minmax\(0,\s*1fr\) auto/, 'drawer does not reserve a dedicated action-footer row');
requireMatch('detail panel', drawerGeometry, /grid-template-rows:\s*auto minmax\(0, 1fr\) auto/, 'drawer geometry contract is missing');

for (const selector of [
  'dp-partner-access-page',
  'dp-campaigns-page',
  'dp-partner-workspace-page',
  'dp-os-studio-page',
  'dp-map-page',
]) {
  requireMatch('panel cohesion', panelCohesion, new RegExp(selector), `${selector} is missing from the shared bright-white surface contract`);
}
requireMatch('panel cohesion', panelCohesion, /background:\s*var\(--dp-cohesion-white\)\s*!important/, 'bright-white surface lock is missing');
requireMatch('panel cohesion', panelCohesion, /box-shadow:\s*none\s*!important/, 'decorative shadow removal is missing');
requireMatch('panel cohesion', panelCohesion, /border-radius:\s*0\s*!important/, 'filled card and capsule shape removal is missing');

const actionsImport = main.indexOf('detail-panel-fixed-actions-final.css');
const geometryImport = main.indexOf('native-drawer-geometry-final.css');
const cohesionImport = main.indexOf('platform-panel-cohesion-final.css');
if (actionsImport < 0) failures.push('styles: fixed action footer lock is not imported');
if (geometryImport < 0) failures.push('styles: native drawer geometry is not imported');
if (cohesionImport < 0) failures.push('styles: platform panel cohesion lock is not imported');
if (actionsImport >= 0 && geometryImport >= 0 && actionsImport < geometryImport) {
  failures.push('styles: fixed action footer lock must load after native drawer geometry');
}
if (cohesionImport >= 0 && cohesionImport < actionsImport) {
  failures.push('styles: panel cohesion lock must load after the action and geometry locks');
}

if (failures.length) {
  console.error('\nPlatform integration gate failed:\n');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Platform integration gate passed: routes, auth, admin authorization, resident save transactions, drawer geometry, fixed actions, and cohesive bright-white surfaces are connected.');
