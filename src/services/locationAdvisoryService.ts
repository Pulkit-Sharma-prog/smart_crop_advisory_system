import { z } from "zod";
import { appEnv } from "../config/env";
import { logger } from "../utils/logger";
import { apiRequest } from "./httpClient";

export interface LocationAdvisoryInput {
  latitude: number;
  longitude: number;
}

interface ClimateProfile {
  zone: string;
  tempBandC: string;
  rainfallBandMm: string;
  humidityBand: string;
  seasonSignal: string;
}

interface SoilProfile {
  soilType: string;
  phBand: string;
  organicCarbon: string;
  drainage: string;
}

export interface LocationAdvisoryResult {
  locationLabel: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  climate: ClimateProfile;
  soil: SoilProfile;
  recommendedCrops: string[];
  actions: string[];
  caution: string;
}

const locationAdvisorySchema = z.object({
  locationLabel: z.string(),
  coordinates: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  climate: z.object({
    zone: z.string(),
    tempBandC: z.string(),
    rainfallBandMm: z.string(),
    humidityBand: z.string(),
    seasonSignal: z.string(),
  }),
  soil: z.object({
    soilType: z.string(),
    phBand: z.string(),
    organicCarbon: z.string(),
    drainage: z.string(),
  }),
  recommendedCrops: z.array(z.string()),
  actions: z.array(z.string()),
  caution: z.string(),
});

function mockLocationAdvisory({ latitude, longitude }: LocationAdvisoryInput): LocationAdvisoryResult {
  const latBand = latitude >= 23 ? "north" : latitude <= 16 ? "south" : "central";
  const rainScore = Math.round((Math.abs(longitude) % 1) * 100);
  const isHumid = longitude > 84;

  const climateByBand: Record<string, ClimateProfile> = {
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

  const soilByBand: Record<string, SoilProfile> = {
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

  const cropsByBand: Record<string, string[]> = {
    north: ["Wheat", "Mustard", "Potato"],
    central: ["Soybean", "Cotton", "Pigeon pea"],
    south: ["Paddy", "Groundnut", "Millets"],
  };

  return {
    locationLabel: `Lat ${latitude.toFixed(3)}, Lon ${longitude.toFixed(3)}`,
    coordinates: { latitude, longitude },
    climate: climateByBand[latBand],
    soil: soilByBand[latBand],
    recommendedCrops: cropsByBand[latBand],
    actions: [
      "Use weather-linked irrigation scheduling.",
      "Split nutrient doses across growth stages.",
      "Plan preventive pest and disease scouting weekly.",
    ],
    caution: isHumid
      ? "High humidity can trigger fungal outbreaks; avoid dense canopy moisture buildup."
      : "Heat spikes may reduce yield; protect crop during extreme afternoon temperatures.",
  };
}

function localizeMockAdvisory(result: LocationAdvisoryResult, language: string): LocationAdvisoryResult {
  if (language !== "hi") return result;

  const toHindi = (value: string) =>
    ({
      "Subtropical continental": "उपोष्णकटिबंधीय महाद्वीपीय",
      "Tropical wet-dry": "उष्णकटिबंधीय आर्द्र-शुष्क",
      "Tropical humid": "उष्णकटिबंधीय आर्द्र",
      "Alluvial loam": "जलोढ़ दोमट",
      "Black cotton / clay loam": "काली कपासी / चिकनी दोमट",
      "Red loam / lateritic mix": "लाल दोमट / लेटराइट मिश्रण",
      "Heat stress risk in late spring": "देर वसंत में गर्मी तनाव का जोखिम",
      "Monsoon-driven sowing window": "मानसून आधारित बुवाई विंडो",
      "High disease pressure in humid periods": "आर्द्र अवधि में रोग दबाव अधिक",
      Wheat: "गेहूं",
      Mustard: "सरसों",
      Potato: "आलू",
      Soybean: "सोयाबीन",
      Cotton: "कपास",
      "Pigeon pea": "अरहर",
      Paddy: "धान",
      Groundnut: "मूंगफली",
      Millets: "मोटे अनाज",
      "Use weather-linked irrigation scheduling.": "मौसम आधारित सिंचाई शेड्यूल अपनाएं।",
      "Split nutrient doses across growth stages.": "विकास चरणों में पोषक तत्वों की खुराक विभाजित करें।",
      "Plan preventive pest and disease scouting weekly.": "कीट और रोग की साप्ताहिक निगरानी की योजना बनाएं।",
      "High humidity can trigger fungal outbreaks; avoid dense canopy moisture buildup.":
        "उच्च आर्द्रता फफूंद संक्रमण बढ़ा सकती है; घनी पत्तियों में नमी जमने से बचाएं।",
      "Heat spikes may reduce yield; protect crop during extreme afternoon temperatures.":
        "अत्यधिक गर्मी से उपज घट सकती है; दोपहर की तेज गर्मी में फसल की सुरक्षा करें।",
    }[value] ?? value);

  return {
    ...result,
    locationLabel: `अक्षांश ${result.coordinates.latitude.toFixed(3)}, देशांतर ${result.coordinates.longitude.toFixed(3)}`,
    climate: {
      ...result.climate,
      zone: toHindi(result.climate.zone),
      seasonSignal: toHindi(result.climate.seasonSignal),
    },
    soil: {
      ...result.soil,
      soilType: toHindi(result.soil.soilType),
    },
    recommendedCrops: result.recommendedCrops.map(toHindi),
    actions: result.actions.map(toHindi),
    caution: toHindi(result.caution),
  };
}

export async function getLocationAdvisory(input: LocationAdvisoryInput, language = "en"): Promise<LocationAdvisoryResult> {
  if (appEnv.useMockData) {
    return localizeMockAdvisory(mockLocationAdvisory(input), language);
  }

  try {
    const response = await apiRequest<unknown>("/api/recommendations/location", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...input, language }),
    });

    return locationAdvisorySchema.parse(response);
  } catch (error) {
    if (appEnv.allowApiFallback) {
      logger.warn("Location advisory API failed. Falling back to local advisory engine.", error);
      return localizeMockAdvisory(mockLocationAdvisory(input), language);
    }

    throw error;
  }
}
