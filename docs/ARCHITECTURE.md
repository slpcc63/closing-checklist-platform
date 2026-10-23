# Spike’s Close: Square integration architecture

Verified against Square developer documentation on August 4, 2026.

## Square capability decision

Square does not expose a uniquely named employee “clock-out” operation. The supported action is to close an open `Timecard` with `PUT /v2/labor/timecards/{id}` and an `end_at` value. Use the `Timecard` endpoints introduced in Square API version `2025-05-21`; the former `Shift` endpoints retired on May 21, 2026.

Required production OAuth scopes for this app are:

- `MERCHANT_PROFILE_READ`: identify Spike’s Square locations.
- `EMPLOYEES_READ`: sync active team members and their location assignments.
- `TIMECARDS_READ`: locate and re-read the employee’s open timecard.
- `TIMECARDS_WRITE`: close that timecard by updating `end_at`.

The app does not need timecard settings permissions unless it later manages break types or workweek settings. Square’s current endpoint reference and Labor guide both identify `TIMECARDS_READ` plus `TIMECARDS_WRITE` for `UpdateTimecard`. One row in the broad OAuth permissions table currently lists settings scopes for that method; treat that row as a documentation inconsistency and verify the requested scopes in Square Sandbox before production approval.

## Safest production shape

1. A manager connects the Spike’s seller account once through Square’s server-side OAuth code flow. Access and refresh tokens stay encrypted at rest and are never sent to an employee’s browser.
2. Employees sign in to Closeout with an application account. The initial build uses email and password, with magic-link or passkey access planned before production. Square OAuth authenticates the seller, not individual team members, and Square does not provide employee SSO. Each verified app identity is explicitly mapped to one `square_team_member_id` by a manager.
3. The server finds the signed-in employee’s single open Square timecard at the configured location and binds its ID/version to that employee’s participant record for the shared nightly checklist run.
4. Every task mutation is authorized server-side, revision-checked, and appended to an immutable audit event stream. Exceptions require a trimmed reason of at least eight characters.
5. When every task is `done` or `exception`, the run becomes `ready`; no Square mutation occurs yet.
6. The employee selects **Review & clock out**, sees the timecard’s start time plus exception count, and confirms. The server issues a one-use, short-lived confirmation nonce.
7. On confirmation, a transaction rechecks run completeness and consumes the nonce. The server then re-fetches the timecard, verifies team member, location, `OPEN` status, version, and that all breaks have `end_at`.
8. The server writes an attempt record before calling Square, uses a stable idempotency key, updates `end_at`, verifies the returned status is `CLOSED`, and records success. A `labor.timecard.updated` webhook reconciles the final Square state.

## Modes and fallback

Default mode is **unlock with confirmation**. This is the recommended launch mode and is what the prototype shows.

An optional **automatic closeout** policy can be added only after Sandbox and limited-location testing. It still needs a manager-enabled location policy, a visible countdown with cancel, no open breaks, no unresolved tasks, a current timecard version, and an audit entry. It should never run in the background without a recent employee action.

If the Square connection lacks write permission, a timecard has an open break, the version changed, or Square is unavailable, the app must not guess. It marks the checklist complete, shows **Checklist complete — clock out in Square**, deep-links or instructs the employee to use the Square Team/POS clock, alerts the manager, and later reconciles through the timecard webhook.

## Data and authorization boundaries

- Employees can read their assigned run, resolve their tasks, and request closeout only for their own mapped Square team member ID.
- Managers are allowlisted per location and can see runs, acknowledge exceptions, edit templates, and export audit history. They cannot silently impersonate an employee.
- OAuth tokens and identity-provider secrets are server-only secrets. Logs redact tokens, employee contact data, and exception text unless viewed through an authorized audit screen.
- All writes carry actor, server timestamp, prior/new state, run, device/session identifier, and request correlation ID.
- Square webhook signatures must be verified and event IDs deduplicated before applying updates.

## Rollout

1. Review the imported `Spike's Coffee & Tea Closing Checklist.docx` template in the app. Its “Throughout Shift” bullets are informational station guidance and do not block clock-out; timed and day-specific checkbox items are required.
2. Configure an identity provider and manager-owned team-member mapping.
3. Create a Square Sandbox application with the four least-privilege scopes above.
4. Wire the employee UI to PostgreSQL-backed server actions, then test complete, exception, reopen, open-break, stale-version, revoked-token, duplicate-tap, and Square-outage cases.
5. Pilot at one location in fallback-only mode, then enable confirmed API clock-out after payroll review.
