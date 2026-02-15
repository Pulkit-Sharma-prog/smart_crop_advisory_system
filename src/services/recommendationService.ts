import { z } from "zod";
import { appEnv } from "../config/env";
import { logger } from "../utils/logger";
import { apiRequest } from "./httpClient";
import { mockSoilRecommendation } from "./mockData";

export interface SoilRecommendationInput {
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  ph: number;
  landSize: number;
}

export interface CropRecommendation {
  name: string;
  suitability: number;
  season: string;
  npk: string;
  profit: "High" | "Medium" | "Low";
}

export interface SoilRecommendationResult {
  healthScore: number;
  healthLabel: string;
  crops: CropRecommendation[];
}

const cropRecommendationSchema = z.object({
  name: z.string(),
  suitability: z.number(),
  season: z.string(),
  npk: z.string(),
  profit: z.enum(["High", "Medium", "Low"]),
});

const recommendationSchema = z.object({
  healthScore: z.number(),
  healthLabel: z.string(),
  crops: z.array(cropRecommendationSchema),
});

export async function getSoilRecommendation(
  input: SoilRecommendationInput,
  language = "en",
): Promise<SoilRecommendationResult> {
  if (appEnv.useMockData) {
    return mockSoilRecommendation(input);
  }

  try {
    const response = await apiRequest<unknown>("/api/recommendations/soil", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...input, language }),
    });

    return recommendationSchema.parse(response);
  } catch (error) {
    if (appEnv.allowApiFallback) {
      logger.warn("Soil recommendation API failed. Falling back to mock engine.", error);
      return mockSoilRecommendation(input);
    }

    throw error;
  }
}
