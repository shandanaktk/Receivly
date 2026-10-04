# Receivly AI

AI-powered invoice management & payment collection SaaS — Milestone 1 frontend (design system, marketing site, auth, workspace app, admin panel) with a removable mock API layer.

## Getting started

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo credentials

| Role | Email | Password | Lands on |
|------|-------|----------|----------|
| Business workspace | `demo@receivly.ai` | `Demo1234!` | `/app/dashboard` |
| Platform owner | `admin@receivly.ai` | `Admin1234!` | `/admin` |

## Mock data → live backend

All demo data lives under `src/lib/mock/`. The app talks only to `src/lib/api` (`api.*` methods).

When the backend is ready:

1. Implement `src/lib/api/liveApi.ts` with the same method signatures as `mockApi`
2. Point `src/lib/api/index.ts` at `liveApi`
3. Set `NEXT_PUBLIC_USE_MOCK=false`
4. Delete `src/lib/mock/` when you no longer need sample data

## Landing page performance (mobile)

- Instant CSS atmosphere + poster image (`/hero-poster.jpg`)
- Desktop-only deferred video (`/hero.mp4` ~200KB, 12s loop)
- No video on mobile / Save-Data / slow networks / `prefers-reduced-motion`
- No Three.js / WebGL

## Deploy on Dokploy (from GitHub)

This is a **Next.js Node server** (not a static export). Prefer **Dockerfile** build type.

| Field | Value |
|-------|--------|
| **Provider / source** | GitHub |
| **Repository** | your Receivly fork/repo |
| **Branch** | `main` (or your deploy branch) |
| **Build type** | `Dockerfile` |
| **Dockerfile path** | `Dockerfile` (repo root) |
| **Docker context / build path** | `.` or `/` (repository root) |
| **Publish directory** | leave **empty** / not used (not a static site) |
| **Port** | `3000` |
| **Start command** | not needed when using Dockerfile `CMD` |
| **Health check path** | `/` |

### Environment variables (Dokploy)

| Name | Value |
|------|--------|
| `NEXT_PUBLIC_USE_MOCK` | `true` (until backend exists) |
| `PORT` | `3000` |
| `NODE_ENV` | `production` (optional; image sets this) |

### Alternative: Nixpacks / Node (no Docker)

| Field | Value |
|-------|--------|
| Build type | Nixpacks / Node |
| Build path | `.` |
| Install command | `npm ci` |
| Build command | `npm run build` |
| Start command | `npm start` |
| Port | `3000` |
| Publish directory | empty |

Local Docker test:

```bash
docker build -t receivly .
docker run -p 3000:3000 -e NEXT_PUBLIC_USE_MOCK=true receivly
```

## Milestone 1 routes (summary)

**Public:** `/`, `/features`, `/pricing`, `/contact`, legal pages, auth (`/login`, `/signup`, …), public invoice `/invoice/[token]`

**Workspace:** `/app/onboarding`, dashboard, customers, invoices (+ CSV import), conversations, approvals, AI Collector, reports, billing, notifications, settings, profile

**Admin:** `/admin`, businesses, monitoring, plans, audit

## Scripts

- `npm run dev` — development
- `npm run build` — production build (standalone)
- `npm run start` — production server
- `npm run lint` — ESLint
