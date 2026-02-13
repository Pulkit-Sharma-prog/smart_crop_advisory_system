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
}

const marketItemSchema = z.object({
  crop: z.string(),
  market: z.string(),
  pricePerKg: z.number(),
  changePercent: z.number(),
});

const marketSchema = z.array(marketItemSchema);

export async function getMarketPrices(): Promise<MarketItem[]> {
  if (appEnv.useMockData) {
    return mockMarketData;
  }

  try {
    const response = await apiRequest<unknown>("/api/market/prices");
    return marketSchema.parse(response);
  } catch (error) {
    if (appEnv.allowApiFallback) {
      logger.warn("Market price API failed. Falling back to mock data.", error);
      return mockMarketData;
    }

    throw error;
  }
}
