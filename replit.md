# Workspace

## Overview

Full-stack pnpm workspace monorepo. Contains a news aggregator web application "أخبار العالم" (NewsHub) that automatically fetches news from trusted RSS feeds worldwide.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM (provisioned but not yet used for news — RSS feeds used instead)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + Tailwind CSS v4

## Artifacts

### `news-hub` (React + Vite) — Preview path: `/`
The main news aggregation website. RTL Arabic interface with:
- Live news from 20+ RSS feeds (BBC, Reuters, Al Jazeera, CNN, TechCrunch, ESPN, etc.)
- Categories: World, Politics, Business, Sports, Technology, Science, Health, Entertainment
- Hero section with top headlines
- Category filter sidebar with article counts
- Debounced search across all articles
- Dark/light mode toggle
- Auto-refresh every 5 minutes
- Responsive, mobile-friendly layout

### `api-server` (Express API) — Preview path: `/api`
Shared backend with RSS feed aggregation:
- `GET /api/news` — paginated articles with category/search filters
- `GET /api/news/top` — top headlines with images for hero section
- `GET /api/news/categories` — category stats (label, count, icon)
- In-memory cache with 5-minute TTL
- Fetches from 20+ trusted RSS sources in parallel

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/news-hub run dev` — run frontend locally

## RSS Sources

The API server fetches from these categories:
- **World**: BBC World, Reuters, Al Jazeera, Deutsche Welle
- **Politics**: BBC Politics, NPR Politics
- **Business**: BBC Business, WSJ, NY Times Business
- **Sports**: BBC Sport, ESPN
- **Technology**: TechCrunch, The Verge, Ars Technica, BBC Tech
- **Science**: BBC Science, NPR Science, NASA
- **Health**: BBC Health, NPR Health
- **Entertainment**: BBC Entertainment, NPR Arts

## Vercel Deployment Notes

To deploy on Vercel:
1. Build the frontend: `pnpm --filter @workspace/news-hub run build`
2. Output directory: `artifacts/news-hub/dist/public`
3. The backend (Express) needs a separate deployment or can be converted to Vercel serverless functions in an `api/` folder

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
