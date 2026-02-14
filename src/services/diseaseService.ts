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
  analysisSummary: string;
  severity: "Low" | "Medium" | "High";
  confidenceNote: string;
  guidance: DiseaseGuidance;
  symptoms: string[];
  sources: string[];
  providerErrors: string[];
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
  analysisSummary: z.string(),
  severity: z.enum(["Low", "Medium", "High"]),
  confidenceNote: z.string(),
  guidance: diseaseGuidanceSchema,
  symptoms: z.array(z.string()),
  sources: z.array(z.string()),
  providerErrors: z.array(z.string()).default([]),
});

export async function analyzeCropImage(file: File): Promise<DiseaseResult> {
  if (appEnv.useMockData) {
    return mockDiseaseResult;
  }

  try {
    const formData = new FormData();
    formData.append("file", file);

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
