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

const mandiCatalog = [
  { name: "Azadpur Mandi, Delhi", latitude: 28.7041, longitude: 77.1025 },
  { name: "Karnal Mandi, Haryana", latitude: 29.6857, longitude: 76.9905 },
  { name: "Ludhiana Grain Market, Punjab", latitude: 30.901, longitude: 75.8573 },
  { name: "Jaipur Muhana Mandi, Rajasthan", latitude: 26.9124, longitude: 75.7873 },
  { name: "Ahmedabad APMC, Gujarat", latitude: 23.0225, longitude: 72.5714 },
  { name: "Rajkot Mandi, Gujarat", latitude: 22.3039, longitude: 70.8022 },
  { name: "Nashik Mandi, Maharashtra", latitude: 19.9975, longitude: 73.7898 },
  { name: "Pune Market Yard, Maharashtra", latitude: 18.5204, longitude: 73.8567 },
  { name: "Nagpur Mandi, Maharashtra", latitude: 21.1458, longitude: 79.0882 },
  { name: "Indore Chhawni Mandi, MP", latitude: 22.7196, longitude: 75.8577 },
  { name: "Bhopal Krishi Upaj Mandi, MP", latitude: 23.2599, longitude: 77.4126 },
  { name: "Patna City Mandi, Bihar", latitude: 25.5941, longitude: 85.1376 },
  { name: "Kolkata Wholesale Market, WB", latitude: 22.5726, longitude: 88.3639 },
  { name: "Bhubaneswar Mandi, Odisha", latitude: 20.2961, longitude: 85.8245 },
  { name: "Hyderabad Bowenpally Market, Telangana", latitude: 17.385, longitude: 78.4867 },
  { name: "Bengaluru Yeshwanthpur Market, Karnataka", latitude: 12.9716, longitude: 77.5946 },
  { name: "Hubli APMC, Karnataka", latitude: 15.3647, longitude: 75.124 },
  { name: "Salem Market, Tamil Nadu", latitude: 11.6643, longitude: 78.146 },
  { name: "Chennai Koyambedu Market, Tamil Nadu", latitude: 13.0827, longitude: 80.2707 },
  { name: "Kochi Market, Kerala", latitude: 9.9312, longitude: 76.2673 },
];

const cropBenchmarks = [
  { crop: "Wheat", basePricePerKg: 21.5, baseChangePercent: 5.2 },
  { crop: "Rice", basePricePerKg: 19.8, baseChangePercent: 2.8 },
  { crop: "Cotton", basePricePerKg: 56.0, baseChangePercent: -1.5 },
  { crop: "Sugarcane", basePricePerKg: 2.8, baseChangePercent: 3.1 },
  { crop: "Maize", basePricePerKg: 18.5, baseChangePercent: 4.2 },
  { crop: "Soybean", basePricePerKg: 42.0, baseChangePercent: -0.8 },
  { crop: "Potato", basePricePerKg: 18.0, baseChangePercent: 12.5 },
  { crop: "Tomato", basePricePerKg: 32.0, baseChangePercent: 18.7 },
  { crop: "Onion", basePricePerKg: 25.0, baseChangePercent: -5.2 },
];

const slotProfiles = [
  { priceFactor: 0.985, trendBias: 0.2 },
  { priceFactor: 1.01, trendBias: 0.5 },
  { priceFactor: 1.03, trendBias: 0.8 },
];

function toRadians(value) {
  return (value * Math.PI) / 180;
}

function distanceKm(fromLat, fromLon, toLat, toLon) {
  const earthRadiusKm = 6371;
  const latDiff = toRadians(toLat - fromLat);
  const lonDiff = toRadians(toLon - fromLon);
  const lat1 = toRadians(fromLat);
  const lat2 = toRadians(toLat);
  const arc = Math.sin(latDiff / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(lonDiff / 2) ** 2;
  const centralAngle = 2 * Math.atan2(Math.sqrt(arc), Math.sqrt(1 - arc));
  return earthRadiusKm * centralAngle;
}

function deterministicJitter(crop, market, range) {
  const seed = `${crop}|${market}`;
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) % 9973;
  }
  return (((hash % 1000) / 1000) * 2 - 1) * range;
}

