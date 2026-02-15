# Backend Adapter

Express-based API adapter that implements `docs/API_CONTRACT.md`.

## Run

1. Install dependencies:
```bash
npm install
```

2. Configure env:
```bash
copy .env.example .env
```

Set database and AI values in `.env`:
- MySQL:
  - `MYSQL_URL` (preferred) or `MYSQL_HOST`/`MYSQL_PORT`/`MYSQL_USER`/`MYSQL_PASSWORD`/`MYSQL_DATABASE`
- AI:
  - `PLANT_ID_API_KEY` (recommended)
  - `OPENAI_API_KEY` (optional second-opinion model)
- Auth:
  - `GOOGLE_CLIENT_ID` (required for Google Sign-In verification endpoint)

3. Start dev server:
```bash
npm run dev
```

4. Start production mode:
```bash
npm run start
```

## Test

```bash
npm run test
```

## Endpoints

- `GET /health`
- `GET /api/weather/snapshot`
- `GET /api/weather/forecast`
- `GET /api/market/prices`
- `GET /api/schedule`
- `POST /api/recommendations/soil`
- `POST /api/disease/analyze` (multipart field `file`)
- `POST /api/auth/google/verify`

## Disease Detection Architecture

- MySQL-backed persistence
  - `disease_profiles` table (seeded on startup)
  - `diagnoses` table (saved for history/audit)
- AI providers:
  - Plant.id health assessment (primary if configured)
  - OpenAI vision model (optional secondary)
- Fallback mode:
  - If providers are unavailable, backend returns low-confidence fallback diagnosis.
- Startup behavior:
  - Backend auto-creates required MySQL tables if they do not exist.
