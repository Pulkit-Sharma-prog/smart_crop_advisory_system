import { z } from "zod";

const boolFromEnv = z
  .union([z.boolean(), z.string()])
  .optional()
  .transform((value) => {
    if (typeof value === "boolean") {
      return value;
    }

    if (typeof value === "string") {
      return value.toLowerCase() === "true";
    }

    return undefined;
  });

const envSchema = z.object({
  VITE_API_BASE_URL: z
    .union([z.string().url(), z.literal("")])
    .optional()
    .transform((value) => (value && value.trim() ? value : "http://localhost:3000")),
  VITE_USE_MOCK_DATA: boolFromEnv,
  VITE_ALLOW_API_FALLBACK: boolFromEnv,
  VITE_API_TIMEOUT_MS: z.coerce.number().int().positive().default(8000),
  VITE_API_RETRY_COUNT: z.coerce.number().int().min(0).max(3).default(1),
  VITE_DEBUG_LOGS: boolFromEnv.default(false),
});

const parsedResult = envSchema.safeParse({
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  VITE_USE_MOCK_DATA: import.meta.env.VITE_USE_MOCK_DATA,
  VITE_ALLOW_API_FALLBACK: import.meta.env.VITE_ALLOW_API_FALLBACK,
  VITE_API_TIMEOUT_MS: import.meta.env.VITE_API_TIMEOUT_MS,
  VITE_API_RETRY_COUNT: import.meta.env.VITE_API_RETRY_COUNT,
  VITE_DEBUG_LOGS: import.meta.env.VITE_DEBUG_LOGS,
});

const isTestMode = import.meta.env.MODE === "test";

const parsed = parsedResult.success
  ? {
      ...parsedResult.data,
      VITE_USE_MOCK_DATA: parsedResult.data.VITE_USE_MOCK_DATA ?? isTestMode,
      VITE_ALLOW_API_FALLBACK: parsedResult.data.VITE_ALLOW_API_FALLBACK ?? isTestMode,
    }
  : {
      VITE_API_BASE_URL: "http://localhost:3000",
      VITE_USE_MOCK_DATA: isTestMode,
      VITE_ALLOW_API_FALLBACK: isTestMode,
      VITE_API_TIMEOUT_MS: 8000,
      VITE_API_RETRY_COUNT: 1,
      VITE_DEBUG_LOGS: false,
    };

export const appEnv = {
  apiBaseUrl: parsed.VITE_API_BASE_URL,
  useMockData: parsed.VITE_USE_MOCK_DATA,
  allowApiFallback: parsed.VITE_ALLOW_API_FALLBACK,
  apiTimeoutMs: parsed.VITE_API_TIMEOUT_MS,
  apiRetryCount: parsed.VITE_API_RETRY_COUNT,
  debugLogs: parsed.VITE_DEBUG_LOGS,
} as const;
