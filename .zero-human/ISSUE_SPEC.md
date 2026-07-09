# ABH-7: Spotify Clone

Build a full-stack Spotify Clone with the following:



FRONTEND (Next.js 14, Tailwind CSS, TypeScript):

\- Beautiful dark UI matching Spotify's design (dark sidebar, green accents)

\- Home page: featured playlists, recently played, new releases

\- Music player bar at bottom: play/pause, next/prev, progress bar, volume

\- Sidebar: Home, Search, Your Library, Liked Songs navigation

\- Search page: search songs, artists, albums with live results

\- Playlist page: show tracks list, play button, cover art

\- Responsive layout



BACKEND (Node.js, Express, TypeScript):

\- REST API at PORT 8080

\- GET /health — health check

\- GET /api/songs — list all songs (with pagination)

\- GET /api/songs/search?q\= — search songs by title/artist

\- GET /api/playlists — list playlists

\- GET /api/playlists/:id — get playlist with tracks

\- POST /api/playlists — create playlist

\- POST /api/playlists/:id/songs — add song to playlist

\- GET /api/artists — list artists

\- Uses DATABASE\_URL env var for PostgreSQL connection



DATABASE (PostgreSQL):

\- songs table: id, title, artist, album, duration\_seconds, cover\_url, audio\_url, genre

\- artists table: id, name, bio, image\_url

\- playlists table: id, name, description, cover\_url, created\_at

\- playlist\_songs table: playlist\_id, song\_id, position

\- Seed with 20 sample songs across 5 artists and 3 playlists



MONOREPO STRUCTURE:

\- apps/frontend/ — Next.js app

\- backend/ — Express API

\- database/schema.sql — DB schema + seeds



IMPORTANT:

\- Frontend uses NEXT\_PUBLIC\_API\_URL env var to call backend

\- Backend listens on process.env.PORT || 8080

\- All CORS enabled on backend

\- Use Tailwind CSS with proper config

\- Include tailwind.config.js, postcss.config.js

\- Include next.config.js with output: "standalone"

\- Backend package.json must have build (tsc) and start (node dist/index.js) scripts


---
## FULL-STACK TECH CONTRACT (mandatory unless the request is explicitly frontend/static-only)

Deliver a REAL, wired-together full-stack app — buttons and forms MUST perform real actions that persist to a database via a backend API. Do NOT ship a static frontend with mocked data.

**Repository layout (monorepo):**
- **Frontend** (repo root): Next.js 14 App Router + TypeScript. The UI is a client app that fetches live data from the backend using `process.env.NEXT_PUBLIC_API_URL`.
- **Backend** (`backend/`): Node.js + Express + TypeScript using the `pg` driver. Reads `process.env.DATABASE_URL` and `process.env.PORT` (default 4000). Exposes `GET /health`, full CRUD REST endpoints for the domain, and auth (`POST /auth/signup`, `POST /auth/login` returning a JWT). `backend/package.json` must define scripts `build` (tsc), `start` (node dist/index.js) and `main` = `dist/index.js`.
- **Database** (`database/schema.sql`): `CREATE TABLE IF NOT EXISTS` statements for a `users` table (email UNIQUE + password_hash) and all domain tables. This file is auto-applied by the deploy pipeline.

**Wiring rules:**
- Frontend → Backend over HTTP via `NEXT_PUBLIC_API_URL` (the deploy pipeline injects this automatically).
- Backend → Database via `DATABASE_URL` (the deploy pipeline injects this automatically). Use parameterized queries. Enable Postgres SSL when the URL points at RDS/AWS.
- Keep imports/exports consistent so every `npm run build` succeeds for both apps.
