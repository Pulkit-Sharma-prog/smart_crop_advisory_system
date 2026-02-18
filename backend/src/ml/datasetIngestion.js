import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { backendEnv } from "../env.js";

const splitSchema = z.enum(["train", "val", "test"]);

const datasetEntrySchema = z.object({
  id: z.string().min(2),
  source: z.string().min(2),
  split: splitSchema,
  imagesPath: z.string().min(1),
  labelsPath: z.string().min(1),
  sampleCount: z.number().int().nonnegative(),
  labelSpaceVersion: z.string().min(1).default("v1"),
});

const manifestSchema = z.object({
  schemaVersion: z.string().default("1.0"),
  generatedAt: z.string().optional(),
  datasets: z.array(datasetEntrySchema).min(1),
});

async function exists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function readManifest(manifestPath = backendEnv.datasetManifestPath) {
  const resolved = path.resolve(manifestPath);
  const raw = await fs.readFile(resolved, "utf8");
  const parsed = manifestSchema.parse(JSON.parse(raw));
  return { resolved, manifest: parsed };
}

export async function ingestDatasetManifest(options = {}) {
  const dryRun = Boolean(options.dryRun);
  const { resolved, manifest } = await readManifest(options.manifestPath);

  const warnings = [];
  let totalSamples = 0;
  const splitCounts = { train: 0, val: 0, test: 0 };

  for (const entry of manifest.datasets) {
    totalSamples += entry.sampleCount;
    splitCounts[entry.split] += entry.sampleCount;

    const imagesExists = await exists(path.resolve(path.dirname(resolved), entry.imagesPath));
    const labelsExists = await exists(path.resolve(path.dirname(resolved), entry.labelsPath));

    if (!imagesExists) warnings.push(`Dataset ${entry.id}: imagesPath not found (${entry.imagesPath})`);
    if (!labelsExists) warnings.push(`Dataset ${entry.id}: labelsPath not found (${entry.labelsPath})`);
  }

  const ingestionReport = {
    manifestPath: resolved,
    schemaVersion: manifest.schemaVersion,
    dryRun,
    datasetCount: manifest.datasets.length,
    totalSamples,
    splitCounts,
    warnings,
    status: warnings.length > 0 ? "warning" : "ok",
    ingestedAt: new Date().toISOString(),
  };

  if (!dryRun) {
    const reportDir = path.join(backendEnv.backendRoot, "ml", "datasets", "reports");
    await fs.mkdir(reportDir, { recursive: true });
    const reportPath = path.join(reportDir, `ingestion-${Date.now()}.json`);
    await fs.writeFile(reportPath, JSON.stringify(ingestionReport, null, 2), "utf8");
    return { ...ingestionReport, reportPath };
  }

  return ingestionReport;
}

export async function getDatasetManifestInfo(manifestPath = backendEnv.datasetManifestPath) {
  const { resolved, manifest } = await readManifest(manifestPath);
  return {
    manifestPath: resolved,
    schemaVersion: manifest.schemaVersion,
    generatedAt: manifest.generatedAt ?? null,
    datasets: manifest.datasets,
  };
}
