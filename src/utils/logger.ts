import { appEnv } from "../config/env";

function emit(level: "info" | "warn" | "error", message: string, metadata?: unknown) {
  if (!appEnv.debugLogs && level === "info") {
    return;
  }

  const payload = metadata ? [message, metadata] : [message];

  if (level === "info") {
    console.info("[smart-crop]", ...payload);
    return;
  }

  if (level === "warn") {
    console.warn("[smart-crop]", ...payload);
    return;
  }

  console.error("[smart-crop]", ...payload);
}

export const logger = {
  info: (message: string, metadata?: unknown) => emit("info", message, metadata),
  warn: (message: string, metadata?: unknown) => emit("warn", message, metadata),
  error: (message: string, metadata?: unknown) => emit("error", message, metadata),
};
