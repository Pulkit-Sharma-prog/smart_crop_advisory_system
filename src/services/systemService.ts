import { appEnv } from "../config/env";
import { apiRequest } from "./httpClient";

export interface BackendHealth {
  status: "ok" | "degraded";
  service: string;
  mode: "mock" | "live";
}

export interface RuntimeConfigStatus {
  copilot: {
    llmReady: boolean;
    mode: "llm" | "fallback";
  };
  diseaseAi: {
    plantIdReady: boolean;
    openAiVisionReady: boolean;
  };
  database: {
    mysqlReady: boolean;
  };
}

export async function getBackendHealth(): Promise<BackendHealth> {
  if (appEnv.useMockData) {
    return {
      status: "ok",
      service: "mock-runtime",
      mode: "mock",
    };
  }

  const response = await apiRequest<{ status: string; service: string }>("/api/health", {
    retryCount: 0,
    timeoutMs: 3000,
  });

  return {
    status: response.status === "ok" ? "ok" : "degraded",
    service: response.service,
    mode: "live",
  };
}

export async function getRuntimeConfigStatus(): Promise<RuntimeConfigStatus> {
  if (appEnv.useMockData) {
    return {
      copilot: { llmReady: false, mode: "fallback" },
      diseaseAi: { plantIdReady: false, openAiVisionReady: false },
      database: { mysqlReady: false },
    };
  }

  return apiRequest<RuntimeConfigStatus>("/api/system/config-status", {
    retryCount: 0,
    timeoutMs: 3000,
  });
}
