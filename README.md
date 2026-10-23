# Mandi Bhav

Daily wholesale **mandi prices of India**, in **English, हिन्दी, ਪੰਜਾਬੀ, मराठी, ગુજરાતી and বাংলা**.
Data comes from the Government's free API (AGMARKNET via data.gov.in).

| Page    | What it does                                                              |
| ------- | ------------------------------------------------------------------------- |
| Home    | Rate board of the most traded crops, quick crop search                    |
| Prices  | Today's prices with State → District → Mandi → Crop filters, search, sort |
| Compare | One crop across all mandis, cheapest first                                |
| Trend   | Daily price chart (7 / 30 / 90 days)                                      |
| Saved   | Your starred crop + mandi pairs with the latest price                     |
| About   | Data source and how to read prices                                        |

## Tech stack

```
frontend/  Next.js 16 · TypeScript · Tailwind CSS v4 + shadcn/ui · TanStack Query
           React Hook Form + Zod · Zustand · Orval (generated API hooks) · Recharts
backend/   NestJS 12 · TypeORM · PostgreSQL · Swagger (OpenAPI) · @nestjs/schedule
root       pnpm workspace · Biome (lint + format)
```

## How it works

```
data.gov.in API ──(every 3 h, cron)──▶ NestJS sync ──▶ PostgreSQL (keeps 180 days)
                                                          │
Browser ◀── Next.js (TanStack Query hooks made by Orval) ◀── NestJS REST API + Swagger
```

Why store data in our own DB instead of calling the govt API from the browser?
1. The govt API is slow and rate-limited.
2. It only gives the latest data, so trends need our own history.
3. Your API key stays secret on the server.

## Run it on your PC (Windows)

### 1. Requirements

- Node.js 20+ and pnpm (you have both).
- PostgreSQL: your local install, **or** Docker Desktop.

### 2. Install

```powershell
cd "C:\Users\NAYAN MISHRA\OneDrive\Documents\New folder"
pnpm install
```

### 3. Database: Supabase (free hosted PostgreSQL)

1. Sign up at supabase.com, then create a **New project**. Pick region **Mumbai (ap-south-1)** and save the database password.
2. In the project, click **Connect**, choose **Session pooler**, and copy the URI.
   - Use the Session pooler because it works on normal IPv4 internet. The "Direct connection" needs IPv6.

The app puts its tables in a separate `mandi` schema, not `public`. Supabase automatically exposes `public` tables through its REST API, so this keeps your data private.

### 4. API key from data.gov.in

1. Log in at data.gov.in.
2. Open **My Account** and copy your **API key**.

`start.bat` asks for both values. Your typing is hidden, and they are saved only in `backend\.env`.

### 5. Start

Double-click **`start.bat`**, or run `pnpm dev`.

| What         | URL                        |
| ------------ | -------------------------- |
| Website      | http://localhost:3000      |
| API          | http://localhost:4000/api  |
| Swagger docs | http://localhost:4000/docs |

The first sync starts about 2 seconds after the API boots. Watch the API terminal for `Sync done`.

## Useful commands

| Command                       | What it does                                                               |
| ----------------------------- | -------------------------------------------------------------------------- |
| `pnpm dev`                    | Run API + website together (auto-reload)                                   |
| `pnpm lint` / `pnpm lint:fix` | Biome check / auto-fix                                                     |
| `pnpm typecheck`              | TypeScript check of both apps                                              |
| `pnpm test`                   | Backend unit tests                                                         |
| `pnpm build`                  | Production build of both apps                                              |
| `pnpm api:generate`           | After changing the API: rebuild `openapi.json` → regenerate frontend hooks |

To run a sync by hand, first set `ADMIN_TOKEN` in `.env`, then:

```powershell
curl -X POST http://localhost:4000/api/sync/run -H "x-admin-token: YOUR_TOKEN"
```

## Project layout

```
backend/src
  config/      env validation (app refuses to start with bad settings)
  sync/        data.gov.in client, cleaning (normalize.ts), cron sync, sync logs
  prices/      entity, DTOs (Swagger), prices / meta / stats endpoints
frontend/src
  app/         pages (routes)
  features/    page content: home, prices, compare, trend, saved, about
  components/  shared UI (+ ui/ = shadcn components)
  api/         fetcher.ts + generated/ (Orval output, do not edit)
  i18n/        6 language files + crop names
  stores/      Zustand: language, saved items (localStorage)
  lib/         Zod schemas, helpers
```

## Troubleshooting

| Problem                                               | Fix                                                                      |
| ----------------------------------------------------- | ------------------------------------------------------------------------ |
| Website says prices could not be loaded               | API not running, or `NEXT_PUBLIC_API_URL` wrong in `frontend\.env.local` |
| API log: `ECONNREFUSED 5432`                          | PostgreSQL not running / wrong `DATABASE_URL`                            |
| API log: `Key not authorised` / `Rate limit exceeded` | Wrong key, or you used the public sample key; use your own               |
| "No prices yet" on home                               | `DATA_GOV_API_KEY` empty, or first sync still running                    |
| CORS error in browser console                         | Add your site URL to `FRONTEND_URL` in `backend\.env`                    |

## Before going to production (later)

- Set `DB_SYNCHRONIZE=false` and use TypeORM migrations.
- Put secrets in AWS Secrets Manager / SSM, not `.env`.
- Run behind HTTPS (ALB / CloudFront). `output: 'standalone'` is already set for Docker/EC2.

Data: AGMARKNET, Ministry of Agriculture & Farmers Welfare, via data.gov.in, under the Government Open Data License – India.
