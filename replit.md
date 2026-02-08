# Harris Wildlands (BRUCE.OS)

## Overview
A personal operating system / command center web application called BRUCE.OS, built with React + Express + PostgreSQL. Features daily calibration logging, idea pipeline, goals tracking, AI hub, and brand management.

## Project Architecture
- **Location**: The main web app lives in `05_EXPORT/BRUCE_BRUCE__CODEX/harriswildlands.com github repo/harriswildlands.com-main/`
- **Frontend**: React 18 with Vite, TailwindCSS, Radix UI components, wouter routing
- **Backend**: Express.js with TypeScript (tsx), serves both API and frontend
- **Database**: PostgreSQL with Drizzle ORM
- **Schema**: `shared/schema.ts` (inside the web app directory)
- **Port**: 5000 (single server serves both API and client)

## Key Files (relative to web app directory)
- `server/index.ts` - Express server entry point
- `server/routes.ts` - API route definitions
- `server/vite.ts` - Vite dev server middleware setup
- `server/db.ts` - Database connection
- `client/src/` - React frontend source
- `shared/schema.ts` - Drizzle database schema
- `vite.config.ts` - Vite configuration
- `drizzle.config.ts` - Drizzle Kit configuration

## Scripts
- `npm run dev` - Start development server (tsx)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Push schema changes to database

## Environment Variables
- `DATABASE_URL` - PostgreSQL connection string (auto-configured by Replit)

## Recent Changes
- 2026-02-08: Initial Replit setup - created database, installed dependencies, configured workflow and deployment
