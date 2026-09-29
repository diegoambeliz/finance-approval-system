# SpendFlow

An internal finance approval workflow system. Requesters create purchase/reimbursement/subscription/invoice-payment requests, which move through a manager and finance review before being approved:

```
DRAFT → WAITING_FOR_MANAGER → WAITING_FOR_FINANCE → APPROVED
                 └──────────────┴──────────────────→ REJECTED
```

Roles are `REQUESTER`, `MANAGER`, `FINANCE`, `ADMIN` - a user can hold more than one at once.

## Stack

Next.js (App Router) + React + TypeScript, PostgreSQL via Prisma, Clerk for authentication, Zod for validation, Vitest for tests.

## Prerequisites

- Node.js 20+
- A PostgreSQL server reachable from your machine (this project was developed against a native local install, but any Postgres works)
- A Clerk application (for authentication)

## Environment variables

Copy these into a `.env` file at the project root (never commit this file - `.env*` is gitignored):

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Postgres connection string for the app's database, e.g. `postgresql://user:pass@localhost:5432/finance_approval_system?schema=public` |
| `CLERK_SECRET_KEY` | Clerk backend secret key (server-only, never sent to the client) |
| `CLERK_WEBHOOK_SECRET` | Signing secret for the Clerk webhook at `/api/webhooks/clerk`, which syncs Clerk users into our `User` table |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key (safe to expose to the client) |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` | Where Clerk redirects after sign-in if no other redirect is set |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` | Where Clerk redirects after sign-up if no other redirect is set |
| `NEXT_PUBLIC_APP_URL` | This app's own base URL (e.g. `http://localhost:3000`), used by server components to call our own API during server-side rendering |

Only `NEXT_PUBLIC_*` variables are ever exposed to the browser; everything else stays server-only.

## Setup

```bash
npm install
npx prisma migrate deploy   # apply migrations to the database in DATABASE_URL
npx prisma db seed          # optional: creates demo requester/manager/finance/admin users
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Testing

```bash
npm run test          # everything under vitest (currently: unit tests)
npm run test:unit      # domain/, server/, lib/ - fast, no database needed
npm run test:watch     # interactive watch mode
```

Unit tests never touch a real database. A small number of Prisma-level scripts under `scripts/` do talk to a real, isolated Postgres database for manual verification (concurrency guards, migration isolation) - never the dev database:

```bash
npm run test:db:up       # derive .env.test from .env and create <dbname>_test if it doesn't exist
npm run test:db:migrate  # apply migrations to that isolated test database
npm run test:db:reset    # drop and recreate it from scratch
```

Every one of those commands refuses to run unless the resolved database name ends in `_test`, so they can't accidentally target the dev database.

Integration and end-to-end test suites don't exist yet in this repo.

## Other scripts

```bash
npm run build   # production build
npm run lint     # eslint
```
