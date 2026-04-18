# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24 locally on Replit; Vercel is pinned to Node 22.x via root `package.json`
- **Package manager**: pnpm 10.26.1
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle) and Vite for the news hub frontend

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/news-hub run build` — build the news hub frontend for Vercel

## Deployment Notes

- Vercel deployment is configured in `vercel.json`.
- Vercel install command: `corepack enable && pnpm install --frozen-lockfile`.
- Vercel build command: `pnpm --filter @workspace/news-hub run build`.
- Vercel output directory: `artifacts/news-hub/dist/public`.
- Root `package.json` pins `packageManager` and Node engine to avoid pnpm registry fetch failures during Vercel installs.

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
