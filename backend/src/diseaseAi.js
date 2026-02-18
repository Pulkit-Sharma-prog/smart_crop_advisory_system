import crypto from "node:crypto";
import { backendEnv } from "./env.js";
import { selectDiseaseModelVersion } from "./ml/modelRouter.js";

const PIPELINE_VERSION = "disease-pipeline-v1";

function sanitizeConfidence(value, fallback = 50) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(1, Math.min(99, Math.round(numeric)));
}

function parseJsonObjectFromText(text) {
  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(text.slice(start, end + 1));
    }
    throw new Error("Could not parse JSON payload from model output");
  }
}

function normalizeCandidates(items, provider) {
  return (items ?? [])
    .map((entry) => ({
      name: String(entry.name ?? entry.disease ?? "").trim(),
      confidence: sanitizeConfidence(entry.confidence ?? entry.probability ?? entry.score * 100),
      visibleSymptoms: Array.isArray(entry.visibleSymptoms) ? entry.visibleSymptoms.map(String).slice(0, 6) : [],
      provider,
    }))
    .filter((entry) => entry.name.length > 1);
}

async function runPlantId(buffer, mimeType) {
  if (!backendEnv.plantIdApiKey) return null;

  const base64 = buffer.toString("base64");
  const response = await fetch(backendEnv.plantIdEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Api-Key": backendEnv.plantIdApiKey,
    },
    body: JSON.stringify({
      images: [base64],
      latitude: null,
      longitude: null,
      similar_images: false,
      modifiers: ["health_all", "disease_details"],
      language: "en",
      image_type: mimeType,
    }),
  });

  if (!response.ok) {
    throw new Error(`Plant.id API error: ${response.status}`);
  }

  const payload = await response.json();
  const diseaseCandidates =
    payload?.result?.disease?.suggestions
    ?? payload?.health_assessment?.diseases
    ?? payload?.diseases
    ?? [];

  return {
    provider: "plant_id",
    candidates: normalizeCandidates(
      diseaseCandidates.map((entry) => ({
        name: entry?.name ?? entry?.disease_name,
        probability: entry?.probability ?? entry?.confidence,
        visibleSymptoms: entry?.disease_details?.symptoms ?? entry?.symptoms ?? [],
      })),
      "plant_id",
    ),
  };
}

async function runOpenAiVision(buffer, mimeType, modelName) {
  if (!backendEnv.openaiApiKey) return null;

  const base64 = buffer.toString("base64");
  const prompt =
    "You are a plant pathologist. Return ONLY valid JSON with shape: "
    + '{"candidates":[{"name":"disease name","confidence":0-100,"visibleSymptoms":["symptom"]}],"analysisSummary":"short summary","severity":"Low|Medium|High"}. '
    + "Focus only on visible disease evidence, avoid overclaiming when image is unclear.";

  const response = await fetch(backendEnv.openAiVisionEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${backendEnv.openaiApiKey}`,
    },
    body: JSON.stringify({
      model: modelName || backendEnv.openaiVisionModel,
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: prompt },
            { type: "input_image", image_url: `data:${mimeType};base64,${base64}` },
          ],
        },
      ],
      max_output_tokens: 500,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI vision API error: ${response.status}`);
  }

  const payload = await response.json();
  const outputText = payload?.output_text ?? payload?.output?.[0]?.content?.[0]?.text ?? "";
  const parsed = parseJsonObjectFromText(outputText);

  return {
    provider: "openai_vision",
    candidates: normalizeCandidates(parsed?.candidates, "openai_vision"),
    analysisSummary: typeof parsed?.analysisSummary === "string" ? parsed.analysisSummary : "",
    severity: parsed?.severity,
  };
}

function mergeProviderCandidates(providerResults) {
  const weightedByProvider = {
    plant_id: 0.65,
    openai_vision: 0.35,
  };

  const aggregate = new Map();
  providerResults.forEach((result) => {
    const weight = weightedByProvider[result.provider] ?? 0.5;
    result.candidates.forEach((candidate) => {
      const key = candidate.name.toLowerCase();
      const existing = aggregate.get(key) ?? {
        name: candidate.name,
        weightedScore: 0,
        weightSum: 0,
        visibleSymptoms: new Set(),
      };
      existing.weightedScore += candidate.confidence * weight;
      existing.weightSum += weight;
      candidate.visibleSymptoms.forEach((symptom) => existing.visibleSymptoms.add(symptom));
      aggregate.set(key, existing);
    });
  });

  return Array.from(aggregate.values())
    .map((entry) => ({
      name: entry.name,
      confidence: sanitizeConfidence(entry.weightedScore / Math.max(0.01, entry.weightSum)),
      visibleSymptoms: Array.from(entry.visibleSymptoms).slice(0, 6),
    }))
    .sort((a, b) => b.confidence - a.confidence);
}

function fallbackFromFilename(filename) {
  const hash = crypto.createHash("sha1").update(filename.toLowerCase()).digest("hex");
  const bucket = parseInt(hash.slice(0, 2), 16) % 4;
  if (bucket === 0) return [{ name: "Leaf Spot", confidence: 62, visibleSymptoms: ["Spotted lesions on leaf surface"] }];
  if (bucket === 1) return [{ name: "Early Blight", confidence: 60, visibleSymptoms: ["Dark concentric lesions on older leaves"] }];
  if (bucket === 2) return [{ name: "Powdery Mildew", confidence: 58, visibleSymptoms: ["White powdery film on foliage"] }];
  return [{ name: "Uncertain foliar disease", confidence: 52, visibleSymptoms: ["General stress pattern"] }];
}

