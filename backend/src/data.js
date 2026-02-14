const DEFAULT_LAT = 20.5937;
const DEFAULT_LON = 78.9629;

export const weatherSnapshot = {
  currentTempC: 28,
  feelsLikeC: 30,
  humidityPercent: 65,
  windKmph: 12,
  highC: 32,
  lowC: 24,
  condition: "Partly Cloudy",
  location: {
    latitude: DEFAULT_LAT,
    longitude: DEFAULT_LON,
  },
};

export const weatherForecast = [
  { day: "Today", temperatureC: 28, condition: "Partly Cloudy", rainChancePercent: 20 },
  { day: "Tomorrow", temperatureC: 26, condition: "Rainy", rainChancePercent: 80 },
  { day: "Wednesday", temperatureC: 25, condition: "Heavy Rain", rainChancePercent: 95 },
  { day: "Thursday", temperatureC: 27, condition: "Cloudy", rainChancePercent: 40 },
  { day: "Friday", temperatureC: 29, condition: "Sunny", rainChancePercent: 10 },
];

const WEATHER_CODE_TO_CONDITION = {
  0: "Sunny",
  1: "Partly Cloudy",
  2: "Partly Cloudy",
  3: "Cloudy",
  45: "Cloudy",
  48: "Cloudy",
  51: "Rainy",
  53: "Rainy",
  55: "Rainy",
  56: "Rainy",
  57: "Rainy",
  61: "Rainy",
  63: "Rainy",
  65: "Heavy Rain",
  66: "Rainy",
  67: "Heavy Rain",
  71: "Cloudy",
  73: "Cloudy",
  75: "Cloudy",
  77: "Cloudy",
  80: "Rainy",
  81: "Rainy",
  82: "Heavy Rain",
  85: "Cloudy",
  86: "Cloudy",
  95: "Heavy Rain",
  96: "Heavy Rain",
  99: "Heavy Rain",
};

function toCondition(code) {
  return WEATHER_CODE_TO_CONDITION[Number(code)] ?? "Cloudy";
}

function roundNumber(value, fallback = 0) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.round(numeric);
}

function toDayLabel(index, dateIso) {
  if (index === 0) return "Today";
  if (index === 1) return "Tomorrow";

  const date = new Date(dateIso);
  if (Number.isNaN(date.getTime())) return `Day ${index + 1}`;
  return date.toLocaleDateString("en-US", { weekday: "long" });
}

