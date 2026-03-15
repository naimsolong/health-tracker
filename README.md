# Health Tracker

A full-stack health tracking application built with **Nuxt 3** and deployed on **Cloudflare Pages** with **Cloudflare D1** (SQLite) as the database.

**Live URL:** https://health-tracker.naimsolong.com

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Nuxt 3 + Vue 3 + Tailwind CSS |
| Backend | Nuxt server routes (H3) |
| Database | Cloudflare D1 (SQLite) |
| ORM | Drizzle ORM |
| Hosting | Cloudflare Pages |
| Domain | health-tracker.naimsolong.com (CNAME to pages.dev) |

## Features

- **Authentication** — Register/login with hashed passwords and cookie-based sessions
- **Health Logging** — Track weight, blood pressure, heart rate, blood sugar, sleep, steps, water, mood
- **Stats Dashboard** — 30-day averages for all key metrics
- **History** — Full entry history with delete support
- **Goals** — Set and track health targets
- **Responsive UI** — Works on mobile and desktop

## Project Structure

```
health-tracker/
├── pages/
│   ├── index.vue          # Landing page
│   ├── login.vue          # Login page
│   ├── register.vue       # Register page
│   └── dashboard/
│       ├── index.vue      # Dashboard overview
│       ├── log.vue        # Log health entry
│       ├── history.vue    # Entry history
│       └── goals.vue      # Health goals
├── layouts/
│   └── dashboard.vue      # Dashboard layout with nav sidebar
├── middleware/
│   ├── auth.ts            # Protect routes requiring login
│   └── guest.ts           # Redirect logged-in users away from auth pages
├── composables/
│   ├── useAuth.ts         # Auth state and methods
│   └── useHealthEntries.ts # Health entry CRUD
├── server/
│   ├── api/
│   │   ├── auth/          # register, login, logout, me
│   │   ├── health/        # CRUD + stats
│   │   └── goals/         # CRUD
│   ├── middleware/
│   │   └── 01.logger.ts   # Request logging
│   ├── utils/
│   │   ├── auth.ts        # Token signing/verification, password hashing
│   │   └── db.ts          # Drizzle D1 instance
│   └── database/
│       ├── schema/        # Drizzle schema definitions
│       └── migrations/    # SQL migration files
├── wrangler.toml          # Cloudflare Workers/Pages config
└── nuxt.config.ts         # Nuxt configuration
```

## API Routes

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Login |
| POST | `/api/auth/logout` | No | Logout |
| GET | `/api/auth/me` | Yes | Get current user |
| GET | `/api/health` | Yes | List entries (supports `?from=&to=&limit=`) |
| POST | `/api/health` | Yes | Create/update entry for a date |
| GET | `/api/health/:id` | Yes | Get single entry |
| DELETE | `/api/health/:id` | Yes | Delete entry |
| GET | `/api/health/stats` | Yes | Get 30-day stats |
| GET | `/api/goals` | Yes | List active goals |
| POST | `/api/goals` | Yes | Create goal |

## Deployment

### 1. Create D1 Database

```bash
wrangler d1 create health-tracker-db
```

Copy the `database_id` from the output into `wrangler.toml`.

### 2. Run Migrations

```bash
# Local dev
npm run db:migrate

# Production
npm run db:migrate:remote
```

### 3. Deploy to Cloudflare Pages

```bash
npm run deploy
```

Or connect your GitHub repository in the Cloudflare Pages dashboard with:
- **Build command:** `npm run build`
- **Output directory:** `.output/public`

### 4. Set Environment Variables

In Cloudflare Pages → Settings → Environment variables:
- `JWT_SECRET` — a strong random secret (e.g. `openssl rand -hex 32`)

### 5. Configure Custom Domain

In Cloudflare Pages → Custom domains, add:
```
health-tracker.naimsolong.com
```

Cloudflare will auto-add the CNAME record:
```
health-tracker.naimsolong.com → <project>.pages.dev
```

## Local Development

```bash
npm install
npm run dev
```

The dev server runs at http://localhost:3000. Note: D1 requires wrangler for local dev with the actual D1 binding. For quick local testing you can use a mock DB or `wrangler pages dev`.
