# Closeout

Closeout is a mobile closing-checklist platform designed for independent businesses that use Square. The first workspace and demo use Spike’s Coffee & Tea’s station-based and time-block-based closing structure.

## What is implemented

- Mobile checklist/PWA prototype with completed and exception states, required exception reasons, manager status, sample audit presentation, and a separate simulated clock-out confirmation.
- Multi-tenant PostgreSQL schema for organizations, locations, roles, templates, checklist runs, participants, exceptions, audit events, Square connections, and clock-out attempts.
- Email/password account access and protected organization administration.
- Custom checklist editor supporting stations, time blocks, day-specific tasks, and non-checkable guidance.
- Server-side Square OAuth scaffold with per-organization authorization, encrypted token storage, signed OAuth state, and least-privilege Labor API scopes.
- Vercel project linked to Neon Postgres with database migrations applied.

The employee demo is currently backed by Spike’s imported checklist data in the app bundle. It resets on refresh and does not write to Square. The database-backed run workflow, invitations, Square team-member mapping, webhook reconciliation, and real clock-out execution are the next implementation phase.

## Local setup

1. Install packages with `npm install`.
2. Link the Vercel project and pull Development variables with `vercel link` and `vercel env pull .env.local`.
3. Add the Square application values listed in `.env.example`.
4. Apply migrations with `npm run db:migrate`.
5. Start the app with `npm run dev`.

The current local URL is usually `http://localhost:3000`; use the port printed by Next.js if that port is occupied.

## Checks

- `npm run typecheck`
- `npm run lint`
- `npm run build`

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the Square capability decision, safety model, and rollout plan.
