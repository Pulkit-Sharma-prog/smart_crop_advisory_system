import type { DiseaseResult } from "./diseaseService";
import type { MarketItem } from "./marketService";
import type { SoilRecommendationInput, SoilRecommendationResult } from "./recommendationService";
import type { SchedulePhase } from "./scheduleService";
import type { WeatherForecastItem, WeatherSnapshot } from "./weatherService";

export const mockWeatherForecast: WeatherForecastItem[] = [
  { day: "Today", temperatureC: 28, condition: "Partly Cloudy", rainChancePercent: 20 },
  { day: "Tomorrow", temperatureC: 26, condition: "Rainy", rainChancePercent: 80 },
  { day: "Wednesday", temperatureC: 25, condition: "Heavy Rain", rainChancePercent: 95 },
  { day: "Thursday", temperatureC: 27, condition: "Cloudy", rainChancePercent: 40 },
  { day: "Friday", temperatureC: 29, condition: "Sunny", rainChancePercent: 10 },
];

export const mockWeatherSnapshot: WeatherSnapshot = {
  currentTempC: 28,
  feelsLikeC: 30,
  humidityPercent: 65,
  windKmph: 12,
  highC: 32,
  lowC: 24,
};

export const mockMarketData: MarketItem[] = [
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

export const mockSchedule: SchedulePhase[] = [
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

export function mockSoilRecommendation(input: SoilRecommendationInput): SoilRecommendationResult {
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

export const mockDiseaseResult: DiseaseResult = {
  diagnosisId: "mock-diagnosis-001",
  recordedAt: "2026-02-14T00:00:00.000Z",
  primary: {
    name: "Late Blight",
    confidence: 92,
    visibleSymptoms: ["Water-soaked lesions", "Dark patches on leaves"],
  },
  alternatives: [
    { name: "Early Blight", confidence: 6 },
    { name: "Septoria Leaf Spot", confidence: 2 },
  ],
  analysisSummary: "Visible lesions strongly match late blight-type foliar symptoms.",
  severity: "High",
  confidenceNote: "Confidence is based on visual symptom matching from uploaded image.",
  guidance: {
    preventiveMeasures: [
      "Improve airflow in canopy and avoid late overhead irrigation.",
      "Remove infected debris from field edge.",
    ],
    curativeActions: [
      "Remove highly infected leaves immediately.",
      "Apply recommended fungicide according to local guidance.",
      "Re-check spread after 3 to 5 days.",
    ],
    organicOptions: ["Use approved copper-based spray.", "Use Bacillus subtilis biocontrol products."],
    escalationAdvice: "Escalate to local agronomist if spread is still increasing after first treatment cycle.",
  },
  symptoms: ["Water-soaked lesions", "Dark patches on leaves"],
  sources: ["mock"],
  providerErrors: [],
};
