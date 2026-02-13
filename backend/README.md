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
