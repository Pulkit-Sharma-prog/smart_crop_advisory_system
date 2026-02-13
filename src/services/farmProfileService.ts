export interface FarmProfile {
  farmerName: string;
  village: string;
  primaryCrop: string;
  landSizeAcres: number;
}

export interface ProfitabilityScenario {
  crop: string;
  areaAcres: number;
  expectedYieldKgPerAcre: number;
  sellingPricePerKg: number;
  seedCost: number;
  fertilizerCost: number;
  laborCost: number;
  irrigationCost: number;
}

export interface ProfitabilityResult {
  revenue: number;
  cost: number;
  profit: number;
  profitPerAcre: number;
  breakEvenPrice: number;
}

const PROFILE_KEY = "smart_crop_profile";
const SOIL_RESULT_KEY = "smart_crop_last_soil_result";
const DISEASE_RESULT_KEY = "smart_crop_last_disease_result";
const LOCATION_ADVISORY_KEY = "smart_crop_last_location_advisory";

export function loadProfile(): FarmProfile {
  const raw = localStorage.getItem(PROFILE_KEY);
  if (!raw) {
    return {
      farmerName: "",
      village: "",
      primaryCrop: "Wheat",
      landSizeAcres: 5,
    };
  }

  try {
    return JSON.parse(raw) as FarmProfile;
  } catch {
    return {
      farmerName: "",
      village: "",
      primaryCrop: "Wheat",
      landSizeAcres: 5,
    };
  }
}

export function saveProfile(profile: FarmProfile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function saveLastSoilResult(payload: unknown) {
  localStorage.setItem(SOIL_RESULT_KEY, JSON.stringify(payload));
}

export function saveLastDiseaseResult(payload: unknown) {
  localStorage.setItem(DISEASE_RESULT_KEY, JSON.stringify(payload));
}

export function saveLastLocationAdvisory(payload: unknown) {
  localStorage.setItem(LOCATION_ADVISORY_KEY, JSON.stringify(payload));
}

export function loadRecentInsights(): {
  soil: unknown | null;
  disease: unknown | null;
  location: unknown | null;
} {
  const parse = (key: string) => {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as unknown;
    } catch {
      return null;
    }
  };

  return {
    soil: parse(SOIL_RESULT_KEY),
    disease: parse(DISEASE_RESULT_KEY),
    location: parse(LOCATION_ADVISORY_KEY),
  };
}

export function calculateProfitability(input: ProfitabilityScenario): ProfitabilityResult {
  const totalYield = input.areaAcres * input.expectedYieldKgPerAcre;
  const revenue = totalYield * input.sellingPricePerKg;
  const cost = input.seedCost + input.fertilizerCost + input.laborCost + input.irrigationCost;
  const profit = revenue - cost;

  return {
    revenue,
    cost,
    profit,
    profitPerAcre: profit / input.areaAcres,
    breakEvenPrice: totalYield > 0 ? cost / totalYield : 0,
  };
}
