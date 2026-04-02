# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Telegram Bot**: Telegraf

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server + Telegram bot
│   └── follower-bot/       # React landing page (Arabic RTL)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
└── ...
```

## Bot System

### Telegram Bot Features
- **Lock mechanic**: Must invite 5 friends to unlock the bot
- **Points system**: Earn points from tasks, referrals, and daily wheel
- **Tasks**: Follow/like/comment tasks on Instagram, Telegram, Twitter, TikTok, YouTube
- **Daily Lucky Wheel**: Random 5–100 points once per day
- **VIP tiers**: Level 1 (500pts), Level 2 (1000pts)
- **Referral**: 20 pts per referral, 50 pts welcome bonus on unlock
- **Leaderboard**: Top users by points

### Database Tables
- `bot_users` — users with points, VIP level, referral tracking, unlock status
- `tasks` — social media tasks with platform/type/points
- `task_completions` — completed tasks per user
- `point_transactions` — full audit log of all point changes

### API Endpoints
- `GET /api/stats` — overall bot statistics for the landing page
- `GET /api/leaderboard` — top users by points
- `GET /api/users/:telegramId` — user profile
- `GET /api/tasks` — active tasks
- `POST /api/telegram/webhook` — Telegram bot webhook

### Webhook
Registered at: `https://<REPLIT_DOMAIN>/api/telegram/webhook`

### Environment Secrets
- `TELEGRAM_BOT_TOKEN` — required for the bot to work
- `DATABASE_URL` — auto-set by Replit

## Frontend (follower-bot)

Arabic RTL landing page at `/` showing:
- Live stats (auto-refresh every 30s)
- Bot features and how it works
- 5-friend unlock mechanic explanation
- Active tasks list
- Leaderboard

## Packages

### `artifacts/api-server` (`@workspace/api-server`)
Express 5 API server + Telegram bot handlers.

### `artifacts/follower-bot` (`@workspace/follower-bot`)
React + Vite Arabic landing page.

### `lib/db` (`@workspace/db`)
Database layer using Drizzle ORM with PostgreSQL.

### `lib/api-spec` (`@workspace/api-spec`)
OpenAPI spec + Orval codegen config.

### `lib/api-zod` (`@workspace/api-zod`)
Generated Zod schemas.

### `lib/api-client-react` (`@workspace/api-client-react`)
Generated React Query hooks.
