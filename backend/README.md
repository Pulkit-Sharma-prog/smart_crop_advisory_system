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

Set at least one AI provider key for stronger image diagnosis:
- `PLANT_ID_API_KEY` (recommended)
- `OPENAI_API_KEY` (optional second-opinion model)

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

## Disease Detection Architecture

- Embedded JSON database at `backend/storage/crop-advisory-db.json`
  - Stores disease catalog entries
  - Stores diagnosis history for audit and follow-up
- AI providers:
  - Plant.id health assessment (primary if configured)
  - OpenAI vision model (optional secondary)
- Fallback mode:
  - If providers are unavailable, backend returns low-confidence fallback diagnosis so the UI remains usable.
