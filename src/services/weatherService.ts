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
  condition?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface WeatherLocationInput {
  latitude: number;
  longitude: number;
}

const snapshotSchema = z.object({
  currentTempC: z.number(),
  feelsLikeC: z.number(),
  humidityPercent: z.number(),
  windKmph: z.number(),
  highC: z.number(),
  lowC: z.number(),
  condition: z.string().optional(),
  location: z
    .object({
      latitude: z.number(),
      longitude: z.number(),
    })
    .optional(),
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

function toQuery(location?: WeatherLocationInput) {
  if (!location) return "";
  return `?latitude=${encodeURIComponent(location.latitude)}&longitude=${encodeURIComponent(location.longitude)}`;
}

export async function getWeatherSnapshot(location?: WeatherLocationInput): Promise<WeatherSnapshot> {
  if (appEnv.useMockData) {
    return mockWeatherSnapshot;
  }

  try {
    const response = await apiRequest<unknown>(`/api/weather/snapshot${toQuery(location)}`);
    return snapshotSchema.parse(response);
  } catch (error) {
    if (appEnv.allowApiFallback) {
      return fallbackSnapshot(error);
    }

    throw error;
  }
}

export async function getForecast(location?: WeatherLocationInput): Promise<WeatherForecastItem[]> {
  if (appEnv.useMockData) {
    return mockWeatherForecast;
  }

  try {
    const response = await apiRequest<unknown>(`/api/weather/forecast${toQuery(location)}`);
    return forecastSchema.parse(response);
  } catch (error) {
    if (appEnv.allowApiFallback) {
      return fallbackForecast(error);
    }

    throw error;
  }
}
