import fs from "node:fs";
import assert from "node:assert/strict";

const auth = fs.readFileSync("src/lib/AuthContext.jsx", "utf8");
const session = fs.readFileSync("src/lib/auth/session.ts", "utf8");

assert.match(auth, /accessContext\?\.platform_role/);
assert.match(auth, /supabaseClient\.rpc\("current_access_context"\)/);
assert.match(auth, /does not have an active access profile/);
assert.match(auth, /supabaseClient\.auth\.getUser\(\)/);
assert.match(auth, /has_global_scope: isPlatformAdmin/);
assert.doesNotMatch(auth, /userMetadata\.(?:platform_role|role|is_super_admin)/);
assert.doesNotMatch(session, /getSuperAdminEmails\(\)\.includes/);
assert.match(session, /session\.platformRole === "super_admin"/);

console.log("Trusted super-admin auth contract verified.");
