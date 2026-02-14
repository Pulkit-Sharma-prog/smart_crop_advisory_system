import crypto from "node:crypto";
import { getDatabase } from "./database.js";
import { detectDiseaseCandidates } from "./diseaseAi.js";

function ensureDistinctAlternatives(primaryName, candidates) {
  return candidates
    .filter((entry) => entry.name.toLowerCase() !== primaryName.toLowerCase())
    .slice(0, 3)
    .map((entry) => ({ name: entry.name, confidence: entry.confidence }));
}

function defaultGuidance(name) {
  return {
    preventiveMeasures: [
      "Avoid prolonged leaf wetness and improve airflow.",
      "Scout nearby plants for early spread signs.",
      "Clean tools after handling infected foliage.",
    ],
    curativeActions: [
      `Remove heavily affected leaves showing ${name} symptoms.`,
      "Apply crop-specific treatment approved by local agriculture authority.",
      "Reassess disease progression after 3 to 5 days.",
    ],
    organicOptions: [
      "Use suitable biofungicide or biocontrol formulation as preventive support.",
      "Maintain balanced nutrition to reduce plant stress.",
    ],
    escalationAdvice: "Escalate to local agronomist if spread increases after first treatment cycle.",
  };
}

export async function diagnosePlantDisease(file, context = {}) {
  const db = getDatabase();
  const modelOutput = await detectDiseaseCandidates(file);
  const [primaryCandidate, ...remaining] = modelOutput.candidates;

  const primary = primaryCandidate ?? {
    name: "Uncertain foliar disease",
    confidence: 51,
    visibleSymptoms: ["Visible stress pattern detected"],
  };

  const profile = db.getDiseaseProfileByName(primary.name);
  const guidance = profile
    ? {
        preventiveMeasures: profile.preventiveMeasures,
        curativeActions: profile.curativeActions,
        organicOptions: profile.organicOptions,
        escalationAdvice: profile.escalationAdvice,
      }
    : defaultGuidance(primary.name);

  const diagnosisId = crypto.randomUUID();
  const recordedAt = new Date().toISOString();

  const diagnosis = {
    diagnosisId,
    recordedAt,
    cropHint: context.cropHint ?? null,
    fileName: file.originalname,
    primary,
    alternatives: ensureDistinctAlternatives(primary.name, remaining),
    analysisSummary: modelOutput.analysisSummary,
    severity: modelOutput.severity,
    confidenceNote:
      modelOutput.providersUsed[0] === "fallback"
        ? "Confidence is lower because external AI providers were unavailable."
        : "Confidence is based on cross-provider visual symptom matching.",
    guidance,
    sources: modelOutput.providersUsed,
    symptoms: primary.visibleSymptoms?.length ? primary.visibleSymptoms : profile?.symptoms ?? [],
    providerErrors: modelOutput.providerErrors,
  };

  db.insertDiagnosis(diagnosis);

  return diagnosis;
}
