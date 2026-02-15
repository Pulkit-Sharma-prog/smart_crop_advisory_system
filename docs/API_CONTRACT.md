# API Contract

The frontend now supports live backend integration through environment-based configuration.

## Base Configuration

- Base URL: `VITE_API_BASE_URL`
- Mock mode: `VITE_USE_MOCK_DATA`
- Fallback mode: `VITE_ALLOW_API_FALLBACK`

## Endpoints

### 1. Weather Snapshot
- Method: `GET`
- Path: `/api/weather/snapshot`
- Response:
```json
{
  "currentTempC": 28,
  "feelsLikeC": 30,
  "humidityPercent": 65,
  "windKmph": 12,
  "highC": 32,
  "lowC": 24
}
```

### 2. Weather Forecast
- Method: `GET`
- Path: `/api/weather/forecast`
- Response:
```json
[
  {
    "day": "Today",
    "temperatureC": 28,
    "condition": "Partly Cloudy",
    "rainChancePercent": 20
  }
]
```

### 3. Market Prices
- Method: `GET`
- Path: `/api/market/prices`
- Response:
```json
[
  {
    "crop": "Wheat",
    "market": "Local Mandi",
    "pricePerKg": 21.5,
    "changePercent": 5.2
  }
]
```

### 4. Farming Schedule
- Method: `GET`
- Path: `/api/schedule`
- Response:
```json
[
  {
    "phase": "Sowing Window",
    "date": "Nov 15 - Nov 30",
    "status": "upcoming",
    "color": "leaf",
    "tasks": [
      { "task": "Prepare seedbed", "reason": "Soil moisture is optimal" }
    ]
  }
]
```

### 5. Soil Recommendation
- Method: `POST`
- Path: `/api/recommendations/soil`
- Body:
```json
{
  "nitrogen": 120,
  "phosphorus": 60,
  "potassium": 40,
  "ph": 6.5,
  "landSize": 5
}
```
- Response:
```json
{
  "healthScore": 78,
  "healthLabel": "Good",
  "crops": [
    {
      "name": "Wheat",
      "suitability": 95,
      "season": "Rabi",
      "npk": "120-60-40",
      "profit": "High"
    }
  ]
}
```

### 6. Disease Detection
- Method: `POST`
- Path: `/api/disease/analyze`
- Body: `multipart/form-data`, field `file`
- Response:
```json
{
  "diagnosisId": "a7e2f...",
  "recordedAt": "2026-02-14T08:10:22.000Z",
  "primary": {
    "name": "Late Blight",
    "confidence": 92,
    "visibleSymptoms": ["Water-soaked lesions"]
  },
  "alternatives": [
    { "name": "Early Blight", "confidence": 6 }
  ],
  "analysisSummary": "Visible foliar symptoms align with blight-like lesions.",
  "severity": "High",
  "confidenceNote": "Confidence is based on cross-provider visual symptom matching.",
  "guidance": {
    "preventiveMeasures": ["Improve airflow around canopy"],
    "curativeActions": ["Remove infected leaves and apply recommended fungicide"],
    "organicOptions": ["Use approved copper spray"],
    "escalationAdvice": "Escalate if spread increases after first treatment cycle."
  },
  "symptoms": ["Water-soaked lesions"],
  "sources": ["plant_id", "openai_vision"],
  "providerErrors": []
}
```

### 7. Google Token Verify
- Method: `POST`
- Path: `/api/auth/google/verify`
- Body:
```json
{
  "idToken": "<google-id-token>"
}
```
- Response:
```json
{
  "user": {
    "id": "110000000000000000000",
    "email": "farmer@example.com",
    "name": "Farmer Name",
    "picture": "https://lh3.googleusercontent.com/...",
    "provider": "google"
  }
}
```

## Error Handling Expectations

- Service should return standard HTTP status codes.
- Error response can be any JSON payload; frontend displays generic errors and can fallback to mock data depending on env flags.

## Production Recommendation

1. Set `VITE_USE_MOCK_DATA=false`.
2. Keep `VITE_ALLOW_API_FALLBACK=false` for strict production behavior.
3. Set `VITE_API_TIMEOUT_MS` and `VITE_API_RETRY_COUNT` per API SLA.
