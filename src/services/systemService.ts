import { appEnv } from "../config/env";
import { apiRequest } from "./httpClient";

export interface BackendHealth {
  status: "ok" | "degraded";
  service: string;
  mode: "mock" | "live";
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