export function getMarketPricesForLocation(latitude = DEFAULT_LAT, longitude = DEFAULT_LON) {
  const nearestMandis = mandiCatalog
    .map((mandi) => ({
      ...mandi,
      distanceKm: distanceKm(latitude, longitude, mandi.latitude, mandi.longitude),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 3);

  return cropBenchmarks.flatMap((crop) => {
    return nearestMandis.map((mandi, index) => {
      const profile = slotProfiles[index] ?? slotProfiles[slotProfiles.length - 1];
      const priceJitter = deterministicJitter(crop.crop, mandi.name, 0.7);
      const trendJitter = deterministicJitter(mandi.name, crop.crop, 0.4);

      const pricePerKg = Number((crop.basePricePerKg * profile.priceFactor + priceJitter).toFixed(2));
      const changePercent = Number((crop.baseChangePercent + profile.trendBias + trendJitter).toFixed(1));

      return {
        crop: crop.crop,
        market: mandi.name,
        pricePerKg: Math.max(0.5, pricePerKg),
        changePercent,
        distanceKm: Number(mandi.distanceKm.toFixed(1)),
      };
    });
  });
}

export const marketPrices = getMarketPricesForLocation();

const scheduleProfiles = {
  wheat: {
    label: { en: "Wheat", hi: "गेहूं" },
    windows: {
      sowing: { en: "Nov 15 - Dec 05", hi: "15 नवम्बर - 05 दिसंबर" },
      irrigation: { en: "Dec 20 - Dec 30", hi: "20 दिसंबर - 30 दिसंबर" },
      spray: { en: "Jan 10 - Jan 25", hi: "10 जनवरी - 25 जनवरी" },
      harvest: { en: "Apr 01 - Apr 20", hi: "01 अप्रैल - 20 अप्रैल" },
    },
  },
  rice: {
    label: { en: "Rice", hi: "धान" },
    windows: {
      sowing: { en: "Jun 15 - Jul 10", hi: "15 जून - 10 जुलाई" },
      irrigation: { en: "Jul 20 - Aug 05", hi: "20 जुलाई - 05 अगस्त" },
      spray: { en: "Aug 10 - Sep 05", hi: "10 अगस्त - 05 सितंबर" },
      harvest: { en: "Oct 15 - Nov 20", hi: "15 अक्टूबर - 20 नवम्बर" },
    },
  },
  cotton: {
    label: { en: "Cotton", hi: "कपास" },
    windows: {
      sowing: { en: "May 25 - Jun 25", hi: "25 मई - 25 जून" },
      irrigation: { en: "Jul 05 - Jul 25", hi: "05 जुलाई - 25 जुलाई" },
      spray: { en: "Aug 01 - Sep 10", hi: "01 अगस्त - 10 सितंबर" },
      harvest: { en: "Oct 20 - Jan 10", hi: "20 अक्टूबर - 10 जनवरी" },
    },
  },
  maize: {
    label: { en: "Maize", hi: "मक्का" },
    windows: {
      sowing: { en: "Jun 10 - Jul 05", hi: "10 जून - 05 जुलाई" },
      irrigation: { en: "Jul 15 - Aug 05", hi: "15 जुलाई - 05 अगस्त" },
      spray: { en: "Aug 08 - Sep 05", hi: "08 अगस्त - 05 सितंबर" },
      harvest: { en: "Sep 25 - Oct 30", hi: "25 सितंबर - 30 अक्टूबर" },
    },
  },
  soybean: {
    label: { en: "Soybean", hi: "सोयाबीन" },
    windows: {
      sowing: { en: "Jun 15 - Jul 05", hi: "15 जून - 05 जुलाई" },
      irrigation: { en: "Jul 20 - Aug 10", hi: "20 जुलाई - 10 अगस्त" },
      spray: { en: "Aug 05 - Sep 01", hi: "05 अगस्त - 01 सितंबर" },
      harvest: { en: "Oct 05 - Nov 10", hi: "05 अक्टूबर - 10 नवम्बर" },
    },
  },
  sugarcane: {
    label: { en: "Sugarcane", hi: "गन्ना" },
    windows: {
      sowing: { en: "Feb 10 - Mar 25", hi: "10 फ़रवरी - 25 मार्च" },
      irrigation: { en: "Mar 20 - Apr 15", hi: "20 मार्च - 15 अप्रैल" },
      spray: { en: "May 01 - Jun 20", hi: "01 मई - 20 जून" },
      harvest: { en: "Dec 01 - Mar 30", hi: "01 दिसंबर - 30 मार्च" },
    },
  },
  potato: {
    label: { en: "Potato", hi: "आलू" },
    windows: {
      sowing: { en: "Oct 10 - Nov 20", hi: "10 अक्टूबर - 20 नवम्बर" },
      irrigation: { en: "Nov 15 - Dec 10", hi: "15 नवम्बर - 10 दिसंबर" },
      spray: { en: "Dec 01 - Jan 05", hi: "01 दिसंबर - 05 जनवरी" },
      harvest: { en: "Jan 25 - Mar 10", hi: "25 जनवरी - 10 मार्च" },
    },
  },
  tomato: {
    label: { en: "Tomato", hi: "टमाटर" },
    windows: {
      sowing: { en: "Jun 05 - Jul 15", hi: "05 जून - 15 जुलाई" },
      irrigation: { en: "Jul 20 - Aug 20", hi: "20 जुलाई - 20 अगस्त" },
      spray: { en: "Aug 05 - Sep 15", hi: "05 अगस्त - 15 सितंबर" },
      harvest: { en: "Oct 01 - Dec 30", hi: "01 अक्टूबर - 30 दिसंबर" },
    },
  },
  onion: {
    label: { en: "Onion", hi: "प्याज" },
    windows: {
      sowing: { en: "Oct 20 - Nov 30", hi: "20 अक्टूबर - 30 नवम्बर" },
      irrigation: { en: "Nov 25 - Dec 25", hi: "25 नवम्बर - 25 दिसंबर" },
      spray: { en: "Dec 10 - Jan 20", hi: "10 दिसंबर - 20 जनवरी" },
      harvest: { en: "Mar 15 - May 10", hi: "15 मार्च - 10 मई" },
    },
  },
};

const scheduleTasks = {
  sowing: {
    en: [
      { task: "Prepare field and seedbed", reason: "Good tilth improves early root establishment." },
      { task: "Apply basal nutrients", reason: "Balanced starter nutrients improve initial growth." },
      { task: "Complete sowing/transplanting", reason: "Timely planting aligns crop with best weather window." },
    ],
    hi: [
      { task: "खेत और क्यारी तैयार करें", reason: "अच्छी भुरभुरी मिट्टी से जड़ें जल्दी विकसित होती हैं।" },
      { task: "बेसल पोषक तत्व दें", reason: "संतुलित शुरुआती पोषण से प्रारंभिक वृद्धि बेहतर होती है।" },
      { task: "बुवाई/रोपाई पूरी करें", reason: "समय पर रोपण से फसल बेहतर मौसम विंडो में रहती है।" },
    ],
  },
  irrigation: {
    en: [
      { task: "Run first irrigation cycle", reason: "Supports uniform stand and root growth." },
      { task: "Check field moisture blocks", reason: "Prevents under- and over-irrigation zones." },
      { task: "Adjust irrigation frequency", reason: "Tune schedule based on weather and soil type." },
    ],
    hi: [
      { task: "पहला सिंचाई चक्र चलाएँ", reason: "समान पौध स्थापना और जड़ वृद्धि में मदद मिलती है।" },
      { task: "खेत की नमी वाले हिस्से जाँचें", reason: "कम या ज्यादा सिंचाई वाले क्षेत्रों से बचाव होता है।" },
      { task: "सिंचाई आवृत्ति समायोजित करें", reason: "मौसम और मिट्टी प्रकार के अनुसार शेड्यूल सुधारें।" },
    ],
  },
  spray: {
    en: [
      { task: "Scout pest and disease hotspots", reason: "Early detection keeps treatment cost lower." },
      { task: "Apply targeted spray plan", reason: "Need-based protection improves efficacy and saves input cost." },
      { task: "Record follow-up check date", reason: "Re-checking helps confirm control success." },
    ],
    hi: [
      { task: "कीट और रोग वाले हिस्सों की निगरानी करें", reason: "जल्दी पहचान से उपचार लागत कम रहती है।" },
      { task: "लक्षित स्प्रे योजना लागू करें", reason: "आवश्यकता आधारित सुरक्षा से असर बेहतर और लागत कम होती है।" },
      { task: "फॉलो-अप जांच तिथि नोट करें", reason: "दोबारा जांच से नियंत्रण की सफलता स्पष्ट होती है।" },
    ],
  },
  harvest: {
    en: [
      { task: "Check harvest maturity", reason: "Harvesting at correct stage improves price realization." },
      { task: "Plan labor and logistics", reason: "Advance planning reduces post-harvest delays." },
      { task: "Sort, grade, and dispatch", reason: "Better grading helps secure stronger mandi rates." },
    ],
    hi: [
      { task: "कटाई परिपक्वता जाँचें", reason: "सही अवस्था में कटाई से बेहतर बाजार भाव मिलता है।" },
      { task: "मजदूर और परिवहन योजना बनाएं", reason: "पहले से योजना करने पर कटाई बाद की देरी कम होती है।" },
      { task: "छंटाई, ग्रेडिंग और भेजाई करें", reason: "बेहतर ग्रेडिंग से मंडी में बेहतर रेट मिलने की संभावना बढ़ती है।" },
    ],
  },
};

function normalizeCrop(crop = "") {
  const normalized = String(crop).trim().toLowerCase();
  const aliases = {
    गेहूं: "wheat",
    धान: "rice",
    कपास: "cotton",
    मक्का: "maize",
    सोयाबीन: "soybean",
    गन्ना: "sugarcane",
    आलू: "potato",
    टमाटर: "tomato",
    प्याज: "onion",
  };
  return aliases[normalized] ?? normalized;
}

export function getScheduleForCrop(crop = "wheat", language = "en") {
  const lang = toLanguage(language);
  const key = normalizeCrop(crop);
  const profile = scheduleProfiles[key] ?? scheduleProfiles.wheat;

  const phaseName = {
    sowing: lang === "hi" ? "बुवाई चरण" : "Sowing Window",
    irrigation: lang === "hi" ? "पहली सिंचाई" : "First Irrigation",
    spray: lang === "hi" ? "स्प्रे सलाह" : "Spray Advisory",
    harvest: lang === "hi" ? "कटाई अवधि" : "Harvest Period",
  };

  return [
    {
      phase: `${phaseName.sowing} - ${profile.label[lang]}`,
      date: profile.windows.sowing[lang],
      status: "completed",
      color: "leaf",
      tasks: scheduleTasks.sowing[lang],
    },
    {
      phase: `${phaseName.irrigation} - ${profile.label[lang]}`,
      date: profile.windows.irrigation[lang],
      status: "upcoming",
      color: "sky",
      tasks: scheduleTasks.irrigation[lang],
    },
    {
      phase: `${phaseName.spray} - ${profile.label[lang]}`,
      date: profile.windows.spray[lang],
      status: "pending",
      color: "earth",
      tasks: scheduleTasks.spray[lang],
    },
    {
      phase: `${phaseName.harvest} - ${profile.label[lang]}`,
      date: profile.windows.harvest[lang],
      status: "pending",
      color: "forest",
      tasks: scheduleTasks.harvest[lang],
    },
  ];
}

export const schedule = getScheduleForCrop();

function toLanguage(value) {
  return value === "hi" ? "hi" : "en";
}

export function computeSoilRecommendation(input) {
  const language = toLanguage(input?.language);
  const healthScore = Math.max(
    45,
    Math.min(95, Math.round((input.nitrogen + input.phosphorus + input.potassium) / 4)),
  );

  return {
    healthScore,
    healthLabel:
      healthScore >= 75
        ? language === "hi" ? "अच्छा" : "Good"
        : language === "hi" ? "सुधार की आवश्यकता" : "Needs Improvement",
    crops: [
      {
        name: language === "hi" ? "गेहूं" : "Wheat",
        suitability: 95,
        season: language === "hi" ? "रबी" : "Rabi",
        npk: "120-60-40",
        profit: "High",
      },
      {
        name: language === "hi" ? "धान" : "Rice",
        suitability: 88,
        season: language === "hi" ? "खरीफ" : "Kharif",
        npk: "100-50-50",
        profit: "High",
      },
      {
        name: language === "hi" ? "कपास" : "Cotton",
        suitability: 75,
        season: language === "hi" ? "खरीफ" : "Kharif",
        npk: "80-40-40",
        profit: "Medium",
      },
    ],
  };
}

export function computeLocationAdvisory(input) {
  const language = toLanguage(input?.language);
  const latitude = Number(input.latitude);
  const longitude = Number(input.longitude);
  const latBand = latitude >= 23 ? "north" : latitude <= 16 ? "south" : "central";
  const rainScore = Math.round((Math.abs(longitude) % 1) * 100);
  const isHumid = longitude > 84;

  const climateByBand = {
    north: {
      zone: "Subtropical continental",
      tempBandC: "8-38 C",
      rainfallBandMm: rainScore > 45 ? "700-1100 mm" : "500-900 mm",
      humidityBand: isHumid ? "Moderate-High" : "Low-Moderate",
      seasonSignal: "Heat stress risk in late spring",
    },
    central: {
      zone: "Tropical wet-dry",
      tempBandC: "16-40 C",
      rainfallBandMm: rainScore > 40 ? "800-1300 mm" : "600-1000 mm",
      humidityBand: isHumid ? "Moderate" : "Low",
      seasonSignal: "Monsoon-driven sowing window",
    },
    south: {
      zone: "Tropical humid",
      tempBandC: "20-36 C",
      rainfallBandMm: rainScore > 35 ? "900-1600 mm" : "700-1200 mm",
      humidityBand: "Moderate-High",
      seasonSignal: "High disease pressure in humid periods",
    },
  };

  const soilByBand = {
    north: {
      soilType: "Alluvial loam",
      phBand: "6.8-7.6",
      organicCarbon: "Medium",
      drainage: "Good",
    },
    central: {
      soilType: "Black cotton / clay loam",
      phBand: "7.0-8.1",
      organicCarbon: "Medium-Low",
      drainage: "Moderate",
    },
    south: {
      soilType: "Red loam / lateritic mix",
      phBand: "5.9-7.0",
      organicCarbon: "Medium",
      drainage: "Fast",
    },
  };

  const cropsByBand = {
    north: ["Wheat", "Mustard", "Potato"],
    central: ["Soybean", "Cotton", "Pigeon pea"],
    south: ["Paddy", "Groundnut", "Millets"],
  };

  return {
    locationLabel:
      language === "hi"
        ? `अक्षांश ${latitude.toFixed(3)}, देशांतर ${longitude.toFixed(3)}`
        : `Lat ${latitude.toFixed(3)}, Lon ${longitude.toFixed(3)}`,
    coordinates: { latitude, longitude },
    climate: {
      ...climateByBand[latBand],
      zone:
        language === "hi"
          ? {
              "Subtropical continental": "उपोष्णकटिबंधीय महाद्वीपीय",
              "Tropical wet-dry": "उष्णकटिबंधीय आर्द्र-शुष्क",
              "Tropical humid": "उष्णकटिबंधीय आर्द्र",
            }[climateByBand[latBand].zone] ?? climateByBand[latBand].zone
          : climateByBand[latBand].zone,
      humidityBand:
        language === "hi"
          ? {
              "Moderate-High": "मध्यम-उच्च",
              "Low-Moderate": "कम-मध्यम",
              Moderate: "मध्यम",
              Low: "कम",
            }[climateByBand[latBand].humidityBand] ?? climateByBand[latBand].humidityBand
          : climateByBand[latBand].humidityBand,
      seasonSignal:
        language === "hi"
          ? {
              "Heat stress risk in late spring": "देर वसंत में गर्मी तनाव का जोखिम",
              "Monsoon-driven sowing window": "मानसून आधारित बुवाई विंडो",
              "High disease pressure in humid periods": "आर्द्र अवधि में रोग दबाव अधिक",
            }[climateByBand[latBand].seasonSignal] ?? climateByBand[latBand].seasonSignal
          : climateByBand[latBand].seasonSignal,
    },
    soil: {
      ...soilByBand[latBand],
      soilType:
        language === "hi"
          ? {
              "Alluvial loam": "जलोढ़ दोमट",
              "Black cotton / clay loam": "काली कपासी / चिकनी दोमट",
              "Red loam / lateritic mix": "लाल दोमट / लेटराइट मिश्रण",
            }[soilByBand[latBand].soilType] ?? soilByBand[latBand].soilType
          : soilByBand[latBand].soilType,
      organicCarbon:
        language === "hi"
          ? {
              "Medium-Low": "मध्यम-कम",
              Medium: "मध्यम",
            }[soilByBand[latBand].organicCarbon] ?? soilByBand[latBand].organicCarbon
          : soilByBand[latBand].organicCarbon,
      drainage:
        language === "hi"
          ? {
              Good: "अच्छा",
              Moderate: "मध्यम",
              Fast: "तेज",
            }[soilByBand[latBand].drainage] ?? soilByBand[latBand].drainage
          : soilByBand[latBand].drainage,
    },
    recommendedCrops:
      language === "hi"
        ? cropsByBand[latBand].map((crop) =>
            ({
              Wheat: "गेहूं",
              Mustard: "सरसों",
              Potato: "आलू",
              Soybean: "सोयाबीन",
              Cotton: "कपास",
              "Pigeon pea": "अरहर",
              Paddy: "धान",
              Groundnut: "मूंगफली",
              Millets: "मोटे अनाज",
            }[crop] ?? crop),
          )
        : cropsByBand[latBand],
    actions:
      language === "hi"
        ? [
            "मौसम आधारित सिंचाई शेड्यूल अपनाएं।",
            "विकास चरणों में पोषक तत्वों की खुराक विभाजित करें।",
            "कीट और रोग की साप्ताहिक निगरानी की योजना बनाएं।",
          ]
        : [
            "Use weather-linked irrigation scheduling.",
            "Split nutrient doses across growth stages.",
            "Plan preventive pest and disease scouting weekly.",
          ],
    caution: isHumid
      ? language === "hi"
        ? "उच्च आर्द्रता फफूंद संक्रमण बढ़ा सकती है; घनी पत्तियों में नमी जमने से बचाएं।"
        : "High humidity can trigger fungal outbreaks; avoid dense canopy moisture buildup."
      : language === "hi"
        ? "अत्यधिक गर्मी से उपज घट सकती है; दोपहर की तेज गर्मी में फसल की सुरक्षा करें।"
        : "Heat spikes may reduce yield; protect crop during extreme afternoon temperatures.",
  };
}
