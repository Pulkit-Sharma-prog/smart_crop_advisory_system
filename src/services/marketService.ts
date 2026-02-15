import { z } from "zod";
import { appEnv } from "../config/env";
import { logger } from "../utils/logger";
import { apiRequest } from "./httpClient";
import { mockMarketData } from "./mockData";

export interface MarketItem {
  crop: string;
  market: string;
  pricePerKg: number;
  changePercent: number;
  distanceKm?: number;
}

export interface MarketLocationInput {
  latitude: number;
  longitude: number;
}

const marketItemSchema = z.object({
  crop: z.string(),
  market: z.string(),
  pricePerKg: z.number(),
  changePercent: z.number(),
  distanceKm: z.number().optional(),
});

const marketSchema = z.array(marketItemSchema);

function toQuery(location?: MarketLocationInput) {
  if (!location) return "";
  return `?latitude=${encodeURIComponent(location.latitude)}&longitude=${encodeURIComponent(location.longitude)}`;
}

export async function getMarketPrices(location?: MarketLocationInput): Promise<MarketItem[]> {
  if (appEnv.useMockData) {
    return mockMarketData;
  }

  try {
    const response = await apiRequest<unknown>(`/api/market/prices${toQuery(location)}`);
    return marketSchema.parse(response);
  } catch (error) {
    if (appEnv.allowApiFallback) {
      logger.warn("Market price API failed. Falling back to mock data.", error);
      return mockMarketData;
    }

    throw error;
  }
}
