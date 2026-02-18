import fs from "node:fs/promises";
import path from "node:path";
import { backendEnv } from "../env.js";

const DEFAULT_REGISTRY = {
  schemaVersion: "1.0",
  updatedAt: new Date(0).toISOString(),
  routing: {
    stableVersionId: "baseline-v1",
    canaryVersionId: "canary-v1",
    canaryPercent: 0.2,
  },
  versions: [
    {
      id: "baseline-v1",
      stage: "stable",
      enabled: true,
      openAiVisionModel: "gpt-4.1-mini",
      providers: ["plant_id", "openai_vision"],
      notes: "Default baseline ensemble.",
      metrics: { top1: 0.0, macroF1: 0.0 },
      createdAt: new Date(0).toISOString(),
    },
    {
      id: "canary-v1",
      stage: "canary",
      enabled: true,
      openAiVisionModel: "gpt-4.1-mini",
      providers: ["plant_id", "openai_vision"],
      notes: "Canary track for future model rollout.",
      metrics: { top1: 0.0, macroF1: 0.0 },
      createdAt: new Date(0).toISOString(),
    },
  ],
};

async function ensureRegistryFile() {
  const registryPath = backendEnv.checkpointRegistryPath;
  await fs.mkdir(path.dirname(registryPath), { recursive: true });
  try {
    await fs.access(registryPath);
  } catch {
    const next = { ...DEFAULT_REGISTRY, updatedAt: new Date().toISOString() };
    await fs.writeFile(registryPath, JSON.stringify(next, null, 2), "utf8");
  }
  return registryPath;
}

export async function readCheckpointRegistry() {
  const registryPath = await ensureRegistryFile();
  const raw = await fs.readFile(registryPath, "utf8");
  return JSON.parse(raw);
}

export async function writeCheckpointRegistry(registry) {
  const registryPath = await ensureRegistryFile();
  const payload = {
    ...registry,
    updatedAt: new Date().toISOString(),
  };
  await fs.writeFile(registryPath, JSON.stringify(payload, null, 2), "utf8");
  return payload;
}

export async function upsertCheckpointVersion(versionPayload) {
  const registry = await readCheckpointRegistry();
  const versions = Array.isArray(registry.versions) ? registry.versions : [];
  const index = versions.findIndex((item) => item.id === versionPayload.id);

  const version = {
    ...versionPayload,
    createdAt: index >= 0 ? versions[index].createdAt : new Date().toISOString(),
  };

  if (index >= 0) {
    versions[index] = { ...versions[index], ...version };
  } else {
    versions.push(version);
  }

  registry.versions = versions;
  return writeCheckpointRegistry(registry);
}

export async function updateRoutingConfig(routingPayload) {
  const registry = await readCheckpointRegistry();
  registry.routing = {
    ...(registry.routing ?? DEFAULT_REGISTRY.routing),
    ...routingPayload,
  };
  return writeCheckpointRegistry(registry);
}
