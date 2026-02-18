import { z } from "zod";
import { appEnv } from "../config/env";
import { logger } from "../utils/logger";
import { apiRequest } from "./httpClient";
import { mockDiseaseResult } from "./mockData";

export interface DiseaseMatch {
  name: string;
  confidence: number;
  visibleSymptoms?: string[];
}

export interface DiseaseGuidance {
  preventiveMeasures: string[];
  curativeActions: string[];
  organicOptions: string[];
  escalationAdvice: string;
}

export interface DiseaseResult {
  diagnosisId: string;
  recordedAt: string;
  primary: DiseaseMatch;
  alternatives: DiseaseMatch[];
  topCandidates?: DiseaseMatch[];
  analysisSummary: string;
  severity: "Low" | "Medium" | "High";
  severityLabel?: string;
  confidenceNote: string;
  guidance: DiseaseGuidance;
  symptoms: string[];
  sources: string[];
  providerErrors: string[];
  quality?: {
    score: number;
    issues: string[];
  };
  uncertainty?: {
    isUnknown: boolean;
    score: number;
    reason: string;
    reasonLabel?: string;
  };
  model?: {
    pipelineVersion: string;
    mode: string;
    providersTried: string[];
    providersUsed: string[];
    supportsOpenSet: boolean;
  };
}

const diseaseMatchSchema = z.object({
  name: z.string(),
  confidence: z.number(),
  visibleSymptoms: z.array(z.string()).optional(),
});

const diseaseGuidanceSchema = z.object({
  preventiveMeasures: z.array(z.string()),
  curativeActions: z.array(z.string()),
  organicOptions: z.array(z.string()),
  escalationAdvice: z.string(),
});

const diseaseResultSchema = z.object({
  diagnosisId: z.string(),
  recordedAt: z.string(),
  primary: diseaseMatchSchema,
  alternatives: z.array(diseaseMatchSchema),
  topCandidates: z.array(diseaseMatchSchema).optional(),
  analysisSummary: z.string(),
  severity: z.enum(["Low", "Medium", "High"]),
  severityLabel: z.string().optional(),
  confidenceNote: z.string(),
  guidance: diseaseGuidanceSchema,
  symptoms: z.array(z.string()),
  sources: z.array(z.string()),
  providerErrors: z.array(z.string()).default([]),
  quality: z.object({
    score: z.number(),
    issues: z.array(z.string()),
  }).optional(),
  uncertainty: z.object({
    isUnknown: z.boolean(),
    score: z.number(),
    reason: z.string(),
    reasonLabel: z.string().optional(),
  }).optional(),
  model: z.object({
    pipelineVersion: z.string(),
    mode: z.string(),
    providersTried: z.array(z.string()),
    providersUsed: z.array(z.string()),
    supportsOpenSet: z.boolean(),
  }).optional(),
});

export async function analyzeCropImage(file: File, language = "en"): Promise<DiseaseResult> {
  if (appEnv.useMockData) {
    return mockDiseaseResult;
  }

  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("language", language.toLowerCase().startsWith("hi") ? "hi" : "en");

    const response = await apiRequest<unknown>("/api/disease/analyze", {
      method: "POST",
      body: formData,
    });

    return diseaseResultSchema.parse(response);
  } catch (error) {
    if (appEnv.allowApiFallback) {
      logger.warn("Disease detection API failed. Falling back to mock output.", error);
      return mockDiseaseResult;
    }

    throw error;
  }
}
