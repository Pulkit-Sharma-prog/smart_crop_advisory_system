import { appEnv } from "../config/env";

export class HttpError extends Error {
  status: number;
  details: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.details = details;
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: Record<string, string>;
  body?: BodyInit | null;
  timeoutMs?: number;
  retryCount?: number;
}

function shouldRetry(error: unknown): boolean {
  if (error instanceof HttpError) {
    return error.status >= 500;
  }

  return true;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const timeoutMs = options.timeoutMs ?? appEnv.apiTimeoutMs;
  const retryCount = options.retryCount ?? appEnv.apiRetryCount;

  let attempt = 0;

  while (attempt <= retryCount) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(`${appEnv.apiBaseUrl}${path}`, {
        method: options.method ?? "GET",
        headers: options.headers,
        body: options.body,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const text = await response.text();
      const payload = text ? (JSON.parse(text) as unknown) : null;

      if (!response.ok) {
        throw new HttpError(`API request failed with status ${response.status}`, response.status, payload);
      }

      return payload as T;
    } catch (error) {
      clearTimeout(timeout);

      const canRetry = attempt < retryCount && shouldRetry(error);
      if (!canRetry) {
        throw error;
      }

      attempt += 1;
    }
  }

  throw new Error("Unreachable request state");
}
