# Smart Crop Advisory System

A React + TypeScript web app for crop guidance across weather, soil recommendations, disease detection, farming schedule, and market prices.

## Full Stack Setup

### Frontend
```bash
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`.

### Backend Adapter
```bash
npm --prefix backend install
npm run backend:dev
```
Backend runs on `http://localhost:3000`.

Create `backend/.env` from `backend/.env.example` and set at least one AI key for plant-disease detection:
- MySQL config:
  - `MYSQL_URL` (preferred), or `MYSQL_HOST`/`MYSQL_PORT`/`MYSQL_USER`/`MYSQL_PASSWORD`/`MYSQL_DATABASE`
- `PLANT_ID_API_KEY` (recommended)
- `OPENAI_API_KEY` (optional second opinion)

### Frontend Live API Mode
Create `.env` in project root from `.env.example`:
```bash
VITE_API_BASE_URL=
VITE_USE_MOCK_DATA=false
VITE_ALLOW_API_FALLBACK=false
VITE_API_TIMEOUT_MS=8000
VITE_API_RETRY_COUNT=1
VITE_DEBUG_LOGS=false
```

For single Vercel deployment, keep `VITE_API_BASE_URL` empty so frontend calls same-origin `/api/*`.

For separate frontend/backend Vercel projects:
- Frontend env:
  - `VITE_API_BASE_URL=` (empty, uses frontend `/api/*` proxy)
  - `BACKEND_BASE_URL=https://<your-backend-project>.vercel.app`
- Backend env:
  - `FRONTEND_ORIGIN=https://<your-frontend-project>.vercel.app`
  - `MYSQL_URL=<hosted-mysql-connection-string>`

## Implemented Phases

### Phase 1
- Route architecture via `react-router-dom`
- i18n with UTF-8 locale files
- Shared component refactors

### Phase 2
- Service-layer extraction and typed data models
- Form and upload validation
- Accessibility and loading/error states

### Phase 3
- Unit tests, e2e smoke tests, CI workflow

### Phase 4
- API-first service layer with schema validation
- Timeout/retry capable HTTP client
- Runtime env controls for mock/fallback strategy

### Phase 5
- Resilience upgrades: central mock store, logging, cache TTL in async hooks

### Phase 6
- Backend contract documentation and strict env typing

### Phase 7 (new)
- Real backend adapter package in `backend/`
- All API contract endpoints implemented
- Backend request validation and upload handling
- Backend API tests with `supertest`

## Scripts
- `npm run dev` - frontend dev server
- `npm run backend:dev` - backend dev server
- `npm run backend:start` - backend start
- `npm run backend:test` - backend tests
- `npm run lint` - lint source
- `npm run typecheck` - TypeScript checks
- `npm run test:run` - unit tests
- `npm run test:e2e` - Playwright smoke tests
- `npm run ci` - frontend CI checks

## Docs
- Backend API contract: `docs/API_CONTRACT.md`
- Backend package guide: `backend/README.md`
