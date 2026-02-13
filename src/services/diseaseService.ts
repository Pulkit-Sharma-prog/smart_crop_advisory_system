import { z } from "zod";
import { appEnv } from "../config/env";
import { logger } from "../utils/logger";
import { apiRequest } from "./httpClient";
import { mockDiseaseResult } from "./mockData";

export interface DiseaseMatch {
  name: string;
  confidence: number;
}

export interface DiseaseResult {
  primary: DiseaseMatch;
  alternatives: DiseaseMatch[];
}

const diseaseMatchSchema = z.object({
  name: z.string(),
  confidence: z.number(),
});

const diseaseResultSchema = z.object({
  primary: diseaseMatchSchema,
  alternatives: z.array(diseaseMatchSchema),
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
