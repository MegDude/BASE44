# Security Audit

## Security Rule

3014 owns permissions. 5173 must never bypass authorization through local state, generic entity mutation, hidden UI, or direct provider calls.

## Current Strengths

- OpenAI key is no longer expected in frontend env.
- Agent provider access is routed through backend gateway.
- Product workflow bridge can send audit events to 3014.
- Backend route surface includes audit-oriented mutation paths.

## Current Risks

| Area | Risk | Status |
| --- | --- | --- |
| Authentication | route-level auth enforcement is not proven for every API | needs tests |
| Authorization | tenant/role checks need centralized middleware | needs remediation |
| Generic entity routes | broad CRUD can bypass domain permissions if unguarded | high risk |
| Secrets | backend-only AI key rule is correct, but env must be provisioned | partial |
| Billing | checkout lifecycle must validate plan/tenant/user server-side | partial |
| AI tools | every tool needs permission checks before execution | partial |
| Audit | mutation audit is present in some paths, not guaranteed universal | partial |
| Rate limits | no verified product-wide rate limiting | missing |
| CSRF/XSS | no complete route-by-route proof yet | needs audit |

## Required Remediation

1. Add centralized auth and tenant middleware in 3014.
2. Guard generic entity routes or replace them with typed domain routes for production workflows.
3. Add permission checks inside every agent tool.
4. Add rate limits for AI, search, checkout, QR, RSVP, and redemption endpoints.
5. Add security tests for tenant isolation and role visibility.

## Score

Security score: **5/10** until middleware and tests prove protection across all sensitive routes.