function estimateImageQuality(file) {
  const issues = [];
  let score = 100;

  if (file.size < 45_000) {
    issues.push("small_file");
    score -= 26;
  }
  if (file.size > 6_500_000) {
    issues.push("very_large_file");
    score -= 10;
  }
  if (!file.mimetype.startsWith("image/")) {
    issues.push("invalid_mime");
    score = 20;
  }
  if (!["image/jpeg", "image/png", "image/webp", "image/jpg"].includes(file.mimetype.toLowerCase())) {
    issues.push("uncommon_format");
    score -= 8;
  }

  return {
    score: Math.max(5, Math.min(100, Math.round(score))),
    issues,
  };
}

function estimateUncertainty(candidates, quality) {
  const top = candidates[0];
  if (!top) {
    return {
      isUnknown: true,
      score: 0.92,
      reason: "no_candidates",
    };
  }

  const second = candidates[1];
  const topConfidence = top.confidence / 100;
  const margin = second ? (top.confidence - second.confidence) / 100 : topConfidence;
  const qualityPenalty = Math.max(0, (70 - quality.score) / 100);
  const raw = 1 - (topConfidence * 0.7 + Math.max(0, margin) * 0.3) + qualityPenalty;
  const score = Math.max(0.01, Math.min(0.99, Number(raw.toFixed(2))));

  const isUnknown = score >= backendEnv.diseaseUnknownThreshold;
  let reason = "low_margin";
  if (quality.score < backendEnv.diseaseLowQualityThreshold) reason = "low_image_quality";
  if (top.confidence < 55) reason = "weak_signal";

  return { isUnknown, score, reason };
}

function buildModelMeta(providersUsed, providersTried, routingSelection) {
  const mode = providersUsed.includes("fallback")
    ? "fallback"
    : providersUsed.length > 1
      ? "ensemble"
      : "single";

  return {
    pipelineVersion: PIPELINE_VERSION,
    modelVersionId: routingSelection?.selected?.id ?? "inline-default",
    route: routingSelection?.route ?? "stable",
    bucket: routingSelection?.bucket ?? 0,
    mode,
    providersTried,
    providersUsed,
    supportsOpenSet: true,
  };
}

export async function detectDiseaseCandidates(file) {
  const quality = estimateImageQuality(file);
  const routingSelection = await selectDiseaseModelVersion(`${file.originalname}:${file.size}:${file.mimetype}`);
  const configuredProviders = Array.isArray(routingSelection.selected?.providers)
    ? routingSelection.selected.providers
    : ["plant_id", "openai_vision"];
  const providersTried = configuredProviders;
  const providerCalls = [];
  if (configuredProviders.includes("plant_id")) {
    providerCalls.push(runPlantId(file.buffer, file.mimetype));
  }
  if (configuredProviders.includes("openai_vision")) {
    providerCalls.push(runOpenAiVision(file.buffer, file.mimetype, routingSelection.selected?.openAiVisionModel));
  }
  const providers = providerCalls.length > 0
    ? providerCalls
    : [runPlantId(file.buffer, file.mimetype), runOpenAiVision(file.buffer, file.mimetype, routingSelection.selected?.openAiVisionModel)];
  const settled = await Promise.allSettled(providers);

  const fulfilled = settled
    .filter((entry) => entry.status === "fulfilled" && entry.value)
    .map((entry) => entry.value);

  const providerErrors = settled
    .filter((entry) => entry.status === "rejected")
    .map((entry) => String(entry.reason?.message ?? entry.reason));

  if (fulfilled.length === 0) {
    const candidates = fallbackFromFilename(file.originalname);
    const uncertainty = estimateUncertainty(candidates, quality);
    return {
      candidates,
      providersUsed: ["fallback"],
      providerErrors,
      analysisSummary: "Fallback diagnosis used because no external AI provider was configured or reachable.",
      severity: "Medium",
      quality,
      uncertainty,
      model: buildModelMeta(["fallback"], providersTried, routingSelection),
    };
  }

  const merged = mergeProviderCandidates(fulfilled);
  const top = merged[0];
  const severity = top.confidence >= 85 ? "High" : top.confidence >= 65 ? "Medium" : "Low";
  const uncertainty = estimateUncertainty(merged, quality);

  return {
    candidates: merged.length > 0 ? merged : fallbackFromFilename(file.originalname),
    providersUsed: fulfilled.map((entry) => entry.provider),
    providerErrors,
    analysisSummary:
      fulfilled.find((entry) => typeof entry.analysisSummary === "string" && entry.analysisSummary.trim())?.analysisSummary
      ?? "The image was evaluated for visible foliar symptoms and matched to likely diseases.",
    severity:
      typeof fulfilled.find((entry) => entry.severity)?.severity === "string"
        ? fulfilled.find((entry) => entry.severity).severity
        : severity,
    quality,
    uncertainty,
    model: buildModelMeta(fulfilled.map((entry) => entry.provider), providersTried, routingSelection),
  };
}