async function fetchLocationWeather(latitude, longitude) {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set("current", "temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code");
  url.searchParams.set("daily", "temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code");
  url.searchParams.set("forecast_days", "5");
  url.searchParams.set("timezone", "auto");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Weather provider returned ${response.status}`);
    }

    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

export async function getWeatherSnapshotForLocation(latitude = DEFAULT_LAT, longitude = DEFAULT_LON) {
  try {
    const payload = await fetchLocationWeather(latitude, longitude);
    const current = payload?.current ?? {};
    const daily = payload?.daily ?? {};

    return {
      currentTempC: roundNumber(current.temperature_2m, weatherSnapshot.currentTempC),
      feelsLikeC: roundNumber(current.apparent_temperature, weatherSnapshot.feelsLikeC),
      humidityPercent: roundNumber(current.relative_humidity_2m, weatherSnapshot.humidityPercent),
      windKmph: roundNumber(current.wind_speed_10m, weatherSnapshot.windKmph),
      highC: roundNumber(daily.temperature_2m_max?.[0], weatherSnapshot.highC),
      lowC: roundNumber(daily.temperature_2m_min?.[0], weatherSnapshot.lowC),
      condition: toCondition(current.weather_code),
      location: {
        latitude,
        longitude,
      },
    };
  } catch {
    return {
      ...weatherSnapshot,
      location: {
        latitude,
        longitude,
      },
    };
  }
}

export async function getWeatherForecastForLocation(latitude = DEFAULT_LAT, longitude = DEFAULT_LON) {
  try {
    const payload = await fetchLocationWeather(latitude, longitude);
    const daily = payload?.daily ?? {};
    const dates = Array.isArray(daily.time) ? daily.time : [];
    const highs = Array.isArray(daily.temperature_2m_max) ? daily.temperature_2m_max : [];
    const lows = Array.isArray(daily.temperature_2m_min) ? daily.temperature_2m_min : [];
    const precipitation = Array.isArray(daily.precipitation_probability_max)
      ? daily.precipitation_probability_max
      : [];
    const weatherCodes = Array.isArray(daily.weather_code) ? daily.weather_code : [];

    const rows = dates.slice(0, 5).map((date, index) => ({
      day: toDayLabel(index, date),
      temperatureC: roundNumber((Number(highs[index] ?? 0) + Number(lows[index] ?? 0)) / 2, 0),
      condition: toCondition(weatherCodes[index]),
      rainChancePercent: roundNumber(precipitation[index], 0),
    }));

    return rows.length > 0 ? rows : weatherForecast;
  } catch {
    return weatherForecast;
  }
}

export const marketPrices = [
  { crop: "Wheat", market: "Local Mandi", pricePerKg: 21.5, changePercent: 5.2 },
  { crop: "Rice", market: "Regional Market", pricePerKg: 19.8, changePercent: 2.8 },
  { crop: "Cotton", market: "City Market", pricePerKg: 56, changePercent: -1.5 },
  { crop: "Sugarcane", market: "Local Mandi", pricePerKg: 2.8, changePercent: 3.1 },
  { crop: "Maize", market: "Regional Market", pricePerKg: 18.5, changePercent: 4.2 },
  { crop: "Soybean", market: "City Market", pricePerKg: 42, changePercent: -0.8 },
  { crop: "Potato", market: "Local Mandi", pricePerKg: 18, changePercent: 12.5 },
  { crop: "Tomato", market: "Regional Market", pricePerKg: 32, changePercent: 18.7 },
  { crop: "Onion", market: "City Market", pricePerKg: 25, changePercent: -5.2 },
];

export const schedule = [
  {
    phase: "Sowing Window",
    date: "Nov 15 - Nov 30",
    status: "upcoming",
    color: "leaf",
    tasks: [
      { task: "Prepare seedbed", reason: "Soil moisture is optimal after recent rain" },
      { task: "Apply basal fertilizer", reason: "Apply DAP and MOP before sowing" },
      { task: "Sow wheat seeds", reason: "Temperature range 15-20 C is ideal" },
    ],
  },
  {
    phase: "First Irrigation",
    date: "Dec 20 - Dec 25",
    status: "pending",
    color: "sky",
    tasks: [
      { task: "Crown root irrigation", reason: "21 days after sowing" },
      { task: "Apply first split of Urea", reason: "Apply one-third of total nitrogen" },
      { task: "Light irrigation", reason: "Based on soil moisture readings" },
    ],
  },
  {
    phase: "Spray Advisory",
    date: "Jan 10 - Jan 15",
    status: "pending",
    color: "earth",
    tasks: [
      { task: "Weed control spray", reason: "Apply post-emergence herbicide" },
      { task: "Pest monitoring", reason: "Check for aphids and termites" },
      { task: "Second nitrogen split", reason: "Apply one-third of Urea dose" },
    ],
  },
  {
    phase: "Harvest Period",
    date: "Apr 1 - Apr 15",
    status: "pending",
    color: "forest",
    tasks: [
      { task: "Monitor grain moisture", reason: "Harvest when moisture is 18-20%" },
      { task: "Arrange equipment", reason: "Book combine harvester in advance" },
      { task: "Post-harvest processing", reason: "Thresh and clean immediately" },
    ],
  },
];

export function computeSoilRecommendation(input) {
  const healthScore = Math.max(
    45,
    Math.min(95, Math.round((input.nitrogen + input.phosphorus + input.potassium) / 4)),
  );

  return {
    healthScore,
    healthLabel: healthScore >= 75 ? "Good" : "Needs Improvement",
    crops: [
      { name: "Wheat", suitability: 95, season: "Rabi", npk: "120-60-40", profit: "High" },
      { name: "Rice", suitability: 88, season: "Kharif", npk: "100-50-50", profit: "High" },
      { name: "Cotton", suitability: 75, season: "Kharif", npk: "80-40-40", profit: "Medium" },
    ],
  };
}
