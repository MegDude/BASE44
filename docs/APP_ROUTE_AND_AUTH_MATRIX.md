# App route and auth matrix

| Surface | Canonical direct route | Guest | Resident | Partner | Restricted admin | Super admin |
| --- | --- | --- | --- | --- | --- | --- |
| Resident Home | `/map?mode=resident&tab=map&filter=Featured&collection=downtown-perks-featured` | Public | Public plus account state | Public resident view | Public resident view | Public resident view |
| Resident Card | `/map?mode=resident&tab=pass` | Sign-in prompt; no fabricated card | Own card only | No resident card privilege | No resident card privilege | No resident card privilege |
| Map entity deep link | `/map?...&entityId=<canonical-id>` | Public entity | Public entity plus resident actions | Partner presentation mode only when requested | No implicit admin scope | No implicit admin scope |
| Auth callback | `/auth/callback` | Completes provider callback | Resident-safe `returnTo` | Partner callback requires partner role | Routes to admin command center | Routes to admin command center |
| Partner audience | `/partner-workspace/audience` | Partner sign-in | Redirect to resident map | Requires live membership and `partner_id` | Admin studio unless impersonating | Admin studio unless impersonating |
| Partner connections | `/partner-workspace/connections` | Partner sign-in | Redirect to resident map | Requires live membership and server scope | Admin studio unless impersonating | Admin studio unless impersonating |
| Admin studio | `/admin-studio/command-center` | Partner sign-in | Partner workspace redirect, then resident role guard | Partner workspace | Allowed only with active admin profile | Allowed with active super-admin profile |

`returnTo` accepts only same-origin absolute paths, rejects protocol-relative, external, backslash-host, credential-bearing, callback, and sign-in loops. Expired sessions are treated as signed out. Missing partner membership never unlocks a sample workspace.

Manual authenticated QA is blocked without dedicated staging accounts. Do not use production credentials or create browser-only role overrides.
