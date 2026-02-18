import crypto from "node:crypto";
import { backendEnv } from "../env.js";
import { readCheckpointRegistry } from "./checkpointRegistry.js";

function stableBucket(seed) {
  const digest = crypto.createHash("sha1").update(seed).digest("hex");
  const value = parseInt(digest.slice(0, 8), 16);
  return (value % 10_000) / 10_000;
}

function getVersionById(registry, id) {
  return (registry.versions ?? []).find((item) => item.id === id && item.enabled !== false) ?? null;
}

export async function selectDiseaseModelVersion(seed) {
  const registry = await readCheckpointRegistry();
  const routing = registry.routing ?? {};
  const canaryPercent = Number.isFinite(Number(routing.canaryPercent))
    ? Number(routing.canaryPercent)
    : backendEnv.modelCanaryPercent;

  const stableVersion = getVersionById(registry, routing.stableVersionId);
  const canaryVersion = getVersionById(registry, routing.canaryVersionId);

  if (!stableVersion && !canaryVersion) {
    return {
      selected: {
        id: "inline-default",
        openAiVisionModel: backendEnv.openaiVisionModel,
        providers: ["plant_id", "openai_vision"],
      },
      bucket: 0,
      route: "inline-default",
      registry,
    };
  }

  const bucket = stableBucket(seed);
  const useCanary = Boolean(canaryVersion) && bucket < Math.max(0, Math.min(1, canaryPercent));
  const selected = useCanary ? canaryVersion : (stableVersion ?? canaryVersion);

  return {
    selected,
    bucket,
    route: useCanary ? "canary" : "stable",
    registry,
  };
}
