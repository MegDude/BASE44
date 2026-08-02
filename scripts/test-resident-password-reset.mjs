import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const auth = readFileSync("src/lib/AuthContext.jsx", "utf8");
const signIn = readFileSync("src/pages/ResidentSignIn.jsx", "utf8");
const reset = readFileSync("src/pages/ResidentResetPassword.jsx", "utf8");
const app = readFileSync("src/App.jsx", "utf8");

assert.match(auth, /resetPasswordForEmail\(email, \{ redirectTo: `\$\{window\.location\.origin\}\$\{redirectPath\}` \}\)/, "reset requests must use a verified application redirect");
assert.match(auth, /redirectPath = "\/residents\/reset-password"/, "reset requests must target the dedicated recovery route");
assert.match(signIn, /redirectPath: "\/residents\/reset-password"/, "Forgot password must not send users back to sign-in");
assert.match(app, /path="\/residents\/reset-password"/, "the reset route must be routable after an email handoff");
assert.match(reset, /exchangeCodeForSession/, "PKCE reset links must be exchanged into a recovery session");
assert.match(reset, /PASSWORD_RECOVERY/, "implicit recovery links must be detected");
assert.match(reset, /auth\.updateUser\(\{ password \}\)/, "recovery session must be able to update the password");
assert.match(reset, /auth\.signOut\(\)/, "recovery session must end before the new sign-in");
assert.match(reset, /autoComplete="new-password"/, "password managers must identify new credentials correctly");

console.log("Resident password reset contract: PASS");
