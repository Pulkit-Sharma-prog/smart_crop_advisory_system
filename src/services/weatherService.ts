import { z } from "zod";
import { appEnv } from "../config/env";
import { logger } from "../utils/logger";
import { apiRequest } from "./httpClient";
import { mockWeatherForecast, mockWeatherSnapshot } from "./mockData";

export interface WeatherForecastItem {
  day: string;
  temperatureC: number;
  condition: string;
  rainChancePercent: number;
}

export interface WeatherSnapshot {
  currentTempC: number;
  feelsLikeC: number;
  humidityPercent: number;
  windKmph: number;
  highC: number;
  lowC: number;
}

const snapshotSchema = z.object({
  currentTempC: z.number(),
  feelsLikeC: z.number(),
  humidityPercent: z.number(),
  windKmph: z.number(),
  highC: z.number(),
  lowC: z.number(),
});

const forecastItemSchema = z.object({
  day: z.string(),
  temperatureC: z.number(),
  condition: z.string(),
  rainChancePercent: z.number(),
});

const forecastSchema = z.array(forecastItemSchema);

function fallbackSnapshot(error: unknown): WeatherSnapshot {
  logger.warn("Weather snapshot API failed. Falling back to mock data.", error);
  return mockWeatherSnapshot;
}

function fallbackForecast(error: unknown): WeatherForecastItem[] {
  logger.warn("Weather forecast API failed. Falling back to mock data.", error);
  return mockWeatherForecast;
}

export async function getWeatherSnapshot(): Promise<WeatherSnapshot> {
  if (appEnv.useMockData) {
    return mockWeatherSnapshot;
  }

  try {
    const response = await apiRequest<unknown>("/api/weather/snapshot");
    return snapshotSchema.parse(response);
  } catch (error) {
    if (appEnv.allowApiFallback) {
      return fallbackSnapshot(error);
    }

    throw error;
  }
}

export async function getForecast(): Promise<WeatherForecastItem[]> {
  if (appEnv.useMockData) {
    return mockWeatherForecast;
  }

  try {
    const response = await apiRequest<unknown>("/api/weather/forecast");
    return forecastSchema.parse(response);
  } catch (error) {
    if (appEnv.allowApiFallback) {
      return fallbackForecast(error);
    }

    throw error;
  }
}
