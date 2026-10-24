# Repository guidance

This is the shared guidance for coding agents working on Adventure Oracle. It
consolidates the former `CLAUDE.md` and `.cursorrules` notes, checked against the
repository. Tool-specific local permissions in `.claude/settings.local.json`
remain local settings, not repository-wide authorization.

## Project and architecture

Adventure Oracle is a fifth-edition tabletop companion. Accounts, campaign
creation/joining, character creation, and a locally stored rules reference are
implemented. Shared screens, synchronized play, and AI narration are planned;
see `ROADMAP.md` and `docs/DESIGN.md` before describing them as existing features.

- Nuxt 4 and Vue 3 with strict TypeScript, Vite, and Tailwind CSS 3.
  `nuxt.config.ts` disables SSR. Pages, layouts, components, composables, plugins,
  and stores live in the repository root, not an `app/` directory.
- Nitro API handlers live in `server/api/`. Campaign and character handlers use
  services in `server/services/`, backed by prepared SQLite statements in
  `server/datastores/`. Shared database types are in `server/db/types.ts`.
  There is no `server/db/queries.ts`.
- Pinia provides client state. `plugins/pinia-persistedstate.client.ts` installs
  localStorage persistence; `stores/auth.ts` persists only the user profile.
- Utilities include `lodash-es`, `ms`, and Zod. Styled-components is not installed.
- `npm run test:offline` uses Node’s built-in test runner for isolated setup,
  bundled rules, and the non-production account with network calls blocked.

## Local development and commands

Use Node.js 22.18.0 (`.nvmrc`; the package supports Node 22 from 22.18.0) and npm
with the checked-in `package-lock.json`.

| Command | Purpose |
| --- | --- |
| `npm ci` | Install locked dependencies; needs network or a sufficient local cache |
| `npm run setup:local` | Create missing `.env`, apply migrations, and seed bundled rules locally |
| `npm run dev` / `npm start` | Automatically run local setup, then start Nuxt development |
| `npm run db:migrate` / `npm run db:migrate:up` | Apply app and auth migrations; requires `.env` |
| `npm run db:migrate:down` | Roll back the latest app migration |
| `npm run db:migrate:down:all` | Roll back all app migrations |
| `npm run open5e:seed` | Seed empty rules categories from the bundled SRD 5.1 snapshot |
| `npm run open5e:update-snapshot` | Explicitly download and rebuild the pinned snapshot |
| `npm run open5e:init` | Legacy online import of missing rules categories |
| `npm run typecheck` | Run `vue-tsc --noEmit` |
| `npm run lint` / `npm run lint:fix` | Check ESLint rules / apply automatic fixes |
| `npm run build` | Typecheck, then build the production app |
| `npm run preview` | Preview the production build |
| `npm run generate` | Generate static output; server API features still need a backend |

- Fresh checkouts must start offline after dependencies are installed. Preserve
  automatic local setup; do not introduce CLI downloads or remote services into
  startup or migrations.
- `scripts/setup-local.mjs` creates a missing `.env` with a random auth secret,
  preserves existing configuration, and initializes `data/game.db`. Non-production
  setup creates `local@test.com` / `testingtesting` if absent, using Better Auth
  without weakening password requirements. Never seed this account in production.
- Fresh databases are seeded offline from `data/open5e/srd-5.1.json`. Preserve
  populated categories and user data. The bundle includes SRD 5.1 only; A5E
  needs record-level verification before inclusion. Legacy online imports allow
  SRD 5.1 and A5E. Preserve source credits, the snapshot manifest, and
  `THIRD_PARTY_NOTICES.md` when changing imports.
- Do not commit local secrets, `.env`, SQLite files, dependencies, or generated
  Nuxt/build output.
- Do not start the development server on your own initiative. Ask the user to
  run it when needed, unless they have already authorized you to start it.

## Authentication and database

- Use the existing Better Auth integration for authentication and sessions.
  Do not add custom JWT issuance, refresh flows, or session-cookie management.
- The client is created with `better-auth/vue` in `stores/auth.ts`; reuse the
  store for component authentication actions.
- `server/utils/better-auth.ts` configures SQLite-backed email/password auth.
  `server/api/auth/[...auth].ts` delegates `/api/auth/**` requests to its handler.
  Protected application handlers obtain sessions with
  `auth.api.getSession({ headers: event.headers })` and enforce access server-side.
- Auth tables are `user`, `session`, `account`, and `verification`. The auth
  session table is `session`, not `auth_session`; persisted client user data
  does not replace server session checks.
- `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL` configure auth. Local setup supplies
  them through `.env`; Better Auth runs locally without a hosted service.
- `server/db/migrations/001_initial.sql` creates campaigns, characters, and
  messages. `002_open5e_data.sql` creates the rules-data schema.
  `server/db/migrate.ts` tracks app migrations in `schema_versions`.
- `server/db/migrate-auth.ts` uses `getMigrations` from the installed
  `better-auth/db` package. No separate Better Auth CLI is required.
- Use parameterized prepared statements and existing datastore/service patterns.
  `server/db/connection.ts` enables foreign keys and WAL for the shared app
  connection. Inspect each connection when changing database behavior: auth
  opens a separate SQLite connection.
- Campaign and character APIs use helpers in `server/utils/api.ts` for success
  responses and errors. Follow the handler being extended: Better Auth and
  `/api/data/:type` do not universally use the same success envelope.
- `/api/data/:type` serves rules data, not authentication or game sessions.

## Implementation style

- Keep changes focused on the request. Make larger changes in manageable steps;
  avoid unrelated cleanup and speculative abstractions.
- Verify uncertain claims in the code. Ask for clarification when a missing
  requirement materially affects the implementation. Reassess feedback against
  evidence rather than assuming either party is correct.
- Write clean, readable, reusable TypeScript with strict types. Avoid explicit
  `any`; use `unknown` and narrow it where needed.
- Prefer named function declarations, especially for multiline functions.
  Concise callbacks are acceptable; follow `eslint.config.mjs`, which enforces
  `func-style: declaration`.
- Prefer pure functions and keep side effects explicit. Extract reusable Vue
  components or composables when there is actual shared behavior.
- Use camelCase for new variables and directories; follow existing Vue component
  filenames and Nuxt file-routing conventions. Keep Vue components as their
  normal default exports.
- Use `ms` for human-readable duration values, converting milliseconds to the
  units required by the receiving API (for example, auth durations use seconds).
- Add comments when they explain complex logic or a necessary decision; avoid
  narrating obvious code.
- Communicate directly and factually; prioritize corrections and evidence over
  defensive responses or repeated apologies.

## Feature planning and completion

- Before implementing a new feature, create a PRD describing Requirements,
  Scope, Implementation, and Technical Decisions. Record terminology and
  significant approaches, split work into manageable steps, and resolve unclear
  requirements against the code and with the user.
- Obtain user approval for the PRD before feature implementation, unless the
  current conversation already supplies that approval or overrides this process.
- Keep commits meaningful and reasonably sized when commits are requested or
  authorized. Remove the temporary task PRD when the feature is complete; do not
  delete unrelated existing documents such as `docs/PRD-IMAGES.md`.
- Run `npm run typecheck` and `npm run lint` before calling work complete. Run
  relevant additional validation for behavior changes, and report failures or
  checks that could not run. Run `npm run test:offline` when changing setup or seeding.
