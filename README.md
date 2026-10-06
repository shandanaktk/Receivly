# Receivly AI — Milestone 1 frontend

Responsive Next.js frontend for the public site, business workspace, public invoice view, and platform owner console described in the proposal. This is a working **demo**: the data and actions are simulated through one API boundary. It does not authenticate users securely, send email, collect payments, or persist records to a database.

## Run locally

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`. No environment variables are needed for the demo.

| Demo role | Email | Password |
| --- | --- | --- |
| Business | `demo@receivly.ai` | `Demo1234!` |
| Platform owner | `admin@receivly.ai` | `Admin1234!` |

## Screens and demo behavior

- Public: home, features, pricing, contact, legal pages, sign in/up and recovery, public invoice and browser print/PDF.
- Workspace: onboarding, dashboard/work queue, customers, invoices, CSV import, invoice activity, conversations, approvals, AI Collector, reports, notifications, billing, profile, and team/workspace settings.
- Owner: overview, businesses and business detail, monitoring, plans/content, and audit log.
- Desktop and mobile layouts, light/dark mode, keyboard focus styles, reduced motion support. The small landing video loads when the hero enters view and stays off on slow connections, Save-Data, and reduced motion.
- CSV files are parsed and validated in the browser. The sample records and all simulated actions stay in the mock API. Changes survive client-side navigation but reset on a full reload or server restart.
- Money summaries filter by currency. They never add balances from different currencies together.

## Backend handoff

Core data workflows call the typed `api` facade in `src/lib/api/index.ts`. Demo implementations and records are in `src/lib/api/mockApi.ts` and `src/lib/mock/`; the owner monitoring and configuration fixtures are also isolated there. For Milestone 2, implement the same `ApiClient` interface in a live adapter, then change the facade export and wire the owner fixtures to live endpoints. Authentication, authorization, tenant isolation, durable storage, webhooks, email, checkout, and any publicly accessible invoice token validation must be enforced by the backend. No `NEXT_PUBLIC_USE_MOCK` environment switch is active.

## Deploy on Dokploy

Keep the existing **Dockerfile** build, repository root as build context, and port `3000`. The image runs the standalone Next.js server. Redeploy after merging these changes; no Dokploy configuration change is required for this frontend. An existing `NEXT_PUBLIC_USE_MOCK` variable can be removed because it is unused. Do not treat this demo as a production billing or collection service until the backend is connected.

```bash
npm run lint
npm run build
docker build -t receivly .
docker run -p 3000:3000 receivly
```

The included fonts are self-hosted under `public/fonts/` with their OFL licenses. The optional hero video and poster are static assets. `scripts/visual-check.mjs` is a local browser check for viewport overflow and screenshots.
